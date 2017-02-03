export function UserService($window, $log, Restangular) {
    'ngInject';

    var self = this;
    if ($window.sessionStorage.mcuser) {
        try {
            self.mcuser = angular.fromJson($window.sessionStorage.mcuser);
        } catch (err) {
            $log.log("Error parse mcuser in sessionStorage");
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
                $window.sessionStorage.mcuser = angular.toJson(u);
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
            $window.sessionStorage.mcuser = angular.toJson(self.mcuser);
        },

        removeFromFavorites: function(projectID, templateName) {
            var i = _.indexOf(self.mcuser.favorites[projectID].processes, function(n) {
                return n === templateName;
            });
            if (i !== -1) {
                self.mcuser.favorites[projectID].processes.splice(i, 1);
                $window.sessionStorage.mcuser = angular.toJson(self.mcuser);
            }
        },

        reset_apikey: function(new_key) {
            if (self.mcuser) {
                self.mcuser.apikey = new_key;
                $window.sessionStorage.mcuser = angular.toJson(self.mcuser);
            }
        },

        save: function() {
            if (self.mcuser) {
                $window.sessionStorage.mcuser = angular.toJson(self.mcuser);
            }
        },

        updateDefaultProject: function(projectId, experimentId) {
            return Restangular.one('v2').one('users')
                .customPUT({default_project: projectId, default_experiment: experimentId});
        },

        updateFullname: function(fullname) {
            return Restangular.one('v2').one('users').customPUT({fullname: fullname});
        }
    };
}
