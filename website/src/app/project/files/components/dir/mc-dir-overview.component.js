angular.module('materialscommons').component('mcDirOverview', {
    templateUrl: 'app/project/files/components/dir/mc-dir-overview.html',
    controller: MCDirOverviewComponentController,
    bindings: {
        dir: '=',
        project: '='
    }
});

function MCDirOverviewComponentController(fileType, mcfile, $filter, Restangular, User, mcmodal, project, toastr) {
    'ngInject';

    var ctrl = this;

    ctrl.viewFiles = viewFiles;
    ctrl.fileSrc = mcfile.src;
    ctrl.isImage = isImage;
    ctrl.overview = _.values(fileType.overview(ctrl.dir.children));
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
        return ctrl.dir.children.filter(function(f) { return f.data._type !== "directory"; })
            .map(function(f) {
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
        var filesToSelect = $filter('filter')(ctrl.files, ctrl.fileFilter);
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
        var fileIDs = ctrl.files.filter(function(f) { return f.selected; }).map(function(f) { return f.id});
        Restangular.one("project2").one("archive").customPOST({
            file_ids: fileIDs
        }).then(
            function success(resp) {
                ctrl.downloadURL = "api/project2/download/archive/" + resp.archive_id + ".zip?apikey=" + User.apikey();
                ctrl.downloadState = 'done';
                deselectSelectedFiles();
            },

            function failure() {
                toastr.error('Unable to create file archive.', 'Error', {closeButton: true});
            }
        );
    }

    function shareSelectedFiles() {
        var toUserName = function(u) { return u.user_id;};
        var proj = project.get();
        var users = proj.users.map(toUserName);
        mcmodal.chooseUsers(users).then(function(chosenUsers) {
            console.log('users chosen', chosenUsers);
        })
    }
}