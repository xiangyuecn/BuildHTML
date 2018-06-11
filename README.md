# BuildHTML用于前端HTML模板解析

这段代码是以前在多个项目中使用的（包括PC端、移动端、还有Android、IOS Hybrid App），代码简单轻巧，但功能一点都不简单。100行代码不到，Uglify压缩后1k大小（可选移除_eval后0.8k）。

演示地址：[https://xiangyuecn.github.io/BuildHTML/](https://xiangyuecn.github.io/BuildHTML/)


# 使用方法

### 一、引入代码
方法1：把代码直接复制到你项目的公共js文件中使用。

方法2：将代码文件引用到你的页面中`<script src="buildhtml.js"></script>`

### 二、解析使用
引入代码后有两个函数可用：`BuildHTML`、`BuildHTMLArray`，基本使用流程：

1. 定义模板，推荐使用script text/template标签包裹文本数据(js模块化写法参考完整功能演示)：
```html
<script type="text/template" class="tp_action">
<div>
	{name}第一次使用模板，请多多指教。({:slogan}){{::html}}
</div>
</script>

<script>
var tp_action=$(".tp_action").html();
</script>
```
2. 解析模板
```javascript
var data={name:"豆豆",slogan:"<span style='color:green;font-size:12px'>面向大海春暖花开</span>"};
var html=BuildHTML(tp_action,data);

data.html="{fn:BuildHTMLArray.index}";
var list=[data,data,data];
html+=BuildHTMLArray(tp_action,list);
```
3. 显示解析后的数据
```javascript
$("body").append(html);
```



# 模板语法

HTML模板内通过嵌入特定的语法来实现内容的自动生成。

所有嵌入的代码可读写o对象(为啥用o，o=object，一个字母简短啊)，o对象为当前传入的数据对象（对象可以是object、数字、文本...）；多个嵌入代码块之间如果需要传递变量数据，可以放入o对象中。

模板嵌入语法支持两类：

### 一、{{}}：前置处理语法

此语法会在{}语法之前执行，可实现：
- 执行复杂代码返回结果
- 动态生成{}语法
- 定义内置模板（因为是前置处理，所以内置模板定义位置无关紧要）
- 定义函数和变量
- ...你想得到的作用

此语法支持三种写法：

##### 1. {{变量名=多行文本}}
定义多行文本变量，无返回值；一般用于内置模板定义。

变量名称会赋值给o[变量名]，比如`{{_tp_=多行文本}}`，最终结果：`o._tp_="多行文本"`

##### 2. {{:多行代码;返回纯文本}}
立即执行多行代码，并将返回的内容当做纯文本处理，如果有html会被转义，比如：`{{:var i="<div>";i}}`结果为`&#60;div&#62;`。
> 注意：如果存在倒数第二行代码，代码结尾需要带`;`。
> 其他地方无此要求，毕竟解析js代码格式是一件复杂的事情，加分号结尾省事的多。

##### 3. {{::多行代码;返回html}}
立即执行多行代码，并原样返回内容；这个和{{:}}语法一致，只是这个对返回结果不会转义，用于返回html。比如：`{{::var i="<div>";i}}`结果为`<div>`。

### 二、{}：简单语法

此语法求整个代码在一行，多行请使用前置处理语法。

此语法支持4总写法：

##### 1. {fn:单行代码;返回纯文本}
执行一段代码，返回纯文本，如果有html会被转义。比如`{fn:o.num=1;''} {fn:1+o.num}和{fn:var n=1+o.num;n}`结果为` 2和2`

##### 2. {fn::单行代码;返回html}
这个和{fn:}语法一致，只是这个对返回结果不会转义，用于返回html。

##### 3. {属性;可选单行代码;返回纯文本}
读取o对象的属性值，返回纯文本，如果有html会被转义。比如：`{name}`表示取`o.name`作为返回值并转义。

属性后面可以跟复杂的表达式。比如：`{num-100?'有':'无'}`表示执行表达式`o.num-100?'有':'无'`作为返回值并转义。

> 此语法是基于{fn:}语法，只是自动在代码前面加了`o.`，简化了对对象属性的获取。

##### 4. {:属性;可选单行代码;返回html}
这个和{属性}语法一致，只是这个对返回结果不会转义，用于返回html。

> 此语法是基于{fn::}语法，只是自动在代码前面加了`o.`，简化了对对象属性的获取。



# 方法文档

### BuildHTML(tp,obj)
tp:html模板字符串。

obj:数据对象。

返回值:html结果。

### BuildHTMLArray(tp,list,check)
tp:html模板字符串。

list:对象数组。

check:fn(item,index)，检查函数，item为当前遍历到的对象，index为item在list中的索引，返回false可以停止遍历。

### BuildHTMLArray.index
当前遍历的索引。



# 完整功能演示

### js（丢浏览器控制台执行）：
```javscript
var tp=[

 '<div txt="{txt}" style="display:{disable?"none":"假装空白"}">'
,'	表达式文本:{txt}'
,'	表达式html:{:txt}'
,'	表达式html:{:txt.replace(/div/g,"p")}'
,'	函数返回纯文本:{fn:var d="加"+o.html;Date.now()+d}'
,'	函数返回html:{fn::o.html}'
,'	函数+内置模板(嵌套):{fn::BuildHTML(o._tp_,o)}'
,'	函数+内置模板+列表(嵌套循环):'
,'	{fn::BuildHTMLArray(o._tp_,o.childs)}'
,'</div>'

,'定义内置模板(无返回值):{{_tp_='
,'	<div>'
,'		<span>{name}</span>'
,'	</div>'
,'}}'

,'执行代码返回文本:{{:o.name'
,'	+"<p>"'
,'}}'

,'执行代码返回html:{{::var p="<p>";'
,'	o.name+p'
,'}}'

,'执行代码返回文本:{{:'
,'	var c=0;'
,'	for(var i=0;i<1000;i++){'
,'		if(i%3)c++;'
,'	};'
,'	c'
,'}}！哈'

].join('\n');

BuildHTML(tp,{
	disable:false
	,txt:"内容<div>"
	,html:'<i>html</i>'
	
	,name:"小视频<i>"
	,childs:[{name:"土豆<i>"},{name:"爱奇艺"}]
});
```

### 结果
```html
<div txt="内容&#60;div&#62;" style="display:假装空白">
	表达式文本:内容&#60;div&#62;
	表达式html:内容<div>
	表达式html:内容<p>
	函数返回纯文本:1528680191658加&#60;i&#62;html&#60;&#47;i&#62;
	函数返回html:<i>html</i>
	函数+内置模板(嵌套):
	<div>
		<span>小视频&#60;i&#62;</span>
	</div>

	函数+内置模板+列表(嵌套循环):
	
	<div>
		<span>土豆&#60;i&#62;</span>
	</div>


	<div>
		<span>爱奇艺</span>
	</div>

</div>
定义内置模板(无返回值):
执行代码返回文本:小视频&#60;i&#62;&#60;p&#62;
执行代码返回html:小视频<i><p>
执行代码返回文本:666！哈
```


# 缩小js文件

BuildHTML用Uglify压缩后1k大小，如果你对列表无多使用，可以把对列表解析优化部分移除，然后变成了0.8k。

删除代码后段_eval部分，把代码中两处引用_eval(x)()的代码改成eval(x)即可，结果：损失了eval解析缓存，仅仅影响列表性质的模板解析速度，因为没有缓存了，每次都要调用重量级的eval或Function。


# 插曲：优化历史

1. 最早版本是只支持{}语法，{{}}前置处理语法是后面加的，最老版本只有不到20行代码，不过也很好用。

2. _eval缓存是在{{}}语法之后加的，主要针对列表这种反复调用相同模板的性能优化，经过两次优化测试： 

第一次、全部把模板解析成一个函数并缓存此函数，以后每次调用都使用此函数，省去了解析过程。结果：列表性能大幅提升，只使用一次的模板解析性能下降明细，svn提交记录：
```
BuildHtml升级成编译成函数模式，列表build效率大幅提升，测试：将近50倍，单个build速度下降3倍
```
第二次、eval增加缓存，列表性能大幅提升，但比解析成函数慢一倍，不过整体很强劲（证实了：正则表达式替换开销与函数执行开销慢不了多少），svn提交记录：
```
BuildHtml重新优化，只改造eval部分，其余不动，列性build能比函数化的慢一倍，但比原始的快20倍，单个build和原始差不多，相对来说比函数化的强


测试结果：
原始
2842.516ms
3365.878ms

eval缓存
124.680ms
3725.948ms

函数化
60.350ms
8512.252ms



测试代码：
for(var i=0;i<10000;i++){
	BuildHtml(tp);
}
console.timeEnd(1);


console.time(1);
for(var i=0;i<10000;i++){
	BuildHtml('<div class="{cls+'+Math.random()+'}">{html+'+Math.random()+'}{fn:FormatDate()+'+Math.random()+'}</div>');
}
console.timeEnd(1);
```