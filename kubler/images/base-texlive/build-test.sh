#!/usr/bin/env sh
set -o errexit -o pipefail -o xtrace

pdflatex --version || exit 1

xelatex --version || exit 1

lualatex --version || exit 1

cd /tmp && \
    cp /usr/share/texmf-dist/tex/latex/base/small2e.tex small2e.tex && \
    pdflatex small2e.tex || exit 1

exit 0

