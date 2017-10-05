import { bytesFilter } from './bytes';
import { toDateStringFilter, toDateFilter } from './todatestring-filter';
import './to-size.filter';
import './to-list.filter';

angular.module('materialscommons')
    .filter('bytes', bytesFilter)
    .filter('toDate', toDateFilter)
    .filter('toDateString', toDateStringFilter);
