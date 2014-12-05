Application.Controllers.controller("accountSettings",
                                   ["$scope", "mcapi", "User", "toastr",
                                    accountSettingsController]);
function accountSettingsController($scope, mcapi, User, toastr) {
    $scope.updateName = function() {
        console.log("updateName");
        mcapi('/users/%', $scope.mcuser.email)
            .success(function (u) {
                User.save($scope.mcuser);
                toastr.success('User name updated', 'Success', {
                    closeButton: true
                });
            }).error(function() {
                //console.log("update failed");
            }).put({fullname: $scope.mcuser.fullname});
    };

    $scope.mcuser = User.attr();
}
