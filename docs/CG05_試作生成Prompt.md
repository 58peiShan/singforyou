# CG 05「腳踏車特訓」試作

## 未採用構圖試作：人物縮小、鏡頭拉遠

作者已決定不採用此版，保留正式遊戲中的原版 `game/assets/cg/05.png`。未採用試作：`img/CG試作/05_腳踏車特訓_拉遠構圖.png`。使用內建 imagegen，依作者要求增加草地、道路、腳踏車與黃昏海景的畫面比例；承完保留紅暈、不笑。遊戲正式 `05.png` 保留原版，不作替換。

```text
Create a wider environmental framing of this existing hand-drawn animation illustration of two adult women after a bicycle mishap. Pull the viewpoint back so the existing pair occupies about 60 percent of the picture width and half the picture height, with generous grass, coastal road and sunset scenery visible around them. Maintain their recognizable faces, original expressions, gaze, clothing, hair colors and existing pose. The chestnut-haired woman should keep pink cheeks, slightly parted lips and NO smile. Her navy shirt has no towel, whistle or lanyard. The blue-black-haired woman keeps her white long dress, thick eyebrows and no facial mole. Place both women entirely within the frame rather than cropping their heads against its edges. Draw their arms and hands naturally and correctly. Show the fallen city bicycle clearly in the right midground, a quiet coast road behind it and the sunset bay beyond. The bottom quarter is mainly quiet grass. Use exactly the same 1980s Japanese hand-drawn cel-animation style with flat opaque colors, broad simple hard-edged character shadows, restrained hair highlight shapes and a hand-painted landscape background. Preserve original adult character designs. One coherent 16:9 landscape image, no collage, no inner border, no text or watermark. This is a camera-distance and environment adjustment.
```


**已確認採用**：作者確認「不笑、保留紅暈」版，已加入正式遊戲素材 `game/assets/cg/05.png`。以下保留各輪試作與修改紀錄。

## 最新修訂：以第一張為底、不笑、保留紅暈

採用版本原圖：`img/CG試作/05_腳踏車特訓_不笑保留紅暈.png`。依作者修正，回到初版眼神與紅暈，只改承完嘴型；前輪「緊張無紅暈」版不再是目前方向。使用內建 imagegen，已加入遊戲。

```text
Edit this FIRST ORIGINAL version of CG 05. Change ONLY THE MOUTH of Seungwan, the chestnut-haired adult woman lying on the grass at lower right. Remove her smile: neither corner of her lips should curve upward. Make her lips gently parted in a small neutral, slightly speechless expression, caught off guard by the closeness. Not a frown, not frightened, not an exaggerated open mouth. Preserve her ORIGINAL eyes, gaze direction, eyebrows, face shape and ALL THE ORIGINAL PINK BLUSH AND CHEEK HATCH MARKS. She should look like the same first image with the smile simply gone, NOT like a newly tense, wide-eyed or worried face. Absolutely preserve everything else: Joohyun's face and expression, thick dark brows, blue-black hair, no mole, white dress, all poses and hands, Seungwan's navy polo and chestnut curls, sunset, road, sea, bicycle, grass, exact composition, crop, colors and 1980s Japanese hand-drawn cel-animation style. No added towel, whistle, lanyard, text or effects. A tiny local mouth-only adjustment.
```


## 表情修訂：承完緊張、無紅暈

最新試作：`img/CG試作/05_腳踏車特訓_緊張無紅暈.png`，待確認。使用內建 imagegen，只修改承完表情與紅暈，保留原版供比較。

```text
Edit ONLY the facial expression and cheek coloration of Seungwan, the CHESTNUT-HAIRED adult woman lying on the grass at the LOWER RIGHT. Make her look visibly nervous and caught off guard by the unexpected closeness: eyes slightly wider and fixed on Joohyun, eyebrows raised slightly and drawn together in mild tension, lips slightly parted with a tense uncertain mouth, NO relaxed smile. Keep her natural adult face shape and brown eye color. REMOVE ALL BLUSH from Seungwan: no pink or red cheeks, no blush hatch marks, no flushed nose or ears. Restore her normal skin tone under the existing warm sunset illumination, without bleaching or changing the overall light. Convey nervousness through eyes, eyebrows and mouth alone; no sweat symbols, tears or extra effects. Keep EVERYTHING ELSE unchanged: Joohyun's face and existing expression and blush, her especially thick dark eyebrows, no mole, both women's hair, exact body and arm poses, navy polo without towel/whistle/lanyard, white dress, grass, bicycle, sea, sunset, composition, framing, colors, 1980s Japanese hand-painted cel-animation style and background texture. No crop, no added text or objects. Localized change to Seungwan's face only.
```


使用內建 imagegen，依共用規格、角色卡與 CG 05 場景生成。試作存於 `img/CG試作/05_腳踏車特訓_風格試作.png`，待作者確認，尚未放入遊戲。原生輸出未調整為 1920×1080。

參考：`img/立繪/裴柱現_普通.png`、`img/立繪/孫承完_普通.png`。承完無毛巾、哨子與掛繩；柱現保留粗濃眉、無痣設定。

## 實際生成 Prompt

```text
Create one cinematic illustration for CG 05 "Bicycle Lesson" in a romantic fantasy visual novel. 16:9 landscape, target 1920x1080.
Use the two attached original anime character images ONLY for identity and design, not their standing poses or grey backgrounds. First reference: Joohyun, adult woman appearing about 35, straight waist-length blue-black hair, deep-brown eyes, fair skin, bold full dark eyebrows visibly thicker than the other woman's. Her face has no mole. Simple opaque white sleeveless long dress. Second reference: Seungwan, adult woman age 32, fluffy chestnut-brown shoulder-length curls, brown eyes, fit swimmer build, gentle slightly boyish charm. Navy short-sleeved polo and red athletic shorts with white trim. IMPORTANT costume correction: Seungwan has NO towel, NO whistle, NO red lanyard, because this scene is on roadside grass. Preserve both women's distinct faces.
Story: after an unsuccessful bicycle lesson on a quiet coastal road at golden dusk, they have tumbled gently onto the grassy verge. Seungwan rests on her back on the grass and looks up with an apologetic little smile. Joohyun has caught herself above and slightly beside her, bracing her own weight through both palms planted on the grass near Seungwan's shoulders. Joohyun looks at Seungwan with embarrassed annoyance and faintly rosy cheeks, as if complaining that she promised not to let go. The closeness is conveyed by eye contact and facial acting. Joohyun's long hair hangs down around their two faces like a dark curtain. Their faces remain separated and clearly visible. A single fallen step-through town bicycle lies in the grass safely behind them, one wheel tilted upward; beyond it a narrow coastal road and a thin warm sea horizon. Only two people.
Camera: a close, LOW OBLIQUE SIDE VIEW near grass height, both adult faces shown in readable three-quarter/profile view. Their faces and the connecting gaze occupy the upper-middle of the frame; show their shoulders, bracing arms and nearby grass to make the action coherent. Medium-close framing; lower bodies mostly outside the frame. Keep the lower quarter quiet grass and ordinary opaque clothing for the game's dialogue overlay; do not draw interface. Natural separate hands, coherent shoulders and necks, support arms visibly connected to Joohyun. Warm late-day illumination.
STYLE: an authentic 1980s Japanese hand-drawn cel-animation feature / OVA frame. Confident fine hand-inked contours, mature facial proportions, opaque FLAT CEL COLORS with one or two HARD-EDGED shadow tones and sharp angular hair highlights. Hand-painted gouache scenery, restrained background brush texture, economical painted grass shapes; subtle analog film softness and fine grain. Indigo hair, chestnut, warm ivory, muted green grass, amber dusk. The people should look like painted animation cels over the background. Not a modern glossy digital painting, not photorealism, not 3D, not pixel art. Quiet cinematic storytelling, no dialogue text, signature, watermark, borders or montage. Keep the same facial identities as the attached images.
```

