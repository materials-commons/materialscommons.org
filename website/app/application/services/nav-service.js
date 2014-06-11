Application.Services.factory('Nav',
    [function () {
        return {
            currentNavbar: '',

            isActiveNav: function (entry) {
                return this.currentNavbar === entry;
            },

            setActiveNav: function (entry) {
                this.currentNavbar = entry;
            }
        };
    }]);