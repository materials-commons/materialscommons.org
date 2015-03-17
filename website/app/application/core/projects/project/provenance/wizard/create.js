Application.Controllers.controller("createProvenanceFromTemplate",
                                   ["$scope", "$state", "template",
                                    createProvenanceFromTemplate]);

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
