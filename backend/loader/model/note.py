import rethinkdb as r

class Note(object):
    def __init__(self, owner):
        self.birthtime = r.now()
        self.owner = owner
        self.notes = []

    def add_note(self, note_entry):
        self.notes.append(note_entry)

class NoteEntry(object):
    def __init__(self, key, value, units=""):
        self.key = key
        self.value = value
        self.units = units

    def new_note_entry(value, key="", units=""):
        return Entry(key, value, units)
