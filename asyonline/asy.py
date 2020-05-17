import time
import io
import os
import stat
import fcntl
import selectors
import subprocess
from tempfile import TemporaryDirectory
from pathlib import Path

ASY_TIME_LIMIT = 3.0
ASY_OUTPUT_LIMIT = 2**15 # bytes

ERROR_TIME_LIMIT = "Process exceeded time limit ({}s). Aborted." \
    .format(ASY_TIME_LIMIT)
ERROR_OUTPUT_LIMIT = "Process exceeded output limit ({}KB). Aborted." \
    .format(int(ASY_OUTPUT_LIMIT/2**10))
ERROR_FAILURE = "Compilation failed."
ERROR_NOIMAGE = "No image output."

ASY_ENVIRON = dict(os.environ)
def fix_path():
    paths = []
    def add_path(path):
        if path is None:
            return
        if path not in paths:
            paths.append(Path(path))
    add_path(os.environ.get('ASYONLINE_PATH_ASYMPTOTE'))
    add_path(os.environ.get('ASYONLINE_PATH_GHOSTSCRIPT'))
    add_path(os.environ.get('ASYONLINE_PATH_TEXLIVE'))
    paths.extend(os.environ['PATH'].split(':'))
    return ':'.join(str(path) for path in paths)
ASY_ENVIRON['PATH'] = fix_path()
if 'ASYONLINE_ASYMPTOTE_DIR' in os.environ:
    ASY_ENVIRON['ASYMPTOTE_DIR'] = os.environ['ASYONLINE_ASYMPTOTE_DIR']
if 'ASYONLINE_ASYMPTOTE_HOME' in os.environ:
    ASY_ENVIRON['ASYMPTOTE_HOME'] = os.environ['ASYONLINE_ASYMPTOTE_HOME']

if 'ASYONLINE_ASY' in os.environ:
    ASY = os.environ['ASYONLINE_ASY']
else:
    ASY = 'asy'

if 'ASYONLINE_LIBGS' in os.environ:
    LIBGS = os.environ['ASYONLINE_LIBGS']
else:
    LIBGS = ""

def compile(mainname, files, outformat='svg'):
    """
    Return {
        'error': <str> or None,
        'output' : <str>,
        outformat : <bytes> or None, }
    """
    if outformat not in {'svg', 'pdf'}:
        raise ValueError("Outformat not supported: {}".format(outformat))
    error = output = result = None
    with TemporaryDirectory() as inputdir, TemporaryDirectory() as outputdir:
        os.chmod( inputdir,
            stat.S_IXUSR | stat.S_IRUSR | stat.S_IWUSR |
            stat.S_IXGRP | stat.S_IRGRP )
        os.chmod( outputdir,
            stat.S_IXUSR | stat.S_IRUSR | stat.S_IWUSR |
            stat.S_IXGRP | stat.S_IRGRP | stat.S_IWGRP )
        for filename in files:
            with Path(inputdir, filename).open('w') as fileobj:
                fileobj.write(files[filename])
        outpath = Path(outputdir, 'main.{}'.format(outformat))
        asyprocess = subprocess.Popen( [ ASY, '-offscreen',
                '-libgs={}'.format(LIBGS),
                '-outformat', outformat,
                mainname,
                '-outname', str(outpath) ],
            cwd=inputdir, env=ASY_ENVIRON,
            stdout=subprocess.PIPE, stderr=subprocess.STDOUT,
            universal_newlines=False )
        time_finish = time.perf_counter() + ASY_TIME_LIMIT
        try:
            output = _read_until( asyprocess.stdout,
                time_finish, ASY_OUTPUT_LIMIT )
        except _ReadTimeLimit as read_error:
            asyprocess.kill()
            error = ERROR_TIME_LIMIT
            output = read_error.output
        except _ReadByteLimit as read_error:
            asyprocess.kill()
            error = ERROR_OUTPUT_LIMIT
            output = read_error.output
        else:
            try:
                asyprocess.wait(time_finish - time.perf_counter())
            except subprocess.TimeoutExpired:
                asyprocess.kill()
                error = ERROR_TIME_LIMIT
        output = output.decode('utf-8', errors='replace')
        if error is None and asyprocess.returncode > 0:
            error = ERROR_FAILURE
        try:
            with outpath.open('rb') as outfile:
                result = outfile.read()
        except FileNotFoundError:
            if error is None:
                error = ERROR_NOIMAGE
        return {'error' : error, 'output' : output, outformat : result}

def _read_until(stream, time_finish, byte_limit):
    # time_finish is as from time.perf_counter()

    fd = stream.fileno()
    fl = fcntl.fcntl(fd, fcntl.F_GETFL)
    fcntl.fcntl(fd, fcntl.F_SETFL, fl | os.O_NONBLOCK)

    output_sel = selectors.DefaultSelector()
    output_sel.register(stream, selectors.EVENT_READ)
    output_io = io.BytesIO()
    output_len = 0

    while True:
        time_current = time.perf_counter()
        if time_finish > time_current:
            events = output_sel.select(time_finish - time_current)
            if not events:
                raise _ReadTimeLimit(output_io.getvalue())
        else:
            time_finish = None
        assert byte_limit > output_len
        output_piece = stream.read(byte_limit - output_len)
        if len(output_piece) == 0:
            return output_io.getvalue()
        output_io.write(output_piece)
        output_len += len(output_piece)
        if byte_limit <= output_len:
            raise _ReadByteLimit(output_io.getvalue())
        if time_finish is None:
            raise _ReadTimeLimit(output_io.getvalue())

class _ReadException(Exception):
    __slots__ = ['output']
    def __init__(self, output):
        assert isinstance(output, bytes), type(output)
        self.output = output
        super().__init__()

class _ReadTimeLimit(_ReadException):
    pass

class _ReadByteLimit(_ReadException):
    pass

