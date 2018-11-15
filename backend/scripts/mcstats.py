#!/usr/bin/env python

import rethinkdb as r
from optparse import OptionParser
import datetime


def write_stats(conn):
    with open("/tmp/stats.txt", "w") as f:
        write_user_stats(conn, f)
        write_project_stats(conn, f)
        write_project_totals(conn, f)
        write_experiment_stats(conn, f)
        write_experiment_totals(conn, f)
        write_dataset_stats(conn, f)
        write_dataset_totals(conn, f)
        write_published_dataset_stats(conn, f)
        write_file_stats(conn, f)
        write_file_totals(conn, f)


def write_user_stats(conn, f):
    f.write("New Users By Month\n")
    write_by_month_query(r.table('users'), conn, f)
    write_user_totals(conn, f)

def write_user_totals(conn, f):
    users = list(r.table('users').run(conn))
    f.write("Total number of users: %s\n" % "{:,}".format(len(users)))


def write_project_stats(conn, f):
    f.write("\n\nNew Projects By Month\n")
    write_by_month_query(r.table('projects').filter(r.row["name"].ne("Demo Project")), conn, f)


def write_project_totals(conn, f):
    f.write("\n\nProject Stats\n")
    projects = list(r.table('projects').filter(r.row["name"].ne("Demo Project")).run(conn))
    f.write("Total number of projects: %s\n" % "{:,}".format(len(projects)))

def write_experiment_stats(conn, f):
    f.write("New Experiments By Month\n")
    write_by_month_query(r.table('experiments'), conn, f)

def write_experiment_totals(conn, f):
    f.write("\n\nExperiment Stats\n")
    experiments = list(r.table('experiments').run(conn))
    f.write("Total number of experiments: %s\n" % "{:,}".format(len(experiments)))


def write_dataset_stats(conn, f):
    f.write("\n\nNew Datasets By Month\n")
    write_by_month_query(r.table('datasets'), conn, f)


def write_published_dataset_stats(conn, f):
    f.write("\n\nNew Published Datasets By Month\n")
    write_by_month_query(r.table('datasets').filter({"published": True}), conn, f)


def write_dataset_totals(conn, f):
    f.write("\n\nDataset Statistics\n")
    datasets = list(r.table('datasets').filter({"published": True}).run(conn))
    f.write("Total number of published datasets: %s\n" % "{:,}".format(len(datasets)))
    datasets = list(r.table('datasets').run(conn))
    f.write("Total number of datasets: %s\n" % "{:,}".format(len(datasets)))


def write_file_stats(conn, f):
    f.write("\n\nNew Files By Month\n")
    write_by_month_query(r.table('datafiles'), conn, f)


def write_file_totals(conn, f):
    f.write("\n\nFile Statistics\n")
    files = r.table('datafiles').run(conn)
    total_size = 0
    total_count = 0
    for file in files:
        total_size = total_size + file['size']
        total_count = total_count + 1
    f.write("Total number of files: %s\n" % "{:,}".format(total_count))
    f.write("Total size of files: %s\n" % bytes_2_human_readable(total_size))


def write_by_month_query(rql, conn, f):
    f.write("Month    Count\n")
    f.write("-----    -----\n")
    items = rql.run(conn)
    this_year = datetime.datetime.now().year
    this_month = datetime.datetime.now().month
    items_by_month = []
    for x in range(12):
        items_by_month.append([])

    for item in items:
        month = item['birthtime'].month
        year = item['birthtime'].year
        if this_year == year:
            if 'name' in item:
                items_by_month[month - 1].append(item['name'])
            elif 'title' in item:
                items_by_month[month - 1].append(item['title'])

    for i, item in enumerate(items_by_month):
        if i < this_month:
            f.write("%s      %d\n" % (get_month(i), len(item)))


def get_month(index):
    if index == 0:
        return "Jan"
    elif index == 1:
        return "Feb"
    elif index == 2:
        return "Mar"
    elif index == 3:
        return "Apr"
    elif index == 4:
        return "May"
    elif index == 5:
        return "Jun"
    elif index == 6:
        return "Jul"
    elif index == 7:
        return "Aug"
    elif index == 8:
        return "Sep"
    elif index == 9:
        return "Oct"
    elif index == 10:
        return "Nov"
    else:
        return "Dec"


def bytes_2_human_readable(number_of_bytes):
    if number_of_bytes < 0:
        raise ValueError("!!! number_of_bytes can't be smaller than 0 !!!")

    step_to_greater_unit = 1024.

    number_of_bytes = float(number_of_bytes)
    unit = 'bytes'

    if (number_of_bytes / step_to_greater_unit) >= 1:
        number_of_bytes /= step_to_greater_unit
        unit = 'KB'

    if (number_of_bytes / step_to_greater_unit) >= 1:
        number_of_bytes /= step_to_greater_unit
        unit = 'MB'

    if (number_of_bytes / step_to_greater_unit) >= 1:
        number_of_bytes /= step_to_greater_unit
        unit = 'GB'

    if (number_of_bytes / step_to_greater_unit) >= 1:
        number_of_bytes /= step_to_greater_unit
        unit = 'TB'

    precision = 1
    number_of_bytes = round(number_of_bytes, precision)

    return str(number_of_bytes) + ' ' + unit


if __name__ == "__main__":
    parser = OptionParser()
    parser.add_option("-P", "--port", dest="port", type="int", help="rethinkdb port", default=30815)

    (options, args) = parser.parse_args()

    conn = r.connect('localhost', options.port, db='materialscommons')
    write_stats(conn)
