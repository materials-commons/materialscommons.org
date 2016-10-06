export function HomeTabDirective(){
  'ngInject';

  let directive ={
    restrict: 'E',
    templateUrl: 'app/home/home-tabs.html'
  };
  return directive;
}
