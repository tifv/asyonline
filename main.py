from __future__ import division, unicode_literals

import pathlib
import json

from flask import Flask, request, render_template, Response

import asy


app = Flask(__name__)

@app.route('/', methods=['GET'])
def default():
    return render_template('default.html')

@app.route('/compile', methods=['POST'])
def compile_svg():
    result = asy.compile(request.form['asysource'], outformat='svg')
    if not result['output']:
        result['output'] = None
    if result['svg'] is not None:
        result['svg'] = result['svg'].decode('utf-8')
    assert result['svg'] is not None or result['error'] is not None
    return Response(json.dumps(result), mimetype='application/json')

@app.route('/about', methods=['GET'])
def about():
    return render_template('about.html')

@app.errorhandler(404)
def not_found(exception):
    return render_template('404.html'), 404

if __name__ == '__main__':
    app.run(host='127.0.0.1', port=9396, debug=False)

