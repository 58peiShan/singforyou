# CG 04「姐姐」試作（已停用）

此 CG 已從遊戲劇本與現行製作清單移除；本文與圖片保留作歷史備用，不再於遊戲中播放或列入圖庫。

## 配件修訂實際使用的 Prompt

使用內建 imagegen，以前一版 `game/assets/cg/04.png` 為修改對象。

```text
Edit the attached existing CG 04 illustration. Make ONLY this costume correction: REMOVE the white towel draped around the neck and both shoulders of the chestnut-haired woman on the LEFT (Seungwan), REMOVE her silver whistle, REMOVE the entire red whistle lanyard including both red straps and metal attachment. Naturally reconstruct her plain NAVY-BLUE polo shirt underneath with matching original cel shading and fabric folds. Her neck and shoulders should have no towel, no whistle, no lanyard, no replacement jewelry or accessory. This scene is indoors in a bar, so all lifeguard accessories must be absent. Preserve EVERYTHING ELSE as closely as possible: both adult women's exact faces, warm expressions, gaze, hair shapes and colors, Joohyun's especially thick dark eyebrows and no facial mole, pinned blue-black hair with chopstick, ivory top and black apron, each hand and arm position, clam soup bowl, water glass, wooden counter, seaside night window, bottles, lantern, composition, framing, proportions, amber/indigo palette, 1980s Japanese hand-drawn cel-animation look and painted background. Keep the same landscape aspect ratio, no crop, no added characters, no text or watermark. This is a local accessory removal, not a new composition.
```


**目前版本**：已依最新規則移除承完的毛巾、哨子與掛繩，更新 `game/assets/cg/04.png`。保留雙人表情、構圖與畫風；舊版備份於 `.tmp/cg-backup/04-with-lifeguard-accessories.png`。下方初版 Prompt 保留作歷史紀錄。

使用內建 imagegen 生成，樣張存於 `game/assets/cg/04.png`；先確認風格與構圖，尚未確認為全組定稿母圖。輸入為 `img/立繪/裴柱現_普通.png`、`img/立繪/孫承完_普通.png`，只作角色辨識參考。

輸出保留生成工具的原生尺寸，未拉伸至 1920×1080。

## 本次實際使用的 Prompt

```text
Use case: illustration-story. Generate ONE new game event illustration, CG 04 "Older sister", for the project, landscape 1920x1080 (16:9), opaque background.
REFERENCE ROLES: Image 1 (blue-black-haired adult woman in white dress) is JOOHYUN IDENTITY ONLY. Image 2 (chestnut-haired female lifeguard) is SEUNGWAN IDENTITY ONLY. Preserve their specific original anime faces, eye shapes, hair colors and distinct identities; do not copy the neutral standing poses or grey backgrounds. Adapt the first woman's hairstyle and costume to the story below.
STYLE: a cinematic frame from a 1980s Japanese hand-drawn feature / OVA: confident hand-inked contours, economical opaque cel paint, one or two hard-edged shadow shapes, angular hair highlight bands, mature expressive adult faces. Characters look like hand-painted cels over a gouache-painted atmospheric background. Restrained indigo, muted teal, warm ivory, chestnut and amber. Light fine film grain, not damaged vintage scratches. No 3D, photorealistic skin, modern moe, glossy digital airbrush or pixel art. Preserve the reference identities while rendering them in this consistent 1980s animation medium.
SCENE: at night inside a small, warmly lit, old seaside bar "Low Tide". Two adult women seated beside one another at a weathered wood counter, in a close waist-up two-shot seen from the counter's front-side, intimate but not a kiss. Seungwan on the left turns slightly toward Joohyun at the right, leaning in with an easy, kind teasing smile: she just called her "older sister" for the first time. Joohyun turns her head toward Seungwan, caught between wide-eyed surprised delight and a small involuntary smile; her composed queenly reserve has briefly melted. They look at each other, NOT at the viewer. Subtle adult romantic chemistry, ordinary lived-in warmth.
SEUNGWAN: 32-year-old adult woman, fit, gentle boyish charm; fluffy medium-length chestnut curls falling just past the shoulders, warm brown eyes, original face from image 2, finer eyebrows than Joohyun. Navy polo with no logo, regular length, red shorts mostly outside the frame, whistle on neck lanyard; white lifeguard towel loosely around neck if visible.
JOOHYUN: adult woman appearing around 35, original face from image 1; very noticeably THICKER, FULLER, DARKER eyebrows than Seungwan, bold but beautiful, deep-brown slightly upturned eyes, fair pearly skin, NO mole anywhere. Her waist-length straight blue-black hair is loosely PINNED UP with a single chopstick for bar work, a few long wisps beside her face, NOT cropped short. A plain black work apron over an opaque simple ivory top; not her usual white dress and loose hair in this scene.
BLOCKING: exactly two women, anatomically natural arms. Joohyun's hands gently cradle a small plain ceramic bowl of clam soup on the counter; a glass of water nearby. Seungwan's nearer hand rests naturally on the counter, separate from the other's hands. The face-to-face eye-line and Joohyun's changing smile are the main story. Heads occupy upper-middle, their eyes near upper 30%; hands and soup around 55-65% height. Bottom quarter is quiet wood counter for in-game dialogue overlay, but do NOT draw any UI or lettering.
BACKGROUND: restrained painted bottle silhouettes, old wood, one small warm amber practical lamp, a dark blue window hinting at the coastal night. No third character. Human-scale, slightly asymmetrical, filmic composition, no perfectly mirrored publicity pose.
AVOID: tears, pearls, mole, crown, readable labels, captions, text, speech bubbles, logo, signature, watermark, borders, montage, extra fingers, duplicated bowls, huge anime-child eyes. Deliver a finished full-bleed 16:9 illustration.
```

