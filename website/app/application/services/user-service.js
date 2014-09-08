Application.Services.factory('User',
    ["$cookieStore", function ($cookieStore) {
        var self = this;
        self.mcuser = $cookieStore.get('mcuser');

        return {
            isAuthenticated: function () {
                return self.mcuser;
            },

            setAuthenticated: function (authenticated, u) {
                if (!authenticated) {
                    $cookieStore.remove('mcuser');
                    self.mcuser = undefined;
                } else {
                    var mcuser = {};
                    mcuser = u;
                    $cookieStore.put('mcuser', mcuser);
                    self.mcuser = mcuser;
                }
            },

            apikey: function () {
                var key = self.mcuser ? self.mcuser.apikey : undefined;
                return key;
            },

            keyparam: function() {
                return {apikey: self.mcuser.apikey};
            },

            u: function () {
                return self.mcuser ? self.mcuser.email : 'Login';
            },

            attr: function() {
                return self.mcuser;
            },

            reset_apikey: function (new_key) {
                if (self.mcuser) {
                    self.mcuser.apikey = new_key;
                    $cookieStore.put('mcuser', self.mcuser);
                }
            }
        };
    }]);
