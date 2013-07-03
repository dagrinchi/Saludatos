/*
 * Sencha Animator 2013, all rights reserved
 */
Ext.define("AN.Animation",{extend:"Ext.Component",alias:"widget.animatoranimation",config:{animationFolderUrl:null,idPrefix:"anim",lazyRender:true,scaleToFit:true,constrainScaleRatio:true,rescaleOnContainerResize:true,onStart:Ext.emptyFn,onLoadDone:Ext.emptyFn,scope:null},statics:{getUniqueId:(function(){var a=0;return function(){return a++}})(),UNLOADED:0,LOADED:1,LOADED_DOM:2},loadState:null,loadData:null,headTags:[],lastScalingStyle:"",template:[{style:"position: absolute; height:100%; width: 100%",reference:"animationContainer"}],getController:function(){if(this.loadData&&this.loadData.controller){return this.loadData.controller}return null},initialize:function(){this.loadState=this.self.UNLOADED;this.on("show",this.onShow,this);this.callParent(arguments)},onShow:function(){if(this.loadState===this.self.LOADED){this.renderAnimation()}},updateAnimationFolderUrl:function(c){var b=this.getIdPrefix()+this.self.getUniqueId()+"-";var a=new AN.AnimationLoader();a.loadAnimationFromFolder(c,b,this.onLoadDone,this)},applyAnimationFolderUrl:function(a){a=a.replace(/\/$/,"")+"/";return a},onLoadDone:function(a,b){if(a){console.warn(a);return}this.loadState=this.self.LOADED;this.loadData=b;this.getOnLoadDone().call(this.getScope(),b);this.renderAnimation()},setRendered:function(a){this.callParent(arguments);if(this.waitingForRender){this.waitingForRender=false;this.renderAnimation()}},renderAnimation:function(){if(!this.isRendered()){this.waitingForRender=true;return}if(this.getHidden()&&this.getLazyRender()){return}if(this.loadState===this.self.LOADED_DOM){return}var b;for(var a=0;a<this.loadData.externalResources.length;a++){b=this.loadData.externalResources[a];if(b.type==="css"){this.createNewStyleTag(b.data)}else{if(b.type==="js"){this.createNewScriptTag(b.data)}}}if(this.loadData.controllerConfig.layout&&this.loadData.controllerConfig.layout.type==="absolute"&&this.getScaleToFit()){this.doScaling();if(this.getRescaleOnContainerResize()){this.on("resize",this.doScaling,this)}}this.createNewStyleTag(this.loadData.css);this.animationContainer.setHtml(this.loadData.html);this.loadData.controller.setConfig(this.loadData.controllerConfig);this.loadState=this.self.LOADED_DOM;this.getOnStart().call(this.getScope(),this.loadData)},doScaling:function(){var a="";var b=parseInt(this.loadData.controllerConfig.layout.width,10);var e=parseInt(this.loadData.controllerConfig.layout.height,10);var k=this.element.getWidth();var n=this.element.getHeight();var m=k/b;var f=n/e;var j=0;var d=0;if(this.getConstrainScaleRatio()){m=f=Math.min(m,f);j=Math.round((k-m*b)/2);d=Math.round((n-m*e)/2)}var l="transform-origin: 0% 0%;";var c="transform: translate("+j+"px,"+d+"px) scale("+m+","+f+");";var h=["","-webkit-"];for(var g=0;g<h.length;g++){a=a+h[g]+l;a=a+h[g]+c}if(this.lastScalingStyle===a){return}this.animationContainer.dom.style.cssText=a;this.lastScalingStyle=a},createNewStyleTag:function(b){var a=document.createElement("style");a.type="text/css";a.innerHTML=b;document.getElementsByTagName("head")[0].appendChild(a);this.headTags.push(a);return a},createNewScriptTag:function(a){var b=document.createElement("script");b.type="text/javascript";b.innerHTML=a;document.getElementsByTagName("head")[0].appendChild(b);this.headTags.push(b);return b},destroy:function(){for(var a=0;a<this.headTags.length;a++){Ext.fly(this.headTags[a]).destroy()}this.callParent(arguments)}});Ext.define("AN.AnimationLoader",{externalResources:{},loadAnimationFromFolder:function(d,c,e,b){var a=d+"data.json";this.callbackScope=b;this.callback=e;this.idPrefix=c;this.folderUrl=d;Ext.Ajax.request({url:a,success:function(f){var i=f.responseText;var h;try{h=JSON.parse(i)}catch(g){e.call(b,"Couldn't parse json file "+a);return}this.initializeAnimation(h)},failure:function(){e.call(b,"Couldn't load json file "+a)},scope:this})},initializeAnimation:function(e){this.fillInTemplate(e);var b=new Function(e.js+"; return configData;");var c=b();c.basePath=this.folderUrl;var f=new Function(" var AN = undefined;"+e.controlJS+"; return AN.Controller;");var d=f();var a=new d();this.loadExternalResources(c.externalResources,function(h){var g={css:e.css,html:e.html,controller:a,controllerConfig:c,externalResources:h};this.callback.call(this.callbackScope,false,g)},this)},fillInTemplate:function(c){var a=/\{\_an\:asset\_parent\}/g;c.css=c.css.replace(a,this.folderUrl);c.js=c.js.replace(a,this.folderUrl);c.html=c.html.replace(a,this.folderUrl);var b=/\{\_an\:id\_prefix\}/g;c.css=c.css.replace(b,this.idPrefix);c.js=c.js.replace(b,this.idPrefix);c.html=c.html.replace(b,this.idPrefix)},loadExternalResources:function(f,g,d){var e=f.length;var c=[];if(e===0){g.call(d,c);return}var a=function(h){e--;if(!e){g.call(d,c)}};for(var b=0;b<f.length;b++){this.loadExternalResource(f[b].url,f[b].type,c,a,this)}},loadExternalResource:function(a,c,d,e,b){if(this.externalResources[a]){if(this.externalResources[a].staus==="done"){e.call(b)}else{this.externalResources[a].callbacks.push({callback:e,scope:b})}return}this.externalResources[a]={status:"wait",callbacks:[{scope:b,callback:e}]};this.externalGet(a,function(g,j){if(!g&&j){d.push({type:c,data:j})}else{console.warn("error loading resource or resource empty: "+a)}this.externalResources[a].status="done";var f;for(var h=0;h<this.externalResources[a].callbacks.length;h++){f=this.externalResources[a].callbacks[h];f.callback.call(f.scope)}},this)},externalGet:function(a,c,b){Ext.Ajax.request({url:a,success:function(d){c.call(b,false,d.responseText)},failure:function(){c.call(b,"Couldn't load file "+a)},scope:this})}});