angular.module('materialscommons').component('mcDirOverview', {
    templateUrl: 'app/project/files/components/dir/mc-dir-overview.html',
    controller: MCDirOverviewComponentController,
    bindings: {
        dir: '=',
        project: '='
    }
});

/*@ngInject*/
function MCDirOverviewComponentController(fileType, mcfile, $filter, Restangular, User, mcmodal, mcprojstore, toast, isImage) {
    const ctrl = this;

    ctrl.viewFiles = viewFiles;
    ctrl.fileSrc = mcfile.src;
    ctrl.isImage = isImage;
    ctrl.overview = _.values(fileType.overview(ctrl.dir.children.filter(f => f.data.otype === 'file' && f.data.id)));
    ctrl.allFiles = {
        files: allFiles()
    };
    ctrl.selectedCount = 0;
    ctrl.downloadSelectedFiles = downloadSelectedFiles;
    ctrl.shareSelectedFiles = shareSelectedFiles;
    ctrl.fileSelect = fileSelect;
    ctrl.selectAllFiles = selectAllFiles;
    ctrl.deselectSelectedFiles = deselectSelectedFiles;
    ctrl.files = ctrl.allFiles.files;
    ctrl.fileFilter = {
        name: ''
    };
    ctrl.downloadState = 'none';
    ctrl.downloadURL = '';
    ctrl.downloadMessageFlash = '';

    ////////////////

    function allFiles() {
        return ctrl.dir.children
            .filter(f => f.data.otype === 'file' && f.data.id).map(f => {
                f.data.selected = false;
                return f.data;
            });
    }

    function viewFiles(entry) {
        ctrl.files = entry.files.map(function(f) {
            f.selected = false;
            return f;
        });
        ctrl.selectedCount = 0;
    }

    function fileSelect(file) {
        if (file.selected) {
            ctrl.selectedCount--;
        } else {
            ctrl.selectedCount++;
        }
    }

    function selectAllFiles() {
        const filesToSelect = $filter('filter')(ctrl.files, ctrl.fileFilter);
        filesToSelect.forEach(function(f) {
            f.selected = true;
        });
        ctrl.selectedCount = ctrl.files.length;
    }

    function deselectSelectedFiles() {
        ctrl.files.forEach(function(f) {
            if (f.selected) {
                f.selected = false;
            }
        });
        ctrl.selectedCount = 0;
    }

    function downloadSelectedFiles() {
        ctrl.downloadState = 'preparing';
        const fileIDs = ctrl.files.filter(function(f) { return f.selected; }).map(function(f) { return f.id});
        Restangular.one("project2").one("archive").customPOST({
            file_ids: fileIDs
        }).then(
            function success(resp) {
                ctrl.downloadURL = "api/project2/download/archive/" + resp.archive_id + ".zip?apikey=" + User.apikey();
                ctrl.downloadState = 'done';
                deselectSelectedFiles();
            },

            function failure() {
                toast.error('Unable to create file archive.');
            }
        );
    }

    function shareSelectedFiles() {
        const toUserName = function(u) { return u.user_id;};
        const proj = mcprojstore.currentProject;
        const users = proj.users.map(toUserName);
        mcmodal.chooseUsers(users).then(function(chosenUsers) { // eslint-disable-line no-unused-vars
            // log('users chosen', chosenUsers);
        });
    }
}
