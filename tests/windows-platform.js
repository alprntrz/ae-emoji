'use strict';
const assert=require('assert'),fs=require('fs'),path=require('path'),os=require('os'),url=require('url');
const root=path.resolve(__dirname,'../extension'),p=require(path.join(root,'platform.js'));
assert.equal(p.extensionRoot(url.pathToFileURL(path.join(root,'index.html')).href),root);
const appdata=path.join(os.tmpdir(),'AE Emoji Ünicode','Roaming');assert.equal(p.userData('win32',{APPDATA:appdata},'ignored'),appdata);
assert.equal(p.userData('darwin',{},'/a-user'),path.join('/a-user','Library','Application Support'));
const dir=fs.mkdtempSync(path.join(os.tmpdir(),'ae-emoji-render-test-'));
const mock={createElement(type){assert.equal(type,'canvas');return {width:0,height:0,getContext(){return {clearRect(){},fillText(){},drawImage(){},getImageData(){const data=new Uint8ClampedArray(512*512*4);data[(240*512+240)*4+3]=255;return {data};}}},toDataURL(){return 'data:image/png;base64,iVBORw0KGgo=';}};}};
(async()=>{try{const render=require(path.join(root,'renderer.js'))(root,mock,'win32'),out=path.join(dir,'result.png');await render('😄',out);assert(fs.readFileSync(out).equals(fs.readFileSync(path.join(root,'assets','1.png'))));await render('🫠',out);assert.equal(fs.readFileSync(out).toString('hex'),'89504e470d0a1a0a');await assert.rejects(()=>require(path.join(root,'renderer.js'))(root,null,'win32')('🫠',out),/open AE Emoji panel/);console.log('PASS: platform paths, Unicode file URL, built-in image, custom renderer, missing canvas.');}finally{fs.rmSync(dir,{recursive:true,force:true});}})().catch(e=>{console.error(e);process.exitCode=1;});
