#!/usr/bin/env sh
set -o errexit -o pipefail -o xtrace

asy --version || exit 1

cd /tmp && \
    cp /kubler-test/test.asy test.asy
    asy test.asy -f svg || exit 1

exit 0

