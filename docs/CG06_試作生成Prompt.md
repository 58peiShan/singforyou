# CG 06「雨夜之吻」試作

**已確認採用**：作者確認「小屋暗燈版」，正式遊戲素材為 `game/assets/cg/06.png`。保留後肩修正、簡化賽璐璐光影與雙人閉眼表情；以下各輪紀錄中的「尚未加入遊戲」為當時狀態。

## 最新修訂：小屋燈光調暗

最新試作：`img/CG試作/06_雨夜之吻_小屋暗燈版.png`。使用內建 imagegen，以移除後肩版為底，調低壁燈與室內暖光，保留人物可辨識度與簡化硬邊陰影；兩人仍閉眼。尚未加入遊戲。

```text
Lighting-only edit of the attached hand-drawn animation illustration. Make the cabin's interior light noticeably DIMMER, as if its single amber wall lamp has been turned down. Reduce the lamp's bright core and the orange illumination on wood, bench and characters; make the room feel like a quiet dimly lit night interior. Retain a small warm amber pool near the lamp and gentle readable illumination on both faces and hands. Let the existing cool blue rainy-window light subtly balance the subdued warm interior. Do not crush shadows to black or make the characters illegible. Preserve the simple 1980s Japanese cel-animation rendering: flat opaque color areas and a single broad hard-edged shadow tone, no additional gradients, glossy highlights or complex rim light. Keep EVERYTHING else exactly the same: two adult women's faces and closed eyes, expressions, poses, mouths, all body shapes, corrected hidden far shoulder beneath the long blue-black hair, hands, costumes, hair, framing, window rain and scenery, towel and cabin objects. No geometry changes, no added text or objects. Only a darker, more subdued interior lighting palette.
```


## 最新修訂：移除柱現後側肩膀

最新試作：`img/CG試作/06_雨夜之吻_移除後肩.png`，使用內建 imagegen。柱現遠側肩膀由藍黑長髮遮住，保留近側肩膀、托頸手臂與簡化賽璐璐光影。尚未加入遊戲。

```text
Make ONE very small anatomy cleanup to this illustration. Joohyun is the adult blue-black-haired woman on the LEFT. REMOVE the extra visible FAR/BACK SHOULDER skin shape near the CENTER of the image: the small peach-colored triangular shoulder/upper-arm wedge immediately BELOW the kissing faces, to the RIGHT of Joohyun's neck and white dress strap, tucked behind Seungwan's chestnut hair. That far shoulder should be completely occluded. Replace only that small skin wedge with naturally overlapping blue-black long hair, matching Joohyun's existing simple flat cel-painted hair. The large clearly connected near shoulder and bent arm on the LEFT leading up to the neck-touching hand MUST REMAIN unchanged. Do NOT remove that main shoulder or arm. Preserve the two adult women's faces, kiss, all hands, all other body shapes, costumes, pose, simple hard-edged cel shading, colors, background and exact composition. Keep Joohyun's dark full eyebrows and no mole, Seungwan's navy polo without lifeguard accessories, rainy window and warm cabin. Localized removal of the far shoulder only; no other redesign. No added text or objects.
```


## 最新修訂：肢體清晰與賽璐璐光影簡化

試作：`img/CG試作/06_雨夜之吻_賽璐璐簡化肢體修訂.png`，尚未加入遊戲。使用內建 imagegen。

檢查重點：柱現近側手臂由肩膀經手肘接到承完後頸，承完近側手臂由 POLO 袖口接到柱現腰側；遠側手臂自然遮擋。減少重疊手指、皮膚水珠與高光，以大塊平塗和單層硬邊陰影呈現人物，背景保留手繪材質。

## 本輪實際使用的 Prompt

```text
Please redraw the attached illustration in a MUCH SIMPLER authentic 1980s Japanese hand-painted cel-animation style, retaining the same two adult women in their early thirties, their original facial identities, costumes, seated pose and affectionate kiss, and the same cabin scene. They are fully clothed in a navy polo and an opaque white dress.
Use clean hand-inked outlines and exactly ONE flat base color plus ONE flat hard-edged shadow tone per character material. Faces and arms should be flat opaque cel paint with only broad simple shadow shapes. Remove glossy skin reflections, moisture glints and visible droplets on skin, soft gradients and complex reflected light. Hair should be large solid dark masses with a small number of simple angular highlight bands, not intricate strands of shine. Clothing should have only a handful of large economical folds and shadows. Retain the left woman's noticeably thicker dark eyebrows and no facial mole. Keep the original palette but reduce lighting complexity to one gentle amber interior light and blue outside the window.
Improve the clarity of the hands and arms without changing the story: the left woman's visible arm connects from her shoulder through one bent elbow to her hand at the other woman's neck; simplify overlapping fingers partly hidden behind hair, with anatomically correct hand shape. The right woman's visible arm connects from her navy sleeve through one bent elbow to her hand at the left woman's clothed waist. Keep their remaining arms naturally hidden behind their bodies. Clear shoulder, elbow, wrist connections and natural hand proportions, no disconnected limbs. Maintain the same poses, gentle expressions and original characters.
A restrained gouache-painted cabin background, quiet broad shapes of wooden bench and locker. Simplify the rainy window into a few rain lines and dim harbor light shapes, and make the towel on the bench a simple folded shape. No added accessories on the navy-shirted woman. Avoid a polished modern digital illustration: prioritize economical flat painted cels over rich lighting. Landscape 16:9, no text, signature, watermark, collage or interface.
```


使用內建 imagegen，以正式 CG 05 作人物辨識與畫風參考，生成救生站小屋夜景。試作：`img/CG試作/06_雨夜之吻_風格試作.png`，待作者確認，尚未加入遊戲。保留原生輸出尺寸，未調整至 1920×1080。

承完身上無毛巾、哨子與掛繩；擦髮毛巾作獨立劇情道具留在長椅上。

## 實際生成 Prompt

```text
Use case: illustration-story. Generate one new landscape 16:9 illustration, CG 06 "Rain-night kiss", target 1920x1080. The attached prior CG is a CHARACTER IDENTITY and ART STYLE reference only: preserve the same two adult women's distinctive original anime faces and the same 1980s hand-drawn cel-animation medium. Completely change the location and poses to this new scene.
SCENE: night inside a small lifeguard hut. A wooden bench, a plain old locker, a small window with rain running down its OUTSIDE and one weak amber lamp. Two adult women sit closely on the bench, leaning toward one another in a sincere, slightly awkward closed-eye kiss. Medium-close side-three-quarter view from waist upward. Lips meet naturally in a simple closed-mouth kiss. Quiet, mutual romantic affection and a little inexperienced urgency, expressed through gentle facial acting.
JOOHYUN: the blue-black-haired woman from the reference, appearing about 35. Same adult face, notably thick/full/dark eyebrows thicker than Seungwan's, fair skin, no facial mole. Her straight waist-length blue-black hair is damp from rain and loose, some strands resting on Seungwan's forearm. Simple fully opaque white sleeveless dress. One hand rests gently at the back of Seungwan's neck, fingers partly within her chestnut curls.
SEUNGWAN: the chestnut-haired woman from the reference, 32. Same adult face, warm brown eyes now closed, fluffy medium-length chestnut curls falling past the shoulders, fit build, finer brows. Plain navy short-sleeved polo covering the waist, red white-trimmed shorts mostly outside the frame. No towel around her neck or shoulders, no whistle and no lanyard. Her hand rests supportively at Joohyun's clothed waist.
One ordinary white towel lies separately on the bench beside them, after having been used to dry hair. Correct anatomical arms with clear hand ownership; natural neck angles, original faces still recognizable in profile. Only two people. Their heads and hands should be above the bottom dialogue area, with quiet bench or clothing shapes in the lower quarter. Don't draw the game's interface.
STYLE: classic 1980s Japanese hand-painted animated film / OVA frame; clean slightly varied hand-inked contours, opaque flat cel paint and one or two crisp HARD-EDGED shadow tones, angular hair highlights, expressive mature faces. Characters like painted animation cels over gouache scenery, slight analog film grain, background brush texture. Amber lamp catches cheeks and fingers against indigo rainy window colors. Same visual production as the attached approved CG, adapted to night interiors. No photorealism, CGI, glossy digital airbrush, pixel art, modern moe or photographic lens effects. Clothing remains fully opaque. Do not draw tears, pearls, umbrella, indoor rain, added people, lettering, captions, logos, signatures, watermark, frames or montage.
```

