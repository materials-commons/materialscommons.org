class MCAccountSettingsAboutUserComponentController {
    /*@ngInject*/
    constructor(User, toast, editorOpts, $scope, mcbus) {
        this.User = User;
        this.toast = toast;
        this.fullname = User.attr().fullname;
        this.affiliation = User.attr().affiliation;
        if (!this.affiliation) {
            this.affiliation = " ";
        }
        $scope.editorOptions = editorOpts({height: 25, width: 30});
        this.mcbus = mcbus;
    }

    updateFullname() {
        this.User.attr().fullname = this.fullname;
        this.User.save();
        this.mcbus.send('USER$NAME');
        this.User.updateFullname(this.fullname).then(
            () => this.toast.success('Name updated', 'bottom left'),
            () => this.toast.error('Unable to update name', 'bottom left')
        );
    }

    updateAffiliation() {
        this.User.attr().affiliation = this.affiliation;
        this.User.save();
        this.User.updateAffiliation(this.affiliation).then(
            () => this.toast.success('Affiliation updated', 'bottom left'),
            () => this.toast.error('Unable to update affiliation', 'bottom left')
        );
    }
}

angular.module('materialscommons').component('mcAccountSettingsAboutUser', {
    templateUrl: 'app/components/accounts/mc-account-settings/mc-account-settings-about-user.html',
    controller: MCAccountSettingsAboutUserComponentController
});