'use strict';
(function(){
 const box=document.getElementById('commands-enabled'),label=document.getElementById('auto-status');
 box.disabled=true;
 try{requireNode(path.join(root,'worker.js'))(root,document);}catch(e){/* Built-in emojis can still convert. */}
 const runtime=requireNode(path.join(root,'automation.js'))(root,window.__adobe_cep__,function(s){
  if(typeof s.enabled==='boolean'){box.checked=s.enabled;box.disabled=false;}
  label.textContent=s.state.message;label.dataset.state=s.state.code;
 });
 box.addEventListener('change',()=>runtime.setEnabled(box.checked));
 document.getElementById('restart-auto').addEventListener('click',()=>runtime.restart());
 window.addEventListener('unload',()=>runtime.close());
}());
