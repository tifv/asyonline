FROM asyonline/base-monolith

COPY ["asyonline", "/asyonline"]
COPY ["runasy/exec", "/runasy/exec"]

RUN \
    set -o xtrace ; \
:; \
    echo asyonline:x:1000:1000:asyonline:/home/asyonline:/sbin/nologin >> /etc/passwd ; \
    echo asymptote:x:1001:1000:asyonline:/home/asymptote:/sbin/nologin >> /etc/passwd ; \
    echo asyonline:x:1000:asyonline > /etc/group ; \
:; \
    mkdir --parents /home/asyonline ; \
        chown -R asyonline:asyonline /home/asyonline ; chmod 700 /home/asyonline ; \
:; \
    echo '#!/bin/bash'                           >> /runasy/asy ; \
    echo 'exec /runasy/exec /usr/bin/asy "${@}"' >> /runasy/asy ; \
    echo '#!/bin/bash'                        >> /runasy/kill ; \
    echo 'exec /runasy/exec /bin/kill "${@}"' >> /runasy/kill ; \
        chown -R asyonline:asyonline /runasy ; chmod 700 /runasy ; \
        chown asymptote:asyonline /runasy/exec ; \
        chmod a-w,a+x,u+s /runasy/exec ; \
        chmod a+x /runasy/asy /runasy/kill ; \
:; \
    mkdir --mode=700 --parents /home/asymptote ; \
        chown -R asymptote:asyonline /home/asymptote ; chmod 700 /home/asymptote ; \
:; \
    mkdir /var/cache/fonts --mode 1777 ; \
:;

USER asyonline:asyonline

ENV \
    ASYONLINE_ASY="/runasy/asy" \
    ASYONLINE_KILL="/runasy/kill" \
    ASYONLINE_ASYMPTOTE_HOME="/home/asymptote/.asy/"

EXPOSE 8000
WORKDIR /
CMD ["gunicorn", "-b", "0.0.0.0:8000", "asyonline.main:app"]

