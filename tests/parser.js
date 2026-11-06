const assert=require('assert'),fs=require('fs'),vm=require('vm'),path=require('path');
const root=path.join(__dirname,'../extension'),c=require(root+'/shared.js'),config=require(root+'/config.js'),panel=require(root+'/core.js');
const cases=[
 [':1 :smile 12:30',':1 :smile 12:30'],
 ['/s :1 /s :smile','😄 😄'],
 [':/smoji :smile this is a test /smoji :smile',':😄 this is a test 😄'],
 ['(/S :SMILE), "/s :fire!"','(😄), "🔥!"'],
 ['/s :does-not-exist :1','/s :does-not-exist :1'],
 ['path/s :1 https://host/s :1','path/s :1 https://host/s :1'],
 ['😄 /smoji :fire','😄 🔥'],
 ['/s :heart:\n/smoji :1','❤️\n😄']
];cases.forEach(([a,b])=>assert.equal(c.expand(a),b));
assert.equal(c.expandChoice(':1 :smile'),'😄 😄');
assert.equal(panel.compose('Literal :1 /s :smile end',''),'Literal :1 😄 end');
assert.equal(panel.compose('Start /s :1 middle /s :fire',':heart'),'Start 😄 middle 🔥 ❤️');
assert.equal(panel.parse('Text',':1').emoji,'😄');
assert.equal(panel.parse('😄'.repeat(32),'').count,32);
assert.equal(c.scan(c.expand(Array(33).join('/s :smile '))).length,32);
const old=config.defaults();old.version=1;let d=config.validate(old,c);assert.equal(d.version,2);
d.aliases.find(a=>a.name==='coffee').number='00101';d=config.validate(d,c);c.setAliases(d.aliases);
assert.equal(c.expand('/s :101 /smoji :coffee :101'),'☕ ☕ :101');
assert.equal(c.resolve('00101').emoji,'☕');
for(const number of [1,60,-1,0,1.5,1000000,'abc'])assert.throws(()=>config.validate({...d,aliases:[{name:'test',emoji:'😄',number}]},c));
assert.throws(()=>config.validate({...d,aliases:[{name:'test',emoji:'😄',number:101},{name:'other',emoji:'🔥',number:'00101'}]},c),/already exists/);
assert.throws(()=>config.validate({...d,aliases:[{name:'smile',emoji:'😄',number:101}]},c),/library/);
assert.throws(()=>config.validate({...d,aliases:[{name:'test',emoji:'😄🔥'}]},c),/one emoji/);
d.aliases.find(a=>a.name==='coffee').number='';d=config.validate(d,c);c.setAliases(d.aliases);assert.equal(c.expand('/s :101'),'/s :101');
const context={};vm.createContext(context);vm.runInContext(fs.readFileSync(root+'/host/expression.js','utf8'),context);
for(const text of ['abc 😄 xyz 🔥','😄\rword ❤️','e\u0301 😄 👍🏽','Text 🇹🇷 1️⃣ 👩‍💻 end',Array(33).join('😄 ')]){
 const expression=context.SevemojiCore;
 for(let i=1;i<=expression.glyphCount(text)+2;i++){
  let expected=false;expression.scan(text).forEach((_,n)=>{const p=expression.locate(text,n);if(i>=p.start&&i<=p.end)expected=true;});
  assert.equal(expression.isEmojiIndex(text,i),expected,'mask: '+text+' @ '+i);
 }
}
for(const f of ['app.js','core.js','settings-ui.js','config.js','shared.js','commands-ui.js','host/commands.jsx','host/inline.jsx','host/settings.jsx','host/labels.jsx'])new vm.Script(fs.readFileSync(root+'/'+f,'utf8'),{filename:f});
assert.equal(fs.readFileSync(root+'/shared.js','utf8'),fs.readFileSync(root+'/host/shared.jsx','utf8'));
console.log('PASS: required slash, literal codes, repeated commands, punctuation, personal numbers, collision validation, legacy settings, panel composition, 32 emojis and mask positions.');
