import os
import sys
import argparse
import logging
from ..utils.LoggingHelper import LoggingHelper
from ..utils.ConfClientHelper import ConfClientHelper
from ..common.GlobusAccess import GlobusAccess
from ..globus_monitor.GlobusMonitor import GlobusMonitor


def main(command, loops, arg_id):
    LoggingHelper().set_root(default=logging.ERROR)

    commands = ConfClientHelper()
    if command == 'report' and arg_id:
        print("Report for id = {}".format(arg_id))
        commands.setup(full=True)
        commands.report(task_id=arg_id)
    elif command == 'report':
        print("Report for all tasks")
        commands.setup(full=True)
        commands.report()
    elif command == 'monitor':
        print("Monitor for {} loops".format(loops))
        commands.monitor(loops)
    elif command == 'cancel':
        print("Cancel task with id = {}". format(arg_id))
        commands.cancel(arg_id)


if __name__ == "__main__":

    env_list = ['MC_CONFIDENTIAL_CLIENT_USER', 'MC_CONFIDENTIAL_CLIENT_PW']

    print("")
    env_values = {}
    missing = []
    for env_name in env_list:
        env_value = os.environ.get(env_name)
        env_values[env_name] = env_value
        if not env_value:
            missing.append(env_name)
    if missing:
        message = "Missing environment values: {}".format(", ".join(missing))
        print(message)
        exit(-1)

    if not GlobusAccess().get_impl_type() == 'cc':
        print("GlobusAccess is not implemented with the Confidential Client interface")
        print("Can not continue")
        exit(-1)

    argv = sys.argv
    parser = argparse.ArgumentParser(description='Test to transfer from dir of hard links')
    parser.add_argument('command', type=str, help="Monitor Command")
    parser.add_argument('--id', type=str, help="(optional) Task ID")
    parser.add_argument('--loops', type=int,
                        help="Number of loops for monitor; defaults to 20")
    args = parser.parse_args(argv[1:])

    command_list = ['monitor', 'report', 'cancel']
    arg_command = args.command
    found = None
    for target in command_list:
        if arg_command == target:
            found = arg_command
    if not found:
        print("The given command, '{}', is not one of the accepted commands: {}"
              .format(arg_command, command_list))
        print("")
        parser.print_help()
        exit(-1)

    if arg_command == 'cancel' and not args.id:
        print("The 'cancel' command, requires an id, none was given.")
        print("")
        parser.print_help()
        exit(-1)

    if not args.loops:
        args.loops = 20

    main(arg_command, args.loops, args.id)

    print("Done")
