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
                                   ["$scope", "User", "watcher", processDetailsController]);
function processDetailsController($scope, User) {
    $scope.tags = [];
    $scope.tags = angular.copy(User.attr().preferences.tags, $scope.tags);
    var tagsByName = {};
    var tagsAdded = {};

    $scope.selectFocused = function() {
        //console.log("selectFocused called");
    };

    $scope.selectBlured = function() {
        //console.log("selectBlured called");
    };

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
        placeholder: 'Select tag',
        width: 'element',
        formatSelection: format,
        formatResult: format,
        escapeMarkup: function(m) { return m; }
    };

    function removeAdded(tagName) {
        var i = _.indexOf($scope.tags, function(tag) {
            return tag.name == tagName;
        });
        if (i !== -1) {
            $scope.tags.splice(i, 1);
        }
    }

    function addTagToProcess(t) {
        var i = _.indexOf($scope.process.tags, function(tag) {
            return tag.name == t.name;
        });

        if (i === -1) {
            // Tag not in list so add it.
            $scope.process.tags.push(t);
        }
    }

    $scope.addTag = function() {
        var t = {};
        t = angular.copy($scope.tag);
        delete t["$$hashkey"];
        addTagToProcess(t);
        removeAdded(t.name);
    };
}
