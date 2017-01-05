angular.module('materialscommons').component('mcProjectSettings', {
    templateUrl: 'app/project/settings/mc-project-settings.html',
    controller: MCProjectSettingsComponentController
});

/*@ngInject*/
function MCProjectSettingsComponentController(mcreg, mcapi, User, toastr, navbarOnChange) {
    const ctrl = this;
    ctrl.isOwner = isOwner;
    ctrl.deleteUser = deleteUser;
    ctrl.addUser = addUser;

    ctrl.project = mcreg.current$project;
    ctrl.signedInUser = User.u();
    ctrl.user = '';

    mcapi('/users').success(function(users) {
        ctrl.allUsers = users;
    }).jsonp();

    ///////////////////////////////////////

    function deleteUser(id) {
        mcapi('/access/%/remove', id)
            .success(function() {
                const i = _.indexOf(ctrl.project.users, function(item) {
                    return (item.id === id);
                });
                if (i !== -1) {
                    ctrl.project.users.splice(i, 1);
                }
                navbarOnChange.fireChange();
            }).delete();
    }

    function addUser() {
        const i = _.indexOf(ctrl.project.users, function(item) {
            return (item.id === ctrl.user.email);
        });
        if (i === -1) {
            mcapi('/access/new')
                .success(function(data) {
                    ctrl.project.users.push({
                        'id': data.id,
                        'user_id': ctrl.user.email,
                        'project_id': ctrl.project.id,
                        'project_name': ctrl.project.name
                    });
                    ctrl.user = '';
                    navbarOnChange.fireChange();
                })
                .error(function(e) {
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
