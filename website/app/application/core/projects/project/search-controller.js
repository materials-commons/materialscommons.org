Application.Controllers.controller('searchController',
    ["mcapi", "project", "$stateParams", "mcfile", "$state", "projectFiles", "modalInstance", searchController]);

function searchController(mcapi, project, $stateParams, mcfile, $state, projectFiles, modalInstance) {
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
                console.dir(results);
                ctrl.results = results;
            })
            .post({query_string: $stateParams.query});
    }

    function fileSrc(id) {
        return mcfile.src(id);
    }

    function gotoFilesPage(f) {
        projectFiles.setActiveFile(f);
        $state.go('projects.project.files.edit', {file_id: f.id, file_type: f._type});
    }

    function openFilePopup(file) {
        var f = file;
        if ('datafile_id' in file) {
            // We don't have a full file object, so find it in projectFiles
            f = projectFiles.findFileByID(project.id, file.datafile_id);
            console.log("openFilePopup %O", f);
        }
        modalInstance.openModal(f, 'datafile', project);
    }

    // images goes through the list of files and returns all the images.
    function images(files) {
        var images = [];
        files.forEach(function(f) {
            if (isImage(f.mediatype.mime)) {
                images.push(f);
            }
        });
        return images;
    }
}