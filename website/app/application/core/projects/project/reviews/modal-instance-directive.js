Application.Controllers.controller('ModalInstanceCtrl',
    ["$scope", "$log", "modal", "project", "mcfile", ModalInstanceCtrl]);

function ModalInstanceCtrl($scope, $log, modal, project, mcfile) {
    $scope.modal = modal;
    $scope.project = project;
    $scope.selected = {
        item: $scope.modal.items[0]
    };

    $scope.fileSrc = function (file) {
        return mcfile.src(file.id);
    };

    $scope.ok = function () {
        $scope.modal.instance.close($scope.selected.item);
    };

    $scope.cancel = function () {
        $scope.modal.instance.dismiss('cancel');
    };

    $scope.modal.instance.result.then(function (selectedItem) {
        $scope.selected = selectedItem;

    }, function () {
        $log.info('Modal dismissed at: ' + new Date());
    });

    $scope.downloadSrc = function (file) {
        return mcfile.downloadSrc(file.id);
    };
}
