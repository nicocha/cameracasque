# Stylised first-person scenes for each use of a helmet / onboard camera (no third-party imagery).
import json, random
W, H = 1280, 720
HZ = 330
SCENES = {
  # name: palette + path kind + rider (foreground)
  'horse-meadow': dict(sky=('#f2a65e', '#fbe3b8'), hills=['#a7b46a', '#7f9a52', '#5f7f3f'], ground='#8aa64e', path='trail', path_col='#c9a46a', rider='horse', sun=('#fff1c9', 0.7)),
  'moto-mountain': dict(sky=('#3d7bc4', '#dbeaf6'), hills=['#a9b7c6', '#7d8ea3', '#56677d'], ground='#7c8a5c', path='road', path_col='#55585e', line='#ffffff', rider='moto', snow=True),
  'bike-forest':  dict(sky=('#9fc6d6', '#e3efe9'), hills=['#3f6b4a', '#2e5538', '#1f3f29'], ground='#2f5a35', path='trail', path_col='#8a6e4f', rider='bike', trees=True),
  'car-night':    dict(sky=('#05070f', '#1d2440'), hills=['#151a2e', '#10142a', '#0b0e1e'], ground='#0c0f1a', path='road', path_col='#1b1d24', line='#ffe300', rider='car', lights=True),
  'moto-coast':   dict(sky=('#4f9bd9', '#f4e7cf'), hills=['#3f86a8', '#2f6f91'], ground='#c9b48a', path='road', path_col='#5a5c60', line='#ffffff', rider='moto', sun=('#fff3c4', 0.35), sea=True),
  'horse-beach':  dict(sky=('#7fb6e6', '#eaf3f8'), hills=['#5b8fb0'], ground='#e0cb9c', path='trail', path_col='#d4bb88', rider='horse', sea=True),
  'bike-sunset':  dict(sky=('#2b2d6e', '#f6a15b'), hills=['#7a4a6e', '#5a3456', '#3a2240'], ground='#3c2c3f', path='road', path_col='#2e2a33', line='#ffd27a', rider='bike', sun=('#ffd98a', 0.62)),
  'kart-track':   dict(sky=('#5aa2e0', '#dcecf7'), hills=['#9cb98a', '#7ea56c'], ground='#6f9a4e', path='road', path_col='#4b4e54', rider='kart', curbs=True),
  'ski-piste':    dict(sky=('#2f74c8', '#d6e8f7'), hills=['#e9eff6', '#cfdbe8', '#b7c7da'], ground='#f3f6fa', path='piste', path_col='#e6edf5', rider='ski', trees=True, snow=True),
  'car-country':  dict(sky=('#6fb0e8', '#d8ecf8'), hills=['#8fb07a', '#6d955c', '#4d7a45'], ground='#86a85a', path='road', path_col='#4a4d52', line='#f2f2f2', rider='car'),
}

def P(pts): return ' '.join(f'{a:.0f},{b:.0f}' for a, b in pts)

def rider(kind, out):
  if kind == 'moto':  # handlebar, tank, instrument pod, helmet visor edge
    out.append(f'<path d="M0,{H} L0,{H-70} Q{W*0.25},{H-120} {W*0.42},{H-95} L{W*0.58},{H-95} Q{W*0.75},{H-120} {W},{H-70} L{W},{H} Z" fill="#0d0e10"/>')
    out.append(f'<ellipse cx="{W/2}" cy="{H-92}" rx="70" ry="26" fill="#1c1e22"/>')
  elif kind == 'bike':  # aluminium handlebar, stem, black grips, front tyre
    out.append(f'<path d="M{W/2-34},{H} Q{W/2},{H-70} {W/2+34},{H}" fill="#1a1b1e"/>')
    out.append(f'<rect x="{W/2-16}" y="{H-120}" width="32" height="120" rx="6" fill="#6f747b"/>')
    # the bar as a filled band (ImageMagick's SVG renderer drops stroked curves)
    q = lambda t: ((1-t)**2*W*0.12 + 2*(1-t)*t*W*0.5 + t*t*W*0.88, (1-t)**2*(H-70) + 2*(1-t)*t*(H-140) + t*t*(H-70))
    pts = [q(k/40) for k in range(41)]
    for col, hw in (('#2a2c30', 15), ('#a7adb5', 10)):
      out.append(f'<polygon points="{P([(x, y-hw) for x, y in pts] + [(x, y+hw) for x, y in reversed(pts)])}" fill="{col}"/>')
    out.append(f'<rect x="{W/2-34}" y="{H-128}" width="68" height="34" rx="8" fill="#3a3d42"/>')
    for x in (W*0.12, W*0.88):
      out.append(f'<ellipse cx="{x:.0f}" cy="{H-70}" rx="80" ry="30" fill="#111214"/>')
  elif kind == 'horse':  # seen from the saddle: neck with mane, poll, two upright ears, bridle and reins
    c, top = W / 2, H - 250
    out.append(f'<path d="M{c-330},{H} C{c-250},{H-120} {c-120},{top+40} {c-95},{top} L{c+95},{top} C{c+120},{top+40} {c+250},{H-120} {c+330},{H} Z" fill="#7a4a2a"/>')
    out.append(f'<ellipse cx="{c}" cy="{top+6}" rx="104" ry="46" fill="#7a4a2a"/>')
    for sd in (-1, 1):
      out.append(f'<path d="M{c+sd*30},{top-18} Q{c+sd*44},{top-120} {c+sd*70},{top-128} Q{c+sd*80},{top-60} {c+sd*78},{top-10} Z" fill="#6a3f23"/>')
      out.append(f'<path d="M{c+sd*44},{top-22} Q{c+sd*54},{top-90} {c+sd*68},{top-104} Q{c+sd*68},{top-56} {c+sd*66},{top-20} Z" fill="#3e2414"/>')
      out.append(f'<path d="M{c+sd*360},{H} C{c+sd*230},{H-110} {c+sd*140},{top+90} {c+sd*96},{top+20}" stroke="#1e140d" stroke-width="9" fill="none"/>')
    n = 14
    left = [(c - (26 + k/n*60) - (12 if k % 2 else 0), top + 10 + k/n*(H-top-10)) for k in range(0, n+1)]
    right = [(c + (26 + k/n*60) + (12 if k % 2 == 0 else 0), top + 10 + k/n*(H-top-10)) for k in range(n, -1, -1)]
    out.append(f'<polygon points="{P(left + right)}" fill="#2a170c"/>')
    out.append(f'<path d="M{c-30},{top+8} Q{c},{top-40} {c+30},{top+8} Z" fill="#2a170c"/>')
    out.append(f'<path d="M{c-104},{top+10} Q{c},{top+40} {c+104},{top+10}" stroke="#1e140d" stroke-width="8" fill="none"/>')
  elif kind == 'car':  # straight dashboard and a steering wheel; no pillars or mirror (they read as a skew / notch)
    import math
    out.append(f'<rect x="0" y="{H-120}" width="{W}" height="120" fill="#141518"/>')
    out.append(f'<rect x="0" y="{H-124}" width="{W}" height="6" fill="#26282c"/>')
    cx, cy, ro, ri = W * 0.3, H + 40, 230, 200  # wheel rim as a filled ring segment (stroked arcs are dropped)
    arc = lambda r, k: (cx + r * math.cos(math.pi + math.pi * k / 40), cy + r * math.sin(math.pi + math.pi * k / 40))
    out.append(f'<polygon points="{P([arc(ro, k) for k in range(41)] + [arc(ri, k) for k in range(40, -1, -1)])}" fill="#08090a"/>')
  elif kind == 'kart':  # low nose fairing with a number board, small steering wheel
    out.append(f'<path d="M{W*0.18},{H} L{W*0.36},{H-150} L{W*0.64},{H-150} L{W*0.82},{H} Z" fill="#e8b400"/>')
    out.append(f'<rect x="{W/2-60}" y="{H-140}" width="120" height="70" rx="10" fill="#f4f4f4"/>')
    out.append(f'<rect x="{W/2-210}" y="{H-60}" width="420" height="60" rx="26" fill="#0b0b0d"/>')
    out.append(f'<rect x="{W/2-40}" y="{H-90}" width="80" height="40" rx="8" fill="#1b1c1f"/>')
  elif kind == 'ski':  # two ski tips and the pole grips
    for sd in (-1, 1):
      x0 = W / 2 + sd * 120
      out.append(f'<polygon points="{P([(x0-sd*30-40, H), (x0-sd*30+40, H), (x0+22, H-210), (x0-22, H-210)])}" fill="#c4161c"/>')
      out.append(f'<ellipse cx="{x0}" cy="{H-212}" rx="22" ry="12" fill="#e8e8e8"/>')
      out.append(f'<polygon points="{P([(W/2+sd*330, H), (W/2+sd*352, H), (W/2+sd*470, H-300), (W/2+sd*462, H-302)])}" fill="#2a2c30"/>')
  if kind in ('moto', 'bike', 'horse', 'kart', 'ski'):  # helmet visor edge
    out.append(f'<path d="M0,0 L{W},0 L{W},26 Q{W/2},70 0,26 Z" fill="#000" opacity=".55"/>')

def svg(name, s, seed):
  r = random.Random(seed)
  out = [f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}">']
  if s.get('lights'):
    for _ in range(60):
      out.append(f'<circle cx="{r.randint(0,W)}" cy="{r.randint(0,HZ-20)}" r="{r.choice([1,1,2])}" fill="#fff" opacity="{r.uniform(.3,.9):.2f}"/>')
  if s.get('sun'):
    out.append(f'<circle cx="{int(W*s["sun"][1])}" cy="{HZ-40}" r="70" fill="{s["sun"][0]}" opacity=".95"/>')
  for i, col in enumerate(s['hills']):
    base = HZ - 10 + i * 18
    pts, x = [(0, H)], -50
    while x < W + 100:
      pts.append((x, base - r.randint(20, 110 - i * 25))); x += r.randint(90, 220)
    pts += [(W + 60, pts[-1][1]), (W + 60, H)]  # carry the last ridge past the right edge
    out.append(f'<polygon points="{P(pts)}" fill="{col}"/>')
    if s.get('snow') and i == 0:
      for (a, b) in pts[1:-1]:
        out.append(f'<polygon points="{P([(a-22,b+26),(a,b),(a+22,b+26)])}" fill="#f4f7fb"/>')
  if s.get('sea'):
    out.append(f'<rect x="0" y="{HZ+20}" width="{W}" height="60" fill="#3a8fc0"/>')
  out.append(f'<rect x="0" y="{HZ+40}" width="{W}" height="{H}" fill="{s["ground"]}"/>')
  vx = W // 2 + (0 if s['rider'] == 'car' else r.randint(-50, 50))
  if s.get('trees'):
    for k in range(16):
      t = r.random(); y = HZ + 40 + t * 180
      for side in (-1, 1):
        x = vx + side * (90 + t * 520) + r.randint(-30, 30); h = 40 + t * 260
        out.append(f'<rect x="{x-3-t*5:.0f}" y="{y-h*0.25:.0f}" width="{6+t*10:.0f}" height="{h*0.3:.0f}" fill="#3b2a1c"/>')
        out.append(f'<polygon points="{P([(x-h*0.28,y-h*0.2),(x,y-h),(x+h*0.28,y-h*0.2)])}" fill="{r.choice(["#1f4a2b","#2a5c35","#17402a"])}"/>')
  half = (W * 0.36, 0.0) if s['path'] == 'road' else (W * 0.5, 0.0) if s['path'] == 'piste' else (W * 0.22, 0.0)
  out.append(f'<polygon points="{P([(vx-10,HZ+40),(vx+10,HZ+40),(W/2+half[0],H),(W/2-half[0],H)])}" fill="{s["path_col"]}"/>')
  if s.get('curbs'):  # red and white kerbs along both edges
    for k in range(10):
      t0, t1 = (k / 10) ** 1.6, ((k + 1) / 10) ** 1.6
      y0, y1 = HZ + 40 + t0 * (H - HZ - 40), HZ + 40 + t1 * (H - HZ - 40)
      for sd in (-1, 1):
        e0, e1 = vx + (W/2 - vx) * t0 + sd * (10 + (half[0] - 10) * t0), vx + (W/2 - vx) * t1 + sd * (10 + (half[0] - 10) * t1)
        w0, w1 = 2 + t0 * 60, 2 + t1 * 60
        out.append(f'<polygon points="{P([(e0, y0), (e0 + sd*w0, y0), (e1 + sd*w1, y1), (e1, y1)])}" fill="{"#d7262b" if k % 2 else "#f4f4f4"}"/>')
  if s['path'] == 'piste':
    for k in range(9):
      t = ((k + 1) / 10) ** 1.5; y = HZ + 40 + t * (H - HZ - 40); hw = 10 + (half[0] - 10) * t
      out.append(f'<rect x="{vx + (W/2 - vx) * t - hw:.0f}" y="{y:.0f}" width="{2*hw:.0f}" height="{1+t*3:.0f}" fill="#c9d6e4" opacity=".6"/>')
  if s['path'] == 'trail':  # wheel ruts / hoof marks
    for k in range(40):
      t = r.random() ** 1.4; y = HZ + 40 + t * (H - HZ - 40)
      x = vx + (W/2 - vx) * t + r.uniform(-1, 1) * half[0] * t * 0.8
      out.append(f'<ellipse cx="{x:.0f}" cy="{y:.0f}" rx="{1+t*9:.1f}" ry="{0.5+t*3:.1f}" fill="#000" opacity=".12"/>')
  if s.get('line'):
    for k in range(7):
      t0, t1 = (k / 7) ** 1.7, ((k + 0.45) / 7) ** 1.7
      y0, y1 = HZ + 40 + t0 * (H - HZ - 40), HZ + 40 + t1 * (H - HZ - 40)
      x0, x1 = vx + (W/2 - vx) * t0, vx + (W/2 - vx) * t1
      w0, w1 = 1 + t0 * 10, 1 + t1 * 10
      out.append(f'<polygon points="{P([(x0-w0,y0),(x0+w0,y0),(x1+w1,y1),(x1-w1,y1)])}" fill="{s["line"]}" opacity=".9"/>')
  if s.get('lights'):
    for k in range(18):
      t = r.random(); y = HZ + 40 + t * 200
      for side in (-1, 1):
        x = vx + side * (30 + t * 520) + r.randint(-20, 20)
        out.append(f'<circle cx="{x:.0f}" cy="{y:.0f}" r="{2+t*6:.1f}" fill="{r.choice(["#ffd36b","#ff8a5c","#9ad1ff"])}" opacity=".85"/>')
  rider(s['rider'], out)
  out.append('</svg>')
  open(f'{name}.svg', 'w').write('\n'.join(out))

for i, (n, s) in enumerate(SCENES.items()):
  svg(n, s, i + 7)
json.dump({n: s['sky'] for n, s in SCENES.items()}, open('skies.json', 'w'))
