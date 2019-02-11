class MCWSService {
    constructor(User, $q) {
        this.User = User;
        this.$q = $q;
        this.ws = new ActionheroWebsocketClient();
        this.connected = false;
    }

    start() {
        if (!this.connected) {
            return this.$q((resolve, reject) => {
                this.ws.connect((err) => {
                    if (!err) {
                        this.connected = true;
                        resolve();
                    } else {
                        reject(err);
                    }
                });
            });
        } else {
            let deferred = this.$q.defer();
            deferred.resolve();
            return deferred.promise;
        }
    }

    action(action, args) {
        args.apikey = this.User.apikey();
        return this.$q((resolve, reject) => {
            this.ws.action(action, args, (data) => {
                if (data.error) {
                    reject(data.error);
                } else {
                    resolve(data.data);
                }
            });
        });
    }
}

angular.module('materialscommons').service('mcws', MCWSService);