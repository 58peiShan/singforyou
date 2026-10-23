import sys
sys.path.insert(0,'tools')
from cut_sprites import cut
from PIL import Image,ImageDraw
from pathlib import Path
import numpy as np
from scipy import ndimage as ndi
out=Path('.tmp/gap-check');out.mkdir(parents=True,exist_ok=True)
for name in ['康_普通','阿英_普通']:
 im=Image.open(Path('img/立繪')/(name+'.png')).convert('RGB'); a=np.asarray(im).astype(np.int16);rgba,info=cut(a.astype(np.uint8));bg=np.median(np.concatenate([a[0],a[-1],a[:,0],a[:,-1]]),axis=0);d=np.abs(a-bg).max(2);neutral=np.ptp(a,axis=2)<16
 lab,n=ndi.label(neutral & (d<45) & (rgba[:,:,3]>200));sizes=np.bincount(lab.ravel());boxes=ndi.find_objects(lab)
 print(name,info)
 for i,box in enumerate(boxes,1):
  if sizes[i]<8:continue
  vals=a[box][lab[box]==i];print(' candidate',sizes[i],(box[1].start,box[0].start,box[1].stop,box[0].stop),'rgb',np.median(vals,axis=0).tolist(),'dist',float(np.median(d[box][lab[box]==i])))
 result=Image.new('RGBA',im.size,'#e6acc6');result.alpha_composite(Image.fromarray(rgba));result.convert('RGB').save(out/(name+'.png'))