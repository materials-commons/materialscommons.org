Application.Services.factory('User',
    ["$cookieStore", function ($cookieStore) {
        var self = this;
        self.mcuser = $cookieStore.get('mcuser');

        return {
            isAuthenticated: function () {
                return self.mcuser;
            },

            setAuthenticated: function (authenticated, apikey, email) {
                if (!authenticated) {
                    $cookieStore.remove('mcuser');
                    self.mcuser = undefined;
                } else {
                    var mcuser = {};
                    mcuser.apikey = apikey;
                    mcuser.email = email;
                    $cookieStore.put('mcuser', mcuser);
                    self.mcuser = mcuser;
                }
            },

            apikey: function () {
                return self.mcuser ? self.mcuser.apikey : undefined;
            },

            u: function () {
                return self.mcuser ? self.mcuser.email : 'Login';
            },

            reset_apikey: function (new_key) {
                if (self.mcuser) {
                    self.mcuser.apikey = new_key;
                    $cookieStore.put('mcuser', self.mcuser);
                }
            }
        };
    }]);