import rethinkdb as r

class Note(object):
    def __init__(self, owner):
        # Creation time of note
        self.birthtime = r.now()

        # Who entered the note
        self.who = owner

        # The text of the note
        self.message = []
