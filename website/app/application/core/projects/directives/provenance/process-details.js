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
    console.log("processDetailsController");
    $scope.tags = User.attr().preferences.tags;

    function format(choice) {
         console.log("----- format -----");
         console.dir(choice);
         console.log("----- end format ----");
        return "<span>bob</span>";
        //return "<span><i class='fa fa-" + choice.icon + "'></i> " + choice.name + "</span>";
    }

    function format2(choice) {
        // console.log("----- format2 -----");
        // console.dir(choice);
        // console.log("----- end format2 -----");
        return "<span>bob</span>";
    }
    $scope.select2IconOptions = {
        placeholder: 'Select icon',
        allowClear: true,
        width: 'element',
        //formatSelection: format2,
        formatResult: format,
        escapeMarkup: function(m) { return m; }
    };
}
