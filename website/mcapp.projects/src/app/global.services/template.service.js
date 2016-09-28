export function templateService() {
    'ngInject';

    var self = this;
    self.template = {};

    return {
        set: function(template) {
            self.template = template;
        },

        get: function() {
            return self.template;
        }
    }
}

