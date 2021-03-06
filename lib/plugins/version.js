'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var FILE_NAME_REG = /^([^\@]*)\@?([^\.]+)(\.(js|css))$/;

var Version = function () {
  function Version(verFilePath, entryExtNames) {
    _classCallCheck(this, Version);

    this.verFilePath = verFilePath;
    this.entryExtNames = entryExtNames;
    this.versions = [];
  }

  _createClass(Version, [{
    key: 'getKey',
    value: function getKey(fileParse) {
      var _this = this;

      var name = '',
          extName = fileParse.ext || '.js';
      Object.keys(this.entryExtNames).forEach(function (key) {
        if (_this.entryExtNames[key].indexOf(extName) > -1) {
          name = sysPath.join(fileParse.dir, fileParse.name + '.' + key);
        }
      });
      return name;
    }
  }, {
    key: 'apply',
    value: function apply(compiler) {
      var _this2 = this;

      compiler.plugin('after-emit', function (compilation, callback) {
        compilation.chunks.forEach(function (chunk) {
          if (!chunk.name) {
            // 如果是异步加载形成的chunk，就不会有name这个属性，因此也不需要放到版本号表里面
            return;
          }
          chunk.files.forEach(function (filename) {
            // 如果是entry里面对象有样式文件（一般在多页应用中出现）,那么会存在chunk.files的长度为2，但是实际中有一个后缀为.js的文件是不存在的，当时在导出的时候已经把它给过滤了。例如：entry里面有个配置是styles/index.less，那么chunk.files的值为[styles/index@哈希值.js,styles/index@哈希值.css]这个时候styles/index@哈希值.js根本不存在compilation.assets里面，因此要删除
            if ((/\.js$/.test(filename) || /\.css$/.test(filename)) && compilation.assets[filename]) {
              var matchInfo = filename.match(FILE_NAME_REG),
                  key = matchInfo[1] + matchInfo[3],
                  hash = matchInfo[2];
              _this2.versions.push(key + '#' + hash);
            }
          });
        });
        fs.appendFile(sysPath.join(_this2.verFilePath, 'versions.mapping'), _this2.versions.join('\n') + '\n', function (err) {
          if (err) {
            compilation.errors.push(err);
          }
          callback();
        });
      });
    }
  }]);

  return Version;
}();

exports.default = Version;