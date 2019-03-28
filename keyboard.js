;
(function(undefined) {
  "use strict"; //使用js严格模式检查，是语法更规范
  var _global;
  var appKeyboard = function(config, callback) {
    this.trigger = config.trigger;
    this.keyContainer = config.keyContainer;
    this.keyboard = config.keyboard;
    this.callbackfn = callback;
    this.keyboardWraper = null;
    this.keyboardHeight = 0;
    this.value = '';
    this.hidePoint = !config.hidePoint ? false : config.hidePoint; //是否隐藏小数点
    this.lenlimit = !config.hidePoint ? 7 : 11; //金额键盘小数点前7位,号码键盘限制11位 
    this.init();
  }

  appKeyboard.prototype = {
    init: function(e) {
      var _this = this;
      var _body = document.querySelector('body');
      _body.style.cursor = "pointer";
      var trigger = document.getElementById(this.trigger);
      trigger.setAttribute("readonly", "readonly");
      trigger.setAttribute("unselectable", "on");
      trigger.setAttribute("onfocus", "this.blur()");
      _this.create(); //创建数字键盘

      trigger.addEventListener("click", function(e) {
        // e.preventDefault();
        e.stopPropagation();
        _this.value = this.value;
        _this.show(); 
        var cursor = document.querySelector('#' + _this.trigger + '_cursor');
        // console.log(cursor);
        if (!cursor) {
          _this.addCursor(trigger);
        } else {
          cursor.style.display = 'block';
        }
      }, false);
    },
    addCursor: function(trigger) {
      // console.log(trigger.parentNode);
      var _parent = trigger.parentNode;
      var position = this.returnAttr(_parent, 'position');
      if (position == 'static') {
        _parent.style.position = 'relative';
      }
      var paddingLeft = this.returnAttr(trigger, 'padding-left');
      // console.log(paddingLeft);
      var fontSize = this.returnAttr(trigger, 'font-size');
      var _color = this.returnAttr(trigger, 'color');
      var cursor = document.createElement('div');
      cursor.className = 'ipt-cursor';
      cursor.id = this.trigger + '_cursor';
      cursor.style.position = 'absolute';
      cursor.style.left = (trigger.offsetLeft + parseInt(paddingLeft)) + 'px';
      var tempHei = trigger.offsetHeight * 0.15;
      cursor.style.top = (trigger.offsetTop + tempHei) + 'px';
      cursor.style.height = (trigger.offsetHeight - tempHei * 2) + 'px';
      cursor.style.fontSize = fontSize;
      cursor.style.borderRightColor = _color;
      _parent.appendChild(cursor);
      this.cursor = cursor;
    },
    returnAttr: function(dom, attr) {
      var attrVal = dom.currentStyle ? dom.currentStyle[attr] :
        window.getComputedStyle(dom, null)[attr];
      return attrVal;
    },
    create: function() {
      var keycodeHtml = '<div class="keyboard" id="' + this.trigger + '_keyboard">';
      var point = !this.hidePoint ? '.' : '';
      keycodeHtml += '<ul>' +
        '<li><span>1</span><i>&nbsp;&nbsp;</i></li>' +
        '<li><span>2</span><i>ABC</i></li>' +
        '<li><span>3</span><i>DEF</i></li>' +
        '<li><span>4</span><i>GHI</i></li>' +
        '<li><span>5</span><i>JKL</i></li>' +
        '<li><span>6</span><i>MNO</i></li>' +
        '<li><span>7</span><i>PQRS</i></li>' +
        '<li><span>8</span><i>TUV</i></li>' +
        '<li><span>9</span><i>WXYZ</i></li>' +
        '<li data-type="pointer">' +
        '<span style="font-weight: bold">' + point + '</span></li>' +
        '<li><span>0</span></li>' +
        '<li data-type="del"><span></span></li>' +
        '</ul>';
      keycodeHtml += '</div>';

      this.keyboardWraper = document.createElement('div');
      this.keyboardWraper.className = "keyboard-layer";
      this.keyboardWraper.id = this.trigger + "keyContainer";
      this.keyboardWraper.innerHTML = keycodeHtml;
      document.querySelector('body').appendChild(this.keyboardWraper);
      this.keyboard = this.keyboardWraper.querySelector('#' + this.trigger + '_keyboard');
      this.keyboardHeight = this.keyboard.offsetHeight;
      this.hideKeyboardPanel(); //隐藏面板
      this.registerEvent(); //注册dom事件
    },
    show: function() {
      this.toggleAnimate({
        visibility: 'visible',
        position: 0,
        opacity: 1,
      });
      var keyboardLayers = document.querySelectorAll('.keyboard-layer');
      var _this = this;
      // console.log(keyboardLayers);
      if (keyboardLayers.length > 1) {
        keyboardLayers.forEach(function(item, i) {
          var _id = item.id.replace('keyContainer', '');
          var _visibility = item.style.visibility;
          if (_id != _this.trigger && _visibility == 'visible') {
            item.style.visibility = 'hidden';
            item.style.opacity = 0;
            var _keyboard = item.querySelector('.keyboard');
            _keyboard.style.transform = 'translate3d(0,' + _this.keyboardHeight + 'px, 0)';
            _keyboard.style.opacity = 0;
            console.log('#' + _id + '_cursor');
            document.querySelector('#' + _id + '_cursor').style.display = "none";
          }
        });
      }
    },
    registerEvent: function(e) {
      //移动设备触摸事件注册
      var lisDom = this.keyboard.querySelectorAll('li');
      var _this = this;
      for (var i = 0; i < lisDom.length; i++) {
        (function(index) {
          if (document.body.clientWidth >= 768) {
            _this.addEvent(lisDom[index], 'click', touchEnd);
          } else {
            _this.addEvent(lisDom[index], 'touchstart', touchStart);
            _this.addEvent(lisDom[index], 'touchmove', touchMove);
            _this.addEvent(lisDom[index], 'touchend', touchEnd);
          }
        })(i);
      }

      document.addEventListener('click', function(e) {
        _this.hideKeyboardPanel();
        console.log(12333);
        document.querySelector('.ttshow').innerHTML = 1233;
        var cursorAll = document.querySelectorAll('.ipt-cursor');
        cursorAll.forEach(function(item) {
          item.style.display = 'none';
        });
      }, false);

      this.addEvent(this.keyboard, 'click', function(e) {
        e.stopPropagation();
      });

      function touchStart(e) {
        _this.stopBrowser(e);
        this.className = 'hover';
      }

      function touchMove(e) {
        _this.stopBrowser(e);
      }

      function touchEnd(e) {
        _this.stopBrowser(e);
        var text = this.querySelector("span").innerHTML;
        this.className = '';
        var istype = this.getAttribute('data-type');
        if (_this.hidePoint && istype == 'pointer') {
          return;
        }
        if (!_this.hidePoint) {
          if (_this.value.indexOf('.') == -1) {
            if (_this.value.length >= _this.lenlimit && !istype) {
              return;
            }
          }
        } else {
          if (_this.value.length >= _this.lenlimit && istype != 'del') {
            return;
          }
        }
        if (!istype) {
          _this.value += text;
          if (_this.value.indexOf('.') != -1) {
            var endIndex = _this.value.indexOf('.');
            _this.value = _this.value.substr(0, endIndex + 3);
          }
        } else {
          if (istype == 'del') {
            if (_this.value == '') { return; }
            _this.value = _this.value.substr(0, _this.value.length - 1);
          } else if (istype == 'pointer') {
            if (_this.value == '') {
              _this.value += text;
            }
            if (_this.value.indexOf('.') == -1) {
              _this.value += text;
            } else if (_this.value.indexOf('.') == 0) {
              _this.value = '0.';
            }
          }
        }
        document.getElementById(_this.trigger).value = _this.value;
        _this.cursor.style.width = 'auto';
        _this.cursor.innerHTML = _this.value;
        var _width = _this.returnAttr(_this.cursor, 'width');
        if (_this.value.slice(0, 2) == '1.' || _this.value.slice(0, 1) == '1') {
          _width = parseInt(_width) + 4;
        }
        if (_this.value.length >= 5) {
          _width = Math.floor(parseInt(_width) - Math.ceil(_this.value.length * 0.3));
        }
        _this.cursor.style.width = parseInt(_width) + 'px';
        _this.callbackfn(_this.value);
      }
    },
    /* 事件监听 */
    addEvent: function(el, type, fn) {
      if (el.addEventListener) {
        el.addEventListener(type, fn, { passive: false });
      } else if (el.attachEvent) {
        el.attach('on' + type, fn);
      } else {
        el['on' + type] = fn;
      }
    },
    /* 阻止浏览器默认行为 */
    stopBrowser: function(e) {
      if (e.preventDefault) {
        e.preventDefault();
      }
      e.returnValue = false;
    },
    //弹出动画
    toggleAnimate: function(attrAni) {
      this.keyboard.style.transform = 'translate3d(0,' + attrAni.position + 'px, 0)';
      this.keyboard.style.opacity = attrAni.opacity;
      this.keyboardWraper.style.visibility = attrAni.visibility;
      this.keyboardWraper.style.opacity = attrAni.opacity < 1 ? 0 : attrAni.opacity;
    },
    //隐藏选择面板
    hideKeyboardPanel: function() {
      this.toggleAnimate({
        visibility: 'hidden',
        position: this.keyboardHeight,
        opacity: 0.5
      });
    },
  }
  //最后将插件对象暴露给全局对象
  _global = (function() {
    return this || (0, eval)('this');
  }());

  if (typeof module !== "undefined" && module.exports) {
    module.exports = appKeyboard;
  } else if (typeof define === "function" && define.amd) {
    define(function() {
      return appKeyboard;
    });
  } else {
    !('appKeyboard' in _global) && (_global.appKeyboard = appKeyboard);
  }
})();