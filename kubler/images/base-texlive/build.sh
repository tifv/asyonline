_packages="
    app-text/texlive-core
    app-text/texlive
    virtual/tex-base
    virtual/latex-base
    dev-texlive/texlive-latex
    dev-texlive/texlive-latexrecommended
    dev-texlive/texlive-latexextra
    dev-texlive/texlive-xetex
    dev-texlive/texlive-luatex
    dev-texlive/texlive-fontsrecommended
    dev-texlive/texlive-fontsextra
    app-text/ghostscript-gpl
"

configure_builder()
{
    # dev-libs/gobject-introspection: just fails
    mask_package dev-libs/gobject-introspection

    update_use 'app-text/texlive' '+l10n_ru' '+l10n_en'
    update_use 'app-text/texlive-core' '+xetex'
    update_use 'app-text/poppler' '-introspection'
    update_use 'media-libs/harfbuzz' '-introspection'
    update_use 'app-text/ghostscript-gpl' '-unicode'
    update_use 'media-libs/harfbuzz' '+use::icu'
    update_use 'media-libs/gd' '+use::png'
    update_use 'media-libs/freetype' '+use::png'

    # dev-libs/glib: fails otherwise
    emerge -u dev-build/cmake \
        dev-libs/glib \
        app-text/poppler app-text/ghostscript-gpl app-text/teckit \
        media-libs/freetype media-libs/harfbuzz \
        dev-libs/kpathsea \
        app-text/texlive-core virtual/tex-base virtual/latex-base \
        dev-texlive/texlive-plaingeneric \
        dev-texlive/texlive-luatex dev-texlive/texlive-latexextra \
        dev-texlive/texlive-xetex
}

finish_rootfs_build()
{
    copy_gcc_libs

    if [[ -f "${_EMERGE_ROOT}/etc/fonts/conf.avail/09-texlive.conf" &&
          -d "${_EMERGE_ROOT}/etc/fonts/conf.f"                     &&
        ! -e "${_EMERGE_ROOT}/etc/fonts/conf.f/09-texlive.conf"     ]]
    then
        ln -sf /etc/fonts/conf.avail/09-texlive.conf \
            "${_EMERGE_ROOT}"/etc/fonts/conf.d/09-texlive.conf 
    fi
}

