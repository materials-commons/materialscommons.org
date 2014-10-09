Application.Controllers.controller("projectNotes",
    ["$scope", projectNotes]);

function projectNotes($scope) {
    $scope.activeLink = 'View Notes';
    $scope.setActiveLink = function(tabID) {
        $scope.activeLink = tabID;
    };

    $scope.isActiveLink = function (tabID) {
        if (tabID == $scope.activeLink){
            return true
        }
        return false
    };

}
