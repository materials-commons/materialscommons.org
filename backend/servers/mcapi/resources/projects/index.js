const projects = require('./projects');

function createResources(router) {
    let resource = projects.createResource();
    router.use('/projects', resource.routes(), resource.allowedMethods());
}

module.exports = {
    createResources
};
