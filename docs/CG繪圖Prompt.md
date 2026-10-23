# 劇情 CG 繪圖 Prompt（1980 年代日本手繪賽璐璐動畫）

共用規則見 [繪圖準則](繪圖.md)：**確認主要角色都能明顯看出是成年女性**，包括遠景與道具遮擋時的肩頸、軀幹、四肢和頭身比例；承完的少年氣不代表少女身形。

依據目前 `script/` 主線與人魚篇逐一整理，共 **13 張：01、02、05～14、16**。03「沙灘救援」與 04「姐姐」已移除 CG 演出，劇情文字保留；劇本沒有 CG 15，其餘編號不變。檢索攝影參考日期：2026-10-23。

中文是導演說明；英文區塊是給繪圖 AI 的指令。每次使用「共用總規格＋出場角色造型卡＋單張場景 Prompt」，並附參考圖。本文件列出目前需要製作的 CG；已移除的 04 試作另保留歷史紀錄。

## 一、製作方式與全組一致性

1. **先定角色，再畫事件**：附上現有動畫角色圖，先製作並確認本組的 1980 年代版本造型母圖，包括正面、四分之三側面、側面及固定配色。母圖是製作參考，不是新增遊戲 CG。不以真人照片重新設計角色的臉。
2. **固定參考組**：每張附同一張已確認的「1980 年代風格母圖」和本張出場人物的造型母圖；換對話也重新附上。人物辨識優先採 `script/角色設定.md` 與下方最新特徵；服裝、髮型的劇情變化看各張說明。
3. **照片單獨標記為構圖參考**：只借人物相對位置、視線、手勢、前後景、明暗面積。照片中的性別、臉、髮型、衣著、年代與場地都不帶入。不是每張都要照搬情侶擁抱：母女命令、姊妹施壓、朋友安慰也有不同的互動語言。
4. 先以雙人造型母圖確認臉型，再畫 **05、06、13** 校準俯仰角、濕髮、夜景與清晨。定稿後其餘圖都沿用同一組母圖，不把每張新 CG 當作新的角色設計來源。
5. 建議先出 16:9 構圖草稿，確認動作、服裝與分支，再出正式圖。最終 **1920×1080 PNG**；放進 `game/assets/cg/`，檔名如 `05.png`，執行 `build.bat`。同一編號只留一個正式檔案，避免舊 JPG 與新 PNG 並存而讀到舊圖。
6. **承完的毛巾與哨子只限海邊場景可出現**：沙灘、海面、礁石海岸、臨海堤防舞台可按劇情保留；酒吧、浴室、臥室、救生站小屋室內及道路草地都移除她身上的毛巾、哨子與掛繩。窗外看得到海不算海邊場景，參考立繪上的配件也不能直接照搬。CG 06 擦頭髮後留在長椅上的毛巾是劇情道具，可保留，但不能掛在承完身上。
7. 關鍵臉、觸碰點與道具放在畫面高度約 **15%～68%**；下方約四分之一保留較安靜的水面、衣料或地面，避免對話框遮住情緒。這不是背景立繪舞台，不套固定四分之一地平線，也不要求每張全身站姿。

**風格優先順序**：這一組 CG 明確採 **1980 年代日本動畫電影／OVA 的手繪賽璐璐風**。既有立繪文件的 1990 年代與背景文件的像素風，不作為本組 CG 的材質指令；只取既有角色身份和場景地標。所有 CG 的人物與背景都要統一到本組 1980 年代美術規格。這是 CG 文件的規格，不代表現有立繪素材已經重畫。

### A. 共用總規格（每張先貼）

```text
Create ONE cinematic event illustration for a romantic fantasy visual novel, as a frame from the SAME 1980s Japanese hand-drawn animated feature / OVA production as every other image in this series.

ART DIRECTION — 1980s JAPANESE HAND-PAINTED CEL ANIMATION:
Confident hand-inked dark contours with subtle natural variation; mature, anatomically coherent adult character designs; expressive but restrained eyes and facial acting. Opaque flat cel-paint colors with one or two sharply separated shadow shapes. Angular, economical highlights on hair and fabric. Fine facial detail must remain clearly drawn, not photorealistic.
Characters should read as separately painted cels over a hand-painted gouache / watercolor background: atmospheric painted environments, carefully designed value masses, restrained brush texture in the BACKGROUND, clean flat paint on the CHARACTERS. Subtle film grain and slight analog softness only; preserve sharp facial identity and readable hands. No fake scratches or heavy distressed overlay.
Use a coordinated palette of deep indigo, muted teal, warm ivory, chestnut and restrained amber; adapt local illumination to each scene without changing the characters' underlying hair, eye or skin colors. Draw glow, rain, sea foam and water reflections as economical hand-painted animation effects, not digital particles or glossy CGI.
NO modern moe style, teenage redesign, chibi, 1990s TV-anime restyling, contemporary glossy anime rendering, digital airbrush skin, photorealism, 3D/PBR, pixel art, vector-flat infographic, oil-painted characters, neon bloom, lens flare or photographic bokeh circles.

IDENTITY LOCK:
The attached approved 1980s style master controls rendering. The attached approved character model sheets control face geometry, adult age, hair silhouette, eyebrow thickness, proportions and local colors. The written scene controls temporary costume and pose. Composition photographs control ONLY blocking, gesture, viewpoint and visual rhythm: never copy their real faces, genders, clothes or photographic rendering. Draw original anime faces with consistent identity across ALL scenes and angles.
SEUNGWAN ACCESSORY RULE: her lifeguard towel, whistle and whistle lanyard are allowed ONLY in scenes physically on the beach, at sea, on shoreline rocks or on the seafront breakwater stage. In the bar, bathroom, bedroom, indoor lifeguard hut and roadside grass, REMOVE her towel, whistle AND lanyard, even if the character reference shows them. Seeing the ocean through a window does not qualify. In CG 06 only, the story towel lying separately on the bench may remain as a scene prop, never worn by Seungwan.
Bae Joohyun's eyebrows are noticeably THICKER, FULLER and DARKER than the other characters' eyebrows. Keep that distinction even in profile, rain or shadow. She has NO facial mole or beauty mark: remove any mark shown in older references.

OUTPUT AND STAGING:
One 1920x1080 landscape illustration, 16:9, one continuous scene and one frozen moment; no panels, montage, caption, subtitle, logo, signature, watermark or interface.
Stage the faces, the important hand contact and the story prop above the lower dialogue area. Use motivated perspective and coherent bodies, two arms per person, correct hand ownership, no fused fingers or duplicated limbs. Keep foreground, midground and background readable without photographic depth-of-field blur.
Only include the people specified in the scene. All romantic leads are adult women, not a man and a woman. No nudity or transparent wet clothing; intimacy is conveyed by gesture, breath, gaze and framing.
ADULT DESIGN CHECK: all principal human / mermaid women must visibly read as adults of their established ages, including in distant shots. Use mature head-to-body, shoulder/neck, torso, pelvis, limb and hand proportions, without juvenile oversized heads or short torsos. Seungwan is a sturdy athletic 32-year-old woman with a swimmer's build; boyish charm does not mean a teenage body. Preserve individual physiques; do not substitute exaggerated curves or makeup for mature anatomy.
Joohyun cannot shed tears before the curse is lifted: reddened eyes are allowed, but NO falling tears or pearl tears except in CG 13. Rainwater is not a tear trail. Preserve this distinction.
```

### B. 角色造型卡（只貼本張出場者，但每次都貼）

| 角色 | 必須固定的識別點 | 劇情變化／美術補充 |
|---|---|---|
| 裴柱現 Joohyun | 成人女性，外觀約 35 歲；眉毛明顯比其他角色粗、濃、深；深褐眼、眼尾微挑；白皙珍珠感膚色；**沒有痣**；藍黑直長髮至腰 | 人類基準為白色無袖長洋裝、赤腳；人魚是白色無袖上衣、湛藍單尾、半透明淡藍薄紗尾鰭。盤髮、制服、祭典長衫、借穿 T 恤見單張，不能每張都硬套白洋裝。 |
| 孫承完 Seungwan | 32 歲成人女性；栗色蓬鬆中長捲髮，垂過肩；褐眼、開朗少年氣；結實的游泳者身形；眉毛比柱現細 | 基準制服深藍 POLO、白邊紅短褲；**只有海邊場景可保留毛巾、哨子與掛繩，其他場景一律拿掉**。非值班服裝劇本未指定時，本組延用無商標深藍短袖上衣＋紅短褲，作美術統一補充，不擅自增加時裝。白髮依路線處理，不全組固定添加。 |
| 凱蒂 Katie | 銀白直長髮，與柱現有家族相似感但臉部線條更銳利、眉毛較細、目光冷冽 | 本組沿用立繪 Prompt 的冰灰藍眼、深夜藍高領無袖上衣、銀色尾巴；第六章尾巴比柱現大一倍。不是柱現的銀髮換色複製品。 |
| 潮后 Tide Queen | 成熟的母親、深紫長髮、珊瑚王冠、雕像般冷靜的臉 | 沿用立繪 Prompt 的深紫上衣與紫色魚尾，珊瑚與珍珠飾件。母女都成人，不能畫成女王與小女孩。 |
| 阿英 A-Young | 31 歲、高個子、俏麗短髮、銳利眼神、冷淡中護短；**左腰英文刺青** | 沿用立繪 Prompt 的芥末黃無袖上衣、海軍藍短褲。衣服與構圖遮住腰時不必硬露刺青；禁止移到手腕，也不要高馬尾。 |
| 康 Kang | 32 歲成人女性、圓臉、淺棕髮隨手一顆包包頭；花襯衫、夾腳拖，常拿食物 | 氣氛熱情天然呆；不要畫成男性、雙丸子頭或幼童。 |
| 珊婆 Granny Shan | 主線是背粉紅螺殼的小寄居蟹 | CG 07 在柱現肩上舉鉗；CG 11 在承完肩上。不是老人站在旁邊，也不是一般大螃蟹。 |

```text
CHARACTER MODEL LOCK — paste the entries for the characters visible in this scene:
JOOHYUN / BAE JOOHYUN: mature adult woman, apparent age about 35, exceptionally beautiful with a subtly handsome edge. Waist-length straight blue-black hair with deep-blue painted highlights; deep-brown slightly upturned eyes; noticeably thicker, fuller, darker eyebrows than every other character. Fair pearly skin, natural lips, NO facial mole or beauty mark. Human base: opaque white sleeveless long dress, barefoot. Mermaid base: opaque white sleeveless top, ONE azure-blue scaled tail with a translucent pale-blue gauze-like fin, no legs. Preserve her face when the scene specifies a different costume or hairstyle.
SEUNGWAN: mature 32-year-old woman, fit sturdy swimmer's build, warm brown eyes and cheerful slightly boyish charm. Fluffy chestnut-brown medium-length curls falling just past the shoulders, not long straight hair or a short bob. Eyebrows visibly finer than Joohyun's. Base outfit: regular-length navy polo without logos, red athletic shorts with white trim. Towel, whistle and whistle lanyard are optional ONLY in actual seaside scenes; REMOVE all three in indoor scenes and on roadside grass, regardless of the reference outfit. Never redesign her as a man. Do not add grey hair unless a scene variant explicitly requests it.
KATIE: adult mermaid princess, Joohyun's elder sister; waist-length straight silver-white hair, a related but sharper face, narrower icy grey-blue eyes and finer brows. Deep midnight-blue sleeveless high-neck top, powerful silver tail with translucent silver-white fin. Her tail is about twice the size of Joohyun's in the storm scene. No crown unless explicitly specified.
TIDE QUEEN: mature adult mother of Joohyun, with a clear family resemblance; very long deep-purple hair, branching coral crown, impassive sculptural face. Deep-purple sleeveless upper garment, pearl ornaments and a majestic purple mermaid tail. Regal restraint rather than a villain's theatrical sneer.
A-YOUNG: tall adult woman, 31, chic short dark hair around jaw and nape, sharp observant eyes, reserved protective manner. Mustard sleeveless top, navy shorts, black sandals. Small English-script tattoo only on her own left waist if that area is visible; no wrist tattoo, no ponytail. No invented readable slogan.
KANG: adult woman, 32, round face, light-brown hair in ONE casual bun, floral Hawaiian shirt, casual trousers and flip-flops; enthusiastic, slightly slow to react, usually holding food. Never male or childlike.
GRANNY SHAN: a small hermit crab with a pink spiral conch shell and expressive old-lady eyes; tiny relative to the women's shoulders, no human body in the main-story scenes.
```

## 二、攝影構圖參考庫

以下連結是已找到的具體作品頁，不是搜尋結果頁。對作品的用途是**本文件的構圖改編建議**，不是說照片本身就演出了劇情。部分參考為不同性別的搭配或單人近景，只借幾何關係與手勢；成圖人物以角色卡為準。來源以攝影作品為主，沒有拿 AI 動漫圖作角色母圖。

| 代號 | 作品頁／作者 | 借用元素與適用圖 |
|---|---|---|
| R1 | [Two Women Looking at Each Other — Katia Damyan／Pexels](https://www.pexels.com/photo/two-women-looking-at-each-other-13995939/) | 兩名女性隔桌對望的交流結構；改成 01 的權力距離。照片是戶外咖啡桌，王座由劇情重設。 |
| R2 | [A Couple Lying on Green Grass while Looking at Each Other — Rahul Lavhande／Pexels](https://www.pexels.com/photo/a-couple-lying-on-green-grass-while-looking-at-each-other-11709054/) | 草地上靠近的兩張臉、低視線與親密距離；05 改成一人仰躺、一人用手支撐在上方。原照片不是救援示範。 |
| R3 | [Photo of Kissing Couple Standing by Window — Andrea Piacquadio／Pexels](https://www.pexels.com/photo/photo-of-kissing-couple-standing-by-window-3756446/) | 室內雙人接吻的側向輪廓、窗框包圍；06 改成夜間小屋，09 改成坐在床緣，不能照搬站姿與白天光線。 |
| R4 | [Two women in red embrace with foreheads touching — Fellipe Ditadi／Unsplash+](https://unsplash.com/photos/two-women-in-red-embrace-with-foreheads-touching-pIuGGmNGG5g) | 額頭與手臂形成的親密閉合輪廓；09 的靠近關係、13 的擁抱與臉部對位。這是有 Unsplash+ 授權標記的作品，使用原圖依頁面方案；不需要購買才能理解本文件的文字構圖。 |
| R5 | [A close up of two people holding hands — Adrian Ordonez／Unsplash](https://unsplash.com/photos/a-close-up-of-two-people-holding-hands-VqGJD-cEASA) | 手部接觸作視覺焦點；08 改為托住前臂，11 改為攤掌遞刀，16 改為握住珍珠。不是每張都十指交扣。 |
| R6 | [Couple embracing in the ocean at sunset — Fotógrafo Samuel Cruz／Unsplash](https://unsplash.com/photos/couple-embracing-in-the-ocean-at-sunset-I7S-VdIKyqM) | 雙人與水面重疊的關係、環境包圍感；10 改為相隔的岸邊與礁石，13 改為黎明擁抱。檢索摘要可讀，作品頁再次開啟曾回傳 429；不能當成已確認每個手指位置的精確姿勢樣板。 |
| R7 | [Woman with guitar raises hand, audience member raises hand／Unsplash](https://unsplash.com/photos/woman-with-guitar-raises-hand-audience-member-raises-hand-ySbPRcSh49o) | 表演者與觀眾的跨距離呼應；02、07 保留視線連結，不採照片的舉手動作。作品頁重開未成功，依檢索中的作品標題與影像描述選作方向參考。 |
| R8 | [Silhouette Photo of a Person Standing on the Sea under Cloudy Sky — Hilal G. D.／Pexels](https://www.pexels.com/photo/silhouette-photo-of-a-person-standing-on-the-sea-under-cloudy-sky-4481083/) | 人物與大海的尺度、空間留白；12 擴展為暴風雨抉擇，14 用於獨自傾聽海面的氛圍。這是單人參考，不強加第二名戀人在場。 |
| R9 | [Woman putting on decorative golden necklace — Mariam Antadze／Pexels](https://www.pexels.com/photo/woman-putting-on-decorative-golden-necklace-6431183/) | 頸後扣項鍊的手勢；16 重新設計為柱現替承完戴珍珠項鍊的雙人畫面。照片偏後頸細節，成圖須補足兩人的表情。 |

拍攝角度、色塊與手勢會依劇情重新組合，不逐像素臨摹。若繪圖工具需要圖片輸入，從作品頁取得符合其授權方式的參考圖，並明確標為 `COMPOSITION ONLY`；單貼網址不代表工具一定能讀到圖片。

## 三、全部 CG 與劇情瞬間

| 檔名 | 劇本位置 | 人物／形態 | 本張擷取的瞬間 |
|---|---|---|---|
| `01.png` | 人魚篇 Z0-1 | 潮后、柱現／皆人魚 | 女王在王座上平靜下令，柱現在下方聽命 |
| `02.png` | 第一章 1-2 | 海中央的柱現頭肩剪影／形態不揭露 | 承完的岸邊視角，遠處人魚窺探，五官不可辨認 |
| `05.png` | 第二章 2-4A | 承完、柱現／人類 | 摔進草地後，柱現支撐在承完上方對望 |
| `06.png` | 第三章 3-4 | 承完、柱現／人類 | 小屋內急切生疏的吻，手移到後頸 |
| `07.png` | 第四章 4-3A | 承完、柱現、珊婆，群眾簡化 | 舞台上的歌與後排的她相連，海灣開始發光 |
| `08.png` | 第四章 4-5 | 承完、柱現／人類局部長鱗 | 浴缸邊伸出手臂，等待承完反應，尚未選擇追問與否 |
| `09.png` | 第四章 4-6A／B | 承完、柱現／人類 | 床緣貼近的吻，作兩條路線可共用的中性情緒瞬間 |
| `10.png` | 第五章 5-1A | 承完、柱現／人魚 | 礁石上回頭展示完整魚尾，承完仍在岸邊 |
| `11.png` | 第六章 6-3 | 凱蒂／人魚、柱現／人類；承完後景 | 攤掌展示貝刃，柱現尚未接刀 |
| `12.png` | 第六章 6-4C | 承完主體 | 站在浪邊、尚未衝出或留下的抉擇 |
| `13.png` | 結局 E1 | 承完、柱現／人魚 | 黎明海中轉身相擁，第一顆珍珠落進手心 |
| `14.png` | 結局 E2-2 | 承完、阿英；康可遠景 | 一年後承完把海螺貼耳，朋友靜靜陪伴 |
| `16.png` | 結局 E1-4 | 承完、柱現／人類；好友可遠景 | 一年後替承完戴上第一顆眼淚做的珍珠項鍊 |

### 01｜海底王座

**前後文**：母后命令柱現在成年潮前帶回人類歌息，態度像吩咐採果子。凱蒂是在 CG 結束後才游到柱現身旁，本張不搶先安排她站到主角旁。

**構圖參考**：R1 的雙人對視關係，改為上下階差與留白；不是浪漫對望。鏡頭在柱現後側四分之三位置，讓她的側臉與母后正臉都讀得到。

```text
CG 01 — UNDERSEA THRONE. Apply the shared 1980s cel-animation specification and the JOOHYUN and TIDE QUEEN model locks.
One quiet, imposing underwater throne room deep in a trench, with NO sunlight. On the upper-right third, the Tide Queen sits erect on a coral throne, her purple tail gathered beneath the seat, expression calm and practical as she gives an ordinary-sounding but chilling command. On the center-left foreground, Joohyun in mermaid form hovers upright facing her mother; show a readable three-quarter profile, thick brows, white sleeveless top and azure tail curling down and inward.
Create a diagonal eye-line across a deliberately wide gap of dark water and worn stone steps: familial resemblance, emotional distance, unequal power. The queen's hand rests almost casually on the throne arm; Joohyun listens, proud but constrained, not kneeling as a human with legs. Only these two women.
Blue and white luminous coral provides the only motivated light. Draw sparse drifting sediment and dim columns as painted atmosphere, not glowing digital particles. Deep indigo negative space, ivory faces, restrained coral accents. Both faces and the queen's small commanding gesture above the dialogue zone. No sunbeams, no romantic embrace, no giant palace crowd.
```

### 02｜營火邊的歌聲

**最新構圖（依作者草圖）**：承完在岸邊望向海面，畫面不出現承完、吉他與營火。天空、海面、下緣一小段沙灘形成三層；柱現在海中央窺探，只露出遠處暗色頭肩輪廓，**完全看不清五官**，不揭露魚尾。保留 1980 年代手繪動畫風，草圖只決定構圖，不照抄簡筆色塊。

**已確認採用**：長髮入海版已放入 `game/assets/cg/02.png`；原始樣圖保留於 `img/CG試作/02_營火邊的歌聲_長髮入海.png`。[實際修改 Prompt](CG02_海中央窺探_修改Prompt.md)。

```text
CG 02 — A DISTANT LISTENER IN THE SEA. Apply the shared 1980s hand-painted cel-animation style.
View from the beach looking straight out over the night ocean, at eye level. Wide landscape composition: a large indigo sky with two restrained cloud groups, a level horizon, a blue ocean middle layer and a narrow brown-ochre sand strip along the bottom. Keep the camera and horizon level.
Exactly one small distant mermaid head-and-shoulder silhouette floats near the horizontal center, beyond the breaking surf, quietly observing the unseen people on shore. This is Joohyun, with waist-length straight blue-black hair draping past her shoulders into the sea, lower lengths submerged and hidden by the waterline and ripples, no blunt shoulder-length ends above water; her face is entirely lost in distance and deep shadow. NO recognizable eyes, nose, mouth, expression, skin detail or glowing eyes. A faint cool edge may define the silhouette without revealing the face. She faces toward the shore to listen, not away toward the horizon. Show no tail, legs, scales or body below the shoulders.
Seungwan is the unseen viewpoint. No foreground person, guitar or visible campfire. A faint warm offscreen fire tint may touch the foreground sand. Economical silver wave marks, dark blue water, painted night clouds, quiet negative space and a single mysterious listener. No magical glowing sea yet. Keep the lower quarter quiet for the dialogue overlay. No text, UI or watermark.
```

### 05｜腳踏車特訓

**已確認採用**：「不笑、保留紅暈」版已放入 `game/assets/cg/05.png`；原圖保留於 `img/CG試作/05_腳踏車特訓_不笑保留紅暈.png`。[生成與修改紀錄](CG05_試作生成Prompt.md)。

**前後文**：黃昏海岸道路，柱現回頭發現承完放手，轉彎撞過去，兩人倒在草地。CG 的重點是摔倒後的貼近與「下次不准再放手」，不是正常騎乘風景照。

**構圖參考**：R2 的草地近景；改成承完仰躺，柱現手臂支撐上半身，頭髮形成圍住兩張臉的簾子。腳踏車只作事件線索。

```text
CG 05 — BICYCLE LESSON. Apply the shared style and the SEUNGWAN and JOOHYUN model locks.
SEUNGWAN COSTUME OVERRIDE: no towel on her neck or shoulders, no whistle, no whistle lanyard. Remove these accessories from the reference design for this scene.
Golden dusk beside a quiet coastal road. On a small patch of roadside grass, Seungwan lies on her back, chestnut curls spread loosely, looking up with her original gentle, slightly surprised gaze, pink cheek blush retained, but no smile: lips softly parted with neutral mouth corners, momentarily speechless. Joohyun, still in her opaque white sleeveless long dress and barefoot, has fallen partly above her and supports her own upper-body weight with her hands planted on the grass beside Seungwan's shoulders. Do not pin or crush Seungwan.
Use a low oblique side view, close enough to read BOTH original adult faces. Keep the approved original close composition; the later wider framing trial was rejected. Joohyun's long blue-black hair falls in a curtain around their nearly touching faces, enclosing a private triangular space. Her brows are bold, her cheeks faintly pink, her mouth a stubborn little complaint; Seungwan keeps a gentle, surprised gaze and faint pink cheek blush; her lips are slightly parted without a smile. Do not exaggerate tension in her eyes or brows. They are not yet kissing.
A fallen step-through city bicycle lies safely to the rear side, one elevated wheel tilted in a clean circular silhouette; show only one coherent bicycle. The sunset sea is a thin warm band beyond the road. Keep faces and the hair curtain in the upper-middle frame, skirt and grass opaque and modest, no exaggerated straddling, no upskirt view, no injuries, no tears.
```

### 06｜雨夜之吻

**已確認採用**：「小屋暗燈版」已放入 `game/assets/cg/06.png`；原圖保留於 `img/CG試作/06_雨夜之吻_小屋暗燈版.png`。柱現遠側肩膀由長髮遮住，兩人維持閉眼，室內暖光較暗。

**肢體與上色補充**：柱現近側手臂須由肩膀、手肘、手腕連到承完後頸；承完近側手臂由袖口連到柱現腰側，遠側手臂自然遮擋，避免多餘手掌與難辨歸屬的手指。人物採平塗底色加一層主要硬邊陰影；髮亮面只留少數整塊色帶，刪除皮膚水珠亮點、柔光漸層及衣服細碎陰影。最新修訂見 [試作紀錄](CG06_試作生成Prompt.md)。

**前後文**：吻發生在**救生站小屋內**。毛巾已從柱現頭上滑落，衣領上的手移到後頸；吻急切生疏，承完扶她的腰。兩個選擇最後都匯入這一吻，不指定誰先主動。

**構圖參考**：R3 的窗邊側面接吻，換成昏黃燈與窗外雨；不是兩人站在外面淋雨，也不加傘。

```text
CG 06 — RAIN-NIGHT KISS. Apply the shared style and the SEUNGWAN and JOOHYUN model locks.
CEL-PAINT PRIORITY: on each character material, use one opaque flat base color plus one main flat hard-edged shadow tone. Simple broad shadow masses, sparse angular hair highlight bands and a handful of clothing folds. No glossy skin, water-droplet glints, soft gradients, reflected rim lights or intricate fragmented shading. Keep the background painterly but visually restrained. Clearly connect each visible arm from its owner's shoulder through one elbow and wrist to its hand; naturally occlude far arms without adding stray hands.
SEUNGWAN COSTUME OVERRIDE: no towel on her neck or shoulders, no whistle, no whistle lanyard. Remove these accessories from the reference design for this scene.
Inside a cramped lifeguard hut at night, NOT outdoors. A wooden bench, a plain locker and one weak amber lamp; cold indigo rain runs down the small window and beats on the metal roof outside. An opaque white towel has slipped onto the bench beside them.
Compose a tight side-three-quarter two-shot from the waist upward, both faces readable in a shared diagonal. Seungwan and Joohyun lean close in an awkwardly urgent closed-eye kiss. Joohyun's wet blue-black hair trails across Seungwan's forearm, one of her hands cradling the back of Seungwan's neck with fingers entering the chestnut curls. Seungwan's hand rests supportively at Joohyun's clothed waist. Specify separate, traceable arms and natural neck angles.
Seungwan wears her navy duty polo; Joohyun's white sleeveless dress remains completely opaque despite damp fabric. Their expressions convey inexperienced urgency and mutual closeness, not a polished fashion pose. The amber lamp picks out cheeks and fingers with simple cel highlight shapes against cool window colors. No umbrella, no rain falling inside the hut, no tears or pearl effects, no nudity or open-mouth anatomical detail.
```

### 07｜春潮祭舞台

**最新修訂**：承完須呈現明確的 32 歲成年女性身形，保留結實游泳者肩膀與成熟頭身比例，並**閉眼唱歌**。承完捲髮只剛過肩，不垂至胸前；前排觀眾頭肩須自然遮住麥克風底座與她的腳。最新試作為 `img/CG試作/07_春潮祭舞台_髮長與人群遮擋修訂.png`，尚未加入遊戲。

**前後文**：承完唱奶奶漁歌的路線才出現；她在舞台上，柱現在**人群最後面**，眼眶紅、摀嘴發抖，肩上珊婆舉鉗；海在舞台後方發光。柱現穿深藍白浪祭典長衫，盤髮加珍珠簪。

**構圖參考**：R7 的舞台／觀眾呼應。鏡頭放觀眾後側，柱現近景、承完遠景；背景海灣不能被搬到觀眾身後。

```text
CG 07 — SPRING TIDE FESTIVAL STAGE. Apply the shared style and the SEUNGWAN, JOOHYUN and GRANNY SHAN model locks.
Night festival on a small fishing-port seawall. The stage is at the seaward end of the breakwater, with the SEA BEHIND THE STAGE. Camera stands at the rear-side of the audience, near Joohyun, looking diagonally toward the stage and bay.
Joohyun occupies the right foreground in readable three-quarter profile, looking toward Seungwan across the audience. She wears a deep-blue festival robe with white wave patterns, an imperfectly tied sash, hair pinned up with a small pearl hairpin. Her thick eyebrows and reddened but DRY eyes remain clear; one hand covers her mouth as she trembles. The tiny pink-shelled hermit crab on her shoulder raises both claws.
Seungwan is the smaller but clearly identifiable ADULT WOMAN on the center-left stage, singing with her eyes gently CLOSED, absorbed in the song, while playing a wooden acoustic guitar. Preserve her fluffy medium-length chestnut curls ending JUST PAST THE SHOULDERS, not extending down her chest or upper arms, and the navy-and-red outfit. Show a mature 32-year-old swimmer's build: balanced adult head size, strong shoulders, adequate torso length, proportionate arms, hands and adult legs. Keep the guitar at a believable adult-instrument scale. She faces the audience, not the glowing sea. Between them, simplify townspeople into restrained painted silhouettes, not individually redesigned leads. Front-row heads and shoulders must naturally occlude the microphone stand floor base and Seungwan's feet; the upper microphone pole remains visible and disappears behind the audience before reaching the stage floor. Do not obscure her face, guitar or playing hands.
Behind the stage, the bay begins to glow in pale-blue hand-painted bands with the song. Warm paper lanterns dim toward the rear audience so Joohyun stays partly outside their reach, with the sea supplying a soft cool edge. Build a visual eye-line between singer and listener. No modern concert lasers, no phone screens, no Joohyun onstage, no tears or pearls.
```

### 08｜手臂上的鱗片

**前後文**：海浪打濕後，柱現坐浴缸邊伸出手臂，**手肘至手腕**是湛藍鱗片；此圖在「不問／追問」選項之前。用等待的瞬間，不提前畫完沖水、擦乳液或擁抱。

**服裝銜接**：同一夜先穿祭典長衫，劇本又寫濕長裙；本組畫成鬆落的長衫、袖子推至肘上露出前臂，不自行換成白洋裝。借 T 恤要到下一張。

**構圖參考**：R5 的手部視覺焦點，改為承完托住前臂；不是戀人十指緊扣。

```text
CG 08 — SCALES ON HER ARM. Apply the shared style and the SEUNGWAN and JOOHYUN model locks.
SEUNGWAN COSTUME OVERRIDE: no towel on her neck or shoulders, no whistle, no whistle lanyard. Remove these accessories from the reference design for this scene.
A small, ordinary bathroom in Seungwan's lighthouse-side home at night. Joohyun sits fully clothed on the edge of the bathtub, her soaked dark-blue white-wave festival robe loosened but opaque, one sleeve pushed above the elbow. Her long blue-black hair has come loose after being soaked. Avoid a bathing or undressing composition.
Use a close diagonal two-shot: the exposed forearm crosses the center of the image ABOVE the dialogue zone, from elbow to wrist covered in neat, fingernail-sized azure scales. Render blue, pale-blue and silver shifts as selected hard-edged cel colors, not rainbow glitter. Seungwan crouches or sits alongside, ONE open hand gently supporting the underside of that forearm without hiding the scales. Her other hand stays separate and relaxed.
Both faces appear above the arm: Joohyun looks at Seungwan with bitten lip and tense, dry reddened eyes, waiting to be rejected; Seungwan looks at the arm with quiet wonder rather than disgust. Freeze the offering-and-waiting moment BEFORE either questioning her or beginning to wash the scales away. A tap can be running into the tub in the background, but no shower stream touches the scaled arm yet. Warm bathroom light, muted tiles, no blood, no wounds, no tears, no mermaid tail.
```

### 09｜燈塔之夜

**前後文與共用限制**：高心動路線是歌聲與溫柔的吻；另一條是誘音、藍光與採息。兩條都呼叫 `09`，因此正式版選「接吻時的近距離雙人鏡頭」，不把柱現定成邪笑或把承完畫成已昏睡。房間在燈塔旁的小屋裡，不是燈塔頂。

**服裝**：柱現已換上承完的舊 T 恤與運動褲，濕的祭典服不再穿。顏色未指定，本組補為米白舊 T 恤、深灰運動褲。她的眼睛本色仍為深褐色。

**構圖參考**：R3 的側面吻、R4 的臉與手形成閉合輪廓。若將來要兩種不同演出，可另做工作檔 `09A_溫柔.png`、`09B_誘音.png`；目前引擎只呼叫一張 `09.png`，本文件不改劇本呼叫。

```text
CG 09 — LIGHTHOUSE NIGHT, SHARED ROUTE IMAGE. Apply the shared style and the SEUNGWAN and JOOHYUN model locks.
SEUNGWAN COSTUME OVERRIDE: no towel on her neck or shoulders, no whistle, no whistle lanyard. Remove these accessories from the reference design for this scene.
Night inside the small bedroom of the cottage BESIDE the lighthouse. A simple bed close to a window; a broad, pale lighthouse beam passes across the wall, catching a portion of both faces against deep indigo shadows. Do not place the bed inside a lighthouse lantern room.
Frame an intimate chest-up two-shot at the bed edge, cropping the lower bodies so the image does not prescribe either route's later position. Joohyun in Seungwan's borrowed worn ivory T-shirt and dark-grey track pants leans toward Seungwan for a quiet kiss. Her hair is loose, long and blue-black. One cool hand rests against Seungwan's cheek, while Seungwan lightly supports her upper arm. Keep their eyes softly closed and expressions restrained: closeness with an unresolved undertone, neither a triumphant seductive grin nor a declaration of complete safety.
This SINGLE image must fit both the tender-song route and the later dangerous-humming route: show no blue eye-glow, no visible magic being extracted, no sleeping or unconscious Seungwan, no tears, no pearl necklace, no ending-specific promise. Preserve the thick-versus-fine eyebrow distinction and original faces. No festival robe or white dress in this scene, no nudity. Use a clean side-three-quarter silhouette and a small warm bedside accent, not photographic blur.
```

### 10｜月光下的魚尾

**前後文**：三月二十二日坦白路線，柱現主動入海、雙腿合為尾巴，坐礁石回頭自我介紹。牽手／愣住選擇還沒發生，承完不能已經牽住她。

**構圖參考**：R6 借水面與人物的關係，改成兩人相隔；岸邊承完較暗，礁石上的魚尾是完整視覺揭露。選已完成變身的一刻，避免同時出現雙腿與魚尾。

```text
CG 10 — MERMAID TAIL IN MOONLIGHT. Apply the shared style and the SEUNGWAN and MERMAID JOOHYUN model locks.
A deserted moonlit beach. Compose a low shore-side over-the-shoulder view: Seungwan's chestnut curls and a readable partial profile at left foreground, standing STILL on the shore. On a shallow offshore rock at center-right, Joohyun sits in her fully revealed mermaid form and turns back to look at Seungwan, brave but visibly waiting for a response.
Show Joohyun's entire SINGLE azure-scaled tail sweeping in an elegant S-curve from the rock through clear shallow water, ending in a translucent pale-blue fin. White sleeveless top, wet blue-black hair loose to the waist, bold dark brows, deep-brown eyes, no mole. The transformation is complete: NO human legs or extra feet. Moonlight and a few restrained luminous ripple strokes reveal scale edges without obscuring the body.
Keep a small visible gap of water between the women: Seungwan has NOT walked in or taken her hand yet, because that is the upcoming player choice. On dry sand near Seungwan, a canvas bag and tiny pink-shelled hermit crab can be secondary silhouettes. Silver moon path connects them spatially. The tail's principal curve and Joohyun's face remain above the dialogue region; no tears, no crown, no extra mermaids, no split transformation montage.
```

### 11｜貝刃

**前後文**：暴風雨礁石，凱蒂攤掌遞出貝刃，要求用人類性命換柱現活下去。**此時還沒接刀、丟刀或攻擊**。凱蒂是人魚，柱現此刻仍用人類形態；承完與肩上珊婆跟在後面。

**構圖參考**：R5 的手部視覺引導改為掌心與刀，R1 的面對面關係改成姊妹施壓。不是雙人浪漫互贈禮物。

```text
CG 11 — THE SHELL BLADE. Apply the shared style and the KATIE, HUMAN JOOHYUN, SEUNGWAN and GRANNY SHAN model locks.
Night storm at the rocks beneath the lighthouse. Build a tense diagonal composition around Katie's outstretched OPEN PALM in the upper-middle foreground. Rest a small blade flat across the palm: the blade is carved from ONE thin translucent shell with a pearly edge; the handle is wrapped with seaweed and set with ONE deep-blue bead. It is not a metal dagger or a sword. Keep the weapon clearly offered, not stabbing or held against anyone.
Katie's silver-haired, dry, severe face occupies one side above the palm, wearing her midnight-blue high-neck sleeveless top; part of her powerful silver mermaid tail is visible in the surf below the rocks. Her body and hair remain unnaturally untouched by rain. Opposite her, human-form Joohyun in her opaque white dress looks down at the offered choice with tense thick brows; her hand has NOT accepted the blade. Joohyun is wet from the storm.
Seungwan stands a step behind Joohyun, smaller in the secondary plane, navy polo and whistle visible, with the tiny pink-shell hermit crab gripping her shoulder. Keep her temples partly shaded so this shared pre-branch image does not decide whether she has route-specific grey hair. No prominent shell pendant determining the coming choice. Hard rain streaks, dark waves and a restrained lighthouse edge light frame the three figures. No blood, no attack, no tears, no crown on Katie.
```

### 12｜暴風雨中的救生員

**前後文**：承完站浪邊，想起父親與二十年來的救生員誓言。選項尚未決定要衝入海或目送，不能先畫游泳、擁抱、死亡或泡沫消散。

**構圖參考**：R8 的人海尺度和留白，改成夜間風雨。這張敘事需要獨立的救生員主體，不為了「雙人」硬把戀人拉回岸邊。

```text
CG 12 — THE LIFEGUARD IN THE STORM. Apply the shared style and the SEUNGWAN model lock.
A dark storm beach before dawn. A medium-wide three-quarter profile of Seungwan standing at the very edge of the breaking surf, not yet running or swimming. Her stance is braced against the wind, one foot near the wet-sand foam line and the other planted behind; hands tense at her sides. Face readable in the upper third, eyes fixed out to sea, fear held inside protective resolve.
Navy polo and red white-trimmed shorts whip in the wind; the whistle swings visibly against her chest on its lanyard. Her chestnut shoulder-length curls are soaked and windblown. Keep the temples partly in shadow, avoiding a definite route-specific grey streak. The duty towel need not remain around her neck in dangerous wind and water; do not invent a cape or lifejacket.
Let immense indigo waves and a ragged cloud mass occupy the direction of her gaze. A distant lighthouse can anchor the opposite side; broad pale sea-foam shapes lead the eye outward. Do not show a second close-up person, her father, a memory overlay, a drowning body or Joohyun's ending state. This is the held breath BEFORE the player's choice. No shell pendant placement that fixes the branch, no tears, no text, no lightning bolt bisecting the face.
```

### 13｜珍珠之淚

**前後文**：伴侶結局；承完唱完漁歌、魚尾已復原，暴風雲裂開見日出。柱現在懷裡轉身，首次落淚，淚珠變珍珠掉進承完手心。**唯一需要柱現落淚的 CG**。本路線採息為零，承完沒有採息造成的白髮。

**構圖參考**：R4 的雙人閉合輪廓＋R6 的水中擁抱；改成臉、落淚軌跡與手心三角構圖，珍珠不要像漫天魔法寶石。

```text
CG 13 — PEARL TEARS. Apply the shared style and the SEUNGWAN and MERMAID JOOHYUN model locks. This is the ONLY CG where Joohyun sheds tears.
Dawn in the now-calming luminous sea, after the curse has broken. Frame a close chest-up three-quarter embrace at water level. Seungwan supports Joohyun securely in the water; Joohyun has turned within that embrace to face her. Their faces are close but separated enough to show Joohyun's cheek and the hand below it. Both adult women are crying and smiling with relieved disbelief, not posing toward the viewer.
Joohyun's thick dark eyebrows, deep-brown eyes and original face remain clear. A small tear rolls down her cheek; ONE falling droplet becomes a small round white pearl just below her jaw, above Seungwan's gently cupped free palm. A second small pearl can already rest in that palm. Keep the supporting arm and receiving hand clearly owned by Seungwan. Do not fill the scene with floating jewels or draw a facial mole as a pearl.
Show a small coherent portion of Joohyun's fully RESTORED azure tail through the water at the side, with no dissolving flesh or amputated end. Her white sleeveless top is opaque; Seungwan's navy polo is soaked, chestnut curls unchanged with NO grey streak. Rain has stopped or thinned as warm gold breaks through retreating indigo clouds. Pale-blue sea-light from below and restrained dawn gold form flat cel highlights. The face–falling pearl–palm triangle stays above the dialogue zone. No necklace yet.
```

### 14｜海螺

**前後文**：朋友結局，一年後二月二十一日承完 33 歲，拾起白帶淡粉的海螺貼耳，聽到柱現學會的歌。柱現**沒有本人登岸**；阿英遞面紙、康慌張遞烤魷魚。可以用朋友的手進畫面，保留缺席戀人的位置。

**構圖參考**：R8 的面向大海留白；R5 改為朋友遞面紙的細小手勢。這裡的海螺是浪推來的完整殼，不是前面歌息容器的項鍊道具。

```text
CG 14 — THE CONCH. Apply the shared style and the SEUNGWAN and A-YOUNG model locks; KANG is optional only as a small background figure.
Night beach beside a low campfire, one year later on Seungwan's thirty-third birthday. A close seated portrait of Seungwan at center-left holding a whole ivory-white conch with a faint blush-pink interior to one ear. Her other hand rests lightly near her chest. Her brown eyes grow wet and her mouth breaks into a small disbelieving smile as she hears a familiar, clumsy song from inside the shell.
A-Young sits close enough to appear at one side in restrained three-quarter profile, short dark hair and mustard sleeveless top, quietly offering a folded tissue with one clearly owned hand while looking toward the sea. This is protective friendship, not a replacement romantic embrace. Kang may be a tiny, secondary floral-shirt silhouette holding a squid skewer by the fire; do not clutter the focal interaction.
Leave a deliberate open area of indigo sea in the direction of Seungwan's gaze: Joohyun is ABSENT, present only through the sound implied by the shell. No ghost, floating face, distant mermaid or split-screen cutaway. No visible grey temples locking an otherwise shared ending to a particular consumption route. Warm firelight on the shell and fingertips, cool dark sea beyond. A small lifebuoy-shaped cake may sit well below or behind the focal area; it is not the shell-shaped cake from the other ending. No musical-note icons or text.
```

### 16｜一年後的生日

**前後文**：伴侶結局一年後三月二十九日，柱現人類形態，吹完生日蠟燭，替承完戴第一顆眼淚做的珍珠項鍊。蛋糕是貝殼形，三十五根加一根小蠟燭，右下角缺一角；與 14 的救生圈蛋糕不同。

**構圖參考**：R9 的後頸扣鏈手勢，改成兩人並坐、柱現稍靠後；R5 改為承完在胸前握住珍珠。保留兩張臉，不只截頸部飾品。

```text
CG 16 — BIRTHDAY ONE YEAR LATER. Apply the shared style and the HUMAN JOOHYUN and SEUNGWAN model locks. A-YOUNG and KANG are optional soft background silhouettes only.
The same night beach and campfire one year after the happy ending, March 29. Compose a warm seated waist-up two-shot in a gentle three-quarter angle. Seungwan sits slightly forward at left; Joohyun sits close at her side and a little behind, in her familiar white sleeveless long dress with loose waist-length blue-black hair.
Freeze the end of the necklace-giving gesture: Joohyun's hands finish fastening a delicate plain chain behind Seungwan's neck, while Seungwan's own hand gently holds the SINGLE small round white pearl pendant at her upper chest. Keep the pearl small and precious, not a huge gemstone; show clear separate hands without extra fingers. Seungwan turns her face just enough toward Joohyun for both original adult faces to be visible, her eyes warm and moved. Joohyun smiles with shy pride, bold thick brows unmistakable, no new tears and no facial mole. Seungwan has no consumption-related grey hair on this happy-ending route.
Restrained amber campfire highlights on hands and pearl, quiet indigo sea behind, a few pale-blue concentric sea-light bands beginning in the distance as a subtle motif. In a secondary lower-side area, a shell-shaped birthday cake with a neat missing corner may hold the just-extinguished candles; if individually readable, use thirty-five normal candles plus one smaller candle, never numeral lettering. Do not let candle counting dominate the image. No mermaid tail on land, no magical floating pearls, no wedding costume, no text. The emotional focus is the first tear now kept close to Seungwan's heart.
```

## 四、定稿檢查

- [ ] 13 個正式編號全部對上劇本：01、02、05～14、16；沒有漏掉人魚篇 01，也沒有自行補上 15。
- [ ] 與同一組 1980 年代母圖並排：臉型、眉毛、眼睛畫法、輪廓線、硬邊陰影、背景筆觸及色盤一致；沒有某張變照片、3D、像素或現代柔光動漫。
- [ ] 柱現眉毛明顯比其他角色粗濃、全組沒有痣；承完是栗色過肩捲髮的成人女性；兩人不能交換髮型與臉。
- [ ] 承完只有海邊場景可保留毛巾、哨子與掛繩；05、06、08、09 身上都沒有這三項。06 長椅上的擦髮毛巾可作獨立劇情道具保留。
- [ ] 07 是祭典長衫＋珍珠簪，08 延續濕祭典服、頭髮鬆開，09 是借穿 T 恤運動褲；不是每張同一套白洋裝。
- [ ] 02 不提前露尾巴；10 是單一完整魚尾、不提前牽手；11 還沒接刀；12 還沒衝海；13 尾巴已恢復；14 柱現本人不在場。
- [ ] 09 的正式共用圖沒有路線專屬邪笑、藍色眼光或昏睡演出；若需要區分路線，另行修改劇本與素材呼叫後再拆圖。
- [ ] 只有 13 需要柱現的淚與珍珠變化，16 的珍珠已是項鍊；其他雨夜圖不能把雨水畫成落淚特寫。
- [ ] 水、濕衣與親密動作不造成透明衣料、錯位身體、多手、多尾或無支撐的姿勢；每隻手的主人與接觸點看得懂。
- [ ] 重要臉、鱗片、貝刃、海螺、珍珠與手部互動在對話框上方；1920×1080、單張連續場景，沒有文字、浮水印或 UI。
- [ ] 實際匯出後放進遊戲看一次：對話框是否遮住關鍵動作、手機是否完整呈現、連續切換時是否像同一部動畫。

文字規格與固定母圖能降低造型漂移，不能單靠一句「風格一致」保證每次生成。若臉或手勢出錯，以上一張合格母圖局部修正，修正後再回到同一套母圖校對；不要把錯誤圖繼續當作新的角色標準。
