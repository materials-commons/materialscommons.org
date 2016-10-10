export class DetailsController {
    /*@ngInject*/
    constructor(dataset, actionsService, toastr, userService, $uibModal, $previousState) {
        this.dataset = dataset;
        this.dataset.tags = _.sortBy(this.dataset.tags, "id");
        this.toastr = toastr;
        this.userService = userService;
        this.actionsService = actionsService;
        this.user = this.userService.u();
        this.getActions();
        this.viewDataset();
        this.view = "list";
        this.$uibModal = $uibModal;
        this.$previousState = $previousState;
        this.zipFilePath = "api/pub/datasets/download/" + dataset.id + "?apikey=" + this.userService.apikey();
        this.dataset.author = dataset.authors[0];
        this.dataset.other_authors = dataset.authors.slice(1);
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

    viewDataset() {
        if (this.user) {
            this.actionsService.viewDataset(this.dataset.id, this.user.id);
        } else {
            this.actionsService.viewDataset(this.dataset.id, "anonymous");
        }
    }

    downloadSrc() {
        //var apikey = this.user.apikey;
        //var url = "datafiles/static/" + fileID + "?apikey=" + apikey + "&original=true";
        //return url;
    }

    setView(view) {
        this.view = view;
    }

    isActive(what) {
        return this.view === what;
    }

    openImage(file) {
        // var modalInstance =  // this var not used
        this.$uibModal.open({
            animation: true,
            templateUrl: 'app/details/pop-up.html',
            controller: 'PopUpController',
            controllerAs: 'ctrl',
            bindToController: true,
            size: 'lg',
            keyboard: true,
            resolve: {
                file: function() {
                    return file;
                }
            }
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

    previousState() {
        this.$previousState.go();
    }

}

