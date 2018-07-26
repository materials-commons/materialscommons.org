import rethinkdb as r
from pbkdf2 import crypt
import uuid


class User(object):
    def __init__(self, name, email, password):
        self.name = name
        self.email = email
        self.fullname = name
        self.password = password
        self.id = email
        self.apikey = uuid.uuid1().hex
        self.birthtime = r.now()
        self.mtime = self.birthtime
        self.avatar = ""
        self.description = ""
        self.affiliation = ""
        self.homepage = ""
        self.demo_installed = False
        self.last_login = r.now()
        self.notes = []
        self.admin = False
        self.beta_user = False
        self.fake_user = True
        self.preferences = {
            "tags": [],
            "templates": []
        }


def make_password_hash(password):
    salt = uuid.uuid1().hex
    return crypt(password, salt, iterations=4000)


def make_fake_user(user_name, user_id, user_password, apikey):
    pwhash = make_password_hash(user_password)
    u = User(user_name, user_id, pwhash)
    u.beta_user = True
    u.apikey = apikey
    return u