'use strict';
const requireNode = window.cep_node ? window.cep_node.require : require;
const fs = requireNode('fs'), path = requireNode('path'), os = requireNode('os');
const crypto = requireNode('crypto'), spawn = requireNode('child_process').spawn;
const root = path.dirname(requireNode('url').fileURLToPath(location.href));
const platform=requireNode(path.join(root,'platform.js'));
const render=requireNode(path.join(root,'renderer.js'))(root,document,process.platform);
const worker = path.join(root, 'native', 'sevemoji-render');
const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'Sevemoji-preview-'));
const core=requireNode(path.join(root,'core.js'));
const ids = ['text','emoji'];
let textStyle={font:'Arial-BoldMT',size:72,align:'center',color:'#ffffff'},collection='all';
const library=requireNode(path.join(root,'library.js'))(localStorage,fs,path.join(platform.dataDir(),'recent.json'));
let recentSignature=JSON.stringify(library.recent());
const el = id => document.getElementById(id);
let busy = false, target = null, revision = 0, previewTimer = null, latest = null;

function status(message, error) { el('status').textContent = message; el('status').className = error ? 'error' : ''; }
function settings() {
  const parsed=core.parse(el('text').value,el('emoji').value);
  return Object.assign(parsed,textStyle);
}
function ae(action, payload) {
  return new Promise((resolve,reject) => {
    if (!window.__adobe_cep__) return reject(new Error('Open this panel inside After Effects.'));
    const script = (action.endsWith('5')?'SevemojiSettings.call(':action.endsWith('4')?'Sevemoji.call(':'SevenPaste.call(')+JSON.stringify(action)+','+JSON.stringify(JSON.stringify(payload||{}))+')';
    window.__adobe_cep__.evalScript(script, raw => {
      try { const r=JSON.parse(raw); if(!r.ok)throw new Error(r.error);resolve(r.result); }
      catch(e){reject(new Error(e.message || 'After Effects did not respond.'));}
    });
  });
}
function saveBytes(directory,bytes) {
  if(bytes.length>3000000)throw new Error('The image is too large. Use fewer emojis.');
  const name='sp-'+crypto.createHash('sha256').update(bytes).digest('hex').slice(0,24)+'.png';
  fs.mkdirSync(directory,{recursive:true});
  const destination=path.join(directory,name);
  // Verify existing data as well; an interrupted old write must not be reused.
  if(!fs.existsSync(destination)||!fs.readFileSync(destination).equals(bytes)) {
    const part=destination+'.'+crypto.randomBytes(6).toString('hex')+'.part';
    try{fs.writeFileSync(part,bytes,{flag:'wx'});fs.renameSync(part,destination);}
    finally{if(fs.existsSync(part))fs.unlinkSync(part);}
  }
  return destination;
}
function assetFolder(projectPath){return path.join(path.dirname(projectPath),'Sevemoji Assets');}
function setBusy(value){busy=value;el('update').style.display=target&&target.version!==4?'block':'none';el('add').disabled=value;el('load').disabled=value;el('update').disabled=value||!target||target.version===4;el('replace').disabled=value||!target||!!target.legacy;el('repair').disabled=value;}
async function renderEmoji(s){
 const key=crypto.createHash('sha256').update(s.emoji).digest('hex');
 if(latest&&latest.key===key&&fs.existsSync(latest.result.path))return latest.result;
 const result=await render(s.emoji,path.join(temp,key+'.png'));latest={key,result};return result;
}
async function put(mode){
 if(busy)return;setBusy(true);
 try{
  const context=await ae('context');
  if(!context.projectPath)throw Error('Save your project first (Ctrl/Cmd+S).');
  if(mode!=='add'&&(!target||target.projectPath!==context.projectPath))throw Error('Click Load selected to load a layer from this project first.');
  if(mode==='add'&&!context.compId)throw Error('Open a composition first.');
  const s=settings();
  if(mode==='add'){
   const body=core.compose(el('text').value,el('emoji').value),shared=requireNode(path.join(root,'shared.js')),found=shared.scan(body),assets={};
   if(!found.length)throw Error('Use /s :1 in your text, paste an emoji or pick one from the gallery.');
   if(body.length>6000)throw Error('Use up to 6,000 characters.');
   status('Preparing '+found.length+' emoji(s)…');
   for(const hit of found){const key=shared.key(hit.emoji);if(assets[key])continue;const result=await renderEmoji({emoji:hit.emoji}),bytes=fs.readFileSync(result.path);assets[key]={emoji:hit.emoji,path:saveBytes(assetFolder(context.projectPath),bytes),png:bytes.toString('base64')};}
   const added=await ae('add4',Object.assign({},context,{text:body,settings:s,assets}));target=added;recordRecent(body);fill(added.settings);status(found.length+' emoji(s) added on separate layers. Edit the text in AE. Save with Ctrl/Cmd+S.');return;
  }
  if(!s.text.trim()&&!(mode==='emoji'&&target&&target.version===4))throw Error('Enter some text first.');
  if(!s.emoji)throw Error('Use /s :1 in the text or pick an emoji from the gallery.');
  if(s.text.length>6000)throw Error('Use up to 6,000 characters.');
  if(target&&target.version===4&&mode==='emoji'&&requireNode(path.join(root,'shared.js')).scan(s.emoji).length!==1)throw Error('Pick one emoji to replace the selected emoji.');
  status('Preparing emoji…');
  const result=await renderEmoji(s),bytes=fs.readFileSync(result.path),destination=saveBytes(assetFolder(context.projectPath),bytes);
  const conversion=mode!=='add'&&target.legacy;
  const id=mode==='add'||conversion?crypto.randomBytes(12).toString('hex'):target.id;
  const payload=Object.assign({},context,result,{id,path:destination,png:bytes.toString('base64'),settings:s,
   compId:mode==='add'?context.compId:target.compId,emojiLayerId:mode==='add'?null:target.emojiLayerId,
   legacyLayerId:conversion?target.legacyLayerId:null,legacyId:conversion?target.id:null});
  const added=await ae(target&&target.version===4&&mode==='emoji'?'emoji4':mode==='add'||conversion?'add2':mode==='emoji'?'emoji2':'update2',payload);
  target=added;recordRecent(s.emoji);fill(added.settings);el('update').textContent='Update text + emoji';
  status(mode==='emoji'?'Emoji replaced. Your text is preserved. Save with Ctrl/Cmd+S.':conversion?'Separate layers are ready. The old layer is preserved and hidden. Save with Ctrl/Cmd+S.':'Text and emoji are on separate layers. Edit the text in AE. Save with Ctrl/Cmd+S.');
 }catch(e){status(e.message,true);}finally{setBusy(false);}
}
function preview(){
 try{
  const s=settings(),body=core.compose(el('text').value,el('emoji').value),empty=!body;
  el('empty').style.display=empty?'block':'none';el('preview-copy').style.display=empty?'none':'block';
  el('preview-text').textContent=body;el('preview-emoji').textContent='';el('preview-copy').style.color=s.color;
  el('preview-copy').style.fontFamily='"'+s.font.replace(/["\\]/g,'')+'",sans-serif';
  el('preview-copy').style.textAlign=s.align;
  document.querySelectorAll('.emoji-card').forEach(b=>b.classList.toggle('chosen',s.emoji===b.dataset.emoji));
 }catch(e){status(e.message,true);}
}
function fill(s){['font','size','align','color'].forEach(k=>{if(s[k]!==undefined)textStyle[k]=s[k];});ids.forEach(id=>{if(s[id]!==undefined)el(id).value=s[id];});if(target&&target.version===4)el('emoji').value='';preview();}
function remember(){try{const s={};ids.forEach(id=>s[id]=el(id).value);localStorage.setItem('sevenpaste-settings-v2',JSON.stringify(s));}catch(e){}}
function recordRecent(emoji){try{const list=requireNode(path.join(root,'shared.js')).scan(emoji).map(x=>x.emoji);library.use(list);recentSignature=JSON.stringify(library.recent());if(collection==='recent')gallery();}catch(e){}}
function gallery(){
 const query=el('search').value.trim().toLowerCase().replace(/^:(?=[a-z])/,'').replace(/_/g,'-'),grid=el('emoji-grid'),favorites=library.favorites();grid.textContent='';
 const shared=requireNode(path.join(root,'shared.js')),personal=shared.aliases().map(a=>({id:a.number,name:a.name,emoji:a.emoji,label:'Personal · '+a.name})),catalog=core.catalog.concat(personal);
 const entries=collection==='all'?catalog:(collection==='favorites'?favorites:library.recent()).map(emoji=>catalog.find(e=>e.emoji===emoji)||{emoji,name:'custom',label:'Custom emoji'});
 const found=entries.filter(e=>!query||(/^:?\d+$/.test(query)?e.id===Number(query.replace(':','')):[e.name,e.label,e.emoji,e.id?':'+e.id:''].join(' ').toLowerCase().includes(query)));
 found.forEach(e=>{
  const item=document.createElement('div');item.className='emoji-item';
  const button=document.createElement('button');button.className='emoji-card';button.type='button';button.dataset.emoji=e.emoji;button.title=e.label+' · /s :'+e.name+(e.id?' · /s :'+e.id:'');button.setAttribute('aria-label',button.title);
  const glyph=document.createElement('span');glyph.className='glyph';const asset=e.id?path.join(root,'assets',String(e.id)+'.png'):'';if(asset&&fs.existsSync(asset)){const img=document.createElement('img');img.src=requireNode('url').pathToFileURL(asset).href;img.alt=e.emoji;img.style.width='30px';img.style.height='30px';glyph.appendChild(img);}else glyph.textContent=e.emoji;
  const name=document.createElement('span');name.className='caption';name.textContent=':'+e.name;
  const code=document.createElement('b');code.textContent=e.id?':'+e.id:'—';button.appendChild(glyph);button.appendChild(name);button.appendChild(code);
  button.addEventListener('click',()=>{el('emoji').value=e.id?':'+e.id:e.emoji;remember();recordRecent(e.emoji);preview();status(e.emoji+' selected. '+(target&&!target.legacy?'Click Replace emoji to apply it.':'Click Add text + emoji.'));});
  const favorite=document.createElement('button');favorite.type='button';favorite.className='favorite-toggle'+(favorites.includes(e.emoji)?' saved':'');favorite.textContent=favorites.includes(e.emoji)?'★':'☆';favorite.title=favorites.includes(e.emoji)?'Remove from Favorites':'Add to Favorites';favorite.setAttribute('aria-label',favorite.title+' — '+e.label);favorite.setAttribute('aria-pressed',favorites.includes(e.emoji)?'true':'false');favorite.addEventListener('click',()=>{try{library.toggle(e.emoji);gallery();}catch(err){status('Favorites could not be saved.',true);}});
  item.appendChild(button);item.appendChild(favorite);grid.appendChild(item);
 });
 el('favorite-count').textContent=favorites.length||'';
 el('no-results').hidden=!!found.length;el('no-results').textContent=query?'No matching emojis.':collection==='favorites'?'Click a star on any emoji to save it here.':collection==='recent'?'Your recent picks and conversions will appear here.':'No emojis available.';
 preview();
}
async function repair(manual) {
  if(busy)return;setBusy(true);
  let repaired=0;
  try {
    const fixed=await ae('repairLinks4');const scan=await ae('scan');scan.cards=scan.cards.concat(await ae('scan4'));
    if(!scan.projectPath){if(manual)status('Save your project first.');return;}
    const directory=assetFolder(scan.projectPath);
    for(const card of scan.cards) {
      // Also follows Save As: each project keeps a local copy next to its AEP.
      const elsewhere=!card.path||path.dirname(card.path)!==directory;
      if(!card.missing&&!elsewhere)continue;
      const backup=await ae(card.version===4?'backup4':card.version===2?'backup2':'backup',card),bytes=Buffer.from(backup.png,'base64');
      if(bytes.slice(0,8).toString('hex')!=='89504e470d0a1a0a')throw new Error('Invalid recovery data.');
      const file=saveBytes(directory,bytes);
      await ae(card.version===4?'relink4':card.version===2?'relink2':'relink',Object.assign({},card,{path:file,projectPath:scan.projectPath}));
      repaired++;
    }
    if(repaired)status(repaired+' image(s) restored next to your project. Save with Ctrl/Cmd+S.');
    else if(manual)status(fixed?'Emoji alignment and links refreshed. Save with Ctrl/Cmd+S.':'Project checked. Emoji files and links are ready.');
  }catch(e){if(manual||repaired)status(e.message,true);}finally{setBusy(false);}
}
ids.forEach(id=>el(id).addEventListener('input',()=>{if(id==='text'){try{if(core.split(el('text').value).emoji)el('emoji').value='';}catch(e){}}remember();preview();}));
el('search').addEventListener('input',gallery);
el('clear-emoji').addEventListener('click',()=>{el('emoji').value='';remember();preview();});
el('add').addEventListener('click',()=>put('add'));
el('replace').addEventListener('click',()=>put('emoji'));
el('update').addEventListener('click',()=>put('update'));
el('repair').addEventListener('click',()=>repair(true));
el('load').addEventListener('click',async()=>{
 if(busy)return;setBusy(true);
 try{target=await ae('load4')||await ae('load2');const s=Object.assign({},target.settings);if(target.legacy){const p=core.parse(s.text,'');s.text=p.text;s.emoji=p.emoji;}
  fill(s);el('update').textContent=target.legacy?'Convert to separate layers':'Update text + emoji';status(target.legacy?'Legacy layer loaded. Convert it to editable text and emoji layers.':'Layer loaded. Pick an emoji and click Replace emoji.');
 }catch(e){status(e.message,true);}finally{setBusy(false);}
});
document.addEventListener('keydown',e=>{if((e.metaKey||e.ctrlKey)&&e.key==='Enter'){e.preventDefault();put('add');}});
try{const saved=JSON.parse(localStorage.getItem('sevenpaste-settings-v2')||'null');if(saved)fill(saved);}catch(e){}
gallery();setBusy(false);
setTimeout(()=>repair(false),800);setInterval(()=>{try{const signature=JSON.stringify(library.recent());if(signature!==recentSignature){recentSignature=signature;if(collection==='recent')gallery();}}catch(e){}},1500);
window.addEventListener('beforeunload',()=>{try{fs.readdirSync(temp).forEach(f=>{if(f.endsWith('.png'))fs.unlinkSync(path.join(temp,f));});fs.rmdirSync(temp);}catch(e){}});

document.querySelectorAll('[data-collection]').forEach(button=>button.addEventListener('click',()=>{collection=button.dataset.collection;document.querySelectorAll('[data-collection]').forEach(b=>{b.classList.toggle('active',b===button);b.setAttribute('aria-selected',b===button?'true':'false');});gallery();}));
function showTab(help){el('settings-view').hidden=true;el('tab-settings').classList.remove('active');el('tab-settings').setAttribute('aria-selected','false');el('emoji-view').hidden=help;el('help-view').hidden=!help;el('tab-emoji').classList.toggle('active',!help);el('tab-help').classList.toggle('active',help);el('tab-emoji').setAttribute('aria-selected',help?'false':'true');el('tab-help').setAttribute('aria-selected',help?'true':'false');}
el('tab-emoji').addEventListener('click',()=>showTab(false));el('tab-help').addEventListener('click',()=>showTab(true));

if(process.platform==='win32')window.addEventListener('DOMContentLoaded',()=>{
 const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);let node;while((node=walker.nextNode()))if(node.nodeValue.indexOf('⌘')>=0)node.nodeValue=node.nodeValue.replace(/⌘/g,'Ctrl+');
});
