from __future__ import division, unicode_literals

import os
import tempfile
import subprocess
import pathlib

from flask import Flask, request, render_template, Response


ASY_ENVIRON = dict(os.environ)
def fix_path():
    paths = []
    def add_path(path):
        if path is None:
            return
        if path not in paths:
            paths.append(pathlib.Path(path))
    add_path(os.environ.get('ASYONLINE_PATH_ASYMPTOTE'))
    add_path(os.environ.get('ASYONLINE_PATH_GHOSTSCRIPT'))
    add_path(os.environ.get('ASYONLINE_PATH_TEXLIVE'))
    paths.append(os.environ['PATH'].split(':'))
    return ':'.join(str(path) for path in paths)
ASY_ENVIRON['PATH'] = fix_path()
if 'ASYONLINE_ASYMPTOTE_DIR' in os.environ:
    ASY_ENVIRON['ASYMPTOTE_DIR'] = os.environ['ASYONLINE_ASYMPTOTE_DIR']
if 'ASYONLINE_LIBGS' in os.environ:
    LIBGS = os.environ['ASYONLINE_LIBGS']
else:
    LIBGS = ""
TIMEOUT = 5


app = Flask(__name__)

@app.route('/', methods=['GET'])
def default():
    return render_template('default.html')

@app.route('/compile', methods=['POST'])
def compile_svg():
    asysource = request.form['asysource']
    with tempfile.TemporaryDirectory() as tmpdirname:
        with pathlib.Path(tmpdirname, 'main.asy').open('w') as asyfile:
            asyfile.write(asysource)
        asyprocess = subprocess.Popen( ['asy', '-libgs={}'.format(LIBGS),
                '-outformat', 'svg', 'main.asy'],
            cwd=tmpdirname, env=ASY_ENVIRON,
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

