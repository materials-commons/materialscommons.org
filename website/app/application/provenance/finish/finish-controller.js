Application.Provenance.Controllers.controller('provenanceFinish',
    ["$scope", "ProvDrafts", function ($scope, ProvDrafts) {

        $scope.init = function () {
            $scope.doc = ProvDrafts.current;
            $scope.process = $scope.doc.attributes.process;
        };

        $scope.init();
    }]);