Application.Controllers.controller("projectReviews",
    ["$scope",  projectReviews]);

function projectReviews($scope) {
    $scope.activeLink = 'View Reviews';
    $scope.setActiveLink = function(tabID) {
        $scope.activeLink = tabID;
    };

    $scope.isActiveLink = function (tabID) {
        if (tabID == $scope.activeLink){
            return true
        }
        return false
    };
    $scope.reportsMenu = [
        {
            title:"By Activity",
            action: ""
        }
    ];

}
