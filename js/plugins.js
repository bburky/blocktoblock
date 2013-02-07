// Avoid `console` errors in browsers that lack a console.
(function() {
    var method;
    var noop = function () {};
    var methods = [
        'assert', 'clear', 'count', 'debug', 'dir', 'dirxml', 'error',
        'exception', 'group', 'groupCollapsed', 'groupEnd', 'info', 'log',
        'markTimeline', 'profile', 'profileEnd', 'table', 'time', 'timeEnd',
        'timeStamp', 'trace', 'warn'
    ];
    var length = methods.length;
    var console = (window.console = window.console || {});

    while (length--) {
        method = methods[length];

        // Only stub undefined methods.
        if (!console[method]) {
            console[method] = noop;
        }
    }
}());

// Place any jQuery/helper plugins in here.

var Renderer = (function($) {

    "use strict";

    // Data URI template to create SVG images
    var svgTemplate = "data:image/svg+xml," +
           "<svg xmlns='http://www.w3.org/2000/svg' width='${width}' height='${height}'>" +
             "<foreignObject width='100%' height='100%'>" +
               "${html}" +
             "</foreignObject>" +
           "</svg>";


    /**
     * Renderer provides some basic text rendering tools for <canvas>
     *
     * Set <target> canvas as a paramter.
     *
     * WARNING: This operation taint the <canvas> on Firefox 8 and Chrome 13.
     * Not usable yet.
     *
     * https://bugzilla.mozilla.org/show_bug.cgi?id=672013
     */
    function Renderer(cfg) {
        $.extend(this, cfg);
    }

    Renderer.prototype = {

        /**
         * Target canvas
         */
        canvas : null,


        /*
         * Async callback which is called when the rendering is done.
         */
        callback : null,

        /**
         * CSS formatting of the target text.
         *
         * <div> width and height will be explicitly set to the <canvas> dimensions.
         */
        css : {

            "color" : "black",

            "background" : "white",

            "vertical-align" : "top",

            "text-align"  : "left",

            "font-size" : "16px",

            "font-color" : "black",

            "font-family" : "Helvetica"

        },



        /**
         * Render text using current formatting paramaters.
         *
         * Cleverly delegate heavy lifting to jQuery.
         */
        renderText : function(text) {

            var wrapper = $("<div>");
            var div = $("<div>");

            div.attr("xmlns", 'http://www.w3.org/1999/xhtml');
            wrapper.append(div);

            var css = $.extend({}, this.css);

            css.width = this.canvas.width + "px";
            css.height = this.canvas.height  + "px";

            div.css(this.css);

            div.text(text);

            var html = wrapper.html();

            var svg = this.cookSVG(html);

            console.log("renderText(), svg is "+ svg);

            this.renderSVGOnCanvas(svg);

        },

        renderHTML : function(text) {

            var wrapper = $("<div>");
            var div = $("<div>");

            div.attr("xmlns", 'http://www.w3.org/1999/xhtml');
            wrapper.append(div);

            var css = $.extend({}, this.css);

            css.width = this.canvas.width + "px";
            css.height = this.canvas.height  + "px";

            div.css(this.css);

            div.html(text);

            var html = wrapper.html();

            var svg = this.cookSVG(html);

            console.log("renderText(), svg is "+ svg);

            this.renderSVGOnCanvas(svg);

        },

        /**
         * Generate SVG image source code as data URI
         */
        cookSVG : function(html) {
           var data = {
               width : this.canvas.width,
               height : this.canvas.height,
               html : html
           };

           var svg = svgTemplate;

           $.each(data, function(key, value) {
               svg = svg.replace("${" + key + "}", value);
           });

           return svg;
        },

        /**
         * Generate Image object by data URL, render it and report when done.
         */
        renderSVGOnCanvas : function(svg) {
            var img = new Image();
            var ctx = this.canvas.getContext("2d");
            var self = this;

            img.onload = function() {
                console.log("SVG drawImage()");
                console.log(img.naturalWidth);
                console.log(img.naturalHeight);
                ctx.drawImage(img, 0, 0);
                if(self.callback) {
                    self.callback();
                }
            };
            img.src = svg;

            ctx.font = "bold 12px sans-serif";
            ctx.fillStyle = "#000000";
            // ctx.fillText("Foobar", 10, 10);
        }

    };

    //
    // public API
    //

    return {
        Renderer : Renderer
    };

})(jQuery).Renderer;

/*
Copyright 2013 Mike Dunn
http://upshots.org/
Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
(function($){
    
    $.fn.getStyles = function(only, except){
        
        // the map to return with requested styles and values as KVP
        var product = {};
        
        // the style object from the DOM element we need to iterate through
        var style;
        
        // recycle the name of the style attribute
        var name;
        
        // if it's a limited list, no need to run through the entire style object
        if(only && only instanceof Array){
            
            for(var i = 0, l = only.length; i < l; i++){
                // since we have the name already, just return via built-in .css method
                name = only[i];
                product[name] = this.css(name);
            }
            
        } else {
            
            // otherwise, we need to get everything
            var dom = this.get(0);
            
            // standards
            if (window.getComputedStyle) {
                
                // convenience methods to turn css case ('background-image') to camel ('backgroundImage')
                var pattern = /\-([a-z])/g;
                var uc = function (a, b) {
                        return b.toUpperCase();
                };          
                var camelize = function(string){
                    return string.replace(pattern, uc);
                };
                
                // make sure we're getting a good reference
                if (style = window.getComputedStyle(dom, null)) {
                    var camel, value;
                    // opera doesn't give back style.length - use truthy since a 0 length may as well be skipped anyways
                    if (style.length) {
                        for (var i = 0, l = style.length; i < l; i++) {
                            name = style[i];
                            camel = camelize(name);
                            value = style.getPropertyValue(name);
                            product[camel] = value;
                        }
                    } else {
                        // opera
                        for (name in style) {
                            camel = camelize(name);
                            value = style.getPropertyValue(name) || style[name];
                            product[camel] = value;
                        }
                    }
                }
            }
            // IE - first try currentStyle, then normal style object - don't bother with runtimeStyle
            else if (style = dom.currentStyle) {
                for (name in style) {
                    product[name] = style[name];
                }
            }
            else if (style = dom.style) {
                for (name in style) {
                    if (typeof style[name] != 'function') {
                        product[name] = style[name];
                    }
                }
            }
            
        }
        
        // remove any styles specified...
        // be careful on blacklist - sometimes vendor-specific values aren't obvious but will be visible...  e.g., excepting 'color' will still let '-webkit-text-fill-color' through, which will in fact color the text
        if(except && except instanceof Array){
            for(var i = 0, l = except.length; i < l; i++){
                name = except[i];
                delete product[name];
            }
        }
        
        // one way out so we can process blacklist in one spot
        return product;
    
    };
    
    // sugar - source is the selector, dom element or jQuery instance to copy from - only and except are optional
    $.fn.copyCSS = function(source, only, except){
        var styles = $(source).getStyles(only, except);
        this.css(styles);
    };
    
})(jQuery);
