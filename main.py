import json

from flask import Flask, request, render_template, Response
from jinja2 import Markup

import asy


app = Flask(__name__)
DEVELOPER_MODE = False

app.jinja_env.globals['include_raw'] = (
    lambda filename :
        Markup(app.jinja_loader.get_source(app.jinja_env, filename)[0])
)

@app.route('/', methods=['GET'])
def default():
    return render_template( 'default.html',
        use_cdn=(not DEVELOPER_MODE),
    )

@app.route('/compile', methods=['POST'])
def compile():
    info = json.loads(request.form['info'])
    if 'outformat' not in info or info['outformat'] not in {'svg', 'pdf'}:
        raise BadCompileRequest
    if 'files' not in info or not isinstance(info['files'], list):
        raise BadCompileRequest
    files = {}
    for filename in info['files']:
        if not isinstance(filename, str) or not filename.endswith('.asy'):
            raise BadCompileRequest
        if not filename in request.form:
            raise BadCompileRequest
        files[filename] = request.form[filename]
    if 'main' not in info or not isinstance(info['main'], str):
        raise BadCompileRequest
    if info['main'] not in files:
        raise BadCompileRequest
    result = asy.compile(info['main'], files, outformat=info['outformat'])
    if not result['output']:
        result['output'] = None
    if result['svg'] is not None:
        result['svg'] = result['svg'].decode('utf-8')
    assert result['svg'] is not None or result['error'] is not None
    return Response(json.dumps(result), mimetype='application/json')

@app.route('/status', methods=['GET'])
def status():
    return Response("ok", mimetype='text/plain')

@app.route('/about', methods=['GET'])
def about():
    return render_template('about.html')

class BadCompileRequest(Exception):
    pass

@app.errorhandler(404)
def not_found(exception):
    return render_template('404.html'), 404

@app.errorhandler(BadCompileRequest)
def bad_compile_request(exception):
    return 'Bad compile request', 400

if __name__ == '__main__':
    app.run(host='127.0.0.1', port=9396, debug=False)
else:
    import logging
    gunicorn_logger = logging.getLogger('gunicorn.error')
    app.logger.handlers = gunicorn_logger.handlers
    app.logger.setLevel(gunicorn_logger.level)

