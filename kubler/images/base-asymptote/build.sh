_packages="
    media-gfx/asymptote
    net-libs/libtirpc
    app-text/dvisvgm
"
# libtirpc is an unaccounted dependency of asymptote

configure_builder()
{
    mkdir -p /var/portage/
    cp -r /config/repo /var/portage/asymptote
    cp /config/repo.conf /etc/portage/repos.conf/asymptote.conf
    update_use 'dev-libs/boehm-gc' '+cxx'
    update_use 'media-gfx/asymptote' \
        '+svg' '+latex' \
        '-opengl' '-imagemagick' \
        '-python' \
        '+fftw' '+gsl'
    emerge -1u 'sci-libs/fftw' 'sci-libs/gsl' 'dev-libs/boehm-gc' 'dev-libs/libatomic_ops'
    emerge -u 'app-text/dvisvgm'
}

configure_rootfs_build()
{
    :
}

