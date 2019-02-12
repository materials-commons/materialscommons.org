/*@ngInject*/
function UserService($window, $log, Restangular, $state) {
    const self = this;
    if ($window.localStorage.mcuser) {
        try {
            self.mcuser = angular.fromJson($window.localStorage.mcuser);
        } catch (err) {
            $log.log('Error parse mcuser in localStorage');
            self.mcuser = null;
        }
    }

    $window.addEventListener('storage', (e) => {
        if (e.key === 'mcuser' && e.newValue === 'null') {
            self.mcuser = null;
            $state.go('login');
        }
    });

    return {
        isAuthenticated: function() {
            return self.mcuser;
        },

        setAuthenticated: function(authenticated, u) {
            if (!authenticated) {
                $window.localStorage.removeItem('mcuser');
                $window.localStorage.mcuser = null;
                self.mcuser = undefined;
            } else {
                if (!u.favorites) {
                    u.favorites = {};
                }
                $window.localStorage.mcuser = angular.toJson(u);
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

        isBetaUser: function () {
            return self.mcuser ? self.mcuser.beta_user : false
        },

        isTemplateAdmin: function () {
            return self.mcuser ? self.mcuser.is_template_admin : false
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
            $window.localStorage.mcuser = angular.toJson(self.mcuser);
        },

        removeFromFavorites: function(projectID, templateName) {
            let i = _.indexOf(self.mcuser.favorites[projectID].processes, function(n) {
                return n === templateName;
            });
            if (i !== -1) {
                self.mcuser.favorites[projectID].processes.splice(i, 1);
                $window.localStorage.mcuser = angular.toJson(self.mcuser);
            }
        },

        reset_apikey: function(new_key) {
            if (self.mcuser) {
                self.mcuser.apikey = new_key;
                $window.localStorage.mcuser = angular.toJson(self.mcuser);
            }
        },

        save: function() {
            if (self.mcuser) {
                $window.localStorage.mcuser = angular.toJson(self.mcuser);
            }
        },

        updateDefaultProject: function(projectId, experimentId) {
            return Restangular.one('v2').one('users')
                .customPUT({default_project: projectId, default_experiment: experimentId});
        },

        updateFullname: function(fullname) {
            return Restangular.one('v2').one('users').customPUT({fullname: fullname});
        },

        updateAffiliation: function(affiliation) {
            return Restangular.one('v2').one('users').customPUT({affiliation: affiliation});
        },

        updateGlobusUserName: function(globusName) {
            return Restangular.one('v2').one('users').customPUT({globus_user: globusName});
        },

        updateDemoInstalled: function(demoInstalled) {
            return Restangular.one('v2').one('users').customPUT({demo_installed: demoInstalled});
        },

        switchToUser: function(email) {
            return Restangular.one('v2').one('users_become').customPUT({email: email});
        }
    };
}

angular.module('materialscommons').factory('User', UserService);
