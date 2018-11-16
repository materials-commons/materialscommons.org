angular.module('materialscommons').component('mcProjectCollaborators', {
    template: require('./mc-project-collaborators.html'),
    controller: MCProjectCollaboratorsComponentController
});

/*@ngInject*/
function MCProjectCollaboratorsComponentController(mcapi, User, toast, projectsAPI, mcStateStore) {
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
                ctrl.projectUsers = _.indexBy(ctrl.users, 'user_id');
                mcapi('/users').success(function(users) {
                    allUsers = users;
                    ctrl.usersAvailable = usersNotInProject();
                }).jsonp();
            }
        );
    }

    function deleteUser(id) {
        mcapi('/access/%/remove', id)
            .success(function() {
                const i = _.indexOf(ctrl.users, function(item) {
                    return (item.id === id);
                });

                if (i !== -1) {
                    loadUsers();
                    mcStateStore.fire('sync:project');
                }
            }).delete();
    }

    function usersNotInProject() {
        return allUsers.filter(u => (!(u.id in ctrl.projectUsers)));
    }

    function addUser(userToAdd) {
        const i = _.indexOf(ctrl.users, function(projectUser) {
            return (userToAdd.id === projectUser.user_id);
        });
        if (i === -1) {
            let accessArgs = {
                user_id: userToAdd.email,
                project_id: ctrl.project.id,
                project_name: ctrl.project.name
            };
            mcapi('/access/new')
                .success(function() {
                    loadUsers();
                    mcStateStore.fire('sync:project');
                })
                .error((e) => toast.error(e.error)).post(accessArgs);
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
