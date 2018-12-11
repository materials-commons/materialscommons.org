from .DB import DbConnection


class DatabaseInterface:
    def __init__(self):
        db = DbConnection()
        self.conn = db.connection()
        self.r = db.interface()

    def get_new_uuid(self):
        return self.r.uuid().run(self.conn)

    def get_project(self, project_id):
        return self.r.table('projects').get(project_id).run(self.conn)

    def get_all_projects_by_owner(self, mc_user_id):
        return self.r.table('projects').get_all(mc_user_id, index='owner').run(self.conn)

    def get_globus_upload_records(self, project_id):
        return self.r.table('globus_uploads').get_all(project_id, index="project_id").\
            order_by(self.r.desc('birthtime')).run(self.conn)

    def get_file_loads_records(self, project_id):
        return self.r.table('file_loads').get_all(project_id, index="project_id").\
            order_by(self.r.desc('birthtime')).run(self.conn)

    def get_status_record(self, record_id):
        return self.r.table("background_process").get(record_id).run(self.conn)

    def get_status_records(self, user_id, project_id):
        return self.r.table('background_process')\
          .get_all([user_id, project_id], index='user_project')\
          .order_by(self.r.desc('birthtime'))\
          .run(self.conn)

    def get_users_globus_id(self, user_id):
        return self.r.table('users').get(user_id) \
            .pluck('globus_user').run(self.conn)

    def get_users_apikey(self, user_id):
        return self.r.table('users').get(user_id)\
            .pluck('apikey').run(self.conn)

    def get_uuid(self):
        return self.r.uuid().run(self.conn)
