import rethinkdb as r


def run(rql):
    try:
        return rql.run()
    except r.RqlRuntimeError:
        return None


def main():
    conn = r.connect('localhost', 30815, db='materialscommons')
    cursor = r.table('project2datadir')\
        .eq_join('datadir_id',r.table('datadirs'))\
        .merge({
            'right': {
              'name2': r.row['right']['name']
            }
          }).zip()\
        .eq_join('project_id',r.table('projects')).zip()\
        .run(conn)
    for doc in cursor:
        project_name = doc['name']
        dir_name = doc['name2']
        if len(dir_name.split('/')) == 1:
            if not project_name == dir_name:
                print("Project '{}'({})".format(project_name, doc['project_id']))
                print(" -> dir '{}'({})".format(dir_name, doc['datadir_id']))


if __name__ == "__main__":
    main()



