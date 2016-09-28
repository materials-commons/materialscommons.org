import { bytesFilter } from './bytes';
import { toDateStringFilter, toDateFilter } from './todatestring-filter';

angular.module('materialscommons')
    .filter('bytes', bytesFilter)
    .filter('toDate', toDateFilter)
    .filter('toDateString', toDateStringFilter);
