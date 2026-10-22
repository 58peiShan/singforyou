# 人物立繪 Prompt（90 年代賽璐璐動畫風）

這份是給繪圖 AI 用的 prompt，畫法要跟現有的裴柱現立繪（`img/i_wholebody_human.png`）一致。

- 中文說明是給作者看的，用來確認內容對不對。
- 灰底方塊裡的英文才是要貼給 AI 的 prompt。

**這次要畫的角色**

| 角色 | 張數 | 檔名 |
|---|---|---|
| 裴柱現（人類） | 10 | 裴柱現_普通、_笑、_得意、_害羞、_生氣、_驚慌、_難過、_恍惚、_魅惑、_哭 |
| 裴柱現（人魚） | 10 | 裴柱現_人魚_普通、_人魚_笑……（同上 10 個表情） |
| 孫承完 | 6 | 孫承完_普通、_笑、_害羞、_驚訝、_難過、_認真 |
| 阿英 | 4 | 阿英_普通、_笑、_擔心、_認真 |
| 康 | 3 | 康_普通、_大笑、_慌張 |
| 澪（人類） | 3 | 澪_普通、_冷笑、_怒 |
| 澪（人魚） | 3 | 澪_人魚_普通、_人魚_冷笑、_人魚_怒 |
| 珊婆（寄居蟹） | 2 | 珊婆_普通、_吐槽 |
| 珊婆（老人魚，人魚篇用） | 2 | 珊婆_人魚_普通、_人魚_吐槽 |
| 潮后（人魚篇用） | 1 | 潮后_普通 |
| 陳伯（剪影） | 1 | 陳伯_普通 |
| 麵包店老闆（剪影） | 1 | 老闆_普通 |

---

## 一、怎麼用

1. 開一個新對話，**上傳風格參考圖 `img/i_wholebody_human.png`**，再貼「**A. 總規格**」。
2. 貼某個角色的「**普通**」prompt，照該角色寫的「附圖」一起上傳，生圖。
3. 「普通」滿意之後，**把這張普通圖上傳**，貼「**B. 換表情**」，再把該角色的一句表情描述貼在最後面。一次換一個表情。
4. 用「**三、驗收清單**」檢查。
5. 檔名照上面的表格存成 PNG（例如 `阿英_擔心.png`），全部放進 `img/立繪/` 資料夾，然後**雙擊專案資料夾裡的 `cut_sprites.bat`**：它會自動去背、放進 `game/assets/sprites/`，再重新建置遊戲。
   - 直接把原圖丟進 `game/assets/sprites/` 沒有用：背景不會變透明，而且要重新建置遊戲才會讀到新檔案。
   - 第一次執行會自動安裝影像套件，約 1～2 分鐘。

**建議先畫裴柱現的「普通」**：她是整組的畫風基準。新的普通畫好、滿意之後，第 1 步的風格參考圖就改上傳這張新圖，其他角色的畫風會更一致。

**為什麼改成「一個表情一張圖」**：以前是六個表情擠在一張圖裡，切出來每張只有約 260×530 像素。遊戲裡卻要放大到約 970 像素高，所以會糊。一張圖只畫一個表情，人物大約有 1380 像素高，在遊戲裡就很清楚。

**照片怎麼用**：`img/` 裡的照片只拿來參考**髮型、穿搭和配色**。臉要畫成原創的動畫臉，不要畫得像照片裡的本人。這樣比較像原創角色，以後如果要上架販售也比較安全。

---

## 二、全部角色共用的規則

| 項目 | 規格 |
|---|---|
| 畫風 | 90 年代初中期 TV 動畫／OVA 的賽璐璐風：乾淨的深色線條、平塗加一層硬邊陰影、頭髮有銳利的反光條、偏暖的復古配色 |
| 比例 | 成熟的成人比例（約 7.5～8 頭身），都是 30 歲上下的成年女性，不要 Q 版、不要畫成少女 |
| 尺寸 | **1024×1536**（直式 2:3）；珊婆寄居蟹例外，用 1024×1024 |
| 構圖 | 一張只畫一個人，從頭頂到腳**全身入鏡**，人物約佔畫面高度 90%，置中 |
| 姿勢 | 站姿、面向前方或微側身；手臂靠近身體，輪廓不要往兩邊伸太開 |
| 鏡頭 | 跟角色眼睛同高，平視（跟背景的地平線規則一致，放進場景才不會怪） |
| 背景 | **純灰色平塗**（#707070），沒有漸層、光暈、地板、影子，方便去背 |
| 光線 | 正面柔和白光，不要彩色邊光，白天和夜晚的背景都能用 |
| 禁止 | 文字、名牌、衣服上的商標（照片裡 POLO 衫的 logo 不要畫）、浮水印、邊框 |
| 換表情 | 只改臉。身體、姿勢、手的位置、大小、位置都不能變，遊戲裡換表情時人物才不會跳動 |

### A. 總規格（每個新對話先上傳 `img/i_wholebody_human.png`，再貼這段）

```
You are drawing character sprites (full-body standing portraits) for a 2D visual novel. Every image in this series must match the same art style. Follow these rules for every image I ask for.

STYLE: 1990s retro anime cel style
- It should look like a hand-painted animation cel from an early-to-mid 1990s anime TV series or OVA.
- Clean, confident dark line art with slightly varied line weight.
- Flat cel colors with one hard-edged shadow tone and crisp highlights; glossy hair with sharp, angular highlight streaks. No soft airbrushing, no painterly texture, no modern moe style, no 3D look.
- A slightly warm, retro color palette, not neon.
- Mature, realistic adult proportions, about 7.5 to 8 heads tall. These are adult women around 30, not children, not teenagers, not chibi.
- 1990s anime eyes: medium-large, a defined upper lash line, colored iris with a dark pupil and two small white highlights; a small simple nose; natural lips.
- The attached style reference sheet (a woman with long blue-black hair in a white dress) shows the exact target style: match its line art, coloring, eye style, proportions and level of detail.
- Reference photos, if attached, are only for hairstyle, outfit, colors and overall vibe. Never copy a real person's face; always draw an original anime face.

FORMAT
- One character only, full body from the top of the head to the feet, nothing cropped.
- Portrait canvas 1024x1536 (2:3), unless I say otherwise. The figure is centered and fills about 90% of the image height, with a small empty margin above the head and below the feet.
- Standing upright, facing the viewer or in a slight three-quarter turn, relaxed natural pose, arms kept close to the body: a compact silhouette with nothing sticking out far to the sides.
- Camera at the character's own eye level, straight on: no looking up or down, no foreshortening, feet flat on an invisible floor.
- Plain flat solid medium-grey background (#707070). No gradient, no glow, no floor, no cast shadow, no scenery.
- Neutral, soft white light from the front, so the character fits both day and night backgrounds. No colored rim light.
- No text, no labels, no name tags, no logos or brand marks on clothing, no watermark, no border.

Reply "OK" and wait for the character description.
```

### B. 換表情（上傳「普通」那張，貼這段，最後接一句表情描述）

```
Edit the attached image of this character. Keep everything identical: the same character design, face shape, hair, outfit, accessories, pose, hand positions, size and position on the canvas, line art, colors and the plain grey background. Change ONLY the facial expression to:
```

（例：貼完上面這段，再接 `surprised: eyes wide open, eyebrows raised, mouth slightly open`）

---

## 三、驗收清單

- [ ] 1024×1536（寄居蟹是 1024×1024），全身入鏡，頭和腳都沒被切掉
- [ ] 跟裴柱現的立繪放在一起看：線條粗細、上色方式、眼睛畫法、頭身比一致
- [ ] 背景是純灰色，沒有影子和光暈
- [ ] 臉是原創動畫臉，不像照片裡的本人
- [ ] 沒有文字、商標、浮水印
- [ ] 同一個角色的各個表情：身體、姿勢、大小、位置完全一樣（快速切換著看，只有臉在動）
- [ ] 小配件每張都在（承完的哨子和毛巾、阿英的刺青、康手上的魷魚串）
- [ ] 裴柱現的痣每張都在：她的**左眼**（畫面上看是右邊那隻眼睛）、**靠近鼻子那側的眼角**
- [ ] 裴柱現除了「哭」以外，**都沒有眼淚**；「哭」的眼淚要變成珍珠
- [ ] 陳伯和麵包店老闆是純深藍色剪影，裡面沒有任何線條或五官
- [ ] 只看輪廓就認得出身分：陳伯是老漁夫（鴨舌帽、駝背、雨鞋、手背在後面），老闆是麵包師傅（高廚師帽、圍裙、一盤麵包）；兩人並排時輪廓明顯不同

**常見問題怎麼補救**（在對話裡再補一句）：

| 問題 | 補一句 |
|---|---|
| 畫成現代動畫風 | `Make it look more like a 1990s anime cel: harder shadows, sharper hair highlights, retro colors.` |
| 腳或頭被切掉 | `Show the full body from head to toe with a margin; make the figure slightly smaller.` |
| 換表情時身體也變了 | `Keep the body, pose and position exactly identical to the attached image; only change the face.` |
| 出現 logo 或字 | `Remove all logos and text from the clothing.` |
| 臉太像照片本人 | `Draw an original anime face; do not copy the face in the photo.` |
| 背景不是純灰 | `Plain flat solid grey background, no shadow, no glow.` |

---

## 四、各角色 Prompt

### 裴柱現（人類 10 張＋人魚 10 張）

貝貝國第七公主，自稱 35 歲（其實 350 歲）。美得不合理：
- 藍黑色長直髮垂到腰，光線下泛深藍光澤
- 深褐色眼睛，眼尾微微上挑，**左眼靠近鼻翼的眼角有一顆小痣**
- 皮膚白皙，帶一點珍珠光
- 常穿白色無袖長洋裝，赤腳
- 人魚形態：湛藍色魚尾，尾鰭半透明淡藍、薄得像紗；上身穿白色無袖上衣

個性是對美貌極有自信、好勝、嘴硬心軟，帶點女王架子。

**劇情重點**：她的眼淚被海巫拿走了。難過的時候眼眶和鼻子會紅，但**一滴眼淚都不能掉**。只有「哭」這張（結局詛咒解除）有眼淚，而且眼淚掉下來時會**變成珍珠**。

這次是重畫成高解析度版本。檔名跟現在遊戲裡的一樣，畫好後直接取代舊圖。

**附圖**：`img/i_wholebody_human.png`（她現有的設計）

**裴柱現_普通（人類形態）**

```
[Character: Bae Joohyun (裴柱現), human form, neutral expression]
The attached sheet shows her established design: keep her face, hair, dress and proportions the same, but redraw her as a single, sharper, high-resolution figure.
Who: the seventh princess of an undersea mermaid kingdom, living on land in human form; she claims to be 35 (she is really 350). Unreasonably beautiful and supremely confident in her looks; proud, impulsive, stubborn but soft-hearted, with a queenly air.
Hair: very long, straight blue-black hair falling to the waist, with a deep-blue sheen in the highlights.
Face: deep-brown eyes with slightly upturned outer corners, long thick lashes, pale coral lips. A small mole at the inner corner of her left eye, right beside the nose (her left eye is the one on the viewer's right); not at the outer corner, and not under the eye.
Skin: fair, with a faint pearly sheen, like the inside of a seashell.
Outfit: a simple white sleeveless long dress with a scoop neckline and a gathered waist, the skirt falling softly to the ankles; barefoot.
Pose: standing gracefully, one hand lightly tucking her hair behind her ear, the other arm relaxed at her side.
Expression: calm and composed, a faint, aloof hint of a smile, chin slightly raised.
```

**裴柱現_人魚_普通（人魚形態）**

附圖：上面畫好的 `裴柱現_普通`、`img/i_wholebody_mermaid.png`（她現有的人魚設計）

```
[Character: Bae Joohyun (裴柱現), mermaid form, neutral expression]
Same character as the attached image of her in human form: the same face, the small mole at the inner corner of her left eye beside the nose, blue-black hair and pearly skin. Now in her true mermaid form. The attached mermaid sheet shows her established mermaid design.
Upper body: a white sleeveless top, like the top of her white dress.
Tail: instead of legs, a long, graceful azure-blue mermaid tail with fine overlapping scales shading from deep blue to lighter blue toward the end, with a silvery shimmer; the tail fin is pale blue, translucent and thin as gauze.
Pose: upright as if floating in water, one hand resting lightly on her chest, the other arm relaxed close to her body; the tail curving gently to one side, the tail fin near the bottom of the frame.
Expression: calm and composed, a faint, aloof hint of a smile, chin slightly raised.
```

**換表情的描述句**：人類和人魚用同一句。

- 人類形態存成 `裴柱現_<表情>.png`
- 人魚形態存成 `裴柱現_人魚_<表情>.png`

「備用」是劇本目前沒用到的，可以晚點再畫（人魚篇之後可能會用到）。

| 表情 | 描述句 | 人類 | 人魚 |
|---|---|---|---|
| 笑 | `a genuine, unguarded smile: eyes softened and slightly curved, mouth open in a happy laugh like a child` | 要 | 要 |
| 得意 | `smug and proud: chin raised, eyes half-lidded looking down at the viewer, a confident one-sided smirk, like a queen receiving her subjects` | 要 | 備用 |
| 害羞 | `shy: cheeks and ears flushed pink, eyes looking away to the side, lips pressed into a small pout` | 要 | 要 |
| 生氣 | `indignant and annoyed: eyebrows drawn down, a haughty glare at the viewer, a small pout` | 要 | 要 |
| 驚慌 | `panicked, as if caught red-handed: eyes wide with small pupils, eyebrows raised, mouth open` | 要 | 要 |
| 難過 | `sad: eyebrows tilted up in the middle, the rims of her eyes and the tip of her nose reddened, eyes glistening, but absolutely no tears falling; lips trembling` | 要 | 要 |
| 恍惚 | `dazed and entranced, as if drunk: eyes half-closed and unfocused, cheeks faintly flushed, lips slightly parted` | 要 | 備用 |
| 魅惑 | `seductive and dangerous: half-lidded eyes with a faint deep-blue glow in the irises, a slow alluring smile, head tilted slightly` | 要 | 備用 |
| 哭 | `crying with joy and relief, smiling through tears: tears stream from her eyes, and each falling tear turns into a small, round, white pearl` | 備用 | 要 |

### 孫承完（6 張）

32 歲救生員，主角。栗色蓬鬆長捲髮，褐色眼睛，笑起來眼睛彎彎的。身材結實、游泳練出來的寬肩。值班制服：深藍 POLO 衫、白邊紅色運動短褲，脖子掛哨子和毛巾。害羞時耳朵先紅。

**附圖**：`img/w_wholebody.png`（她現有的設計）、`game/assets/face/孫承完_普通.png`（對話框頭像，臉要跟它一樣）、`img/承完.jpg`（穿搭參考）。

> 補充：`img/w_wholebody.png` 本來就是承完的全身六表情，只是一直沒有切成立繪。直接切也可以用，但解析度偏低（約 260×530），而且少了哨子和毛巾，所以建議重畫。

**孫承完_普通**

```
[Character: Son Seungwan (孫承完), neutral expression]
Attached references: the full-body sheet and the face icon show her established design; match her face, eyes and hair to them exactly. The photo is only an outfit reference.
Who: a 32-year-old lifeguard in a small seaside town; warm, caring, a natural big-sister type who worries about everyone.
Hair: long, voluminous, wavy chestnut-brown hair falling past the shoulders, with soft wispy bangs.
Face: warm brown eyes that curve into crescents when she smiles; a friendly, gentle face.
Body: fit, athletic swimmer's build with slightly broad shoulders; healthy, lightly tanned skin.
Outfit (lifeguard uniform): a navy-blue short-sleeved polo shirt, cropped at the waist, with buttons at the collar and no logo; red athletic running shorts with white piping trim; a silver whistle on a red lanyard around her neck; a white towel draped around her neck; barefoot.
Pose: standing relaxed, one hand on her hip, the other arm hanging naturally.
Expression: a gentle, friendly, closed-mouth smile.
```

**換表情的描述句**（接在「B. 換表情」後面）

| 檔名 | 描述句 |
|---|---|
| 孫承完_笑 | `a bright, open-mouthed laugh, eyes curved shut into happy crescents` |
| 孫承完_害羞 | `shy and flustered: cheeks and especially the ears flushed red, eyes glancing to the side, a small embarrassed smile` |
| 孫承完_驚訝 | `surprised: eyes wide open, eyebrows raised, mouth slightly open` |
| 孫承完_難過 | `sad: eyebrows tilted up in the middle, eyes moist and glistening, lips pressed together, looking slightly down` |
| 孫承完_認真 | `serious and determined: a steady direct gaze, eyebrows slightly lowered, mouth set in a firm line` |

### 阿英（4 張）

31 歲，海邊酒吧「退潮」老闆，承完的死黨。高個子，黑色高馬尾，眼神銳利，左手腕有一圈浪花刺青，戒菸中所以一直含薄荷糖。冷靜毒舌，其實最護承完。
穿搭參考照片：芥末黃無袖上衣、海軍藍白邊短褲。另外加一件酒吧老闆的黑色短圍裙。

> 照片裡的頭髮是放下來的，這裡照角色設定畫成**高馬尾**。如果想照照片畫，把 Hair 那一行改掉就好。

**附圖**：`img/阿英.jpg`

**阿英_普通**

```
[Character: A-Young (阿英), neutral expression]
The attached photo is only an outfit and color reference; draw an original anime face.
Who: a 31-year-old owner of a small seaside bar; tall, cool-headed, sharp-tongued and very observant, secretly the most protective of her friends.
Hair: straight black hair tied in a high ponytail, a few loose strands framing her face.
Face: sharp, narrow, observant dark-brown eyes, defined eyebrows, a cool and composed look.
Body: tall and slim with long legs; light skin.
Outfit: a mustard-yellow sleeveless sporty top; navy shorts with white side stripes; a short black bar apron tied around the waist, with a small round tin of mints peeking out of its pocket; simple black sandals. A thin ring-shaped tattoo of small stylized waves around her left wrist.
Pose: standing straight with her arms loosely crossed, left forearm on top so the wave tattoo on the left wrist is clearly visible.
Expression: cool and unreadable, mouth neutral.
```

| 檔名 | 描述句 |
|---|---|
| 阿英_笑 | `a rare small smile: one corner of the mouth lifted in a lopsided half-smile, eyes softened` |
| 阿英_擔心 | `worried: eyebrows drawn together, eyes looking slightly aside with concern, lips pressed tight` |
| 阿英_認真 | `serious: a sharp, piercing stare straight at the viewer, mouth in a firm line` |

### 康（3 張）

32 歲，衝浪店老闆。健康的小麥色皮膚、圓臉，**淺棕色頭髮綁成一顆包包頭**。一年四季穿花襯衫和夾腳拖，手上永遠拿著吃的。熱情、呆呆的、很愛吃。
穿搭：花襯衫敞開，裡面是照片裡的粉白直條紋細肩帶上衣，深色牛仔褲加夾腳拖，手上拿一串烤魷魚。

**附圖**：`img/康.jpg`

**康_普通**

```
[Character: Kang (康), neutral expression]
The attached photo is only an outfit and color reference; ignore the hairstyle in the photo and draw an original anime face.
Who: a 32-year-old surf shop owner; cheerful, a little airheaded, always hungry, the mood-maker of her group of friends.
Hair: light brown hair tied up into a single round bun on top of her head, casual and slightly messy, with a few loose wisps at the sides and nape and soft side-swept bangs.
Face: a round face, round friendly light-brown eyes, rosy cheeks.
Body: average height, healthy sun-tanned (wheat-colored) skin.
Outfit: an open short-sleeved Hawaiian shirt with a bold hibiscus print (red, orange and teal flowers on cream) worn over a pink-and-white vertical-striped camisole top; dark-wash jeans rolled up at the ankles; flip-flops; a beaded bracelet on her right wrist.
Props: she holds a skewer of grilled squid in her right hand, at chest height.
Pose: standing relaxed, weight on one leg, the other hand hanging loosely.
Expression: an easygoing, slightly dazed smile, cheeks a little puffed as if she is chewing.
```

| 檔名 | 描述句 |
|---|---|
| 康_大笑 | `laughing out loud: a huge open-mouthed laugh, eyes squeezed shut into arcs, cheeks rosy` |
| 康_慌張 | `panicked and flustered: eyes wide and round, eyebrows raised, mouth open in a wobbly "eek", a classic 1990s-anime sweat drop beside her head` |

### 澪（人類 3 張＋人魚 3 張）

貝貝國第二公主，裴柱現的二姊。銀白色直長髮，冷豔，跟裴柱現長得很像但線條更銳利，眼神像冰。

- 第四章祭典上是**人類形態**（全身乾乾的）。
- 人魚篇和第六章暴風雨是**人魚形態**，尾巴是銀色的，比姐姐的大一倍。
- 衣服用深夜藍，跟姐姐的白色形成對比；赤腳，跟姐姐一樣。

**附圖**：`img/i_wholebody_human.png`（妹妹，讓 AI 畫出家族相似的臉）

**澪_普通（人類形態）**

```
[Character: Rei (澪), human form, neutral expression]
Who: the second princess of an undersea mermaid kingdom, here in human form; proud, cold and severe, though deep down she is the sister who loves the heroine most.
Looks: she clearly resembles her younger sister, the woman with long blue-black hair in the attached sheet (same family face), but with sharper lines: a sharper jaw, narrower eyes, thinner and straighter eyebrows.
Hair: very long, straight silver-white hair falling to the waist, with cool blue-grey shading and sharp highlights.
Eyes: pale, icy grey-blue eyes with a cold, piercing gaze.
Skin: very pale, almost translucent, with a faint pearly sheen.
Outfit: a sleek sleeveless long dress in deep midnight blue with a high neckline, falling straight to the ankles; barefoot; a single small pearl earring.
Pose: standing very straight, chin slightly raised, hands resting one over the other in front of her waist.
Expression: cold and expressionless, looking down her nose.
```

| 檔名 | 描述句 |
|---|---|
| 澪_冷笑 | `a cold sneer: one corner of the mouth curled up, eyes narrowed with contempt` |
| 澪_怒 | `furious: eyebrows sharply lowered, eyes blazing, teeth slightly bared` |

**澪_人魚_普通（人魚形態）**

附圖：上面畫好的 `澪_普通`、`img/i_wholebody_mermaid.png`（妹妹的人魚姿勢）

```
[Character: Rei (澪), mermaid form, neutral expression]
Same character as the attached image of Rei in human form: the same face, silver-white hair, icy grey-blue eyes and pale pearly skin. Now in her true mermaid form. Use the attached mermaid sheet of her younger sister as the reference for the mermaid pose and proportions.
Upper body: a sleeveless high-neck top in deep midnight blue.
Tail: instead of legs, a long and powerful silver mermaid tail with a faint blue sheen and fine overlapping scales, noticeably larger and longer than her sister's; it ends in a large tail fin that is translucent silver-white with sharp, blade-like edges.
Pose: upright as if floating in water, the tail curving gently to one side, the tail fin near the bottom of the frame; hands resting one over the other in front of her waist.
Expression: cold and expressionless, looking down her nose.
```

| 檔名 | 描述句 |
|---|---|
| 澪_人魚_冷笑 | `a cold sneer: one corner of the mouth curled up, eyes narrowed with contempt` |
| 澪_人魚_怒 | `furious: eyebrows sharply lowered, eyes blazing, teeth slightly bared` |

### 珊婆（寄居蟹 2 張＋老人魚 2 張）

至少五百歲的海巫，毒舌、愛看戲，其實一直在保護裴柱現。

- 主線是**寄居蟹**：背著粉紅色螺殼，畫成 90 年代動畫裡的吉祥物小跟班，表情豐富但不要太幼稚。
- 人魚篇序章是**原本的樣子**：白髮的老人魚。尾巴用跟螺殼一樣的珊瑚粉，讓兩個形態看得出是同一個人。身上披一段舊漁網，暗示三百年前那個漁夫。

**珊婆_普通（寄居蟹）**

```
[Character: Granny Shan (珊婆), the sea witch in hermit-crab form, neutral expression]
Format exception: square canvas 1024x1024; the hermit crab is centered and fills about 80% of the width, on the same plain grey background.
Who: an ancient sea witch, over 500 years old, who has shrunk herself into a hermit crab; sharp-tongued, loves watching other people's drama, secretly protective.
Design: a small hermit crab drawn as a 1990s anime mascot sidekick, expressive but not babyish. A large spiral conch shell in soft coral pink with pearly white highlights and a few tiny barnacles; a reddish-orange crab body peeking out of the shell; two claws, the right one slightly larger; two eyes on short stalks with heavy, half-lidded "old lady" eyelids; two thin antennae; four little walking legs; a tiny expressive mouth.
Pose: sitting upright and facing the viewer, claws resting in front of her.
Expression: unimpressed and skeptical, eyes half-lidded.
```

| 檔名 | 描述句 |
|---|---|
| 珊婆_吐槽 | `sarcastic: one eye narrowed and the other rolled up in exasperation, a smirking little mouth; also raise the right claw and point it at the viewer (this is the only body change allowed)` |

**珊婆_人魚_普通（老人魚，人魚篇用）**

附圖：上面畫好的 `珊婆_普通`（寄居蟹）、`img/i_wholebody_mermaid.png`（人魚姿勢參考）

```
[Character: Granny Shan (珊婆), true form as an old mermaid, neutral expression]
The attached hermit-crab image is the same character in disguise: keep her pink conch shell as a motif. Use the attached mermaid sheet only as the reference for mermaid pose and proportions.
Who: the same sea witch in her true form: a very old mermaid, at least 500 years old, dignified, sharp-eyed and a little mischievous.
Hair: long, thick, flowing white hair, slightly wavy, reaching down to her tail.
Face: an elderly woman's face with fine wrinkles, sharp knowing pale pink-grey eyes, a sardonic half-smile, still showing traces of great beauty.
Upper body: wrapped in a shawl made from an old hemp fishing net, decorated with small shells and a few pearls; a necklace of small pink conch shells.
Tail: a long mermaid tail in faded coral pink (the same color as her hermit-crab shell), with dull, weathered scales and torn, lacy, translucent fins.
Pose: upright as if floating in water, slightly hunched, the tail curving to one side, hands folded in front of her.
Expression: calm and knowing, a faint sardonic half-smile.
```

| 檔名 | 描述句 |
|---|---|
| 珊婆_人魚_吐槽 | `sarcastic: a crooked smirk, one eyebrow raised, eyes narrowed in mockery` |

### 潮后（1 張，人魚篇用）

貝貝國女王，裴柱現的母親。深紫色長髮，戴珊瑚王冠，美得像一尊雕像。務實、冷淡。只在人魚篇海底出現，所以直接畫人魚形態。

**附圖**：`img/i_wholebody_mermaid.png`（女兒，臉要有家族相似感；也當人魚姿勢參考）

**潮后_普通**

```
[Character: the Tide Queen (潮后), mermaid form, neutral expression]
Who: the queen of the undersea mermaid kingdom and mother of the woman in the attached mermaid sheet; practical, cold and composed, beautiful like a marble statue. She should clearly resemble her daughter, but older, more mature and more regal. Use the attached sheet as the reference for mermaid pose and proportions.
Hair: very long, straight deep-purple hair reaching past her waist.
Crown: a tall crown of branching red-and-white coral set with pearls.
Face: regal and symmetrical, calm deep-violet eyes with a slightly lowered gaze, no smile.
Upper body: an elegant sleeveless top in deep purple, draped with strands of pearls and mother-of-pearl ornaments.
Tail: a long, majestic deep-violet mermaid tail with a dark gold sheen, ending in wide, translucent violet fins.
Pose: upright as if floating in water, perfectly still, hands folded in front of her waist, the tail curving gently to one side.
Expression: cool, composed and expressionless.
```

### 陳伯（1 張，剪影）

漁會的老前輩，七十多歲。記得承完的阿嬤每年在春潮祭唱漁歌，說「那首歌啊，是要有人唱的。沒有人唱，海會寂寞。」溫和、穩重、受鎮民敬重。

只畫剪影，不畫臉。讓人只看輪廓就知道是一位**老漁夫**：
- 頭戴鴨舌帽，脖子圍毛巾
- 肩膀微駝、頭往前傾，有點小肚子
- 寬鬆的短袖襯衫、褲管捲起來的工作褲、高筒雨鞋
- 雙手背在身後，腿微微外八，站得很穩

**畫風一致的做法**：
- 輪廓要用跟其他角色一樣的 90 年代動畫比例來畫，只是整個人塗成一個顏色，不要變成剪紙或皮影戲那種平板的樣子。
- 顏色用跟現有剪影一樣的深藍色。AI 只要畫純色剪影就好，淡藍色光暈和邊光會在去背時由工具加上，跟現在的剪影一樣。

**附圖**：`img/i_wholebody_human.png`（風格參考）

**陳伯_普通**

```
[Character: Old Chen (陳伯), silhouette]
Format exception: this character appears only as a silhouette. Draw the whole figure as one solid, flat deep-navy shape (#16244a): no interior lines, no facial features, no shading, no highlights, no glow. Use a plain flat light-grey background (#d0d0d0) instead of the usual grey. All other framing rules stay the same: 1024x1536 canvas, full body filling about 90% of the height, centered, eye-level camera.
Style: the outline must still read as a 1990s anime cel character, drawn with the same proportions, anatomy and clean, confident edges as the attached style reference, just filled in with one solid color. Not a cut-paper or shadow-puppet look.
Who: an old fisherman in his seventies, the elder of the town's fishermen's association; kind, steady and respected.
The silhouette must show, from the outline alone, that he is an old fisherman:
- a soft flat cap on his head,
- a towel wrapped around his neck,
- slightly stooped shoulders, the head and neck leaning a little forward, a small round belly,
- a loose short-sleeved shirt worn untucked,
- wide work trousers rolled up at the shins, tall rubber fishing boots,
- hands clasped behind his back, elbows showing at both sides,
- a stocky, slightly bow-legged stance with both feet planted firmly.
Pose: body turned slightly to one side (three-quarter view), so the cap brim, the stooped back and the belly show clearly in the outline.
```

### 麵包店老闆（1 張，剪影）

鎮上唯一一家麵包店的老闆，四、五十歲的中年男性。第六章承完來訂生日蛋糕，他問要寫什麼字：「就這樣？」

跟陳伯一樣只畫深藍色剪影，畫風做法也相同（見上面陳伯的說明）。輪廓要一看就知道是**麵包師傅**，而且跟陳伯明顯不同：
- 頭戴高高的白色廚師帽（剪影裡是一個圓鼓鼓的高帽子）
- 站得挺直，不駝背；身材敦實、微胖，手臂粗壯
- 短袖襯衫袖子捲起來，腰間綁著長到膝蓋的圍裙，背後露出圍裙綁帶
- 一手在胸前托著一盤圓麵包（麵包在盤子上方鼓起一顆顆圓形），另一手自然垂下
- 一般的工作褲和便鞋

**附圖**：`img/i_wholebody_human.png`（風格參考）、畫好的 `陳伯_普通`（讓顏色和畫法一致）

**老闆_普通**

```
[Character: the baker (麵包店老闆), silhouette]
Format exception: this character appears only as a silhouette, exactly like the attached silhouette of the old fisherman: draw the whole figure as one solid, flat deep-navy shape (#16244a), with no interior lines, no facial features, no shading, no highlights and no glow, on a plain flat light-grey background (#d0d0d0). All other framing rules stay the same: 1024x1536 canvas, full body filling about 90% of the height, centered, eye-level camera.
Style: the outline must still read as a 1990s anime cel character, drawn with the same proportions, anatomy and clean, confident edges as the attached style reference, just filled in with one solid color. Not a cut-paper or shadow-puppet look.
Who: the owner of the only bakery in a small seaside town, a man in his late forties; sturdy, practical and kind, a man of few words.
The silhouette must show, from the outline alone, that he is a baker, and it must look clearly different from the old fisherman:
- a tall, puffy chef's toque on his head,
- upright, straight posture, not stooped,
- a solid, slightly plump build with thick forearms,
- a short-sleeved shirt with the sleeves rolled up,
- a long apron tied at the waist and reaching the knees, the apron strings visible at the back,
- one hand holding a tray of round bread loaves at chest height (the loaves make small round bumps along the top edge of the tray), the other arm hanging naturally,
- plain work trousers and simple shoes.
Pose: body turned slightly to one side (three-quarter view), so the toque, the apron and the tray of bread show clearly in the outline.
```
