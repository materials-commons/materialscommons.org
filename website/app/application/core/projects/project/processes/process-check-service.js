Application.Services.factory("processCheck", processService);
function processService() {
    return {
        allRequiredDone: allRequiredDone
    };

    ///////////////////////////

    function allRequiredDone(template) {
        for (var i = 0; i < template.sections.length; i++) {
            var section = template.sections[i];
            if (!allRequiredDoneForSection(section)) {
                return false;
            }
        }

        return true;
    }

    function allRequiredDoneForSection(section) {
        var foundRequiredNotDone = false;
        var attributes, attr;
        var categories = section.categories;
        attrCheck:
        for (var i = 0; i < categories.length; i++) {
            attributes = categories[i].attributes;
            for (var j = 0; j < attributes.length; j++) {
                attr = attributes[j];
                if (attr.required && !attr.done)  {
                    foundRequiredNotDone = true;
                    break attrCheck;
                }
            }
        }
        return !foundRequiredNotDone;
    }


}
