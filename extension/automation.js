'use strict';
// The host does the text scanning. This lightweight check only reports state
// and restarts a lost idle task; it never reads Source Text from CEP.
module.exports=function(root,cep,onStatus){
 const path=require('path');let pending=false,queued=null,closed=false;
 const version='4.4.4';
 function hostScript(action){
  const load='if(typeof SevenPasteCommands==="undefined"||SevenPasteCommands.version!=='+JSON.stringify(version)+'){'+
   '$.evalFile(new File('+JSON.stringify(path.join(root,'host','main.jsx'))+'));'+
   '$.evalFile(new File('+JSON.stringify(path.join(root,'host','commands.jsx'))+'));}';
  const toggle=action&&typeof action.enabled==='boolean'?'SevenPasteCommands.setEnabled('+action.enabled+');':'';
  return '(function(){try{'+load+toggle+'return SevenPasteCommands.ensure('+JSON.stringify(root)+','+!!(action&&action.restart)+');}catch(e){return "SEVEMOJI_ERROR:"+e.toString();}}());';
 }
 function send(action){
  if(closed)return;if(pending){if(action)queued=action;return;}pending=true;
  function finish(raw){
   pending=false;if(closed)return;
   try{const s=JSON.parse(raw);if(!s.state||typeof s.state.message!=='string')throw Error('Invalid response');onStatus(s);}
   catch(e){onStatus({state:{code:'error',message:'Could not start auto-conversion. Click Restart auto-convert. '+String(raw||'After Effects did not respond.').replace(/^SEVEMOJI_ERROR:/,'')},error:String(raw||e.message)});}
   if(queued){const next=queued;queued=null;send(next);}
  }
  try{cep.evalScript(hostScript(action),finish);}catch(e){finish('SEVEMOJI_ERROR:'+e.message);}
 }
 const timer=setInterval(()=>send(null),1500);send(null);
 return {restart:()=>send({restart:true}),setEnabled:value=>send({enabled:!!value}),check:()=>send(null),close:()=>{closed=true;clearInterval(timer);}};
};
