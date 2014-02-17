
function ProvController($scope, $state) {
    $scope.isCurrentStep = function (step) {
        return $scope.currentStep === step;
    }

    $scope.init = function() {
        $scope.currentStep = 'process';
        $scope.processSaved = false;
        $scope.inputsSaved = false
        $scope.outputsSaved = false;
        $state.go('mytools.projects.provenance.process');
    }

    $scope.init();
}

