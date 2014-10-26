/**
 * Created by jon on 10/25/14.
 */
/**
 * Created by jon on 10/25/14.
 */

(function(dust, _) {

    //using the built in logging method of dust when accessible
    var _log = dust.log ? function(mssg) { dust.log(mssg, "INFO"); } : function() {};

    var helpers = {
        _eval_dust_string: function(str, chunk, context) {
            var buf;
            if (typeof str === "function") {
                if (str.length === 0) {
                    str = str();
                } else {
                    buf = '';
                    (chunk.tap(function(data) {
                        buf += data;
                        return '';
                    })).render(str, context).untap();
                    str = buf;
                }
            }
            return str;
        },
        _render_if_else: function(b, chunk, context, bodies) {
            if (b === true) {
                if (bodies.block != null) {
                    chunk = chunk.render(bodies.block, context);
                }
            } else {
                if (bodies["else"] != null) {
                    chunk = chunk.render(bodies["else"], context);
                }
            }
            return chunk;
        },
        filter: function(chunk, context, bodies, params) {
            var filter_type;
            if ((params != null ? params.type : void 0) != null) {
                filter_type = this._eval_dust_string(params.type, chunk, context);
            }
            return chunk.capture(bodies.block, context, function(data, chunk) {
                if (filter_type != null) {
                    data = dust.filters[filter_type](data);
                }
                chunk.write(data);
                return chunk.end();
            });
        },
        repeat: function(chunk, context, bodies, params) {
            var i, times, _i, _ref, _ref1, _ref2, _ref3;
            times = parseInt(this._eval_dust_string(params.times, chunk, context));
            if ((times != null) && !isNaN(times)) {
                if ((_ref = context.stack.head) != null) {
                    _ref['$len'] = times;
                }
                for (i = _i = 0; 0 <= times ? _i < times : _i > times; i = 0 <= times ? ++_i : --_i) {
                    if ((_ref1 = context.stack.head) != null) {
                        _ref1['$idx'] = i;
                    }
                    chunk = bodies.block(chunk, context.push(i, i, times));
                }
                if ((_ref2 = context.stack.head) != null) {
                    _ref2['$idx'] = void 0;
                }
                if ((_ref3 = context.stack.head) != null) {
                    _ref3['$len'] = void 0;
                }
            }
            return chunk;
        },
        upcase: function(chunk, context, bodies) {
            return chunk.capture(bodies.block, context, function(data, chunk) {
                chunk.write(data.toUpperCase());
                return chunk.end();
            });
        },
        titlecase: function(chunk, context, bodies) {
            return chunk.capture(bodies.block, context, function(data, chunk) {
                chunk.write(data.replace(/([^\W_]+[^\s-]*) */g, (function(txt) {
                    return txt.charAt(0).toUpperCase() + txt.substr(1);
                })));
                return chunk.end();
            });
        },
        downcase: function(chunk, context, bodies) {
            return chunk.capture(bodies.block, context, function(data, chunk) {
                chunk.write(data.toLowerCase());
                return chunk.end();
            });
        },
        first: function(chunk, context, bodies, params) {
            var c, _ref;
            if ((context != null ? (_ref = context.stack) != null ? _ref.index : void 0 : void 0) != null) {
                c = context.stack.index === 0;
                return this._render_if_else(c, chunk, context, bodies, params);
            }
            return chunk;
        },
        last: function(chunk, context, bodies, params) {
            var c, _ref;
            if ((context != null ? (_ref = context.stack) != null ? _ref.index : void 0 : void 0) != null) {
                c = context.stack.index === (context.stack.of - 1);
                return this._render_if_else(c, chunk, context, bodies, params);
            }
            return chunk;
        },
        odd: function(chunk, context, bodies, params) {
            var c, _ref;
            if ((context != null ? (_ref = context.stack) != null ? _ref.index : void 0 : void 0) != null) {
                c = context.stack.index % 2 === 1;
                return this._render_if_else(c, chunk, context, bodies, params);
            }
            return chunk;
        },
        even: function(chunk, context, bodies, params) {
            var c, _ref;
            if ((context != null ? (_ref = context.stack) != null ? _ref.index : void 0 : void 0) != null) {
                c = context.stack.index % 2 === 0;
                return this._render_if_else(c, chunk, context, bodies, params);
            }
            return chunk;
        },
        count: function(chunk, context, bodies, params) {
            var value;
            value = this._eval_dust_string(params.of, chunk, context);
            if ((value != null ? value.length : void 0) != null) {
                chunk.write(value.length);
            }
            return chunk;
        },
        unless: function(chunk, context, bodies, params) {
            var execute_body;
            execute_body = this._inner_if_helper(chunk, context, bodies, params);
            execute_body = !execute_body;
            return this._render_if_else(execute_body, chunk, context, bodies, params);
        },
        _inner_if_helper: function(chunk, context, bodies, params) {
            var above, below, c, countof, execute_body, isntval, isval, matches, re, value, _i, _len, _ref;
            execute_body = false;
            if (params != null) {
                if (params.test != null) {
                    value = this._eval_dust_string(params.test, chunk, context);
                }
                _ref = ['count', 'count_of', 'count-of', 'countof'];
                for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                    c = _ref[_i];
                    if (params[c] != null) {
                        countof = this._eval_dust_string(params[c], chunk, context);
                        if ((countof != null ? countof.length : void 0) != null) {
                            value = countof.length;
                        }
                    }
                }
                if (value == null) {
                    value = this._eval_dust_string(params.value, chunk, context);
                }
                if (value != null) {
                    if (("" + value) === ("" + (parseFloat(value)))) {
                        value = parseFloat(value);
                    }
                    if (params.matches != null) {
                        matches = this._eval_dust_string(params.matches, chunk, context);
                        re = new RegExp(matches);
                        execute_body = re.test(value);
                    } else if (params['is'] != null) {
                        isval = this._eval_dust_string(params['is'], chunk, context);
                        if (typeof value === 'number' && (!isNaN(parseFloat(isval)))) {
                            isval = parseFloat(isval);
                        }
                        execute_body = value === isval;
                    } else if (params['isnt'] != null) {
                        isntval = this._eval_dust_string(params['isnt'], chunk, context);
                        if (typeof value === 'number' && (!isNaN(parseFloat(isntval)))) {
                            isntval = parseFloat(isntval);
                        }
                        execute_body = value !== isntval;
                    } else if (params.above != null) {
                        above = this._eval_dust_string(params.above, chunk, context);
                        if (typeof value === 'number' && (!isNaN(parseFloat(above)))) {
                            above = parseFloat(above);
                        }
                        execute_body = value > above;
                    } else if (params.below != null) {
                        below = this._eval_dust_string(params.below, chunk, context);
                        if (typeof value === 'number' && (!isNaN(parseFloat(below)))) {
                            below = parseFloat(below);
                        }
                        execute_body = value < below;
                    } else {
                        execute_body = value === true || value === 'true' || value === 'TRUE' || value === 't' || value === 'T' || value === 1 || value === '1' || value === 'on' || value === 'ON' || value === 'yes' || value === 'YES' || value === 'y' || value === 'Y';
                    }
                }
            }
            return execute_body;
        },
        formatCurrency: function (chunk, context, bodies, params) {
            var value = dust.helpers.tap(params.value, chunk, context);
            var num = parseFloat(value);
            if (isNaN(num)) {
                return chunk.write('$0.00');
            }

            var isNegative = num < 0;

            num = Math.abs(num);

            var prefix = isNegative ? "-$": "$";
            num = num.toFixed(2);
            var actValue = num.split(".");
            actValue[0] = actValue[0].match(/.{1,3}/g).join(",");
            actValue = actValue.join(".");
            return chunk.write(prefix + actValue);
        },
        total: function (chunk, context, bodies, params) {
            var key = dust.helpers.tap(params.key, chunk, context);
            var value = dust.helpers.tap(params.value, chunk, context);
            key = parseFloat(key);
            value = parseFloat(value);
            if (isNaN(key) || isNaN(value)) {
                return chunk.write('0');
            }
            var total = ((key * 100) * (value * 100)) / 100;
            return chunk.write(total);
        },
        totalCurrency: function (chunk, context, bodies, params) {
            var key = dust.helpers.tap(params.key, chunk, context);
            var value = dust.helpers.tap(params.value, chunk, context);
            key = parseFloat(key);
            value = parseFloat(value);
            if (isNaN(key) || isNaN(value)) {
                return chunk.write('$0.00');
            }
            var total = (key * value).toFixed(2);
            var actValue = total.split(".");
            actValue[0] = actValue[0].match(/.{1,3}/g).join(",");
            actValue = actValue.join(".");
            return chunk.write('$' + actValue);
        },
        formatEmail: function(chunk, context, bodies, params) {
            var email = dust.helpers.tap(params.value, chunk, context);
            if (email.length > 25) {
                return chunk.write(email.substr(0,24) + '...');
            }else {
                return chunk.write(email);
            }
        }
    };

    dust.helpers = dust.helpers || {};
    _.extend(dust.helpers, helpers);

})(
        typeof exports !== 'undefined' ? module.exports = require('dustjs-helpers'): window.dust,
        typeof exports !== 'undefined' ? module.exports = require('lodash') : window._
    );
