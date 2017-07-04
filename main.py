from __future__ import division, unicode_literals

import os
import tempfile
import subprocess
import pathlib

from flask import Flask, request, render_template, Response

app = Flask(__name__)

@app.route('/', methods=['GET'])
def default():
    return render_template('default.html')

ENVIRON = dict(os.environ)
APP_DIR = pathlib.Path(__file__).resolve().parent
TOOLS_DIR = APP_DIR / 'tools'
if TOOLS_DIR.exists():
    ENVIRON['PATH'] = (
        str(TOOLS_DIR/'bin') + ':' +
        str(TOOLS_DIR/'texlive/bin/x86_64-linux') + ':' +
        ENVIRON['PATH'] )
    ENVIRON['ASYMPTOTE_DIR'] = str(TOOLS_DIR/'share/asymptote')
    LIBGS = str(TOOLS_DIR/"lib/libgs.so")
else:
    LIBGS = ""

TIMEOUT = 5

@app.route('/compile', methods=['POST'])
def compile():
    asysource = request.form['asysource']
    with tempfile.TemporaryDirectory() as tmpdirname:
        with pathlib.Path(tmpdirname, 'main.asy').open('w') as asyfile:
            asyfile.write(asysource)
        asyprocess = subprocess.Popen( ['asy', '-libgs={}'.format(LIBGS),
                '-outformat', 'svg', 'main.asy'],
            cwd=tmpdirname, env=ENVIRON,
            stdout=subprocess.PIPE, stderr=subprocess.STDOUT, )
        try:
            output, erroutput = asyprocess.communicate(timeout=TIMEOUT)
        except subprocess.TimeoutExpired:
            asyprocess.kill()
            return Response(
                "Process took too long to complete (>{}s). Aborted."
                    .format(TIMEOUT),
                mimetype="text/plain" )
        if asyprocess.returncode > 0:
            return Response(output, mimetype="text/plain")
        try:
            with pathlib.Path(tmpdirname, 'main.svg').open('r') as svgfile:
                return Response(svgfile.read(), mimetype="image/svg+xml")
        except FileNotFoundError:
            return Response( "No image output (empty image?).",
                mimetype="text/plain" )

@app.errorhandler(404)
def not_found(exception):
    return render_template('404.html'), 404

if __name__ == '__main__':
    app.run(host='127.0.0.1', port=9396, debug=False)

