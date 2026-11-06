'use strict';
(function(){
 const r=window.cep_node?window.cep_node.require:require;
 const path=r('path'),fs=r('fs'),os=r('os'),root=path.dirname(r('url').fileURLToPath(location.href));
 try{r(path.join(root,'worker.js'))(root,document);}catch(e){/* The visible panel reports host setup issues. */}
 let previous='';
 const runtime=r(path.join(root,'automation.js'))(root,window.__adobe_cep__,function(status){
  const signature=JSON.stringify({state:status.state,enabled:status.enabled,error:status.error});if(signature===previous)return;previous=signature;
  try{const dir=r(path.join(root,'platform.js')).dataDir();fs.mkdirSync(dir,{recursive:true});fs.writeFileSync(path.join(dir,'commands-startup.json'),JSON.stringify({version:'4.5.0',time:new Date().toISOString(),status:status}));}catch(e){}
 });
 window.addEventListener('unload',()=>runtime.close());
}());
