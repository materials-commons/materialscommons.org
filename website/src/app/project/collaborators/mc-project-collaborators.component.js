angular.module('materialscommons').component('mcProjectCollaborators', {
    template: require('./mc-project-collaborators.html'),
    controller: MCProjectCollaboratorsComponentController
});

/*@ngInject*/
function MCProjectCollaboratorsComponentController(User, projectsAPI, accessAPI, mcStateStore) {
    const ctrl = this;
    ctrl.isOwner = isOwner;
    ctrl.deleteUser = deleteUser;
    ctrl.addUser = addUser;
    let allUsers = [];
    ctrl.usersAvailable = [];

    ctrl.filterUsersBy = '';

    ctrl.project = mcStateStore.getState('project');

    ctrl.signedInUser = User.u();

    loadUsers();

    ///////////////////////////////////////

    function loadUsers() {
        projectsAPI.getProjectAccessEntries(ctrl.project.id).then(
            users => {
                ctrl.users = users;
                ctrl.users.forEach(u => {
                    let names = u.fullname.split(' ');
                    if (!names.length) {
                        u.lastName = '';
                    } else {
                        u.lastName = names[names.length - 1];
                    }
                });
                ctrl.projectUsers = _.indexBy(ctrl.users, 'user_id');
                accessAPI.getAllUsers().then(
                    users => {
                        users.forEach(u => {
                            let names = u.fullname.split(' ');
                            if (!names.length) {
                                u.lastName = '';
                            } else {
                                u.lastName = names[names.length - 1];
                            }
                        });
                        allUsers = users;
                        ctrl.usersAvailable = usersNotInProject();
                    }
                );
            }
        );
    }

    function deleteUser(id) {
        accessAPI.removeUserFromProject(id, ctrl.project.id).then(
            () => {
                loadUsers();
                mcStateStore.fire('sync:project');
            }
        );
    }

    function usersNotInProject() {
        return allUsers.filter(u => (!(u.id in ctrl.projectUsers)));
    }

    function addUser(userToAdd) {
        const i = _.indexOf(ctrl.users, function(projectUser) {
            return (userToAdd.id === projectUser.user_id);
        });
        if (i === -1) {
            accessAPI.addUserToProject(userToAdd.id, ctrl.project.id).then(
                () => {
                    loadUsers();
                    mcStateStore.fire('sync:project');
                }
            );
        }
    }

    function isOwner(username) {
        return username === ctrl.project.owner && username === ctrl.signedInUser;
    }
}
