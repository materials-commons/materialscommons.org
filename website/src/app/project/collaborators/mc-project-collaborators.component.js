angular.module('materialscommons').component('mcProjectCollaborators', {
    template: require('./mc-project-collaborators.html'),
    controller: MCProjectCollaboratorsComponentController
});

/*@ngInject*/
function MCProjectCollaboratorsComponentController(mcapi, User, toast, mcprojstore) {
    const ctrl = this;
    ctrl.isOwner = isOwner;
    ctrl.deleteUser = deleteUser;
    ctrl.addUser = addUser;
    let allUsers = [];
    ctrl.usersAvailable = [];

    ctrl.filterUsersBy = '';

    ctrl.project = mcprojstore.currentProject;

    ctrl.signedInUser = User.u();

    let projectUsers = _.indexBy(ctrl.project.users, 'user_id');

    mcapi('/users').success(function (users) {
        allUsers = users;
        ctrl.usersAvailable = usersNotInProject();
    }).jsonp();

    ///////////////////////////////////////

    function deleteUser(id) {
        mcapi('/access/%/remove', id)
            .success(function () {
                const i = _.indexOf(ctrl.project.users, function (item) {
                    return (item.id === id);
                });
                if (i !== -1) {
                    mcprojstore.updateCurrentProject((currentProject => {
                        currentProject.users.splice(i, 1);
                        return currentProject;
                    })).then(
                        () => {
                            ctrl.project = mcprojstore.currentProject;
                            projectUsers = _.indexBy(ctrl.project.users, 'user_id');
                            ctrl.usersAvailable = usersNotInProject();
                        }
                    );
                }
            }).delete();
    }

    function usersNotInProject() {
        return allUsers.filter(u => (!(u.id in projectUsers)));
    }

    function addUser(userToAdd) {
        const i = _.indexOf(ctrl.project.users, function (projectUser) {
            return (userToAdd.id === projectUser.user_id);
        });
        if (i === -1) {
            let accessArgs = {
                user_id: userToAdd.email,
                project_id: ctrl.project.id,
                project_name: ctrl.project.name
            };
            mcapi('/access/new')
                .success(function (data) {
                    mcprojstore.updateCurrentProject(currentProject => {
                        currentProject.users.push({
                            'id': data.id,
                            'user_id': userToAdd.email,
                            'fullname': userToAdd.fullname,
                            'project_id': ctrl.project.id,
                            'project_name': ctrl.project.name
                        });
                        return currentProject;
                    }).then(() => {
                        ctrl.project = mcprojstore.currentProject;
                        userToAdd.selected = false;
                        projectUsers = _.indexBy(ctrl.project.users, 'user_id');
                        ctrl.usersAvailable = usersNotInProject();
                    });
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
