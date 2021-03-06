import { ChooseUsersController } from './choose-users-controller';
import { existingProcessController } from './existing-process-controller';
import { ImageController } from './image-controller';
import { PreFillProcessController } from './prefill-controller';
import {setupViewController} from './setup-view.controller';

/*@ngInject*/
function mcmodalService($modal) {
    const service = {

        chooseUsers: function(users) {
            const modal = $modal.open({
                size: 'lg',
                templateUrl: 'app/modals/choose-users-dialog.html',
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
            const modal = $modal.open({
                size: 'lg',
                templateUrl: 'app/modals/existing-process-dialog.html',
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
            const modal = $modal.open({
                size: 'lg',
                templateUrl: 'app/modals/view-setup-dialog.html',
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
            const modal = $modal.open({
                size: 'lg',
                templateUrl: 'app/modals/prefill-dialog.html',
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
            const modal = $modal.open({
                size: 'lg',
                templateUrl: 'app/modals/view-image-dialog.html',
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

angular.module('materialscommons').factory('mcmodal', mcmodalService);
