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
            'font-weight': 'bold'
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
            name: "Overview",
            hasCount: false
        },

        {
            id: "files",
            name: "Files",
            hasCount: false
        },

        {
            id: "samples",
            name: "Samples",
            hasCount: true,
            count: $scope.project.samples.length
        },

        {
            id: "provenance",
            name: "Provenance",
            hasCount: true,
            count: $scope.project.samples.length
        },

        {
            id: "notes",
            name: "Notes",
            hasCount: true,
            count: $scope.project.notes.length
        }
    ];
}
