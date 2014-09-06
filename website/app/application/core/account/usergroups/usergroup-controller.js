Application.Controllers.controller('accountUserGroup',
    ["$scope", "mcapi", "$state", "$stateParams", "User", "alertService", "pubsub","model.projects", "Nav",
        function ($scope, mcapi, $state, $stateParams, User, alertService, pubsub, Projects, Nav) {
            pubsub.waitOn($scope, 'usergroups.change', function () {
                $scope.getGroups();
            });

            $scope.refreshUsers = function () {
                mcapi('/usergroup/%', $stateParams.id)
                    .success(function (data) {
                        $scope.selected_usergroup = data;
                        $scope.signed_in_user = User.u();
                        $scope.users_by_usergroup = data.users;
                    }).jsonp();

            };
            $scope.refreshProjects = function () {
                mcapi('/usergroup/%', $stateParams.id)
                    .success(function (data) {
                        $scope.selected_usergroup = data;
                        $scope.projects_by_usergroup = data.projects;
                    }).jsonp();

            };
            $scope.getGroups = function () {
                mcapi('/user/%/usergroups', User.u())
                    .success(function (data) {
                        $scope.user_groups = data;
                    }).jsonp();
            };
            $scope.clear = function () {
                $scope.group = {
                    name: null,
                    access: null,
                    description: null,
                    projects: [],
                    users: [User.u()],
                    owner: User.u()
                };
                $scope.model = {
                    selected_project: ''
                }
            };
            $scope.createUserGroup = function () {

                mcapi('/usergroups/new', User.u())
                    .success(function () {
                        alertService.sendMessage("UserGroup has been created successfully");
                        pubsub.send('usergroups.change');
                        $scope.clear();

                    })
                    .error(function (errorMsg) {
                        alertService.sendMessage(errorMsg.error);
                    }).post($scope.group);
            };

            $scope.addUser = function () {
                mcapi('/usergroup/%/selected_name/%', $stateParams.id, $scope.user_name)
                    .success(function (data) {
                        alertService.sendMessage("user has been added.");
                        $scope.refreshUsers();
                    }).error(function (data) {
                        alertService.sendMessage(data.error);
                    }).put();
            };

            $scope.addProject = function (prj) {
                mcapi('/usergroup/%/project/%', $stateParams.id, $scope.model.selected_project.id)
                    .success(function (data) {
                        $scope.refreshProjects()
                    }).error(function (data) {
                        alertService.sendMessage(data.error);
                    }).put();
            };

            $scope.deleteUser = function (index) {
                mcapi('/usergroup/%/selected_name/%/remove', $stateParams.id, $scope.users_by_usergroup[index])
                    .success(function (data) {
                        alertService.sendMessage("User has been deleted");
                        $scope.refreshUsers();
                    }).error(function () {
                    }).put();
            };
            $scope.deleteProject = function (index) {
                mcapi('/usergroup/%/project/%/remove', $stateParams.id, $scope.selected_usergroup.projects[index].id)
                    .success(function (data) {
                        alertService.sendMessage("Project has been deleted");
                        $scope.refreshProjects();
                    }).error(function () {
                    }).put();
            };


            $scope.populateProjects = function () {
                $scope.group.projects.push({'id': $scope.model.selected_project.id, 'name': $scope.model.selected_project.name});
            };
            $scope.removeProjects = function (index) {
                $scope.group.projects.splice(index, 1);
            };

            function init() {
                $scope.ug_id = $stateParams.id;
                Nav.setActiveNav('usergroup');
                $scope.group = {
                    name: null,
                    access: null,
                    description: null,
                    projects: [],
                    users: [User.u()],
                    owner: User.u()
                };
                $scope.model = {
                    selected_project: ''
                }
                $scope.getGroups();
                if($scope.ug_id){
                    $scope.refreshUsers();
                }
                mcapi('/users')
                    .success(function (data) {
                        $scope.all_users = data;
                    })
                    .error(function () {
                    }).jsonp();

                Projects.getList().then(function (data) {
                    $scope.projects = data;
                });

            }
            init();
        }]);
