_ = require 'underscore'
path = require 'path'

class Merge
  constructor : (@mergeInfo) ->


  getMergeList : (pages, staticsDestPath) ->
    mergeInfo = @mergeInfo
    filesInfos = []
    _.each mergeInfo.files, (tmpFiles) ->
      filesInfos.push getMergeInfo staticsDestPath, tmpFiles
    _.each pages, (value) =>
      _.each value, (tmpFiles) =>
        tmpFiles = @getRestFiles tmpFiles
        filesInfos.push getMergeInfo staticsDestPath, tmpFiles if tmpFiles.length
    _.object filesInfos
  getRestFiles : (files) ->
    mergeInfo = @mergeInfo
    mergeFiles = _.flatten mergeInfo.files
    mergeFiles = mergeFiles.concat mergeInfo.except
    _.filter files, (file) ->
      !~_.indexOf mergeFiles, file
  getMergeExportFiles : (files) ->
    mergeInfo = @mergeInfo
    mergeFiles = _.flatten mergeInfo.files
    mergeFiles = mergeFiles.concat mergeInfo.except
    exportFiles = []
    restFiles = []
    _.each files, (file) ->
      if ~_.indexOf mergeFiles, file
        result = _.find mergeInfo.files, (tmpFiles) ->
          ~_.indexOf tmpFiles, file
        exportFiles.push result || file
      else
        restFiles.push file
    exportFiles.push restFiles
    exportFiles = _.map _.uniq(exportFiles), (data) ->
      if _.isArray data
        getMergeFileName data
      else
        data
    exportFiles

getMergeInfo = (staticsDestPath, tmpFiles) ->
  tmpArr = _.map tmpFiles, (file) ->
    path.join staticsDestPath, file
  dest = path.join staticsDestPath, getMergeFileName tmpFiles
  [dest, tmpArr]

getMergeFileName = (files) ->
  cutName = (file, ext) ->
    partList = _.compact file.split '/'
    basename = path.basename partList.pop(), ext
    partList.push basename
    partList.join '_'
  tmpArr = []
  tmpNames = []
  ext = path.extname files[0]
  _.each files, (file) ->
    tmpNames.push cutName file, ext
  "/merge/#{tmpNames.join(',')}#{ext}"
module.exports = Merge