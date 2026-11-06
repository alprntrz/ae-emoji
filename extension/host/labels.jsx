/* English control labels, with compatibility for projects from earlier versions. */
var SevemojiLabels=(function(){
var labels=[['Sevemoji Konum','Sevemoji Position'],['SP Satir','Sevemoji Last Line'],['Emoji boyutu (%)','Emoji Size (%)'],['Emoji yukseklik','Emoji Vertical Offset'],['Emoji boslugu (%)','Emoji Spacing (%)']];
var animators=[['Sevemoji renkli emoji','Sevemoji Color Emoji'],['Sevemoji olcum','Sevemoji Measurement']];
function control(l,name){var fx=l.property('ADBE Effect Parade'),p=fx.property(name);if(p)return p;for(var i=0;i<labels.length;i++)if(labels[i][1]===name)return fx.property(labels[i][0]);return null;}
function upgrade(l){var changes=[],expressions=[],fx=l.property('ADBE Effect Parade'),owned=/^SEVEMOJI_EMOJI_V4:|^SEVENPASTE_EMOJI_V2:/.test(l.comment),i,p;
 if(owned&&fx)for(i=0;i<labels.length;i++){p=fx.property(labels[i][0]);if(p&&!fx.property(labels[i][1]))changes.push({p:p,name:labels[i][1]});}
 if(l instanceof TextLayer){var a=l.property('ADBE Text Properties').property('ADBE Text Animators');for(i=0;i<animators.length;i++){p=a.property(animators[i][0]);if(p&&!a.property(animators[i][1]))changes.push({p:p,name:animators[i][1]});}}
 // Earlier releases embedded escaped control names in eval strings. Replace
 // both direct and escaped references, preserving the pre-migration enabled state.
 if(owned){var tr=l.property('ADBE Transform Group'),props=['ADBE Position','ADBE Scale'];for(var j=0;j<props.length;j++){p=tr.property(props[j]);var old=p.expression,s=old;for(i=0;i<labels.length;i++)s=s.split(labels[i][0]).join(labels[i][1]);if(s!==old)expressions.push({p:p,text:s,on:p.expressionEnabled||!!p.expressionError});}}
 if(!changes.length&&!expressions.length)return 0;var locked=l.locked;app.beginUndoGroup('Sevemoji: update control labels');try{l.locked=false;for(i=0;i<changes.length;i++)changes[i].p.name=changes[i].name;for(i=0;i<expressions.length;i++){p=expressions[i].p;p.expression=expressions[i].text;p.expressionEnabled=expressions[i].on;}}
 finally{l.locked=locked;app.endUndoGroup();}return changes.length+expressions.length;}
return {control:control,upgrade:upgrade};
}());
$.global.SevemojiLabels=SevemojiLabels;
