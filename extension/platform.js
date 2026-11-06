'use strict';
const path=require('path'),os=require('os'),url=require('url');
exports.userData=function(platform,env,home){return platform==='win32'?(env.APPDATA||path.join(home,'AppData','Roaming')):path.join(home,'Library','Application Support');};
exports.extensionRoot=function(href){return path.dirname(url.fileURLToPath(href));};
exports.dataDir=function(){return path.join(exports.userData(process.platform,process.env,os.homedir()),'Sevemoji');};
