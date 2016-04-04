module.exports = function models(r) {
    return {
        projects: require('./projects')(r),
        users: require('./users')(r),
        samples: require('./samples')(r),
        access: require('./access')(r),
        processes: require('./processes')(r),
        files: require('./files')(r),
        directories: require('./directories')(r),
        shares: require('./shares')(r),
        experiments: require('./experiments')(r),
        r: r
    };
};
