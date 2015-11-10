(function (module) {
    module.controller("DisplaySampleController",
        ["$scope", "$log", "modal", "$state", "project", "mcfile", "mcmodal",
            DisplaySampleController]);

    function DisplaySampleController($scope, $log, modal, $state, project, mcfile, mcmodal) {
        $scope.modal = modal;
        $scope.project = project;
        $scope.selected = {
            item: $scope.modal.item
        };

        if ($state.current.name === 'projects.project.processes.list.edit') {
            $scope.editMeasure = true;
        }

        $scope.fileSrc = function (file) {
            return mcfile.src(file.datafile_id);
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

        $scope.openSample = function (sample) {
            mcmodal.openModal(sample, 'sample', project);
        };

        $scope.openFile = function (file) {
            mcmodal.openModal(file, 'datafile', project);
        };

    }

}(angular.module('materialscommons')));
