/**
https://github.com/xiangyuecn/BuildHTML
2018-06-11
**/
(function(window){

var BuildHTML=window.BuildHTML=function(html,o){
	o||(o={});
	//复杂解析 {{:return text}} {{::return unsafehtml}} {{o_key=stringVal ddd\nddd}}stringVal支持多行(代码时要求倒数第二行必须要带;)，支持特定三个转义$x$,$x{,$x} 对应$,{,}
	html=(html==null?"":html+"").replace(/\{\{(?:(::?)|(\w+)=)((?:\S|\s)+?)\}\}/ig,function(a,b,c,code){
		if(b){
			try{
				var v=_eval(code)(o);
				v=v===undefined?"":v+"";
				return b==":"?FormatText(v):v;
			}catch(e){
				LogErr("BuildHTML Fail",a+"\n"+e.stack);
				return "";
			};
		}else{
			o[c]=code.replace(/\$x([\$\{\}])/g,"$1");
			return "";
		};
	});
	//简单解析{o_key_text} {:o_key_unsafehtml} {fn:return text} {fn::return unsafehtml}
	html=html.replace(/\{(fn:)?(:)?(.+?)\}/ig,function(a,b,c,code){
			try{
				var v=_eval(b?code:"o."+code)(o);
				v=v===undefined?"":v+"";
				return c?v:FormatText(v);
			}catch(e){
				LogErr("BuildHTML Fail",a+"\n"+e.stack);
				return "";
			};
		});
	return html;
};
window.BuildHTMLArray=function(html,list,checkFn){
	var htmls=[];
	BuildHTMLArray.list=list;
	for(var i=0,o;i<list.length;i++){
		BuildHTMLArray.index=i;
		o=list[i];
		if(checkFn && checkFn(o,i)===false){
			continue;
		};
		htmls.push(BuildHTML(html,o));
	};
	return htmls.join("\n");
};



/**功能函数**/
function LogErr(tag,msg){
	console.error("["+tag+"]"+msg);
};
function FormatText(str){
	return (str==null?"":str+"").replace(/[^\s\w\u00ff-\uffff]/g,function(a){return "&#"+a.charCodeAt(0)+";"});
};



/**可以把以下代码完全移除减少代码体积，把上面引用_eval(x)()的代码改成eval(x)即可，结果：损失了eval解析缓存，仅仅影响列表性质的模板解析速度**/
//将有返回值eval代码解析成函数。eval对于一个相同模板重复解析太慢，缓存解析结果后列表性能大幅提升（把整个模板转换成函数比这个快不了多少，没必要为了这一点点性能多写几百行代码），对解析一次（深度优化无多大意义，包括把模板转换成函数）的模板基本无影响
_eval=function(code){
	var fn=_evalCache[code];
	if(!fn){
		var fnCode=code.replace(/(\s*;)*\s*$/,"");
		var mode=fnCode.replace(/\\./g,"aa");
		mode=mode.replace(/(['"]).*?\1/g,function(a){//不考虑正则表达式干扰
			return new Array(a.length+1).join("a");
		});
		var exp=/(;\s*)[^;]+$/g;
		var m=exp.exec(mode);
		if(m){
			fnCode=fnCode.substring(0,m.index)+";\nreturn "+fnCode.substr(m.index+m[1].length);
		}else{
			fnCode="return "+fnCode;
		};
		
		try{
			fn=Function("o",fnCode);
		}catch(e){
			fn=function(){
				throw e;
			};
		};
		_evalCache[code]=fn;
	};
	return fn;
};
var _evalCache={};

})(window);