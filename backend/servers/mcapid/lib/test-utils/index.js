module.exports = function(r) {

    const projects = require('@dal/projects')(r);
    const dirUtils = require('@dal/dir-utils')(r);

    async function createTestProject(userId) {
        const user = {id: userId ? userId : 'test@test.mc'};
        let name = await r.uuid();
        return await projects.createProject(user, name, '');
    }

    async function deleteProject(id) {
        return await projects.deleteProject(id);
    }

    async function createFile(name, directoryId, projectId) {
        let checksum = await r.uuid();
        let fileEntry = {
            name: name,
            owner: 'test@test.mc',
            mediatype: {},
            size: 1,
            uploaded: 1,
            checksum: checksum,
            usesid: '',
            id: checksum,
            parent: ''
        };

        return await dirUtils.createFile(fileEntry, directoryId, projectId);
    }

    return {
        createTestProject,
        deleteProject,
        createFile,
    };
};