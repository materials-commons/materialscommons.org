Application.Services.factory("provWizard", provWizardService);
function provWizardService() {
    var self = this;
    this.byProject = {};

    return {
        currentTemplate: currentTemplate,
        setCurrentTemplate: setCurrentTemplate
    };

    /////////////////////////

    function getByProject(projectID) {
        if (!(projectID in self.byProject)) {
            initForProject(projectID);
        }
        return self.byProject[projectID];
    }

    function initForProject(projectID) {
        self.byProject[projectID] = {
            currentTemplate: {}
        };
    }

    function setCurrentTemplate(projectID, template) {
        var proj = getByProject(projectID);
        proj.currentTemplate = template;
    }

    function currentTemplate(projectID) {
        return getByProject(projectID).currentTemplate;
    }
}
