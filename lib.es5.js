"use strict";

function fail(thing) {
    throw new Error(thing);
}

function warn(thing) {
    console.log(["WARNING:", thing].join(" "));
}

function note(thing) {
    console.log(["NOTE:", thing].join(" "));
}

function isNumber(num) {
    return !isNaN(+num) && typeof +num === "number";
}

function isIndexed(arr) {
    return Array.isArray(arr) || typeof arr === "string";
}

function isOutOfRange(arr, index) {
    return index < 0 || index >= arr.length;
}

function getNth(a, index) {
    if (!isNumber(index)) fail("Expected a number as the index");
    if (!isIndexed(a)) fail("Not supported on non-indexed type");
    if (isOutOfRange(a, index)) fail("Index value is out of bounds");
    return a[index];
}

function getFirst(arrOrString) {
    return getNth(arrOrString, 0);
}

function getSecond(arrOrString) {
    return getNth(arrOrString, 1);
}

function toArray(arr) {
    return Array.isArray(arr) && arr || !Array.isArray(arr) && arr.length && [].slice.call(arr) || typeof arr === "string" && arr.split("") || typeof arr === "object" && [];
}

function getRest(arrOrString) {
    return toArray(arrOrString).slice(1);
}

function lessOrEqual(x, y) {
    return x <= y;
}

function greaterThen(x, y) {
    return x > y;
}

function greaterOrEqual(x, y) {
    return x >= y;
}

function existy(x) {
    return x != null;
};

function truthy(x) {
    return x !== false && existy(x);
};

function comparator(pred) {
    return function (x, y) {
        if (truthy(pred(x, y))) return -1;else if (truthy(pred(y, x))) return 1;else return 0;
    };
}

function complement(pred) {
    return function () {
        return !pred.apply(null, toArray(arguments));
    };
}

function doWhen(condition, action) {
    if (truthy(condition)) {
        return typeof action === "function" ? action() : action;
    }
    return undefined;
}

function executeIfHasField(target, name) {
    return doWhen(existy(target[name]), function () {
        return target[name];
    });
}

function getProperty(key) {
    return function (dataArray) {
        return doWhen(existy(dataArray.map), function () {
            return dataArray.map(function (item) {
                return executeIfHasField(item, key);
            });
        });
    };
}

function cat() {
    var args = toArray(arguments),
        head = getFirst(args);

    if (existy(head)) {
        return head.concat.apply(head, getRest(args));
    }

    return [];
}

function construct(head, tail) {
    return cat([head], Array.isArray(tail) ? tail : [tail]);
}

function mapcat(fun, coll) {
    return cat.apply(null, coll.map(fun));
}

function butLast(coll) {
    return (Array.isArray(coll) ? coll : [coll]).slice(0, -1);
}

function interpose(inter, coll) {
    return butLast(mapcat(function (e) {
        return construct(e, [inter]);
    }, coll));
}

function keys(obj) {
    return Object.keys(obj);
}

function values(obj) {
    return keys(obj).map(function (key) {
        return obj[key];
    });
}

function pluck(key, arr) {
    return arr.map(function (item) {
        return item[key] || undefined;
    });
}

function pairs(obj) {
    return keys(obj).reduce(function (current, next) {
        return (current.push([next, obj[next]]), current);
    }, []);
}

function toObject(_x) {
    var _arguments = arguments;
    var _again = true;

    _function: while (_again) {
        _again = false;
        var arr = _x;
        if (_arguments.length > 1) {
            _arguments = [_x = [getFirst(toArray(_arguments)), getSecond(toArray(_arguments))]];
            _again = true;
            continue _function;
        } else {
            return getFirst(arr).reduce(function (c, n, i) {
                return (c[n] = getSecond(arr)[i], c);
            }, {});
        }
    }
}

function average() {
    return toArray(arguments).reduce(function (current, next) {
        return current + next;
    }, 0) / arguments.length;
}

function averageDamp(FUN) {
    return function (n) {
        return average(n, FUN(n));
    };
}

function plucker(FIELD) {
    return function (obj) {
        return obj && obj[FIELD];
    };
}

function filter(array, cond) {
    return array.filter(cond);
};

function max(arr) {
    return Math.max.apply(Math, arr);
}

function finder(valueFun, bestFun, coll) {
    return coll.reduce(function (best, current) {
        var bestValue = valueFun(best);
        var currentValue = valueFun(current);

        return bestValue === bestFun(bestValue, currentValue) ? best : current;
    });
}

function identity(value) {
    return value;
}

function range(length) {
    var index = -1,
        result = Array(length);

    while (++index < length) result[index] = index;

    return result;
}

function repeat(times, VALUE) {
    return range(times).map(function () {
        return VALUE;
    });
}

function repeatedly(times, fn) {
    return range(times).map(fn);
}

function iterateUntil(fun, check, init) {
    var ret = [],
        result = fun(init);

    while (check(result)) {
        ret.push(result);
        result = fun(result);
    }

    return ret;
}

function K(value) {
    return function () {
        return value;
    };
}

function checker() {
    var validators = toArray(arguments);

    return function (obj) {
        return validators.reduce(function (errs, check) {
            if (check(obj)) return errs;else return (errs.push(check.message), errs);
        }, []);
    };
}

function validator(message, fun) {
    var f = function f() {
        return fun.apply(fun, arguments);
    };

    f["message"] = message;

    return f;
}

function isObject(obj) {
    var type = typeof obj;
    return !!obj && (type === "object" || type === "function");
}

function invoker(NAME, METHOD) {
    return function (target) {
        if (!existy(target)) fail("Must provide a target");

        var targetMethod = target[NAME];

        var args = getRest(toArray(arguments));

        return doWhen(existy(targetMethod) && METHOD === targetMethod, function () {
            return targetMethod.apply(target, args);
        });
    };
}

function dispatch() {
    var funs = toArray(arguments),
        size = funs.length;

    return function (target) {
        var ret = undefined,
            args = getRest(toArray(arguments));

        for (var funIndex = 0; funIndex < size; funIndex++) {
            var fun = funs[funIndex];

            ret = fun.apply(fun, construct(target, args));

            if (existy(ret)) return ret;
        }

        return ret;
    };
}

function numberReverse(x) {
    if (typeof x !== "number") return null;
    var y = 0;
    do {
        y = (y + x % 10) * 10;
    } while (x = Math.floor(x / 10));

    return y / 10;
}

function stringReverse(str) {
    return typeof str === "string" ? str.split("").reverse().join("") : null;
}

var rev = dispatch(invoker("reverse", Array.prototype.reverse), numberReverse, stringReverse);

var sillyReverse = dispatch(rev, K(42));

function first(val) {
    note(["first is", val]);
    return true;
}

function second(val) {
    note(["second is", val]);
    return true;
}

function performCommandHardcoded(command) {
    var result;
    switch (command.type) {
        case "first":
            result = first(command.message);
            break;
        case "second":
            result = second(command.target);
            break;
        default:
            console.log(command.type);
    }
    return result;
}

function isA(type, action) {
    return function (obj) {
        if (type === obj.type) return action(obj);
    };
}

var performCommand = dispatch(isA("first", function (obj) {
    return first(obj.message);
}), isA("second", function (obj) {
    return second(obj.target);
}), function (obj) {
    note("rest", obj.type);
});

var superCommand = dispatch(isA("hello", function (obj) {
    note("Super", obj);return true;
}), performCommand);

function add(x) {
    return function (y) {
        return x + y;
    };
}

var add3 = add(3);

add3(4);

function _curry(fn) {
    var args = getRest(toArray(arguments));

    return function () {
        return fn.apply(this, args.concat(toArray(arguments)));
    };
}

var c = _curry(function (a, b, c) {
    console.log(arguments);
});

function curry(fn, length) {
    length = length || fn.length;

    return function () {
        var combined = [fn].concat(toArray(arguments));
        return arguments.length < length ? length - arguments.length > 0 ? curry(_curry.apply(this, combined), length - arguments.length) : _curry.call(this, combined) : fn.apply(this, arguments);
    };
}

function test(one, two, three, four) {
    console.log(arguments);
}

var ca = curry(test);

function div(n, d) {
    return n / d;
}

function partial1(fun, arg1) {
    return function () {
        var args = construct(arg1, toArray(arguments));
        return fun.apply(fun, args);
    };
}

function partial(fun) {
    var pargs = getRest(toArray(arguments));

    return function () {
        var args = cat(pargs, toArray(arguments));
        return fun.apply(fun, args);
    };
}

var zero = validator("cannot be zero", function (n) {
    return 0 === n;
});

var number = validator("arg must be a number", isNumber);

function sqr(n) {
    if (!number(n)) fail(number.message);
    if (zero(n)) fail(zero.message);

    return n * n;
}

function condition1() {
    var validators = toArray(arguments);

    return function (fun, arg) {
        var errors = mapcat(function (isValid) {
            return isValid(arg) ? [] : [isValid.message];
        }, validators);

        if (errors.length > 0) fail(errors.join(", "));

        return fun(arg);
    };
}

var sqrPre = condition1(validator("arg must not be zero", complement(zero)), validator("arg must be a number", isNumber));

function uncheckedSqr(n) {
    return n * n;
};

var checkedSqr = partial(sqrPre, uncheckedSqr);

var sillySquare = partial(condition1(validator("should be even", function (num) {
    return num % 2 === 0;
})), checkedSqr);

function hasKeys() {
    var keys = toArray(arguments);

    return function (obj) {
        return !keys.filter(function (item) {
            return complement(plucker(item))(obj);
        }).length;
    };
}

var validateCommand = condition1(validator("arg must be a map", isObject), validator("arg must have the correct keys", hasKeys("msg", "type")));

var createCommand = partial(validateCommand, identity);

var createLaunchCommand = partial(condition1(validator("arg must have the count down", hasKeys("countDown"))), createCommand);

var compose = function compose(f, g) {
    return function (x) {
        return f(g(x));
    };
};

var sine = function sine(x) {
    return Math.sin(x);
};
var cube = function cube(x) {
    return x * x * x;
};
var sineOfCube = compose(sine, cube);

var compose = function compose() {
    var args = [].slice.call(arguments);

    return function () {
        var _arguments = arguments;

        return args.reverse().reduce(function (cur, next) {

            return cur ? next.call(next, cur) : next.apply(next, _arguments);
        }, 0);
    };
};

var limit = curry(function (num, data) {
    return data.slice(0, num);
});

var _map = curry(function (fn, arr) {
    return arr.map(fn);
});

var getProp = curry(function (prop, obj) {
    return obj[prop];
});

var users = [{ name: "Ivan", age: 18 }, { name: "Katya", age: 23 }, { name: "Victor", age: 18 }, { name: "Nata", age: 14 }, { name: "Alex", age: 18 }, { name: "Sveta", age: 34 }];

var usersList = compose(_map(getProp("name")), limit(4));

function addOne(a) {
    return a + 1;
}

var fmap = curry(function (f, obj) {
    return obj.fmap ? obj.fmap(f) : f(obj);
});

var AnyFunctor = function AnyFunctor(val) {
    if (!(this instanceof AnyFunctor)) {
        return new AnyFunctor(val);
    }

    this.val = val;
};

AnyFunctor.prototype.fmap = function (fn) {
    return AnyFunctor(fn(this.val));
};

AnyFunctor.prototype.fmap = function (fn) {
    return AnyFunctor(this.val.map(fn));
};

var Maybe = function Maybe(val) {
    if (!(this instanceof Maybe)) {
        return new Maybe(val);
    }

    this.val = val;
};

Maybe.prototype.fmap = function (f) {
    return this.val == null ? Maybe(null) : Maybe(f(this.val));
};

var users = [{ name: "Ivan", secondName: "Pucka", age: 18 }, { name: "Katya", secondName: "Veider", age: 23 }, { name: "Victor", secondName: "Greg", age: 18 }, { name: "Nata", secondName: "Pavlov", age: 14 }, { name: "Alex", secondName: "Tandopolis", age: 18 }, { name: "Sveta", secondName: "Vasileva", age: 34 }];

var toUpper = curry(function (str) {
    return str.toUpperCase();
});

var getKey = curry(function (key, obj) {
    return obj[key];
});

var getObject = curry(function (search, arr) {
    var result = arr.filter(function (item) {
        return item.name === search;
    });
    return result.length ? getFirst(result) : null;
});

var extract = function extract(functor) {
    return functor.val;
};

function MONAD(modifire) {
    var prototype = Object.create(null);
    function unit(value) {
        var monad = Object.create(prototype);

        monad.bind = function (func, args) {
            return func.apply(null, args ? [value].concat(args) : [value]);
        };

        if (typeof modifire === "function") {
            modifire(monad, value);
        }

        return monad;
    }

    unit.lift = function (name, func) {

        prototype[name] = function () {
            return unit(this.bind(func, [].slice.call(arguments)));
        };

        return unit;
    };

    return unit;
}

var maybe = MONAD(function (monad, value) {

    if (value == null) {
        monad.is_null = true;
        monad.bind = function () {
            return monad;
        };
    }
});

function getLength(arr) {
    return arr.length ? 1 + getLength(arr.splice(1)) : 0;
}

function cycle(times, ary) {
    return times <= 0 ? [] : cat(ary, cycle(times - 1, ary));
}

function nexts(_x2, _x3) {
    var _again2 = true;

    _function2: while (_again2) {
        pair = from = to = more = undefined;
        _again2 = false;
        var graph = _x2,
            node = _x3;

        if (!graph.length) return [];

        var pair = getFirst(graph),
            from = getFirst(pair),
            to = getSecond(pair),
            more = getRest(graph);

        if (node === from) {
            return construct(to, nexts(more, node));
        } else {
            _x2 = more;
            _x3 = node;
            _again2 = true;
            continue _function2;
        }
    }
}

var influences = [["Lisp", "Smalltalk"], ["Lisp", "Scheme"], ["Smalltalk", "Self"], ["Scheme", "JavaScript"], ["Scheme", "Lua"], ["Self", "Lua"], ["Self", "JavaScript"]];

function depthSearch(_x4, _x5, _x6) {
    var _again3 = true;

    _function3: while (_again3) {
        node = more = undefined;
        _again3 = false;
        var graph = _x4,
            nodes = _x5,
            seen = _x6;

        if (!nodes.length) return seen.reverse();
        var node = getFirst(nodes),
            more = getRest(nodes);
        if (!! ~seen.indexOf(node)) {
            _x4 = graph;
            _x5 = more;
            _x6 = seen;
            _again3 = true;
            continue _function3;
        } else {
            _x4 = graph;
            _x5 = cat(nexts(graph, node), more);
            _x6 = construct(node, seen);
            _again3 = true;
            continue _function3;
        }
    }
}

function and() {
    var preds = toArray(arguments);

    return function () {
        var args = toArray(arguments);

        var everything = function everything(_x7, _x8) {
            var _left;

            var _again4 = true;

            _function4: while (_again4) {
                _again4 = false;
                var ps = _x7,
                    truth = _x8;

                if (!ps.length) return truth;else {
                    if (!(_left = args.every(getFirst(ps)))) {
                        return _left;
                    }

                    _x7 = getRest(ps);
                    _x8 = truth;
                    _again4 = true;
                    continue _function4;
                }
            }
        };

        return everything(preds, true);
    };
}

var everyEvenNumber = and(isNumber, function (n) {
    return n % 2 === 0;
});

function or() {
    var preds = toArray(arguments);

    return function () {
        var args = toArray(arguments);
        var something = function something(_x9, _x10) {
            var _left2;

            var _again5 = true;

            _function5: while (_again5) {
                _again5 = false;
                var ps = _x9,
                    truth = _x10;

                if (!ps.length) return truth;else {
                    if (_left2 = args.some(getFirst(ps))) {
                        return _left2;
                    }

                    _x9 = getRest(ps);
                    _x10 = truth;
                    _again5 = true;
                    continue _function5;
                }
            }
        };
        return something(preds, false);
    };
}

var someEvenNumber = or(function (n) {
    return n % 2 !== 0;
}, function (n) {
    return n === 0;
});

function even(n) {
    //console.log('from even', n);
    if (n === 0) return true;else return odd(Math.abs(n) - 1);
}

function odd(n) {
    //console.log('from odd', n);
    if (n === 0) return false;else return even(Math.abs(n) - 1);
}

function flat(array) {
    if (Array.isArray(array)) return cat.apply(cat, array.map(flat));else return [array];
}

var arr = flat([[1, 2], [3, 4]]);

function visit(mapFun, resultFun, array) {
    if (Array.isArray(array)) return resultFun(array.map(mapFun));else return resultFun(array);
}

function postDepth(fun, ary) {
    return visit(partial(postDepth, fun), fun, ary);
}

var m = postDepth(function (x) {
    return x === "Lisp" ? "LISP" : x;
}, influences);

function influencedWithStrategy(strategy, lang, graph) {
    var results = [];

    strategy(function (x) {
        if (Array.isArray(x) && getFirst(x) === lang) {
            results.push(getSecond(x));
        }

        return x;
    }, graph);

    return results;
}

function evenOline(n) {
    if (n === 0) return true;else return partial(oddOline, Math.abs(n) - 1);
}

function oddOline(n) {
    if (n === 0) return false;else return partial(evenOline, Math.abs(n) - 1);
}

function trampoline(fun) {
    var result = fun.apply(fun, getRest(toArray(arguments)));

    while (typeof result === "function") {
        result = result();
    }
    return result;
}

function isEvenSafe(n) {
    if (n === 0) return true;else return trampoline(partial(oddOline, Math.abs(n) - 1));
}
function isOddSafe(n) {
    if (n === 0) return false;else return trampoline(partial(evenOline, Math.abs(n) - 1));
}

function take(array, n) {
    n = n || 1;
    var length = array ? array.length : 0;
    if (!length) return [];
    return array.slice(0, n < 0 ? 0 : n);
}

function random(min, max) {
    return Math.floor(Math.random() * ((max || 0) - (min || 0) + 1) + min);
}

var rand = partial(random, 1);

function randString(len) {
    var ascii = repeatedly(len, partial1(rand, 26));

    return ascii.map(function (n) {
        return n.toString(36);
    }).join("");
}

function generateRandomCharacter() {
    return rand(26).toString(36);
}

function generateString(charGen, len) {
    return repeatedly(len, charGen).join("");
}

function skipTake(n, coll) {
    var ret = [],
        sz = coll.length;

    for (var index = 0; index < sz; index += n) {
        ret.push(coll[index]);
    }

    return ret;
}

function summRec(_x11, _x12) {
    var _again6 = true;

    _function6: while (_again6) {
        _again6 = false;
        var array = _x11,
            seed = _x12;

        seed = seed || 0;
        if (!array.length) return seed;else {
            _x11 = getRest(array);
            _x12 = getFirst(array) + seed;
            _again6 = true;
            continue _function6;
        }
    }
}

function randomlyRepeat(times, collection) {
    return collection.reduce(function (current, item) {
        return current.concat(repeatedly(times(10), function () {
            return item;
        }));
    }, []);
}

var brands = randomlyRepeat(curry(rand), ["apple", "dell", "lg", "samsung"]);

function count(data) {
    return data.reduce(function (current, item) {
        return (current[item] = (current[item] || 0) + 1, current);
    }, {});
}

function extend() {
    var main = getFirst(toArray(arguments)),
        rest = getRest(toArray(arguments));

    if (isObject(main) && !Array.isArray(main)) {
        rest.forEach(function (next) {
            if (isObject(next) && !Array.isArray(next)) {
                for (var i in next) {
                    if (next.hasOwnProperty(i)) {
                        main[i] = next[i];
                    }
                }
            }
        });
    }

    return main;
}

function merge() {
    return extend.apply(null, construct({}, [].slice.call(arguments)));
}

function user() {
    var firstName, secondName, nickName;

    return {
        setFirstName: function setFirstName(str) {
            firstName = str;
            return this;
        },
        setSecondName: function setSecondName(str) {
            secondName = str;
            return this;
        },
        setNickName: function setNickName(str) {
            nickName = str;
            return this;
        },
        getUserInfo: function getUserInfo() {
            return [firstName, secondName, nickName].join(" ");
        }
    };
}

function LazyChain(obj) {
    this._calls = [];
    this._target = obj;
}

LazyChain.prototype.invoke = function (methodName) {
    var args = getRest(toArray(arguments));

    this._calls.push(function (target) {
        var meth = target[methodName];
        if (existy(meth)) {
            return meth.apply(target, args);
        }
        return null;
    });

    return this;
};

LazyChain.prototype.run = function () {
    return this._calls.reduce(function (target, thunk) {
        return thunk(target);
    }, this._target);
};

LazyChain.prototype.tap = function (fn) {
    this._calls.push(function (target) {
        fn(target);
        return target;
    });

    return this;
};

var defferedChain = new LazyChain([2, 1, 3]).invoke("concat", [8, 5, 7, 6]).invoke("sort").tap(function (target) {
    console.log("tap", target);
}).invoke("join", " ");

function LazyChainOnChain(obj) {
    var isLC = obj instanceof LazyChain;

    this._calls = isLC ? cat(obj._calls, []) : [];
    this._target = isLC ? obj._target : obj;
}

LazyChainOnChain.prototype = LazyChain.prototype;

function LazyChainPromisse(obj) {
    this._calls = [];
    this._target = obj;
}

LazyChainPromisse.prototype.invoke = function () {
    var first = getFirst(toArray(arguments)),
        rest = getRest(toArray(arguments));

    this._calls.push(function (target) {

        if (typeof first === "string") {
            var meth = target[first];

            if (existy(meth)) {
                return meth.apply(target, rest);
            }
        } else if (typeof first === "function") {
            return first.apply(first, [target]);
        }
    });

    return this;
};

LazyChainPromisse.prototype.run = function (callback, index, target) {
    if (!index || index < this._calls.length) {
        target = target || this._target;
        index = index || 0;

        Promise.resolve(this._calls[index](target)).then((function (result) {
            this.run(callback, ++index, result || target);
        }).bind(this));
    } else {
        callback(target);
    }
};

function pipeline(seed) {
    return getRest(toArray(arguments)).reduce(function (l, r) {
        return r(l);
    }, seed);
}

function fifth(a) {
    return pipeline(a, getRest, getRest, getRest, getRest, getFirst);
}

function negativeFifth(a) {
    return pipeline(a, fifth, function (n) {
        return -n;
    });
}

var library = [{ title: "SICP", isbn: "0262010771", ed: 1 }, { title: "SICP", isbn: "0262510871", ed: 2 }, { title: "Joy of Clojure", isbn: "1935182641", ed: 1 }];

function isArrayOfStrings(arr) {
    return Array.isArray(arr) && and(function (s) {
        return typeof s === "string";
    }).apply(null, arr);
}

function isFunction(arg) {
    return typeof arg === "function";
}

function isString(str) {
    return typeof str === "string";
}

function whenType(pred, condition, action) {
    return function (obj) {
        return pred(condition) ? obj.map(action) : undefined;
    };
}

var select = function select(condition, object) {
    return dispatch(whenType(isFunction, condition, function (obj) {
        var res = {};
        for (var key in obj) {
            if (truthy(condition(key, obj[key]))) {
                res[key] = obj[key];
            }
        }
        return res;
    }), whenType(isString, condition, function (obj) {
        var res = {};
        return (res[condition] = obj[condition], res);
    }), whenType(isArrayOfStrings, condition, function (obj) {
        return condition.reduce(function (curr, next) {
            return (curr[next] = obj[next], curr);
        }, {});
    }))(object);
};

function rename(obj, newNames) {
    return Object.keys(obj).reduce(function (cur, next) {
        if (newNames.hasOwnProperty(next)) {
            cur[newNames[next]] = obj[next];
        }

        return cur;
    }, getFirst(select(function (key, value) {
        return ! ~Object.keys(newNames).indexOf(key);
    }, [obj])));
};

function as(newNames, table) {
    return table.map(function (obj) {
        return rename(obj, newNames);
    });
};

var res = select(["edition"], as({ ed: "edition" }, library));

function restrict(pred, table) {
    return table.reduce(function (newTable, obj) {
        if (truthy(pred(obj))) return newTable;else return newTable.filter(function (item) {
            return item !== obj;
        });
    }, table);
};

var r = restrict(function (book) {
    return book.edition > 1;
}, select(["title", "edition"], as({ ed: "edition" }, library)));

function firstEditions(table) {
    return pipeline(table, function (t) {
        return as({ ed: "edition" }, t);
    }, function (t) {
        return select(["title", "edition", "isbn"], t);
    }, function (t) {
        return restrict(function (book) {
            return book.edition === 1;
        }, t);
    });
}

var RQL = {
    select: curry(select),
    as: curry(as),
    where: curry(restrict)
};
//
function allFirstEditions(table) {
    return pipeline(table, RQL.select(["title", "ed", "isbn"]), RQL.as({ ed: "edition" }), RQL.where(function (book) {
        return book.edition === 1;
    }));
}

function sqr(x) {
    return x * x;
}

function actions(acts, done) {
    return function (seed) {
        var init = { values: [], state: seed };

        var intermediate = acts.reduce(function (stateObj, action) {

            var result = action(stateObj.state);
            var values = cat(stateObj.values, [result.answer]);

            return {
                values: values,
                state: result.state
            };
        }, init);

        var keep = intermediate.values.filter(existy);

        return done(keep, intermediate.state);
    };
};

function mSqr() {
    return function (state) {
        var ans = sqr(state);

        return {
            answer: ans,
            state: ans
        };
    };
}

var doubleSquareAction = actions([mSqr(), mSqr()], function (values) {
    return values;
});

function mNote() {
    return function (state) {

        note(state);

        return {
            answer: undefined,
            state: state
        };
    };
}

function mNeg() {
    return function (state) {
        return {
            answer: -state,
            state: -state
        };
    };
}

var negativeSqrAction = actions([mSqr(), mNote(), mNeg()], function (_, state) {
    return state;
});

function lift(answerFun, stateFun) {
    return function () {
        var args = [].slice.call(arguments);

        return function (state) {
            var ans = answerFun.apply(null, construct(state, args));
            var s = stateFun ? stateFun(state) : ans;

            return { answer: ans, state: s };
        };
    };
};

var mSqr2 = lift(sqr);
var mNote2 = lift(note, identity);
var mNeg2 = lift(function (n) {
    return -n;
});

var negativeSqrAction2 = actions([mSqr2(), mNote2(), mNeg2()], function (_, state) {
    return state;
});

var push = lift(function (stack, e) {
    return construct(e, stack);
});
var pop = lift(getFirst, getRest);

var stackAction = actions([push(1), push(2), pop()], function (values, state) {
    return values;
});

pipeline([], stackAction).forEach(function (elem) {});

//console.log(elem);

