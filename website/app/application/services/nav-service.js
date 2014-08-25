Application.Services.factory('Nav',
    [function () {
        return {
            currentNavbar: '',

            isActiveNav: function () {
                return this.currentNavbar;
            },

            setActiveNav: function (entry) {
                this.currentNavbar = entry;
            }
        };
    }]);