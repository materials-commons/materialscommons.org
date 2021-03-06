class WorkflowService {
    /*@ngInject*/
    constructor(experimentsAPI, processesAPI, mcbus, templates, toast, $mdDialog, mcprojstore) {
        this.experimentsAPI = experimentsAPI;
        this.processesAPI = processesAPI;
        this.mcbus = mcbus;
        this.templates = templates;
        this.toast = toast;
        this.$mdDialog = $mdDialog;
        this.mcprojstore = mcprojstore;
    }

    chooseSamplesFromSource(source) {
        return this.$mdDialog.show({
            templateUrl: 'app/modals/choose-source-samples-dialog.html',
            controllerAs: '$ctrl',
            controller: ChooseSamplesFromSourceDialogController,
            bindToController: true,
            clickOutsideToClose: true,
            multiple: true,
            locals: {
                source: source
            }
        }).then(
            (samples) => samples
        );
    }

    addProcessFromTemplateNoPopup(templateName, projectId, experimentId) {
        this.experimentsAPI.createProcessFromTemplate(projectId, experimentId, `global_${templateName}`)
            .then(
                (process) => {
                    let p = this.templates.loadTemplateFromProcess(process.template_name, process);
                    this.mcprojstore.addProcess(p).then(() => this.mcbus.send('PROCESS$ADD', p));
                }
            );
    }

    addProcessFromTemplate(templateId, projectId, experimentId, multiple = true) {
        this.experimentsAPI.createProcessFromTemplate(projectId, experimentId, `global_${templateId}`)
            .then(
                (process) => {
                    let p = this.templates.loadTemplateFromProcess(process.template_name, process);
                    this.$mdDialog.show({
                        templateUrl: 'app/modals/new-process-dialog.html',
                        controllerAs: '$ctrl',
                        controller: NewProcessDialogController,
                        bindToController: true,
                        clickOutsideToClose: true,
                        multiple: multiple,
                        locals: {
                            process: p
                        }
                    }).then(
                        (proc) => this.mcprojstore.addProcess(p).then(() => this.mcbus.send('PROCESS$ADD', proc))
                    );
                },
                () => this.toast.error('Unable to create process from template')
            );
    }

    addSamplesToProcess(projectId, experimentId, process, samples) {
        let samplesToAdd = samples.map(s => ({
            id: s.id,
            property_set_id: s.property_set_id,
            command: 'add'
        }));

        let samplesArgs = {
            template_id: process.template_id,
            samples: samplesToAdd,
            process_id: process.id
        };

        return this.experimentsAPI.updateProcess(projectId, experimentId, process.id, samplesArgs).then(
            (process) => this.mcprojstore.addProcess(process).then(() => process));
    }

    createProcessWithSamplesAndFiles(projectId, experimentId, name, samples, createSamples) {
        this.experimentsAPI.createProcess(projectId, experimentId, name, name, []).then(
            process => {
                return this.processesAPI.addSamplesToProcess(projectId, process.id, samples, createSamples).then(
                    process => this.mcprojstore.addProcess(process).then(() => {
                        let p = this.templates.loadTemplateFromProcess(process.template_name, process);
                        p.name = name;
                        this.mcbus.send('PROCESS$ADD', p);
                        return process;
                    })
                );
            }
        );
    }

    addChildProcessFromTemplate(templateId, projectId, experimentId, parentProcess, multiple = true) {
        this.experimentsAPI.createProcessFromTemplate(projectId, experimentId, `global_${templateId}`)
            .then(
                (process) => {
                    let p = this.templates.loadTemplateFromProcess(process.template_name, process);

                    let samplesToAdd = parentProcess.output_samples.map(s => ({
                        id: s.id,
                        property_set_id: s.property_set_id,
                        command: 'add'
                    }));

                    let samplesArgs = {
                        template_id: process.template_id,
                        samples: samplesToAdd,
                        process_id: process.id
                    };
                    this.mcprojstore.addProcess(p);

                    this.experimentsAPI.updateProcess(projectId, experimentId, process.id, samplesArgs).then(
                        (pUpdated) => {
                            p.input_samples = pUpdated.input_samples;
                            this.$mdDialog.show({
                                templateUrl: 'app/modals/new-process-dialog.html',
                                controllerAs: '$ctrl',
                                controller: NewProcessDialogController,
                                bindToController: true,
                                clickOutsideToClose: true,
                                multiple: multiple,
                                locals: {
                                    process: p
                                }
                            }).then(
                                () => this.sendProcessChangeEvent(projectId, experimentId)
                            );
                        }
                    );

                },
                () => this.toast.error('Unable to create child process')
            );
    }

    cloneProcess(projectId, experimentId, process) {
        let p = angular.copy(process);
        p.input_samples.forEach(s => s.selected = true);
        p.output_samples.forEach(s => s.selected = true);
        p.files.forEach(f => f.selected = true);
        return this.$mdDialog.show({
            templateUrl: 'app/modals/clone-process-dialog.html',
            controllerAs: '$ctrl',
            controller: CloneProcessDialogController,
            bindToController: true,
            clickOutsideToClose: true,
            locals: {
                process: p,
                projectId: projectId
            }
        }).then(
            (cloneArgs) => {
                return this.experimentsAPI.cloneProcess(projectId, experimentId, p.id, cloneArgs).then(
                    (process) => {
                        let p = this.templates.loadTemplateFromProcess(process.template_name, process);
                        p.name = cloneArgs.name;
                        this.mcprojstore.addProcess(p).then(() => this.mcbus.send('PROCESS$ADD', p));
                    },
                    () => this.toast.error('Error cloning process')
                );
            }
        );
    }

    sendProcessChangeEvent(projectId, experimentId) {
        this.experimentsAPI.getProcessesForExperiment(projectId, experimentId)
            .then(
                (processes) => this.mcbus.send('PROCESSES$CHANGE', processes),
                () => this.toast.error('Error retrieving processes for experiment')
            );
    }

    deleteNodeAndProcess(projectId, experimentId, processId) {
        this.processesAPI.getDeleteProcessPreConditions(projectId, processId)
            .then(
                process => {
                    let numberOfSamples = process.output_samples.length;
                    if (numberOfSamples === 0) {
                        this.deleteNodeAndProcess2(projectId, experimentId, processId);
                    } else {
                        this.confirmAndDeleteProcess(projectId, experimentId, process);
                    }
                },
                error => this.toast.error(error.data.error)
            );
    }

    confirmAndDeleteProcess(projectId, experimentId, process) {
        let processName = process.name;
        let numberOfSamples = process.output_samples.length;
        let samples = ' output sample' + ((numberOfSamples !== 1) ? 's' : '');
        let processInfo = processName + ' - has ' + numberOfSamples + samples + '.';
        let confirm = this.$mdDialog.confirm()
            .title('This process has output samples: Delete node and Samples?')
            .textContent(processInfo)
            .ariaLabel('Please confirm - deleting node')
            .ok('Delete')
            .cancel('Cancel');

        this.$mdDialog.show(confirm).then(() => this.deleteNodeAndProcess2(projectId, experimentId, process.id));
    }

    deleteNodeAndProcess2(projectId, experimentId, processId) {
        this.experimentsAPI.deleteProcess(projectId, experimentId, processId)
            .then(
                () => this.mcprojstore.removeProcessById(processId).then(() => this.mcbus.send('PROCESS$DELETE', processId)),
                error => this.toast.error(error.data.error)
            );
    }
}

class NewProcessDialogController {
    /*@ngInject*/
    constructor($mdDialog, processesAPI, $stateParams) {
        this.$mdDialog = $mdDialog;
        this.processesAPI = processesAPI;
        this.projectId = $stateParams.project_id;
        this.processName = this.process.name;
    }

    done() {
        this.processesAPI.getProcess(this.projectId, this.process.id).then(
            (p) => this.$mdDialog.hide(p)
        );
    }

    cancel() {
        this.processesAPI.deleteProcess(this.projectId, this.process.id).then(
            () => this.$mdDialog.cancel(),
            () => this.$mdDialog.cancel()
        );
    }
}

class ChooseSamplesFromSourceDialogController {
    /*@ngInject*/
    constructor($mdDialog) {
        this.$mdDialog = $mdDialog;
        this.samples = this.source.output_samples.map(s => ({
            name: s.name,
            id: s.id,
            property_set_id: s.property_set_id,
            selected: true
        }));
    }

    clearAll() {
        this.samples.forEach(s => s.selected = false);
    }

    selectAll() {
        this.samples.forEach(s => s.selected = true);
    }

    done() {
        this.$mdDialog.hide(this.samples.filter(s => s.selected));
    }

    cancel() {
        this.$mdDialog.cancel();
    }
}

class CloneProcessDialogController {
    /*@ngInject*/
    constructor($mdDialog) {
        this.$mdDialog = $mdDialog;
    }

    done() {
        let files = this.process.files.filter(f => f.selected);
        let inputSamples = this.process.input_samples.filter(s => s.selected);
        this.$mdDialog.hide({name: this.process.name, files: files, samples: inputSamples});
    }

    cancel() {
        this.$mdDialog.cancel();
    }
}

angular.module('materialscommons').service('workflowService', WorkflowService);
