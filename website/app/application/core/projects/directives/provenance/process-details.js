Application.Directives.directive('processDetails', processDetailsDirective);

function processDetailsDirective() {
    return {
        scope: {
            process: "="
        },
        controller: "processDetailsController",
        restrict: "AE",
        templateUrl: "application/core/projects/directives/provenance/process-details.html"
    };
}

Application.Controllers.controller('processDetailsController',
                                   ["$scope", "User", processDetailsController]);
function processDetailsController($scope, User) {
    $scope.tags = User.attr().preferences.tags;
    var tagsByName = {};

    $scope.tags.forEach(function(tag) {
        tagsByName[tag.name] = tag;
    });

    function createTagHTML(tagName) {
        var tag = tagsByName[tagName];
        return "<span> " +
            "<i class='fa fa-" + tag.icon + "' style='color:" + tag.color + "'></i> " +
            tag.name + "</span>";
    }

    function format(choice) {
        if (! choice) {
            return "";
        } else if (choice.text === "") {
            return "";
        }
        return createTagHTML(choice.text);
    }

    $scope.select2IconOptions = {
        placeholder: 'Select icon',
        allowClear: true,
        width: 'element',
        formatSelection: format,
        formatResult: format,
        escapeMarkup: function(m) { return m; }
    };
}
