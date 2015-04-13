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
                                   ["$scope", "pubsub",
                                    showSectionCategoryDirectiveController]);
function showSectionCategoryDirectiveController($scope, pubsub) {
    $scope.searchInput = {
        name: ""
    };

    $scope.control = {
        edit: $scope.edit
    };

    $scope.isDone = function() {
        return false;
    };

    $scope.isRequired = isRequired;

    function isRequired(){
        return true;
    }

    $scope.done = function() {
        $scope.control.edit = false;
        if (isRequired()) {
            // Change the name for what we are waiting on.
            pubsub.send("create.sample.attribute.done");
        }
    };
}
