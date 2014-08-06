Application.Controllers.controller('projectsOverviewGroupAccess',
    ["$scope", "$stateParams", "mcapi","User","model.Projects", "pubsub", function ($scope, $stateParams, mcapi, User, Projects, pubsub) {

        pubsub.waitOn($scope, 'groups.change', function () {
            $scope.getGroups();
        });

        $scope.addUser = function () {
            mcapi('/usergroup/%/selected_name/%', $scope.selected_ug.id, $scope.bk.user_name)
                .success(function (data) {
                    $scope.refreshUsers();
                }).put();
        };

        $scope.addProject = function () {
            mcapi('/usergroup/%/project/%', $scope.selected_ug.id, $scope.bk.selected_project.id)
                .success(function (data) {
                    $scope.refreshProjects()
                }).put();
        };

        $scope.deleteUser = function (index) {
            mcapi('/usergroup/%/selected_name/%/remove', $scope.selected_ug.id, $scope.selected_ug.users[index])
                .success(function (data) {
                    $scope.refreshUsers();
                }).put();
        };
        $scope.deleteProject = function (index) {
            mcapi('/usergroup/%/project/%/remove', $scope.selected_ug.id, $scope.selected_ug.projects[index].id)
                .success(function (data) {
                    $scope.refreshProjects();
                }).put();
        };
        $scope.refreshUsers = function () {
            mcapi('/usergroup/%', $scope.selected_ug.id)
                .success(function (data) {
                    $scope.selected_ug = data;
                    $scope.ug_users = data.users;
                    $scope.getGroups();

                }).jsonp();
        };
        $scope.refreshProjects = function () {
            mcapi('/usergroup/%', $scope.selected_ug.id)
                .success(function (data) {
                    $scope.selected_ug = data;
                }).jsonp();
        };
        $scope.groupDetails = function (ug_id) {
            mcapi('/usergroup/%', ug_id)
                .success(function (data) {
                    $scope.selected_ug = data;
                }).jsonp();
        }
        $scope.createUserGroup = function () {
            mcapi('/usergroups/new', User.u())
                .success(function () {
                    pubsub.send('groups.change');
                    $scope.clear();

                }).post($scope.newgroup);
        };

        $scope.getGroups = function(){
            mcapi('/usergroups/project/%', $scope.project_id)
                .success(function (data) {
                    $scope.groups = data;
                }).jsonp();
        }
        $scope.clear = function () {
            $scope.newgroup = {
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
        $scope.populateProjects = function () {
            $scope.newgroup.projects.push({'id': $scope.model.selected_project.id, 'name': $scope.model.selected_project.name});
        };
        $scope.removeProjects = function (index) {
            $scope.newgroup.projects.splice(index, 1);
        };

        function init() {
            $scope.bk = {
                user_name: '',
                selected_project: ''
            }
            $scope.newgroup = {
                name: null,
                access: null,
                description: null,
                projects: [],
                users: [User.u()],
                owner: User.u()
            };
            $scope.signed_in_user = User.u();
            $scope.selected_ug = ''
            $scope.project_id = $stateParams.id;
            $scope.getGroups()
            mcapi('/users')
                .success(function (data) {
                    $scope.all_users = data;
                }).jsonp();
            Projects.getList().then(function (data) {
                $scope.projects = data;
            });
        }

        init();
    }]);
