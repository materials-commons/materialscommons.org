Application.Services.factory("processTemplates", processTemplates);

function processTemplates() {
    var self = this;
    self.activeTemplate = {};
    self.templates = [
        {
            name: "APT",
            description: "Atom Probe Tomography",
            fn: Apt,
            does_transform: false
        }
    ];

    return {

        templates: function () {
            return self.templates;
        },

        newInstance: function (template) {
            return new template.fn();
        },

        getActiveTemplate: function () {
            return self.activeTemplate;
        },

        setActiveTemplate: function (template) {
            self.activeTemplate = this.newInstance(template);
        }
    };
}
