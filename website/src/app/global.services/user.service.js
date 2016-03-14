export function UserService($window) {
    'ngInject';

    var self = this;
    if ($window.sessionStorage.mcuser) {
        try {
            self.mcuser = JSON.parse($window.sessionStorage.mcuser);
        } catch (err) {
            console.log("Error parse mcuser in sessionStorage");
            self.mcuser = null;
        }
    }

    return {
        isAuthenticated: function() {
            return self.mcuser;
        },

        setAuthenticated: function(authenticated, u) {
            if (!authenticated) {
                $window.sessionStorage.removeItem('mcuser');
                $window.sessionStorage.mcuser = null;
                self.mcuser = undefined;
            } else {
                if (!u.favorites) {
                    u.favorites = {};
                }
                $window.sessionStorage.mcuser = JSON.stringify(u);
                self.mcuser = u;
            }
        },

        apikey: function() {
            return self.mcuser ? self.mcuser.apikey : undefined;
        },

        u: function() {
            return self.mcuser ? self.mcuser.email : 'Login';
        },

        attr: function() {
            return self.mcuser;
        },

        favorites: function(projectID) {
            if (!(projectID in self.mcuser.favorites)) {
                self.mcuser.favorites[projectID] = {
                    processes: []
                };
            }
            return self.mcuser.favorites[projectID];
        },

        addToFavorites: function(projectID, templateName) {
            self.mcuser.favorites[projectID].processes.push(templateName);
            $window.sessionStorage.mcuser = JSON.stringify(self.mcuser);
        },

        removeFromFavorites: function(projectID, templateName) {
            var i = _.indexOf(self.mcuser.favorites[projectID].processes, function(n) {
                return n === templateName;
            });
            if (i !== -1) {
                self.mcuser.favorites[projectID].processes.splice(i, 1);
                $window.sessionStorage.mcuser = JSON.stringify(self.mcuser);
            }
        },

        reset_apikey: function(new_key) {
            if (self.mcuser) {
                self.mcuser.apikey = new_key;
                $window.sessionStorage.mcuser = JSON.stringify(self.mcuser);
            }
        },

        save: function() {
            if (self.mcuser) {
                $window.sessionStorage.mcuser = JSON.stringify(self.mcuser);
            }
        }
    };
}
