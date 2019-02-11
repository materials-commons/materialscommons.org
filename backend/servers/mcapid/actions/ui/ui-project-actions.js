const {Action} = require('actionhero');
const projects = require('../../lib/dal/projects');
const dal = require('../../lib/dal');

module.exports.GetProjectsForUserAction = class GetProjectsForUserAction extends Action {
    constructor() {
        super();
        this.name = 'ui:getProjectsForUser';
        this.description = 'Retrieve all projects for the given user';
    }

    async run({response, user}) {
        console.log('user =', user);
        const usersProjects = await dal.tryCatch(async() => await projects.ui.getProjectsForUser(user.id));
        if (usersProjects === null) {
            throw new Error(`No such user`);
        }

        response.data = usersProjects;
    }
};

module.exports.GetProjectOverviewAction = class GetProjectOverviewAction extends Action {
    constructor() {
        super();
        this.name = 'ui:getProjectOverview';
        this.description = 'Retrieve a project for the given user';
    }

    async run() {}
};

module.exports.GetProjectNotesAction = class GetProjectsForUserAction extends Action {
    constructor() {
        super();
        this.name = 'ui:getProjectNotes';
        this.description = 'Retrieve notes for the given project';
    }

    async run() {}
};

// module.exports.GetProjectAccessEntriesAction = class GetProjectsForUserAction extends Action {
//     constructor() {
//         super();
//         this.name = 'ui:getProjectAccessEntries';
//         this.description = 'Retrieve the access entries for the given project';
//     }
// };