(function (module) {
    module.directive("homeSampleDetails", homeSampleDetailsDirective);
    function homeSampleDetailsDirective() {
        return {
            restrict: "AE",
            scope: true,
            controller: 'homeSampleDetailsController',
            replace: true,
            templateUrl: "home-sample-details.html"
        };
    }

    module.controller("homeSampleDetailsController", homeSampleDetailsController);
    homeSampleDetailsController.$inject = ["$scope", "current", "Project"];

    function homeSampleDetailsController($scope, current, Project) {
        //currently we have a single note for a sample. This could change at the time of sample rework
        var notes = Project.getSpecificNotes(current.project(), $scope.sample.id, 'sample');
        $scope.note = notes[0];
    }
}(angular.module('materialscommons')));
