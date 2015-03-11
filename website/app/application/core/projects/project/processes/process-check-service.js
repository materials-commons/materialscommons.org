Application.Services.factory("processCheck", processService);
function processService() {
    return {
        allRequiredDone: allRequiredDone,
        categoryRequiredDone: categoryRequiredDone,
        categoryHasRequired: categoryHasRequired,
        sectionRequiredDone: sectionRequiredDone,
        sectionHasRequired: sectionHasRequired
    };

    ///////////////////////////

    // allRequiredDone checks if all required template sections
    // have been completed.
    function allRequiredDone(template) {
        return _.some(template.sections, sectionRequiredDone);
    }

    // sectionDone checks if all required section categories
    // have been completed.
    function sectionRequiredDone(section) {
        return _.some(section.categories, categoryRequiredDone);
    }

    // categoryDone checks if all required category attributes
    // have been completed.
    function categoryRequiredDone(category) {
        var requiredNotDoneFound = _.some(category.attributes, function(attr) {
            if (attr.required && !attr.done) {
                console.log("required attr not done", attr.name);
                return true;
            }
            return false;
        });

        return !requiredNotDoneFound;
    }

    function hasRequired(template) {
        return _.some(template.sections, sectionHasRequired);
    }

    function sectionHasRequired(section) {
        return _.some(template.categories, categoryHasRequired);
    }

    function categoryHasRequired(category) {
        var hasRequired = _.some(category.attributes, function(attr) {
            return attr.required;
        });
        return hasRequired;
    }
}
