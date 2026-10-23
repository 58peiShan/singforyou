from pathlib import Path
from PIL import Image,ImageDraw
import sys,numpy as np
sys.path.insert(0,'tools')
from cut_sprites import cut,CLEANUP_REGIONS
out=Path('.tmp/gap-check')
for p in list(Path('img/立繪').glob('阿英_*.png'))+list(Path('img/立繪').glob('康_*.png')):
 im=Image.open(p).convert('RGB');rgba,_=cut(np.asarray(im),cleanup_regions=CLEANUP_REGIONS.get(p.stem.split("_")[0],[]));base=Image.new('RGBA',im.size,'#e6acc6');base.alpha_composite(Image.fromarray(rgba))
 boxes=[(385,0,645,280),(645,670,725,820)] if p.stem.startswith('阿英') else [(415,0,645,290),(310,165,410,310)]
 preview=Image.new('RGB',(1040,620),'white');draw=ImageDraw.Draw(preview)
 for i,box in enumerate(boxes):
  crop=base.crop(box);crop.thumbnail((510,580));crop=crop.resize((crop.width*2,crop.height*2)) if crop.height<290 else crop
  preview.paste(crop.convert('RGB'),(i*520,30));draw.text((i*520,5),str(box),fill='black')
 preview.save(out/(p.stem+'-detail.png'))
 print(p.name,im.size)