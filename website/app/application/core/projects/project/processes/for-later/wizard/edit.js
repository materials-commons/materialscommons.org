(function (module) {
    module.controller("createProvenanceEdit", createProvenanceEdit);
    createProvenanceEdit.$inject = ["$scope", "template", "section", "category", "attribute"];

    function createProvenanceEdit($scope, template, section, category, attribute) {
        $scope.template = template;
        $scope.section = section;
        $scope.category = category;
        $scope.attribute = attribute;
    }
}(angular.module('materialscommons')));
