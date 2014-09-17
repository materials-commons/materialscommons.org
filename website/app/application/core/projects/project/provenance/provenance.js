Application.Controllers.controller("projectProvenance",
                                   ["$scope", projectProvenance]);

function projectProvenance($scope){
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
