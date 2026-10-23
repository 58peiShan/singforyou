from pathlib import Path
from datetime import datetime
import shutil
from PIL import Image, ImageDraw

root = Path.cwd()
source = root / 'game/assets/sprites'
target = root / 'game/assets/face'
expressions = ['普通', '笑', '害羞', '驚訝', '難過', '認真']
backup = root / '.tmp' / ('face-backup-' + datetime.now().strftime('%Y%m%d-%H%M%S'))
backup.mkdir(parents=True, exist_ok=True)
preview = Image.new('RGB', (1152, 448), '#162442')
mask = Image.new('L', (180, 180), 0)
ImageDraw.Draw(mask).ellipse((0, 0, 179, 179), fill=255)
for i, expression in enumerate(expressions):
    name = f'孫承完_{expression}.png'
    old = target / name
    if old.exists():
        shutil.copy2(old, backup / name)
    with Image.open(source / name) as image:
        face = image.convert('RGBA').crop((130, 0, 490, 360)).resize((512, 512), Image.Resampling.LANCZOS)
    face.save(old, optimize=True)
    assert face.size == (512, 512) and face.mode == 'RGBA'
    assert face.getchannel('A').getextrema()[0] == 0
    thumb = face.resize((180, 180), Image.Resampling.LANCZOS)
    square = Image.new('RGBA', (180, 180), '#31466b')
    square.alpha_composite(thumb)
    preview.paste(square.convert('RGB'), (i * 192 + 6, 12))
    preview.paste(square.convert('RGB'), (i * 192 + 6, 224), mask)
    print(name, '512x512 RGBA')
preview.save(root / '.tmp/seungwan-face-preview.png')
print('Preview order: neutral, smile, shy, surprised, sad, serious')
print('Backup:', backup)