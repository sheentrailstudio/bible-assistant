const oneYearIndex = require("../data/oneYearReadingIndex.js");
const threeYearIndex = require("../data/threeYearsReadingIndex.js");

const plan = Object.freeze({
    qt1y: { 'code':'qt1y','name': '一年讀經計劃', 'indexPath': oneYearIndex },
    qt3y: { 'code':'qt3y','name': '三年讀經計劃', 'indexPath': threeYearIndex }
});


module.exports = { plan };