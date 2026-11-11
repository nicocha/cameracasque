# TEMP-TOUR: drives the app through its 5 screens on its own, for timed screenshots. NEVER COMMIT.
# Final version used for the store captures (transcript 828745be L20662 2026-10-27T13:40 + L20736 13:45
# timings 20/40/60/80 s; reapplied as-is for iPhone Duo at L21202 15:07). Paths updated to app/src.
# Apply:  python3 tour.py      Revert: git checkout app/src/app/_layout.tsx "app/src/app/(tabs)/index.tsx"
import os
R = os.path.join(os.path.dirname(os.path.abspath(__file__)), '../../../src/')
p=R+'app/_layout.tsx'; s=open(p).read()
s=s.replace('import { DarkTheme, DefaultTheme, ThemeProvider } from "expo-router";','import { DarkTheme, DefaultTheme, ThemeProvider, router } from "expo-router";\nimport { useEffect as useTourEffect } from "react";\nimport { cam } from "../camera";\nimport { browsing } from "../media";',1)
s=s.replace('export default function Layout() {\n','''export default function Layout() {
    // TEMP-TOUR
    useTourEffect(() => {
        const at = (t: number, f: () => void) => setTimeout(f, t * 1000);
        at(20, () => router.navigate("/gallery"));
        at(40, async () => {
            const all = (await cam.files()).sort((a, b) => a.time.localeCompare(b.time));
            browsing.files = all;
            router.push({ pathname: "/view", params: { index: String(all.length - 6) } });
        });
        at(60, () => { router.back(); setTimeout(() => router.navigate("/settings"), 800); });
        at(80, () => router.push("/settings/help"));
    }, []);
''',1)
assert 'TEMP-TOUR' in s
open(p,'w').write(s)
p=R+'app/(tabs)/index.tsx'; s=open(p).read()
a="const [preview, setPreview] = useState(false);"; assert a in s
open(p,'w').write(s.replace(a,"const [preview, setPreview] = useState(true); // TEMP-TOUR"))
print('TEMP-TOUR applied')
