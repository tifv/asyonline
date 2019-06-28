from distutils.core import setup

setup(
    name='asyonline',
    version="0.1.0.0",
    package_dir={'asyonline' : ''},
    packages=['asyonline'],
    package_data={'asyonline' : [
        'templates/*',
        'js/*',
        'static/symbols/*']},
)

