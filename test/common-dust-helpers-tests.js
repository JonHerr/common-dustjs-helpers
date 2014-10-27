/**
 * Created by jon on 10/26/14.
 */
var dust = require('dustjs-linkedin'),
    helpers = require('dustjs-helpers'),
    customHelpers = require('../lib/common-dustjs-helpers'),
    nodeunit = require('nodeunit'),
    fs = require('fs'),
    model = {
        array: ["1", "2", "3"],
        email: "jon.herr@hotmail.com"
    };

module.exports.filter_tests = {
    "filter_test": function (test) {
        fs.readFile(__dirname + "/views/dust-test-html.html", function (err, result) {
            var temp = result.toString();
            var compiled = dust.compile(temp, "temp");
            dust.loadSource(compiled);
            dust.render("temp", model, function (err, result) {
                test.ok(result);
                test.done();
            });
        });
    }
};

module.exports.repeat_tests = {

};
module.exports.upcase = {

};

module.exports.titlecase = {

};

module.exports.downcase = {

};

module.exports.first = {

};

module.exports.last = {

};

module.exports.odd = {

};

module.exports.even = {

};

module.exports.count = {

};

module.exports.unless = {

};

module.exports.formatCurrency = {

};

module.exports.totalCurrency = {

};

module.exports.formatEmail = {

};

module.exports.firstAndLast = {

};