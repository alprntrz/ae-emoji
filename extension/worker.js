'use strict';
// Filesystem worker for custom emojis. Text scanning stays in the host idle task.
module.exports=function(root){
 const fs=require('fs'),path=require('path'),os=require('os'),crypto=require('crypto'),spawn=require('child_process').spawn;
 const dir=path.join(os.homedir(),'Library','Application Support','Sevemoji','cache');fs.mkdirSync(dir,{recursive:true});let busy=false;
 setInterval(()=>{if(busy)return;let req;try{req=fs.readdirSync(dir).find(f=>f.endsWith('.request.json'));}catch(e){return;}if(!req)return;
 const input=path.join(dir,req);let d;try{d=JSON.parse(fs.readFileSync(input,'utf8'));if(!/^[a-f0-9-]+$/.test(d.key)||typeof d.emoji!=='string'||d.emoji.length>80)throw Error('invalid');}catch(e){fs.unlinkSync(input);return;}
 const lock=input+'.lock';try{const fd=fs.openSync(lock,'wx');fs.closeSync(fd);}catch(e){try{if(Date.now()-fs.statSync(lock).mtimeMs>30000)fs.unlinkSync(lock);}catch(ignore){}return;}
 busy=true;const png=path.join(dir,d.key+'.png'),child=spawn(path.join(root,'native','sevemoji-render'),[]);let out='';const timeout=setTimeout(()=>child.kill(),15000);child.stdout.on('data',b=>out+=b);child.stdin.on('error',()=>{});child.on('error',()=>{});
 child.on('close',()=>{clearTimeout(timeout);try{const result=JSON.parse(out);if(!result.ok)throw Error(result.error);const bytes=fs.readFileSync(png),record={emoji:d.emoji,png:bytes.toString('base64'),filename:'smoji-'+crypto.createHash('sha256').update(bytes).digest('hex').slice(0,24)+'.png'};fs.writeFileSync(path.join(dir,d.key+'.json.part'),JSON.stringify(record));fs.renameSync(path.join(dir,d.key+'.json.part'),path.join(dir,d.key+'.json'));fs.unlinkSync(input);}catch(e){try{fs.renameSync(input,input+'.failed');}catch(ignore){}}finally{try{fs.unlinkSync(lock);}catch(ignore){}busy=false;}});
 child.stdin.end(JSON.stringify({action:'emoji',emoji:d.emoji,output:png}));
 },100);
};
