class MCTemplateBuilderComponentController {
    /*@ngInject*/
    constructor(templatesAPI, toast, $mdDialog, User, templates) {
        this.templatesAPI = templatesAPI;
        this.toast = toast;
        this.$mdDialog = $mdDialog;
        this.user = User;
        this.templatesService = templates;

        this.sortOrder = 'name';
        this.whichElements = 'measurements';
        this.templateLoaded = false;
        this.existingTemplate = false;
    }

    $onInit() {
        this.loadTemplates(false);
    }

    loadTemplates(reloadCache) {
        this.templatesAPI.getAllTemplates().then(
            (templates) => {
                for (let i = 0; i < templates.length; i++) {
                    let t = templates[i];
                    t.can_edit = this.user.isTemplateAdmin() || (this.user.attr().id === t.owner);
                }
                this.templates = templates;
                if (reloadCache) {
                    this.templatesService.set(templates);
                }
            }
        );
    }

    static emptyTemplate() {
        return {
            name: '',
            process_name: '',
            process_type: 'create',
            template_description: '',
            does_transform: false,
            setup: [{
                name: 'Instrument',
                attribute: 'instrument',
                properties: []
            }],
            measurements: []
        };
    }

    createNew() {
        this.templateLoaded = true;
        this.template = MCTemplateBuilderComponentController.emptyTemplate();
    }

    editTemplate(template) {
        this.template = template;
        this.templateLoaded = true;
        this.existingTemplate = true;
    }

    cloneTemplate(template) {
        template.name = '';
        delete template.id;
        this.template = template;
        this.templateLoaded = true;
        this.existingTemplate = false;
    }

    viewTemplate(template) {
        this.$mdDialog.show({
            templateUrl: 'app/components/templates/mc-template-builder/view-template-dialog.html',
            controller: ViewTemplateDialogController,
            controllerAs: '$ctrl',
            bindToController: true,
            multiple: true,
            locals: {
                template: template
            }
        }).then(
            (command) => {
                switch (command) {
                    case 'edit':
                        this.editTemplate(template);
                        break;
                    case 'clone':
                        this.cloneTemplate(template);
                        break;
                    default:
                        this.cancel();
                }
            }
        );
    }

    editExisting() {
        this.templatesAPI.getAllTemplates().then(
            templates => this.$mdDialog.show({
                templateUrl: 'app/components/templates/mc-template-builder/choose-existing-template-dialog.html',
                controller: ChooseExistingTemplateDialogController,
                controllerAs: '$ctrl',
                bindToController: true,
                multiple: true,
                locals: {
                    templates: templates
                }
            }).then(
                (template) => {
                    this.template = template;
                    this.templateLoaded = true;
                    this.existingTemplate = true;
                }
            )
        );
    }

    done() {
        // If user added new selection choices then there is an extra newChoice field that we need to delete.
        this.template.setup[0].properties.forEach(p => {
            if (p.hasOwnProperty('newChoice')) {
                delete p.newChoice;
            }
        });

        // Set does_transform flag based on template process type.
        if (this.template.process_type === 'create' || this.template.process_type === 'transform') {
            this.template.does_transform = true;
        } else {
            this.template.does_transform = false;
        }

        if (!this.existingTemplate) {
            this.template.process_name = this.template.name;
            this.templatesAPI.createTemplate(this.template).then(
                () => {
                    this.templateLoaded = false;
                    this.existingTemplate = false;
                    this.loadTemplates(true);
                },
                () => this.toast.error('Unable to create template')
            );
        } else {
            this.templatesAPI.updateTemplate(this.template).then(
                () => {
                    this.templateLoaded = false;
                    this.existingTemplate = false;
                    this.loadTemplates(true);

                },
                () => this.toast.error('Unable to update existing template')
            );
        }
    }

    cancel() {
        this.templatesAPI.getAllTemplates().then(
            (templates) => {
                this.templates = templates;
                this.templateLoaded = false;
                this.existingTemplate = false;
            }
        );
    }
}

class ViewTemplateDialogController {
    /*@ngInject*/
    constructor($mdDialog) {
        this.$mdDialog = $mdDialog;
    }

    close(command) {
        this.$mdDialog.hide(command);
    }
}

class ChooseExistingTemplateDialogController {
    /*@ngInject*/
    constructor($mdDialog) {
        this.$mdDialog = $mdDialog;
    }

    done(template) {
        this.$mdDialog.hide(template);
    }

    cancel() {
        this.$mdDialog.cancel();
    }
}

angular.module('materialscommons').component('mcTemplateBuilder', {
    templateUrl: 'app/components/templates/mc-template-builder/mc-template-builder.html',
    controller: MCTemplateBuilderComponentController
});