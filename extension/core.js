'use strict';
const catalog = require('./emojis.json');
const emojiRE = new RegExp('(?:\\p{Regional_Indicator}{2}|[#*0-9]\\uFE0F?\\u20E3|\\p{Extended_Pictographic}[\\uFE0F\\uFE0E]?\\p{Emoji_Modifier}?(?:\\u200D\\p{Extended_Pictographic}[\\uFE0F\\uFE0E]?\\p{Emoji_Modifier}?)*(?:[\\u{E0020}-\\u{E007E}]+\\u{E007F})?)','gu');
const shared=require('./shared.js');
function expand(text){return shared.expand(String(text));}
function split(text){const emojis=[];const plain=expand(text).replace(emojiRE,e=>{emojis.push(e);return '';}).replace(/[ \t]+\n/g,'\n').trim();return {text:plain,emoji:emojis.join(' '),count:emojis.length};}
function parse(text,choice){const out=split(text);if(String(choice).trim()){const chosen=split(shared.expandChoice(String(choice)));if(chosen.text)throw Error('Enter an emoji or a code such as :1 in the emoji field.');out.emoji=chosen.emoji;out.count=chosen.count;}return out;}
function compose(text,choice){const body=expand(String(text));const extra=shared.expandChoice(String(choice||'')).trim();if(extra&&split(extra).text)throw Error('Enter an emoji or a code such as :1 in the emoji field.');return body+(extra?(body&&!/\s$/.test(body)?' ':'')+extra:'');}
module.exports={catalog,expand,split,parse,compose};
