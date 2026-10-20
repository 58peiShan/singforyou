# 背景繪圖 Prompt（高密度精細像素風）

這份是給繪圖 AI 用的 prompt，涵蓋 [背景清單.xlsx](背景清單.xlsx) 的全部 30 張背景。
風格參考：[gameartstyle「高密度精細像素」](https://gameartstyle.loopyhop.com/styles/detailed-pixel/)（代表作 Owlboy、Blasphemous、Children of Morta）。

- 中文說明是給作者看的，用來確認內容對不對。
- 灰底方塊裡的英文才是要貼給 AI 的 prompt（英文對繪圖 AI 最穩定）。

---

## 一、怎麼用

1. 開一個新對話，先貼「**A. 總規格**」整段，讓 AI 記住風格與規則。
2. 再貼某一張的「**場景 prompt**」，生圖。每張的 prompt 都是完整的，一次只要複製一塊。
3. **同一個地點的不同時段**（例如沙灘的白天／黃昏／夜），先畫一張滿意的（建議先畫白天版，細節看得最清楚），之後畫其他時段時**把它當參考圖一起上傳**。每段 prompt 開頭都已經寫好「有參考圖就照同一個構圖」。
4. 第一張整體風格滿意的圖，之後每次都附上當「風格參考圖」，30 張才會像同一個遊戲。
5. 用「**四、驗收清單**」檢查，再照「**三、尺寸處理**」把圖整理成 1920×1080。
6. 檔名照下面每張標題的檔名（直接複製，「・」和「」都是全形），放進 `game/assets/bg/`，雙擊 `build.bat`。

**建議順序**（出現次數多的先畫）：#6 → #13 → #3 → #18 → #25 → 其他。

**一次只能貼一段的工具**（例如 Midjourney）：用「**B. 精簡版**」接在場景 prompt 前面一起貼，後面加 `--ar 16:9`。

---

## 二、全系列共用規則

### 1. 尺寸與像素

| 項目 | 規格 |
|---|---|
| 最終尺寸 | **1920×1080**（16:9 橫向） |
| 像素格 | 以 **640×360** 的格子畫，每一格放大 **3 倍** = 1920×1080 |
| 存檔 | **PNG**（像素圖存 JPG，邊緣會出現髒髒的雜點） |

為什麼要固定 640×360：高密度像素風的重點是「每一顆像素一樣大」。AI 常會畫出大小不一的假像素，用固定格子整理過才會像真正的像素畫。

### 2. 構圖與透視

```
畫面高度（由上往下）
  0%        天空 / 天花板
 25%        地平線（視平線）＝ 立繪眼睛的高度   ← 每張都固定在這裡
 25%～72%   人物站立區、場景主體
 72%～100%  會被對話框蓋住：只放簡單的地面、沙、水

畫面寬度（由左到右）
  0%～37%   左側：可以放比較多細節
 37%～63%   中央直條：手機直拿時只看得到這裡 → 放「一眼認得出是哪裡」的東西
 63%～100%  右側：可以放比較多細節
```

1. **鏡頭**：站著的人的眼睛高度（約 160 公分），平視，相當於 35mm 標準鏡頭。不要廣角、不要魚眼、不要歪斜。
2. **地平線在上方 1/4**：立繪的眼睛大約在畫面上方 22～25% 處。地平線放在這裡，人物看起來才會「站在地上」，不會飄起來或陷進地裡。室內的消失點也放在這條線上。
3. **地平線一定要水平**；燈塔、門框、牆角、電線桿這些直立的東西一定要**垂直**，不能往內倒。
4. **室內用一點透視**：地板縫、天花板樑、吧檯邊這些往深處延伸的線，全部匯集到地平線上同一個點。
5. **斜坡**（商店街）：坡道的邊線匯到地平線**上方**的另一點；房子的窗框和屋簷仍然匯到地平線上的點。
6. **比例**：畫面正中央、離鏡頭約 3 公尺站一個 165 公分的人，頭頂大約在上方 10%，眼睛在地平線上，腳在最下緣。家具和建築盡量放在 5 公尺以外，人物前方要留一塊可以站人的空地。
7. **中央直條**放能認出地點的東西（燈塔、酒架、窗戶），放在人物**背後**的中景或遠景。被人物擋住一部分沒關係。
8. **畫面裡不能有人物、文字、浮水印、邊框或 UI**。招牌用圖案代替文字（AI 寫的字幾乎都是亂碼）。

### 3. 世界觀與時代（統一設定）

- **時代**：現代，但像一個停在 1990 年代的懷舊小漁港，跟 90 年代賽璐璐風的立繪互相呼應。有收音機、腳踏車、救生員無線電；沒有高樓、霓虹燈，看不到手機，汽車也很少。
- **地域感**：架空的溫暖海岸王國「蔚嵐國」，融合日本與台灣小漁港的感覺：水泥堤防加消波塊、鐵皮屋頂、木造和水泥的老店屋、電線桿、彩繪木漁船、祭典紙燈籠。
- **氣候與植物**：二、三月也溫暖的亞熱帶海岸。馬鞍藤、林投、被風吹斜的松樹、九重葛、扶桑花。
- **白鹽灣的沙是白的**，淺灘是透明的土耳其藍，往外變深藍。

**白鹽灣地圖**（讓每張圖的位置關係一致）：

- **海在西邊**：黃昏的太陽落進海裡（跟封面一致）。清晨的光從陸地那側來，所以**不畫太陽從海裡升起**。
- **北端是岩石岬角**，上面有白色燈塔和守塔小屋（承完的家）。從沙灘面向大海時，**燈塔在右手邊**（跟封面一致）。
- **礁石海岸**和**海蝕洞**在燈塔北邊。從那裡面向大海時，燈塔在左後方。
- **白沙灘**在中間，呈弧形；**救生站**（瞭望台＋鐵皮小屋）在沙灘中段。
- **堤防**沿著沙灘後方，從燈塔一路延伸到南邊的**漁港**；堤防最前端是**春潮祭舞台**；酒吧「**退潮**」開在堤防邊。
- **鎮上**在東邊的山坡；**商店街**往燈塔的方向上坡；**海岸道路**沿著海邊，往北看得到岬角上的燈塔。

**燈塔的長相（每張都一樣）**：白色圓柱塔身、黑色鐵製燈室與環形欄杆。旁邊是一棟白牆、深灰屋頂的小屋，坐落在長著斜松的岩石岬角上。

**色調**：
- 白天：土耳其藍到鈷藍的海、白沙
- 黃昏：琥珀、珊瑚粉、淡紫
- 夜晚：深海軍藍、月光銀、營火與燈籠的暖橘、燈塔光的奶油黃
- 暴風雨：石板灰、低飽和藍綠、白浪
- 深海：靛藍、會發光的青藍與珍珠白

---

### A. 總規格（每個新對話先貼這段）

```
You are making background art for a 2D visual novel set in Baiyan Bay, a small fishing town on the warm coast of a fictional kingdom. Every image in this series must look like it belongs to the same game. Follow these rules for every image I ask for.

STYLE: high-density detailed pixel art
- Densely detailed pixel illustration ("hi-bit" pixel art) with rich environmental detail, like the work of a skilled hand-pixel artist.
- Carefully shaped pixel clusters for sand, water, foam, stone, wood grain, foliage, fabric and metal. No random pixel noise.
- Stepped color ramps with hue shifting (shadows shift toward blue/violet, highlights toward warm yellow). About 48-64 colors per image, one cohesive palette.
- Soft, controlled lighting (glows, light shafts, reflections) built from flat pixel color steps. Dithering only in skies, fog and light falloff.
- One consistent pixel size everywhere: the image is drawn on a 640x360 pixel grid and upscaled exactly 3x with nearest-neighbor to 1920x1080. Crisp square pixels, hard edges, no anti-aliasing, no blur, no smooth airbrushed gradients, no mixed pixel sizes.
- Detail is concentrated in the mid-ground; the sky and the lower foreground stay simpler.

CAMERA AND PERSPECTIVE
- 16:9 landscape, 1920x1080.
- Eye-level camera at the height of a standing adult's eyes (about 1.6 m), looking straight ahead, natural 35mm lens. No wide-angle distortion, no fisheye, no tilted camera.
- The horizon line (eye level) sits 25% down from the top of the image and is perfectly level. In interiors, the vanishing point sits on this same line.
- All vertical lines stay perfectly vertical. All receding lines converge to vanishing points on the horizon line.
- Scale: a 165 cm woman standing in the center about 3 m from the camera would have the top of her head at 10% from the top, her eyes on the horizon line and her feet at the bottom edge. Furniture and buildings sit at least 5 m away; the ground in the center foreground is open, walkable space.

LAYOUT FOR THE GAME UI
- Characters will be placed in the center later: keep the central area calm, uncluttered and readable.
- On phones only the middle 25% of the width is visible: put the landmark that identifies the place in that middle strip, in the background behind where a character would stand.
- The bottom 28% will be hidden by a dialogue box: fill it with simple ground (sand, water, floor), no important details.

WORLD AND ERA
- Present day, but a sleepy seaside town that feels unchanged since the 1990s: no high-rises, no neon, no visible smartphones, very few cars.
- A blend of a small Japanese and Taiwanese fishing port: concrete seawall with tetrapods, corrugated tin roofs, old two-story wooden and concrete shophouses, utility poles with wires, painted wooden fishing boats, paper lanterns at festival time.
- Warm subtropical climate even in February and March: beach morning glory vines, pandanus shrubs, wind-bent pines, bougainvillea, hibiscus.
- Salt-white sand beach, clear turquoise shallows turning deep blue.
- Recurring landmark, always identical: a white cylindrical lighthouse with a black iron lantern room and gallery railing, beside a small white keeper's cottage with a slate-grey roof, on a rocky headland with wind-bent pines at the north end of the bay.
- The sea is to the west. Sunsets go down into the sea. At dawn the light comes from over the land, so never show the sun rising out of the sea.

ALWAYS AVOID
No people or characters (unless the scene asks for tiny distant silhouettes), no text, letters, numbers, logos, signatures or watermarks (signs use simple icons only), no frames, borders or UI, no photorealism, no 3D-render look, no painterly brush strokes, no flat vector style, no low-detail 8-bit look, no blur, no tilted horizon, no leaning or curved verticals.

Reply "OK" and wait for the first scene.
```

### B. 精簡版（一次只能貼一段的工具用，接在場景 prompt 前面）

```
High-density detailed pixel art background for a 2D visual novel, hi-bit pixel art, dense hand-placed pixel clusters, hue-shifted stepped color ramps, soft pixel lighting, crisp uniform square pixels on a 640x360 grid upscaled 3x nearest-neighbor, no anti-aliasing. 16:9. Eye-level 35mm camera, level horizon at 25% from the top, vertical lines vertical, calm uncluttered center. Empty scene, no people, no text. Nostalgic 1990s-feeling subtropical East Asian fishing town, white sand bay, white lighthouse with black lantern room on a rocky headland.
```

可以填「負面提示」（negative prompt）的工具，就貼這段：

```
blurry, smooth gradient, anti-aliasing, painterly, photo, photorealistic, 3d render, vector, flat, 8-bit, low detail, mixed pixel sizes, noise, jpeg artifacts, text, letters, watermark, signature, logo, frame, border, UI, people, characters, fisheye, wide angle distortion, tilted horizon, leaning verticals
```

---

## 三、尺寸處理（生圖之後）

1. **先裁成 16:9**：如果 AI 給的不是 16:9（例如 ChatGPT 常給 1536×1024），**上下各裁掉一樣多**，裁成 1536×864。
2. **縮小到 640×360**：用一般的縮小方式即可。
3. **放大到 1920×1080**：一定要選「**最近鄰（Nearest Neighbor）**」，**不要選平滑、雙線性或雙立方**，不然像素會糊掉。
4. **存成 PNG**，檔名照下面每張的標題。

> 第 2、3 步會把 AI 畫得不整齊的像素「對齊格子」，這是讓整組背景像真正像素畫的關鍵。

---

## 四、驗收清單

- [ ] 1920×1080（或可以裁成 16:9）
- [ ] 每顆像素一樣大、邊緣銳利，沒有模糊或糊掉的漸層
- [ ] 地平線在上方約 1/4，而且是水平的（差一點沒關係，20～30% 都可以）
- [ ] 燈塔、門框、電線桿等直線沒有歪斜
- [ ] 正中央沒有大東西擋住，而且看中間那一條就認得出是哪裡
- [ ] 下方約 1/3 沒有重要細節
- [ ] 沒有人、沒有字、沒有浮水印
- [ ] 燈塔長相和位置跟其他張一致（從沙灘看在右邊）
- [ ] 同一個地點的不同時段，構圖一致

**常見問題怎麼補救**（在對話裡再補一句）：

| 問題 | 補一句 |
|---|---|
| 像素太細、看起來像一般插畫 | `Use larger, chunkier pixels on a 640x360 grid, no anti-aliasing.` |
| 出現亂碼文字 | `Remove all text. Signs show only simple icons.` |
| 地平線太低 | `Move the horizon up to 25% from the top of the image.` |
| 冒出人物 | `Empty scene: remove all people.` |
| 線條歪斜 | `Keep all vertical lines perfectly vertical and the horizon level.` |
| 跟參考圖構圖不一樣 | `Keep exactly the same camera angle and layout as the reference image.` |

---

## 五、30 張場景 Prompt

### 沙灘（#1～#3，建議先畫 #1）

#### #1　白鹽灣沙灘・白天
站在乾沙上面向大海。乾沙、濕沙、白色浪花線要分得很清楚（第二章姐姐停在乾濕交界不肯往前）。右側遠方岬角上有燈塔，淺灘右邊有一塊低矮的平礁石（第五章姐姐坐的地方）。
用在：第一章人工呼吸、第二章海邊散步。

```
[Scene #1: Baiyan Bay beach, daytime]
If a reference image is attached, match its style.
Location: the wide white-sand beach of Baiyan Bay. Standing on the dry sand, looking straight out to sea (west).
Layout: the sea horizon is a straight, level line at 25% from the top. Below it, in bands from far to near: deep blue sea, turquoise shallows, a bright white line of gentle surf, a band of darker wet sand, then warm dry sand in the foreground with footprints and small shells. The boundary between wet and dry sand reads clearly across the middle of the frame. In the shallows right of center, one low, flat dark rock just above the water. On the far right, a rocky headland with wind-bent pines and the white lighthouse with its keeper's cottage, small in the distance. On the far left, a red-and-yellow lifeguard flag on a pole and a patch of beach morning glory vines.
Center (keep clear): open sand and sea, only the horizon and a few distant gulls.
Light and palette: sunny mid-afternoon, cumulus clouds, a sea so blue it makes you lower your guard: saturated turquoise to cobalt, sun glitter on the water, white sand with lilac-blue shadows.
Mood: relaxed, bright, everyday.
```

#### #2　白鹽灣沙灘・黃昏
同 #1 構圖，換成夕陽。左側三分之一放生日營火的準備：石頭圍成的火圈和漂流木、冰啤酒桶、折疊椅、吉他盒、烤魷魚串。火圈在浪花線附近（承完吐槽「別在漲潮線以下生火」）。
用在：第一章營火開場。

```
[Scene #2: Baiyan Bay beach at sunset]
If a reference image of this beach is attached, keep exactly the same place, camera, horizon height and layout; change only the time of day and the props described here.
Location: the white-sand beach of Baiyan Bay, standing on the dry sand, looking out to sea (west). Horizon level at 25% from the top. Bands of sea, white surf line, wet sand and dry sand as before. A low flat dark rock in the shallows right of center. The rocky headland with the white lighthouse and keeper's cottage, small, on the far right.
Time: sunset. The sun sits just above the sea horizon slightly left of center, laying a golden-orange path on the water. Sky graded from amber at the horizon through coral pink to soft violet above, cloud edges lit. Long shadows stretch toward the camera.
Props on the left third, on the wet sand a little below the high-tide line: a ring of stones with stacked driftwood for a birthday campfire (a first small flame just starting), a metal bucket of iced beer cans, two folding camp chairs, an acoustic guitar case, a tray of squid skewers.
Center (keep clear): open sand and the sunset sea.
Mood: warm, cheerful, a little nostalgic.
```

#### #3　白鹽灣沙灘・夜
同 #1 構圖，換成夜晚。月光在海面鋪成一條**銀色的路**，從海平線直直延伸到岸邊，在畫面正中央。左側營火燃燒中，右側燈塔光束掃過海面。
用在：第一章唱漁歌、第二章營火、第五章坦白、兩個結局的一年後營火（共 5 次）。
註：第五章 5-1A 劇本寫「沙灘上一個人都沒有」，營火放在左邊、畫得小小的，影響不大。

```
[Scene #3: Baiyan Bay beach at night]
If a reference image of this beach is attached, keep exactly the same place, camera, horizon height and layout; change only the time of day and the props described here.
Location: the white-sand beach of Baiyan Bay, standing on the dry sand, looking out to sea (west). Horizon level at 25% from the top. Bands of sea, white surf line, wet sand and dry sand as before. A low flat dark rock in the shallows right of center, wet and moonlit. The rocky headland with the white lighthouse and keeper's cottage on the far right; the lighthouse is lit and its pale beam sweeps out over the sea.
Time: clear night, a bright, nearly full moon in the upper middle of the sky. The moonlight forms a wide silver road on the sea, running straight from the horizon down the center of the image to the shore. Stars, thin silver-edged clouds.
Left third: a small, cozy campfire burning in its stone ring, sparks rising, casting a warm orange pool of light on the sand and two folding chairs. Warm firelight against cool moonlight is the key contrast.
Center (keep clear): the moon road and the dark sand.
Palette: deep navy and blue-violet, moon silver, warm orange firelight, cream-yellow lighthouse beam.
Mood: quiet, romantic, a little mysterious, as if the sea is listening.
```

### 海面（#4、#5）

#### #4　白鹽灣海面・白天
救生員游泳時的視角，鏡頭貼近水面。前景是起伏的浪和白色碎浪，中景是一條掛橘色浮球的警戒繩（游泳區界線）。左側遠方是沙灘、救生瞭望台和紅黃旗，右側是開闊的海。
用在：第一章衝出警戒旗外救人。

```
[Scene #4: in the sea off Baiyan Bay, daytime]
If a reference image is attached, match its style.
Location: in the water just beyond the breaking waves, seen from a swimmer's eyes just above the surface. Looking along the coast (south): the beach on the left, the open sea on the right.
Camera: eye level at the water surface, horizon level at 25% from the top.
Layout: the foreground is a big glassy turquoise swell with sun glints and lacy white foam. In the mid-ground, a rope line of round orange marker buoys curves across the frame (the edge of the swimming zone). Beyond it on the left: the white-sand beach, the white wooden lifeguard tower and red-and-yellow flags, small and distant, with low town rooftops and green hills behind. On the right: open, choppy deep-blue sea under a clear sky.
Center (keep clear): water surface and the buoy line.
Light and palette: bright afternoon sun, high contrast, saturated cyan and cobalt, white foam.
Mood: urgent but sunny; the waves are bigger than they look from the shore.
```

#### #5　白鹽灣海面・夜
夜晚貼著海面，**面向岸邊**（東）。月亮在右上方，月光在湧浪上閃。遠處是黑色的海岸線和淡淡的白沙灘，左側岬角上燈塔亮著。沙灘上有一點小小的暖色火光。
用在：人魚篇姐姐第一次浮上海面、看見營火（那點火光就是承完的營火）；第五章人魚救援（可當成岸上的燈火）。

```
[Scene #5: sea surface at night, looking back at the shore]
If a reference image is attached, match its style.
Location: far out in Baiyan Bay at night, at water level, looking back toward the shore (east).
Camera: eye level just above the water; the shoreline and horizon sit level at 25% from the top.
Layout: the foreground is dark, slow, moonlit swells with silver highlights. In the distance, the low dark coastline: a faint pale strip of white-sand beach, the seawall, a few warm window lights of the sleeping town, dark hills. On the left, the rocky headland with the white lighthouse, lit, its beam sweeping. On the beach slightly left of center, one tiny warm orange point of firelight (a far-away campfire).
Sky: a bright moon high in the upper right, scattered stars, thin clouds.
Center (keep clear): calm dark water with moon glints.
Palette: deep navy, blue-black water, silver moon highlights, tiny warm orange accents.
Mood: vast, quiet, lonely; seen from the sea, the human world is small and warm.
```

### 暴風雨與黎明（#6～#8，最優先 #6）

#### #6　暴風雨的海・黎明前V
站在浪花邊面向大海。巨浪翻滾、白沫、斜雨。右側岬角上燈塔的光切過雨幕。海平線處的雲縫透出一點點灰藍的光：天快亮了，但看不到太陽。正中央留給海面（結局時人魚立繪會浮在這裡）。
用在：第六章成年潮、所有結局的開頭（共 6 次）。

```
[Scene #6: stormy sea before dawn]
If a reference image is attached, match its style.
Location: the edge of Baiyan Bay beach during a violent storm, standing at the waterline, looking out to sea (west).
Camera: eye level, horizon at 25% from the top and perfectly level, even though the sea is wild.
Layout: huge dark rolling waves with torn white crests fill the middle. Nearer, sheets of foam slide over the wet sand and churned water fills the lower part. On the right, the rocky headland with the white lighthouse, its beam cutting a pale cone through the driving rain. Slanted rain streaks and wind-blown spray across the whole image.
Sky: heavy, low, churning storm clouds. Right at the horizon, a thin gap where faint cold blue-grey light leaks through: dawn is coming, but no sun is visible.
Center (keep clear): open stormy water between the waves, where a figure could appear in the sea.
Palette: slate grey, blue-black, desaturated teal water, white foam; the only warm color is the pale cream lighthouse beam.
Mood: overwhelming, dramatic, desperate, with a thin line of hope at the horizon.
```

#### #7　黎明的海
同 #6 的位置，暴風雨剛過。雲層裂開，陽光從雲縫斜射下來，在海面鋪出一條寬寬的金色光帶，從海平線一直延伸到前景（畫面正中央）。不畫太陽本體（地理上太陽在陸地那側）。
用在：靈魂伴侶結局的珍珠之淚、普通朋友結局的「明年見」。

```
[Scene #7: the sea at dawn after the storm]
If a reference image of Scene #6 is attached, keep the same place, camera and horizon; change only the weather and light.
Location: Baiyan Bay just after the storm, standing in the shallows at the waterline, looking out to sea (west). Horizon level at 25% from the top. The rocky headland with the white lighthouse on the right, its lamp now off, rocks glistening.
Sky: the storm clouds are breaking apart. Through a large crack in the clouds, beams of morning sunlight shine down at an angle and lay a broad band of glittering gold on the sea, running from the horizon down the center of the image to the foreground. The remaining clouds are grey-blue with brilliant gold edges, with patches of clean pale-blue sky. Do not show the sun itself.
Sea: still lively but calming swells, foam turning gold where the light hits, wet sand shining in the foreground.
Center (keep clear): the golden band of light on the water.
Palette: gold, warm white, peach, soft teal and pale blue against fading slate grey.
Mood: release, a miracle, a new beginning.
```

#### #8　海中
水面下稍微往上看。上方是灰白色、晃動的水面光，而且越來越遠；往下越來越暗，最下方幾乎全黑。氣泡往上飄。沒有海底、沒有魚。（這張沒有立繪，不用管地平線。）
用在：Bad Ending 下沉。

```
[Scene #8: underwater, sinking]
If a reference image is attached, match its style.
Location: underwater in the open sea, below a stormy surface. No seabed, no fish.
Camera: looking slightly upward, the frame steady and level.
Layout: at the top center, the rippling surface seen from below as a small, pale grey-white, shifting patch of light, as if getting farther away, with a few faint light rays fanning down. The water darkens gradually from murky blue-grey at the top, to deep blue in the middle, to almost black indigo at the bottom. A thin trail of small air bubbles rises through the center. Drifting particles.
Palette: very limited: grey-white, steel blue, deep ultramarine, indigo-black, with dithering in the gradient.
Mood: silence, sinking, calm and sad.
```

### 救生站（#9～#12，建議先畫 #9、#11）

#### #9　救生站・白天
站在沙灘上，面向大海。救生瞭望台在畫面中間偏左（白色木造高台、梯子、紅色遮陽頂、掛著紅色救生浮標），最左邊是鐵皮屋頂的小屋。瞭望台的梯子前要留空地（第三章姐姐站在瞭望台下送便當）。
用在：第一章值班、第三章送便當。

```
[Scene #9: lifeguard station, daytime]
If a reference image is attached, match its style.
Location: the lifeguard station in the middle of Baiyan Bay beach, seen from the sand, looking toward the sea (west).
Camera: eye level, horizon (sea line) level at 25% from the top.
Layout: the lifeguard lookout tower stands in the mid-ground just left of center, about 20 m away, fully visible from its base to its roof: a tall white-painted wooden tower on four braced legs, a steep ladder, a small platform with a railing and a faded red sun canopy, a red rescue tube hanging from the railing. On the far left, the small lifeguard hut: weathered white wooden walls, a corrugated tin roof, a small window, a rescue board leaning on the wall. A red-and-yellow flag on a pole beside the tower. Behind: the white-sand beach, gentle surf, the turquoise sea. On the far right, the lighthouse headland, small. A few half-built sandcastles and a beach umbrella in the distance (no people).
Center (keep clear): open sand in front of the tower's ladder, where a person could stand.
Light and palette: clear sunny day, saturated turquoise sea, white sand, warm white wood, red accents.
Mood: everyday duty, safe and bright.
```

#### #10　救生站・黃昏
同 #9 構圖，傍晚突然下大雨。遊客剛跑光，留下倒掉的海灘傘、拖鞋、毛巾。小屋窗戶透出昏黃的燈。
用在：第三章雨中的姐姐（她仰著臉在雨裡笑，所以氣氛不要太陰沉）。

```
[Scene #10: lifeguard station in a sudden rainstorm at dusk]
If a reference image of Scene #9 is attached, keep the same place, camera, horizon and layout; change only the weather, light and props.
Location: the lifeguard station on Baiyan Bay beach, looking toward the sea (west). Horizon level at 25% from the top. The white wooden lookout tower just left of center with its ladder, red canopy and rescue tube; the small tin-roofed hut on the far left; the lighthouse headland small on the far right.
Time and weather: early evening in March. The sky has suddenly turned dark with heavy blue-grey rain clouds, with a hint of dull orange glow low at the horizon. A heavy downpour: dense slanted rain, big drops splashing and pocking the sand, puddles forming, the sea grey-green and choppy. The lifeguard flag whips in the wind. The hut's small window glows a dim warm yellow.
Props: the beach has just been abandoned by fleeing tourists: a beach umbrella tipped over, a dropped sandal, a forgotten towel, a bucket and spade by a melting sandcastle.
Center (keep clear): open wet sand in front of the tower.
Palette: blue-grey, slate, dull teal, wet dark sand, small warm yellow accents.
Mood: sudden, noisy rain, yet strangely joyful and refreshing, not gloomy.
```

#### #11　救生站小屋・夜
小屋內部（約 3×4 公尺），從門口看進去。左牆一張長木椅（要坐得下兩個人分開坐），右牆是鐵製置物櫃，天花板吊著一盞昏黃的燈，屋頂是鐵皮。後牆的小窗外面下著雨。
用在：第三章雨夜之吻。

```
[Scene #11: inside the lifeguard hut, rainy night]
If a reference image is attached, match its style.
Location: inside the tiny lifeguard hut on the beach (about 3 x 4 m), seen from just inside the door.
Camera: eye level, one-point perspective. The vanishing point is on the horizon line at 25% from the top, slightly right of center; floorboards, bench edge and ceiling beams all converge to it.
Layout: back wall: a small square window in the center, rain streaming down the glass, the dark night beach beyond. Left wall: one long, plain wooden bench, long enough for two people to sit apart, a folded towel on it. Right wall: a tall grey metal locker with dented doors; above it a shelf with a first-aid box, a logbook and a whistle on a lanyard. On the walls: two red rescue tubes, swim fins and a life jacket on hooks, a faded tide chart with no readable text. Ceiling: exposed wooden rafters under a corrugated tin roof, one dim bulb in a simple metal shade hanging down, making a small warm yellow pool of light. Sand on the worn floorboards, a little puddle near the door.
Center (keep clear): the floor space between the bench and the locker.
Palette: warm amber lamplight against the cold dark-blue window and shadows.
Mood: small, intimate, enclosed; rain drumming on the tin roof like a thousand drums.
```

#### #12　救生站小屋・清晨
同 #11 構圖，雨停了，灰白的晨光。燈關著，毛巾皺皺地留在長椅上，**便當盒蓋好放在置物櫃上**（劇本細節）。
用在：第三章採息後醒來。

```
[Scene #12: inside the lifeguard hut, early morning]
If a reference image of Scene #11 is attached, keep the same room, camera and layout; change only the light and small props.
Location: inside the tiny lifeguard hut, seen from just inside the door. One-point perspective, vanishing point on the horizon line at 25% from the top, slightly right of center. Small square window in the center of the back wall, long wooden bench on the left wall, grey metal locker on the right wall, rescue tubes, fins and life jacket on hooks, exposed rafters under a corrugated tin roof, a hanging bulb (switched off).
Time: the rain has stopped, just after dawn. Cool grey-white morning light comes in through the window; raindrops still beaded on the glass; outside, a pale washed sky and a calm grey sea.
Props: a towel left crumpled on the bench; a closed lunch box (bento box) sitting neatly on top of the metal locker.
Palette: soft grey-white, pale blue, muted wood browns, low contrast.
Mood: hushed, empty, a little lonely, like waking from a dream.
```

### 承完的家（#13～#15，建議先畫 #15 白天版）

承完的家是**燈塔旁的守塔小屋**，奶奶留給她的。一個房間兼臥室和餐廳：左邊是床，右邊是小餐桌（第六章在這裡吃生日蛋糕）。後牆的大窗戶對著海，窗邊看得到燈塔塔身，燈塔的光每隔幾秒掃過房間。

#### #13　孫承完的房間・夜
用在：第一章睡不著、第四章鱗片與燈塔之夜、第五章、第六章生日（共 6 次）。

```
[Scene #13: Seungwan's room at night]
If a reference image of this room is attached, keep exactly the same room, camera and layout; change only the time of day and light.
Location: inside the small old lighthouse keeper's cottage right next to the lighthouse, now the heroine's home, inherited from her grandmother. One cozy room that is both bedroom and dining room.
Camera: eye level, one-point perspective facing the back wall; vanishing point at the center, on the horizon line at 25% from the top.
Layout: back wall, center: a large wooden-framed window looking west over the sea; at the right edge of the window, part of the white lighthouse tower close by. Left side: a single bed with blue-and-white bedding and a quilt against the left wall, a wooden bedside table with one drawer, a small lamp and an alarm clock. Right side: a small round wooden dining table with two mismatched chairs. Walls: thick whitewashed plaster with dark wooden ceiling beams; a shelf with seashells, a few old framed photos (an old fishing boat, no readable text), a whistle on a hook, a small potted plant on the windowsill. Worn wooden floor with a woven rug.
Light: night. The bedside lamp gives a warm amber glow. The lighthouse beam passes outside: a long pale-cream shaft of light enters through the window and slants across the wall and ceiling. Deep-blue moonlit sea and stars in the window.
Center (keep clear): the rug and floor in front of the window.
Palette: deep-blue night, warm amber lamplight, cream lighthouse beam, white plaster.
Mood: quiet, safe, a sleepless night, the sea outside listening.
```

#### #14　孫承完的房間・清晨
同 #13 構圖，天剛亮的柔和晨光。燈關著，床鋪微亂。
用在：第四章燈塔之夜的隔天早上。

```
[Scene #14: Seungwan's room, early morning]
If a reference image of this room is attached, keep exactly the same room, camera and layout; change only the time of day and light.
Location: inside the small old lighthouse keeper's cottage next to the lighthouse, one room that is both bedroom and dining room.
Camera: eye level, one-point perspective facing the back wall; vanishing point at the center, on the horizon line at 25% from the top.
Layout: a large wooden-framed window in the center of the back wall looking west over the sea, part of the white lighthouse tower at the window's right edge. Left: a single bed with blue-and-white bedding against the left wall, slightly rumpled, a wooden bedside table with one drawer, a small lamp (off) and an alarm clock. Right: a small round wooden dining table with two mismatched chairs. Whitewashed plaster walls, dark wooden ceiling beams, a shelf with seashells and old framed photos, a whistle on a hook, a potted plant on the windowsill, worn wooden floor with a woven rug.
Light: just after sunrise. Soft, pale peach-and-grey morning light fills the room gently from the land side; through the window, a calm pale-blue sea and a soft pink sky; the lighthouse lamp is off.
Center (keep clear): the rug and floor in front of the window.
Palette: pale peach, soft grey-blue, warm white, light wood.
Mood: tender, quiet, the first morning after something important.
```

#### #15　孫承完的房間・白天
同 #13 構圖，白天。白窗簾半拉，床頭櫃上有水杯、藥盒和體溫計（承完發燒躺著）。
用在：第三章發燒、長白頭髮。

```
[Scene #15: Seungwan's room, daytime]
If a reference image of this room is attached, keep exactly the same room, camera and layout; change only the time of day, light and small props.
Location: inside the small old lighthouse keeper's cottage next to the lighthouse, one room that is both bedroom and dining room.
Camera: eye level, one-point perspective facing the back wall; vanishing point at the center, on the horizon line at 25% from the top.
Layout: a large wooden-framed window in the center of the back wall looking west over the sea, part of the white lighthouse tower at the window's right edge. Left: a single bed with blue-and-white bedding against the left wall, the quilt pulled back as if someone is resting in it, a wooden bedside table with one drawer, a small lamp, an alarm clock. Right: a small round wooden dining table with two mismatched chairs. Whitewashed plaster walls, dark wooden ceiling beams, a shelf with seashells and old framed photos, a whistle on a hook, a potted plant on the windowsill, worn wooden floor with a woven rug.
Light: afternoon daylight, bright but soft and a little hazy; thin white curtains half drawn and stirring in the breeze; a calm blue sea in the window.
Props: on the bedside table, a glass of water, a small box of medicine and a thermometer.
Center (keep clear): the rug and floor in front of the window.
Palette: soft white, pale blue, light warm wood, gentle shadows.
Mood: drowsy, quiet, a sick day.
```

### 燈塔（#16、#17）

#### #16　燈塔・黃昏
站在燈塔頂端的環形走道上，**往南俯瞰整個白鹽灣**。前景是黑色鐵欄杆；下面是弧形白沙灘、堤防、遠處的漁港。堤防上的祭典燈籠拆到一半。左邊是鎮上的屋頂，右邊是海和夕陽。地平線一樣在上方 1/4，只是所有景物都在很下面（高處往下看，鏡頭不要往下傾斜）。
用在：第四章「九天」。

```
[Scene #16: view from the top of the lighthouse at dusk]
If a reference image is attached, match its style.
Location: on the gallery at the top of the white lighthouse on the north headland, looking south over the whole of Baiyan Bay.
Camera: standing on the gallery at eye level, about 30 m above the ground. The sea horizon is still level at 25% from the top; everything else lies far below it. Do not tilt the camera down; keep verticals vertical.
Layout: a black iron gallery railing runs across the lower part of the image, close to the camera. Below and beyond: the long crescent of white-sand beach curving away from below the center into the distance; the concrete seawall running along the back of the beach to a small fishing harbor with moored fishing boats at the far end; strings of festival paper lanterns along the seawall, partly taken down, a few bare stall frames being dismantled; the lifeguard tower tiny on the beach; the town's tin and tile rooftops climbing green hills on the left. On the right, the open sea, with the sun just above the horizon.
Center: the far end of the bay and the harbor, a clear landmark in the middle strip.
Light and palette: golden-hour sunset from the right, long shadows, the sea a sheet of gold and peach, sky from amber to rose to lavender, the first town lights coming on.
Mood: calm after the festival, contemplative, a little ominous: the sea looks too calm.
```

#### #17　燈塔・夜
燈塔頂端，欄杆旁，**面向西邊的大海**。欄杆橫過畫面下方（第五章姐姐坐在欄杆旁晃腳）。燈塔的光從後上方射出去，掃過海面。遠方海平線上壓著一整排低低的厚雲（暴風雨要來了）。
用在：第五章開頭、第五章最後一晚。

```
[Scene #17: lighthouse gallery at night]
If a reference image is attached, match its style.
Location: on the gallery at the top of the lighthouse, beside the railing, looking west over the open sea at night.
Camera: standing at eye level, high above the sea; horizon level at 25% from the top.
Layout: a black iron railing with round posts runs across the lower third from left to right, close enough to lean on; the gallery floor is made of riveted iron plates. The lantern is just behind the camera, so its powerful pale-cream beam sweeps out over the sea as a long cone of light from the upper left, fading into the distance. Far below: the dark sea with moonlit swells, the rocky shore and white foam at the foot of the headland. At the far horizon, a low, heavy wall of dark storm clouds is building.
Sky: deep night, a bright moon in the upper right, stars, wind.
Center (keep clear): open sky and sea beyond the railing.
Palette: navy, blue-black, silver moonlight, pale cream beam.
Mood: windy, high, quiet, the last night before something happens.
```

### 鎮上（#18～#21）

#### #18　酒吧「退潮」・夜
堤防邊的老木造酒吧，從客人那側看向吧檯。吧檯放在中景（約 6 公尺遠），前面留空地給立繪。牆上掛滿漂流木、舊浮球、玻璃浮球。左邊有通往二樓儲藏室的木樓梯，右邊是廚房出菜口、倉庫門、看得到夜晚堤防的窗戶。架上有梅酒罐（阿英說姐姐喝梅酒喝醉）。
用在：第二章重逢、第三章人魚傳說、陳伯邀請（共 4 次）。

```
[Scene #18: inside the seaside bar "Low Tide" at night]
If a reference image is attached, match its style.
Location: inside a small, old wooden bar beside the seawall, a local hideout that has looked the same for years.
Camera: eye level, standing on the customers' side near the entrance, one-point perspective toward the bar counter; vanishing point at the center, on the horizon line at 25% from the top.
Layout: an L-shaped wooden bar counter with high stools stands in the mid-ground about 6 m away, running across the frame. Behind it: wooden shelves of bottles, glasses and big jars of homemade plum wine, a beer tap, an old radio at the end of the counter. On the right of the back wall: a kitchen door with a serving hatch and a storeroom door. The walls are covered with sea-washed driftwood, old glass fishing floats in rope nets, faded orange and white buoys, coils of rope. On the left: a narrow wooden staircase going up to the second floor and a couple of small wooden tables with chairs. On the right wall: a window showing the dark seawall and the night sea, and the wooden front door with a small bell. Warm bare bulbs and a string of small lights; worn plank floor with a little sand. No readable text anywhere.
Center (keep clear): open floor in front of the counter.
Palette: warm amber and honey wood tones, deep brown shadows, small cool-blue accents from the window and the glass floats.
Mood: cozy, lived-in, friendly.
```

#### #19　白鹽灣海岸道路・白天
站在路邊往北看，雙線道往遠方延伸（一點透視）。左邊是矮水泥牆、白色護欄、消波塊和海；右邊是長著高草的空地和電線桿。遠方岬角上的燈塔在消失點附近。
用在：第二章休假日。

```
[Scene #19: coastal road, daytime]
If a reference image is attached, match its style.
Location: the quiet two-lane coastal road at the edge of town, looking north along the road toward the lighthouse headland.
Camera: standing on the roadside at eye level; one-point perspective, the road converging to a vanishing point on the horizon line at 25% from the top, slightly left of center.
Layout: an asphalt road with faded white lines runs straight away from the camera and curves gently at the far end. Left: a low concrete sea wall with a white guardrail, then tetrapods, rocks and the sparkling sea (west). Right: a wide open grassy lot with tall seaside grass, beach morning glory and a few wildflowers along the road edge, a row of wooden utility poles with sagging wires receding into the distance, an old bus-stop bench. Far ahead on the headland, the white lighthouse, small but clearly visible near the vanishing point.
Center (keep clear): the road surface.
Light and palette: bright clear day, blue sky with soft cumulus, green-gold grass, grey asphalt, turquoise sea.
Mood: open, breezy, a carefree day off.
```

#### #20　白鹽灣海岸道路・黃昏
同 #19 構圖，夕陽在左邊海上，整片海變成金色。右邊草叢裡倒著一台淑女車（腳踏車特訓）。
用在：第二章腳踏車特訓。

```
[Scene #20: coastal road at sunset]
If a reference image of Scene #19 is attached, keep the same place, camera, horizon and layout; change only the time of day and props.
Location: the quiet two-lane coastal road at the edge of town, looking north along the road toward the lighthouse headland. One-point perspective, vanishing point on the horizon line at 25% from the top, slightly left of center. Left: low concrete sea wall, white guardrail, tetrapods and the sea. Right: open grassy lot with tall seaside grass, a row of wooden utility poles with sagging wires, an old bus-stop bench. Far ahead on the headland, the white lighthouse near the vanishing point.
Time: sunset. The sun is low over the sea on the left, turning the whole sea into a sheet of gold. Warm golden light rakes across the road; the utility poles cast long shadows across the asphalt; the grass glows orange at its tips. Sky from gold at the horizon to rose and soft violet above.
Props: an old step-through city bicycle lying on its side in the grass on the right, its front wheel slightly turned.
Center (keep clear): the road surface.
Palette: gold, orange, rose, warm grey asphalt, deep-teal shadows.
Mood: joyful, youthful, golden.
```

#### #21　白鹽灣商店街・白天
小鎮的商店街，往燈塔方向緩緩上坡，街尾看得到岬角上的燈塔。右邊中景是鎮上唯一的麵包店。也有魚店、康的衝浪店、炸雞攤。天空晴但高空雲跑得很快、遮陽棚被風吹動（今晚有暴風雨）。
用在：第六章訂蛋糕。

```
[Scene #21: the shopping street, daytime]
If a reference image is attached, match its style.
Location: the small main shopping street of Baiyan Bay town, a narrow street of old shophouses that slopes gently uphill toward the lighthouse.
Camera: standing in the street at eye level, looking up the street. Horizon line at 25% from the top. The building rooflines, window rows and awnings converge to a vanishing point at the center of that horizon line; because the street rises gently, the edges of the street surface converge to a second point slightly above the horizon. All building verticals are perfectly vertical.
Layout: two- and three-story old concrete and wooden shophouses on both sides, with rolling shutters, cloth awnings and small balconies with potted plants and laundry. On the right in the mid-ground, the town's only bakery: a glass display window full of bread and one cake, a striped awning, a wooden bench, a stand sign showing only a bread icon. Other shops: a fish shop with foam boxes on ice, a surf shop with colorful surfboards leaning outside, a small fried-chicken stand, a grocery with fruit crates. Utility poles and tangled wires overhead, a few bicycles parked. At the top of the street, the green headland with the white lighthouse.
Sky and weather: morning, bright, but with streaks of fast-moving high clouds; the wind is picking up and the awnings and a shop flag flutter (a storm is forecast for tonight).
Center (keep clear): the street surface.
Palette: sun-faded pastel walls, teal and red accents, warm morning light with a slightly grey edge.
Mood: an ordinary morning with a faint restlessness.
```

### 春潮祭（#22～#24，建議先畫 #22）

#### #22　堤防祭典・黃昏
站在堤防步道上，往北看向遠處的燈塔（一點透視）。左邊是矮牆和海，右邊是一排攤子：烤魷魚、炸蝦餅、棉花糖、彈珠汽水、撈金魚。頭頂好幾串紙燈籠一路掛到燈塔。右前方露出後台帳篷的一角。人只能很小、很遠。
用在：第四章祭典開始、姐姐穿浴衣登場。

```
[Scene #22: Spring Tide Festival on the seawall, at dusk]
If a reference image is attached, match its style.
Location: on top of the long concrete seawall promenade during the Spring Tide Festival (spring equinox), looking north along the seawall toward the lighthouse at the far end.
Camera: eye level, one-point perspective along the seawall; vanishing point on the horizon line at 25% from the top, just right of center, where the lighthouse stands far away.
Layout: the wide seawall promenade runs straight away from the camera. Left: a low concrete parapet, and beyond it the sea (west) with tetrapods below. Right: a row of festival stalls with cloth awnings on simple wooden frames, receding into the distance: grilled squid, fried shrimp crackers, cotton candy, bottles of marble soda in an ice tub, a shallow goldfish-scooping tub. Behind the stalls, the town's roofs. Overhead, several strings of round paper lanterns hang from poles and run all the way along the seawall to the lighthouse. Near the camera on the right, the corner of a white backstage tent.
People: only tiny, distant figures far down the promenade; nobody in the foreground.
Light and palette: sunset over the sea on the left, warm orange and rose sky; the lanterns are not lit yet, their paper glowing in the sunset; long shadows; the promenade in warm light.
Center (keep clear): the open promenade path.
Mood: festive anticipation, a nostalgic summer-festival feeling in spring.
```

#### #23　堤防祭典・夜
同 #22 構圖，燈籠全亮，兩側有人群剪影，中間步道留空（第四章大浪打上堤防、姐姐跌坐的地方）。左邊海面一片黑。
用在：第四章大浪。

```
[Scene #23: Spring Tide Festival on the seawall, at night]
If a reference image of Scene #22 is attached, keep the same place, camera, horizon and layout; change only the time of day, lights and crowd.
Location: on top of the long concrete seawall promenade during the festival, looking north toward the lighthouse at the far end. One-point perspective, vanishing point on the horizon line at 25% from the top, just right of center. Left: low concrete parapet, the dark sea beyond. Right: the row of festival stalls (grilled squid, shrimp crackers, cotton candy, marble soda, goldfish scooping) under cloth awnings. Strings of round paper lanterns overhead all the way to the lighthouse. Corner of a white backstage tent near the camera on the right.
Time: night. All the paper lanterns are lit in warm red, orange and cream, their light pooling on the promenade. Stalls glow with bare bulbs; steam and smoke rise from the grills. At the far end, the lighthouse beam sweeps over the black sea.
People: a festival crowd shown only as simple, softly lit silhouettes along the stalls on both sides and far down the promenade, no faces; the center path stays open.
Center (keep clear): the open promenade path.
Palette: warm lantern reds and oranges against deep navy sky and black sea.
Mood: lively and warm, with the dark sea close by on the left.
```

#### #24　春潮祭舞台・夜
從觀眾席最後面看向舞台。舞台搭在堤防最前端，**背對大海**，所以舞台後面只有夜海和天空。台上一支麥克風架和一張凳子；觀眾只在畫面最下方畫成背影剪影（會被對話框蓋住）。
用在：第四章唱歌開場。
註：劇本這段是承完站在台上往下看；這張照背景清單的寫法，畫「從觀眾席看舞台」。

```
[Scene #24: the festival stage at night]
If a reference image is attached, match its style.
Location: the open-air festival stage built at the very tip of the seawall, with its back to the sea.
Camera: standing at the back of the audience at eye level, looking straight at the stage (west); horizon level at 25% from the top; the stage is symmetrical and centered.
Layout: a simple wooden stage platform about 1 m high, with a wooden frame above it hung with strings of paper lanterns and a plain indigo cloth banner with a white wave pattern (no text). On the stage: one microphone stand and a wooden stool. Behind the stage: nothing but the dark night sea and the sky, the open horizon. Far away on the right, the white lighthouse on its headland, its beam sweeping. In the bottom quarter of the image only, the backs of the audience as simple dark silhouettes with lantern-lit edges, no faces; a row of folding chairs in front.
Light and palette: warm lantern and stage light on the platform against a deep blue-black sea and sky.
Center: the stage.
Mood: hushed and expectant; the whole town is waiting for a song to the sea.
```

### 礁石（#25～#28，建議先畫 #25）

#### #25　礁石海岸・夜
燈塔北邊的礁石區，面向大海。中景偏左是一塊最外側、頂部平平的高礁石（第三章姐姐站在上面跟海說話）；水邊有低平的礁石，可以坐著把腳泡進水裡（第五章兩人並坐）。浪拍在礁石上碎成白沫。燈塔在左後方。
用在：第三章、第五章（共 4 次）。

```
[Scene #25: rocky reef coast at night]
If a reference image is attached, match its style.
Location: the rocky reef area just north of the lighthouse, at the north end of Baiyan Bay, looking west out to sea.
Camera: standing on the rocks at eye level, horizon level at 25% from the top.
Layout: dark, rugged volcanic rocks with tide pools, barnacles and seaweed fill the foreground and run out into the sea. In the mid-ground slightly left of center, the outermost tall rock with a flat top juts into the sea, a place where someone could stand facing the ocean. Lower flat rocks at the water's edge, good for sitting with feet in the water. Waves break against the rocks and burst into white foam and spray. Behind on the far left, the lighthouse headland with the lit white lighthouse sweeping its beam.
Sky: a bright full moon in the upper right, its silver path on the water, stars, thin clouds.
Center (keep clear): the outermost rock and the moonlit water around it.
Palette: blue-black rocks with silver moonlit edges, navy sea, white foam, pale cream beam.
Mood: secret, lonely, mysterious, a place for talking to the sea.
```

#### #26　礁石海岸・清晨
同 #25 構圖，暴風雨過後的清晨。海變平靜、退潮，礁石濕亮，散落被沖上來的海藻和漂流木，潮池倒映淡金粉色的天空。燈塔的燈已經熄了。
用在：靈魂伴侶結局「潮約恢復」。

```
[Scene #26: rocky reef coast, morning after the storm]
If a reference image of Scene #25 is attached, keep the same place, camera, horizon and layout; change only the time, weather and props.
Location: the rocky reef area just north of the lighthouse, looking west out to sea. Horizon level at 25% from the top. Dark volcanic rocks with tide pools in the foreground; the outermost tall flat-topped rock in the mid-ground slightly left of center; low flat rocks at the water's edge; the lighthouse headland behind on the far left, its lamp now off.
Time: early morning just after the storm. The sea is calm and the tide is low; gentle small waves. The rocks are wet and glistening; torn seaweed and pieces of driftwood thrown up by the storm are strewn across them. The tide pools mirror a clearing sky of pale gold, peach and soft pink, with broken grey clouds drifting away. Soft morning light falls on the rocks from behind the camera (from the land side).
Center (keep clear): the outermost rock and the calm water around it.
Palette: pale gold, peach, soft blue, wet charcoal rocks with bright highlights.
Mood: peaceful, washed clean, the world starting over.
```

#### #27　暴風雨的沙灘・夜
沙灘北端，**面向北邊的燈塔岬角**。中景正中央是岬角腳下的黑色礁石，被浪打過（第六章澪站在這裡）。燈塔在中間偏右的岬角上，光切過雨幕，守塔小屋（承完的家）有一扇亮著的窗。左邊是狂浪的海，右邊是堤防，浪撞上去炸成白色的牆。
用在：第六章貝刃。

```
[Scene #27: the beach in a storm at night]
If a reference image is attached, match its style.
Location: the north end of Baiyan Bay beach during a violent storm, looking north toward the lighthouse headland.
Camera: eye level, horizon at 25% from the top and perfectly level.
Layout: in the center mid-ground, at the foot of the headland, a cluster of black reef rocks with waves smashing over them, a place where someone could stand in the surf. Above and slightly right, the white lighthouse on the rocky headland, lamp blazing, its beam slicing through the rain; the small keeper's cottage beside it with one lit window. Left: the raging sea (west) with towering waves. Right: the concrete seawall, waves exploding against it in tall white walls of spray. Foreground: wet sand streaming with foam and rainwater.
Weather: furious wind, heavy slanted rain like gravel, low black clouds, a distant flash of lightning lighting the cloud edges.
Center (keep clear): the reef rocks in the surf.
Palette: black, slate, cold blue-grey, white foam; the lighthouse beam and the cottage window are the only warm light.
Mood: violent, dangerous, the climax.
```

#### #28　海蝕洞・夜
燈塔北邊的海蝕洞，退潮才進得去。洞頂一道裂縫，月光直直灑在洞底中央那池淺淺的海水上。水池旁有平滑的岩石可以坐、可以靠。左邊是洞口，外面是平靜的月夜海。
用在：靈魂伴侶結局最後一夜。

```
[Scene #28: sea cave at night]
If a reference image is attached, match its style.
Location: inside a sea cave north of the lighthouse, reachable only at low tide.
Camera: eye level inside the cave, horizon line at 25% from the top; the perspective converges toward the back of the cave.
Layout: rough dark rock walls glistening with water, with barnacles, small anemones and limpets, arching overhead. In the cave ceiling, a narrow natural crack lets a shaft of moonlight fall straight down into the middle of the cave, onto a shallow, clear pool of seawater on the cave floor. The pool glows silver-turquoise where the light hits, with small ripples and pebbles and shells visible under the water. Smooth flat rocks around the pool, good for sitting with feet in the water, and a rock wall to lean against. On the left, the cave mouth opens onto a calm, moonlit sea with gentle waves lapping at the entrance.
Center: the moonlit pool (characters will be beside it).
Palette: blue-black stone, silver and turquoise moonlight, pearl highlights.
Mood: hidden, sacred, tender and peaceful, a secret place for two.
```

### 海底（#29、#30，人魚篇）

#### #29　貝貝國・王座廳
海溝最深處的王座廳，沒有陽光，只有珊瑚自己發出的藍白色光。對稱的一點透視，盡頭正中央是珊瑚王座。（潮后和澪的立繪會在王座前面。）
用在：人魚篇序章。

```
[Scene #29: throne hall of the mermaid kingdom]
If a reference image is attached, match its style.
Location: the throne hall of the undersea mermaid kingdom, at the deepest point of an ocean trench. No sunlight reaches here.
Camera: eye level, symmetrical one-point perspective down the length of the hall; vanishing point at the center, on the horizon line at 25% from the top.
Layout: a vast hall formed from dark rock and giant ancient corals: tall coral columns line both sides and arch overhead like a cathedral. At the far end in the center, a raised dais with a tall throne grown from branching white and pale-blue coral, inlaid with pearls and mother-of-pearl. Clusters of bioluminescent coral and anemones glow blue and white along the walls and floor and are the only light. Drifting marine snow, a few slow glowing jellyfish high above, strands of kelp. A floor of smooth pale sand and shells leads to the throne.
Center: the long aisle to the throne (characters will float in front of it).
Palette: deep indigo and black-blue, glowing cyan, ice blue, pearl white, tiny accents of coral pink.
Mood: silent, majestic, cold, like a quiet dream.
```

#### #30　海巫的洞窟
王國邊緣的黑色洞窟，珊婆住的地方。牆上的凹槽擺滿貝殼（很多粉紅色螺殼，呼應她寄居蟹的殼）和裝著發光珍珠的瓶罐。也藏著三百年前人類世界的遺物：生鏽的銅製船燈、一段舊漁網、一個木製浮球，暗示她愛過的漁夫。陰森但不邪惡。
用在：人魚篇交換眼淚。

```
[Scene #30: the sea witch's cave]
If a reference image is attached, match its style.
Location: a black cave at the edge of the undersea mermaid kingdom, where an ancient sea witch lives.
Camera: eye level, horizon line and vanishing point at 25% from the top, looking into the cave.
Layout: a low, cramped cave of jagged black volcanic rock, twisting like the inside of an old shell. Niches in the walls hold the witch's collection: rows of shells of every kind (many pink conch shells), jars and bottles holding softly glowing pearls, bundles of dried seaweed, small fish bones. Relics from the human world 300 years ago, hinting at a lost love: a corroded brass ship's lantern, a fragment of an old hemp fishing net hanging on the wall, a small wooden fishing float. In the middle, a flat stone slab like a table with a large open giant clam shell on it. Dim light comes from a few glowing violet-green anemones and a pale blue glow drifting in from the cave mouth on the right.
Center: the stone table area.
Palette: black, deep teal, murky green, faint violet, with soft pink and pearl accents.
Mood: eerie but not evil: old, wise, lonely, full of memories.
```
