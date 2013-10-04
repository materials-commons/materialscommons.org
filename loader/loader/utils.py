import os
import errno
import subprocess

def mkdirp(path):
    try:
        os.makedirs(path)
    except OSError as exc:
        if exc.errno == errno.EEXIST and os.path.isdir(path):
            pass
        else:
            raise

def runtika(option, path):
    p = subprocess.Popen(["java","-jar", "/usr/mc/bin/tika-app-1.3.jar", option, path], stdout=subprocess.PIPE)
    (data, ignore) = p.communicate()
    return data
