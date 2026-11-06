'use strict';
// Built-in assets are shared between platforms. Additional emoji on Windows
// use the system color emoji font in the CEP browser canvas.
const fs=require('fs'),path=require('path'),spawn=require('child_process').spawn;
module.exports=function(root,doc,platform){
 const catalog=require(path.join(root,'emojis.json'));
 function builtin(emoji){const normal=s=>s.replace(/\uFE0F/g,'');return catalog.find(e=>normal(e.emoji)===normal(emoji));}
 function canvas(emoji,output){
  if(!doc||!doc.createElement)throw Error('The emoji renderer requires an open AE Emoji panel.');
  const c=doc.createElement('canvas');c.width=512;c.height=512;const x=c.getContext('2d');if(!x)throw Error('Canvas rendering is unavailable.');
  x.clearRect(0,0,512,512);x.textAlign='center';x.textBaseline='middle';x.font='360px "Segoe UI Emoji"';x.fillText(emoji,256,256,480);
  const a=x.getImageData(0,0,512,512).data;let left=512,top=512,right=-1,bottom=-1;
  for(let y=0;y<512;y++)for(let i=0;i<512;i++)if(a[(y*512+i)*4+3]>2){left=Math.min(left,i);right=Math.max(right,i);top=Math.min(top,y);bottom=Math.max(bottom,y);}
  if(right<left)throw Error('This emoji could not be rendered by the Windows emoji font.');
  const side=Math.min(512,Math.max(right-left+1,bottom-top+1)+24),o=doc.createElement('canvas');o.width=324;o.height=324;
  o.getContext('2d').drawImage(c,(left+right+1-side)/2,(top+bottom+1-side)/2,side,side,0,0,324,324);
  const uri=o.toDataURL('image/png');if(!uri.startsWith('data:image/png;base64,'))throw Error('Could not create an emoji image.');
  fs.writeFileSync(output,Buffer.from(uri.split(',')[1],'base64'));return {path:output};
 }
 return function(emoji,output){return new Promise((resolve,reject)=>{
  try{const entry=builtin(emoji);if(platform==='win32'&&entry){fs.copyFileSync(path.join(root,'assets',entry.id+'.png'),output);return resolve({path:output});}
   if(platform==='win32')return resolve(canvas(emoji,output));
   const child=spawn(path.join(root,'native','sevemoji-render'),[],{stdio:['pipe','pipe','pipe']});let stdout='',stderr='',done=false;
   const timer=setTimeout(()=>{child.kill();finish(Error('Image rendering timed out.'));},20000);
   function finish(err,v){if(done)return;done=true;clearTimeout(timer);err?reject(err):resolve(v);}
   child.stdout.on('data',d=>stdout+=d);child.stderr.on('data',d=>stderr+=d);child.on('error',finish);child.stdin.on('error',()=>{});
   child.on('close',()=>{try{const result=JSON.parse(stdout);if(!result.ok)throw Error(result.error);finish(null,result.result);}catch(e){finish(Error(stdout?e.message:'The emoji renderer failed: '+stderr.slice(-220)));}});
   child.stdin.end(JSON.stringify({action:'emoji',emoji:emoji,output:output}));
  }catch(e){reject(e);}
 });};
};
