/* SevenPaste: project-local media and recovery data stored in the AEP. */
var SevenPaste = (function () {
    var TAG = 'SEVENPASTE_V1:', DATA = 'SEVENPASTE_DATA_V1', IMAGE = 'SEVENPASTE_IMAGE_V1';
    function stringify(v) {
        if (v === null || v === undefined) return 'null';
        if (typeof v === 'string') return '"' + v.replace(/[\\"\u0000-\u001f\u007f-\uffff]/g, function(c) {
            return '\\u' + ('0000' + c.charCodeAt(0).toString(16)).slice(-4);
        }) + '"';
        if (typeof v === 'number') return isFinite(v) ? String(v) : 'null';
        if (typeof v === 'boolean') return String(v);
        var a = [], k;
        if (v instanceof Array) { for(k=0;k<v.length;k++) a.push(stringify(v[k])); return '['+a.join(',')+']'; }
        for(k in v) if(v.hasOwnProperty(k)) a.push(stringify(k)+':'+stringify(v[k]));
        return '{'+a.join(',')+'}';
    }
    function parse(s) {
        // Validate JSON grammar before evaluating; input never becomes a JSX program.
        if (!/^[\],:{}\s]*$/.test(s.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@')
            .replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']')
            .replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) throw Error('Invalid data.');
        return eval('('+s+')');
    }
    function item(id) {
        for(var i=1;i<=app.project.numItems;i++) if(app.project.item(i).id===id) return app.project.item(i);
        return null;
    }
    function context() {
        var f=app.project.file, c=app.project.activeItem;
        return {projectPath:f?f.fsName:null, compId:c instanceof CompItem?c.id:null,
            compWidth:c instanceof CompItem?c.width:null};
    }
    function checkProject(p) {
        var ctx=context();
        if(!ctx.projectPath) throw Error('Save your After Effects project (⌘S), then try again.');
        if(ctx.projectPath!==p.projectPath) throw Error('The active project changed. Try again.');
    }
    function cardData(c, includePNG) {
        var raw='', data=null;
        for(var i=1;i<=c.numLayers;i++) if(c.layer(i).comment===DATA) {
            var markers=c.layer(i).property('ADBE Marker');
            for(var j=1;j<=markers.numKeys;j++)raw+=markers.keyValue(j).comment;
        }
        if(!raw) throw Error('Recovery data was not found.');
        data=parse(raw);
        if(!includePNG) delete data.png;
        return data;
    }
    function writeData(c,d) {
        var raw=stringify(d), backup=null, i, l;
        try {
            backup=c.layers.addShape();backup.name='_Sevemoji recovery';
            backup.enabled=false;backup.guideLayer=true;backup.shy=true;backup.comment=DATA;
            for(i=0;i<raw.length;i+=16000) {
                backup.property('ADBE Marker').setValueAtTime((i/16000)*c.frameDuration,new MarkerValue(raw.substr(i,16000)));
            }
            backup.locked=true;
        } catch(e) { if(backup)backup.remove();throw e; }
        // New copies exist before replacing older recovery records.
        for(i=c.numLayers;i>=1;i--) {
            l=c.layer(i);
            if(l.comment===DATA&&l!==backup){l.locked=false;l.remove();}
        }
        c.hideShyLayers=true;
    }
    function imageLayer(c) {
        for(var i=1;i<=c.numLayers;i++) if(c.layer(i).comment===IMAGE) return c.layer(i);
        throw Error('The image layer was not found.');
    }
    function folder() {
        for(var i=1;i<=app.project.numItems;i++) {
            var f=app.project.item(i);if(f instanceof FolderItem&&f.comment==='SEVENPASTE_FOLDER_V1')return f;
        }
        var f=app.project.items.addFolder('Sevemoji');f.comment='SEVENPASTE_FOLDER_V1';return f;
    }
    function selected() {
        var active=app.project.activeItem,c=null;
        if(active instanceof CompItem) {
            if(active.comment.indexOf(TAG)===0)c=active;
            else if(active.selectedLayers.length===1&&active.selectedLayers[0].source instanceof CompItem
                &&active.selectedLayers[0].source.comment.indexOf(TAG)===0)c=active.selectedLayers[0].source;
        }
        if(!c)throw Error('Select a Sevemoji layer in the timeline.');
        return c;
    }
    function add(p, update) {
        checkProject(p);
        var parent=item(p.compId),c=update?item(p.cardId):null, group=folder(), f=new File(p.path);
        if(!(parent instanceof CompItem))throw Error('Open a composition.');
        if(update&&(!(c instanceof CompItem)||c.comment!==TAG+p.id))throw Error('The layer being edited no longer exists.');
        if(!f.exists)throw Error('The image could not be saved.');
        if(!p.png||p.png.indexOf('iVBORw0KGgo')!==0||p.png.length>4000000)throw Error('Invalid or oversized PNG.');
        if(p.logicalWidth<4||p.logicalHeight<4||p.logicalWidth>15000||p.logicalHeight>15000)throw Error('Invalid image dimensions.');
        var footage=null, outer=null, created=false;
        try {
            footage=app.project.importFile(new ImportOptions(f));
            footage.parentFolder=group;footage.comment=TAG+p.id;footage.name='Sevemoji · '+p.id.slice(-6);
            if(!update){
                c=app.project.items.addComp('Text · '+p.settings.text.replace(/[\r\n]/g,' ').substr(0,35),p.logicalWidth,p.logicalHeight,1,parent.duration,parent.frameRate);
                c.parentFolder=group;c.comment=TAG+p.id;created=true;
            }
            var d={version:1,id:p.id,png:p.png,settings:p.settings,width:p.width,height:p.height,
                logicalWidth:p.logicalWidth,logicalHeight:p.logicalHeight};
            writeData(c,d);
            var l,oldFootage=null;
            if(update){
                l=imageLayer(c);oldFootage=l.source;
                var oldW=c.width,oldH=c.height,users=c.usedIn;
                l.replaceSource(footage,false);c.width=p.logicalWidth;c.height=p.logicalHeight;
                // Keep the visual centre stable for ordinary, unanimated instances.
                for(var u=0;u<users.length;u++)for(var n=1;n<=users[u].numLayers;n++) {
                    var instance=users[u].layer(n);
                    if(instance.source===c){
                        var ap=instance.property('ADBE Transform Group').property('ADBE Anchor Point'),av=ap.value;
                        if(ap.numKeys===0&&!ap.expressionEnabled&&Math.abs(av[0]-oldW/2)<0.01&&Math.abs(av[1]-oldH/2)<0.01)
                            ap.setValue(av.length===3?[c.width/2,c.height/2,av[2]]:[c.width/2,c.height/2]);
                    }
                }
            }
            else{l=c.layers.add(footage);l.comment=IMAGE;}
            l.name='Text + emoji';l.property('ADBE Transform Group').property('ADBE Scale').setValue([50,50]);
            l.property('ADBE Transform Group').property('ADBE Anchor Point').setValue([footage.width/2,footage.height/2]);
            l.property('ADBE Transform Group').property('ADBE Position').setValue([c.width/2,c.height/2]);
            if(!update){
                outer=parent.layers.add(c);outer.name=c.name;
                var fit=Math.min(1,parent.width*.92/c.width,parent.height*.92/c.height)*100;
                outer.property('ADBE Transform Group').property('ADBE Scale').setValue([fit,fit]);
                for(var i=1;i<=parent.numLayers;i++)parent.layer(i).selected=false;
                outer.selected=true;
            }
            if(oldFootage&&oldFootage.usedIn.length===0)oldFootage.remove();
            return {cardId:c.id,id:p.id};
        } catch(e) {
            if(created&&c)try{c.remove();}catch(ignore){}
            if(footage&&footage.usedIn.length===0)try{footage.remove();}catch(ignore){}
            throw e;
        }
    }
    function scan() {
        var ctx=context(), result=[];
        if(!ctx.projectPath)return {projectPath:null,cards:[]};
        for(var i=1;i<=app.project.numItems;i++) {
            var c=app.project.item(i);
            if(c instanceof CompItem&&c.comment.indexOf(TAG)===0) {
                var l=imageLayer(c),f=l.source.file;
                result.push({cardId:c.id,id:c.comment.substr(TAG.length),path:f?f.fsName:null,
                    missing:l.source.footageMissing||!f||!f.exists});
            }
        }
        scan2(result);return {projectPath:ctx.projectPath,cards:result};
    }
    var EMOJI2='SEVENPASTE_EMOJI_V2:', MEASURE2='SEVENPASTE_MEASURE_V2:', TEXT2='SEVENPASTE_TEXT_V2:';
    function layerByID(c,id){for(var i=1;i<=c.numLayers;i++)if(c.layer(i).id===id)return c.layer(i);return null;}
    function resolve2(p){var c=item(p.compId),e=c instanceof CompItem?layerByID(c,p.emojiLayerId):null;if(!e||e.comment!==EMOJI2+p.id)throw Error('The linked emoji layer was not found.');return e;}
    function helper2(e){var index=SevemojiLabels.control(e,'Sevemoji Last Line').property(1).value;var h=e.containingComp.layer(index);if(h.comment.indexOf(MEASURE2)!==0)throw Error('The measurement link was not found.');return h;}
    function data2(e,includePNG){var h=helper2(e),m=h.property('ADBE Marker'),raw='';for(var i=1;i<=m.numKeys;i++)raw+=m.keyValue(i).comment;var d=parse(raw);if(!includePNG)delete d.png;return d;}
    function write2(h,d){h.locked=false;var m=h.property('ADBE Marker'),raw=stringify(d);while(m.numKeys)m.removeKey(m.numKeys);for(var i=0;i<raw.length;i+=16000)m.setValueAtTime(i/16000*h.containingComp.frameDuration,new MarkerValue(raw.substr(i,16000)));h.locked=true;}
    function scan2(result){for(var i=1;i<=app.project.numItems;i++){var c=app.project.item(i);if(!(c instanceof CompItem))continue;for(var j=1;j<=c.numLayers;j++){var e=c.layer(j);if(e.comment.indexOf(EMOJI2)!==0)continue;var f=e.source.file;result.push({version:2,compId:c.id,emojiLayerId:e.id,id:e.comment.substr(EMOJI2.length),path:f?f.fsName:null,missing:e.source.footageMissing||!f||!f.exists});}}}
    function info2(e){var d=data2(e,false),t=e.parent;if(!(t instanceof TextLayer))throw Error('The linked text layer was not found.');var td=t.property('ADBE Text Properties').property('ADBE Text Document').value;
        d.settings.text=td.text.replace(/\r/g,'\n');d.settings.font=td.font;d.settings.size=td.fontSize;d.settings.align=td.justification===ParagraphJustification.LEFT_JUSTIFY?'left':td.justification===ParagraphJustification.RIGHT_JUSTIFY?'right':'center';
        var rgb=td.fillColor,s='#';for(var k=0;k<3;k++)s+=('0'+Math.round(rgb[k]*255).toString(16)).slice(-2);d.settings.color=s;
        d.compId=e.containingComp.id;d.emojiLayerId=e.id;d.textLayerId=t.id;d.projectPath=context().projectPath;return d;
    }
    function load2(){var c=app.project.activeItem;if(c instanceof CompItem&&c.selectedLayers.length===1){var l=c.selectedLayers[0];if(l.comment.indexOf(EMOJI2)===0)return info2(l);if(l instanceof TextLayer){for(var j=1;j<=c.numLayers;j++){var e=c.layer(j);if(e.parent===l&&e.comment.indexOf(EMOJI2)===0)return info2(e);}}
        if(l.source instanceof CompItem&&l.source.comment.indexOf(TAG)===0){var d=cardData(l.source,false);d.legacy=true;d.compId=c.id;d.legacyLayerId=l.id;d.projectPath=context().projectPath;return d;}}
        throw Error('Select a Sevemoji text or emoji layer.');
    }
    function textStyle2(t,s){var prop=t.property('ADBE Text Properties').property('ADBE Text Document');if(prop.numKeys||prop.expressionEnabled)throw Error('Edit animated text in After Effects; you can replace the emoji separately.');var d=prop.value;d.resetCharStyle();d.resetParagraphStyle();d.text=s.text.replace(/\r\n/g,'\r').replace(/\n/g,'\r');d.font=s.font;d.fontSize=s.size;d.applyFill=true;d.applyStroke=false;d.fillColor=[parseInt(s.color.substr(1,2),16)/255,parseInt(s.color.substr(3,2),16)/255,parseInt(s.color.substr(5,2),16)/255];d.autoLeading=true;d.tracking=0;
        d.justification=s.align==='left'?ParagraphJustification.LEFT_JUSTIFY:s.align==='right'?ParagraphJustification.RIGHT_JUSTIFY:ParagraphJustification.CENTER_JUSTIFY;prop.setValue(d);
    }
    function effect2(e,type,name,value){var fx=e.property('ADBE Effect Parade').addProperty(type);fx.name=name;fx.property(1).setValue(value);}
    function put2(p,action){checkProject(p);if(app.project.expressionEngine!=='javascript-1.0')throw Error('Choose JavaScript in Project Settings > Expressions.');if(parseFloat(app.version)<25)throw Error('Editable tracking requires After Effects 2025 or later.');
        var c=item(p.compId),updating=action!=='add2',e=updating?resolve2(p):null,attached=p.attachTextLayerId?layerByID(c,p.attachTextLayerId):null,t=e?e.parent:attached,h=e?helper2(e):null,old=e?e.source:null,footage=null,legacy=null;
        if(p.attachTextLayerId&&(!(attached instanceof TextLayer)||attached.locked||attached.threeDLayer||attached.property('Source Text').value.boxText))throw Error('Use unlocked horizontal 2D point text for this command.');
        if(!(c instanceof CompItem))throw Error('Open a composition.');if(!p.settings||(!attached&&(!p.settings.text||!p.settings.text.replace(/\s/g,''))))throw Error('Enter some text first.');
        if(!p.png||p.png.indexOf('iVBORw0KGgo')!==0||p.png.length>4000000||!(new File(p.path)).exists)throw Error('Invalid emoji image.');
        if(p.legacyLayerId){legacy=layerByID(c,p.legacyLayerId);if(!legacy||!legacy.source||legacy.source.comment!==TAG+p.legacyId)throw Error('Select the legacy layer again.');if(legacy.threeDLayer||legacy.parent)throw Error('Use Add to create a separate version of this legacy layer.');}
        if(updating&&(!(t instanceof TextLayer)||t.property('Source Text').value.boxText))throw Error('The linked point text layer was not found.');
        // Keep direct AE text edits intact when replacing just the emoji.
        if(action==='emoji2'){var live=info2(e).settings;live.emoji=p.settings.emoji;p.settings=live;}
        try{
            footage=app.project.importFile(new ImportOptions(new File(p.path)));footage.parentFolder=folder();footage.name='Emoji · '+p.settings.emoji;footage.comment=EMOJI2+p.id;
            if(!updating){
                if(!attached){t=c.layers.addText(p.settings.text);t.name='Text · '+p.settings.text.replace(/[\r\n]/g,' ').substr(0,30);t.comment=TEXT2+p.id;textStyle2(t,p.settings);}
                h=c.layers.addText('');h.name='_Sevemoji last line '+p.id.slice(-6);h.comment=MEASURE2+p.id;h.parent=t;h.enabled=false;h.guideLayer=true;h.shy=true;
                h.property('Source Text').expression='var s=parent.text.sourceText;var a=s.toString().replace(/\\r\\n/g,"\\r").replace(/\\n/g,"\\r").replace(/\\s+$/,"").split("\\r");for(var i=0;i<a.length-1;i++)a[i]="";s.getStyleAt(0,time).setText(a.join("\\r"));';
                e=c.layers.add(footage);e.name='Emoji · '+p.settings.emoji;e.comment=EMOJI2+p.id;e.parent=t;
                effect2(e,'ADBE Layer Control','Sevemoji Last Line',h.index);effect2(e,'ADBE Slider Control','Emoji Spacing (%)',18);effect2(e,'ADBE Slider Control','Emoji Size (%)',SevemojiSettings.current().scale);effect2(e,'ADBE Slider Control','Emoji Vertical Offset',SevemojiSettings.current().y);
                var tr=e.property('ADBE Transform Group');tr.property('ADBE Anchor Point').expression='[0,thisLayer.source.height/2]';
                tr.property('ADBE Scale').expression='var s=parent.text.sourceText.style.fontSize/thisLayer.source.height*effect("Emoji Size (%)")(1);[s,s];';
                tr.property('ADBE Position').expression='var r=effect("Sevemoji Last Line")(1).sourceRectAtTime(time,false);var fs=parent.text.sourceText.style.fontSize;[r.left+r.width+fs*effect("Emoji Spacing (%)")(1)/100,r.top+r.height/2+effect("Emoji Vertical Offset")(1)];';
                tr.property('ADBE Opacity').expression='parent.transform.opacity';
                if(!attached){var r=t.sourceRectAtTime(c.time,false);t.property('ADBE Transform Group').property('ADBE Anchor Point').setValue([r.left+r.width/2,r.top+r.height/2]);t.property('ADBE Transform Group').property('ADBE Position').setValue([c.width/2,c.height/2]);}
                e.inPoint=t.inPoint;e.outPoint=t.outPoint;h.startTime=0;h.inPoint=0;h.outPoint=c.duration;
                if(legacy){var lt=legacy.property('ADBE Transform Group');t.property('ADBE Transform Group').property('ADBE Position').setValue(lt.property('ADBE Position').value);t.property('ADBE Transform Group').property('ADBE Scale').setValue(lt.property('ADBE Scale').value);t.property('ADBE Transform Group').property('ADBE Rotate Z').setValue(lt.property('ADBE Rotate Z').value);t.inPoint=legacy.inPoint;t.outPoint=legacy.outPoint;e.inPoint=t.inPoint;e.outPoint=t.outPoint;h.startTime=0;h.inPoint=0;h.outPoint=c.duration;}
            }else{if(action==='update2')textStyle2(t,p.settings);e.replaceSource(footage,false);e.name='Emoji · '+p.settings.emoji;}
            write2(h,{version:2,id:p.id,settings:p.settings,png:p.png});
            if(legacy)legacy.enabled=false;
            c.hideShyLayers=true;for(var n=1;n<=c.numLayers;n++)c.layer(n).selected=false;t.selected=true;
            if(old&&old.usedIn.length===0)old.remove();return info2(e);
        }catch(err){if(!updating){if(e)e.remove();if(h){h.locked=false;h.remove();}if(t&&!attached)t.remove();}if(footage&&footage.usedIn.length===0)footage.remove();throw err;}
    }


    function command3(p){
        checkProject(p);var c=item(p.compId),t=c instanceof CompItem?layerByID(c,p.textLayerId):null;
        if(!(t instanceof TextLayer)||t.locked||t.threeDLayer)throw Error('Use an unlocked 2D text layer.');
        var prop=t.property('Source Text'),original=prop.value,raw=original.text;
        if(raw!==p.expectedText)throw Error('The text changed; the command was not applied.');
        if(prop.numKeys||prop.expressionEnabled||original.boxText)throw Error('Use point text without Source Text animation.');
        var m=/[ \t]*\/sevenpaste[ \t]+:(\d+)[ \t]*$/i.exec(raw);
        if(!m||Number(m[1])!==p.code)throw Error('The command changed.');
        var clean=raw.substring(0,m.index).replace(/\s+$/,''),d=prop.value,e=null;
        // Delete only command characters, preserving the remaining character/paragraph styles.
        d.characterRange(clean.length,raw.length).text='';
        for(var i=1;i<=c.numLayers;i++){var candidate=c.layer(i);if(candidate.parent===t&&candidate.comment.indexOf(EMOJI2)===0){e=candidate;break;}}
        p.id=e?e.comment.substr(EMOJI2.length):'cmd-'+t.id+'-'+new Date().getTime();
        p.emojiLayerId=e?e.id:null;p.attachTextLayerId=t.id;
        p.settings={text:clean,emoji:p.emoji,font:original.font,size:original.fontSize,align:'left',color:'#ffffff'};
        prop.setValue(d);
        try{return put2(p,e?'emoji2':'add2');}catch(err){prop.setValue(original);throw err;}
    }

    function dispatch(action,p) {
        if(action==='command3')return command3(p);
        if(action==='context') return context();
        if(action==='add2'||action==='update2'||action==='emoji2')return put2(p,action);
        if(action==='load2')return load2();
        if(action==='backup2')return data2(resolve2(p),true);
        if(action==='relink2'){checkProject(p);var e=resolve2(p);e.source.replace(new File(p.path));return {repaired:true};}
        if(action==='scan')return scan();
        if(action==='load') {var c=selected(),d=cardData(c,false);d.cardId=c.id;d.projectPath=context().projectPath;return d;}
        if(action==='backup') {var c=item(p.cardId);if(!(c instanceof CompItem)||c.comment!==TAG+p.id)throw Error('Recovery data was not found.');return cardData(c,true);}
        if(action==='add')return add(p,false);
        if(action==='update')return add(p,true);
        if(action==='relink') {
            checkProject(p);var c=item(p.cardId),f=new File(p.path);
            if(!c||c.comment!==TAG+p.id||!f.exists)throw Error('Recovery could not be completed.');
            imageLayer(c).source.replace(f);return {repaired:true};
        }
        throw Error('Unknown action.');
    }
    return {jsonParse:parse,jsonStringify:stringify,call:function(action,json){
        var mutate=action==='command3'||action==='add'||action==='update'||action==='relink'||action==='add2'||action==='update2'||action==='emoji2'||action==='relink2';
        try{if(mutate)app.beginUndoGroup('Sevemoji');return stringify({ok:true,result:dispatch(action,parse(json||'{}'))});}
        catch(e){return stringify({ok:false,error:e.toString(),line:e.line});}
        finally{if(mutate)app.endUndoGroup();}
    }};
}());

$.evalFile(new File(File($.fileName).parent.fsName+'/shared.jsx'));
$.evalFile(new File(File($.fileName).parent.fsName+'/labels.jsx'));
$.evalFile(new File(File($.fileName).parent.fsName+'/inline.jsx'));

$.evalFile(new File(File($.fileName).parent.fsName+'/settings.jsx'));
