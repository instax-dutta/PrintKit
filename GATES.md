# Gates: PrintKit v1.0 build (full PRD §6, §10, §14)

OWNS: src/**, public/**, tests/**, scripts/**, index.html, package.json, tsconfig.json, vite.config.ts, tailwind.config.js, postcss.config.js, README.md, venv/**

Scope: Complete static PWA per PRD.md - all P0 tools, state store, presets, import/export, theme, command palette, service worker offline + update prompt, unit tests covering every §10 vector and §14 docs.

- [x] G1: All unit and smoke tests pass, including every PRD §10 numeric vector
  CHECK: npx vitest run
  EXPECT: /Tests\s+\d+ passed\s+\(\d+\)/
  CWD: .
  EVIDENCE: automatic-evidence=v1; definition-sha256=8285682b73898c2b35776b25c4553d56a0a84ec8744fabac6ebd5a273e605db2; exit=0; EXPECT=matched; output-sha256=44e024d38600e013d782d678eced234142a8d946f5fac1d3b05db921db31a5c5; output-bytes=542; shell=/bin/sh; cwd=/Users/saiduttaabhishekdash/PrintKit; path=b93c3fbfaca3/30 entries

- [x] G2: Production build succeeds and offline assets are present
  CHECK: npm run build && node -e "const fs=require('fs');[['dist/index.html','index.html'],['dist/sw.js','sw.js'],['dist/manifest.webmanifest','manifest'],['dist/icon-192.png','icon-192'],['dist/icon-512.png','icon-512'],[fs.readdirSync('dist/assets').some(f=>/\.css$/.test(f)),'css']].forEach(([ok,name])=>{if(!ok){process.exitCode=1;console.error('MISSING',name)}else console.log('OK',name)})"
  EXPECT: OK css
  CWD: .
  EVIDENCE: automatic-evidence=v1; definition-sha256=b3834673a514fe11b1cc974c6ae1873f8e45a218eeee97d30d28e0ab7d75101d; exit=0; EXPECT=matched; output-sha256=dea3a78cd273778a803a7b605b60b5112c8fe0e575add664d2f4ab6cfec77f15; output-bytes=1514; shell=/bin/sh; cwd=/Users/saiduttaabhishekdash/PrintKit; path=b93c3fbfaca3/30 entries

- [ ] M1: Deployed to a public static URL (PRD §14)
  EVIDENCE: pending

- [ ] M2: Lighthouse mobile targets met: Perf ≥ 95, A11y ≥ 95, PWA installable (PRD §5.5)
  EVIDENCE: pending

### Notes
- M1/M2 remain manual: no hosting credentials or Lighthouse runner in this environment; surface as handoff if unfinished.
- Comma-as-decimal is normalized rule-wide (PRD §5.1); documented in README Decisions.
