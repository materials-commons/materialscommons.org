(function (module) {
    module.controller('projectViewProcess', projectViewProcess);
    projectViewProcess.$inject = ["project", "mcfile", "modalInstance", "$state", "process"];

    function projectViewProcess(project, mcfile, modalInstance, $state, process) {
        var viewCtrl = this;

        viewCtrl.openSample = openSample;
        viewCtrl.openFile = openFile;
        viewCtrl.editProvenance = editProvenance;
        viewCtrl.images = images;
        viewCtrl.fileSrc = fileSrc;
        viewCtrl.isSet = isSet;
        viewCtrl.setTab = setTab;

        viewCtrl.project = project;
        viewCtrl.tab = 'setup';
        viewCtrl.process = process;

        function setTab(tabId) {
            viewCtrl.tab = tabId;
        }

        function isSet(tabId) {
            return viewCtrl.tab === tabId;
        }

        function fileSrc(id) {
            return mcfile.src(id);
        }

        function openSample(sample) {
            modalInstance.openModal(sample, 'sample', viewCtrl.project);
        }

        function openFile(file) {
            modalInstance.openModal(file, 'datafile', viewCtrl.project);
        }

        function editProvenance() {
            $state.go('projects.project.processes.list.edit', {process_id: viewCtrl.current.id});
        }

        function images(files) {
            var images = [];
            if (files){
                files.forEach(function (f) {
                    if (isImage(f.mediatype.mime)) {
                        images.push(f);
                    }
                });
            }
            return images;
        }

    }
}(angular.module('materialscommons')));

;