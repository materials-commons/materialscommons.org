(function (module) {
    module.component('mcProjectSettings', {
        templateUrl: 'app/project/settings/mc-project-settings.html',
        controller: 'MCProjectSettingsComponentController'
    });

    module.controller('MCProjectSettingsComponentController', MCProjectSettingsComponentController);
    MCProjectSettingsComponentController.$inject = ['project', 'mcapi', 'User', 'toastr'];
    function MCProjectSettingsComponentController(project, mcapi, User, toastr) {
        var ctrl = this;
        ctrl.isOwner = isOwner;
        ctrl.deleteUser = deleteUser;
        ctrl.addUser = addUser;

        ctrl.project = project.get();
        ctrl.signedInUser = User.u();
        ctrl.user = '';

        mcapi('/users').success(function (users) {
            ctrl.allUsers = users;
        }).jsonp();

        ///////////////////////////////////////

        function deleteUser(id) {
            mcapi('/access/%/remove', id)
                .success(function () {
                    var i = _.indexOf(ctrl.project.users, function (item) {
                        return (item.id === id);
                    });
                    if (i !== -1) {
                        ctrl.project.users.splice(i, 1);
                    }
                }).delete();
        }

        function addUser() {
            var i = _.indexOf(ctrl.project.users, function (item) {
                return (item.id === ctrl.user.email);
            });
            if (i === -1) {
                mcapi('/access/new')
                    .success(function (data) {
                        ctrl.project.users.push({
                            'id': data.id,
                            'user_id': ctrl.user.email,
                            'project_id': ctrl.project.id,
                            'project_name': ctrl.project.name
                        });
                        ctrl.user = '';
                    })
                    .error(function (e) {
                        toastr.error(e.error, 'Error', {
                            closeButton: true
                        });
                    }).post({
                    'user_id': ctrl.user.email,
                    'project_id': ctrl.project.id,
                    'project_name': ctrl.project.name
                });
            }
        }

        function isOwner(username) {
            if (username === ctrl.project.owner && username === ctrl.signedInUser) {
                return true;
            } else if (User.attr().admin) {
                return true;
            }
            return false;
        }
    }
}(angular.module('materialscommons')));
