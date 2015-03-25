module.exports = function models(r) {
    return {
        projects: require('./projects')(r),
        users: require('./users')(r)
    };
};
