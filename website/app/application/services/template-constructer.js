Application.Services.factory("templateConstructer",
                             ["model.templates", templateConstructerService]);
function templateConstructerService(templates) {
    return {
        constructTemplate: constructTemplate
    };

    ////////////////////////

    // constructTemplate takes a template and constructs a new template
    // from it. It goes through the template and looks for sections that
    // refer to other templates. It will retrieve those other templates
    // and append their sections into the template under construction,
    // removing the section that referred to other sections.
    function constructTemplate(template) {
        var newTemplate = angular.copy(template);
        newTemplate.sections = [];
        createSections(template);
        return newTemplate;

        ///////////////////

        function createSections(template) {
            template.sections.forEach(function(section) {
                if (section._type) {
                    templates.get(section._id).then(function(t) {
                        createSections(t);
                    });
                } else {
                    newTemplate.sections.push(angular.copy(section));
                }
            });
        }
    }
}
