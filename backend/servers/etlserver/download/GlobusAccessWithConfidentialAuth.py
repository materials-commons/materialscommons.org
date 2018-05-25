class GlobusAccessWithConfidentialAuth:
    def __init__(self):
        pass

    def get_globus_user(self, user_name):
        raise NotImplemented("GlobusAccessWithConfidentialAuth.get_globus_user()")

    def get_endpoint(self, ep_id):
        raise NotImplemented("GlobusAccessWithConfidentialAuth.get_endpoint()")

    def get_endpoint_id(self, ep_name):
        raise NotImplemented("GlobusAccessWithConfidentialAuth.get_endpoint_id()")

    def set_acl_rule(self, ep_id, path, globus_user_id, permissions):
        raise NotImplemented("GlobusAccessWithConfidentialAuth.set_acl_rule()")

