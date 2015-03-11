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
                                   ["$scope",
                                    processFromTemplateDirectiveController2]);
function processFromTemplateDirectiveController2($scope) {
    $scope.status = {
        sections: {}
    };

    for (var i = 0; i < $scope.template.sections.length; i++) {
        var section = $scope.template.sections[i];
        $scope.status.sections[section.name] = {
            isOpen: i === 0 ? true : false,
            isDone: false
        };
    }

    $scope.done = function() {
        console.log("done for process-from-template");
    };

    $scope.allRequiredDone = false;
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

Application.Controllers.controller("showTemplateSectionDirectiveController", ["$scope", showTemplateSectionDirectiveController]);
function showTemplateSectionDirectiveController($scope) {
    $scope.searchInput = {
        category: ""
    };
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
        console.log("process.section.category.done received");
        if (processCheck.categoryRequiredDone($scope.category)) {
            $scope.control.isDone = true;
        }
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
        console.log("checking if category is done");
        if (processCheck.categoryRequiredDone($scope.category)) {
            console.log("category is done");
            $scope.control.isDone = true;
        }
        if (isRequired()) {
            // Change the name for what we are waiting on.
            pubsub.send("create.sample.attribute.done");
        }
    }
}
