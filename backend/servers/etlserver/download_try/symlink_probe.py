import os
import sys
import logging


def main():
    log = logging.getLogger("main-with-args")

    try:
        src = '/users/weymouth/Desktop'
        dst = '/tmp/symlink-test'
        os.symlink(src, dst)
    except NotImplementedError as nie:
        log.exception(nie)
    except FileExistsError as fee:
        log.exception(fee)
    except OSError as ose:
        log.exception(ose)


if __name__ == "__main__":
    root = logging.getLogger()
    root.setLevel(logging.INFO)

    ch = logging.StreamHandler(sys.stdout)
    ch.setLevel(logging.INFO)
    formatter = logging.Formatter('%(asctime)s - %(levelname)s - %(name)s - %(lineno)s - %(message)s')
    ch.setFormatter(formatter)
    root.addHandler(ch)

    local_log = logging.getLogger("main-setup")

    main()