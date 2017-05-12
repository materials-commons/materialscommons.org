export function DatasetDetailsSummaryDirective() {
    'ngInject';

    let directive = {
        restrict: 'E',
        templateUrl: 'app/details/mcpub-dataset-details-summary.html',
        scope: {
            dataset: "="
        },
        controller: DatasetDetailsSummaryController,
        controllerAs: 'ctrl',
        bindToController: true
    };
    return directive;
}

class DatasetDetailsSummaryController {

    constructor(userService, actionsService, toastr) {
        'ngInject';
        this.user = userService.u();
        this.toastr = toastr;
        this.userService = userService;
        this.actionsService = actionsService;
        this.getActions();
    }

    appreciate() {
        if (this.user) {
            this.dataset.appreciate = !this.dataset.appreciate;
            this.actionsService.appreciate(this.dataset.id, this.user.id).then(() => {
                this.getActions();
            });
        } else {
            this.toastr.options = {"positionClass": "toast-top-full-width", "closeButton": true};
            this.toastr.warning("Please sign in to appreciate the work");
        }
    }

    removeAppreciate() {
        if (this.user) {
            this.actionsService.removeAppreciation(this.dataset.id, this.user.id).then(() => {
                this.dataset.appreciate = false;
                this.getActions();
            });
        } else {
            this.toastr.options = {"positionClass": "toast-top-full-width", "closeButton": true};
            this.toastr.warning("Please sign in to appreciate the work");
        }
    }

    getActions() {
        this.actionsService.getAllActions(this.dataset.id).then((result) => {
            this.all_actions = result;
        });
    }

    addTag(params) {
        return this.actionsService.addTag(this.dataset.id, this.user.id, params.id);
    }


    removeTag(params) {
        this.actionsService.removeTag(this.dataset.id, params.user_id, params.id);
    }

    loadTags() {
        return this.actionsService.getAllTags();
    }

}
