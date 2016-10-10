/* global _:true */
export class browseService {
  /*@ngInject*/
  constructor($state) {
    this.process_results = [];
    this.sample_results = [];
    this.$state = $state;
  }

  setProcessResults(browse_data) {
    this.process_results = browse_data;
  }

  setSampleResults(browse_data) {
    this.sample_results = browse_data;
  }

  getResults(what, type) {
    var i;
    switch(type){
    case "sample":
       i = _.findIndex(this.sample_results, function (row) {
        return row.id == what;
      });
      if(i > -1){
        return this.sample_results[i];
      }
      break;
    case "process":
      i = _.findIndex(this.process_results, function (row) {
        return row.group == what;
      });
      if(i > -1){
        return this.process_results[i];
      }
      break;
    }
  }

  isRouteActive(route){
    if (route === this.$state.current.name){
      return true;
    }
  }
}
