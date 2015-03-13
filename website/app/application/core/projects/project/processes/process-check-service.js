Application.Services.factory("processCheck", processService);
function processService() {
    return {
        // check that required items are done
        allRequiredDone: allRequiredDone,
        sectionRequiredDone: sectionRequiredDone,
        categoryRequiredDone: categoryRequiredDone,

        // check if there are required items.
        hasRequired: hasRequired,
        sectionHasRequired: sectionHasRequired,
        categoryHasRequired: categoryHasRequired
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
        var requiredNotDoneFound = _.some(category.attributes, checkRequiredNotDone);
        return !requiredNotDoneFound;

        ///////////////////////

        function checkRequiredNotDone(attr) {
            if (attr.required) {
                if (attr.value instanceof Array && attr.value.length === 0) {
                    return true;
                } else if (attr.value === "" || attr.value === null) {
                    return true;
                }
            }
            return false;
        }
    }

    // hasRequired checks if there is at least one section that is required.
    function hasRequired(template) {
        return _.some(template.sections, sectionHasRequired);
    }

    // sectionHasRequired checks if there is at least one category that
    // is required.
    function sectionHasRequired(section) {
        return _.some(section.categories, categoryHasRequired);
    }

    // categoryHasRequired checks if there is at least one attribute
    // that is required.
    function categoryHasRequired(category) {
        var hasRequired = _.some(category.attributes, function(attr) {
            return attr.required;
        });
        return hasRequired;
    }
}
