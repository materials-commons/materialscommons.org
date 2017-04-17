class MCTemplateBuilderComponentController {
    /*@ngInject*/
    constructor(templatesAPI, toast, $mdDialog) {
        this.templatesAPI = templatesAPI;
        this.toast = toast;
        this.$mdDialog = $mdDialog;

        this.whichElements = 'measurements';
        this.templateLoaded = false;
        this.existingTemplate = false;
    }

    static emptyTemplate() {
        return {
            name: '',
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
        if (!this.existingTemplate) {
            this.templatesAPI.createTemplate(this.template).then(
                () => {
                    this.templateLoaded = false;
                    this.existingTemplate = false;
                },
                () => this.toast.error('Unable to create template')
            );
        } else {
            this.templatesAPI.updateTemplate(this.template).then(
                () => {
                    this.templateLoaded = false;
                    this.existingTemplate = false;
                },
                () => this.toast.error('Unable to update existing template')
            );
        }
    }

    cancel() {
        this.template = MCTemplateBuilderComponentController.emptyTemplate();
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