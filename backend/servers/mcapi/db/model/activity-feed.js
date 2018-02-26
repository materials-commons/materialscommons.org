const r = require('../r');

function* getActivityFeedForProject(projectId) {
    return yield r.table('events').getAll(projectId, {index: 'project_id'})
        .merge(event => {
            return {
                birthtime: event('birthtime').toEpochTime()
            };
        }).orderBy(r.desc('birthtime'));
}

module.exports = {
    getActivityFeedForProject
};