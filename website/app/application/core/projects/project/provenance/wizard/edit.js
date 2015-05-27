Application.Controllers.controller("createProvenanceEdit",
                                   ["$scope", "template", "section", "category", "attribute",
                                    createProvenanceEdit]);

function createProvenanceEdit($scope, template, section, category, attribute) {
    $scope.template = template;
    $scope.section = section;
    $scope.category = category;
    $scope.attribute = attribute;
}
