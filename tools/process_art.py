"""
把 img/ 裡的角色表情圖切成單張、去掉背景，輸出到 game/assets/。

需求：pip install "rembg[cpu]" pillow
用法：python tools/process_art.py
第一次執行會自動下載去背模型（isnet-anime、isnet-general-use，各約 170MB）。
"""
from pathlib import Path

from PIL import Image, ImageChops, ImageDraw, ImageFilter, ImageOps
from rembg import new_session, remove

ROOT = Path(__file__).resolve().parent.parent
IMG = ROOT / "img"
SPRITES = ROOT / "game" / "assets" / "sprites"
FACES = ROOT / "game" / "assets" / "face"

# 全身表情表：2 欄 × 3 列，格子 1～6 由左上到右下。
# 每一格對應到劇本裡的一個或多個表情名稱。
BODY_SHEETS = [
    {
        "src": "i_wholebody_human.png",
        "name": "裴柱現_{}",
        "cells": {
            1: ["普通"],
            2: ["得意", "魅惑"],
            3: ["生氣"],
            4: ["難過", "驚慌", "哭"],
            5: ["笑"],
            6: ["害羞", "恍惚"],
        },
    },
    {
        "src": "i_wholebody_mermaid.png",
        "name": "裴柱現_人魚_{}",
        "cells": {
            1: ["普通"],
            2: ["得意", "魅惑", "恍惚"],
            3: ["生氣"],
            4: ["難過", "驚慌", "哭"],
            5: ["笑"],
            6: ["害羞"],
        },
        # 第 5 格尾巴和尾鰭之間的空隙被誤判成人物、填了一塊光暈。
        # 六格的尾巴姿勢相同，下半身改用第 1 格的去背範圍。
        "fix": {"cells": [5], "from": 1, "below": 0.5},
    },
]

# 通用配角剪影：一張圖左女右男，沒有表情差別。
# 給沒有專屬立繪的配角用，兩人放在同一張畫布高度上，保留身高差。
SILHOUETTE_SHEETS = [
    {
        "src": "bef2e81f-3f57-42d4-81be-73fe4ca33081.png",
        "figures": [
            ["女性剪影_普通", "潮后_普通"],                 # 左：女
            ["男性剪影_普通", "陳伯_普通", "老闆_普通"],     # 右：男
        ],
    },
]

# 頭像表情表：2 × 2，喜、怒、哀、樂。每格左上角有標籤字、最上方有標題，
# 所以直接用原圖座標指定裁切框（左, 上, 右, 下），只留頭和肩膀。
FACE_SHEETS = [
    {
        "src": "w_face.png",
        "name": "孫承完_{}",
        "boxes": [
            ((160, 85, 560, 485), ["普通", "害羞", "驚訝"]),   # 喜
            ((790, 85, 1190, 485), ["認真"]),                  # 怒
            ((160, 630, 560, 1030), ["難過"]),                 # 哀
            ((790, 630, 1190, 1030), ["笑"]),                  # 樂
        ],
    },
]

ALPHA_FLOOR = 60  # 低於這個透明度的光暈殘影直接清掉
PAD = 8


def cut_out(img, session):
    out = remove(img, session=session, post_process_mask=True)
    alpha = out.getchannel("A").point(lambda a: 0 if a < ALPHA_FLOOR else a)
    out.putalpha(alpha)
    return out


def silhouette_cut(cell, session):
    # 剪影圖是深藍底上的微光人影，跟周圍光暈的亮度只差一點點，直接去背抓不到。
    # 先把對比拉滿讓輪廓浮出來，用通用去背模型抓遮罩，顏色仍用原圖的深藍。
    mask = remove(ImageOps.equalize(cell), session=session, only_mask=True)
    # 人影本體要實心：二值化後從四個角落往內填色，
    # 填不到的地方（被人影包住的破洞）一律補滿，保留髮絲輪廓
    solid = mask.point(lambda a: 255 if a >= 80 else 0)
    w, h = solid.size
    for corner in ((0, 0), (w - 1, 0), (0, h - 1), (w - 1, h - 1)):
        if solid.getpixel(corner) == 0:
            ImageDraw.floodfill(solid, corner, 128)
    figure = solid.point(lambda v: 0 if v == 128 else 255).filter(ImageFilter.GaussianBlur(1.2))
    # 保留原圖的深藍光暈：依亮度做成半透明，最暗的底色直接透明；
    # 只留人影附近一圈，並在碰到圖片邊緣前淡掉，才不會被切出直線
    glow_alpha = cell.getchannel("B").point(
        lambda v: 0 if v <= 20 else int(min((v - 20) / 42, 1) ** 1.5 * 255 * 0.55))
    near = figure.filter(ImageFilter.MaxFilter(31)).filter(ImageFilter.GaussianBlur(30))
    inset = Image.new("L", cell.size, 0)
    ImageDraw.Draw(inset).rectangle((40, 40, w - 41, h - 41), fill=255)
    inset = inset.filter(ImageFilter.GaussianBlur(20))
    halo = cell.convert("RGBA")
    halo.putalpha(ImageChops.multiply(ImageChops.multiply(glow_alpha, near), inset))
    # 人影邊緣一道淡藍色邊光，放在夜晚背景上才看得見
    rim = Image.new("RGBA", cell.size, (150, 180, 235, 0))
    rim.putalpha(figure.filter(ImageFilter.MaxFilter(7))
                 .filter(ImageFilter.GaussianBlur(4))
                 .point(lambda v: int(v * 0.35)))
    body = cell.convert("RGBA")
    body.putalpha(figure)
    # 由下往上：光暈 → 邊光 → 人影
    return Image.alpha_composite(Image.alpha_composite(halo, rim), body)


def align(images):
    # 原圖每格人物的位置不一樣：各自裁到人物範圍，再放到同一張畫布上，
    # 底部對齊、水平置中，換表情時角色才不會跳動
    crops = [im.crop(im.getchannel("A").getbbox()) for im in images]
    w = max(c.width for c in crops) + PAD * 2
    h = max(c.height for c in crops) + PAD * 2
    out = []
    for c in crops:
        canvas = Image.new("RGBA", (w, h), (0, 0, 0, 0))
        canvas.paste(c, ((w - c.width) // 2, h - PAD - c.height))
        out.append(canvas)
    return out


def grid_cells(sheet, cols, rows):
    w, h = sheet.size
    cw, ch = w // cols, h // rows
    for i in range(cols * rows):
        c, r = i % cols, i // cols
        yield i + 1, sheet.crop((c * cw, r * ch, (c + 1) * cw, (r + 1) * ch))


def borrow_mask(aligned, fix):
    # 把 fix["from"] 那格透明的地方，在指定格子的下半部也設成透明
    src = aligned[fix["from"] - 1].getchannel("A")
    w, h = src.size
    top = int(h * fix["below"])
    for i in fix["cells"]:
        im = aligned[i - 1]
        alpha = im.getchannel("A")
        lower = Image.composite(alpha.crop((0, top, w, h)),
                                Image.new("L", (w, h - top), 0),
                                src.crop((0, top, w, h)).point(lambda a: 255 if a else 0))
        alpha.paste(lower, (0, top))
        im.putalpha(alpha)


def save_all(results, name, outdir, fix=None):
    aligned = align([im for im, _ in results])
    if fix:
        borrow_mask(aligned, fix)
    for cropped, (_, names) in zip(aligned, results):
        for n in names:
            path = outdir / (name.format(n) + ".png")
            cropped.save(path, optimize=True)
            print("  ->", path.relative_to(ROOT))


def main():
    SPRITES.mkdir(parents=True, exist_ok=True)
    FACES.mkdir(parents=True, exist_ok=True)
    session = new_session("isnet-anime")

    for spec in BODY_SHEETS:
        print(spec["src"])
        sheet = Image.open(IMG / spec["src"]).convert("RGB")
        results = [(cut_out(cell, session), spec["cells"][i])
                   for i, cell in grid_cells(sheet, 2, 3)]
        save_all(results, spec["name"], SPRITES, spec.get("fix"))

    for spec in SILHOUETTE_SHEETS:
        print(spec["src"])
        sheet = Image.open(IMG / spec["src"]).convert("RGB")
        n = len(spec["figures"])
        general = new_session("isnet-general-use")
        cells = [silhouette_cut(cell, general) for _, cell in grid_cells(sheet, n, 1)]
        for im, names in zip(align(cells), spec["figures"]):
            for name in names:
                path = SPRITES / (name + ".png")
                im.save(path, optimize=True)
                print("  ->", path.relative_to(ROOT))

    for spec in FACE_SHEETS:
        print(spec["src"])
        sheet = Image.open(IMG / spec["src"]).convert("RGB")
        results = [(cut_out(sheet.crop(box), session), names)
                   for box, names in spec["boxes"]]
        save_all(results, spec["name"], FACES)


if __name__ == "__main__":
    main()
