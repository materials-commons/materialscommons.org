module.exports = function models(r) {
    return {
        projects: require('./projects')(r),
        users: require('./users')(r),
        samples: require('./samples')(r),
        access: require('./access')(r),
        files: require('./files')(r),
        r: r
    };
};
