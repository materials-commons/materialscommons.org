Application.Controllers.controller("projectSamples",
                                   ["$scope", "$stateParams", projectSamples]);

function projectSamples($scope, $stateParams) {
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
