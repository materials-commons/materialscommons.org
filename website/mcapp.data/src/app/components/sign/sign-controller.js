export class SignController {
    constructor(userService, $state, $uibModalInstance, toastr, accountsService, Restangular, $timeout) {
        'ngInject';

        this.user = {
            email: "",
            password: "",
            lastName: "",
            firstName: ""
        };

        this.tab = "login";
        this.userService = userService;
        this.$state = $state;
        this.$uibModalInstance = $uibModalInstance;
        this.toastr = toastr;
        this.Restangular = Restangular;
        this.accountsService = accountsService;
        this.showSuccessMsg = false;
        this.$timeout = $timeout;
    }

    setTab(tab) {
        this.tab = tab;
    }

    isSet(tabId) {
        return this.tab === tabId;
    }

    login() {
        this.userService.login(this.user.email, this.user.password)
            .then(
                (user)=> {
                    this.user = user.plain();
                    this.userService.setAuthenticated(true, this.user);
                    this.Restangular.setDefaultRequestParams(['post', 'get', 'put', 'remove'], {apikey: this.userService.apikey()});
                    this.$state.go('home.top', null, {reload: true});
                    this.$uibModalInstance.close();
                },
                (err) => {
                    this.toastr.options = {"closeButton": true};
                    this.toastr.error(err.data, this.user.email);
                }
            );
    }

    register() {
        this.accountsService.createAccount(`${this.user.firstName} ${this.user.lastName}`, this.user.email)
            .then(
                () => {
                    this.showSuccessMsg = true;
                    this.$timeout(() => this.$uibModalInstance.close(), 5000);
                },
                (e) => {
                    this.toastr.options = {"closeButton": true};
                    this.toastr.error(e.data.error, this.user.email);
                }
            );
    }
}



