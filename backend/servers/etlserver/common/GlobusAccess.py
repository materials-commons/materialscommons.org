# from .GlobusAccessWithNativeAppAuth \
#     import GlobusAccessWithNativeAppAuth as NativeAppImpl

from .GlobusAccessWithConfidentialAuth \
    import GlobusAccessWithConfidentialAuth as ConfidentialClientImpl

# NATIVE_APP_AUTH = "native"
CONFIDENTIAL_CLIENT_APP_AUTH = "cc"

# USE_IMPLEMENTATION = NATIVE_APP_AUTH
USE_IMPLEMENTATION = CONFIDENTIAL_CLIENT_APP_AUTH


class GlobusAccess:
    def __init__(self):
        self.impl = None
        # if USE_IMPLEMENTATION == NATIVE_APP_AUTH:
        #     self.impl = NativeAppImpl()
        if USE_IMPLEMENTATION == CONFIDENTIAL_CLIENT_APP_AUTH:
            self.impl = ConfidentialClientImpl()

    @staticmethod
    def get_impl_type():
        return USE_IMPLEMENTATION

    def get_globus_user(self, user_name):
        if self.impl:
            return self.impl.get_globus_user(user_name)
        return None

    def get_globus_user_by_id(self, user_id):
        if self.impl:
            return self.impl.get_globus_user_by_id(user_id)
        return None

    def get_endpoint(self, ep_id):
        if self.impl:
            return self.impl.get_endpoint(ep_id)
        return None

    def get_endpoint_id(self, ep_name):
        if self.impl:
            return self.impl.get_endpoint_id(ep_name)
        return None

    def task_list(self, num_results=10):
        if self.impl:
            return self.impl.task_list(num_results=num_results)
        return None

    # def set_acl_rule(self, ep_id, path, globus_user_id, permissions):
    #     if self.impl:
    #         return self.impl.set_acl_rule(ep_id, path, globus_user_id, permissions)
    #     return None
