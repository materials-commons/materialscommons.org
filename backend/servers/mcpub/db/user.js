var r = require('./../dash');
var parse = require('co-body');
var fs = require('fs');
//var thunkify = require('thunkify');
var path = require('path');

module.exports.get = function* (next) {
    var user = yield r.table('users').get(this.params.email);
    if (user) {
        this.status = 200;
        this.body = user;
    } else {
        this.status = 500;
        this.body = "User does not exists. Please Register"
    }
    yield next;
};

module.exports.upload = function* (next) {
    var user = this.request.body.fields;
    var does_email_exists = yield r.table('users').get(user.email);
    if (does_email_exists) {
        this.status = 500;
        this.body = "Email has already been registered. Please sign in!"
    } else {
        var file = this.request.body.files.image;
        //yield thunkify(fs.rename)(file.path, path.join('./../assets/user-images', '', file.name));
        user.id = user.email;
        user.image = file.name;
        yield r.table('users').insert(user);
        this.status = 200;
        this.body = JSON.stringify(this.request.body, null, 2);
    }
    yield next;
};


