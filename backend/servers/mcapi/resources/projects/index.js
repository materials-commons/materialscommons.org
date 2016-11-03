const projects = require('./projects');

function createResource() {
    return projects.createResource();
}

module.exports = {
    createResource
};
