from .DB import DbConnection


class DatabaseInterface:
    def __init__(self):
        db = DbConnection()
        self.conn = db.connection()
        self.r = db.interface()

    def get_user_by_id(self, user_id):
        return self.r.table('users').get(user_id).run(self.conn)

    def add_user(self, user):
        self.r.table('users').insert(user.__dict__).run(self.conn)
        return self.get_user_by_id(user.id)