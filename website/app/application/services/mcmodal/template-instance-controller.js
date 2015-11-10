(function (module) {
    module.controller('TemplateInstanceController', TemplateInstanceController);
    TemplateInstanceController.$inject = ["project", "templates", "mcmodal", "$modalInstance",
        "Restangular", "User"];

    function TemplateInstanceController(project, templates, mcmodal, $modalInstance, Restangular, User) {
        var ctrl = this;
        ctrl.templates = templates;
        ctrl.viewSetup = viewSetup;
        ctrl.openPrefill = openPrefill;
        ctrl.toggleFavorite = toggleFavorite;
        ctrl.selectTemplate = selectTemplate;
        ctrl.dismiss = dismiss;
        ctrl.activeTab = 'all';
        ctrl.isActive = isActive;
        ctrl.setActive = setActive;
        ctrl.viewPrefilledSetup = viewPrefilledSetup;

        /////////////////////

        function viewSetup(template) {
            var details = new template.fn();
            mcmodal.viewSetup(details.setup.settings[0].properties);
        }

        function openPrefill(template) {
            var details = new template.fn();
            mcmodal.preFill(details, project).then(function (t) {
                templates.push(t);
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
                }).then(function() {
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

        function viewPrefilledSetup(template) {
            var details = new template.fn();
            mcmodal.preFill(details, project);
        }
    }
}(angular.module('materialscommons')));
