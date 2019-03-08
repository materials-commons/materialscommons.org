const {Action, api} = require('actionhero');
const dal = require('@dal');

module.exports.GetUserGlobusUploadsStatusForProjectAction = class GetUserGlobusUploadsStatusForProjectAction extends Action {
    constructor() {
        super();
        this.name = 'getUserGlobusUploadsStatusForProject';
        this.description = 'Get the status of globus uploads in the project for the user';
        this.inputs = {
            project_id: {
                required: true,
            }
        };
    }

    async run({response, params, user}) {
        let status = await dal.tryCatch(async() => await api.mc.projects.getUsersGlobusUploadStatus(user.id, params.project_id));
        if (status === null) {
            throw new Error(`Unable retrieve globus status for user ${user.id} in project ${params.project_id}`);
        }

        response.data = status;
    }
};
