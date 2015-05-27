#!/usr/bin/env python

import rethinkdb as r
from optparse import OptionParser
import json


PROJECTID = "test"


class DatabaseError(Exception):
    pass


class SItem(object):
    def __init__(self, process):
        self.process = process
        self.inputs_from_process = False
        self.children = []


class SEncoder(json.JSONEncoder):
    def default(self, o):
        d = o.__dict__
        del d["inputs_from_process"]
        return d


class PItem(object):
    def __init__(self, process):
        self.process = process
        self.input_ids = {}
        self.output_ids = {}


def run(rql, conn):
    try:
        rql.run(conn)
    except r.RqlRuntimeError:
        pass


def get(rql, conn):
    try:
        rv = rql.run(conn, time_format="raw")
        return rv
    except:
        return None


def get_list(rql, conn):
    try:
        rv = list(rql.run(conn, time_format="raw"))
        return rv
    except:
        return []


def process_tree(conn):
    processes = list(r.table("project2process")
                     .get_all(PROJECTID, index="project_id")
                     .eq_join("process_id", r.table("processes"))
                     .zip()
                     .merge(lambda proc: {
                         "inputs": {
                             "settings":
                             r.table("process2setting")
                             .get_all(proc["process_id"], index="process_id")
                             .filter({"_type": "input"})
                             .eq_join("setting_id", r.table("settings"))
                             .zip()
                             .coerce_to("array"),

                             "samples":
                             r.table("process2sample")
                             .get_all(proc["process_id"], index="process_id")
                             .filter({"_type": "input"})
                             .eq_join("sample_id", r.table("samples"))
                             .zip()
                             .coerce_to("array"),

                             "files": []
                         },

                         "outputs": {
                             "settings":
                             r.table("process2setting")
                             .get_all(proc["process_id"], index="process_id")
                             .filter({"_type": "output"})
                             .eq_join("setting_id", r.table("settings"))
                             .zip()
                             .coerce_to("array"),

                             "samples":
                             r.table("process2sample")
                             .get_all(proc["process_id"], index="process_id")
                             .filter({"_type": "output"})
                             .eq_join("sample_id", r.table("samples"))
                             .zip()
                             .coerce_to("array"),

                             "files": []
                         }
                     })
                     .run(conn, time_format="raw"))
    build_tree(processes)


def build_tree(processes):
    roots = []
    process_connections = {}
    all_processes = {}
    # Pass 1, construct a hash of all processes
    # and their associated input and output ids
    for process in processes:
        p = PItem(process)
        s = SItem(process)
        all_processes[process["process_id"]] = s
        # if process["name"] == "as_received":
        #     print json.dumps(process)
        for setting in process["inputs"]["settings"]:
            p.input_ids[setting["setting_id"]] = True

        for sample in process["inputs"]["samples"]:
            p.input_ids[sample["attribute_set_id"]] = True

        for f in process["inputs"]["files"]:
            p.input_ids[f["file_id"]] = True

        for setting in process["outputs"]["settings"]:
            p.output_ids[setting["setting_id"]] = True

        for sample in process["outputs"]["samples"]:
            p.output_ids[sample["attribute_set_id"]] = True

        for f in process["outputs"]["files"]:
            p.output_ids[f["file_id"]] = True

        process_connections[process["process_id"]] = p

    # Now we have all processes with all their potentially
    # connecting ids. So we can build the tree.
    for process in processes:
        process_id = process["process_id"]

        we_input_from = find_input_processes(process_id,
                                             process_connections)
        if we_input_from:
            me = all_processes[process_id]
            me.inputs_from_process = True
            for proc in we_input_from:
                p = all_processes[proc.process["process_id"]]
                add_if_not_exist(p, me)

        we_output_to = find_output_processes(process_id,
                                             process_connections)
        if we_output_to:
            me = all_processes[process_id]
            for output_proc in we_output_to:
                to_add = all_processes[output_proc.process["process_id"]]
                add_if_not_exist(me, to_add)

    # Roots are processes don't take inputs from other processes
    for proc_id in all_processes:
        proc = all_processes[proc_id]
        if not proc.inputs_from_process:
            roots.append(proc)

    print json.dumps(roots, cls=SEncoder)


def find_input_processes(process_id, connections):
    """
    Finds all the processes that this process inputs from
    """
    me = connections[process_id]
    inputs_from = []
    for proc_id in connections:
        if proc_id == process_id:
            # Don't look at our own process
            continue
        for input_id in me.input_ids:
            if input_id in connections[proc_id].output_ids:
                inputs_from.append(connections[proc_id])
                break
    return inputs_from


def add_if_not_exist(p, p_to_add):
    found = False
    p_to_add_id = p_to_add.process["process_id"]
    for proc in p.children:
        child_id = proc.process["process_id"]
        if child_id == p_to_add_id:
            found = True
            break
    if not found:
        p.children.append(p_to_add)


def find_output_processes(process_id, connections):
    """
    Finds all the processes that this process outputs to
    """
    me = connections[process_id]
    outputs_to = []
    for proc_id in connections:
        if proc_id == process_id:
            # Don't look at our own process
            continue
        proc = connections[proc_id]
        for input_id in proc.input_ids:
            if input_id in me.output_ids:
                outputs_to.append(proc)
                break
    return outputs_to


def main(port):
    conn = r.connect("localhost", port, db="samplesdb")
    process_tree(conn)


if __name__ == "__main__":
    parser = OptionParser()
    parser.add_option("-P", "--port", dest="port", type="int",
                      help="rethinkdb port", default=30815)
    (options, args) = parser.parse_args()
    main(options.port)
