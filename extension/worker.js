'use strict';
module.exports=function(root,doc){
 const fs=require('fs'),path=require('path'),crypto=require('crypto');
 const dir=path.join(require(path.join(root,'platform.js')).dataDir(),'cache');fs.mkdirSync(dir,{recursive:true});let busy=false;
 const render=require(path.join(root,'renderer.js'))(root,doc,process.platform);
 setInterval(()=>{if(busy)return;let req;try{req=fs.readdirSync(dir).find(f=>f.endsWith('.request.json'));}catch(e){return;}if(!req)return;
  const input=path.join(dir,req);let d;try{d=JSON.parse(fs.readFileSync(input,'utf8'));if(!/^[a-f0-9-]+$/.test(d.key)||typeof d.emoji!=='string'||d.emoji.length>80)throw Error('invalid');}catch(e){try{fs.unlinkSync(input);}catch(ignore){}return;}
  const lock=input+'.lock';try{const fd=fs.openSync(lock,'wx');fs.closeSync(fd);}catch(e){try{if(Date.now()-fs.statSync(lock).mtimeMs>30000)fs.unlinkSync(lock);}catch(ignore){}return;}
  busy=true;const png=path.join(dir,d.key+'.png');
  render(d.emoji,png).then(()=>{const bytes=fs.readFileSync(png),record={emoji:d.emoji,png:bytes.toString('base64'),filename:'smoji-'+crypto.createHash('sha256').update(bytes).digest('hex').slice(0,24)+'.png'};fs.writeFileSync(path.join(dir,d.key+'.json.part'),JSON.stringify(record));fs.renameSync(path.join(dir,d.key+'.json.part'),path.join(dir,d.key+'.json'));fs.unlinkSync(input);}).catch(()=>{try{fs.renameSync(input,input+'.failed');}catch(ignore){}}).finally(()=>{try{fs.unlinkSync(lock);}catch(ignore){}busy=false;});
 },100);
};
