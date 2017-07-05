angular.module('materialscommons').component('mcAccountSettingsUserprofile', {
    templateUrl: 'app/components/accounts/mc-account-settings/mc-account-settings-userprofile.html',
    controller: MCAccountSettingsUserprofileComponentController
});

/*@ngInject*/
function MCAccountSettingsUserprofileComponentController(User) {
    const ctrl = this;
    ctrl.profileName = null;
    ctrl.profileValue = null;
    ctrl.user = User

    ctrl.setProfileValue = setProfileValue;
    ctrl.getProfileValue = getProfileValue;

    console.log(">>>>>>>>>>>>>> here <<<<<<<<<<<<<<<");
    console.log("User:" , ctrl.user);
    //////////////

    function getProfileValue() {
        console.log("get profile value for: ", ctrl.profileName);
        ctrl.profileValue = ctrl.user.getFromProfile(name);
        console.log("value is: ", ctrl.profileValue);
    }

    function setProfileValue() {
        console.log("set profile value for: ", ctrl.profileName);
        console.log("set profile value to: ", ctrl.profileValue);
    }

}