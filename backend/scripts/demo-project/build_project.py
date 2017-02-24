#!/usr/bin/python

import argparse
from os import path as os_path
import demo_project as demo
import traceback

def set_host_url_arg():
    parser.add_argument('--host', required=True,
                        help='the url for the Materials Commons server')
def set_datapath_arg():
    parser.add_argument('--datapath', required=True,
                        help='the path to the directory containing the files used by the build')
def set_apikey_arg():
    parser.add_argument('--apikey', required=True, help='rapikey for the user building the demo project')

parser = argparse.ArgumentParser(description='Build Demo Project.')
set_host_url_arg()
set_datapath_arg()
set_apikey_arg()

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
    builder = demo.DemoProject(host, path, key)
    # a basic get request that makes no changes; will fail if there is a problem with the host or key
    flag = builder.does_project_exist()

    project = builder.build_project()

    if flag:
        print "Refreshed project with name = " + project.name
    else:
        print "Built project with name = " + project.name

except Exception as err:
    traceback.print_exc()
    print 'Error: ', err
