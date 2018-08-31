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
        auth_client = self.impl.get_auth_client()
        ret = auth_client.get_identities(usernames=[user_name])
        globus_user = None
        if ret and ret['identities'] and len(ret['identities']) > 0:
            globus_user = ret['identities'][0]
        return globus_user

    def get_globus_user_by_id(self, user_id):
        auth_client = self.impl.get_auth_client()
        ret = auth_client.get_identities(ids=[user_id])
        globus_user = None
        if ret and ret['identities'] and len(ret['identities']) > 0:
            globus_user = ret['identities'][0]
        return globus_user

    def get_endpoint(self, endpoint_id):
        return self._transfer_client.get_endpoint(endpoint_id)

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


    def get_endpoint_id(self, endpoint_name):
        print("My Endpoints:")
        found = None
        for ep in self._transfer_client.endpoint_search(filter_scope="my-endpoints"):
            print(ep["display_name"])
            if ep["display_name"] == endpoint_name:
                found = ep
        if found:
            return found['id']
        return None

    def task_list(self, num_results=10):
        return self._transfer_client.task_list(num_results=num_results)

    def cancel_task(self, task_id):
        return self._transfer_client.cancel_task(task_id)

    def my_shared_endpoint_list(self, base_endpoint_id):
        return self._transfer_client.my_shared_endpoint_list(base_endpoint_id)

    def create_shared_endpoint(self, data):
        return self._transfer_client.create_shared_endpoint(data)

    # def set_acl_rule(self, ep_id, path, globus_user_id, permissions):
    #     results = self._transfer_client.endpoint_acl_list(ep_id)
    #     for rule in results["DATA"]:
    #         if rule['path'] == path and rule['principal'] == globus_user_id:
    #             return rule
    #     rule_data = {
    #         "DATA_TYPE": "access",
    #         "principal_type": "identity",
    #         "principal": globus_user_id,
    #         "path": path,
    #         "permissions": permissions
    #     }
    #     results = self._transfer_client.add_endpoint_acl_rule(ep_id, rule_data)
    #     if not results['code'] == "Created":
    #         return None
    #     results = self._transfer_client.endpoint_acl_list(ep_id)
    #     for rule in results["DATA"]:
    #         if rule['path'] == path and rule['principal'] == globus_user_id:
    #             return rule
    #     return None
