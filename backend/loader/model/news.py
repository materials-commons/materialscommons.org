import rethinkdb as r

class News(object):
    def __init__(self, title, body, when=None):
        self.title = title
        self.body = body
        self.date = when if when else r.now()
