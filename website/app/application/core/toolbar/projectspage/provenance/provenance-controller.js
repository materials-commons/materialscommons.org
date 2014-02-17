Application.Controllers.controller('toolbarProjectsPageProvenance',
    ["$scope", "$state", function ($scope, $state) {
        $scope.isCurrentStep = function (step) {
            return $scope.currentStep === step;
        }

        $scope.init = function () {
            $scope.currentStep = 'process';
            $scope.processSaved = false;
            $scope.inputsSaved = false
            $scope.outputsSaved = false;
            $state.go('toolbar.projects.provenance.process');
        }

        $scope.init();
    }]);