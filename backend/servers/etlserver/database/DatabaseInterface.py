from .BackgroundProcess import BackgroundProcess
from .GlobusAuthInfo import GlobusAuthInfo
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

    def create_status_record(self, user_id, project_id, name):
        record_obj = BackgroundProcess(user_id, project_id, name)
        data = record_obj.__dict__
        rv = self.r.table("background_process").insert(data).run(self.conn)
        record_id = rv['generated_keys'][0]
        return self.get_status_record(record_id)

    def add_extras_data_to_status_record(self, record_id, extras_data):
        mtime = self.r.now()
        rv = self.r.table("background_process")\
            .get(record_id).update({'extras': extras_data, "mtime": mtime}).run(self.conn)
        if rv['replaced'] == 1:
            return self.get_status_record(record_id)
        return None

    def update_extras_data_on_status_record(self, record_id, extras_data):
        self.r.table("background_process").get(record_id).update({'extras': extras_data}).run(self.conn)
        return self.get_status_record(record_id)

    def replace_extras_data_on_status_record(self, record_id, extras_data):
        self.r.table("background_process")\
            .get(record_id).update({'extras': self.r.literal(extras_data)}).run(self.conn)
        return self.get_status_record(record_id)

    def update_status(self, record_id, status):
        self.r.table("background_process").get(record_id).update({"status": status}).run(self.conn)
        return self.get_status_record(record_id)

    def update_queue(self, record_id, queue):
        self.r.table("background_process").get(record_id).update({"queue": queue}).run(self.conn)
        return self.get_status_record(record_id)

    def get_status_record(self, record_id):
        return self.r.table("background_process").get(record_id).run(self.conn)

    def get_status_records(self, limit=20):
        return self.r.table('background_process')\
          .order_by(self.r.desc('birthtime'))\
          .limit(limit).run(self.conn)

    def get_status_by_project_id(self, project_id, limit=1):
        return self.r.table('background_process')\
          .get_all(project_id, index='project_id')\
          .order_by(self.r.desc('birthtime'))\
          .limit(limit).run(self.conn)

    def get_users_apikey(self, user_id):
        return self.r.table('users').get(user_id)\
            .pluck('apikey').run(self.conn)

    def get_users_globus_id(self, user_id):
        return self.r.table('users').get(user_id) \
            .pluck('globus_user').run(self.conn)

    def create_globus_auth_info(self, user_id, globus_name, globus_id, tokens):
        record_obj = GlobusAuthInfo(user_id, globus_name, globus_id, tokens)
        data = record_obj.__dict__
        rv = self.r.table("globus_auth_info").insert(data).run(self.conn)
        record_id = rv['generated_keys'][0]
        return self.get_globus_auth_info(record_id)

    def get_globus_auth_info(self, record_id):
        return self.r.table("globus_auth_info").get(record_id).run(self.conn)

    def get_globus_auth_info_records_by_user_id(self, user_id):
        return list(self.r.table("globus_auth_info")\
                    .get_all(user_id, index='owner')\
                    .order_by(self.r.desc('birthtime'))\
                    .run(self.conn))

    def delete_globus_auth_info_record(self, record_id):
        return self.r.table("globus_auth_info").get(record_id).delete().run(self.conn)

    def get_uuid(self):
        return self.r.uuid().run(self.conn)
