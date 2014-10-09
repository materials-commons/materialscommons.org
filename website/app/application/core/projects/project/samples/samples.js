Application.Controllers.controller("projectSamples",
                                   ["$scope", projectSamples]);

function projectSamples($scope) {
    $scope.activeLink = 'View Samples';
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
            title:"In Provenance",
            action: ""
        },
        {
            title:"Unused Samples",
            action: ""
        },
        {
            title: "With Children",
            action: ""
        }
    ];

}
