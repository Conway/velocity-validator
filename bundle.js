(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){

},{}],2:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],3:[function(require,module,exports){
'use strict';
module.exports = function(Velocity, utils) {

  /**
   * blocks语法处理
   */
  utils.mixin(Velocity.prototype, {
    /**
     * 处理代码库: if foreach macro
     */
    getBlock: function(block) {

      var ast = block[0];
      var ret = '';

      switch (ast.type) {
        case 'if':
          ret = this.getBlockIf(block);
          break;
        case 'foreach':
          ret = this.getBlockEach(block);
          break;
        case 'macro':
          this.setBlockMacro(block);
          break;
        case 'noescape':
          ret = this._render(block.slice(1));
          break;
        case 'define':
          this.setBlockDefine(block);
          break;
        case 'macro_body':
          ret = this.getMacroBody(block);
          break;
        default:
          ret = this._render(block);
      }

      return ret || '';
    },

    /**
     * define
     */
    setBlockDefine: function(block) {
      var ast = block[0];
      var _block = block.slice(1);
      var defines = this.defines;

      defines[ast.id] = _block;
    },

    /**
     * define macro
     */
    setBlockMacro: function(block) {
      var ast = block[0];
      var _block = block.slice(1);
      var macros = this.macros;

      macros[ast.id] = {
        asts: _block,
        args: ast.args
      };
    },

    getMacroBody: function(asts) {
      const ast = asts[0];
      var _block = asts.slice(1);
      var bodyContent = this.eval(_block, {});
      return this.getMacro(ast, bodyContent);
    },

    /**
     * parse macro call
     */
    getMacro: function(ast, bodyContent) {
      var macro = this.macros[ast.id];
      var ret = '';

      if (!macro) {

        var jsmacros = this.jsmacros;
        macro = jsmacros[ast.id];
        var jsArgs = [];

        if (macro && macro.apply) {

          utils.forEach(ast.args, function(a) {
            jsArgs.push(this.getLiteral(a));
          }, this);

          var self = this;

          // bug修复：此处由于闭包特性，导致eval函数执行时的this对象是上一次函数执行时的this对象，渲染时上下文发生错误。
          jsmacros.eval = function() {
            return self.eval.apply(self, arguments);
          };


          try {
            ret = macro.apply(jsmacros, jsArgs);
          } catch (e) {
            var pos = ast.pos;
            var text = Velocity.Helper.getRefText(ast);
            // throws error tree
            var err = '\n      at ' + text + ' L/N ' + pos.first_line + ':' + pos.first_column;
            e.name = '';
            e.message += err;
            throw new Error(e);
          }

        }

      } else {
        var asts = macro.asts;
        var args = macro.args;
        var callArgs = ast.args;
        var local = { bodyContent: bodyContent };
        var guid = utils.guid();
        var contextId = 'macro:' + ast.id + ':' + guid;

        utils.forEach(args, function(ref, i) {
          if (callArgs[i]) {
            local[ref.id] = this.getLiteral(callArgs[i]);
          } else {
            local[ref.id] = undefined;
          }
        }, this);

        ret = this.eval(asts, local, contextId);
      }

      return ret;
    },

    /**
     * eval
     * @param str {array|string} 需要解析的字符串
     * @param local {object} 局部变量
     * @param contextId {string}
     * @return {string}
     */
    eval: function(str, local, contextId) {

      if (!local) {

        if (utils.isArray(str)) {
          return this._render(str);
        } else {
          return this.evalStr(str);
        }

      } else {

        var asts = [];
        var parse = Velocity.parse;
        contextId = contextId || ('eval:' + utils.guid());

        if (utils.isArray(str)) {

          asts = str;

        } else if (parse) {

          asts = parse(str);

        }

        if (asts.length) {

          this.local[contextId] = local;
          var ret = this._render(asts, contextId);
          this.local[contextId] = {};
          this.conditions.shift();
          this.condition = this.conditions[0] || '';

          return ret;
        }

      }

    },

    /**
     * parse #foreach
     */
    getBlockEach: function(block) {

      var ast = block[0];
      var _from = this.getLiteral(ast.from);
      var _block = block.slice(1);
      var _to = ast.to;
      var local = {
        foreach: {
          count: 0
        }
      };
      var ret = '';
      var guid = utils.guid();
      var contextId = 'foreach:' + guid;

      var type = ({}).toString.call(_from);
      if (!_from || (type !== '[object Array]' && type !== '[object Object]')) {
        return '';
      }

      if (utils.isArray(_from)) {
        var len = _from.length;
        utils.forEach(_from, function(val, i) {
          if (this._state.break) {
            return;
          }
          // 构造临时变量
          local[_to] = val;
          local.foreach = {
            count: i + 1,
            index: i,
            hasNext: i + 1 < len
          };
          local.velocityCount = i + 1;

          this.local[contextId] = local;
          ret += this._render(_block, contextId);

        }, this);
      } else {
        var len = utils.keys(_from).length;
        utils.forEach(utils.keys(_from), function(key, i) {
          if (this._state.break) {
            return;
          }
          local[_to] = _from[key];
          local.foreach = {
            count: i + 1,
            index: i,
            hasNext: i + 1 < len
          };
          local.velocityCount = i + 1;
          this.local[contextId] = local;
          ret += this._render(_block, contextId);
        }, this);
      }

      // if foreach items be an empty array, then this code will shift current
      // conditions, but not this._render call, so this will shift parent context
      if (_from && _from.length) {
        this._state.break = false;
        // empty current local context object
        this.local[contextId] = {};
        this.conditions.shift();
        this.condition = this.conditions[0] || '';
      }

      return ret;

    },

    /**
     * parse #if
     */
    getBlockIf: function(block) {

      var received = false;
      var asts = [];

      utils.some(block, function(ast) {

        if (ast.condition) {

          if (received) {
            return true;
          }
          received = this.getExpression(ast.condition);

        } else if (ast.type === 'else') {
          if (received) {
            return true;
          }
          received = true;
        } else if (received) {
          asts.push(ast);
        }

        return false;

      }, this);

      // keep current condition fix #77
      return this._render(asts, this.condition);
    }
  });
};

},{}],4:[function(require,module,exports){
module.exports = function(Velocity, utils) {

  /**
   * compile
   */
  utils.mixin(Velocity.prototype, {
    init: function() {
      this.context = {};
      this.macros = {};
      this.defines = {};
      this.conditions = [];
      this.local = {};
      this.silence = false;
      this.unescape = {};

      var self = this;
      this.directive = {
        stop: function() {
          self._state.stop = true;
          return '';
        }
      };
    },

    /**
     * @param context {object} 上下文环境，数据对象
     * @param macro   {object} self defined #macro
     * @param silent {bool} 如果是true，$foo变量将原样输出
     * @return str
     */
    render: function(context, macros, silence) {

      this.silence = !!silence;
      this.context = context || {};
      this.jsmacros = utils.mixin(macros || {}, this.directive);
      var t1 = utils.now();
      var str = this._render();
      var t2 = utils.now();
      var cost = t2 - t1;

      this.cost = cost;

      return str;
    },

    /**
     * 解析入口函数
     * @param ast {array} 模板结构数组
     * @param contextId {number} 执行环境id，对于macro有局部作用域，变量的设置和
     * 取值，都放在一个this.local下，通过contextId查找
     * @return {string}解析后的字符串
     */
    _render: function(asts, contextId) {

      var str = '';
      asts = asts || this.asts;

      if (contextId) {

        if (contextId !== this.condition &&
            utils.indexOf(contextId, this.conditions) === -1) {
          this.conditions.unshift(contextId);
        }

        this.condition = contextId;

      } else {
        this.condition = null;
      }

      utils.forEach(asts, function(ast) {

        // 进入stop，直接退出
        if (this._state.stop === true) {
          return false;
        }

        switch (ast.type) {
          case 'references':
            str += this.format(this.getReferences(ast, true));
          break;

          case 'set':
            this.setValue(ast);
          break;

          case 'break':
            this._state.break = true;
          break;

          case 'macro_call':
            str += this.getMacro(ast);
          break;

          case 'comment':
          break;

          case 'raw':
            str += ast.value;
          break;

          default:
            str += typeof ast === 'string' ? ast : this.getBlock(ast);
          break;
        }
      }, this);

      return str;
    },
    format: function(value) {
      if (utils.isArray(value)) {
        return "[" + value.map(this.format.bind(this)).join(", ") + "]";
      }

      if (utils.isObject(value)) {
        if (value.toString.toString().indexOf('[native code]') === -1) {
          return value;
        }

        var kvJoin = function(k) { return k + "=" + this.format(value[k]); }.bind(this);
        return "{" + Object.keys(value).map(kvJoin).join(", ") + "}";
      }

      return value;
    }
  });
};

},{}],5:[function(require,module,exports){
module.exports = function(Velocity, utils){
  /**
   * expression运算
   */
  utils.mixin(Velocity.prototype, {
    /**
     * 表达式求值，表达式主要是数学表达式，逻辑运算和比较运算，到最底层数据结构，
     * 基本数据类型，使用 getLiteral求值，getLiteral遇到是引用的时候，使用
     * getReferences求值
     */
    getExpression: function(ast){

      var exp = ast.expression;
      var ret;
      if (ast.type === 'math') {

        switch(ast.operator) {
          case '+':
          ret = this.getExpression(exp[0]) + this.getExpression(exp[1]);
          break;

          case '-':
          ret = this.getExpression(exp[0]) - this.getExpression(exp[1]);
          break;

          case '/':
          ret = this.getExpression(exp[0]) / this.getExpression(exp[1]);
          break;

          case '%':
          ret = this.getExpression(exp[0]) % this.getExpression(exp[1]);
          break;

          case '*':
          ret = this.getExpression(exp[0]) * this.getExpression(exp[1]);
          break;

          case '||':
          ret = this.getExpression(exp[0]) || this.getExpression(exp[1]);
          break;

          case '&&':
          ret = this.getExpression(exp[0]) && this.getExpression(exp[1]);
          break;

          case '>':
          ret = this.getExpression(exp[0]) > this.getExpression(exp[1]);
          break;

          case '<':
          ret = this.getExpression(exp[0]) < this.getExpression(exp[1]);
          break;

          case '==':
          ret = this.getExpression(exp[0]) == this.getExpression(exp[1]);
          break;

          case '>=':
          ret = this.getExpression(exp[0]) >= this.getExpression(exp[1]);
          break;

          case '<=':
          ret = this.getExpression(exp[0]) <= this.getExpression(exp[1]);
          break;

          case '!=':
          ret = this.getExpression(exp[0]) != this.getExpression(exp[1]);
          break;

          case 'minus':
          ret = - this.getExpression(exp[0]);
          break;

          case 'not':
          ret = !this.getExpression(exp[0]);
          break;

          case 'parenthesis':
          ret = this.getExpression(exp[0]);
          break;

          default:
          return;
          // code
        }

        return ret;
      } else {
        return this.getLiteral(ast);
      }
    }
  });
};

},{}],6:[function(require,module,exports){
var utils = require('../utils');
var Helper = require('../helper/index');
function Velocity(asts, config) {
  this.asts = asts;
  this.config = utils.mixin(
    {
      // 自动输出为经过html encode输出
      escape: true,
      // 不需要转义的白名单
      unescape: {},
      valueMapper(value) {
        return value;
      },
    },
    config
  );
  this._state = { stop: false, break: false };
  this.init();
}

Velocity.Helper = Helper;
Velocity.prototype = {
  constructor: Velocity
};

require('./blocks')(Velocity, utils);
require('./literal')(Velocity, utils);
require('./references')(Velocity, utils);
require('./set')(Velocity, utils);
require('./expression')(Velocity, utils);
require('./compile')(Velocity, utils);
module.exports = Velocity;

},{"../helper/index":10,"../utils":14,"./blocks":3,"./compile":4,"./expression":5,"./literal":7,"./references":8,"./set":9}],7:[function(require,module,exports){
'use strict';
module.exports = function(Velocity, utils) {
  /**
   * literal解释模块
   * @require {method} getReferences
   */
  utils.mixin(Velocity.prototype, {
    /**
     * 字面量求值，主要包括string, integer, array, map四种数据结构
     * @param literal {object} 定义于velocity.yy文件，type描述数据类型，value属性
     * 是literal值描述
     * @return {object|string|number|array}返回对应的js变量
     */
    getLiteral: function(literal) {

      var type = literal.type;
      var ret = '';

      if (type === 'string') {

        ret = this.getString(literal);

      } else if (type === 'integer') {

        ret = parseInt(literal.value, 10);

      } else if (type === 'decimal') {

        ret = parseFloat(literal.value, 10);

      } else if (type === 'array') {

        ret = this.getArray(literal);

      } else if (type === 'map') {

        ret = {};
        var map = literal.value;

        utils.forEach(map, function(exp, key) {
          ret[key] = this.getLiteral(exp);
        }, this);
      } else if (type === 'bool') {

        if (literal.value === "null") {
          ret = null;
        } else if (literal.value === 'false') {
          ret = false;
        } else if (literal.value === 'true') {
          ret = true;
        }

      } else {

        return this.getReferences(literal);

      }

      return ret;
    },

    /**
     * 对字符串求值，对已双引号字符串，需要做变量替换
     */
    getString: function(literal) {
      var val = literal.value;
      var ret = val;

      if (literal.isEval && (val.indexOf('#') !== -1 ||
            val.indexOf("$") !== -1)) {
        ret = this.evalStr(val);
      }

      return ret;
    },

    /**
     * 对array字面量求值，比如[1, 2]=> [1,2]，[1..5] => [1,2,3,4,5]
     * @param literal {object} array字面量的描述对象，分为普通数组和range数组两种
     * ，和js基本一致
     * @return {array} 求值得到的数组
     */
    getArray: function(literal) {

      var ret = [];

      if (literal.isRange) {

        var begin = literal.value[0];
        if (begin.type === 'references') {
          begin = this.getReferences(begin);
        }

        var end = literal.value[1];
        if (end.type === 'references') {
          end = this.getReferences(end);
        }

        end   = parseInt(end, 10);
        begin = parseInt(begin, 10);

        var i;

        if (!isNaN(begin) && !isNaN(end)) {

          if (begin < end) {
            for (i = begin; i <= end; i++) ret.push(i);
          } else {
            for (i = begin; i >= end; i--) ret.push(i);
          }
        }

      } else {
        utils.forEach(literal.value, function(exp) {
          ret.push(this.getLiteral(exp));
        }, this);
      }

      return ret;
    },

    /**
     * 对双引号字符串进行eval求值，替换其中的变量，只支持最基本的变量类型替换
     */
    evalStr: function(str) {
      var asts = Velocity.parse(str);
      return this._render(asts, this.condition);
    }
  });
};

},{}],8:[function(require,module,exports){
module.exports = function(Velocity, utils) {

  'use strict';

  function getSize(obj) {

    if (utils.isArray(obj)) {
      return obj.length;
    } else if (utils.isObject(obj)) {
      return utils.keys(obj).length;
    }

    return undefined;
  }

  /**
   * unicode转码
   */
  function convert(str) {

    if (typeof str !== 'string') return str;

    var result = ""
    var escape = false
    var i, c, cstr;

    for (i = 0 ; i < str.length ; i++) {
      c = str.charAt(i);
      if ((' ' <= c && c <= '~') || (c === '\r') || (c === '\n')) {
        if (c === '&') {
          cstr = "&amp;"
          escape = true
        } else if (c === '<') {
          cstr = "&lt;"
          escape = true
        } else if (c === '>') {
          cstr = "&gt;"
          escape = true
        } else {
          cstr = c.toString()
        }
      } else {
        cstr = "&#" + c.charCodeAt().toString() + ";"
      }

      result = result + cstr
    }

    return escape ? result : str
  }

  function getter(base, property) {
    // get(1)
    if (typeof property === 'number') {
      return base[property];
    }

    var letter = property.charCodeAt(0);
    var isUpper = letter < 91;
    var ret = base[property];

    if (ret !== undefined) {
      return ret;
    }

    if (isUpper) {
      // Address => address
      property = String.fromCharCode(letter).toLowerCase() + property.slice(1);
    }

    if (!isUpper) {
      // address => Address
      property = String.fromCharCode(letter).toUpperCase() + property.slice(1);
    }

    return base[property];
  }

  utils.mixin(Velocity.prototype, {
    // 增加某些函数，不需要执行html转义
    addIgnoreEscpape: function(key) {

      if (!utils.isArray(key)) key = [key]

      utils.forEach(key, function(key) {
        this.config.unescape[key] = true
      }, this)

    },

    /**
     * 引用求值
     * @param {object} ast 结构来自velocity.yy
     * @param {bool} isVal 取值还是获取字符串，两者的区别在于，求值返回结果，求
     * 字符串，如果没有返回变量自身，比如$foo
     */
    getReferences: function(ast, isVal) {

      if (ast.prue) {
        var define = this.defines[ast.id];
        if (utils.isArray(define)) {
          return this._render(define);
        }
        if (ast.id in this.config.unescape) ast.prue = false;
      }
      var escape = this.config.escape;

      var isSilent = this.silence || ast.leader === "$!";
      var isfn     = ast.args !== undefined;
      var context  = this.context;
      var ret      = context[ast.id];
      var local    = this.getLocal(ast);

      var text = Velocity.Helper.getRefText(ast);

      if (text in context) {
        return (ast.prue && escape) ? convert(context[text]) : context[text];
      }


      if (ret !== undefined && isfn) {
        ret = this.getPropMethod(ast, context, ast);
      }

      if (local.isLocaled) ret = local['value'];

      if (ast.path) {

        utils.some(ast.path, function(property, i, len) {

          if (ret === undefined) {
            this._throw(ast, property);
          }

          // 第三个参数，返回后面的参数ast
          ret = this.getAttributes(property, ret, ast);

        }, this);
      }

      if (isVal && ret === undefined) {
        ret = isSilent ? '' : Velocity.Helper.getRefText(ast);
      }

      ret = (ast.prue && escape) ? convert(ret) : ret;

      return ret;
    },

    /**
     * 获取局部变量，在macro和foreach循环中使用
     */
    getLocal: function(ast) {

      var id = ast.id;
      var local = this.local;
      var ret = false;

      var isLocaled = utils.some(this.conditions, function(contextId) {
        var _local = local[contextId];
        if (id in _local) {
          ret = _local[id];
          return true;
        }

        return false;
      }, this);

      return {
        value: ret,
        isLocaled: isLocaled
      };
    },
    /**
     * $foo.bar 属性求值，最后面两个参数在用户传递的函数中用到
     * @param {object} property 属性描述，一个对象，主要包括id，type等定义
     * @param {object} baseRef 当前执行链结果，比如$a.b.c，第一次baseRef是$a,
     * 第二次是$a.b返回值
     * @private
     */
    getAttributes: function(property, baseRef, ast) {
      // fix #54
      if (baseRef === null || baseRef === undefined) {
        return undefined;
      }

      /**
       * type对应着velocity.yy中的attribute，三种类型: method, index, property
       */
      var type = property.type;
      var ret;
      var id = property.id;
      if (type === 'method') {
        ret = this.getPropMethod(property, baseRef, ast);
      } else if (type === 'property') {
        ret = baseRef[id];
      } else {
        ret = this.getPropIndex(property, baseRef);
      }
      return ret;
    },

    /**
     * $foo.bar[1] index求值
     * @private
     */
    getPropIndex: function(property, baseRef) {
      var ast = property.id;
      var key;
      if (ast.type === 'references') {
        key = this.getReferences(ast);
      } else if (ast.type === 'integer') {
        key = ast.value;
      } else {
        key = ast.value;
      }

      return baseRef[key];
    },

    /**
     * $foo.bar()求值
     */
    getPropMethod: function(property, baseRef, ast) {

      var id = property.id;
      var ret = '';

      // getter 处理
      if (id.indexOf('get') === 0 && !(id in baseRef)) {
        if (id.length === 3) {
          // get('address')
          ret = getter(baseRef, this.getLiteral(property.args[0]));
        } else {
          // getAddress()
          ret = getter(baseRef, id.slice(3));
        }

        return ret;

      // setter 处理
      } else if (id.indexOf('set') === 0 && !baseRef[id]) {

        baseRef[id.slice(3)] = this.getLiteral(property.args[0]);
        // $page.setName(123)
        baseRef.toString = function() { return ''; };
        return baseRef;

      } else if (id.indexOf('is') === 0 && !(id in baseRef)) {

        return getter(baseRef, id.slice(2));
      } else if (id === 'keySet' && !baseRef[id]) {

        return utils.keys(baseRef);

      } else if (id === 'entrySet' && !baseRef[id]) {

        ret = [];
        utils.forEach(baseRef, function(value, key) {
          ret.push({key: key, value: value});
        });

        return ret;

      } else if (id === 'size' && !baseRef[id]) {

        return getSize(baseRef);
      } else if (id === 'put' && !baseRef[id]) {
        return baseRef[this.getLiteral(property.args[0])] = this.getLiteral(property.args[1]);
      } else if (id === 'add' && !baseRef[id] && typeof baseRef.push === 'function') {
        return baseRef.push(this.getLiteral(property.args[0]));
      } else {

        ret = baseRef[id];
        var args = [];

        utils.forEach(property.args, function(exp) {
          args.push(this.getLiteral(exp));
        }, this);

        if (ret && ret.call) {

          var that = this;

          if(typeof baseRef === 'object' && baseRef){
            baseRef.eval = function() {
              return that.eval.apply(that, arguments);
            };
          }

          try {
            ret = ret.apply(baseRef, args);
          } catch (e) {
            var pos = ast.pos;
            var text = Velocity.Helper.getRefText(ast);
            var err = ' on ' + text + ' at L/N ' +
              pos.first_line + ':' + pos.first_column;
            e.name = '';
            e.message += err;
            throw new Error(e);
          }

        } else {
          this._throw(ast, property, 'TypeError');
          ret = undefined;
        }
      }

      return ret;
    },

    _throw: function(ast, property, errorName) {
      if (this.config.env !== 'development') {
        return;
      }

      var text = Velocity.Helper.getRefText(ast);
      var pos = ast.pos;
      var propertyName = property.type === 'index' ? property.id.value : property.id;
      var errorMsg = 'get property ' + propertyName + ' of undefined';
      if (errorName === 'TypeError') {
        errorMsg = propertyName + ' is not method';
      }

      errorMsg += '\n  at L/N ' + text + ' ' + pos.first_line + ':' + pos.first_column;
      var e = new Error(errorMsg);
      e.name = errorName || 'ReferenceError';
      throw e;
    }
  })

}

},{}],9:[function(require,module,exports){
module.exports = function(Velocity, utils) {
  /**
   * 变量设置
   */
  utils.mixin(Velocity.prototype, {
    /**
     * 获取执行环境，对于macro中定义的变量，为局部变量，不贮存在全局中，执行后销毁
     */
    getContext: function() {
      var condition = this.condition;
      var local = this.local;
      if (condition) {
        return local[condition];
      } else {
        return this.context;
      }
    },
    /**
     * parse #set
     */
    setValue: function(ast) {
      var ref = ast.equal[0];
      var context = this.getContext();

      // @see #25
      if (this.condition && this.condition.indexOf('macro:') === 0) {
        context = this.context;
      } else {
        // set var to global context, see #100
        context = this.context;
      }

      var valAst = ast.equal[1];
      var val;

      if (valAst.type === 'math') {
        val = this.getExpression(valAst);
      } else {
        val = this.config.valueMapper(this.getLiteral(ast.equal[1]));
      }

      if (!ref.path) {

        context[ref.id] = val;

      } else {

        var baseRef = context[ref.id];
        if (typeof baseRef != 'object') {
          baseRef = {};
        }

        context[ref.id] = baseRef;
        var len = ref.path ? ref.path.length: 0;

        const self = this;
        utils.some(ref.path, function(exp, i) {
          var isEnd = len === i + 1;
          var key = exp.id;
          if (exp.type === 'index')  {
            if (exp.id) {
              key = self.getLiteral(exp.id);
            } else {
              key = key.value;
            }
          }

          if (isEnd) {
            return baseRef[key] = val;
          }

          baseRef = baseRef[key];

          // such as
          // #set($a.d.c2 = 2)
          // but $a.d is undefined , value set fail
          if (baseRef === undefined) {
            return true;
          }
        });

      }
    }
  });
};

},{}],10:[function(require,module,exports){
var Helper = {};
var utils = require('../utils');
require('./text')(Helper, utils);
module.exports = Helper;

},{"../utils":14,"./text":11}],11:[function(require,module,exports){
module.exports = function(Helper, utils){
  /**
   * 获取引用文本，当引用自身不存在的情况下，需要返回原来的模板字符串
   */
  function getRefText(ast){

    var ret = ast.leader;
    var isFn = ast.args !== undefined;

    if (ast.type === 'macro_call') {
      ret = '#';
    }

    if (ast.isWraped) ret += '{';

    if (isFn) {
      ret += getMethodText(ast);
    } else {
      ret += ast.id;
    }

    utils.forEach(ast.path, function(ref){
      //不支持method并且传递参数
      if (ref.type == 'method') {
        ret += '.' + getMethodText(ref);
      } else if (ref.type == 'index') {

        var text = '';
        var id = ref.id;

        if (id.type === 'integer') {

          text = id.value;

        } else if (id.type === 'string') {

          var sign = id.isEval? '"': "'";
          text = sign + id.value + sign;

        } else {

          text = getRefText(id);

        }

        ret += '[' + text + ']';

      } else if (ref.type == 'property') {

        ret += '.' + ref.id;

      }

    }, this);

    if (ast.isWraped) ret += '}';

    return ret;
  }

  function getMethodText(ref) {

    var args = [];
    var ret = '';

    utils.forEach(ref.args, function(arg){
      args.push(getLiteral(arg));
    });

    ret += ref.id + '(' + args.join(',') + ')';

    return ret;

  }

  function getLiteral(ast){

    var ret = '';

    switch(ast.type) {

      case 'string': {
        var sign = ast.isEval? '"': "'";
        ret = sign + ast.value + sign;
        break;
      }

      case 'integer':
      case 'runt':
      case 'bool'   : {
        ret = ast.value;
        break;
      }

      case 'array': {
        ret = '[';
        var len = ast.value.length - 1;
        utils.forEach(ast.value, function(arg, i){
          ret += getLiteral(arg);
          if (i !== len) ret += ', ';
        });
        ret += ']';
        break;
      }

      default:
        ret = getRefText(ast)
    }

    return ret;
  }

  Helper.getRefText = getRefText;
};

},{}],12:[function(require,module,exports){
'use strict';
var Parser  = require('./parse/index');
var _parse = Parser.parse;
var utils = require('./utils');

var blockTypes = {
  if: true,
  foreach: true,
  macro: true,
  noescape: true,
  define: true,
  macro_body: true,
};

var customBlocks = [];

/**
 * @param {string} str string to parse
 * @param {object} blocks self define blocks, such as `#cms(1) hello #end`
 * @param {boolean} ignoreSpace if set true, then ignore the newline trim.
 * @return {array} ast array
 */
var parse = function(str, blocks, ignoreSpace) {
  var asts = _parse(str);
  customBlocks = blocks || {};

  /**
   * remove all newline after all direction such as `#set, #each`
   */
  ignoreSpace || utils.forEach(asts, function trim(ast, i) {
    var TRIM_REG = /^[ \t]*\n/;
    // after raw and references, then keep the newline.
    if (ast.type && ['references', 'raw'].indexOf(ast.type) === -1) {
      var _ast = asts[i + 1];
      if (typeof _ast === 'string' && TRIM_REG.test(_ast)) {
        asts[i + 1] = _ast.replace(TRIM_REG, '');
      }
    }
  });

  var ret = makeLevel(asts);

  return utils.isArray(ret) ? ret : ret.arr;
};

function makeLevel(block, index) {

  var len = block.length;
  index = index || 0;
  var ret = [];
  var ignore = index - 1;

  for (var i = index; i < len; i++) {

    if (i <= ignore) continue;

    var ast = block[i];
    var type = ast.type;

    var isBlockType = blockTypes[type];

    // 自定义类型支持
    if (!isBlockType && ast.type === 'macro_call' && customBlocks[ast.id]) {
      isBlockType = true;
      ast.type = ast.id;
      delete ast.id;
    }

    if (!isBlockType && type !== 'end') {

      ret.push(ast);

    } else if (type === 'end') {

      return {arr: ret, step: i};

    } else {

      var _ret = makeLevel(block, i + 1);
      ignore = _ret.step;
      _ret.arr.unshift(block[i]);
      ret.push(_ret.arr);

    }

  }

  return ret;
}

module.exports = parse;

},{"./parse/index":13,"./utils":14}],13:[function(require,module,exports){
(function (process){
/* parser generated by jison 0.4.18 */
/*
  Returns a Parser object of the following structure:

  Parser: {
    yy: {}
  }

  Parser.prototype: {
    yy: {},
    trace: function(),
    symbols_: {associative list: name ==> number},
    terminals_: {associative list: number ==> name},
    productions_: [...],
    performAction: function anonymous(yytext, yyleng, yylineno, yy, yystate, $$, _$),
    table: [...],
    defaultActions: {...},
    parseError: function(str, hash),
    parse: function(input),

    lexer: {
        EOF: 1,
        parseError: function(str, hash),
        setInput: function(input),
        input: function(),
        unput: function(str),
        more: function(),
        less: function(n),
        pastInput: function(),
        upcomingInput: function(),
        showPosition: function(),
        test_match: function(regex_match_array, rule_index),
        next: function(),
        lex: function(),
        begin: function(condition),
        popState: function(),
        _currentRules: function(),
        topState: function(),
        pushState: function(condition),

        options: {
            ranges: boolean           (optional: true ==> token location info will include a .range[] member)
            flex: boolean             (optional: true ==> flex-like lexing behaviour where the rules are tested exhaustively to find the longest match)
            backtrack_lexer: boolean  (optional: true ==> lexer regexes are tested in order and for each matching regex the action code is invoked; the lexer terminates the scan when a token is returned by the action code)
        },

        performAction: function(yy, yy_, $avoiding_name_collisions, YY_START),
        rules: [...],
        conditions: {associative list: name ==> set},
    }
  }


  token location info (@$, _$, etc.): {
    first_line: n,
    last_line: n,
    first_column: n,
    last_column: n,
    range: [start_number, end_number]       (where the numbers are indexes into the input string, regular zero-based)
  }


  the parseError function receives a 'hash' object with these members for lexer and parser errors: {
    text:        (matched text)
    token:       (the produced terminal token, if any)
    line:        (yylineno)
  }
  while parser (grammar) errors will also provide these members, i.e. parser errors deliver a superset of attributes: {
    loc:         (yylloc)
    expected:    (string describing the set of expected tokens)
    recoverable: (boolean: TRUE when the parser has a error recovery rule available for this particular error)
  }
*/
var velocity = (function(){
var o=function(k,v,o,l){for(o=o||{},l=k.length;l--;o[k[l]]=v);return o},$V0=[1,8],$V1=[1,9],$V2=[1,19],$V3=[1,10],$V4=[1,24],$V5=[1,25],$V6=[1,23],$V7=[4,10,11,20,35,36,46,82],$V8=[1,29],$V9=[1,33],$Va=[1,32],$Vb=[4,10,11,20,23,35,36,39,46,49,50,51,54,55,56,57,58,59,60,61,62,63,64,65,66,82,84,94],$Vc=[1,50],$Vd=[1,55],$Ve=[1,56],$Vf=[1,72],$Vg=[1,71],$Vh=[1,84],$Vi=[1,79],$Vj=[1,87],$Vk=[1,95],$Vl=[1,85],$Vm=[1,90],$Vn=[1,94],$Vo=[1,91],$Vp=[1,92],$Vq=[4,10,11,20,23,35,36,39,46,49,50,51,54,55,56,57,58,59,60,61,62,63,64,65,66,75,80,82,83,84,94],$Vr=[1,107],$Vs=[1,121],$Vt=[1,117],$Vu=[1,118],$Vv=[1,131],$Vw=[23,50,84],$Vx=[2,96],$Vy=[23,39,49,50,84],$Vz=[23,39,49,50,54,55,56,57,58,59,60,61,62,63,64,65,66,82,84],$VA=[23,39,49,50,54,55,56,57,58,59,60,61,62,63,64,65,66,82,84,96],$VB=[2,109],$VC=[23,39,49,50,54,55,56,57,58,59,60,61,62,63,64,65,66,82,84,94],$VD=[2,112],$VE=[1,140],$VF=[1,146],$VG=[23,49,50],$VH=[1,151],$VI=[1,152],$VJ=[1,153],$VK=[1,154],$VL=[1,155],$VM=[1,156],$VN=[1,157],$VO=[1,158],$VP=[1,159],$VQ=[1,160],$VR=[1,161],$VS=[1,162],$VT=[1,163],$VU=[23,54,55,56,57,58,59,60,61,62,63,64,65,66],$VV=[50,84],$VW=[2,113],$VX=[23,35],$VY=[1,213],$VZ=[1,212],$V_=[39,50],$V$=[23,54,55],$V01=[23,54,55,56,57,61,62,63,64,65,66],$V11=[23,54,55,61,62,63,64,65,66];
var parser = {trace: function trace() { },
yy: {},
symbols_: {"error":2,"root":3,"EOF":4,"statements":5,"statement":6,"references":7,"directives":8,"content":9,"RAW":10,"COMMENT":11,"set":12,"if":13,"elseif":14,"else":15,"end":16,"foreach":17,"break":18,"define":19,"HASH":20,"NOESCAPE":21,"PARENTHESIS":22,"CLOSE_PARENTHESIS":23,"macro":24,"macro_call":25,"macro_body":26,"SET":27,"equal":28,"IF":29,"expression":30,"ELSEIF":31,"ELSE":32,"END":33,"FOREACH":34,"DOLLAR":35,"ID":36,"IN":37,"MAP_BEGIN":38,"MAP_END":39,"array":40,"BREAK":41,"DEFINE":42,"MACRO":43,"macro_args":44,"macro_call_args_all":45,"MACRO_BODY":46,"macro_call_args":47,"literals":48,"SPACE":49,"COMMA":50,"EQUAL":51,"map":52,"math":53,"||":54,"&&":55,"+":56,"-":57,"*":58,"/":59,"%":60,">":61,"<":62,"==":63,">=":64,"<=":65,"!=":66,"parenthesis":67,"!":68,"literal":69,"brace_begin":70,"attributes":71,"brace_end":72,"methodbd":73,"VAR_BEGIN":74,"VAR_END":75,"attribute":76,"method":77,"index":78,"property":79,"DOT":80,"params":81,"CONTENT":82,"BRACKET":83,"CLOSE_BRACKET":84,"string":85,"number":86,"BOOL":87,"integer":88,"INTEGER":89,"DECIMAL_POINT":90,"STRING":91,"EVAL_STRING":92,"range":93,"RANGE":94,"map_item":95,"MAP_SPLIT":96,"$accept":0,"$end":1},
terminals_: {2:"error",4:"EOF",10:"RAW",11:"COMMENT",20:"HASH",21:"NOESCAPE",22:"PARENTHESIS",23:"CLOSE_PARENTHESIS",27:"SET",29:"IF",31:"ELSEIF",32:"ELSE",33:"END",34:"FOREACH",35:"DOLLAR",36:"ID",37:"IN",38:"MAP_BEGIN",39:"MAP_END",41:"BREAK",42:"DEFINE",43:"MACRO",46:"MACRO_BODY",49:"SPACE",50:"COMMA",51:"EQUAL",54:"||",55:"&&",56:"+",57:"-",58:"*",59:"/",60:"%",61:">",62:"<",63:"==",64:">=",65:"<=",66:"!=",68:"!",74:"VAR_BEGIN",75:"VAR_END",80:"DOT",82:"CONTENT",83:"BRACKET",84:"CLOSE_BRACKET",87:"BOOL",89:"INTEGER",90:"DECIMAL_POINT",91:"STRING",92:"EVAL_STRING",94:"RANGE",96:"MAP_SPLIT"},
productions_: [0,[3,1],[3,2],[5,1],[5,2],[6,1],[6,1],[6,1],[6,1],[6,1],[8,1],[8,1],[8,1],[8,1],[8,1],[8,1],[8,1],[8,1],[8,4],[8,1],[8,1],[8,1],[12,5],[13,5],[14,5],[15,2],[16,2],[17,8],[17,10],[17,8],[17,10],[18,2],[19,6],[24,6],[24,5],[44,1],[44,2],[25,5],[25,4],[26,5],[26,4],[47,1],[47,1],[47,3],[47,3],[47,3],[47,3],[45,1],[45,2],[45,3],[45,2],[28,3],[30,1],[30,1],[30,1],[53,3],[53,3],[53,3],[53,3],[53,3],[53,3],[53,3],[53,3],[53,3],[53,3],[53,3],[53,3],[53,3],[53,1],[53,2],[53,2],[53,1],[53,1],[67,3],[7,5],[7,3],[7,5],[7,3],[7,2],[7,4],[7,2],[7,4],[70,1],[70,1],[72,1],[72,1],[71,1],[71,2],[76,1],[76,1],[76,1],[77,2],[73,4],[73,3],[81,1],[81,1],[81,1],[81,3],[81,3],[79,2],[79,2],[78,3],[78,3],[78,3],[78,2],[78,2],[69,1],[69,1],[69,1],[86,1],[86,3],[86,4],[88,1],[88,2],[85,1],[85,1],[48,1],[48,1],[48,1],[40,3],[40,1],[40,2],[93,5],[93,5],[93,5],[93,5],[52,3],[52,2],[95,3],[95,3],[95,2],[95,5],[95,5],[9,1],[9,1],[9,2],[9,3],[9,3],[9,2]],
performAction: function anonymous(yytext, yyleng, yylineno, yy, yystate /* action[1] */, $$ /* vstack */, _$ /* lstack */) {
/* this == yyval */

var $0 = $$.length - 1;
switch (yystate) {
case 1:
 return []; 
break;
case 2:
 return $$[$0-1]; 
break;
case 3: case 35: case 41: case 42: case 86: case 94: case 96:
 this.$ = [$$[$0]]; 
break;
case 4: case 36: case 87:
 this.$ = [].concat($$[$0-1], $$[$0]); 
break;
case 5:
 $$[$0]['prue'] = true;  $$[$0].pos = this._$; this.$ = $$[$0]; 
break;
case 6:
 $$[$0].pos = this._$; this.$ = $$[$0]; 
break;
case 7: case 10: case 11: case 12: case 13: case 14: case 15: case 16: case 17: case 19: case 20: case 21: case 47: case 48: case 52: case 53: case 54: case 68: case 71: case 72: case 82: case 83: case 84: case 85: case 91: case 99: case 106: case 107: case 112: case 118: case 120: case 133: case 134:
 this.$ = $$[$0]; 
break;
case 8:
 this.$ = {type: 'raw', value: $$[$0] }; 
break;
case 9:
 this.$ = {type: 'comment', value: $$[$0] }; 
break;
case 18:
 this.$ = { type: 'noescape' }; 
break;
case 22:
 this.$ = {type: 'set', equal: $$[$0-1] }; 
break;
case 23:
 this.$ = {type: 'if', condition: $$[$0-1] }; 
break;
case 24:
 this.$ = {type: 'elseif', condition: $$[$0-1] }; 
break;
case 25:
 this.$ = {type: 'else' }; 
break;
case 26:
 this.$ = {type: 'end' }; 
break;
case 27: case 29:
 this.$ = {type: 'foreach', to: $$[$0-3], from: $$[$0-1] }; 
break;
case 28: case 30:
 this.$ = {type: 'foreach', to: $$[$0-4], from: $$[$0-1] }; 
break;
case 31:
 this.$ = {type: $$[$0] }; 
break;
case 32:
 this.$ = {type: 'define', id: $$[$0-1] }; 
break;
case 33:
 this.$ = {type: 'macro', id: $$[$0-2], args: $$[$0-1] }; 
break;
case 34:
 this.$ = {type: 'macro', id: $$[$0-1] }; 
break;
case 37:
 this.$ = { type:"macro_call", id: $$[$0-3].replace(/^\s+|\s+$/g, ''), args: $$[$0-1] }; 
break;
case 38:
 this.$ = { type:"macro_call", id: $$[$0-2].replace(/^\s+|\s+$/g, '') }; 
break;
case 39:
 this.$ = {type: 'macro_body', id: $$[$0-3], args: $$[$0-1] }; 
break;
case 40:
 this.$ = {type: 'macro_body', id: $$[$0-2] }; 
break;
case 43: case 44: case 45: case 46: case 97: case 98:
 this.$ = [].concat($$[$0-2], $$[$0]); 
break;
case 49: case 50: case 101: case 102:
 this.$ = $$[$0-1]; 
break;
case 51:
 this.$ = [$$[$0-2], $$[$0]]; 
break;
case 55:
 this.$ = {type: 'math', expression: [$$[$0-2], $$[$0]], operator: '||' }; 
break;
case 56:
 this.$ = {type: 'math', expression: [$$[$0-2], $$[$0]], operator: '&&' }; 
break;
case 57: case 58: case 59: case 60: case 61:
 this.$ = {type: 'math', expression: [$$[$0-2], $$[$0]], operator: $$[$0-1] }; 
break;
case 62:
 this.$ = {type: 'math', expression: [$$[$0-2], $$[$0]], operator: '>' }; 
break;
case 63:
 this.$ = {type: 'math', expression: [$$[$0-2], $$[$0]], operator: '<' }; 
break;
case 64:
 this.$ = {type: 'math', expression: [$$[$0-2], $$[$0]], operator: '==' }; 
break;
case 65:
 this.$ = {type: 'math', expression: [$$[$0-2], $$[$0]], operator: '>=' }; 
break;
case 66:
 this.$ = {type: 'math', expression: [$$[$0-2], $$[$0]], operator: '<=' }; 
break;
case 67:
 this.$ = {type: 'math', expression: [$$[$0-2], $$[$0]], operator: '!=' }; 
break;
case 69:
 this.$ = {type: 'math', expression: [$$[$0]], operator: 'minus' }; 
break;
case 70:
 this.$ = {type: 'math', expression: [$$[$0]], operator: 'not' }; 
break;
case 73:
 this.$ = {type: 'math', expression: [$$[$0-1]], operator: 'parenthesis' }; 
break;
case 74:
 this.$ = {type: "references", id: $$[$0-2], path: $$[$0-1], isWraped: true, leader: $$[$0-4] }; 
break;
case 75:
 this.$ = {type: "references", id: $$[$0-1], path: $$[$0], leader: $$[$0-2] }; 
break;
case 76:
 this.$ = {type: "references", id: $$[$0-2].id, path: $$[$0-1], isWraped: true, leader: $$[$0-4], args: $$[$0-2].args }; 
break;
case 77:
 this.$ = {type: "references", id: $$[$0-1].id, path: $$[$0], leader: $$[$0-2], args: $$[$0-1].args }; 
break;
case 78:
 this.$ = {type: "references", id: $$[$0], leader: $$[$0-1] }; 
break;
case 79:
 this.$ = {type: "references", id: $$[$0-1], isWraped: true, leader: $$[$0-3] }; 
break;
case 80:
 this.$ = {type: "references", id: $$[$0].id, leader: $$[$0-1], args: $$[$0].args }; 
break;
case 81:
 this.$ = {type: "references", id: $$[$0-1].id, isWraped: true, args: $$[$0-1].args, leader: $$[$0-3] }; 
break;
case 88:
 this.$ = {type:"method", id: $$[$0].id, args: $$[$0].args }; 
break;
case 89:
 this.$ = {type: "index", id: $$[$0] }; 
break;
case 90:
 this.$ = {type: "property", id: $$[$0] }; if ($$[$0].type === 'content') this.$ = $$[$0]; 
break;
case 92:
 this.$ = {id: $$[$0-3], args: $$[$0-1] }; 
break;
case 93:
 this.$ = {id: $$[$0-2], args: false }; 
break;
case 95:
 this.$ = [ { type: 'runt', value: $$[$0] } ]; 
break;
case 100:
 this.$ = {type: 'content', value: $$[$0-1] + $$[$0] }; 
break;
case 103:
 this.$ = {type: "content", value: $$[$0-2] + $$[$0-1].value + $$[$0] }; 
break;
case 104: case 105:
 this.$ = {type: "content", value: $$[$0-1] + $$[$0] }; 
break;
case 108:
 this.$ = {type: 'bool', value: $$[$0] }; 
break;
case 109:
 this.$ = {type: "integer", value: $$[$0]}; 
break;
case 110:
 this.$ = {type: "decimal", value: + ($$[$0-2] + '.' + $$[$0]) }; 
break;
case 111:
 this.$ = {type: "decimal", value: - ($$[$0-2] + '.' + $$[$0]) }; 
break;
case 113:
 this.$ = - parseInt($$[$0], 10); 
break;
case 114:
 this.$ = {type: 'string', value: $$[$0] }; 
break;
case 115:
 this.$ = {type: 'string', value: $$[$0], isEval: true }; 
break;
case 116: case 117:
 this.$ = $$[$0];
break;
case 119:
 this.$ = {type: 'array', value: $$[$0-1] }; 
break;
case 121:
 this.$ = {type: 'array', value: [] }; 
break;
case 122: case 123: case 124: case 125:
 this.$ = {type: 'array', isRange: true, value: [$$[$0-3], $$[$0-1]]}; 
break;
case 126:
 this.$ = {type: 'map', value: $$[$0-1] }; 
break;
case 127:
 this.$ = {type: 'map'}; 
break;
case 128: case 129:
 this.$ = {}; this.$[$$[$0-2].value] = $$[$0]; 
break;
case 130:
 this.$ = {}; this.$[$$[$0-1].value] = $$[$01]; 
break;
case 131: case 132:
 this.$ = $$[$0-4]; this.$[$$[$0-2].value] = $$[$0]; 
break;
case 135: case 138:
 this.$ = $$[$0-1] + $$[$0]; 
break;
case 136:
 this.$ = $$[$0-2] + $$[$0-1] + $$[$0]; 
break;
case 137:
 this.$ = $$[$0-2] + $$[$0-1]; 
break;
}
},
table: [{3:1,4:[1,2],5:3,6:4,7:5,8:6,9:7,10:$V0,11:$V1,12:11,13:12,14:13,15:14,16:15,17:16,18:17,19:18,20:$V2,24:20,25:21,26:22,35:$V3,36:$V4,46:$V5,82:$V6},{1:[3]},{1:[2,1]},{4:[1,26],6:27,7:5,8:6,9:7,10:$V0,11:$V1,12:11,13:12,14:13,15:14,16:15,17:16,18:17,19:18,20:$V2,24:20,25:21,26:22,35:$V3,36:$V4,46:$V5,82:$V6},o($V7,[2,3]),o($V7,[2,5]),o($V7,[2,6]),o($V7,[2,7]),o($V7,[2,8]),o($V7,[2,9]),{36:$V8,38:$V9,70:28,73:30,74:$Va,82:[1,31]},o($V7,[2,10]),o($V7,[2,11]),o($V7,[2,12]),o($V7,[2,13]),o($V7,[2,14]),o($V7,[2,15]),o($V7,[2,16]),o($V7,[2,17]),{21:[1,34],27:[1,37],29:[1,38],31:[1,39],32:[1,40],33:[1,41],34:[1,42],36:[1,36],41:[1,43],42:[1,44],43:[1,45],82:[1,35]},o($V7,[2,19]),o($V7,[2,20]),o($V7,[2,21]),o($V7,[2,133]),o($V7,[2,134]),{36:[1,46]},{1:[2,2]},o($V7,[2,4]),{36:[1,47],73:48},o($Vb,[2,78],{71:49,76:51,77:52,78:53,79:54,22:$Vc,80:$Vd,83:$Ve}),o($Vb,[2,80],{76:51,77:52,78:53,79:54,71:57,80:$Vd,83:$Ve}),o($V7,[2,138]),{36:[2,82]},{36:[2,83]},{22:[1,58]},o($V7,[2,135]),{4:[1,60],22:[1,61],82:[1,59]},{22:[1,62]},{22:[1,63]},{22:[1,64]},o($V7,[2,25]),o($V7,[2,26]),{22:[1,65]},o($V7,[2,31]),{22:[1,66]},{22:[1,67]},{22:[1,68]},{22:$Vc,39:$Vf,71:69,72:70,75:$Vg,76:51,77:52,78:53,79:54,80:$Vd,83:$Ve},{39:$Vf,71:73,72:74,75:$Vg,76:51,77:52,78:53,79:54,80:$Vd,83:$Ve},o($Vb,[2,75],{77:52,78:53,79:54,76:75,80:$Vd,83:$Ve}),{7:80,23:[1,77],35:$Vh,36:$Vi,38:$Vj,40:81,48:78,52:82,57:$Vk,69:83,81:76,83:$Vl,85:88,86:89,87:$Vm,88:93,89:$Vn,91:$Vo,92:$Vp,93:86},o($Vq,[2,86]),o($Vq,[2,88]),o($Vq,[2,89]),o($Vq,[2,90]),{36:[1,97],73:96,82:[1,98]},{7:100,35:$Vh,57:$Vk,69:99,82:[1,101],84:[1,102],85:88,86:89,87:$Vm,88:93,89:$Vn,91:$Vo,92:$Vp},o($Vb,[2,77],{77:52,78:53,79:54,76:75,80:$Vd,83:$Ve}),{23:[1,103]},o($V7,[2,136]),o($V7,[2,137]),{7:109,23:[1,105],35:$Vh,38:$Vj,40:81,45:104,47:106,48:108,49:$Vr,52:82,57:$Vk,69:83,83:$Vl,85:88,86:89,87:$Vm,88:93,89:$Vn,91:$Vo,92:$Vp,93:86},{7:111,28:110,35:$Vh},{7:119,22:$Vs,30:112,35:$Vh,38:$Vj,40:113,52:114,53:115,57:$Vt,67:116,68:$Vu,69:120,83:$Vl,85:88,86:89,87:$Vm,88:93,89:$Vn,91:$Vo,92:$Vp,93:86},{7:119,22:$Vs,30:122,35:$Vh,38:$Vj,40:113,52:114,53:115,57:$Vt,67:116,68:$Vu,69:120,83:$Vl,85:88,86:89,87:$Vm,88:93,89:$Vn,91:$Vo,92:$Vp,93:86},{35:[1,123]},{35:[1,124]},{36:[1,125]},{7:109,23:[1,127],35:$Vh,38:$Vj,40:81,45:126,47:106,48:108,49:$Vr,52:82,57:$Vk,69:83,83:$Vl,85:88,86:89,87:$Vm,88:93,89:$Vn,91:$Vo,92:$Vp,93:86},{39:$Vf,72:128,75:$Vg,76:75,77:52,78:53,79:54,80:$Vd,83:$Ve},o($Vb,[2,79]),o($Vb,[2,84]),o($Vb,[2,85]),{39:$Vf,72:129,75:$Vg,76:75,77:52,78:53,79:54,80:$Vd,83:$Ve},o($Vb,[2,81]),o($Vq,[2,87]),{23:[1,130],50:$Vv},o($Vq,[2,93]),o($Vw,[2,94]),o($Vw,[2,95]),o([23,50],$Vx),o($Vy,[2,116]),o($Vy,[2,117]),o($Vy,[2,118]),{36:$V8,38:$V9,70:28,73:30,74:$Va},{7:135,35:$Vh,36:$Vi,38:$Vj,40:81,48:78,52:82,57:$Vk,69:83,81:132,83:$Vl,84:[1,133],85:88,86:89,87:$Vm,88:134,89:$Vn,91:$Vo,92:$Vp,93:86},o($Vy,[2,120]),{39:[1,137],85:138,91:$Vo,92:$Vp,95:136},o($Vz,[2,106]),o($Vz,[2,107]),o($Vz,[2,108]),o($VA,[2,114]),o($VA,[2,115]),o($Vz,$VB),o($VC,$VD,{90:[1,139]}),{89:$VE},o($Vq,[2,91]),o($Vq,[2,99],{22:$Vc}),o($Vq,[2,100]),{82:[1,142],84:[1,141]},{84:[1,143]},o($Vq,[2,104]),o($Vq,[2,105]),o($V7,[2,18]),{23:[1,144]},o($V7,[2,38]),{23:[2,47],49:[1,145],50:$VF},{7:109,35:$Vh,38:$Vj,40:81,47:147,48:108,52:82,57:$Vk,69:83,83:$Vl,85:88,86:89,87:$Vm,88:93,89:$Vn,91:$Vo,92:$Vp,93:86},o($VG,[2,41]),o($VG,[2,42]),{23:[1,148]},{51:[1,149]},{23:[1,150]},{23:[2,52]},{23:[2,53]},{23:[2,54],54:$VH,55:$VI,56:$VJ,57:$VK,58:$VL,59:$VM,60:$VN,61:$VO,62:$VP,63:$VQ,64:$VR,65:$VS,66:$VT},o($VU,[2,68]),{22:$Vs,67:164,89:$VE},{7:119,22:$Vs,35:$Vh,53:165,57:$Vt,67:116,68:$Vu,69:120,85:88,86:89,87:$Vm,88:93,89:$Vn,91:$Vo,92:$Vp},o($VU,[2,71]),o($VU,[2,72]),{7:119,22:$Vs,35:$Vh,53:166,57:$Vt,67:116,68:$Vu,69:120,85:88,86:89,87:$Vm,88:93,89:$Vn,91:$Vo,92:$Vp},{23:[1,167]},{36:[1,168],38:[1,169]},{36:[1,170]},{7:173,23:[1,172],35:$Vh,44:171},{23:[1,174]},o($V7,[2,40]),o($Vb,[2,74]),o($Vb,[2,76]),o($Vq,[2,92]),{7:176,35:$Vh,38:$Vj,40:81,48:175,52:82,57:$Vk,69:83,83:$Vl,85:88,86:89,87:$Vm,88:93,89:$Vn,91:$Vo,92:$Vp,93:86},{50:$Vv,84:[1,177]},o($Vy,[2,121]),o($VV,$VB,{94:[1,178]}),o($VV,$Vx,{94:[1,179]}),{39:[1,180],50:[1,181]},o($Vy,[2,127]),{96:[1,182]},{89:[1,183]},o($VC,$VW,{90:[1,184]}),o($Vq,[2,101]),o($Vq,[2,103]),o($Vq,[2,102]),o($V7,[2,37]),{7:186,23:[2,50],35:$Vh,38:$Vj,40:81,48:185,52:82,57:$Vk,69:83,83:$Vl,85:88,86:89,87:$Vm,88:93,89:$Vn,91:$Vo,92:$Vp,93:86},{7:188,35:$Vh,38:$Vj,40:81,48:187,52:82,57:$Vk,69:83,83:$Vl,85:88,86:89,87:$Vm,88:93,89:$Vn,91:$Vo,92:$Vp,93:86},{23:[2,48],49:[1,189],50:$VF},o($V7,[2,22]),{7:119,22:$Vs,30:190,35:$Vh,38:$Vj,40:113,52:114,53:115,57:$Vt,67:116,68:$Vu,69:120,83:$Vl,85:88,86:89,87:$Vm,88:93,89:$Vn,91:$Vo,92:$Vp,93:86},o($V7,[2,23]),{7:119,22:$Vs,35:$Vh,53:191,57:$Vt,67:116,68:$Vu,69:120,85:88,86:89,87:$Vm,88:93,89:$Vn,91:$Vo,92:$Vp},{7:119,22:$Vs,35:$Vh,53:192,57:$Vt,67:116,68:$Vu,69:120,85:88,86:89,87:$Vm,88:93,89:$Vn,91:$Vo,92:$Vp},{7:119,22:$Vs,35:$Vh,53:193,57:$Vt,67:116,68:$Vu,69:120,85:88,86:89,87:$Vm,88:93,89:$Vn,91:$Vo,92:$Vp},{7:119,22:$Vs,35:$Vh,53:194,57:$Vt,67:116,68:$Vu,69:120,85:88,86:89,87:$Vm,88:93,89:$Vn,91:$Vo,92:$Vp},{7:119,22:$Vs,35:$Vh,53:195,57:$Vt,67:116,68:$Vu,69:120,85:88,86:89,87:$Vm,88:93,89:$Vn,91:$Vo,92:$Vp},{7:119,22:$Vs,35:$Vh,53:196,57:$Vt,67:116,68:$Vu,69:120,85:88,86:89,87:$Vm,88:93,89:$Vn,91:$Vo,92:$Vp},{7:119,22:$Vs,35:$Vh,53:197,57:$Vt,67:116,68:$Vu,69:120,85:88,86:89,87:$Vm,88:93,89:$Vn,91:$Vo,92:$Vp},{7:119,22:$Vs,35:$Vh,53:198,57:$Vt,67:116,68:$Vu,69:120,85:88,86:89,87:$Vm,88:93,89:$Vn,91:$Vo,92:$Vp},{7:119,22:$Vs,35:$Vh,53:199,57:$Vt,67:116,68:$Vu,69:120,85:88,86:89,87:$Vm,88:93,89:$Vn,91:$Vo,92:$Vp},{7:119,22:$Vs,35:$Vh,53:200,57:$Vt,67:116,68:$Vu,69:120,85:88,86:89,87:$Vm,88:93,89:$Vn,91:$Vo,92:$Vp},{7:119,22:$Vs,35:$Vh,53:201,57:$Vt,67:116,68:$Vu,69:120,85:88,86:89,87:$Vm,88:93,89:$Vn,91:$Vo,92:$Vp},{7:119,22:$Vs,35:$Vh,53:202,57:$Vt,67:116,68:$Vu,69:120,85:88,86:89,87:$Vm,88:93,89:$Vn,91:$Vo,92:$Vp},{7:119,22:$Vs,35:$Vh,53:203,57:$Vt,67:116,68:$Vu,69:120,85:88,86:89,87:$Vm,88:93,89:$Vn,91:$Vo,92:$Vp},o($VU,[2,69]),o($VU,[2,70]),{23:[1,204],54:$VH,55:$VI,56:$VJ,57:$VK,58:$VL,59:$VM,60:$VN,61:$VO,62:$VP,63:$VQ,64:$VR,65:$VS,66:$VT},o($V7,[2,24]),{37:[1,205]},{36:[1,206]},{23:[1,207]},{7:209,23:[1,208],35:$Vh},o($V7,[2,34]),o($VX,[2,35]),o($V7,[2,39]),o($Vw,[2,97]),o($Vw,[2,98]),o($Vy,[2,119]),{7:211,35:$Vh,57:$VY,88:210,89:$VZ},{7:215,35:$Vh,57:$VY,88:214,89:$VZ},o($Vy,[2,126]),{85:216,91:$Vo,92:$Vp},o($V_,[2,130],{40:81,52:82,69:83,93:86,85:88,86:89,88:93,48:217,7:218,35:$Vh,38:$Vj,57:$Vk,83:$Vl,87:$Vm,89:$Vn,91:$Vo,92:$Vp}),o($Vz,[2,110]),{89:[1,219]},o($VG,[2,43]),o($VG,[2,46]),o($VG,[2,44]),o($VG,[2,45]),{7:186,23:[2,49],35:$Vh,38:$Vj,40:81,48:185,52:82,57:$Vk,69:83,83:$Vl,85:88,86:89,87:$Vm,88:93,89:$Vn,91:$Vo,92:$Vp,93:86},{23:[2,51]},o($V$,[2,55],{56:$VJ,57:$VK,58:$VL,59:$VM,60:$VN,61:$VO,62:$VP,63:$VQ,64:$VR,65:$VS,66:$VT}),o($V$,[2,56],{56:$VJ,57:$VK,58:$VL,59:$VM,60:$VN,61:$VO,62:$VP,63:$VQ,64:$VR,65:$VS,66:$VT}),o($V01,[2,57],{58:$VL,59:$VM,60:$VN}),o($V01,[2,58],{58:$VL,59:$VM,60:$VN}),o($VU,[2,59]),o($VU,[2,60]),o($VU,[2,61]),o($V11,[2,62],{56:$VJ,57:$VK,58:$VL,59:$VM,60:$VN}),o($V11,[2,63],{56:$VJ,57:$VK,58:$VL,59:$VM,60:$VN}),o($V11,[2,64],{56:$VJ,57:$VK,58:$VL,59:$VM,60:$VN}),o($V11,[2,65],{56:$VJ,57:$VK,58:$VL,59:$VM,60:$VN}),o($V11,[2,66],{56:$VJ,57:$VK,58:$VL,59:$VM,60:$VN}),o($V11,[2,67],{56:$VJ,57:$VK,58:$VL,59:$VM,60:$VN}),o($VU,[2,73]),{7:220,35:$Vh,40:221,83:$Vl,93:86},{39:[1,222]},o($V7,[2,32]),o($V7,[2,33]),o($VX,[2,36]),{84:[1,223]},{84:[1,224]},{84:$VD},{89:[1,225]},{84:[1,226]},{84:[1,227]},{96:[1,228]},o($V_,[2,128]),o($V_,[2,129]),o($Vz,[2,111]),{23:[1,229]},{23:[1,230]},{37:[1,231]},o($Vy,[2,122]),o($Vy,[2,124]),{84:$VW},o($Vy,[2,123]),o($Vy,[2,125]),{7:232,35:$Vh,38:$Vj,40:81,48:233,52:82,57:$Vk,69:83,83:$Vl,85:88,86:89,87:$Vm,88:93,89:$Vn,91:$Vo,92:$Vp,93:86},o($V7,[2,27]),o($V7,[2,29]),{7:234,35:$Vh,40:235,83:$Vl,93:86},o($V_,[2,131]),o($V_,[2,132]),{23:[1,236]},{23:[1,237]},o($V7,[2,28]),o($V7,[2,30])],
defaultActions: {2:[2,1],26:[2,2],32:[2,82],33:[2,83],113:[2,52],114:[2,53],190:[2,51],212:[2,112],225:[2,113]},
parseError: function parseError(str, hash) {
    if (hash.recoverable) {
        this.trace(str);
    } else {
        var error = new Error(str);
        error.hash = hash;
        throw error;
    }
},
parse: function parse(input) {
    var self = this, stack = [0], tstack = [], vstack = [null], lstack = [], table = this.table, yytext = '', yylineno = 0, yyleng = 0, recovering = 0, TERROR = 2, EOF = 1;
    var args = lstack.slice.call(arguments, 1);
    var lexer = Object.create(this.lexer);
    var sharedState = { yy: {} };
    for (var k in this.yy) {
        if (Object.prototype.hasOwnProperty.call(this.yy, k)) {
            sharedState.yy[k] = this.yy[k];
        }
    }
    lexer.setInput(input, sharedState.yy);
    sharedState.yy.lexer = lexer;
    sharedState.yy.parser = this;
    if (typeof lexer.yylloc == 'undefined') {
        lexer.yylloc = {};
    }
    var yyloc = lexer.yylloc;
    lstack.push(yyloc);
    var ranges = lexer.options && lexer.options.ranges;
    if (typeof sharedState.yy.parseError === 'function') {
        this.parseError = sharedState.yy.parseError;
    } else {
        this.parseError = Object.getPrototypeOf(this).parseError;
    }
    function popStack(n) {
        stack.length = stack.length - 2 * n;
        vstack.length = vstack.length - n;
        lstack.length = lstack.length - n;
    }
    _token_stack:
        var lex = function () {
            var token;
            token = lexer.lex() || EOF;
            if (typeof token !== 'number') {
                token = self.symbols_[token] || token;
            }
            return token;
        };
    var symbol, preErrorSymbol, state, action, a, r, yyval = {}, p, len, newState, expected;
    while (true) {
        state = stack[stack.length - 1];
        if (this.defaultActions[state]) {
            action = this.defaultActions[state];
        } else {
            if (symbol === null || typeof symbol == 'undefined') {
                symbol = lex();
            }
            action = table[state] && table[state][symbol];
        }
                    if (typeof action === 'undefined' || !action.length || !action[0]) {
                var errStr = '';
                expected = [];
                for (p in table[state]) {
                    if (this.terminals_[p] && p > TERROR) {
                        expected.push('\'' + this.terminals_[p] + '\'');
                    }
                }
                if (lexer.showPosition) {
                    errStr = 'Parse error on line ' + (yylineno + 1) + ':\n' + lexer.showPosition() + '\nExpecting ' + expected.join(', ') + ', got \'' + (this.terminals_[symbol] || symbol) + '\'';
                } else {
                    errStr = 'Parse error on line ' + (yylineno + 1) + ': Unexpected ' + (symbol == EOF ? 'end of input' : '\'' + (this.terminals_[symbol] || symbol) + '\'');
                }
                this.parseError(errStr, {
                    text: lexer.match,
                    token: this.terminals_[symbol] || symbol,
                    line: lexer.yylineno,
                    loc: yyloc,
                    expected: expected
                });
            }
        if (action[0] instanceof Array && action.length > 1) {
            throw new Error('Parse Error: multiple actions possible at state: ' + state + ', token: ' + symbol);
        }
        switch (action[0]) {
        case 1:
            stack.push(symbol);
            vstack.push(lexer.yytext);
            lstack.push(lexer.yylloc);
            stack.push(action[1]);
            symbol = null;
            if (!preErrorSymbol) {
                yyleng = lexer.yyleng;
                yytext = lexer.yytext;
                yylineno = lexer.yylineno;
                yyloc = lexer.yylloc;
                if (recovering > 0) {
                    recovering--;
                }
            } else {
                symbol = preErrorSymbol;
                preErrorSymbol = null;
            }
            break;
        case 2:
            len = this.productions_[action[1]][1];
            yyval.$ = vstack[vstack.length - len];
            yyval._$ = {
                first_line: lstack[lstack.length - (len || 1)].first_line,
                last_line: lstack[lstack.length - 1].last_line,
                first_column: lstack[lstack.length - (len || 1)].first_column,
                last_column: lstack[lstack.length - 1].last_column
            };
            if (ranges) {
                yyval._$.range = [
                    lstack[lstack.length - (len || 1)].range[0],
                    lstack[lstack.length - 1].range[1]
                ];
            }
            r = this.performAction.apply(yyval, [
                yytext,
                yyleng,
                yylineno,
                sharedState.yy,
                action[1],
                vstack,
                lstack
            ].concat(args));
            if (typeof r !== 'undefined') {
                return r;
            }
            if (len) {
                stack = stack.slice(0, -1 * len * 2);
                vstack = vstack.slice(0, -1 * len);
                lstack = lstack.slice(0, -1 * len);
            }
            stack.push(this.productions_[action[1]][0]);
            vstack.push(yyval.$);
            lstack.push(yyval._$);
            newState = table[stack[stack.length - 2]][stack[stack.length - 1]];
            stack.push(newState);
            break;
        case 3:
            return true;
        }
    }
    return true;
}};
/* generated by jison-lex 0.3.4 */
var lexer = (function(){
var lexer = ({

EOF:1,

parseError:function parseError(str, hash) {
        if (this.yy.parser) {
            this.yy.parser.parseError(str, hash);
        } else {
            throw new Error(str);
        }
    },

// resets the lexer, sets new input
setInput:function (input, yy) {
        this.yy = yy || this.yy || {};
        this._input = input;
        this._more = this._backtrack = this.done = false;
        this.yylineno = this.yyleng = 0;
        this.yytext = this.matched = this.match = '';
        this.conditionStack = ['INITIAL'];
        this.yylloc = {
            first_line: 1,
            first_column: 0,
            last_line: 1,
            last_column: 0
        };
        if (this.options.ranges) {
            this.yylloc.range = [0,0];
        }
        this.offset = 0;
        return this;
    },

// consumes and returns one char from the input
input:function () {
        var ch = this._input[0];
        this.yytext += ch;
        this.yyleng++;
        this.offset++;
        this.match += ch;
        this.matched += ch;
        var lines = ch.match(/(?:\r\n?|\n).*/g);
        if (lines) {
            this.yylineno++;
            this.yylloc.last_line++;
        } else {
            this.yylloc.last_column++;
        }
        if (this.options.ranges) {
            this.yylloc.range[1]++;
        }

        this._input = this._input.slice(1);
        return ch;
    },

// unshifts one char (or a string) into the input
unput:function (ch) {
        var len = ch.length;
        var lines = ch.split(/(?:\r\n?|\n)/g);

        this._input = ch + this._input;
        this.yytext = this.yytext.substr(0, this.yytext.length - len);
        //this.yyleng -= len;
        this.offset -= len;
        var oldLines = this.match.split(/(?:\r\n?|\n)/g);
        this.match = this.match.substr(0, this.match.length - 1);
        this.matched = this.matched.substr(0, this.matched.length - 1);

        if (lines.length - 1) {
            this.yylineno -= lines.length - 1;
        }
        var r = this.yylloc.range;

        this.yylloc = {
            first_line: this.yylloc.first_line,
            last_line: this.yylineno + 1,
            first_column: this.yylloc.first_column,
            last_column: lines ?
                (lines.length === oldLines.length ? this.yylloc.first_column : 0)
                 + oldLines[oldLines.length - lines.length].length - lines[0].length :
              this.yylloc.first_column - len
        };

        if (this.options.ranges) {
            this.yylloc.range = [r[0], r[0] + this.yyleng - len];
        }
        this.yyleng = this.yytext.length;
        return this;
    },

// When called from action, caches matched text and appends it on next action
more:function () {
        this._more = true;
        return this;
    },

// When called from action, signals the lexer that this rule fails to match the input, so the next matching rule (regex) should be tested instead.
reject:function () {
        if (this.options.backtrack_lexer) {
            this._backtrack = true;
        } else {
            return this.parseError('Lexical error on line ' + (this.yylineno + 1) + '. You can only invoke reject() in the lexer when the lexer is of the backtracking persuasion (options.backtrack_lexer = true).\n' + this.showPosition(), {
                text: "",
                token: null,
                line: this.yylineno
            });

        }
        return this;
    },

// retain first n characters of the match
less:function (n) {
        this.unput(this.match.slice(n));
    },

// displays already matched input, i.e. for error messages
pastInput:function () {
        var past = this.matched.substr(0, this.matched.length - this.match.length);
        return (past.length > 20 ? '...':'') + past.substr(-20).replace(/\n/g, "");
    },

// displays upcoming input, i.e. for error messages
upcomingInput:function () {
        var next = this.match;
        if (next.length < 20) {
            next += this._input.substr(0, 20-next.length);
        }
        return (next.substr(0,20) + (next.length > 20 ? '...' : '')).replace(/\n/g, "");
    },

// displays the character position where the lexing error occurred, i.e. for error messages
showPosition:function () {
        var pre = this.pastInput();
        var c = new Array(pre.length + 1).join("-");
        return pre + this.upcomingInput() + "\n" + c + "^";
    },

// test the lexed token: return FALSE when not a match, otherwise return token
test_match:function (match, indexed_rule) {
        var token,
            lines,
            backup;

        if (this.options.backtrack_lexer) {
            // save context
            backup = {
                yylineno: this.yylineno,
                yylloc: {
                    first_line: this.yylloc.first_line,
                    last_line: this.last_line,
                    first_column: this.yylloc.first_column,
                    last_column: this.yylloc.last_column
                },
                yytext: this.yytext,
                match: this.match,
                matches: this.matches,
                matched: this.matched,
                yyleng: this.yyleng,
                offset: this.offset,
                _more: this._more,
                _input: this._input,
                yy: this.yy,
                conditionStack: this.conditionStack.slice(0),
                done: this.done
            };
            if (this.options.ranges) {
                backup.yylloc.range = this.yylloc.range.slice(0);
            }
        }

        lines = match[0].match(/(?:\r\n?|\n).*/g);
        if (lines) {
            this.yylineno += lines.length;
        }
        this.yylloc = {
            first_line: this.yylloc.last_line,
            last_line: this.yylineno + 1,
            first_column: this.yylloc.last_column,
            last_column: lines ?
                         lines[lines.length - 1].length - lines[lines.length - 1].match(/\r?\n?/)[0].length :
                         this.yylloc.last_column + match[0].length
        };
        this.yytext += match[0];
        this.match += match[0];
        this.matches = match;
        this.yyleng = this.yytext.length;
        if (this.options.ranges) {
            this.yylloc.range = [this.offset, this.offset += this.yyleng];
        }
        this._more = false;
        this._backtrack = false;
        this._input = this._input.slice(match[0].length);
        this.matched += match[0];
        token = this.performAction.call(this, this.yy, this, indexed_rule, this.conditionStack[this.conditionStack.length - 1]);
        if (this.done && this._input) {
            this.done = false;
        }
        if (token) {
            return token;
        } else if (this._backtrack) {
            // recover context
            for (var k in backup) {
                this[k] = backup[k];
            }
            return false; // rule action called reject() implying the next rule should be tested instead.
        }
        return false;
    },

// return next match in input
next:function () {
        if (this.done) {
            return this.EOF;
        }
        if (!this._input) {
            this.done = true;
        }

        var token,
            match,
            tempMatch,
            index;
        if (!this._more) {
            this.yytext = '';
            this.match = '';
        }
        var rules = this._currentRules();
        for (var i = 0; i < rules.length; i++) {
            tempMatch = this._input.match(this.rules[rules[i]]);
            if (tempMatch && (!match || tempMatch[0].length > match[0].length)) {
                match = tempMatch;
                index = i;
                if (this.options.backtrack_lexer) {
                    token = this.test_match(tempMatch, rules[i]);
                    if (token !== false) {
                        return token;
                    } else if (this._backtrack) {
                        match = false;
                        continue; // rule action called reject() implying a rule MISmatch.
                    } else {
                        // else: this is a lexer rule which consumes input without producing a token (e.g. whitespace)
                        return false;
                    }
                } else if (!this.options.flex) {
                    break;
                }
            }
        }
        if (match) {
            token = this.test_match(match, rules[index]);
            if (token !== false) {
                return token;
            }
            // else: this is a lexer rule which consumes input without producing a token (e.g. whitespace)
            return false;
        }
        if (this._input === "") {
            return this.EOF;
        } else {
            return this.parseError('Lexical error on line ' + (this.yylineno + 1) + '. Unrecognized text.\n' + this.showPosition(), {
                text: "",
                token: null,
                line: this.yylineno
            });
        }
    },

// return next match that has a token
lex:function lex() {
        var r = this.next();
        if (r) {
            return r;
        } else {
            return this.lex();
        }
    },

// activates a new lexer condition state (pushes the new lexer condition state onto the condition stack)
begin:function begin(condition) {
        this.conditionStack.push(condition);
    },

// pop the previously active lexer condition state off the condition stack
popState:function popState() {
        var n = this.conditionStack.length - 1;
        if (n > 0) {
            return this.conditionStack.pop();
        } else {
            return this.conditionStack[0];
        }
    },

// produce the lexer rule set which is active for the currently active lexer condition state
_currentRules:function _currentRules() {
        if (this.conditionStack.length && this.conditionStack[this.conditionStack.length - 1]) {
            return this.conditions[this.conditionStack[this.conditionStack.length - 1]].rules;
        } else {
            return this.conditions["INITIAL"].rules;
        }
    },

// return the currently active lexer condition state; when an index argument is provided it produces the N-th previous condition state, if available
topState:function topState(n) {
        n = this.conditionStack.length - 1 - Math.abs(n || 0);
        if (n >= 0) {
            return this.conditionStack[n];
        } else {
            return "INITIAL";
        }
    },

// alias for begin(condition)
pushState:function pushState(condition) {
        this.begin(condition);
    },

// return the number of states currently on the stack
stateStackSize:function stateStackSize() {
        return this.conditionStack.length;
    },
options: {},
performAction: function anonymous(yy,yy_,$avoiding_name_collisions,YY_START) {
var YYSTATE=YY_START;
switch($avoiding_name_collisions) {
case 0:
                                    var _reg = /\\+$/;
                                    var _esc = yy_.yytext.match(_reg);
                                    var _num = _esc ? _esc[0].length: null;
                                    /*转义实现，非常恶心，暂时没有好的解决方案*/
                                    if (!_num || !(_num % 2)) {
                                      this.begin("mu");
                                    } else {
                                      yy_.yytext = yy_.yytext.replace(/\\$/, '');
                                      this.begin('esc');
                                    }
                                    if (_num > 1) yy_.yytext = yy_.yytext.replace(/(\\\\)+$/, '\\');
                                    if(yy_.yytext) return 82;
                                  
break;
case 1:
                                    var _reg = /\\+$/;
                                    var _esc = yy_.yytext.match(_reg);
                                    var _num = _esc ? _esc[0].length: null;
                                    if (!_num || !(_num % 2)) {
                                      this.begin("h");
                                    } else {
                                      yy_.yytext = yy_.yytext.replace(/\\$/, '');
                                      this.begin('esc');
                                    }
                                    if (_num > 1) yy_.yytext = yy_.yytext.replace(/(\\\\)+$/, '\\');
                                    if(yy_.yytext) return 82;
                                  
break;
case 2: return 82; 
break;
case 3: this.popState(); return 11; 
break;
case 4: this.popState(); yy_.yytext = yy_.yytext.replace(/^#\[\[|\]\]#$/g, ''); return 10
break;
case 5: this.popState(); return 11; 
break;
case 6: return 46; 
break;
case 7: return 20; 
break;
case 8: return 27; 
break;
case 9: return 29; 
break;
case 10: return 31; 
break;
case 11: this.popState(); return 32; 
break;
case 12: this.popState(); return 32; 
break;
case 13: this.popState(); return 33; 
break;
case 14: this.popState(); return 33; 
break;
case 15: this.popState(); return 41; 
break;
case 16: return 34; 
break;
case 17: return 21; 
break;
case 18: return 42; 
break;
case 19: return 43; 
break;
case 20: return 37; 
break;
case 21: return yy_.yytext; 
break;
case 22: return yy_.yytext; 
break;
case 23: return 65; 
break;
case 24: return yy_.yytext; 
break;
case 25: return 64; 
break;
case 26: return yy_.yytext; 
break;
case 27: return 61; 
break;
case 28: return 62; 
break;
case 29: return yy_.yytext; 
break;
case 30: return 63; 
break;
case 31: return yy_.yytext; 
break;
case 32: return 54; 
break;
case 33: return yy_.yytext; 
break;
case 34: return 55; 
break;
case 35: return yy_.yytext; 
break;
case 36: return 66; 
break;
case 37: return 68; 
break;
case 38: return 35; 
break;
case 39: return 35; 
break;
case 40: return yy_.yytext; 
break;
case 41: return 51; 
break;
case 42:
                                    var len = this.stateStackSize();
                                    if (len >= 2 && this.topState() === 'c' && this.topState(1) === 'run') {
                                      return 49;
                                    }
                                  
break;
case 43: /*ignore whitespace*/ 
break;
case 44: return 38; 
break;
case 45: return 39; 
break;
case 46: return 96; 
break;
case 47: yy.begin = true; return 74; 
break;
case 48: this.popState(); if (yy.begin === true) { yy.begin = false; return 75;} else { return 82; } 
break;
case 49: this.begin("c"); return 22; 
break;
case 50:
                                    if (this.popState() === "c") {
                                      var len = this.stateStackSize();

                                      if (this.topState() === 'run') {
                                        this.popState();
                                        len = len - 1;
                                      }

                                      var tailStack = this.topState(len - 2);
                                      /** 遇到#set(a = b)括号结束后结束状态h*/
                                      if (len === 2 && tailStack === "h"){
                                        this.popState();
                                      } else if (len === 3 && tailStack === "mu" &&  this.topState(len - 3) === "h") {
                                        // issue#7 $foo#if($a)...#end
                                        this.popState();
                                        this.popState();
                                      }

                                      return 23; 
                                    } else {
                                      return 82; 
                                    }
                                  
break;
case 51: this.begin("i"); return 83; 
break;
case 52: 
                                    if (this.popState() === "i") {
                                      return 84; 
                                    } else {
                                      return 82;
                                    }
                                  
break;
case 53: return 94; 
break;
case 54: return 80; 
break;
case 55: return 90; 
break;
case 56: return 50; 
break;
case 57: yy_.yytext = yy_.yytext.substr(1, yy_.yyleng-2).replace(/\\"/g,'"'); return 92; 
break;
case 58: yy_.yytext = yy_.yytext.substr(1, yy_.yyleng-2).replace(/\\'/g,"'"); return 91; 
break;
case 59: return 87; 
break;
case 60: return 87; 
break;
case 61: return 87; 
break;
case 62: return 89; 
break;
case 63: return 36; 
break;
case 64: this.begin("run"); return 36; 
break;
case 65: this.begin('h'); return 20; 
break;
case 66: this.popState(); return 82; 
break;
case 67: this.popState(); return 82; 
break;
case 68: this.popState(); return 82; 
break;
case 69: this.popState(); return 4; 
break;
case 70: return 4; 
break;
}
},
rules: [/^(?:[^#]*?(?=\$))/,/^(?:[^\$]*?(?=#))/,/^(?:[^\x00]+)/,/^(?:#\*[\s\S]+?\*#)/,/^(?:#\[\[[\s\S]+?\]\]#)/,/^(?:##[^\n]*)/,/^(?:#@)/,/^(?:#(?=[a-zA-Z{]))/,/^(?:set[ ]*(?=[^a-zA-Z0-9_]+))/,/^(?:if[ ]*(?=[^a-zA-Z0-9_]+))/,/^(?:elseif[ ]*(?=[^a-zA-Z0-9_]+))/,/^(?:else\b)/,/^(?:\{else\})/,/^(?:end\b)/,/^(?:\{end\})/,/^(?:break\b)/,/^(?:foreach[ ]*(?=[^a-zA-Z0-9_]+))/,/^(?:noescape(?=[^a-zA-Z0-9_]+))/,/^(?:define[ ]*(?=[^a-zA-Z0-9_]+))/,/^(?:macro[ ]*(?=[^a-zA-Z0-9_]+))/,/^(?:in\b)/,/^(?:[%\+\-\*\/])/,/^(?:<=)/,/^(?:le\b)/,/^(?:>=)/,/^(?:ge\b)/,/^(?:[><])/,/^(?:gt\b)/,/^(?:lt\b)/,/^(?:==)/,/^(?:eq\b)/,/^(?:\|\|)/,/^(?:or\b)/,/^(?:&&)/,/^(?:and\b)/,/^(?:!=)/,/^(?:ne\b)/,/^(?:not\b)/,/^(?:\$!(?=[{a-zA-Z_]))/,/^(?:\$(?=[{a-zA-Z_]))/,/^(?:!)/,/^(?:=)/,/^(?:[ ]+(?=[^,]))/,/^(?:\s+)/,/^(?:\{)/,/^(?:\})/,/^(?::[\s]*)/,/^(?:\{)/,/^(?:\})/,/^(?:\([\s]*(?=[$'"\[\{\-0-9\w()!]))/,/^(?:\))/,/^(?:\[[\s]*(?=[\-$"'0-9{\[\]]+))/,/^(?:\])/,/^(?:\.\.)/,/^(?:\.(?=[a-zA-Z_]))/,/^(?:\.(?=[\d]))/,/^(?:,[ ]*)/,/^(?:"(\\"|[^\"])*")/,/^(?:'(\\'|[^\'])*')/,/^(?:null\b)/,/^(?:false\b)/,/^(?:true\b)/,/^(?:[0-9]+)/,/^(?:[_a-zA-Z][a-zA-Z0-9_\-]*)/,/^(?:[_a-zA-Z][a-zA-Z0-9_\-]*[ ]*(?=\())/,/^(?:#)/,/^(?:.)/,/^(?:\s+)/,/^(?:[\$#])/,/^(?:$)/,/^(?:$)/],
conditions: {"mu":{"rules":[5,38,39,47,48,49,50,51,52,54,63,65,66,67,69],"inclusive":false},"c":{"rules":[20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,49,50,51,52,54,55,56,57,58,59,60,61,62,63],"inclusive":false},"i":{"rules":[20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,43,44,44,45,45,46,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63],"inclusive":false},"h":{"rules":[3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,38,39,40,41,46,49,50,51,52,54,62,64,66,67,69],"inclusive":false},"esc":{"rules":[68],"inclusive":false},"run":{"rules":[38,39,40,42,43,44,45,46,49,50,51,52,54,55,56,57,58,59,60,61,62,63,66,67,69],"inclusive":false},"INITIAL":{"rules":[0,1,2,70],"inclusive":true}}
});
return lexer;
})();
parser.lexer = lexer;
function Parser () {
  this.yy = {};
}
Parser.prototype = parser;parser.Parser = Parser;
return new Parser;
})();


if (typeof require !== 'undefined' && typeof exports !== 'undefined') {
exports.parser = velocity;
exports.Parser = velocity.Parser;
exports.parse = function () { return velocity.parse.apply(velocity, arguments); };
exports.main = function commonjsMain(args) {
    if (!args[1]) {
        console.log('Usage: '+args[0]+' FILE');
        process.exit(1);
    }
    var source = require('fs').readFileSync(require('path').normalize(args[1]), "utf8");
    return exports.parser.parse(source);
};
if (typeof module !== 'undefined' && require.main === module) {
  exports.main(process.argv.slice(1));
}
}
}).call(this,require('_process'))
},{"_process":2,"fs":1,"path":1}],14:[function(require,module,exports){
"use strict";
var utils = {};

['forEach', 'some', 'every', 'filter', 'map'].forEach(function(fnName) {
  utils[fnName] = function(arr, fn, context) {
    if (!arr || typeof arr === 'string') return arr;
    context = context || this;
    if (arr[fnName]) {
      return arr[fnName](fn, context);
    } else {
      var keys = Object.keys(arr);
      return keys[fnName](function(key) {
        return fn.call(context, arr[key], key, arr);
      }, context);
    }
  };
});

var number = 0;
utils.guid = function() {
  return number++;
};

utils.mixin = function(to, from) {
  utils.forEach(from, function(val, key) {
    if (utils.isArray(val) || utils.isObject(val)) {
      to[key] = utils.mixin(val, to[key] || {});
    } else {
      to[key] = val;
    }
  });
  return to;
};

utils.isArray = function(obj) {
  return {}.toString.call(obj) === '[object Array]';
};

utils.isObject = function(obj) {
  return {}.toString.call(obj) === '[object Object]';
};

utils.indexOf = function(elem, arr) {
  if (utils.isArray(arr)) {
    return arr.indexOf(elem);
  }
};

utils.keys = Object.keys;
utils.now  = Date.now;

module.exports = utils;

},{}],15:[function(require,module,exports){
'use strict';
var Compile = require('./compile/');
var Helper = require('./helper/index');
var parse = require('./parse');

Compile.parse = parse;

var Velocity = {
  parse: parse,
  Compile: Compile,
  Helper: Helper
};

Velocity.render = function(template, context, macros, config) {

  var asts = parse(template);
  var compile = new Compile(asts, config);
  return compile.render(context, macros);
};

module.exports = Velocity;

},{"./compile/":6,"./helper/index":10,"./parse":12}],16:[function(require,module,exports){
var Velocity = require('velocityjs');

const successAlert = document.getElementById("successAlert");
const failAlert = document.getElementById("failAlert");
const errorField = document.getElementById("errorField");
let mostRecentlyToggled = null;
const load = () => {
  document.getElementById("submit").addEventListener("click", () => {
    if (mostRecentlyToggled) {
      mostRecentlyToggled.classList.add("collapse");
    }
    errorField.innerHTML = '';
    const text = document.getElementById("inputField").value;
    try {
      const ast = Velocity.parse(text);
      successAlert.classList.remove("collapse");
      mostRecentlyToggled = successAlert;
    } catch (error) {
      console.log(error);
      failAlert.classList.remove("collapse");
      errorField.innerHTML = error.toString().replace(/\n/g, "<br />");;
      mostRecentlyToggled = failAlert;
    }
  });
}
window.onload = load;

},{"velocityjs":15}]},{},[16]);
