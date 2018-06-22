import main
from main import app

if __name__ == '__main__':
    main.DEVELOPER_MODE = True
    app.run(host='127.0.0.1', port=9396, debug=True)

