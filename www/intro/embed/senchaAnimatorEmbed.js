/*
 * Sencha Animator 2013, all rights reserved
 */
(function(a){a.AnimationInstance=function(b,c){this.config=b;this.sharedResources=[];this.controller=null;this.manager=c;this.loadStatus=a.AnimationInstance.UNLOADED};a.AnimationInstance.UNLOADED=0;a.AnimationInstance.LOADED=1;a.AnimationInstance.ERROR=2;a.AnimationInstance.prototype.getController=function(){return this.controller};a.AnimationInstance.prototype.destroy=function(){this.manager.removeAnimation(this)};a.AnimationInstance.prototype.getLoadStatus=function(){return this.loadStatus};a.AnimationInstance.prototype.setLoadStatus=function(b){if(b===this.loadStatus){return}this.loadStatus=b;if(b===a.AnimationInstance.LOADED){if(this.config.onLoad){this.config.onLoad.call(this.config.scope,this)}}if(b===a.AnimationInstance.ERROR){if(this.config.onError){this.config.onError.call(this.config.scope,this)}}};a.AnimationInstance.prototype.beforeRun=function(){if(this.config.onBeforeRun){this.config.onBeforeRun.call(this.config.scope,this,this.data.config)}};a.AnimationInstance.newFromConfig=function(b,c){if(b.isIframe){return new a.AnimationIframeInstance(b,c)}else{return new a.AnimationTagInstance(b,c)}};a.AnimationIframeInstance=function(){a.AnimationInstance.apply(this,arguments);if(this.config.onLoad){var d=this;var e=this.config.timeout||30;var c=Date.now();var b=setInterval(function(){var g=(Date.now()-c)/1000;var f;if(g>e){f=a.AnimationInstance.ERROR}else{f=d.getLoadStatus()}d.setLoadStatus(f);if(f!==a.AnimationInstance.UNLOADED){clearInterval(b)}},250)}};a.AnimationIframeInstance.prototype=new a.AnimationInstance();a.AnimationIframeInstance.prototype.constructor=a.AnimationIframeInstance;a.AnimationIframeInstance.prototype.getController=function(){var d=this.config.element;var b=null;try{b=d.contentWindow.AN.instances.controllers[0]}catch(c){console.error("Iframe/Controller not fully loaded")}return b};a.AnimationIframeInstance.prototype.destroy=function(b){b=b||{};if(!b.leaveParent){this.config.element.parentNode.removeChild(this.config.element)}else{this.config.element.src=""}this.config.element=null;a.AnimationInstance.prototype.destroy.call(this)};a.AnimationIframeInstance.prototype.getLoadStatus=function(){var d,b;try{b=this.config.element.contentWindow.AN.instances.controllers[0]}catch(c){b=false}try{d=(this.config.element.contentDocument.readyState==="complete"&&this.config.element.contentDocument.location.host)}catch(c){d=false}if(d&&b){return a.AnimationInstance.LOADED}else{return a.AnimationInstance.UNLOADED}};a.AnimationTagInstance=function(){a.AnimationInstance.apply(this,arguments)};a.AnimationTagInstance.prototype=new a.AnimationInstance();a.AnimationTagInstance.prototype.constructor=a.AnimationTagInstance;a.AnimationTagInstance.prototype.destroy=function(b){b=b||{};if(!b.leaveParent){this.config.element.parentNode.removeChild(this.config.element)}else{while(this.config.element.hasChildNodes()){this.config.element.removeChild(this.config.element.lastChild)}}for(var c=0;c<this.sharedResources.length;c++){this.sharedResources[c].refCount--;if(this.sharedResources[c].refCount<1){this.sharedResources[c].element.parentNode.removeChild(this.sharedResources[c].element)}}this.sharedResources=null;a.AnimationInstance.prototype.destroy.call(this)};a.PageManager={version:2,animations:[],externalResources:{},uniqueId:0,idPrefix:window.SENCHA_ANIMATOR_PREFIX_ID||"a",loaded:false,run:function(){if(this.loaded){return}this.loaded=true;var b=this.findAnimationsPlaceholders();this.fetchAnimations(b);this.animations=this.animations.concat(b)},runOnDomContentLoaded:function(){var b=this;document.addEventListener("DOMContentLoaded",function(){b.run()},false)},getUniqueId:function(){return this.uniqueId++},getAnimations:function(){return this.animations.slice(0)},loadAnimation:function(d,c,b){b=b||{};if(typeof d==="string"){d=document.getElementById(d)}if(!d){console.warn("Invalid element");return false}b.element=d;b.url=this.getBaseUrl(c);b.isIframe=this.isIframeElement(d);var e=a.AnimationInstance.newFromConfig(b,this);this.fetchAnimation(e);this.animations.push(e);return e},findAnimationsPlaceholders:function(){var b=[];var f=document.querySelectorAll("[data-sencha-anim-url]");var e,c;for(var d=0;d<f.length;d++){c=f[d];e=a.AnimationInstance.newFromConfig({element:c,url:this.getBaseUrl(c.getAttribute("data-sencha-anim-url")),isIframe:this.isIframeElement(c)},this);b.push(e)}return b},removeAnimation:function(c){var b=this.animations.indexOf(c);if(b!==-1){this.animations.splice(b,1)}},getBaseUrl:function(b){if(b.length>0&&b.charAt(b.length-1)!=="/"){b=b+"/"}return b},isIframeElement:function(b){return(b.nodeName==="IFRAME")},fetchAnimations:function(c){for(var b=0;b<c.length;b++){this.fetchAnimation(c[b])}},fetchAnimation:function(b){if(b.config.isIframe){this.fetchIframeAnimation(b)}else{this.fetchJSONAnimation(b)}},fetchJSONAnimation:function(c){var b=c.config.url+"data.json";this.externalGet(b,function(e,d){if(e){this.receivedJSONAnimation(c,d)}else{c.setLoadStatus(a.AnimationInstance.ERROR)}},this)},fetchIframeAnimation:function(b){this.loadAnimDataIntoIframe(b)},receivedJSONAnimation:function(g,c){try{g.data=JSON.parse(c)}catch(b){console.warn("Was not able to parse JSON for "+g.config.url+" msg: "+b);return}var d=/\{\_an\:asset\_parent\}/g;g.data.css=g.data.css.replace(d,g.config.url);g.data.js=g.data.js.replace(d,g.config.url);g.data.html=g.data.html.replace(d,g.config.url);var f=this.idPrefix+this.getUniqueId()+"-";var e=/\{\_an\:id\_prefix\}/g;g.data.css=g.data.css.replace(e,f);g.data.js=g.data.js.replace(e,f);g.data.html=g.data.html.replace(e,f);this.loadAnimDataIntoDiv(g)},loadAnimDataIntoDiv:function(d){d.config.element.innerHTML=d.data.html;if(d.config.element.childNodes[0]){d.config.element.childNodes[0].style.overflow="hidden"}d.config.styleTag=this.createNewStyleTag(d.data.css);var b=new Function(d.data.js+"; return configData;");d.data.config=b();d.data.config.basePath=d.config.url;var e=new Function(" var AN = undefined;"+d.data.controlJS+"; return AN.Controller;");var c=e();this.loadExternalResources(d.data.config.externalResources,d,function(g){if(g){d.setLoadStatus(a.AnimationInstance.ERROR);return}var f=new c();d.controller=f;d.beforeRun();f.setConfig(d.data.config);d.setLoadStatus(a.AnimationInstance.LOADED)},this)},loadAnimDataIntoIframe:function(b){b.config.element.src=b.config.url+"index.html";b.config.element.style.borderWidth="0";b.config.element.scrolling="no"},loadExternalResources:function(h,g,j,e){var f=h.length;if(f===0){j.call(e);return}var b=false;var c=function(k,i){if(i){b=true}g.sharedResources.push(k);f--;if(!f){j.call(e,b)}};for(var d=0;d<h.length;d++){this.loadExternalResource(h[d].url,h[d].type,c,this)}},loadExternalResource:function(b,d,e,c){if(this.externalResources[b]){if(this.externalResources[b].staus==="done"){e.call(c,this.externalResources[b],false)}else{if(this.externalResources[b].staus==="error"){e.call(c,this.externalResources[b],true)}else{this.externalResources[b].callbacks.push({callback:e,scope:c})}}this.externalResources[b].refCount++;return}this.externalResources[b]={status:"wait",callbacks:[{scope:c,callback:e}],refCount:1};this.externalGet(b,function(j,h){if(j){if(d==="css"){this.externalResources[b].element=this.createNewStyleTag(h)}else{if(d==="js"){this.externalResources[b].element=this.createNewScriptTag(h)}}this.externalResources[b].status="done"}else{this.externalResources[b].status="error"}var f;for(var g=0;g<this.externalResources[b].callbacks.length;g++){f=this.externalResources[b].callbacks[g];f.callback.call(f.scope,this.externalResources[b],!j)}},this)},externalGet:function(b,e,c){var d=new XMLHttpRequest();d.open("GET",b,true);d.onload=function(f){if(d.status===200||d.status===0){e.call(c,true,d.responseText)}else{e.call(c,false)}};d.onerror=function(){e.call(c,false)};d.send(null)},createNewStyleTag:function(c){var b=document.createElement("style");b.type="text/css";b.innerHTML=c;document.getElementsByTagName("head")[0].appendChild(b);return b},createNewScriptTag:function(b){var c=document.createElement("script");c.type="text/javascript";c.innerHTML=b;document.getElementsByTagName("head")[0].appendChild(c);return c}};if(!a.disableAutorun){a.PageManager.runOnDomContentLoaded()}})(window.AN=window.AN||{});