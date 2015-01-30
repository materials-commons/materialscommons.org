Application.Services.factory('User',
    ["$window", function ($window) {
        var self = this;
        if($window.sessionStorage.mcuser){
            self.mcuser = JSON.parse($window.sessionStorage.mcuser);
        }

        return {
            isAuthenticated: function () {
                return self.mcuser;
            },

            setAuthenticated: function (authenticated, u) {
                if (!authenticated) {
                    $window.sessionStorage.mcuser = null;
                    self.mcuser = undefined;
                } else {
                    var mcuser = {};
                    mcuser = u;
                    $window.sessionStorage.mcuser = JSON.stringify(mcuser);
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
                    $window.sessionStorage.mcuser = self.mcuser;
                }
            },
            save: function(user){
                if(self.mcuser){
                    self.mcuser.fullname = user.fullname;
                    $window.sessionStorage.mcuser = self.mcuser;
                }
            }


        };
    }]);
