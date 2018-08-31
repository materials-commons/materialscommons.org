from .GlobusAccessWithNativeAppAuth \
     import GlobusAccessWithNativeAppAuth as NativeAppImpl

from .GlobusAccessWithConfidentialAuth \
    import GlobusAccessWithConfidentialAuth as ConfidentialClientImpl

NATIVE_APP_AUTH = "native"
CONFIDENTIAL_CLIENT_APP_AUTH = "cc"

# USE_IMPLEMENTATION = NATIVE_APP_AUTH
USE_IMPLEMENTATION = CONFIDENTIAL_CLIENT_APP_AUTH


class GlobusAccess:
    def __init__(self, use_implementation=CONFIDENTIAL_CLIENT_APP_AUTH):
        self.impl = None
        self.use_implementation = use_implementation
        if not use_implementation:
            use_implementation =  USE_IMPLEMENTATION
        if use_implementation == NATIVE_APP_AUTH:
             self.impl = NativeAppImpl()
        if use_implementation == CONFIDENTIAL_CLIENT_APP_AUTH:
            self.impl = ConfidentialClientImpl()

    def get_impl_type(self):
        return self.use_implementation

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

    def cancel_task(self, task_id):
        if self.impl:
            return self.impl.cancel_task(task_id)
        return None

    def my_shared_endpoint_list(self, base_endpoint_id):
        if self.impl:
            return self.impl.my_shared_endpoint_list(base_endpoint_id)
        return None

    def create_shared_endpoint(self, data):
        if self.impl:
            return self.impl.create_shared_endpoint(data)
        return None

    # def set_acl_rule(self, ep_id, path, globus_user_id, permissions):
    #     if self.impl:
    #         return self.impl.set_acl_rule(ep_id, path, globus_user_id, permissions)
    #     return None
