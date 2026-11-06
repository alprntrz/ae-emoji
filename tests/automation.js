const fs=require('fs'),vm=require('vm'),assert=require('assert'),path=require('path');
const root=path.join(__dirname,'../extension');
let now=1000,next=1,permission=1,enabled=true;const tasks=new Map();
function CompItem(){this.selectedLayers=[];this.numLayers=0;this.id=1;}
function TextLayer(){this.locked=false;this.threeDLayer=false;this.property=()=>({numKeys:0,expressionEnabled:false,get value(){throw Error('Status read Source Text');}});}
const comp=new CompItem(),app={project:{file:{fsName:'/test.aep'},activeItem:comp,toolType:0,expressionEngine:'javascript-1.0',renderQueue:{rendering:false}},version:'25.6',preferences:{getPrefAsLong:()=>permission},settings:{haveSetting:()=>true,getSetting:()=>enabled?'true':'false',saveSetting:(a,b,v)=>enabled=v==='true'},scheduleTask:(code,delay)=>{const id=next++;tasks.set(id,{code,delay});return id;},cancelTask:id=>tasks.delete(id)};
function FakeDate(){this.getTime=()=>now;}
const ctx={app,CompItem,TextLayer,ToolType:{Tool_TextH:1,Tool_TextV:2},Date:FakeDate,SevenPaste:{jsonParse:JSON.parse,jsonStringify:JSON.stringify},SevemojiSettings:{refresh:()=>false},Sevemoji:{scan:()=>[]},$:{global:{}}};vm.createContext(ctx);vm.runInContext(fs.readFileSync(root+'/host/commands.jsx','utf8'),ctx);
const api=ctx.SevenPasteCommands,s=()=>JSON.parse(api.status());
api.start('/extension');assert.equal(tasks.size,1);api.ensure('/extension',false);assert.equal(tasks.size,1);assert.equal(s().state.code,'ready');
permission=0;assert.equal(s().state.code,'file-access');for(const id of tasks.keys())tasks.delete(id);api.tick();assert.equal(tasks.size,1);
permission=1;app.project.file=null;assert.equal(s().state.code,'save-project');app.project.file={fsName:'/test.aep'};
comp.selectedLayers=[new TextLayer()];app.project.toolType=1;assert.equal(s().state.code,'finish-text');app.project.toolType=0;assert.equal(s().state.code,'ready');comp.selectedLayers[0].locked=true;assert.equal(s().state.code,'layer');comp.selectedLayers=[];
api.setEnabled(false);assert.equal(s().state.code,'disabled');api.ensure('/extension',true);assert.equal(enabled,false);assert.equal(tasks.size,1);api.setEnabled(true);
now+=6000;const old=[...tasks.keys()][0];api.ensure('/extension',false);assert(!tasks.has(old));assert.equal(tasks.size,1);api.stop();assert.equal(tasks.size,0);api.ensure('/extension',false);assert.equal(tasks.size,1);
// Transport failures must remain visible, without overlapping evalScript calls.
let callback,interval,requests=[],states=[];
const clientCtx={module:{exports:{}},require,setInterval:fn=>{interval=fn;return 1;},clearInterval:()=>{}};vm.createContext(clientCtx);vm.runInContext(fs.readFileSync(root+'/automation.js','utf8'),clientCtx);
const client=clientCtx.module.exports('/extension',{evalScript:(script,cb)=>{requests.push(script);callback=cb;}},state=>states.push(state));
interval();interval();assert.equal(requests.length,1);client.setEnabled(false);callback(JSON.stringify({enabled:true,state:{code:'ready',message:'Ready'}}));assert.equal(requests.length,2);assert(requests[1].includes('setEnabled(false)'));callback('EvalScript error.');assert.equal(states.at(-1).state.code,'error');client.restart();assert(requests.at(-1).includes(',true)'));callback(JSON.stringify({enabled:false,state:{code:'disabled',message:'Off'}}));client.close();
for(const name of ['automation.js','commands-ui.js','background.js'])new vm.Script(fs.readFileSync(root+'/'+name,'utf8'));
console.log('PASS: first start, idempotent start, blocked file access, unsaved project, Type tool, unsupported layer, disabled preference, lost task recovery, transport errors, no overlapping calls.');
