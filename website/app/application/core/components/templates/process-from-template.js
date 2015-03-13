Application.Directives.directive("processFromTemplate", processFromTemplateDirective);
function processFromTemplateDirective() {
    return {
        restrict: "E",
        scope: {
            template: "=template",
            edit: "=edit"
        },
        controller: "processFromTemplateDirectiveController2",
        templateUrl: "application/core/components/templates/partials/process-from-template.html"
    };
}

Application.Controllers.controller("processFromTemplateDirectiveController2",
                                   ["$scope", "pubsub", "processCheck", "$state",
                                    processFromTemplateDirectiveController2]);
function processFromTemplateDirectiveController2($scope, pubsub, processCheck, $state) {

    setupTemplateSectionsState();

    $scope.done = function() {
        $state.go("projects.project.home");
    };

    $scope.allRequiredDone = false;

    pubsub.waitOn($scope, "process.done", function(sectionName) {
        $scope.status.sections[sectionName].isDone = true;
        if (allRequiredSectionsDone()) {
            $scope.allRequiredDone = true;
        }
    });

    // view methods
    $scope.isRequired = isRequired;

    ////////////////////////////

    function allRequiredSectionsDone() {
        var foundNotDone = _.some($scope.status.sections, function(section) {
                                      return !section.isDone;
                                  });
        return !foundNotDone;
    }

    function isRequired(sectionName) {
        var sectionStatus = $scope.status.sections[sectionName];
        return sectionStatus.isDone ? false : sectionStatus.isRequired;
    }

    function setupTemplateSectionsState() {
        $scope.status = {
            sections: {}
        };

        for (var i = 0; i < $scope.template.sections.length; i++) {
            var section = $scope.template.sections[i];
            $scope.status.sections[section.name] = {
                isOpen: i === 0 ? true : false,
                isDone: false,
                isRequired: processCheck.sectionHasRequired(section)
            };
        }
    }
}

Application.Directives.directive("showTemplateSection", showTemplateSectionDirective);
function showTemplateSectionDirective() {
    return {
        restrict: "E",
        scope: {
            section: "=section",
            edit: "=edit"
        },
        controller: "showTemplateSectionDirectiveController",
        templateUrl: "application/core/components/templates/partials/show-template-section.html"
    };
}

Application.Controllers.controller("showTemplateSectionDirectiveController",
                                   ["$scope", "pubsub", "processCheck",
                                    showTemplateSectionDirectiveController]);
function showTemplateSectionDirectiveController($scope, pubsub, processCheck) {
    $scope.searchInput = {
        category: ""
    };

    pubsub.waitOn($scope, "process.section.done", function() {
        if (processCheck.sectionRequiredDone($scope.section)) {
            pubsub.send("process.done", $scope.section.name);
        }
    });
}

Application.Directives.directive("showSectionCategory", showSectionCategoryDirective);
function showSectionCategoryDirective() {
    return {
        restrict: "E",
        scope: {
            category: "=category",
            edit: "=edit"
        },
        controller: "showSectionCategoryDirectiveController",
        templateUrl: "application/core/components/templates/partials/show-section-category.html"
    };
}

Application.Controllers.controller("showSectionCategoryDirectiveController",
                                   ["$scope", "pubsub", "processCheck",
                                    showSectionCategoryDirectiveController]);
function showSectionCategoryDirectiveController($scope, pubsub, processCheck) {
    $scope.searchInput = {
        name: ""
    };

    $scope.control = {
        edit: $scope.edit,
        isDone: false
    };

    // Wait for events to check our done status. This will only be
    // fired by categories that handle their own processing.
    pubsub.waitOn($scope, "process.section.category.done", function() {
        checkAndPropagateDone();
    });

    // view methods
    $scope.isRequired = isRequired;
    $scope.done = done;

    ////////////////////////////////

    function isRequired(){
        return processCheck.categoryHasRequired($scope.category);
    }

    function done() {
        $scope.control.edit = false;
        checkAndPropagateDone();
    }

    function checkAndPropagateDone() {
        if (processCheck.categoryRequiredDone($scope.category)) {
            $scope.control.isDone = true;
        }

        if (isRequired()) {
            pubsub.send("process.section.done");
        }
    }
}
