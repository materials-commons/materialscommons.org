Application.Services.factory("processCheck", processService);
function processService() {
    function allRequiredDoneForSection(section) {
        var foundRequiredNotDone = false;
        var attributes, attr;
        attrCheck:
        for (var i = 0; i < section.length; i++) {
            attributes = section[i].attributes;
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

    return {
        allRequiredDone: function(processTemplate) {
            if (!allRequiredDoneForSection(processTemplate.process)) {
                return false;
            }

            if (!allRequiredDoneForSection(processTemplate.inputs)) {
                return false;
            }

            if (!allRequiredDoneForSection(processTemplate.outputs)) {
                return false;
            }

            return true;
        }
    };
}
