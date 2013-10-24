class RequiredAttributeException(Exception):
    def __init__(self, attr):
        self.attr = attr

class NoSuchItem(Exception):
    def __init__(self, id):
        self.id = id

class AuthenticationException(Exception):
    pass

class AccessNotAllowedException(Exception):
    pass

class DatabaseError(Exception):
    pass
