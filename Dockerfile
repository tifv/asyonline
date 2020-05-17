FROM asyonline/base-monolith

COPY ["asyonline", "/asyonline"]
COPY ["runasy/runasy", "/home/asyonline/runasy"]

RUN \
    set -o xtrace ; \
    echo asyonline:x:1000:1000:asyonline:/home/asyonline:/sbin/nologin > /etc/passwd ; \
    echo asyonline:x:1000:asyonline > /etc/group ; \
    mkdir -p /home/asyonline ; \
    chown -R asyonline:asyonline /home/asyonline ; \
    echo asymptote:x:1001:1000:asyonline:/home/asymptote:/sbin/nologin >> /etc/passwd ; \
    mkdir -p /home/asymptote ; \
    chown -R asymptote:asyonline /home/asymptote ; \
    chown asymptote:asyonline /home/asyonline/runasy ; \
    chmod a-w,a+x,u+s /home/asyonline/runasy ;

USER asyonline:asyonline

ENV \
    ASYONLINE_ASY="/home/asyonline/runasy" \
    ASYONLINE_ASYMPTOTE_HOME="/home/asymptote/.asy/"

EXPOSE 8000
WORKDIR /
CMD ["gunicorn", "-b", "0.0.0.0:8000", "asyonline.main:app"]

