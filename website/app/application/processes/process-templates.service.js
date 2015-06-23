Application.Services.factory("processTemplates", processTemplates);

function processTemplates() {
    var self = this;
    self.templates = [
        {
            name: "APT",
            description: "Atom Probe Tomography",
            fn: Apt
        }
    ];

    return {
        templates: function () {
            return self.templates;
        },

        newInstance: function (template) {
            return new template.fn();
        }
    };
}
