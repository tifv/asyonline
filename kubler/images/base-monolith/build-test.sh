#!/usr/bin/env sh
set -o errexit -o pipefail -o xtrace

pdflatex --version || exit 1
asy --version || exit 1
gunicorn --version || exit 1

exit 0

