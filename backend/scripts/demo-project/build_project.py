#!/usr/bin/python

import argparse
from os import path as os_path
from .demo_project import DemoProject
import traceback


parser = argparse.ArgumentParser(description='Build Demo Project.')
parser.add_argument('--host', required=True,
                    help='the url for the Materials Commons server')
parser.add_argument('--datapath', required=True,
                    help='the path to the directory containing the files used by the build')
parser.add_argument('--apikey', required=True, help='apikey for the user building the demo project')
args = parser.parse_args()

host = args.host
path = os_path.abspath(args.datapath)
key = args.apikey

# log_messages
# print "Running script to build demo project: "
# print "  host = " + host + ", "
# print "  key = " + key + ", "
# print "  path = " + path

try:
    # NOTE this vesion of DemoProject is wrong, in this context, is does not use host, apikey
    builder = DemoProject(path)
    # a basic get request that makes no changes; will fail if there is a problem with the host or key
    flag = builder.does_project_exist()

    project = builder.build_project()

    if flag:
        print("Refreshed project with name = " + project.name)
    else:
        print("Built project with name = " + project.name)

except Exception as err:
    traceback.print_exc()
    print('Error: ', err)
