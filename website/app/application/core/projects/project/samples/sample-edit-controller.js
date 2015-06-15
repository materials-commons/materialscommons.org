Application.Controllers.controller('projectEditSample',
    ["$scope", projectEditSample]);

function projectEditSample($scope) {

  $scope.processes = ["SEM Imaging", "Heat Treatment", "As Received"];
  $scope.attachments = ["A1.jpg", "B1.png"];
}