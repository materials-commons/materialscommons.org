angular.module('materialscommons').component('mcFileEditControls', {
    template: require('./mc-file-edit-controls.html'),
    controller: MCFileEditControlsComponentController,
    bindings: {
        file: '='
    }
});

function MCFileEditControlsComponentController(mcfile, pubsub, toast, mcprojstore, selectItems, mcshow) {
    'ngInject';

    const ctrl = this;

    ctrl.newName = ctrl.file.name;
    ctrl.renameActive = false;
    ctrl.renameFile = renameFile;
    ctrl.downloadSrc = downloadSrc;
    ctrl.deleteFile = deleteFile;
    ctrl.linkTo = linkTo;
    ctrl.showJson = showJson;

    ////////////////////////////////

    function linkTo(what) {
        switch (what) {
            case 'processes':
                displayProcesses();
                break;
            //case "samples":
            //    displaySamples();
            //    break;
            //case "notes":
            //    displayNotes();
            //    break;
        }
    }

    function displayProcesses() {
        let proj = mcprojstore.currentProject,
            projectId = proj.id;
        selectItems.processesFromProject(projectId).then(function(items) {
            const processCommands = toProcessCommands(items.processes);
            ctrl.file.customPUT({processes: processCommands}).then(function() {
            });
        });
    }

    function toProcessCommands(processes) {
        const inputs = processes.filter(function(p) {
            return p.input;
        }).map(function(p) {
            return {
                command: 'add',
                process_id: p.id,
                direction: 'in'
            };
        });

        const outputs = processes.filter(function(p) {
            return p.output;
        }).map(function(p) {
            return {
                command: 'add',
                process_id: p.id,
                direction: 'out'
            };
        });

        return inputs.concat(outputs);
    }

    function deleteFile() {
        //TODO: Ask user if they really wants to delete the file.
        ctrl.file.remove().then(function() {
            // do something here with deleted the file.
        }).catch(function(err) {
            toast.error('File deletion failed: ' + err.error);
        });
    }

    function renameFile() {
        if (ctrl.newName === '') {
            return;
        } else if (ctrl.newName === ctrl.file.name) {
            ctrl.renameActive = false;
            return;
        }
        ctrl.file.name = ctrl.newName;
        ctrl.file.customPUT({name: ctrl.newName}).then(function(f) {
            ctrl.file.name = f.name;
            ctrl.renameActive = false;
            pubsub.send('files.refresh', ctrl.file);
        }).catch(function(err) {
            toast.error('File rename failed: ' + err.error);
        });
    }

    function downloadSrc() {
        return mcfile.downloadSrc(ctrl.file.id);
    }

    function showJson() {
        mcshow.showJson(ctrl.file);
    }

}
