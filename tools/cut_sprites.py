#!/usr/bin/env python
"""
立繪去背工具：把 img/立繪/ 裡的 AI 原圖（純色灰底）去背、裁切，輸出到 game/assets/sprites/。

- 檔名照原樣：img/立繪/阿英_笑.png → game/assets/sprites/阿英_笑.png
- 同一個角色的所有表情（檔名最後一個「_」之前相同，例如 阿英_、裴柱現_人魚_）
  用同一個裁切框，遊戲裡換表情時人物才不會跳動。
- 陳伯、老闆是剪影，會加上和引擎佔位剪影一樣的淡藍色光暈和邊光。
- 不需要 AI 去背模型：從圖片邊緣辨識背景，另外清理輪廓附近、髮絲包住的小灰底。

需求：pip install pillow numpy scipy（雙擊 cut_sprites.bat 會自動安裝）
用法：python tools/cut_sprites.py              處理全部
      python tools/cut_sprites.py 阿英 珊婆    只處理這幾個角色
      python tools/cut_sprites.py --hair-gap-distance 0  停用小縫隙清理
"""
import argparse
import sys
from pathlib import Path

import numpy as np
from PIL import Image
from scipy import ndimage as ndi

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "img" / "立繪"
OUT = ROOT / "game" / "assets" / "sprites"
EXTS = {".png", ".jpg", ".jpeg", ".webp"}
SILHOUETTES = {"陳伯", "老闆", "男性剪影", "女性剪影"}

BG_TOL = 14      # 每個色版和背景色的差距都在這以內 → 當成背景
HOLE_MIN = 400   # 被人物包住、顏色等於背景的區塊（手臂和身體之間的縫），面積超過這個就挖空
HAIR_GAP_MIN = 6         # 小於這個面積的封閉色點不動，避免把細節當背景
HAIR_GAP_DISTANCE = 32   # 小縫隙必須靠近外部背景，避免挖掉衣服內部的灰色
HAIR_GAP_TOL = 8         # 小縫隙採更嚴格的背景色差；不是直接放寬整張圖的去背容差
HAIR_GAP_RADIUS = 8      # 只接受狹窄縫隙，不處理寬大的灰色內部色塊
SPECK_MAX = 64   # 比這小的孤立碎片當雜訊清掉
EDGE_W = 2       # 邊緣羽化寬度（像素）
PAD = 12         # 裁切框外多留的邊

# 已核對原圖的局部背景縫隙，座標以 1024×1536 為基準。
# 只在這些區域容許較暗的灰底，避免全圖放寬後傷到牛仔褲、髮色或衣服陰影。
CLEANUP_REGIONS = {
    "康": [(415, 0, 645, 290), (310, 165, 410, 310)],  # 髮絲、魷魚觸鬚
    "阿英": [(385, 0, 645, 245), (650, 680, 700, 810)],  # 髮絲、手與大腿間
}


def local_background(a, bg, regions):
    """在已指定的縫隙範圍內辨識偏暗灰底；不作形態膨脹，以免吃掉細線。"""
    mask = np.zeros(a.shape[:2], bool)
    for x0, y0, x1, y1 in regions:
        pixels = a[y0:y1, x0:x1]
        delta = pixels - bg
        # 灰底可有亮度變化，仍須接近背景色，不能延伸到膚色、棕色魷魚或深色外框。
        candidate = (np.abs(delta).max(axis=2) <= 28) & (np.ptp(delta, axis=2) <= 12)
        labels, count = ndi.label(candidate)
        sizes = np.bincount(labels.ravel(), minlength=count + 1)
        keep = sizes >= 3
        keep[0] = False
        mask[y0:y1, x0:x1] |= keep[labels]
    return mask


def log(*a):
    print(*a, flush=True)


def cut(rgb, hair_gap_distance=HAIR_GAP_DISTANCE, hair_gap_tol=HAIR_GAP_TOL,
        cleanup_regions=()):
    """純色背景去背。回傳 (RGBA uint8, 說明文字)。"""
    a = rgb.astype(np.int16)
    ring = np.concatenate([a[0], a[-1], a[:, 0], a[:, -1]])
    bg = np.median(ring, axis=0).astype(np.int16)
    dist = np.abs(a - bg).max(axis=2)

    # 先辨識外部背景，再獨立判斷封閉區域。
    sure = dist <= BG_TOL
    lab, n = ndi.label(sure)
    touching = np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))
    sizes = np.bincount(lab.ravel(), minlength=n + 1)
    is_bg = np.zeros(n + 1, bool)
    is_bg[touching] = True
    is_bg[0] = False
    outside = is_bg[lab]
    holes = [i for i in range(1, n + 1) if not is_bg[i] and sizes[i] >= HOLE_MIN]
    hair_holes = []
    if hair_gap_distance > 0 and outside.any():
        # 只有靠近「原本外部背景」的小縫隙才納入；不以新挖的洞接力向人物內部擴散。
        distance = ndi.distance_transform_edt(~outside)
        candidates = np.flatnonzero((sizes >= HAIR_GAP_MIN) & (sizes < HOLE_MIN) & ~is_bg)
        candidates = candidates[candidates != 0]
        regions = ndi.find_objects(lab)
        for i in candidates:
            box = regions[i - 1]
            region = lab[box] == i
            if distance[box][region].min() > hair_gap_distance:
                continue
            # 至少六成像素要非常接近背景，且色偏也必須一致，保護帶色的髮色與衣料陰影。
            pixels = a[box][region]
            delta = pixels - bg
            close = (dist[box][region] <= hair_gap_tol) & (np.ptp(delta, axis=1) <= 4)
            if close.mean() < 0.6:
                continue
            padded = np.pad(region, 1)
            if ndi.distance_transform_edt(padded).max() > HAIR_GAP_RADIUS:
                continue
            hair_holes.append(int(i))
    is_bg[holes] = True
    is_bg[hair_holes] = True
    is_bg[0] = False
    fg = ~is_bg[lab]
    local = local_background(a, bg, cleanup_regions)
    local_pixels = int((local & fg).sum())
    fg &= ~local

    # 清掉孤立碎片
    flab, fn = ndi.label(fg)
    fsizes = np.bincount(flab.ravel(), minlength=fn + 1)
    small = fsizes < SPECK_MAX
    small[0] = False
    fg &= ~small[flab]
    bgmask = ~fg

    # 邊緣帶：前景裡貼著背景的 EDGE_W 像素。內部：再往內一圈，當作邊緣「真正的顏色」參考。
    edge = fg & ndi.binary_dilation(bgmask, iterations=EDGE_W)
    core = fg & ~ndi.binary_dilation(bgmask, iterations=EDGE_W + 1)
    if not core.any():
        core = fg
    _, (iy, ix) = ndi.distance_transform_edt(~core, return_indices=True)
    F = a[iy, ix]                                   # 每個像素最近的內部顏色
    d = (F - bg).astype(np.float32)                 # 內部顏色 − 背景
    p = (a - bg).astype(np.float32)                 # 這個像素 − 背景
    den = (d * d).sum(axis=2)
    alpha_p = np.clip(np.where(den > 0, (p * d).sum(axis=2) / np.maximum(den, 1e-6), 0), 0, 1)
    resid = np.abs(p - alpha_p[..., None] * d).max(axis=2)
    # 像素落在「背景 → 內部顏色」的連線上 → 用投影算透明度、顏色換成內部顏色（去掉灰邊）
    # 否則（例如很細的深色外框，內部參考色是膚色）→ 用和背景的距離估透明度
    alpha_d = np.clip((dist - BG_TOL) / 50.0, 0, 1)
    trust = (resid <= 20) & (den > 0)
    alpha_e = np.where(trust, alpha_p, alpha_d)
    col_e = np.where(trust[..., None], F, bg + p / np.maximum(alpha_d, 0.05)[..., None])

    alpha = fg.astype(np.float32)
    alpha[edge] = alpha_e[edge]
    rgb_out = a.astype(np.float32)
    rgb_out[edge] = col_e[edge]
    rgb_out[bgmask] = F[bgmask]                     # 透明像素也填鄰近顏色，縮放時才不會滲出灰邊
    rgba = np.dstack([np.clip(rgb_out, 0, 255), alpha * 255]).round().astype(np.uint8)

    info = f"背景 {tuple(int(v) for v in bg)}，挖空 {len(holes)} 處"
    if holes:
        info += "（" + "、".join(f"{sizes[i]} px" for i in holes) + "）"
    info += f"，髮絲小縫隙 {len(hair_holes)} 處"
    if cleanup_regions:
        info += f"，局部殘灰清理 {local_pixels} px"
    return rgba, info


def over(src_c, src_a, dst_c, dst_a):
    """一般 alpha 合成（顏色不預乘）。"""
    out_a = src_a + dst_a * (1 - src_a)
    out_c = (src_c * src_a[..., None] + dst_c * (dst_a * (1 - src_a))[..., None]) / np.maximum(out_a, 1e-6)[..., None]
    return out_c, out_a


def add_glow(rgba):
    """剪影：加上淡藍色光暈與邊光（和引擎的佔位剪影一致）。"""
    shape = rgba.shape[:2] + (3,)
    body_a = rgba[..., 3].astype(np.float32) / 255
    fgm = body_a > 0.5
    halo_a = ndi.gaussian_filter(ndi.binary_dilation(fgm, iterations=14).astype(np.float32), 26) * 0.55
    rim_a = ndi.gaussian_filter(ndi.binary_dilation(fgm, iterations=3).astype(np.float32), 4) * 0.35
    halo_c = np.broadcast_to(np.array([40, 72, 150], np.float32), shape)
    rim_c = np.broadcast_to(np.array([150, 180, 235], np.float32), shape)
    c, al = over(rim_c, rim_a, halo_c, halo_a)
    c, al = over(rgba[..., :3].astype(np.float32), body_a, c, al)
    return np.dstack([np.clip(c, 0, 255), al * 255]).round().astype(np.uint8)


def bbox(rgba):
    ys, xs = np.nonzero(rgba[..., 3] > 2)
    if len(ys) == 0:
        return None
    return xs.min(), ys.min(), xs.max() + 1, ys.max() + 1


def group_key(stem):
    return stem.rsplit("_", 1)[0] if "_" in stem else stem


def char_name(stem):
    return stem.split("_", 1)[0]


def crop_group(results):
    """同一個角色用同一個裁切框；尺寸不一致時退回各自裁切、底部對齊。"""
    if len({r.shape[:2] for _, r in results}) == 1:
        boxes = [b for b in (bbox(r) for _, r in results) if b]
        h, w = results[0][1].shape[:2]
        x0 = max(0, min(b[0] for b in boxes) - PAD)
        y0 = max(0, min(b[1] for b in boxes) - PAD)
        x1 = min(w, max(b[2] for b in boxes) + PAD)
        y1 = min(h, max(b[3] for b in boxes) + PAD)
        return [r[y0:y1, x0:x1] for _, r in results]
    log("  （圖片尺寸不一致，改成各自裁切後底部對齊）")
    crops = []
    for _, r in results:
        b = bbox(r)
        crops.append(r[b[1]:b[3], b[0]:b[2]])
    W = max(c.shape[1] for c in crops) + PAD * 2
    H = max(c.shape[0] for c in crops) + PAD * 2
    out = []
    for c in crops:
        canvas = np.zeros((H, W, 4), np.uint8)
        ch, cw = c.shape[:2]
        x, y = (W - cw) // 2, H - PAD - ch
        canvas[y:y + ch, x:x + cw] = c
        out.append(canvas)
    return out


def main(argv):
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("characters", nargs="*", help="只處理指定角色（可多個）")
    parser.add_argument("--hair-gap-distance", type=int, default=HAIR_GAP_DISTANCE,
                        help="清理距離外部背景多少像素內的封閉小縫隙，預設 32；0 為停用")
    parser.add_argument("--hair-gap-tol", type=int, default=HAIR_GAP_TOL,
                        help="封閉小縫隙的背景色差容許值，預設 8，上限 14")
    args = parser.parse_args(argv)
    if args.hair_gap_distance < 0 or not 0 <= args.hair_gap_tol <= BG_TOL:
        parser.error("距離不得小於 0；小縫隙色差必須介於 0 與 14")
    only = args.characters
    files = sorted(p for p in SRC.iterdir() if p.suffix.lower() in EXTS) if SRC.exists() else []
    if not files:
        log(f"{SRC} 裡沒有圖片。請把畫好的立繪（檔名像 阿英_笑.png）放進去。")
        return 1
    groups = {}
    for p in files:
        if only and not any(p.stem.startswith(o) for o in only):
            continue
        groups.setdefault(group_key(p.stem), []).append(p)
    if not groups:
        log("沒有符合的角色：" + "、".join(only))
        return 1

    OUT.mkdir(parents=True, exist_ok=True)
    for key, paths in groups.items():
        log(f"[{key}] {len(paths)} 張")
        results = []
        for p in paths:
            rgb = np.asarray(Image.open(p).convert("RGB"))
            h, w = rgb.shape[:2]
            regions = [(round(x0 * w / 1024), round(y0 * h / 1536),
                        round(x1 * w / 1024), round(y1 * h / 1536))
                       for x0, y0, x1, y1 in CLEANUP_REGIONS.get(char_name(p.stem), [])]
            # 使用者停用縫隙清理時，也停用角色局部修正。
            rgba, info = cut(rgb, hair_gap_distance=args.hair_gap_distance,
                             hair_gap_tol=args.hair_gap_tol,
                             cleanup_regions=regions if args.hair_gap_distance else ())
            if char_name(p.stem) in SILHOUETTES:
                rgba = add_glow(rgba)
                info += "，剪影加光暈"
            log(f"  {p.name}: {info}")
            results.append((p, rgba))
        for (p, _), c in zip(results, crop_group(results)):
            out = OUT / (p.stem + ".png")
            Image.fromarray(np.ascontiguousarray(c), "RGBA").save(out, optimize=True)
            log(f"  -> {out.relative_to(ROOT)}  {c.shape[1]}x{c.shape[0]}")
    log("\n完成。接著執行 build.bat（或 node tools/build.js）讓遊戲讀到新圖。")
    return 0


if __name__ == "__main__":
    sys.stdout.reconfigure(encoding="utf-8")
    sys.exit(main(sys.argv[1:]))
