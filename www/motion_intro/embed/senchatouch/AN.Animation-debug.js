/*!
 * Sencha Animator 2013, all rights reserved
 */
/* 
    Sencha Inc - 2012
*/

/**
* @class AN.Animation
* A Sencha Touch component for embedding Sencha Animator animation into Sencha Touch applications. It inherits from
* Ext.Component, so be sure to also check [the Sencha Touch docs](http://docs.sencha.com) to learn more about methods
* and properties that this object supports.
* 
*    
* Sample use case:
* 
*     var component = new AN.Animation({
*         animationFolderUrl: 'path/to/animationFolder',
*         renderTo: someContainer
*     });
* 
* or using xtype:
*     ...
*     items:[{
*         xtype: 'animatoranimation',
*         animationFolderUrl: 'path/to/animationFolder',
*     }]
*     ...
*
*/

Ext.define('AN.Animation',{
    extend: "Ext.Component",
    alias: "widget.animatoranimation",

    config: {

        /**
        * @cfg {String} animationFolderUrl (required)
        * Must point to folder where data.json and assets is located.
        * You get this folder by choosing "Export for
        * embedding" in Animator. 
        *
        * **Note** that this must be served on the same
        * server due to browser security restrictions.
        */
        animationFolderUrl: null,

        /**
        * @cfg {String} [idPrefix='anim']
        * Prefix used for dom ids when inserting the animation into your page. Change it
        * if you have conflicts with other content on the page. Note that it will
        * not conflict with other animations based on AN.Animation as a unique id is added after the 
        * prefix e.g. the first AN.Animation will be prefixed with 'anim-0' and the
        * second AN.Animation will be prefixed with 'anim-1' and so on.
        *
        * Note that you must pass in a **valid css id** i.e. must start with a letter and contain only 
        * alphanumeric characters and dashes.
        */
        idPrefix:  'anim',

        /**
        * @cfg {Boolean} [lazyRender=true]
        * If true, the html/css/js will be first inserted into the page when needed
        * e.g. when the component becomes visible. If set to false, the animation
        * will be loaded into dom when it finishes loading over the network.
        */
        lazyRender: true,

        /**
        * @cfg {Boolean} [scaleToFit=true]
        * If true, it will scale the animation to fill the container.
        * 
        * **Note** that this setting only affects Animator animations which have the 
        * project layout set to 'Absolute'.
        */
        scaleToFit: true,


        /**
        * @cfg {Boolean} [constrainScaleRatio=true]
        * if true, it keeps the aspect ratio of the animation. If false, the animations
        * will be scaled to fully fit the viewport.
        * Defaults to true.
        * 
        * **Note** that this setting only affects Animator animations which have the 
        * project layout set to 'Absolute', and when scaleToFit is enabled.
        */
        constrainScaleRatio: true,

        /**
        * @cfg {Boolean} [rescaleOnContainerResize=true]
        * if true, the animatino will be rescaled if the container size changes.
        * 
        * **Note** that this setting only affects Animator animations which have the 
        * project layout set to 'Absolute', and when scaleToFit is enabled.
        */
        rescaleOnContainerResize: true, //rescales absolute layout on resize of component

        /**
        * @cfg {Function} [onStart]
        * callback for animation start. sample usage:
        * onStart: function(data) { console.log(data.html) }
        *
        * At this point, you can access and interact with the animation controller
        * (AN.Animation.getController()).
        *
        * **Note:** If the animation is hidden when it is started (e.g. in another tab), the
        * browser will likely play the animations from the start when it is first shown.
        */
        onStart: Ext.emptyFn,

        /* onLoadDone

        */
        /**
        * @cfg {Function} [onLoadDone]
        * callback for animation load. sample usage:
        * onLoadDone: function(data) { console.log(data.html) }
        */
        onLoadDone: Ext.emptyFn,

        /**
        * @cfg {Object} [scope=null]
        * Set the scope for the callback functions above.
        */
        scope: null //scope for callbacks
    },

    /**
    * @method setAnimationFolderUrl
    * @private
    */
    /**
    * @method setScaleToFit
    * @private
    */
    /**
    * @method setLazyRender
    * @private
    */
    /**
    * @method setIdPrefix
    * @private
    */
    /**
    * @method setConstrainScaleRatio
    * @private
    */
    /**
    * @method setRescaleOnContainerResize
    * @private
    */
    /**
    * @method setScope
    * @private
    */
    /**
    * @method setOnLoadDone
    * @private
    */
    /**
    * @method setOnStart
    * @private
    */

    /**
    * @method getAnimationFolderUrl
    * @private
    */
    /**
    * @method getScaleToFit
    * @private
    */
    /**
    * @method getLazyRender
    * @private
    */
    /**
    * @method getIdPrefix
    * @private
    */
    /**
    * @method getConstrainScaleRatio
    * @private
    */
    /**
    * @method getRescaleOnContainerResize
    * @private
    */
    /**
    * @method getScope
    * @private
    */
    /**
    * @method getOnLoadDone
    * @private
    */
    /**
    * @method getOnStart
    * @private
    */
    

    statics: {
        getUniqueId: (function(){
            var number = 0;
            return function(){
                return number++;
            };
        })(),

        UNLOADED: 0,
        LOADED: 1,
        LOADED_DOM: 2
    },

    loadState: null,
    loadData: null, 
    headTags: [],
    lastScalingStyle: "",

    template: [{
        style: "position: absolute; height:100%; width: 100%",
        reference: 'animationContainer'
    }],


    /**
    * Gets the animation controller if we have one. It will only return
    * a valid controller after the load is done. However, the controller
    * will not be initalized until the animation is run.
    * Use the onStart callback config to get notified when animation is first run
    * @return {AN.Controller} controller
    */
    getController: function() {
        if (this.loadData && this.loadData.controller) {
            return this.loadData.controller;
        }
        return null;
    },


    initialize: function() {
        this.loadState = this.self.UNLOADED;

        this.on('show', this.onShow, this);

        this.callParent(arguments);
    },

    onShow: function() {
        if (this.loadState === this.self.LOADED) {
            this.renderAnimation();
        }
    },

    updateAnimationFolderUrl: function(newUrl) {        
        var prefix = this.getIdPrefix() + this.self.getUniqueId() + '-';
        var loader = new AN.AnimationLoader();
        loader.loadAnimationFromFolder(newUrl, prefix, this.onLoadDone, this);
    },

    applyAnimationFolderUrl: function(url) {
        url = url.replace(/\/$/,"") + '/';
        return url;
    },

    onLoadDone: function(error, data) {
        if (error) {
            console.warn(error);
            return;
        }

        this.loadState = this.self.LOADED;
        this.loadData = data;

        this.getOnLoadDone().call(this.getScope(), data);

        this.renderAnimation();
    },

    setRendered: function(rendered) {
        this.callParent(arguments);

        if (this.waitingForRender) {
            this.waitingForRender = false;
            this.renderAnimation();
        }

    },

    renderAnimation: function() {

        if (!this.isRendered()) {
            this.waitingForRender = true;
            return;
        }

        if (this.getHidden() && this.getLazyRender()) {
            return;
        }

        if (this.loadState === this.self.LOADED_DOM) {
            return;
        }

        var resource;
        for (var i = 0; i < this.loadData.externalResources.length; i++) {
            resource = this.loadData.externalResources[i];
            if (resource.type === 'css') {
                this.createNewStyleTag(resource.data);
            } else if (resource.type === 'js') {
                this.createNewScriptTag(resource.data);
            }
        }

        if  (this.loadData.controllerConfig.layout && this.loadData.controllerConfig.layout.type === 'absolute' && this.getScaleToFit()) {

            this.doScaling();

            if (this.getRescaleOnContainerResize()) {
                this.on('resize', this.doScaling, this);
            }

        }

        this.createNewStyleTag(this.loadData.css);
        this.animationContainer.setHtml(this.loadData.html);
        this.loadData.controller.setConfig(this.loadData.controllerConfig);

        this.loadState = this.self.LOADED_DOM;

        this.getOnStart().call(this.getScope(), this.loadData);
    },

    doScaling: function() {
    
        var style = "";

        var animationWidth = parseInt(this.loadData.controllerConfig.layout.width,10);
        var animationHeight = parseInt(this.loadData.controllerConfig.layout.height,10);

        var containerWidth = this.element.getWidth();
        var containerHeight = this.element.getHeight();

        var xFactor = containerWidth / animationWidth;
        var yFactor = containerHeight / animationHeight;

        var xOffset = 0;
        var yOffset = 0;

        if (this.getConstrainScaleRatio()) {
            xFactor = yFactor = Math.min(xFactor, yFactor);

            xOffset = Math.round((containerWidth - xFactor * animationWidth) / 2);
            yOffset = Math.round((containerHeight - xFactor * animationHeight) / 2);
        }

        var origin = 'transform-origin: 0% 0%;';
        var transform = 'transform: translate('+xOffset+'px,'+yOffset+'px) scale('+xFactor+','+yFactor+');';

        var prefixes = ["", '-webkit-'];

        for (var i = 0; i < prefixes.length; i++) {
            
            style = style + prefixes[i] + origin;
            style = style + prefixes[i] + transform;
        }

        if (this.lastScalingStyle === style) {
            return;
        }

        this.animationContainer.dom.style.cssText = style;
        this.lastScalingStyle = style;

    },

    createNewStyleTag: function(style) {
        var styleTag = document.createElement('style');
        styleTag.type = "text/css";
        styleTag.innerHTML = style;
        document.getElementsByTagName('head')[0].appendChild(styleTag);
        this.headTags.push(styleTag);
        return styleTag;
    },

    createNewScriptTag: function(script) {
        var scriptTag = document.createElement('script');
        scriptTag.type = "text/javascript";
        scriptTag.innerHTML = script;
        document.getElementsByTagName('head')[0].appendChild(scriptTag);
        this.headTags.push(scriptTag);
        return scriptTag;
    },

    /**
    * Destroys the component
    */
    destroy: function() {

        for (var i = 0; i < this.headTags.length; i++) {
            Ext.fly(this.headTags[i]).destroy();
        }

        this.callParent(arguments);
    }

});


/* AN.AnimationLoader
    is a private helper class used by AN.Animation,
    this class should not be used directly.
*/
Ext.define('AN.AnimationLoader',{

    externalResources: {},

    loadAnimationFromFolder: function(folderUrl, idPrefix, callback, scope) {
        var jsonUrl = folderUrl + 'data.json';

        this.callbackScope = scope;
        this.callback = callback;
        this.idPrefix = idPrefix;
        this.folderUrl = folderUrl;

        //load url
        Ext.Ajax.request({
            url: jsonUrl,
            success: function(response){
                var text = response.responseText;
                var data;
                try {
                    data = JSON.parse(text);
                } catch (err) {
                    callback.call(scope, "Couldn't parse json file " + jsonUrl);
                    return;
                }

                this.initializeAnimation(data);

            },
            failure: function() {
                callback.call(scope, "Couldn't load json file " + jsonUrl);
            },
            scope: this
        });
    },

    initializeAnimation: function(data) {

        //fill in template/missing data
        this.fillInTemplate(data);

        //convert config to a function, so we can return config data
        var getConfig = new Function(data.js + '; return configData;');
        var config = getConfig();
        config.basePath = this.folderUrl;
        
        //setup controller
        var getControl = new Function(" var AN = undefined;" + data.controlJS + '; return AN.Controller;');
        var controllerJS = getControl();
        var controller = new controllerJS();

        //load in dependent resources
        this.loadExternalResources(config.externalResources, function(externalResources){

            var loadData = {
                css: data.css,
                html: data.html,
                controller: controller,
                controllerConfig: config,
                externalResources: externalResources
            };

            this.callback.call(this.callbackScope, false, loadData);
            
        }, this);

    },

    fillInTemplate: function(data) {
        var basePathMatch = /\{\_an\:asset\_parent\}/g;
        data.css = data.css.replace(basePathMatch, this.folderUrl);
        data.js = data.js.replace(basePathMatch, this.folderUrl);
        data.html = data.html.replace(basePathMatch, this.folderUrl);

        var prefixMatch = /\{\_an\:id\_prefix\}/g;
        data.css = data.css.replace(prefixMatch, this.idPrefix);
        data.js = data.js.replace(prefixMatch, this.idPrefix);
        data.html = data.html.replace(prefixMatch, this.idPrefix);
    },

    loadExternalResources: function(list, callback, scope) {        
        var remainingResources = list.length;
        var dataList = [];
        if (remainingResources === 0) {
            callback.call(scope,dataList);
            return;
        }
        var loadedOne = function(url) {
            remainingResources--;
            if (!remainingResources) {
                callback.call(scope, dataList);
            }
        };
        for (var i = 0; i < list.length; i++) {
            this.loadExternalResource(list[i].url, list[i].type, dataList, loadedOne, this);
        }
    },
    loadExternalResource: function(url, type, list, callback, scope) {
        if (this.externalResources[url]) {
            if (this.externalResources[url].staus === 'done') {
                callback.call(scope);
            } else {
                this.externalResources[url].callbacks.push({
                    callback: callback, scope: scope
                });
            }
            return;
        }
        this.externalResources[url] = {
            status: 'wait',
            callbacks: [{scope: scope, callback: callback}]
        };
        this.externalGet(url, function(error, data){
            if (!error && data) {
                list.push({type: type, data: data});
            } else {
                console.warn('error loading resource or resource empty: ' + url);
            }
            this.externalResources[url].status = "done";
            var callbackInfo;
            for (var i = 0; i < this.externalResources[url].callbacks.length; i++) {
                callbackInfo = this.externalResources[url].callbacks[i];
                callbackInfo.callback.call(callbackInfo.scope);
            }
        },this);
    },
    externalGet: function(url, callback, scope) {
        Ext.Ajax.request({
            url: url,
            success: function(response){
                callback.call(scope, false, response.responseText);
            },
            failure: function() {
                callback.call(scope, "Couldn't load file " + url);
            },
            scope: this
        });
    }
});