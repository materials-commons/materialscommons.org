Application.Controllers.controller("projectFiles",
                                   ["$scope", projectFiles]);

function projectFiles($scope) {
    $scope.imagesMenu = [
        {
            title:"In Current Directory",
            action: "projects.project.files.view"
        },
        {
            title:"In Project",
            action: ""
        },
        {
            title: "In Dataset",
            action: ""
        }
    ];

    $scope.downloadMenu = [
        {
            title: "Project",
            action: ""
        },

        {
            title: "Current Directory",
            action: ""
        }
    ];

    $scope.reportsMenu = [
        {
            title: "By Type",
            action: ""
        },

        {
            title: "With Multiple Versions",
            action:""
        },

        {
            title: "Used In Other Projects",
            action: ""
        }
    ];
}
