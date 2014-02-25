Application.Services.factory('Nav',
    [function () {
        return {
            currentNavbar: '',
            currentToolbar: '',

            isActiveNav: function (entry) {
                return this.currentNavbar === entry;
            },

            setActiveNav: function (entry) {
                if (entry === 'home') {
                    this.currentToolbar = '';
                }
                this.currentNavbar = entry;
            },

            isActiveToolbar: function (entry) {
                return this.currentToolbar === entry;
            },

            setActiveToolbar: function (entry) {
                this.currentToolbar = entry;
            }
        };
    }]);