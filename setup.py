from distutils.core import setup

setup(
    name='asyonline',
    version="0.1.0.1",
    package_dir={'asyonline' : 'asyonline'},
    packages=['asyonline'],
    package_data={'asyonline' : [
        'templates/*',
        'js/*',
        'static/symbols/*']},
)

