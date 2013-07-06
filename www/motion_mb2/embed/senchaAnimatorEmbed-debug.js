/*!
 * Sencha Animator 2013, all rights reserved
 */

(function(AN){

   /**
   * @class AN.AnimationInstance
   * A container for each animation inserted into the page. You can't create
   * it directly, but it will be returned by AN.PageManager. Typically you will get
   * a private subclass of AN.AnimationInstance back. 
   *
   * Getting the animation controller and replaying the current scene:
   *     
   *     var controller = instance.getController();
   *     if (controller) {
   *         controller.restartScene();
   *     }
   *
   *
   * Checking if the animation instance is loaded:
   *
   *     if (instance.getLoadStatus() === AN.AnimationInstance.LOADED) {
   *         console.log('Animation Loaded');
   *     }
   *
   */

    AN.AnimationInstance = function(config, manager) {
        this.config = config;
        this.sharedResources = [];
        this.controller = null;
        this.manager = manager;
        this.loadStatus = AN.AnimationInstance.UNLOADED;
    };


    /**
    * @property {Number} UNLOADED The state number of an unloaded animation
    * @static
    * @readonly
    */
    AN.AnimationInstance.UNLOADED = 0;
     /**
    * @property {Number} LOADED The state number of an loaded animation
    * @static
    * @readonly
    */
    AN.AnimationInstance.LOADED = 1;
     /**
    * @property {Number} ERROR The state number of an animation that ran into an error while loading.
    * @static
    * @readonly
    */
    AN.AnimationInstance.ERROR = 2;

    /**
    * Returns the animation controller for the animation if available. It will return null
    * if controller is not avilable yet. To get the controller when first available, see
    * the config options on AN.PageManager.loadAnimation
    *
    * Example: Getting the controller.
    *
    *     var controller = instance.getController();
    *     if (controller) {
    *         controller.restartScene();
    *     }
    *
    * @return {AN.Controller} Animation Controller or null.
    */
    AN.AnimationInstance.prototype.getController = function() {
        return this.controller;
    };
    /**
    * Destroys the animation and it's elements. 
    *
    * Example: Destroying animation while leaving the parent element.
    *
    *     instance.destroy({leaveParent: true});
    *
    * @param {Object} [config] Configuration
    * @param {Boolean} [config.leaveParent=false] if set to true, the top-level parent will not be
    * removed when destroying the animation.
    */
    AN.AnimationInstance.prototype.destroy = function() {
        this.manager.removeAnimation(this);
    };

    /**
    * Gets the load status of the animation.
    *
    * Example: Checking if the animation instance is loaded.
    *
    *     if (instance.getLoadStatus() === AN.AnimationInstance.LOADED) {
    *         console.log('Animation Loaded');
    *     }
    *
    * See AN.AnimationInstance.UNLOADED, AN.AnimationInstance.LOADED and AN.AnimationInstance.ERROR for
    * possible return values.
    *
    * @return {Number} Load state of the animation
    */
    AN.AnimationInstance.prototype.getLoadStatus = function() {
        return this.loadStatus;
    };

    AN.AnimationInstance.prototype.setLoadStatus = function(status) {
        if (status === this.loadStatus) {
            return;
        }

        this.loadStatus = status;

        if (status === AN.AnimationInstance.LOADED) {
            if (this.config.onLoad) {
                this.config.onLoad.call(this.config.scope, this);
            }
        }
        if (status === AN.AnimationInstance.ERROR) {
            if (this.config.onError) {
                this.config.onError.call(this.config.scope, this);
            }
        }
    };

    AN.AnimationInstance.prototype.beforeRun = function() {
        if (this.config.onBeforeRun) {
            this.config.onBeforeRun.call(this.config.scope, this, this.data.config);
        }
    };

    AN.AnimationInstance.newFromConfig = function(config, manager) {
        if (config.isIframe) {
            return new AN.AnimationIframeInstance(config, manager);
        } else {
            return new AN.AnimationTagInstance(config, manager);
        }
    };

    AN.AnimationIframeInstance = function() {
        AN.AnimationInstance.apply(this, arguments);

        if (this.config.onLoad) {
            var me = this;
            var timeout = this.config.timeout || 30;
            var startTime = Date.now();
            var interval = setInterval(function(){

                var duration = (Date.now() - startTime) / 1000;
                var status;

                if (duration > timeout) {
                    status = AN.AnimationInstance.ERROR;
                } else {
                    status = me.getLoadStatus();
                }

                me.setLoadStatus(status);

                if (status !== AN.AnimationInstance.UNLOADED) {
                    clearInterval(interval);
                }

            },250);     
        }
    };
    
    AN.AnimationIframeInstance.prototype = new AN.AnimationInstance();
    AN.AnimationIframeInstance.prototype.constructor=AN.AnimationIframeInstance;
    AN.AnimationIframeInstance.prototype.getController = function() {

        var iframe = this.config.element;
        var controller = null;
        try {
            controller = iframe.contentWindow.AN.instances.controllers[0];
        } catch (error) {
            console.error('Iframe/Controller not fully loaded');
        }
        return controller;
    };

    AN.AnimationIframeInstance.prototype.destroy = function(config) {
        config = config || {};

        if (!config.leaveParent) {
            this.config.element.parentNode.removeChild(this.config.element);
        } else {
            this.config.element.src = "";
        }

        this.config.element = null;

        AN.AnimationInstance.prototype.destroy.call(this);
        
    };

    AN.AnimationIframeInstance.prototype.getLoadStatus = function() {

        var loaded, controller;

        try {
            controller = this.config.element.contentWindow.AN.instances.controllers[0];
        } catch (error) {
            controller = false;
        }

        try {
            loaded = (this.config.element.contentDocument.readyState === 'complete' && this.config.element.contentDocument.location.host);
        } catch (error) {
            loaded = false;
        }

        if (loaded && controller) {
            return AN.AnimationInstance.LOADED;
        } else {
            return AN.AnimationInstance.UNLOADED;
        }
    };

    AN.AnimationTagInstance = function() {
        AN.AnimationInstance.apply(this, arguments);       
    };

    AN.AnimationTagInstance.prototype = new AN.AnimationInstance();
    AN.AnimationTagInstance.prototype.constructor=AN.AnimationTagInstance;

    AN.AnimationTagInstance.prototype.destroy = function(config) {

        config = config || {};

        if (!config.leaveParent) {
            this.config.element.parentNode.removeChild(this.config.element);
        } else {
            while (this.config.element.hasChildNodes()) {
                this.config.element.removeChild(this.config.element.lastChild);
            }
        }

        for (var i = 0; i < this.sharedResources.length; i++) {
            this.sharedResources[i].refCount--;
            if (this.sharedResources[i].refCount < 1) {
                this.sharedResources[i].element.parentNode.removeChild(this.sharedResources[i].element);
            }
        }

        this.sharedResources = null;

        AN.AnimationInstance.prototype.destroy.call(this);
    };

    /**
   * @class AN.PageManager
   * @singleton
   * AN.PageManager is responsible for managing and embedding animations from Sencha Animator
   * into pages. When first loaded or when the page is ready, PageManager will search for any 
   * elements with the "data-sencha-anim-url" attribute set with a relative url pointing towards
   * the export folder from Animator and automatically load these animations.
   *
   * Example: Manually loading in an animation, and jumping to the next scene when loaded
   *
   *     var instance = AN.PageManager.loadAnimation('some-element-id', "path/to/animation/folder", {
   *         onLoad: function(instance) {
   *             var controller = instance.getController();
   *             controller.goToNextScene();
   *         },
   *         onError: function() {
   *            console.log('Error occured while loading the animation');
   *         }
   *     });
   *
   *
   * Example: Setting up a div to automatically embed an animation on page load
   *
   *     <div data-sencha-anim-url="path/to/animation/folder"></div>
   * 
   */

    AN.PageManager = {
        version: 2,
        animations: [],
        externalResources: {},
        uniqueId: 0,
        idPrefix: window.SENCHA_ANIMATOR_PREFIX_ID || "a",
        loaded: false,
        run: function() {

            if (this.loaded) {
                return;
            }

            this.loaded = true;

            var pageAnimations = this.findAnimationsPlaceholders();
            this.fetchAnimations(pageAnimations);
            this.animations = this.animations.concat(pageAnimations);
        },
        runOnDomContentLoaded: function() {
            var me = this;
            document.addEventListener('DOMContentLoaded', function(){
                me.run();
            }, false);
        },
        getUniqueId: function() {
            return this.uniqueId++;
        },
        /**
        * Returns an array of all animations instances managed.
        * @return {AN.AnimationInstance[]} Array of animation instances
        */
        getAnimations: function() {
            return this.animations.slice(0);
        },
        /**
        * Loads an Animation into an element and returns the animation instance.
        * 
        * Example: Manually loading in an animation, and jumping to the next scene when loaded
        *
        *     var instance = AN.PageManager.loadAnimation('some-element-id', "path/to/animation", {
        *         onLoad: function(instance) {
        *             var controller = instance.getController();
        *             controller.goToNextScene();
        *         },
        *         onError: function() {
        *            console.log('Error occured while loading the animation');
        *         }
        *     });
        *
        * @param {String/HTMLElement} element Id of a dom element or a dom element. Typically, a `DIV` element will
        * be most useful. For better seperation an `IFRAME` element can also be used, but at the cost of 
        * less accurate callbacks.
        * @param {String} url The relative url to the animation export folder. e.g. `"my/animation/car"`
        * @param {Object} [config] Configuration options
        * @param {Function} [config.onBeforeRun] Function to be called before the animation controller is setup.
        * Two arguments will be passed to the function, the animation instance and the animation configuration.
        * The configuration can be manually edited here, and it will be passed to the Animation Controller once
        * the function returns. e.g. function(instance, config) {...}
        * ** Note **: This will not work for animations loaded through iframes.
        * @param {Function} [config.onLoad] Function to be called when load is complete and animation is setup and 
        * started. The animation instance is passed as an argument to the function. e.g. function(instance) {...}
        * @param {Function} [config.onError] Function to be called when an error occurs during the loading of
        * the animation. The animation instance is passed as an argument to the function. 
        * @param {Function} [config.scope] The scope used for the callback functions
        * e.g. function(instance) {...}
        *
        * @return {AN.AnimationInstance} Animation instance
        */
        loadAnimation: function(element, url, config) {

            config = config || {};

            if (typeof element === 'string') {
                element = document.getElementById(element);
            }

            if (!element) {
                console.warn('Invalid element');
                return false;
            }

            config.element = element;
            config.url = this.getBaseUrl(url);
            config.isIframe = this.isIframeElement(element);

            var animInfo = AN.AnimationInstance.newFromConfig(config, this);
            
            this.fetchAnimation(animInfo);
            this.animations.push(animInfo);

            return animInfo;
        },
        findAnimationsPlaceholders: function() {
            var anims = [];
            var elements = document.querySelectorAll('[data-sencha-anim-url]');

            var animInstance, animElement;
            for (var i = 0; i < elements.length; i++) {
                animElement = elements[i];
                animInstance = AN.AnimationInstance.newFromConfig({
                    element: animElement,
                    url: this.getBaseUrl(animElement.getAttribute('data-sencha-anim-url')),
                    isIframe: this.isIframeElement(animElement)
                }, this);

                anims.push(animInstance);
            }
            return anims;
        },
        removeAnimation: function(anim) {
            var index = this.animations.indexOf(anim);
            if (index !== -1) {
                this.animations.splice(index,1);
            }
        },
        getBaseUrl: function(baseUrl) {
            if (baseUrl.length > 0 && baseUrl.charAt(baseUrl.length - 1) !== "/" ) {
                baseUrl = baseUrl + "/";
            }
            return baseUrl;
        },
        isIframeElement: function(element) {
            return (element.nodeName === "IFRAME");
        },
        fetchAnimations: function(animations) {
            for (var i=0; i < animations.length; i++) {
                this.fetchAnimation(animations[i]);
            }
        },
        fetchAnimation: function(animation) {
            if (animation.config.isIframe) {
                this.fetchIframeAnimation(animation);
            } else {
                this.fetchJSONAnimation(animation);
            }
        },
        fetchJSONAnimation: function(animation) {
            var url = animation.config.url + "data.json";
            this.externalGet(url, function(success, data){
                if (success) {
                    this.receivedJSONAnimation(animation, data);
                } else {
                    animation.setLoadStatus(AN.AnimationInstance.ERROR);
                }
            },this);
        },
        fetchIframeAnimation: function(animation) {
            this.loadAnimDataIntoIframe(animation);
        },
        receivedJSONAnimation: function(animation, json) {
            try {
                animation.data = JSON.parse(json);
            } catch (error) {
                console.warn('Was not able to parse JSON for ' + animation.config.url + ' msg: ' + error);
                return;
            }
            
            //add basepath
            var basePathMatch = /\{\_an\:asset\_parent\}/g;
            animation.data.css = animation.data.css.replace(basePathMatch, animation.config.url);
            animation.data.js = animation.data.js.replace(basePathMatch, animation.config.url);
            animation.data.html = animation.data.html.replace(basePathMatch, animation.config.url);

            //add prefix
            var prefix = this.idPrefix + this.getUniqueId() + '-';
            var prefixMatch = /\{\_an\:id\_prefix\}/g;
            animation.data.css = animation.data.css.replace(prefixMatch, prefix);
            animation.data.js = animation.data.js.replace(prefixMatch, prefix);
            animation.data.html = animation.data.html.replace(prefixMatch, prefix);

            this.loadAnimDataIntoDiv(animation);

        },
        
        loadAnimDataIntoDiv: function(anim) {
            anim.config.element.innerHTML = anim.data.html;
            if (anim.config.element.childNodes[0]) {
                anim.config.element.childNodes[0].style.overflow = 'hidden';
            }
            anim.config.styleTag = this.createNewStyleTag(anim.data.css);

            var getConfig = new Function(anim.data.js + '; return configData;');
            anim.data.config = getConfig();
            anim.data.config.basePath = anim.config.url;
            
            var getControl = new Function(" var AN = undefined;" + anim.data.controlJS + '; return AN.Controller;');
            var controllerJS = getControl();

            this.loadExternalResources(anim.data.config.externalResources, anim, function(error){

                if (error) {
                    anim.setLoadStatus(AN.AnimationInstance.ERROR);
                    return;
                }
                var controller = new controllerJS();
                anim.controller = controller;
                anim.beforeRun();

                controller.setConfig(anim.data.config);
                anim.setLoadStatus(AN.AnimationInstance.LOADED);                
            }, this);
            
        },
        loadAnimDataIntoIframe: function (anim) {
            anim.config.element.src = anim.config.url + 'index.html';
            anim.config.element.style.borderWidth = "0";
            anim.config.element.scrolling="no";
        },
        loadExternalResources: function(list, anim, callback, scope) {
            var remaingingResources = list.length;
            if (remaingingResources === 0) {
                callback.call(scope);
                return;
            }
            var hadError = false;
            var loadedOne = function(resourceInfo, error) {
                if (error) {
                    hadError = true;
                }
                anim.sharedResources.push(resourceInfo);
                remaingingResources--;
                if (!remaingingResources) {
                    callback.call(scope, hadError);
                }
            };
            for (var i = 0; i < list.length; i++) {
                this.loadExternalResource(list[i].url, list[i].type, loadedOne, this);
            }
        },
        loadExternalResource: function(url, type, callback, scope) {
            if (this.externalResources[url]) {
                if (this.externalResources[url].staus === 'done') {
                    callback.call(scope, this.externalResources[url], false);
                } else if (this.externalResources[url].staus === 'error') {
                    callback.call(scope, this.externalResources[url], true);
                } else {
                    this.externalResources[url].callbacks.push({
                        callback: callback, scope: scope
                    });
                }
                this.externalResources[url].refCount++;
                return;
            }
            this.externalResources[url] = {
                status: 'wait',
                callbacks: [{scope: scope, callback: callback}],
                refCount: 1
            };
            this.externalGet(url, function(success, data){
                if (success) {
                    if (type === 'css') {
                        this.externalResources[url].element = this.createNewStyleTag(data);
                    } else if (type === 'js') {
                        this.externalResources[url].element = this.createNewScriptTag(data);
                    }
                    this.externalResources[url].status = "done";
                } else {
                    this.externalResources[url].status = "error";
                }
                var callbackInfo;
                for (var i = 0; i < this.externalResources[url].callbacks.length; i++) {
                    callbackInfo = this.externalResources[url].callbacks[i];
                    callbackInfo.callback.call(callbackInfo.scope, this.externalResources[url], !success);
                }
            },this);
        },

        externalGet: function(url, callback, scope) {
            var request = new XMLHttpRequest();
            request.open('GET', url, true);
            request.onload = function (event) {
                if (request.status === 200 || request.status === 0) {
                    callback.call(scope, true, request.responseText);
                } else {
                    callback.call(scope, false);
                }
            };
            request.onerror = function() {
                callback.call(scope, false);
            };
            request.send(null);
        },
        createNewStyleTag: function(style) {
            var styleTag = document.createElement('style');
            styleTag.type = "text/css";
            styleTag.innerHTML = style;
            document.getElementsByTagName('head')[0].appendChild(styleTag);
            return styleTag;
        },
        createNewScriptTag: function(script) {
            var scriptTag = document.createElement('script');
            scriptTag.type = "text/javascript";
            scriptTag.innerHTML = script;
            document.getElementsByTagName('head')[0].appendChild(scriptTag);
            return scriptTag;
        }

    };
    if (!AN.disableAutorun) {
        AN.PageManager.runOnDomContentLoaded();
    }
    
})(window.AN = window.AN || {});