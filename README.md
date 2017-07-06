# Online Asymptote Compiler

## Environment variables expected by application
- `ASYONLINE_PATH_ASYMPTOTE` directory containing `asy` binary.
- `ASYONLINE_PATH_GHOSTSCRIPT` directory containing `gs` binary.
- `ASYONLINE_PATH_TEXLVE` directory containing TexLive binaries: `latex`, `dvisvgm` and others.
- `ASYONLINE_ASYMPTOTE_DIR` directory containing Asymptote files
  (would be `$PREFIX/share/asymptote` on normal system).
- `ASYONLINE_LIBGS` path to `libgs.so` (with filename).
  If dvisvgm was statically linked with libgs (usually not the case), this variable must be empty.

Note that binaries and libraries mentioned above are not provided by this repo.
When deploying to Heroku, custom buildpack is recommended to download precompiled packages and unpack them into slug.
