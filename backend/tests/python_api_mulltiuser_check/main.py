import logging
import sys
from extras.test_scripts.mulltiuser_check.MultiuserStress import MultiuserStress

def main(number_of_users):
    main_log = logging.getLogger("top_level_run")
    main_log.info("Starting...")
    test = MultiuserStress(number_of_users)
    test.setup()
    test.run()
    main_log.info("End")


if __name__ == "__main__":
    root = logging.getLogger()
    root.setLevel(logging.INFO)

    ch = logging.StreamHandler(sys.stdout)
    ch.setLevel(logging.INFO)
    formatter = logging.Formatter('%(asctime)s - %(levelname)s - %(name)s - %(lineno)s - %(message)s')
    ch.setFormatter(formatter)
    root.addHandler(ch)

    startup_log = logging.getLogger("top_level_setup")
    startup_log.info("Starting...")
    number_of_users = 100
    startup_log.info("setting number of users = {}".format(number_of_users))
    main(number_of_users)
    startup_log.info("End.")
