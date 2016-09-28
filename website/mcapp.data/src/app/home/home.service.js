//
//export class homeService {
//  constructor($q, elasticsearch, $location){
//    'ngInject';
//    this.client = esFactory({
//      host: $location.host() + ':9200'
//    });
//    this.$q = $q;
//  }
//
//  search(term){
//    var deferred = $q.defer();
//    var query = {
//      match: {
//        _all: term
//      }
//    };
//
//    this.client.search({
//      index: 'disney',
//      type: 'character',
//      query:query
//    }).then(function(result) {
//      console.dir(result);
//      var ii = 0, hits_in, hits_out = [];
//
//      hits_in = (result.hits || {}).hits || [];
//
//      for(; ii < hits_in.length; ii++) {
//        hits_out.push(hits_in[ii]._source);
//      }
//
//      deferred.resolve(hits_out);
//    }, deferred.reject);
//
//    return deferred.promise;
//  }
//
//
//}
