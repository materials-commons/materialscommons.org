(function (module) {
    module.factory("help", [helpService]);

    // helpService tracks the state of the help side bar.
    function helpService() {
        var self = this;
        self.active = false;
        self.service = {
            // toggle will toggle the state of the help side bar.
            toggle: function () {
                self.active = !self.active;
            },

            // isActive returns true if the help sidebar is currently active,
            // otherwise it returns false.
            isActive: function () {
                return self.active;
            }
        };
        return self.service;
    }
}(angular.module('materialscommons')));
