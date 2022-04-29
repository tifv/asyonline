import json

from flask import ( Flask, request, render_template, Response,
    send_from_directory )
from markupsafe import Markup

from asyonline import asy


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
        use_static_js=(not DEVELOPER_MODE),
    )

@app.route('/compile/svg', methods=['POST'])
def compile_svg():
    info, files = get_compile_data(request.form)
    result = asy.compile(info['main'], files, outformat='svg')
    if not result['output']:
        result['output'] = None
    if result['svg'] is not None:
        result['svg'] = result['svg'].decode('utf-8')
    assert result['svg'] is not None or result['error'] is not None
    return Response(json.dumps(result), mimetype='application/json')

@app.route('/compile/pdf', methods=['POST'])
def compile_pdf():
    info, files = get_compile_data(request.form)
    result = asy.compile(info['main'], files, outformat='pdf')
    if not result['pdf']:
        return "No image output", 400
    return Response(result['pdf'], mimetype='application/pdf')

def get_compile_data(request_form):
    info = None
    files = {}
    for name, value in request_form.items():
        if name == 'info':
            info = json.loads(request_form['info'])
        else:
            if not name.endswith('.asy') or '/' in name:
                raise BadCompileRequest
            files[name] = value
    if info is None:
        raise BadCompileRequest
    if 'main' not in info or not isinstance(info['main'], str):
        raise BadCompileRequest
    if info['main'] not in files:
        raise BadCompileRequest
    return info, files

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

# This should be handled by web server instead
@app.route('/js/<path:path>')
def send_js(path):
    return send_from_directory('js', path)


if __name__ == '__main__':
    app.run(host='127.0.0.1', port=9396, debug=False)
else:
    import logging
    gunicorn_logger = logging.getLogger('gunicorn.error')
    app.logger.handlers = gunicorn_logger.handlers
    app.logger.setLevel(gunicorn_logger.level)

