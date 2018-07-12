import main
from main import app

main.DEVELOPER_MODE = True

if __name__ == '__main__':
    app.jinja_env.auto_reload = True
    app.config['TEMPLATES_AUTO_RELOAD'] = True
    app.run(host='127.0.0.1', port=9396, debug=True)

