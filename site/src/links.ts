// Redirects: thomasdhughes.com/<slug> → external URL
export const redirects: Record<string, string> = {
  // GitHub repos
  "nyc-freight-code": "https://github.com/thomasdhughes/nyc-freight-visualizer",
  "presstext-code": "https://github.com/tdh15/pressText/tree/main",
  "liars-dice-code": "https://github.com/tdh15/liars-dice",
  "js-bookmarks-code": "https://github.com/thomasdhughes/js-bookmarks",
  "keyboard-pong-code": "https://github.com/thomasdhughes/keyboard-pong",
  "bubble-letters-code": "https://github.com/thomasdhughes/bubble-letters",

  // Papers
  "presstext-paper": "https://drive.google.com/file/d/11AfG-0_asYCTSYVBdnRqjNnDpOzTIzpT/view",
  "liars-dice-paper": "https://drive.google.com/file/d/1esJMoQtdgpe6PiHuigPJ4KGgsfX2i6Ct/view",

  // Colab notebooks
  "steel-arteries-data": "https://colab.research.google.com/drive/1e8tK4bFbaPH_dLI_LDpsyDySj9ikLQv-?usp=sharing",
  "pi-day-script": "https://colab.research.google.com/drive/1Qg623TRIww71AMxAAfQ1SXhu8HlEJc-z?usp=sharing",

  // Other demos
  "presstext-demo": "https://www.loom.com/share/55aadf1aa3cd4486b3d4e8ef67fbc68e",
  "js-bookmarks": "https://thomasdhughes.github.io/js-bookmarks/",
};

// Hosted demos: served directly at thomasdhughes.com/<slug>
export const hostedDemos = [
  { slug: "steel-arteries-viz", repo: "thomasdhughes/nyc-freight-visualizer", branch: "gh-pages" },
  { slug: "keyboard-pong-game", repo: "thomasdhughes/keyboard-pong", branch: "gh-pages" },
  { slug: "bubble-letters-demo", repo: "thomasdhughes/bubble-letters", branch: "gh-pages" },
  { slug: "csv-to-html-table", repo: "thomasdhughes/csv-to-html-table", branch: "main" },
];
