module.exports = function(files) {
    return {
        get: get
    };

    ///////////////////

    function* get(next) {
        this.body = yield files.get(this.params.file_id);
        yield next;
    }
};
