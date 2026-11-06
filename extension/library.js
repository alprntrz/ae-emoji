'use strict';
module.exports=function(storage,fs,file){
 const key='sevemoji-favorites-v1';
 function readFavorites(){try{const a=JSON.parse(storage.getItem(key)||'[]');return Array.isArray(a)?a.filter(x=>typeof x==='string'):[];}catch(e){return [];}}
 function recent(){try{const a=JSON.parse(fs.readFileSync(file,'utf8')).items;return Array.isArray(a)?a.filter(x=>typeof x==='string').slice(0,24):[];}catch(e){return [];}}
 function toggle(emoji){const a=readFavorites(),i=a.indexOf(emoji);if(i<0)a.push(emoji);else a.splice(i,1);storage.setItem(key,JSON.stringify(a));return i<0;}
 function use(emojis){let a=recent();emojis.forEach(emoji=>{a=[emoji].concat(a.filter(x=>x!==emoji)).slice(0,24);});fs.mkdirSync(require('path').dirname(file),{recursive:true});const part=file+'.panel.part';fs.writeFileSync(part,JSON.stringify({items:a,updated:Date.now()}));fs.renameSync(part,file);return a;}
 return {favorites:readFavorites,recent,toggle,use};
};
