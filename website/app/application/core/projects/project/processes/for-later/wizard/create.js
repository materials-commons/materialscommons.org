(function (module) {
    module.controller("createProvenanceFromTemplate", createProvenanceFromTemplate);
    createProvenanceFromTemplate.$inject = ["$scope", "$state", "template"];

    function createProvenanceFromTemplate($scope, $state, template) {
        $scope.search = {
            name: ""
        };
        $scope.template = template;
        // Activate the first category in the first section
        var section = template.sections[0];
        var category = section.categories[0];
        $state.go(".edit", {
            section: section.name,
            category: category.category,
            attribute: ''
        });
    }
}(angular.module('materialscommons')));
