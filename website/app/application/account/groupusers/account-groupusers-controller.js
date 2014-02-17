Application.Controllers.controller('accountGroupUsers',
    ["$scope", "mcapi", "$state", "$stateParams", "$dialog", "User", "alertService",
        function ($scope, mcapi, $state, $stateParams, $dialog, User, alertService) {
            mcapi('/users')
                .success(function (data) {
                    $scope.all_users = data;
                })
                .error(function () {
                }).jsonp();

            mcapi('/usergroup/%', $stateParams.id)
                .success(function (data) {
                    $scope.user_group = data;
                    $scope.owner = $scope.user_group.owner
                    $scope.signed_in_user = User.u();
                    $scope.ug_name = $scope.user_group.name;
                    $scope.users_by_usergroup = data.users;
                }).jsonp();

            $scope.add_user_to_usergroup = function () {
                var title = '';
                var msg = 'Do you want to add  ' + $scope.user_name + ' to ' + $scope.ug_name + '?';
                var btns = [
                    {result: 'no', label: 'no'},
                    {result: 'yes', label: 'yes', cssClass: 'btn-primary'}
                ];
                $dialog.messageBox(title, msg, btns)
                    .open()
                    .then(function (result) {
                        if (result == 'yes') {
                            mcapi('/usergroup/%/selected_name/%', $stateParams.id, $scope.user_name)
                                .success(function (data) {
                                    $scope.users_by_usergroup.push(data.id);
                                }).error(function (data) {
                                    alertService.sendMessage(data.error);
                                }).put();
                        }
                    });
            };

            $scope.done = function () {
                $state.transitionTo('account');
            };

            $scope.delete_user_from_usergroup = function (index) {
                var title = '';
                var msg = 'Do you want to delete ' + $scope.users_by_usergroup[index] + ' from ' + $scope.ug_name + '?';
                var btns = [
                    {result: 'no', label: 'no'},
                    {result: 'yes', label: 'yes', cssClass: 'btn-primary'}
                ];

                $dialog.messageBox(title, msg, btns)
                    .open()
                    .then(function (result) {
                        if (result == 'yes') {
                            mcapi('/usergroup/%/selected_name/%/remove', $stateParams.id, $scope.users_by_usergroup[index])
                                .success(function (data) {
                                    $scope.users_by_usergroup = data.users;
                                }).error(function () {
                                }).put();
                        }
                    });
            };
        }]);