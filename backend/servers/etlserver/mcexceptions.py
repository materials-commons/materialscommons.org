class MaterialsCommonsException(Exception):
    pass


class RequiredAttributeException(MaterialsCommonsException):
    def __init__(self, attr):
        self.attr = str(attr)


class NoSuchItem(MaterialsCommonsException):
    # noinspection PyShadowingBuiltins
    def __init__(self, id="Unknown"):
        self.id = str(id)


class AuthenticationException(MaterialsCommonsException):
    pass


class AccessNotAllowedException(MaterialsCommonsException):
    # noinspection PyShadowingBuiltins
    def __init__(self, id="Unknown"):
        self.id = str(id)


class DatabaseError(MaterialsCommonsException):
    pass
