class MCPublicTemplatesComponentController {
    /*@ngInject*/
    constructor(templatesAPI, $mdDialog) {
        console.log('MCPublicTemplatesComponentController - constructor');
        this.templatesAPI = templatesAPI;
        this.$mdDialog = $mdDialog;
        this.templates = null;
        this.templateLoaded = false;
    }

    $onInit() {
        console.log('MCPublicTemplatesComponentController - init');
        this.templatesAPI.getAllPublicTemplates().then(
            (templates) => {
                console.log('MCPublicTemplatesComponentController - templates', templates.length);
                let index = 0;
                for (var i = 0; i < templates.length; i++) {
                    templates[i].n_setup = templates[i].setup[0].properties.length;
                    templates[i].n_measurement = templates[i].measurements.length;
                    if (templates[i].name === 'SEM') {
                        index = i;
                    }
                }
                console.log(index, templates[index]);
                this.templates = templates;
                this.templateLoaded = true;
            }
        );
    }

    showTemplateDetails(template) {
        console.log('Show details for', template.name, template.otype);
        for (var i = 0; i < template.setup[0].properties.length; i++) {
            let attribute = template.setup[0].properties[i];
            console.log('t', attribute.attribute, attribute.choices, attribute.units);
        }
        for (i = 0; i < template.measurements.length; i++) {
            let attribute = template.measurements[i];
            console.log('m', attribute.attribute, attribute.choices, attribute.units);
        }
        this.$mdDialog.show({
            templateUrl: 'app/modals/view-template-attributes-dialog.html',
            controller: ViewPublicTemplateDialogController,
            controllerAs: '$ctrl',
            bindToController: true,
            clickOutsideToClose: true,
            locals: {
                template: template
            }
        });
    }

}

angular.module('materialscommons').component('mcPublicTemplates', {
    template: require('./mc-public-templates.html'),
    controller: MCPublicTemplatesComponentController
});

class ViewPublicTemplateDialogController {
    /*@ngInject*/
    constructor($mdDialog) {
        this.$mdDialog = $mdDialog;
    }

    dismiss() {
        this.$mdDialog.hide();
    }
}
