var tool = require('./_util/tool')
var util = require('util');

let str1 = 'hello';
let str2 = 'world';

tool.printTest();
console.log(util.format('%s %s', str1, str2));