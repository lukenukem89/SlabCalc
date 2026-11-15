#!/bin/sh
# Publishes the web version to GitHub Pages (branch gh-pages) → https://lukenukem89.github.io/SlabCalc/
set -e
cd "$(dirname "$0")/.."
npm run vendor >/dev/null
SITE=$(mktemp -d)
cp SlabCalc.html "$SITE/index.html"
cp SlabCalc.html "$SITE/SlabCalc.html"
cp -R vendor "$SITE/vendor"
touch "$SITE/.nojekyll"
REMOTE=$(git remote get-url origin)
cd "$SITE"
git init -q -b gh-pages
git add -A
git commit -qm "Publish web app"
git push -qf "$REMOTE" gh-pages
rm -rf "$SITE"
echo "Published: https://lukenukem89.github.io/SlabCalc/ (live in about a minute)"
