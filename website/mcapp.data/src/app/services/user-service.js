export class userService {
    /*@ngInject*/
    constructor($log, Restangular, $window, $uibModal) {
        this.$log = $log;
        this.Restangular = Restangular;
        this.$window = $window;
        this.$uibModal = $uibModal;
        this.mcuser = null;

        if (this.$window.sessionStorage.mcuser) {
            try {
                this.mcuser = angular.fromJson($window.sessionStorage.mcuser);
            } catch (err) {
                this.mcuser = null;
            }
        }
    }

    isAuthenticated() {
        return this.mcuser;
    }

    setAuthenticated(authenticated, u) {
        if (!authenticated) {
            this.$window.sessionStorage.removeItem('mcuser');
            this.$window.sessionStorage.mcuser = null;
            this.mcuser = undefined;
        } else {
            this.$window.sessionStorage.mcuser = angular.toJson(u);
            this.mcuser = u;
        }
    }

    apikey() {
        return this.mcuser ? this.mcuser.apikey : undefined;
    }

    email() {
        return this.mcuser ? this.mcuser.email : 'Login';
    }

    u() {
        return this.mcuser;
    }

    login(email, password) {
        return this.Restangular.one('user').one(email).one('apikey').customPUT({password: password});
    }

    openModal() {
        var modalInstance = this.$uibModal.open({
            animation: true,
            templateUrl: 'app/components/sign/sign.html',
            controller: 'SignController',
            controllerAs: 'ctrl',
            size: 'lg'
        });

        modalInstance.result.then(
            ()=> null,
            ()=>this.$log.info('Modal dismissed at : ' + new Date())
        );
    }
}
