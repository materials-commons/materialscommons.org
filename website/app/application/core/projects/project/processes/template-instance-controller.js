(function (module) {
    module.controller('TemplateInstanceController', TemplateInstanceController);
    TemplateInstanceController.$inject = ["project", "templates", "modalInstance", "$modalInstance",
        "Restangular", "User"];

    function TemplateInstanceController(project, templates, modalInstance, $modalInstance, Restangular, User) {
        var ctrl = this;
        ctrl.templates = templates;
        ctrl.viewSetup = viewSetup;
        ctrl.openPrefill = openPrefill;
        ctrl.markAsFavorite = markAsFavorite;
        ctrl.unmarkAsFavorite = unmarkAsFavorite;
        ctrl.selectTemplate = selectTemplate;
        ctrl.dismiss = dismiss;
        ctrl.activeTab = 'all';
        ctrl.isActive = isActive;
        ctrl.setActive = setActive;
        ctrl.viewPrefilledSetUp = viewPrefilledSetUp;

        /////////////////////

        function viewSetup(template) {
            var details = new template.fn();
            modalInstance.viewSetUp(details.setup.settings[0].properties);
        }

        function openPrefill(template) {
            var details = new template.fn();
            modalInstance.preFill(details, project).then(function (t) {
                templates.push(t);
            });
        }

        function markAsFavorite(template) {
            Restangular.one('v2').one('users', project.id)
                .customPUT({
                    favorites: {
                        processes: [
                            {
                                command: 'add',
                                name: template.name
                            }
                        ]
                    }
                }).then(function () {
                    var t = _.find(templates, {name: template.name});
                    t.favorite = true;
                    User.addToFavorites(project.id, t.name);
                });
        }

        function unmarkAsFavorite(template) {
            Restangular.one('v2').one('users', project.id)
                .customPUT({
                    favorites: {
                        processes: [
                            {
                                command: 'delete',
                                name: template.name
                            }
                        ]
                    }
                }).then(function () {
                    var t = _.find(templates, {name: template.name});
                    t.favorite = false;
                    User.removeFromFavorites(project.id, t.name);
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

        function viewPrefilledSetUp(template) {
            var details = new template.fn();
            modalInstance.preFill(details, project);
        }
    }
}(angular.module('materialscommons')));
