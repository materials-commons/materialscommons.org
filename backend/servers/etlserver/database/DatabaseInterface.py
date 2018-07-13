from .BackgroundProcess import BackgroundProcess
from .DB import DbConnection


class DatabaseInterface:
    def __init__(self):
        db = DbConnection()
        self.conn = db.connection()
        self.r = db.interface()

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

    def get_status_by_project_id(self, project_id):
        return self.r.table('background_process')\
          .get_all(project_id, index='project_id')\
          .order_by(self.r.desc('birthtime'))\
          .limit(1).run(self.conn)

    def get_users_apikey(self, user_id):
        return self.r.table('users')\
            .get(user_id)\
            .pluck('apikey')