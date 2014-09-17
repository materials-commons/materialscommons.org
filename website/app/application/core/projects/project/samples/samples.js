Application.Controllers.controller("projectSamples",
                                   ["$scope", projectSamples]);

function projectSamples($scope) {
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
