FROM asyonline/base-monolith

COPY asyonline /asyonline

RUN \
    echo asyonline:x:1000:1000:asyonline:/home/asyonline:/sbin/nologin > /etc/passwd ; \
    echo asyonline:x:1000:asyonline > /etc/group ; \
    mkdir -p /home/asyonline ; \
    chown -R asyonline:asyonline /home/asyonline ;

USER asyonline:asyonline

EXPOSE 8000
WORKDIR /
CMD ["gunicorn", "-b", "0.0.0.0:8000", "asyonline.main:app"]

