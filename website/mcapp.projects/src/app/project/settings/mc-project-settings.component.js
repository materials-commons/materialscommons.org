angular.module('materialscommons').component('mcProjectSettings', {
    templateUrl: 'app/project/settings/mc-project-settings.html',
    controller: MCProjectSettingsComponentController
});

/*@ngInject*/
function MCProjectSettingsComponentController(mcstate, mcapi, User, toast, navbarOnChange) {
    const ctrl = this;
    ctrl.isOwner = isOwner;
    ctrl.deleteUser = deleteUser;
    ctrl.addUser = addUser;
    var allUsers = [];
    ctrl.usersAvailable = [];

    ctrl.filterUsersBy = '';

    ctrl.project = mcstate.get(mcstate.CURRENT$PROJECT);
    ctrl.signedInUser = User.u();

    var projectUsers = _.indexBy(ctrl.project.users, 'user_id');

    mcapi('/users').success(function(users) {
        allUsers = users;
        ctrl.usersAvailable = usersNotInProject();
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
                    projectUsers = _.indexBy(ctrl.project.users, 'user_id');
                    ctrl.usersAvailable = usersNotInProject();
                }
                navbarOnChange.fireChange();
            }).delete();
    }

    function usersNotInProject() {
        return allUsers.filter(u => (!(u.email in projectUsers)));
    }

    function addUser(user) {
        const i = _.indexOf(ctrl.project.users, function(item) {
            return (item.id === user.email);
        });
        if (i === -1) {
            mcapi('/access/new')
                .success(function(data) {
                    ctrl.project.users.push({
                        'id': data.id,
                        'user_id': user.email,
                        'fullname': user.fullname,
                        'project_id': ctrl.project.id,
                        'project_name': ctrl.project.name
                    });
                    user.selected = false;
                    navbarOnChange.fireChange();
                    projectUsers = _.indexBy(ctrl.project.users, 'user_id');
                    ctrl.usersAvailable = usersNotInProject();
                })
                .error(function(e) {
                    toast.error(e.error);
                }).post({
                'user_id': user.email,
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
