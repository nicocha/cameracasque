// Every download / GitHub link on the site is built from these values.
const CONFIG = {
  repo: 'nicocha/cameracasque', // GitHub "owner/name"
  testflight: '', // public TestFlight invitation, e.g. "https://testflight.apple.com/join/XXXXXXXX"
  play: 'https://play.google.com/apps/testing/com.nicocha.cameracasque', // Google Play closed test, until the app is in production
  testers: 'https://groups.google.com/g/testeurs-cameracasque', // joining this group gives access to the test
};

const gh = `https://github.com/${CONFIG.repo}`;
const LINKS = {
  repo: gh,
  releases: `${gh}/releases`,
  issues: `${gh}/issues`,
  play: CONFIG.play,
  testers: CONFIG.testers,
  testflight: CONFIG.testflight,
};

// Until the TestFlight invitation exists, its buttons keep their in-page fallback (#installer).
for (const a of document.querySelectorAll('a[data-link]')) {
  if (LINKS[a.dataset.link]) a.href = LINKS[a.dataset.link];
}

// Reveal sections as they scroll in; CSS skips this entirely with Reduce Motion.
const io = new IntersectionObserver(
  (entries) => entries.forEach((e) => e.isIntersecting && (e.target.classList.add('is-in'), io.unobserve(e.target))),
  { rootMargin: '0px 0px -10% 0px' },
);
document.querySelectorAll('.reveal').forEach((el) => io.observe(el));
