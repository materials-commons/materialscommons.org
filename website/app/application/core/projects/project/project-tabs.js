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
                                  ["$scope", "$state","projectColors", "pubsub", "model.projects", "$stateParams", "$filter", projectTabsDirectiveController]);

function projectTabsDirectiveController($scope, $state, projectColors, pubsub, Projects,$stateParams, $filter) {

    pubsub.waitOn($scope, "update-tab-count.change", function () {
            Projects.get($stateParams.id).then(function (project) {
                $scope.project.reviews = project.reviews;
                $scope.project.samples = project.samples;
                $scope.project.notes = project.notes;
                $scope.updateTabCounts();
            });
    });

    $scope.setActiveTab = function(tabID) {
        $scope.activeTab = tabID;
    };

    $scope.isActiveTab = function (tabID) {
        return tabID == $scope.activeTab;
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

    $scope.updateTabCounts = function(){
        $scope.tabs = [
            {
                id: "overview",
                icon: "fa-list",
                name: "Overview",
                hasCount: false,
                defaulttab: "view"
            },

            {
                id: "files",
                icon: "fa-files-o",
                name: "Files",
                hasCount: false,
                defaulttab: "view"
            },

            {
                id: "samples",
                icon: "fa-cubes",
                name: "Samples",
                hasCount: true,
                count: $scope.project.samples.length,
                defaulttab: "view"
            },

            {
                id: "provenance",
                icon: "fa-code-fork",
                name: "Provenance",
                hasCount: true,
                count: $scope.project.processes.length,
                defaulttab: "view"
            },

            {
                id: "reviews",
                icon: "fa-comment",
                name: "Reviews",
                hasCount: true,
                count: ($filter('byKey')($scope.project.reviews, 'status', 'open')).length ,
                defaulttab: "view"
            },

            {
                id: "notes",
                icon: "fa-edit",
                name: "Notes",
                hasCount: true,
                count: $scope.project.notes.length,
                defaulttab: "view"
            }
        ];
    }
    function init(){
        $scope.activeTab = "overview";
        if ($state.current.name == 'projects.project.reviews.view'){
            $scope.setActiveTab("reviews");
        }
        if ($state.current.name == 'projects.project.samples.view'){
            $scope.setActiveTab("samples");
        }
        if ($state.current.name == 'projects.project.notes.view'){
            $scope.setActiveTab("notes");
        }
        if ($state.current.name == 'projects.project.provenance.view'){
            $scope.setActiveTab("provenance");
        }
        if ($state.current.name == 'projects.project.files.view'){
            $scope.setActiveTab("files");
        }
        $scope.colors = projectColors;
        $scope.inactiveColor = projectColors.getInactiveColor();

        $scope.updateTabCounts();

    }
    init();


}
