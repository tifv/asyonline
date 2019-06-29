# Online Asymptote Compiler

## Environment variables expected by application
- `ASYONLINE_PATH_ASYMPTOTE` directory containing `asy` binary.
- `ASYONLINE_PATH_GHOSTSCRIPT` directory containing `gs` binary.
- `ASYONLINE_PATH_TEXLVE` directory containing TexLive binaries:
  `latex`, `dvisvgm` and others.
- `ASYONLINE_ASYMPTOTE_DIR` directory containing Asymptote files
  (would be `$PREFIX/share/asymptote` on normal system).
- `ASYONLINE_LIBGS` path to `libgs.so` (with filename).
  If dvisvgm was statically linked with libgs (usually not the case),
  this variable must be empty.

## Run
`gunicorn asyonline.main:app`

