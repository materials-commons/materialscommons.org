export function TemplatesModalController(project, templates, mcmodal, $modalInstance, Restangular, User, processTemplates) {
    'ngInject';

    var ctrl = this;
    ctrl.templates = templates;
    ctrl.viewSetup = viewSetup;

    ctrl.editPrefill = editPrefill;
    ctrl.addPrefill = addPrefill;

    ctrl.toggleFavorite = toggleFavorite;
    ctrl.selectTemplate = selectTemplate;
    ctrl.dismiss = dismiss;
    ctrl.activeTab = 'all';
    ctrl.isActive = isActive;
    ctrl.setActive = setActive;

    /////////////////////

    function viewSetup(template) {
        mcmodal.viewSetup(template);
    }

    function editPrefill(template) {
        var templateDetails = template.create();
        mcmodal.preFill(templateDetails).then(function(t) {
            Restangular.one('v2').one('projects', project.id)
                .customPUT({
                    process_templates: [
                        {
                            command: 'update',
                            template: {
                                name: t.name,
                                setup: t.setup.settings[0],
                                process_name: t.process_name
                            }
                        }
                    ]
                }).then(function() {
                processTemplates.replace(ctrl.templates, t);
            });
        });
    }

    function addPrefill(template) {
        var templateDetails = template.create();
        var existingTemplateNames = templates.map(function(t) {
            return t.name;
        });
        mcmodal.preFill(templateDetails, existingTemplateNames).then(function(t) {
            Restangular.one('v2').one('projects', project.id).customPUT({
                process_templates: [
                    {
                        command: 'add',
                        template: {
                            name: t.name,
                            setup: t.setup.settings[0].properties.map(function(setting) {
                                return {
                                    name: setting.property.name,
                                    attribute: setting.property.attribute,
                                    unit: setting.property.unit,
                                    value: setting.property.value == null ? "" : setting.property.value,
                                    _type: setting.property._type
                                };
                            }),
                            process_name: t.process_name
                        }
                    }
                ]
            }).then(() => ctrl.templates = processTemplates.add(ctrl.templates, t));
        });
    }

    function toggleFavorite(template) {
        var command = template.favorite ? 'delete' : 'add';
        template.favorite = !template.favorite;

        Restangular.one('v2').one('users', project.id)
            .customPUT({
                favorites: {
                    processes: [
                        {
                            command: command,
                            name: template.name
                        }
                    ]
                }
            })
            .then(() => {
                if (command == 'add') {
                    User.addToFavorites(project.id, template.name);
                } else {
                    User.removeFromFavorites(project.id, template.name);
                }
            });
    }

    function selectTemplate(template) {
        $modalInstance.close(template.name);
    }

    function dismiss() {
        $modalInstance.dismiss('cancel');
    }

    function isActive(tab) {
        return ctrl.activeTab === tab;
    }

    function setActive(tab) {
        ctrl.activeTab = tab;
    }
}

