Application.Directives.directive('projectTabs', projectTabsDirective);

function projectTabsDirective() {
    return {
        scope: {
            project: "="
        },
        controller: 'projectTabsDirectiveController',
        restrict: "AE",
        templateUrl: "application/core/projects/project/project-tabs.html"
    };
}

Application.Controllers.controller('projectTabsDirectiveController',
                                  ["$scope", "projectColors", projectTabsDirectiveController]);

function projectTabsDirectiveController($scope, projectColors) {
    var activeTab = "overview";
    $scope.colors = projectColors;
    $scope.inactiveColor = projectColors.getInactiveColor();

    $scope.setActiveTab = function(tabID) {
        activeTab = tabID;
    };

    $scope.isActiveTab = function (tabID) {
        return tabID == activeTab;
    };

    $scope.getActiveStyle = function() {
        var color = projectColors.getCurrentProjectColor();
        return {
            background: color,
            'border-bottom-style': 'solid',
            'border-bottom-color': color,
            color: 'white',
            'font-weight': 'bold',
            outline: 0
        };
    };

    $scope.getInactiveStyle = function() {
        var color = projectColors.getCurrentProjectColorLight();
        var fontColor = projectColors.getInactiveColor();
        return {
            color: fontColor,
            background: color
        };
    };

    $scope.tabs = [
        {
            id: "overview",
            icon: "fa-list",
            name: "Overview",
            hasCount: false
        },

        {
            id: "files",
            icon: "fa-files-o",
            name: "Files",
            hasCount: false
        },

        {
            id: "samples",
            icon: "fa-cubes",
            name: "Samples",
            hasCount: true,
            count: 1
        },

        {
            id: "provenance",
            icon: "fa-code-fork",
            name: "Provenance",
            hasCount: true,
            count: 1
        },

        {
            id: "reviews",
            icon: "fa-comment",
            name: "Reviews",
            hasCount: true,
            count: 1
        },

        {
            id: "notes",
            icon: "fa-edit",
            name: "Notes",
            hasCount: true,
            count: 1
        }
    ];
}
