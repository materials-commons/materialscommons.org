/* eslint-disable */
export class DatasetDetailsVotesController {

    constructor(userService, actionsService, toastr) {
        'ngInject';
        this.user = userService.u();
        this.toastr = toastr;
        this.userService = userService;
        this.actionsService = actionsService;
        this.getActions();
    }

    getActions() {
        this.actionsService.getAllActions(this.dataset.id).then((result) => {
            this.all_actions = result;
        });
    }

    appreciate() {
        if (this.user) {
            this.dataset.appreciate = !this.dataset.appreciate;
            /* eslint-disable no-unused-vars */
            this.actionsService.appreciate(this.dataset.id, this.user.id).then((res) => { // res not used
                this.getActions();
            });
            /* eslint-enable no-unused-vars */
        } else {
            this.toastr.options = {"positionClass": "toast-top-full-width", "closeButton": true};
            this.toastr.warning("Please sign in to appreciate the work");
        }
    }

    removeAppreciate() {
        if (this.user) {
            /* eslint-disable no-unused-vars */
            this.actionsService.removeAppreciation(this.dataset.id, this.user.id).then((res) => { //res not used
                this.dataset.appreciate = false;
                this.getActions();
            });
            /* eslint-enable no-unused-vars */
        } else {
            this.toastr.options = {"positionClass": "toast-top-full-width", "closeButton": true};
            this.toastr.warning("Please sign in to appreciate the work");
        }
    }

    addTag(params) {
        this.actionsService.addTag(this.dataset.id, this.user.id, params.id).then(
            (tag) => this.dataset.tags = _.sortBy(this.dataset.tags, "id")
        );
    }


    removeTag(params) {
        this.actionsService.removeTag(this.dataset.id, params.user_id, params.id);
    }

    loadTags() {
        return this.actionsService.getAllTags();
    }

}

