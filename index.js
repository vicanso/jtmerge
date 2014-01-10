(function() {
  "use strict";

  var Merge, getMergeFileName, getMergeInfo, path, _;

  _ = require('underscore');

  path = require('path');

  Merge = (function() {

    function Merge(mergeInfo) {
      this.mergeInfo = mergeInfo;
    }

    Merge.prototype.getMergeList = function(pages, staticsDestPath) {
      var filesInfos, mergeInfo,
        _this = this;
      mergeInfo = this.mergeInfo;
      filesInfos = [];
      _.each(mergeInfo.files, function(tmpFiles) {
        return filesInfos.push(getMergeInfo(staticsDestPath, tmpFiles));
      });
      _.each(pages, function(value) {
        delete value.modifiedAt;
        return _.each(value, function(tmpFiles) {
          tmpFiles = _this.getRestFiles(tmpFiles);
          if (tmpFiles.length) {
            return filesInfos.push(getMergeInfo(staticsDestPath, tmpFiles));
          }
        });
      });
      return _.object(filesInfos);
    };

    Merge.prototype.getRestFiles = function(files) {
      var mergeFiles, mergeInfo;
      mergeInfo = this.mergeInfo;
      mergeFiles = _.flatten(mergeInfo.files);
      mergeFiles = mergeFiles.concat(mergeInfo.except);
      return _.filter(files, function(file) {
        return !~_.indexOf(mergeFiles, file);
      });
    };

    Merge.prototype.getMergeExportFiles = function(files) {
      var exportFiles, mergeFiles, mergeInfo, restFiles;
      mergeInfo = this.mergeInfo;
      mergeFiles = _.flatten(mergeInfo.files);
      mergeFiles = mergeFiles.concat(mergeInfo.except);
      exportFiles = [];
      restFiles = [];
      _.each(files, function(file) {
        var result;
        if (~_.indexOf(mergeFiles, file)) {
          result = _.find(mergeInfo.files, function(tmpFiles) {
            return ~_.indexOf(tmpFiles, file);
          });
          return exportFiles.push(result || file);
        } else {
          return restFiles.push(file);
        }
      });
      exportFiles.push(restFiles);
      exportFiles = _.map(_.uniq(exportFiles), function(data) {
        if (_.isArray(data)) {
          return getMergeFileName(data);
        } else {
          return data;
        }
      });
      return exportFiles;
    };

    return Merge;

  })();

  getMergeInfo = function(staticsDestPath, tmpFiles) {
    var dest, tmpArr;
    tmpArr = _.map(tmpFiles, function(file) {
      return path.join(staticsDestPath, file);
    });
    dest = path.join(staticsDestPath, getMergeFileName(tmpFiles));
    return [dest, tmpArr];
  };

  getMergeFileName = function(files) {
    var cutName, ext, tmpArr, tmpNames;
    cutName = function(file, ext) {
      var basename, partList;
      partList = _.compact(file.split('/'));
      basename = path.basename(partList.pop(), ext);
      partList.push(basename);
      return partList.join('_');
    };
    tmpArr = [];
    tmpNames = [];
    ext = path.extname(files[0]);
    _.each(files, function(file) {
      return tmpNames.push(cutName(file, ext));
    });
    return "/merge/" + (tmpNames.join(',')) + ext;
  };

  module.exports = Merge;

}).call(this);
