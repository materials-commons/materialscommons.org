import { navbarDirective } from './navbar.directive';
import { onEnterDirective } from './on-enter';

angular.module('mc.global.components', [])
    .directive('navbar', navbarDirective)
    .directive('onEnter', onEnterDirective);
