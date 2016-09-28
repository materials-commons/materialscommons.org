import { ChooseUsersController } from './choose-users-controller';
import { existingProcessController } from './existing-process-controller';
import { ImageController } from './image-controller';
import { PreFillProcessController } from './prefill-controller';
import { setupViewController } from './setup_view_controller';
import { TemplatesModalController } from './templates-modal-controller';

export function mcmodalService($modal) {
    'ngInject';

    var service = {

        chooseTemplate: function(project, templates) {
            var modal = $modal.open({
                size: 'lg',
                templateUrl: 'app/global.services/mcmodal/partials/template.html',
                controller: TemplatesModalController,
                controllerAs: 'ctrl',
                resolve: {
                    project: function() {
                        return project;
                    },
                    templates: function() {
                        return templates;
                    }
                }
            });
            return modal.result;
        },

        chooseUsers: function(users) {
            var modal = $modal.open({
                size: 'lg',
                templateUrl: 'app/global.services/mcmodal/partials/choose-users.html',
                controller: ChooseUsersController,
                controllerAs: 'ctrl',
                resolve: {
                    userslist: function() {
                        return users;
                    }
                }
            });
            return modal.result;
        },

        chooseExistingProcess: function(processes) {
            var modal = $modal.open({
                size: 'lg',
                templateUrl: 'app/global.services/mcmodal/partials/existing-process.html',
                controller: existingProcessController,
                controllerAs: 'ctrl',
                resolve: {
                    processes: function() {
                        return processes;
                    }
                }
            });
            return modal.result;
        },

        viewSetup: function(template) {
            var modal = $modal.open({
                size: 'lg',
                templateUrl: 'app/global.services/mcmodal/partials/view_setup.html',
                controller: setupViewController,
                controllerAs: 'ctrl',
                resolve: {
                    template: function() {
                        return template;
                    }
                }
            });
            return modal.result;
        },

        preFill: function(template, existingTemplateNames) {
            var modal = $modal.open({
                size: 'lg',
                templateUrl: 'app/global.services/mcmodal/partials/prefill.html',
                controller: PreFillProcessController,
                controllerAs: 'ctrl',
                resolve: {
                    template: function() {
                        return template;
                    },
                    existingTemplateNames: function() {
                        return existingTemplateNames ? existingTemplateNames : [];
                    }
                }
            });
            return modal.result;
        },

        viewImage: function(file) {
            var modal = $modal.open({
                size: 'lg',
                templateUrl: 'app/global.services/mcmodal/partials/image.html',
                controller: ImageController,
                controllerAs: 'ctrl',
                resolve: {
                    file: function() {
                        return file;
                    }
                }
            });
            return modal.result;
        }

    };
    return service;
}
