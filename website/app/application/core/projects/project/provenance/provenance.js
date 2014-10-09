Application.Controllers.controller("projectProvenance",
                                   ["$scope", projectProvenance]);

function projectProvenance($scope){
    $scope.activeLink = 'View Provenance';
    $scope.setActiveLink = function(tabID) {
        $scope.activeLink = tabID;
    };

    $scope.isActiveLink = function (tabID) {
        if (tabID == $scope.activeLink){
            return true
        }
        return false
    };
    $scope.createProvenanceMenu = [
        {
            title: "New",
            action: ""
        },

        {
            title: "From Draft",
            action: ""
        },

        {
            title: "From Template",
            action: ""
        }
    ];

    $scope.reportsMenu = [
        {
            title: "By Process",
            action: ""
        },

        {
            title: "By Sample",
            action: ""
        }
    ];
}
