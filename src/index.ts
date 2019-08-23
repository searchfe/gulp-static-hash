import * as through from 'through2';
import * as gutil from 'gulp-util';
import { Revisioner } from './revisioner';

export function staticManifest() {
  const PLUGIN_NAME = "gulp-static-manifest";
  let revisioner = null;
  return through.obj(function (file, enc, cb) {
    // 如果文件为空，不做任何操作，转入下一个操作，即下一个 .pipe()
    if (file.isNull()) {
      this.emit('error', new gutil.PluginError(PLUGIN_NAME, 'file is empty'));
      return cb();
    }
    // 插件不支持对 Stream 对直接操作，跑出异常
    if (file.isStream()) {
      this.emit('error', new gutil.PluginError(PLUGIN_NAME, 'Streams are not supported!'));
      return cb();
    }
    if (file.isBuffer()) {
      const rev = new Revisioner();
      rev.processFile(file);
      file.revisioner = rev;
      revisioner = file.revisioner;
      cb();
    }
  }, function (cb, revisioner) {
    revisioner.run();
    const files = revisioner.files;
    for(const f in files) {
      this.push(files[f]);
    }
    cb();
  }, function (cb, revisioner) {
    this.push(revisioner.versionFile());
    cb();
  });
}
