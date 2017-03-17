class MCUserDetailsComponentController {
    /*@ngInject*/
    constructor(User, toast, editorOpts, $scope) {
        this.User = User;
        this.toast = toast;
        this.fullname = User.attr().fullname;
        this.affiliation = User.attr().affiliation;
        if (!this.affiliation) {
            this.affiliation = " ";
        }
        $scope.editorOptions = editorOpts({height: 25, width: 30});
    }

    updateFullname() {
        this.User.updateFullname(this.fullname).then(
            () => this.toast.success('Name updated', 'bottom left'),
            () => this.toast.error('Unable to update name', 'bottom left')
        );
    }

    updateAffiliation() {
        this.User.updateAffiliation(this.affiliation).then(
            () => this.toast.success('Affiliation updated', 'bottom left'),
            () => this.toast.error('Unable to update affiliation', 'bottom left')
        );
    }
}

angular.module('materialscommons').component('mcUserDetails', {
    templateUrl: 'app/components/accounts/mc-account/mc-user-details.html',
    controller: MCUserDetailsComponentController
});