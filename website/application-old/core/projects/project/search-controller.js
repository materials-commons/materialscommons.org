(function (module) {
    module.controller('SearchController', SearchController);

    SearchController.$inject = ["mcapi", "project", "$stateParams", "mcfile", "$state", "mcmodal"];

    /* @ngInject */
    function SearchController(mcapi, project, $stateParams, mcfile, $state, mcmodal) {
        var ctrl = this;
        ctrl.isImage = isImage;
        ctrl.fileSrc = fileSrc;
        ctrl.gotoFilesPage = gotoFilesPage;
        ctrl.openFilePopup = openFilePopup;
        ctrl.images = images;

        init();

        //////////////////////////////

        function init() {
            mcapi("/search/project/%/files", project.id)
                .success(function (results) {
                    ctrl.results = results;
                })
                .post({query_string: $stateParams.query});
        }

        function fileSrc(id) {
            return mcfile.src(id);
        }

        function gotoFilesPage(f) {
            $state.go('projects.project.files.edit', {file_id: f.id});
        }

        function openFilePopup(file) {
            console.log('openFilePopup', file);
            //var f = file;
            //if ('datafile_id' in file) {
            //    // We don't have a full file object, so find it in projectFiles
            //    f = projectFiles.findFileByID(project.id, file.datafile_id);
            //}
            //mcmodal.openModal(f, 'datafile', project);
        }

        // images goes through the list of files and returns all the images.
        function images(files) {
            var images = [];
            files.forEach(function (f) {
                if (isImage(f.mediatype.mime)) {
                    images.push(f);
                }
            });
            return images;
        }
    }

}(angular.module('materialscommons')));
