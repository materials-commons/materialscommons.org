module.exports = function (rql) {
    let runopts = {
        timeFormat: 'raw'
    };
    return rql.run(runopts);
};
