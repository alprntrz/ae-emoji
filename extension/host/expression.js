/* Shared ES3 parser: also embedded in AE expressions. */
var SevemojiCore=(function(){
var ranges=[[169,169],[174,174],[8252,8252],[8265,8265],[8482,8482],[8505,8505],[8596,8601],[8617,8618],[8986,8987],[9000,9000],[9096,9096],[9167,9167],[9193,9203],[9208,9210],[9410,9410],[9642,9643],[9654,9654],[9664,9664],[9723,9726],[9728,9733],[9735,9746],[9748,9861],[9872,9989],[9992,10002],[10004,10004],[10006,10006],[10013,10013],[10017,10017],[10024,10024],[10035,10036],[10052,10052],[10055,10055],[10060,10060],[10062,10062],[10067,10069],[10071,10071],[10083,10087],[10133,10135],[10145,10145],[10160,10160],[10175,10175],[10548,10549],[11013,11015],[11035,11036],[11088,11088],[11093,11093],[12336,12336],[12349,12349],[12951,12951],[12953,12953],[126976,127231],[127245,127247],[127279,127279],[127340,127345],[127358,127359],[127374,127374],[127377,127386],[127405,127461],[127489,127503],[127514,127514],[127535,127535],[127538,127546],[127548,127551],[127561,127994],[128000,128317],[128326,128591],[128640,128767],[128884,128895],[128981,129023],[129036,129039],[129096,129103],[129114,129119],[129160,129167],[129198,129279],[129292,129338],[129340,129349],[129351,129791],[130048,131069]];
function cp(s,i){var a=s.charCodeAt(i),b=s.charCodeAt(i+1);return a>=55296&&a<=56319&&b>=56320&&b<=57343?(a-55296)*1024+b-56320+65536:a;}
function size(n){return n>65535?2:1;}
function pict(n){if(n<169||n>131071)return false;for(var j=0;j<ranges.length;j++)if(n>=ranges[j][0]&&n<=ranges[j][1])return true;return false;}
function scan(s){var out=[],i=0,n,j,k,g;while(i<s.length){n=cp(s,i);j=i;g=1;
if(n>=127462&&n<=127487&&cp(s,i+2)>=127462&&cp(s,i+2)<=127487)j=i+4;
else if((n===35||n===42||n>=48&&n<=57)&&(s.charCodeAt(i+1)===8419||s.charCodeAt(i+1)===65039&&s.charCodeAt(i+2)===8419))j=i+(s.charCodeAt(i+1)===8419?2:3);
else if(pict(n)){j=i+size(n);while(true){if(s.charCodeAt(j)===65038||s.charCodeAt(j)===65039)j++;k=cp(s,j);if(k>=127995&&k<=127999)j+=2;while(cp(s,j)>=917536&&cp(s,j)<=917631)j+=2;if(s.charCodeAt(j)===8205&&pict(cp(s,j+1))){j++;j+=size(cp(s,j));g++;}else break;}}
if(j>i){out.push({index:i,end:j,emoji:s.substring(i,j),glyphs:g});i=j;}else i+=size(n);}return out;}
function glyphCount(s){var a=scan(s),p=0,n=0;for(var i=0;i<a.length;i++){n+=plainCount(s.substring(p,a[i].index))+a[i].glyphs;p=a[i].end;}return n+plainCount(s.substring(p));}
function plainCount(s){var n=0;for(var i=0;i<s.length;){var c=cp(s,i);if(c!==10&&c!==13&&c!==8205&&!(c>=65024&&c<=65039)&&!(c>=768&&c<=879))n++;i+=size(c);}return n;}
function locate(s,ordinal){var a=scan(s),x=a[ordinal];if(!x)return {start:-999,end:-999,index:0,emoji:''};var n=glyphCount(s.substring(0,x.index));return {start:n+1,end:n+x.glyphs,index:x.index,emoji:x.emoji};}
function isEmojiIndex(s,index){var a=scan(s),end=0,n=0;for(var i=0;i<a.length;i++){n+=plainCount(s.substring(end,a[i].index));if(index>n&&index<=n+a[i].glyphs)return true;n+=a[i].glyphs;end=a[i].end;if(index<=n)return false;}return false;}
return {isEmojiIndex:isEmojiIndex,scan:scan,locate:locate,glyphCount:glyphCount};
}());
