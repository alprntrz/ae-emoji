/* Inline color emoji. The original Unicode remains editable in Source Text. */
var Sevemoji=(function(){
var JSON={parse:SevenPaste.jsonParse,stringify:SevenPaste.jsonStringify};
var TAG='SEVEMOJI_EMOJI_V4:',HELP='SEVEMOJI_MEASURE_V4:',MASK='Sevemoji Color Emoji',root=File($.fileName).parent.parent.fsName;
// Use the shared parser loaded by main.jsx so personal aliases stay in sync.
var sf=new File(root+'/host/expression.js');sf.open('r');var expressionCore=sf.read();sf.close();
function byId(c,id){for(var i=1;i<=c.numLayers;i++)if(c.layer(i).id===id)return c.layer(i);return null;}
function source(t){return t.property('ADBE Text Properties').property('ADBE Text Document');}
function children(t){var a=[],c=t.containingComp;for(var i=1;i<=c.numLayers;i++){var e=c.layer(i);if(e.parent===t&&e.comment.indexOf(TAG)===0)a.push(e);}a.sort(function(a,b){return Number(a.comment.substr(TAG.length))-Number(b.comment.substr(TAG.length));});return a;}
function helper(e){return e.containingComp.layer(SevemojiLabels.control(e,'Sevemoji Position').property(1).value);}
var repairSeen={},repairOrder=[];
function maintain(t,automatic){
 var c=t.containingComp,fixes=[],i;SevemojiLabels.upgrade(t);
 for(i=1;i<=c.numLayers;i++){
  var e=c.layer(i),v4=e.comment.indexOf(TAG)===0,v2=e.comment.indexOf('SEVENPASTE_EMOJI_V2:')===0;
  if(e.parent!==t||(!v4&&!v2))continue;
  SevemojiLabels.upgrade(e);var control=SevemojiLabels.control(e,v4?'Sevemoji Position':'Sevemoji Last Line');if(!control)continue;
  var index=control.property(1).value;if(index<1||index>c.numLayers)continue;var h=c.layer(index);
  if(h.comment.indexOf(v4?HELP:'SEVENPASTE_MEASURE_V2:')!==0)continue;SevemojiLabels.upgrade(h);
  if(h.parent!==t||h.startTime!==0||h.inPoint!==0||h.outPoint!==c.duration)fixes.push({e:e,h:h,control:control,clone:h.parent!==t});
 }
 if(!fixes.length)return 0;
 var signature=(app.project.file?app.project.file.fsName:'unsaved')+'|'+c.id+'|'+t.id;for(i=0;i<fixes.length;i++){var q=fixes[i];signature+='|'+q.e.id+','+q.h.id+','+(q.h.parent?q.h.parent.id:0)+','+q.h.startTime+','+q.h.inPoint+','+q.h.outPoint;}
 // Let Undo restore a split without the idle task immediately repairing it again.
 if(automatic&&repairSeen[signature])return 0;if(automatic){repairSeen[signature]=true;repairOrder.push(signature);if(repairOrder.length>256)delete repairSeen[repairOrder.shift()];}
 app.beginUndoGroup('Sevemoji: repair split links');
 try{for(i=0;i<fixes.length;i++){
  var q=fixes[i],h=q.h,wasLocked=q.e.locked;q.e.locked=false;
  try{if(q.clone){h=h.duplicate();h.locked=false;h.parent=t;h.name='_Sevemoji measure '+t.id;}
   h.locked=false;h.startTime=0;h.inPoint=0;h.outPoint=c.duration;h.enabled=false;h.guideLayer=true;h.shy=true;h.locked=true;
   q.control.property(1).setValue(h.index);
  }finally{q.e.locked=wasLocked;}
 }}finally{app.endUndoGroup();}return fixes.length;
}
var measurementCache={},measurementOrder=[],nativeMetrics={},nativeMetricOrder=[];
function layoutSignature(t,d){var r=t.sourceRectAtTime(t.containingComp.time,false),s=d.text+'|'+[r.left,r.top,r.width,r.height,d.font,d.fontSize,d.tracking,d.leading,d.autoLeading,d.justification,d.horizontalScale,d.verticalScale,d.baselineShift].join('|');if(d.boxText)s+='|'+d.boxTextSize.join(',')+'|'+d.boxTextPos.join(',');return s;}
// Reproduce the pre-4.4 native fallback glyph bounds. Measuring a mixed-style
// Apple Color Emoji range returns its larger em square instead of the glyph.
// A short probe inherits the adjacent body style, including its baseline shift.
// Fit the hidden placeholder to those native bounds so PNG and box agree.
function alignBaselines(t,links,d){
 var hits=SevemojiCore.scan(d.text);if(!hits.length||hits.length!==links.length)return d;
 var c=t.containingComp,probe=null,selected=c.selectedLayers,changed=false,occupied={};
 for(var i=0;i<hits.length;i++)for(var j=hits[i].index;j<hits[i].end;j++)occupied[j]=true;
 try{for(var i=0;i<hits.length;i++){
  var hit=hits[i],body=-1,first=0,last=d.text.length;
  try{var line=d.composedLineCharacterIndexesAt(hit.index);first=line.start;last=line.end;}catch(uncomposed){}
  for(var j=hit.index-1;j>=first;j--)if(!occupied[j]&&!/\s/.test(d.text.charAt(j))){body=j;break;}
  if(body<0)for(var j=hit.end;j<last;j++)if(!occupied[j]&&!/\s/.test(d.text.charAt(j))){body=j;break;}
  if(body<0)continue;
  var style=d.characterRange(body,body+1),key=hit.emoji+'|'+[style.font,style.fontSize,style.horizontalScale,style.verticalScale,style.baselineShift,style.fauxBold,style.fauxItalic].join('|'),r=nativeMetrics[key];
  if(!r){
   if(!probe){probe=c.layers.addText('');probe.name='_Sevemoji native metrics';probe.parent=t;probe.enabled=false;probe.guideLayer=true;probe.shy=true;selector(probe,'Sevemoji Measurement','ADBE Text Scale 3D',[0,0,100],'textIndex>1?0:100;');}
   source(probe).expression='var s=parent.text.sourceText;s.getStyleAt('+body+',time).setText('+JSON.stringify('M'+hit.emoji)+');';
   r=probe.sourceRectAtTime(c.time,false);nativeMetrics[key]=r;nativeMetricOrder.push(key);if(nativeMetricOrder.length>256)delete nativeMetrics[nativeMetricOrder.shift()];
  }
  if(r.height<0.01||r.width<0.01)continue;
  var range=d.characterRange(hit.index,hit.end),size=Number(style.fontSize),vertical=r.height/size,horizontal=r.width/(size*hit.glyphs),baseline=-r.top-r.height;
  if(Math.abs(Number(range.fontSize)-size)>0.01||Math.abs(Number(range.verticalScale)-vertical)>0.00001||Math.abs(Number(range.horizontalScale)-horizontal)>0.00001||Math.abs(Number(range.baselineShift)-baseline)>0.001){range.fontSize=size;range.verticalScale=vertical;range.horizontalScale=horizontal;range.baselineShift=baseline;changed=true;}
 }}finally{if(probe)probe.remove();for(var i=0;i<selected.length;i++)try{selected[i].selected=true;}catch(ignore){}}
 if(changed){source(t).setValue(d);d=source(t).value;}
 for(var i=0;i<links.length;i++){var h=helper(links[i]);h.locked=false;source(h).expression='';source(h).setValue(d);h.locked=true;}
 return d;
}
function refreshMeasurements(t){
 var prop=source(t);if(t.locked||prop.numKeys||prop.expressionEnabled)return 0;var links=children(t);if(!links.length)return 0;var d=prop.value,c=t.containingComp,k=c.id+'|'+t.id,now=new Date().getTime(),previous=measurementCache[k];
 if(previous&&previous.raw===d.text&&now-previous.time<400)return 0;
 var sig=layoutSignature(t,d);
 if(previous&&(previous.signature===sig||previous.inputSignature===sig)){previous.time=now;return 0;}
 if(!previous){measurementOrder.push(k);if(measurementOrder.length>256)delete measurementCache[measurementOrder.shift()];}
 app.beginUndoGroup('Sevemoji: refresh text layout');var rendering=app.disableRendering;app.disableRendering=true;
 try{for(var i=0;i<links.length;i++){var h=helper(links[i]);h.locked=false;source(h).expression='';source(h).setValue(d);h.locked=true;}d=alignBaselines(t,links,d);ensureMask(t,SevemojiCore.scan(d.text).length);measurementCache[k]={raw:d.text,signature:layoutSignature(t,d),inputSignature:sig,time:now};}finally{app.disableRendering=rendering;app.endUndoGroup();}return links.length;
}
function repairLinks(){var n=0;for(var i=1;i<=app.project.numItems;i++){var c=app.project.item(i);if(!(c instanceof CompItem))continue;var texts=[];for(var j=1;j<=c.numLayers;j++){var t=c.layer(j);if(t instanceof TextLayer&&!/^SEVEMOJI_MEASURE_|^SEVENPASTE_MEASURE_/.test(t.comment))texts.push(t);}for(var j=0;j<texts.length;j++){n+=maintain(texts[j]);n+=refreshMeasurements(texts[j]);}}return n;}
function read(e){var m=helper(e).property('ADBE Marker'),s='';for(var i=1;i<=m.numKeys;i++)s+=m.keyValue(i).comment;return JSON.parse(s);}
function write(h,d){h.locked=false;var m=h.property('ADBE Marker'),s=JSON.stringify(d);while(m.numKeys)m.removeKey(m.numKeys);for(var i=0;i<s.length;i+=16000)m.setValueAtTime(i/16000*h.containingComp.frameDuration,new MarkerValue(s.substr(i,16000)));h.locked=true;}
function fx(l,type,name,v){var f=l.property('ADBE Effect Parade').addProperty(type);f.name=name;f.property(1).setValue(v);}
function selector(l,name,kind,amount,expression){var anim=l.property('ADBE Text Properties').property('ADBE Text Animators'),old=anim.property(name);if(old)old.remove();var a=anim.addProperty('ADBE Text Animator');a.name=name;a.property('ADBE Text Animator Properties').addProperty(kind).setValue(amount);var s=a.property('ADBE Text Selectors').addProperty('ADBE Text Expressible Selector');s.property('ADBE Text Expressible Amount').expression=expression;}
function ensureMask(t,count){var present=t.property('ADBE Text Properties').property('ADBE Text Animators').property(MASK);if(present){var current=present.property('ADBE Text Selectors').property(1).property('ADBE Text Expressible Amount');if(current.expression.indexOf('// Sevemoji mask 4.4b')>=0)return;}var script=expressionCore+'\n// Sevemoji mask 4.4b\nSevemojiCore.isEmojiIndex(text.sourceText.toString(),textIndex)?100:0;';selector(t,MASK,'ADBE Text Opacity',0.001,script);}
function importAsset(a){var f=new File(a.path);if(!f.exists)throw Error('The emoji file was not found.');for(var i=1;i<=app.project.numItems;i++){var it=app.project.item(i);if(it instanceof FootageItem&&it.file&&it.file.fsName===f.fsName)return it;}var it=app.project.importFile(new ImportOptions(f));it.name='Sevemoji · '+a.emoji;return it;}
function configure(e,h,t,ordinal){
 h.locked=false;var td=source(t).value;source(h).setValue(td);source(h).expression='';
 selector(h,'Sevemoji Measurement','ADBE Text Scale 3D',[0,0,100],expressionCore+'\nvar p=SevemojiCore.locate(text.sourceText.toString(),'+ordinal+');textIndex>=p.start&&textIndex<=p.end?0:100;');
 h.locked=true;e.comment=TAG+ordinal;
 var tr=e.property('ADBE Transform Group');tr.property('ADBE Anchor Point').expression='[thisLayer.source.width/2,thisLayer.source.height/2]';
 tr.property('ADBE Position').expression='var r=effect("Sevemoji Position")(1).sourceRectAtTime(time,false);[r.left+r.width/2,r.top+r.height/2+effect("Emoji Vertical Offset")(1)];';
 tr.property('ADBE Scale').expression='var r=effect("Sevemoji Position")(1).sourceRectAtTime(time,false);var z=Math.min(r.width/thisLayer.source.width,r.height/thisLayer.source.height)*effect("Emoji Size (%)")(1);[z,z];';
 tr.property('ADBE Opacity').expression=expressionCore+'\nvar p=SevemojiCore.locate(parent.text.sourceText.toString(),'+ordinal+');p.start<0||!parent.active?0:parent.transform.opacity;';
}
function plan(t,raw){var edits=SevemojiCore.codes(raw),expanded=raw;for(var i=edits.length-1;i>=0;i--)expanded=expanded.substring(0,edits[i].index)+edits[i].emoji+expanded.substring(edits[i].end);return {codes:edits,text:expanded};}
function sync(t,assets,expected,options){
 if(!(t instanceof TextLayer)||t.locked||t.threeDLayer)throw Error('Use an unlocked 2D text layer.');var prop=source(t),original=prop.value,raw=original.text;
 if(app.project.expressionEngine!=='javascript-1.0')throw Error('Choose JavaScript in Project Settings > Expressions.');if(prop.numKeys||prop.expressionEnabled)throw Error('Layers with Source Text keyframes or expressions are not converted automatically.');if(expected!==undefined&&raw!==expected)throw Error('The text changed.');
 maintain(t);var prepared=plan(t,raw),codes=prepared.codes,expanded=prepared.text,found=SevemojiCore.scan(expanded),old=children(t),made=[],hMade=[],configureLater=[],createdMask=false;
 if(!found.length)return {count:0};
 for(var i=0;i<found.length;i++)if(!assets[SevemojiCore.key(found[i].emoji)])throw Error('Preparing the emoji.');
 var originalSelection=options&&options.preserveSelection?t.containingComp.selectedLayers:null;
 app.beginUndoGroup('Sevemoji');var previousRendering=app.disableRendering;app.disableRendering=true;
 try{
  var d=prop.value;for(var i=codes.length-1;i>=0;i--)d.characterRange(codes[i].index,codes[i].end).text=codes[i].emoji;
  // Only the emoji characters receive the system emoji font. Body formatting stays intact.
  for(var i=0;i<found.length;i++){var r=d.characterRange(found[i].index,found[i].end);r.font='AppleColorEmoji';r.applyFill=true;r.applyStroke=false;if(found[i].glyphs>1)r.horizontalScale=1/found[i].glyphs;}
  prop.setValue(d);
  for(var i=0;i<found.length;i++){
   var a=assets[SevemojiCore.key(found[i].emoji)],e=old[i],h=e?helper(e):null,f=importAsset(a);
   if(!e){h=d.boxText?t.containingComp.layers.addBoxText(d.boxTextSize):t.containingComp.layers.addText('');hMade.push(h);h.name='_Sevemoji measure '+(i+1);h.comment=HELP+i;h.parent=t;h.enabled=false;h.guideLayer=true;h.shy=true;e=t.containingComp.layers.add(f);made.push(e);e.parent=t;fx(e,'ADBE Layer Control','Sevemoji Position',h.index);fx(e,'ADBE Slider Control','Emoji Size (%)',SevemojiSettings.current().scale);fx(e,'ADBE Slider Control','Emoji Vertical Offset',SevemojiSettings.current().y);}else e.replaceSource(f,false);
   h.locked=false;e.name='Emoji · '+found[i].emoji;if(!old[i]){e.inPoint=t.inPoint;e.outPoint=t.outPoint;}h.startTime=0;h.inPoint=0;h.outPoint=t.containingComp.duration;
   if(!old[i])configureLater.push({e:e,h:h,ordinal:i});else {source(h).expression='';source(h).setValue(source(t).value);h.locked=true;}write(h,{version:4,ordinal:i,emoji:found[i].emoji,png:a.png,tail:!expanded.substring(found[i].end).replace(/\s/g,'')});
  }
  for(var i=0;i<configureLater.length;i++){var q=configureLater[i];configure(q.e,q.h,t,q.ordinal);}
  ensureMask(t,found.length);createdMask=true;
  // Migrate a previously attached SevenPaste tail after successful inline conversion.
  for(var k=t.containingComp.numLayers;k>=1;k--){var legacy=t.containingComp.layer(k);if(legacy.parent===t&&legacy.comment.indexOf('SEVENPASTE_EMOJI_V2:')===0){var legacyH=t.containingComp.layer(SevemojiLabels.control(legacy,'Sevemoji Last Line').property(1).value);legacy.remove();legacyH.locked=false;legacyH.remove();k=Math.min(k,t.containingComp.numLayers+1);}}
  for(var i=old.length-1;i>=found.length;i--){var h=helper(old[i]);h.locked=false;old[i].remove();h.remove();}
  alignBaselines(t,children(t),source(t).value);
  var selected=t.containingComp.selectedLayers;for(var i=0;i<selected.length;i++)selected[i].selected=false;
  if(originalSelection){for(var i=0;i<originalSelection.length;i++)try{originalSelection[i].selected=true;}catch(ignore){}}else t.selected=true;
  t.containingComp.hideShyLayers=true;
  return {count:found.length,text:expanded};
 }catch(err){prop.setValue(original);for(var i=0;i<made.length;i++)try{made[i].remove();}catch(ignore){}for(var i=0;i<hMade.length;i++)try{hMade[i].locked=false;hMade[i].remove();}catch(ignore){}throw err;}finally{app.disableRendering=previousRendering;app.endUndoGroup();}
}
function scan(){var a=[];for(var i=1;i<=app.project.numItems;i++){var c=app.project.item(i);if(!(c instanceof CompItem))continue;for(var j=1;j<=c.numLayers;j++){var e=c.layer(j);if(e.comment.indexOf(TAG)!==0)continue;var f=e.source.file;a.push({version:4,compId:c.id,emojiLayerId:e.id,id:e.id,path:f?f.fsName:null,missing:e.source.footageMissing||!f||!f.exists});}}return a;}
function resolve(p){var c=app.project.itemByID(p.compId),e=c?byId(c,p.emojiLayerId):null;if(!e||e.comment.indexOf(TAG)!==0)throw Error('Select the emoji layer again.');return e;}
function info(e){var d=read(e),t=e.parent,td=source(t).value,hits=SevemojiCore.scan(td.text),index=0;for(var i=0;i<hits.length;i++){if(hits[i].index!==index)break;index=hits[i].end;}var body=index<td.text.length?td.characterRange(index,index+1):td,font=body.font;if(!font||font==='AppleColorEmoji')font='Arial-BoldMT';var rgb=body.fillColor,color='#';for(var i=0;i<3;i++)color+=('0'+Math.round(rgb[i]*255).toString(16)).slice(-2);return {version:4,id:e.id,compId:t.containingComp.id,emojiLayerId:e.id,textLayerId:t.id,projectPath:app.project.file.fsName,settings:{text:td.text.replace(/\r/g,'\n'),emoji:d.emoji,font:font,size:body.fontSize,color:color,align:td.justification===ParagraphJustification.LEFT_JUSTIFY?'left':td.justification===ParagraphJustification.RIGHT_JUSTIFY?'right':'center'}};}
function load(){var c=app.project.activeItem;if(!(c instanceof CompItem)||c.selectedLayers.length!==1)return null;var l=c.selectedLayers[0];if(l.comment.indexOf(TAG)===0)return info(l);var a=l instanceof TextLayer?children(l):[];return a.length?info(a[a.length-1]):null;}
function add(p){
 if(!app.project.file||app.project.file.fsName!==p.projectPath)throw Error('The project changed.');var c=app.project.itemByID(p.compId);if(!(c instanceof CompItem))throw Error('Open a composition first.');var s=p.settings,raw=String(p.text||'').replace(/\r\n/g,'\r').replace(/\n/g,'\r');if(!SevemojiCore.scan(raw).length)throw Error('Add at least one emoji.');if(raw.length>6000)throw Error('Use up to 6,000 characters.');var t=null;
 app.beginUndoGroup('Sevemoji: add text and emojis');try{t=c.layers.addText(raw);t.name='Text · '+raw.replace(/[\r\n]/g,' ').substr(0,30);var d=source(t).value;d.resetCharStyle();d.resetParagraphStyle();d.font=s.font;d.fontSize=s.size;d.applyFill=true;d.applyStroke=false;d.fillColor=[parseInt(s.color.substr(1,2),16)/255,parseInt(s.color.substr(3,2),16)/255,parseInt(s.color.substr(5,2),16)/255];d.autoLeading=true;d.tracking=0;d.justification=s.align==='left'?ParagraphJustification.LEFT_JUSTIFY:s.align==='right'?ParagraphJustification.RIGHT_JUSTIFY:ParagraphJustification.CENTER_JUSTIFY;source(t).setValue(d);sync(t,p.assets,raw);var r=t.sourceRectAtTime(c.time,false);t.transform.anchorPoint.setValue([r.left+r.width/2,r.top+r.height/2]);t.transform.position.setValue([c.width/2,c.height/2]);var list=children(t);return info(list[list.length-1]);}catch(err){if(t){var linked=[];for(var i=1;i<=c.numLayers;i++)if(c.layer(i).parent===t)linked.push(c.layer(i));for(var i=0;i<linked.length;i++){linked[i].locked=false;linked[i].remove();}t.remove();}throw err;}finally{app.endUndoGroup();}
}
function call(action,p){try{if(typeof p==='string')p=JSON.parse(p);p=p||{};var r;if(action==='add4')r=add(p);else if(action==='repairLinks4')r=repairLinks();else if(action==='load4')r=load();else if(action==='scan4')r=scan();else if(action==='backup4')r=read(resolve(p));else if(action==='relink4'){if(!app.project.file||app.project.file.fsName!==p.projectPath)throw Error('The project changed.');resolve(p).source.replace(new File(p.path));r=true;}else if(action==='emoji4'){
 var e=resolve(p),t=e.parent,d=source(t).value,a=SevemojiCore.scan(d.text),n=Number(e.comment.substr(TAG.length));if(!a[n])throw Error('The emoji has been removed from the text.');var replacement=SevemojiCore.scan(p.settings.emoji);if(replacement.length!==1)throw Error('Choose one emoji for this layer.');if(!app.project.file||app.project.file.fsName!==p.projectPath)throw Error('The project changed.');var assets={},links=children(t);for(var j=0;j<links.length;j++){var data=read(links[j]);assets[SevemojiCore.key(data.emoji)]={emoji:data.emoji,png:data.png,path:links[j].source.file.fsName};}assets[SevemojiCore.key(p.settings.emoji)]={emoji:p.settings.emoji,png:p.png,path:p.path};var original=source(t).value;app.beginUndoGroup('Sevemoji: replace emoji');try{d.characterRange(a[n].index,a[n].end).text=p.settings.emoji;source(t).setValue(d);sync(t,assets,d.text);r=info(children(t)[n]);}catch(err){source(t).setValue(original);throw err;}finally{app.endUndoGroup();}
 }else throw Error('Unknown action.');return JSON.stringify({ok:true,result:r});}catch(e){return JSON.stringify({ok:false,error:e.toString()});}}
return {refreshMeasurements:refreshMeasurements,maintain:maintain,repairLinks:repairLinks,sync:sync,plan:plan,scan:scan,read:read,children:children,call:call,root:root};
}());

$.global.Sevemoji=Sevemoji;
