import rethinkdb as r

class Contact(object):
    def __init__(self, owner, email=None, phone=None, website=None):
        self.owner = owner
        self.email = email
        self.phone = phone
        self.website = website
        self.notes = []
        self.description = ""
        self.affiliation = ""
        self.birthtime = r.now()
        self.mtime = self.birthtime
