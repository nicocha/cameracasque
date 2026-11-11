import sys
kind, src, name, title, sub = sys.argv[1:6]
if kind == 'outer':
    W, H, h1, p, top, w, pad, r = 1398, 2034, 84, 40, 470, 960, 16, 70
else:
    W, H, h1, p, top, w, pad, r = 2853, 2007, 96, 46, 400, 2000, 20, 64
css = f"""html,body{{margin:0;width:{W}px;height:{H}px;overflow:hidden;background:radial-gradient(120% 60% at 50% 100%,#2a2400 0%,#000 60%);font-family:-apple-system,"SF Pro Display",sans-serif;color:#f5f5f7;text-align:center}}
h1{{margin:{int(H*0.06)}px 80px 0;font-size:{h1}px;line-height:1.08;letter-spacing:-.025em;font-weight:700}}
p{{margin:28px 110px 0;font-size:{p}px;line-height:1.3;color:#a1a1a6}}
.ph{{position:absolute;left:50%;top:{top}px;transform:translateX(-50%);width:{w}px;padding:{pad}px;border-radius:{r+pad}px;background:#1d1d1f;box-shadow:0 0 0 3px #3a3a3c,0 50px 150px rgba(255,227,0,.12)}}
.ph img{{width:100%;display:block;border-radius:{r}px}}"""
open(name, 'w').write(f'<!doctype html><html><head><meta charset=utf-8><style>{css}</style></head><body><h1>{title}</h1><p>{sub}</p><div class=ph><img src="{src}"></div></body></html>')
print(W, H)
