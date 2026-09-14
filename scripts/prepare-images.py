from pathlib import Path
import json
import shutil
from PIL import Image

root = Path(__file__).resolve().parents[1]
source = root.parent / 'linksource-designs'
output = root / 'public' / 'images'
output.mkdir(parents=True, exist_ok=True)
for item in json.loads((source / 'asset-manifest.json').read_text(encoding='utf-8')):
    image = Image.open(item['source']).convert('RGB')
    stem = Path(item['asset']).stem
    for width in (480, 960, 1920):
        height = round(image.height * width / image.width)
        image.resize((width, height), Image.Resampling.LANCZOS).save(output / f'{stem}-{width}.webp', quality=82, method=6)
shutil.copyfile(source / 'assets' / 'logo.svg', root / 'public' / 'logo.svg')
print(f'Created 33 responsive images: {sum(p.stat().st_size for p in output.glob("*.webp")) / 1024 / 1024:.1f} MB')
