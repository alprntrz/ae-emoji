/* Native idle checks leave selected text alone while the Type tool is active. */
if(typeof SevenPasteCommands!=='undefined')try{SevenPasteCommands.stop();}catch(ignore){}
var SevenPasteCommands=(function(){
var JSON={parse:SevenPaste.jsonParse,stringify:SevenPaste.jsonStringify};
var task=null,root='',running=false,seen={},stable={},order=[],lastError='',cache={},lastRepair=0;
var interval=120,scanComp='',scanCount=-1,scanIds=[],scanCursor=0,scanRefresh=0,knownIds={},pending=[],waitingForText=false;
var converted=0,lastConvertMs=0,failed={},failedOrder=[],lastTick=0,lastScheduled=0;
function fileAccess(){try{return app.preferences.getPrefAsLong('Main Pref Section','Pref_SCRIPTING_FILE_NETWORK_SECURITY')===1;}catch(e){return null;}}
function editingText(){var c=app.project&&app.project.activeItem;if(!(c instanceof CompItem))return false;var type=app.project.toolType===ToolType.Tool_TextH||app.project.toolType===ToolType.Tool_TextV;if(!type)return false;var a=c.selectedLayers;for(var i=0;i<a.length;i++)if(a[i] instanceof TextLayer)return true;return false;}
function state(){
 if(!enabled())return {code:'disabled',message:'Auto-conversion is off.'};
 if(!running)return {code:'stopped',message:'Auto-conversion is stopped. Click Restart auto-convert.'};
 if(fileAccess()===false)return {code:'file-access',message:'In After Effects > Settings > Scripting & Expressions, enable Allow Scripts to Write Files and Access Network.'};
 if(!app.project||!app.project.file)return {code:'save-project',message:'Save your After Effects project first (Command+S).'};
 if(app.project.renderQueue.rendering)return {code:'rendering',message:'Auto-conversion resumes after rendering.'};
 var c=app.project.activeItem;if(!(c instanceof CompItem))return {code:'open-comp',message:'Open a composition to use /s :1 in a text layer.'};
 if(editingText())return {code:'finish-text',message:'Finish typing with Command+Enter, then press V. Conversion pauses while the Type tool is active.'};
 if(app.project.expressionEngine!=='javascript-1.0')return {code:'expressions',message:'Choose JavaScript in File > Project Settings > Expressions.'};
 var a=c.selectedLayers;for(var i=0;i<a.length;i++)if(a[i] instanceof TextLayer){var p=a[i].property('Source Text');if(a[i].locked||a[i].threeDLayer||p.numKeys||p.expressionEnabled)return {code:'layer',message:'Use an unlocked 2D text layer without Source Text keyframes or an expression.'};}
 if(lastError)return {code:'error',message:lastError};
 return {code:'ready',message:'Ready. Type Hello /s :1, finish with Command+Enter, then press V. Plain :1 stays text.'};
}
function schedule(){try{task=app.scheduleTask('SevenPasteCommands.tick()',interval,false);lastScheduled=new Date().getTime();}catch(e){running=false;task=null;lastError='Could not start auto-conversion: '+e.toString();}}
function start(path){root=path;if(running)return 'already-running';running=true;lastRepair=new Date().getTime();schedule();return running?'started':'failed';}
function ensure(path,force){var now=new Date().getTime();if(force||(running&&now-Math.max(lastTick,lastScheduled)>5000)){stop();lastError='';}start(path);return status();}
function status(){return JSON.stringify({version:'4.4.3',running:running,enabled:enabled(),error:lastError,interval:interval,waitingForText:editingText(),converted:converted,lastConvertMs:lastConvertMs,fileAccess:fileAccess(),state:state(),aeVersion:app.version,lastTick:lastTick});}
function enabled(){return !app.settings.haveSetting('SevenPaste','CommandsEnabled')||app.settings.getSetting('SevenPaste','CommandsEnabled')!=='false';}
function read(f){f.encoding='UTF-8';if(!f.open('r'))throw Error('The file could not be read.');var s=f.read();f.close();return JSON.parse(s);}
function write(f,d){f.encoding='UTF-8';if(f.open('w')){f.write(JSON.stringify(d));f.close();}}
function cacheDir(){var f=new Folder(Folder.userData.fsName+'/Sevemoji/cache');if(!f.exists)f.create();return f;}
function asset(emoji){var k=SevemojiCore.key(emoji);if(!cache[k]){
 var entry=null;for(var i=0;i<SevemojiCore.catalog.length;i++)if(SevemojiCore.catalog[i].emoji===emoji||SevemojiCore.catalog[i].emoji.replace(/\uFE0F/g,'')===emoji.replace(/\uFE0F/g,'')){entry=SevemojiCore.catalog[i];break;}
 var json=entry?new File(root+'/assets/'+entry.id+'.json'):new File(cacheDir().fsName+'/'+k+'.json');
 if(!json.exists){var req=new File(cacheDir().fsName+'/'+k+'.request.json');if(new File(req.fsName+'.failed').exists){lastError='Could not prepare this emoji: '+emoji;return null;}if(!req.exists)write(req,{emoji:emoji,key:k});return null;}
 cache[k]=read(json);cache[k].sourcePath=entry?root+'/assets/'+entry.id+'.png':cacheDir().fsName+'/'+k+'.png';
 }
 var a=cache[k],dir=new Folder(app.project.file.parent.fsName+'/Sevemoji Assets');if(!dir.exists&&!dir.create())throw Error('Could not create the Sevemoji Assets folder.');
 var src=new File(a.sourcePath),dest=new File(dir.fsName+'/'+a.filename);if((!dest.exists||dest.length!==src.length)&&!src.copy(dest.fsName))throw Error('Could not save the emoji next to the project.');
 return {emoji:emoji,png:a.png,path:dest.fsName};
}
function recordUsage(found){try{var f=new File(cacheDir().parent.fsName+'/recent.json'),items=f.exists?read(f).items:[];for(var j=0;j<found.length;j++){var emoji=found[j].emoji,next=[emoji];for(var i=0;i<items.length&&next.length<24;i++)if(items[i]!==emoji)next.push(items[i]);items=next;}write(f,{items:items,updated:new Date().getTime()});}catch(ignore){}}
function mark(k,v){if(!seen.hasOwnProperty(k))order.push(k);seen[k]=v;if(order.length>256){var expired=order.shift();delete seen[expired];delete stable[expired];}}
function process(c,t){if(!(t instanceof TextLayer)||t.locked||t.threeDLayer||/^SEVENPASTE_MEASURE_|^SEVEMOJI_MEASURE_/.test(t.comment))return;
 Sevemoji.maintain(t,true);var prop=t.property('Source Text');if(prop.numKeys||prop.expressionEnabled)return;
 var raw=prop.value.text,key=app.project.file.fsName+'|'+c.id+'|'+t.id;if(seen[key]===raw||stable[key]===raw){Sevemoji.refreshMeasurements(t);return;}
 var expanded=Sevemoji.plan(t,raw).text,found=SevemojiCore.scan(expanded),existing=Sevemoji.children(t);if(!found.length){mark(key,raw);return;}
 var same=raw===expanded&&existing.length===found.length;
 if(same)for(var i=0;i<existing.length;i++){var d=Sevemoji.read(existing[i]);if(d.emoji!==found[i].emoji){same=false;break;}}
 if(same){Sevemoji.refreshMeasurements(t);if(!seen.hasOwnProperty(key))mark(key,null);stable[key]=raw;return;}
 var failure=failed[key];if(failure&&failure.raw===raw&&new Date().getTime()-failure.time<2000)return;
 var assets={};for(var i=0;i<found.length;i++){var a=asset(found[i].emoji);if(!a)return;assets[SevemojiCore.key(found[i].emoji)]=a;}
 var started=new Date().getTime();try{Sevemoji.sync(t,assets,raw,{preserveSelection:true});mark(key,raw);stable[key]=prop.value.text;delete failed[key];recordUsage(found);converted++;lastConvertMs=new Date().getTime()-started;lastError='';}catch(e){lastError=e.toString();if(!failed.hasOwnProperty(key))failedOrder.push(key);failed[key]={raw:raw,time:new Date().getTime()};if(failedOrder.length>256)delete failed[failedOrder.shift()];}
}
function invalidate(){seen={};stable={};order=[];failed={};failedOrder=[];scanCount=-1;}
function eligible(t){return t instanceof TextLayer&&!t.locked&&!t.threeDLayer&&!/^SEVENPASTE_MEASURE_|^SEVEMOJI_MEASURE_/.test(t.comment);}
function byId(c,id){for(var j=1;j<=c.numLayers;j++)if(c.layer(j).id===id)return c.layer(j);return null;}
function refresh(c){
 var key=app.project.file.fsName+'|'+c.id;if(scanComp===key&&scanCount===c.numLayers&&new Date().getTime()-scanRefresh<1000)return;scanRefresh=new Date().getTime();
 if(scanComp!==key){knownIds={};pending=[];scanCursor=0;}
 var ids=[],next={};for(var j=1;j<=c.numLayers;j++){var l=c.layer(j);if(!eligible(l))continue;ids.push(l.id);next[l.id]=true;if(!knownIds[l.id])pending.push(l.id);}
 scanComp=key;scanCount=c.numLayers;scanIds=ids;knownIds=next;if(scanCursor>=ids.length)scanCursor=0;
}
function tick(){task=null;lastTick=new Date().getTime();waitingForText=false;try{
 if(!running||!app.project||!app.project.file||app.project.renderQueue.rendering||!enabled()||fileAccess()===false)return;
 var c=app.project.activeItem;if(!(c instanceof CompItem))return;
 var sel=c.selectedLayers,typeTool=app.project.toolType===ToolType.Tool_TextH||app.project.toolType===ToolType.Tool_TextV;
 waitingForText=false;
 // Reading live Source Text can move AE's insertion point. A completed, unselected
 // TikTokText layer is safe to inspect even if the Type tool remains selected.
 if(typeTool)for(var i=0;i<sel.length;i++)if(sel[i] instanceof TextLayer){waitingForText=true;return;}
 if(SevemojiSettings.refresh(false))invalidate();
 refresh(c);var queue=[],queued={};
 function enqueue(id){if(!queued[id]){queue.push(id);queued[id]=true;}}
 for(var i=0;i<sel.length&&i<10;i++){if(eligible(sel[i]))enqueue(sel[i].id);else if(sel[i].parent&&eligible(sel[i].parent))enqueue(sel[i].parent.id);}
 while(pending.length&&queue.length<10)enqueue(pending.shift());
 // Scan text layers, not solids/shapes/helpers, in bounded batches.
 for(var i=0;i<8&&i<scanIds.length;i++){if(scanCursor>=scanIds.length)scanCursor=0;enqueue(scanIds[scanCursor++]);}
 var started=new Date().getTime();for(var i=0;i<queue.length;i++){
  var l=byId(c,queue[i]);if(l)process(c,l);else scanCount=-1;
  if(new Date().getTime()-started>25){for(var j=queue.length-1;j>i;j--)pending.unshift(queue[j]);break;}
 }
 if(new Date().getTime()-lastRepair>10000){lastRepair=new Date().getTime();var cards=Sevemoji.scan();for(var n=0;n<cards.length;n++)if(cards[n].missing){var e=app.project.itemByID(cards[n].compId),l=byId(e,cards[n].emojiLayerId);if(l){var d=Sevemoji.read(l),a=asset(d.emoji);if(a)l.source.replace(new File(a.path));}}}
 }catch(e){lastError=e.toString();}finally{if(running)schedule();}}
function stop(){running=false;if(task!==null)try{app.cancelTask(task);}catch(ignore){}task=null;}
return {version:'4.4.3',start:start,ensure:ensure,stop:stop,tick:tick,process:process,asset:asset,invalidate:invalidate,
 setEnabled:function(v){app.settings.saveSetting('SevenPaste','CommandsEnabled',v?'true':'false');return v;},status:status};
}());

$.global.SevenPasteCommands=SevenPasteCommands;
