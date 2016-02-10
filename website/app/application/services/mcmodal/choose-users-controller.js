(function (module) {
    module.controller('ChooseUsersController', ChooseUsersController);
    ChooseUsersController.$inject = ["userslist", "$modalInstance"];

    function ChooseUsersController(userslist, $modalInstance) {
        var ctrl = this;
        ctrl.cancel = cancel;
        ctrl.ok = ok;

        var toUser = function(name){return {name: name, selected: false};};
        ctrl.users = userslist.map(toUser);

        /////////////////////////////

        function cancel() {
            $modalInstance.dismiss('cancel');
        }

        function ok() {
            var selected = function(u) {return u.selected;};
            var names = function(u){return u.name;};
            var selectedUsers = ctrl.users.filter(selected).map(names);
            $modalInstance.close(selectedUsers);
        }
    }
}(angular.module('materialscommons')));