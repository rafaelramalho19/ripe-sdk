/** @namespace */
var ripe = ripe || {};

if (typeof module !== "undefined") {
    module.exports = {
        ripe: ripe
    };
}

if (typeof window === "undefined" && typeof require !== "undefined") {
    var base = require("./base");
    var ripe = base.ripe;
}

/**
 * Assigns a certain set of values in the provided object to the
 * first parameter of the call (target).
 *
 * @param {String} target The target of the assign operation meaning
 * the object to which the values will be assigned.
 */
ripe.assign = function(target) {
    if (typeof Object.assign === "function") {
        return Object.assign.apply(this, arguments);
    }

    if (target === null) {
        throw new TypeError("Cannot assign undefined or null object");
    }

    var to = Object(target);
    for (var index = 1; index < arguments.length; index++) {
        var nextSource = arguments[index];
        if (nextSource == null) {
            continue;
        }
        for (var nextKey in nextSource) {
            if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
                to[nextKey] = nextSource[nextKey];
            }
        }
    }
    return to;
};

if (typeof require !== "undefined" && typeof XMLHttpRequest === "undefined") {
    var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
}

if (typeof module !== "undefined") {
    module.exports = {
        XMLHttpRequest: XMLHttpRequest
    };
}

if (typeof window === "undefined" && typeof require !== "undefined") {
    var base = require("./base");
    var ripe = base.ripe;
}

/**
 * Class that defines an entity that can be used to interact
 * with the customizer (abstract).
 *
 * @constructor
 * @param {Object} owner The owner (customizer instance) for
 * this insteractable.
 * @param {Object} options The options to be used to configure the
 * interactable instance to be created.
 */
ripe.Interactable = function(owner, options) {
    this.owner = owner;
    this.options = options || {};

    ripe.Interactable.prototype.init.call(this);
};

/**
 * The initializer of the class, called whenever this interactable
 * is going to become active.
 */
ripe.Interactable.prototype.init = function() {};

/**
 * Callback function to be called when the owner configurator has
 * been changed and some kind of visual update should take place.
 *
 * @param {Object} state The new configuration state.
 */
ripe.Interactable.prototype.update = function(state) {};

if (typeof window === "undefined" && typeof require !== "undefined") {
    var base = require("./base");
    var ripe = base.ripe;
}

ripe.touchHandler = function(element, options) {
    if (typeof Mobile !== "undefined" && Mobile.touchHandler) {
        return;
    }

    options = options || {};
    var SAFE = options.safe === undefined ? true : options.safe;
    var VALID = options.valid || ["DIV", "IMG", "SPAN", "CANVAS"];

    var eventHandler = function(event) {
        // retrieves the complete set of touches and uses
        // only the first one for type reference
        var touches = event.changedTouches;
        var first = touches[0];
        var type = "";

        // switches over the type of touch event associating
        // the proper equivalent mouse enve to each of them
        switch (event.type) {
            case "touchstart":
                type = "mousedown";
                break;

            case "touchmove":
                type = "mousemove";
                break;

            case "touchend":
                type = "mouseup";
                break;

            default:
                return;
        }

        // verifies if the current event is considered to be valid,
        // this occurs if the target of the type of the target is
        // considered to be valid according to the current rules
        var isValid = VALID.indexOf(first.target.tagName) === -1;
        if (SAFE && isValid) {
            return;
        }

        // creates the new mouse event that will emulate the
        // touch event that has just been raised, it should
        // be completly equivalent to the original touch
        var mouseEvent = document.createEvent("MouseEvent");
        mouseEvent.initMouseEvent(type, true, true, window, 1, first.screenX,
            first.screenY, first.clientX, first.clientY, false, false, false,
            false, 0, null);

        // dispatches the event to the original target of the
        // touch event (pure emulation)
        first.target.dispatchEvent(mouseEvent);
    };

    element.addEventListener("touchstart", eventHandler, true);
    element.addEventListener("touchmove", eventHandler, true);
    element.addEventListener("touchend", eventHandler, true);
    element.addEventListener("touchcancel", eventHandler, true);
};

if (typeof window === "undefined" && typeof require !== "undefined") {
    var base = require("./base");
    var ripe = base.ripe;
}

ripe.Observable = function() {
    this.callbacks = {};
};

ripe.Observable.prototype.addCallback = function(event, callback) {
    var callbacks = this.callbacks[event] || [];
    callbacks.push(callback);
    this.callbacks[event] = callbacks;
};

ripe.Observable.prototype.removeCallback = function(event, callback) {
    var callbacks = this.callbacks[event] || [];
    if (!callback) {
        delete this.callbacks[event];
        return;
    }

    var index = callbacks.indexOf(callback);
    if (index === -1) {
        return;
    }
    callbacks.splice(index, 1);
    this.callbacks[event] = callbacks;
};

ripe.Observable.prototype.runCallbacks = function(event) {
    var callbacks = this.callbacks[event] || [];
    for (var index = 0; index < callbacks.length; index++) {
        var callback = callbacks[index];
        callback.apply(this, Array.prototype.slice.call(arguments, 1));
    }
};

ripe.Observable.prototype.bind = ripe.Observable.prototype.addCallback;
ripe.Observable.prototype.unbind = ripe.Observable.prototype.removeCallback;
ripe.Observable.prototype.trigger = ripe.Observable.prototype.runCallbacks;

if (typeof window === "undefined" && typeof require !== "undefined") {
    var base = require("./base");
    require("./observable");
    var ripe = base.ripe;
}

ripe.Ripe = function(brand, model, options) {
    ripe.Observable.call(this);
    ripe.Ripe.prototype.init.call(this, brand, model, options);
};

ripe.Ripe.prototype = Object.create(ripe.Observable.prototype);

ripe.Ripe.prototype.init = function(brand, model, options) {
    // sets the various values in the instance taking into
    // account the default values
    this.brand = brand;
    this.model = model;
    this.options = options || {};
    this.variant = this.options.variant || null;
    this.url = this.options.url || "https://sandbox.platforme.com/api/";
    this.parts = this.options.parts || {};
    this.initials = "";
    this.engraving = null;
    this.country = this.options.country || null;
    this.currency = this.options.currency || null;
    this.format = this.options.format || "jpeg";
    this.backgroundColor = this.options.backgroundColor || "";
    this.noDefaults = this.options.noDefaults === undefined ? false : this.options.noDefaults;
    this.useDefaults = this.options.useDefaults === undefined ? !this.noDefaults : this.options.useDefaults;
    this.noCombinations = this.options.noCombinations === undefined ? false : this.options.noCombinations;
    this.useCombinations = this.options.useCombinations === undefined ? !this.noCombinations : this.options.useCombinations;
    this.noPrice = this.options.noPrice === undefined ? false : this.options.noPrice;
    this.usePrice = this.options.usePrice === undefined ? !this.noPrice : this.options.usePrice;
    this.children = [];
    this.plugins = [];
    this.ready = false;

    // runs the background color normalization process that removes
    // the typical cardinal character from the definition
    this.backgroundColor = this.backgroundColor.replace("#", "");

    // determines if the defaults for the selected model should
    // be loaded so that the parts structure is initially populated
    var hasParts = this.parts && Object.keys(this.parts).length !== 0;
    var loadDefaults = !hasParts && this.useDefaults;
    var loadParts = loadDefaults ? this.getDefaults : function(callback) {
        setTimeout(callback);
    };
    loadParts.call(this, function(result) {
        result = result || this.parts;
        this.parts = result;
        this.ready = true;
        this.update();
        this.trigger("parts", this.parts);
    }.bind(this));

    // tries to determine if the combinations available should be
    // loaded for the current model and if that's the case start the
    // loading process for them, setting then the result in the instance
    var loadCombinations = this.useCombinations;
    loadCombinations && this.getCombinations(function(result) {
        this.combinations = result;
        this.trigger("combinations", this.combinations);
    }.bind(this));

    // in case the current instance already contains configured parts
    // the instance is marked as ready (for complex resolution like price)
    this.ready = hasParts;
};

ripe.Ripe.prototype.load = function() {
    this.update();
};

ripe.Ripe.prototype.unload = function() {};

ripe.Ripe.prototype.setPart = function(part, material, color, noUpdate) {
    this._setPart(part, material, color, true);
    if (noUpdate) {
        return;
    }
    this.update();
    this.trigger("parts", this.parts);
};

ripe.Ripe.prototype.setParts = function(update, noUpdate) {
    for (var index = 0; index < update.length; index++) {
        var part = update[index];
        this._setPart(part[0], part[1], part[2], true);
    }

    if (noUpdate) {
        return;
    }

    this.update();
    this.trigger("parts", this.parts);
};

ripe.Ripe.prototype.setInitials = function(initials, engraving, noUpdate) {
    this.initials = initials;
    this.engraving = engraving;

    if (noUpdate) {
        return;
    }
    this.update();
};

ripe.Ripe.prototype.getFrames = function(callback) {
    if (this.options.frames) {
        callback(this.options.frames);
        return;
    }

    this.getConfig(function(config) {
        var frames = {};
        var faces = config["faces"];
        for (var index = 0; index < faces.length; index++) {
            var face = faces[index];
            frames[face] = 1;
        }

        var sideFrames = config["frames"];
        frames["side"] = sideFrames;
        callback && callback(frames);
    });
};

ripe.Ripe.prototype.bindImage = function(element, options) {
    var image = new ripe.Image(this, element, options);
    return this.bindInteractable(image);
};

ripe.Ripe.prototype.bindConfigurator = function(element, options) {
    var config = new ripe.Configurator(this, element, options);
    return this.bindInteractable(config);
};

ripe.Ripe.prototype.bindInteractable = function(child) {
    this.children.push(child);
    return child;
};

ripe.Ripe.prototype.selectPart = function(part, options) {
    this.trigger("selected_part", part);
};

ripe.Ripe.prototype.deselectPart = function(part, options) {
    this.trigger("deselected_part", part);
};

ripe.Ripe.prototype.update = function(state) {
    state = state || this._getState();

    for (var index = 0; index < this.children.length; index++) {
        var child = this.children[index];
        child.update(state);
    }

    this.ready && this.trigger("update");

    this.ready && this.usePrice && this.getPrice(function(value) {
        this.trigger("price", value);
    }.bind(this));
};

ripe.Ripe.prototype.addPlugin = function(plugin) {
    plugin.register(this);
    this.plugins.push(plugin);
};

ripe.Ripe.prototype.removePlugin = function(plugin) {
    plugin.unregister(this);
    this.plugins.splice(this.plugins.indexOf(plugin), 1);
};

ripe.Ripe.prototype._getState = function() {
    return {
        parts: this.parts,
        initials: this.initials,
        engraving: this.engraving
    };
};

ripe.Ripe.prototype._setPart = function(part, material, color) {
    var value = this.parts[part];
    value.material = material;
    value.color = color;
    this.parts[part] = value;
    this.trigger("part", value);
};

var Ripe = ripe.Ripe;

if (typeof window === "undefined" && typeof require !== "undefined") {
    var base = require("./base");
    var ripe = base.ripe;
}

ripe.createElement = function(tagName, className) {
    var element = tagName && document.createElement(tagName);
    element.className = className || "";
    return element;
};

ripe.animateProperty = function(element, property, initial, final, duration, callback) {
    // sets the initial value for the property
    element.style[property] = initial;
    var last = new Date();

    var frame = function() {
        // checks how much time has passed since the last animation frame
        var current = new Date();
        var timeDelta = current - last;
        var animationDelta = timeDelta * (final - initial) / duration;

        // adjusts the value by the correspondent amount
        // making sure it doens't surpass the final value
        var value = parseFloat(element.style[property]);
        value += animationDelta;
        value = final > initial ? Math.min(value, final) : Math.max(value, final);
        element.style[property] = value;
        last = current;

        // checks if the animation has finished and if it is then
        // fires the callback if it's set. Otherwise, requests a
        // new animation frame to proceed with the animation
        var incrementAnimation = final > initial && value < final;
        var decrementAnimation = final < initial && value > final;
        if (incrementAnimation || decrementAnimation) {
            // sets the id of the animation frame on the element
            // so that it can be canceled if necessary
            var id = requestAnimationFrame(frame);
            element.dataset.animation_id = id;
        } else {
            callback && callback();
        }
    };

    // starts the animation process by runnig the initial
    // call to the frame animation function
    frame();
};

ripe.getFrameKey = function(view, position, token) {
    token = token || "-";
    return view + token + position;
};

ripe.parseFrameKey = function(frame, token) {
    token = token || "-";
    return frame.split(token);
};

ripe.frameNameHack = function(frame) {
    if (!frame) {
        return "";
    }
    var _frame = ripe.parseFrameKey(frame);
    var view = _frame[0];
    var position = _frame[1];
    position = view === "side" ? position : view;
    return position;
};

ripe.fixEvent = function(event) {
    if (event.hasOwnProperty("offsetX") && event.offsetX !== undefined) {
        return event;
    }

    var _target = event.target || event.srcElement;
    var rect = _target.getBoundingClientRect();
    event.offsetX = event.clientX - rect.left;
    event.offsetY = event.clientY - rect.top;
    return event;
};

ripe.clone = function(object) {
    if (object === undefined) {
        return object;
    }
    var objectS = JSON.stringify(object);
    return JSON.parse(objectS);
};

if (typeof window === "undefined" && typeof require !== "undefined") {
    var base = require("./base");
    var compat = require("./compat");
    require("./ripe");
    var ripe = base.ripe;
    var XMLHttpRequest = compat.XMLHttpRequest;
}

ripe.Ripe.prototype.getConfig = function(options, callback) {
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" ? {} : options;
    var configURL = this._getConfigURL();
    return this._requestURL(configURL, callback);
};

ripe.Ripe.prototype.getPrice = function(options, callback) {
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" ? {} : options;
    var priceURL = this._getPriceURL();
    return this._requestURL(priceURL, callback);
};

ripe.Ripe.prototype.getDefaults = function(options, callback) {
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" ? {} : options;
    var defaultsURL = this._getDefaultsURL();
    return this._requestURL(defaultsURL, function(result) {
        callback(result ? result.parts : null);
    });
};

ripe.Ripe.prototype.getCombinations = function(options, callback) {
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" ? {} : options;
    var combinationsURL = this._getCombinationsURL();
    return this._requestURL(combinationsURL, function(result) {
        callback && callback(result.combinations);
    });
};

ripe.Ripe.prototype.sizeToNative = function(scale, value, gender, callback) {
    var query = "scale=" + scale + "&value=" + value + "&gender=" + gender;
    var fullUrl = this.url + "sizes/size_to_native?" + query;
    return this._requestURL(fullUrl, function(result) {
        callback && callback(result);
    });
};

ripe.Ripe.prototype.sizeToNativeB = function(scales, values, genders, callback) {
    var query = "";
    var scale = null;
    var value = null;
    var gender = null;
    for (var index = 0; index < scales.length; index++) {
        scale = scales[index];
        value = values[index];
        gender = genders[index];
        var prefix = index === 0 ? "" : "&";
        query += prefix + "scales=" + scale + "&values=" + value + "&genders=" + gender;
    }

    var fullUrl = this.url + "sizes/size_to_native_b?" + query;
    return this._requestURL(fullUrl, function(result) {
        callback && callback(result);
    });
};

ripe.Ripe.prototype.nativeToSize = function(scale, value, gender, callback) {
    var query = "scale=" + scale + "&value=" + value + "&gender=" + gender;
    var fullUrl = this.url + "sizes/native_to_size?" + query;
    return this._requestURL(fullUrl, function(result) {
        callback && callback(result);
    });
};

ripe.Ripe.prototype.nativeToSizeB = function(scales, values, genders, callback) {
    var query = "";
    var scale = null;
    var value = null;
    var gender = null;
    for (var index = 0; index < scales.length; index++) {
        scale = scales[index];
        value = values[index];
        gender = genders[index];
        var prefix = index === 0 ? "" : "&";
        query += prefix + "scales=" + scale + "&values=" + value + "&genders=" + gender;
    }

    var fullUrl = this.url + "sizes/native_to_size_b?" + query;
    return this._requestURL(fullUrl, function(result) {
        callback && callback(result);
    });
};

ripe.Ripe.prototype._requestURL = function(url, callback) {
    var context = this;
    var request = new XMLHttpRequest();
    request.addEventListener("load", function() {
        var isValid = this.status === 200;
        var result = JSON.parse(this.responseText);
        callback && callback.call(context, isValid ? result : null);
    });
    request.open("GET", url);
    request.send();
    return request;
};

ripe.Ripe.prototype._getQuery = function(options) {
    options = options || {};

    var buffer = [];
    var brand = options.brand || this.brand;
    var model = options.model || this.model;
    var variant = options.variant || this.variant;
    var frame = options.frame || this.frame;
    var parts = options.parts || this.parts;
    var engraving = options.engraving || this.engraving;
    var country = options.country || this.country;
    var currency = options.currency || this.currency;

    brand && buffer.push("brand=" + brand);
    model && buffer.push("model=" + model);
    variant && buffer.push("variant=" + variant);
    frame && buffer.push("frame=" + frame);

    for (var part in parts) {
        var value = parts[part];
        var material = value.material;
        var color = value.color;
        if (!material) {
            continue;
        }
        if (!color) {
            continue;
        }
        buffer.push("p=" + part + ":" + material + ":" + color);
    }

    engraving && buffer.push("engraving=" + engraving);
    country && buffer.push("country=" + country);
    currency && buffer.push("currency=" + currency);
    return buffer.join("&");
};

ripe.Ripe.prototype._getConfigURL = function(brand, model, variant) {
    brand = brand || this.brand;
    model = model || this.model;
    variant = variant || this.variant;
    var fullUrl = this.url + "brands/" + brand + "/models/" + model + "/config";
    if (variant) {
        fullUrl += "?variant=" + variant;
    }
    return fullUrl;
};

ripe.Ripe.prototype._getPriceURL = function(options) {
    var query = this._getQuery(options);
    return this.url + "config/price" + "?" + query;
};

ripe.Ripe.prototype._getDefaultsURL = function(brand, model, variant) {
    brand = brand || this.brand;
    model = model || this.model;
    variant = variant || this.variant;
    var fullUrl = this.url + "brands/" + brand + "/models/" + model + "/defaults";
    fullUrl += variant ? "?variant=" + variant : "";
    return fullUrl;
};

ripe.Ripe.prototype._getCombinationsURL = function(brand, model, variant, useName) {
    brand = brand || this.brand;
    model = model || this.model;
    variant = variant || this.variant;
    var useNameS = useName ? "1" : "0";
    var query = "use_name=" + useNameS;
    query += variant ? "&variant=" + variant : "";
    return this.url + "brands/" + brand + "/models/" + model + "/combinations" + "?" + query;
};

ripe.Ripe.prototype._getImageURL = function(options) {
    var query = this._getQuery(options);
    query += options.format ? "&format=" + options.format : "";
    query += options.width ? "&width=" + options.width : "";
    query += options.height ? "&height=" + options.height : "";
    query += options.size ? "&size=" + options.size : "";
    query += options.background ? "&background=" + options.background : "";
    query += options.crop ? "&crop=" + (options.crop ? 1 : 0) : "";
    query += options.profile ? "&initials_profile=" + options.profile.join(",") : "";

    var initials = options.initials === "" ? "$empty" : options.initials;
    query += initials ? "&initials=" + initials : "";

    return this.url + "compose?" + query;
};

ripe.Ripe.prototype._getMaskURL = function(options) {
    options = options || {};
    options.parts = options.parts || {};
    var query = this._getQuery(options);
    if (options.part) {
        query += "&part=" + options.part;
    }
    return this.url + "mask?" + query;
};

var ripe = ripe || {};
ripe.Ripe = ripe.Ripe || {};
ripe.Ripe.plugins = ripe.Ripe.plugins || {};

ripe.Ripe.plugins.Plugin = function() {};

ripe.Ripe.plugins.Plugin.prototype.register = function(owner) {
    this.owner = owner;
};

ripe.Ripe.plugins.Plugin.prototype.unregister = function(owner) {
    this.owner = null;
};

if (typeof module !== "undefined") {
    module.exports = {
        ripe: ripe
    };
}

if (typeof window === "undefined" && typeof require !== "undefined") {
    var base = require("./base");
    var ripe = base.ripe;
}

ripe.Ripe.plugins = ripe.Ripe.plugins || {};

ripe.Ripe.plugins.SyncPlugin = function(rules, options) {
    options = options || {};
    this.rules = rules;
};

ripe.Ripe.plugins.SyncPlugin.prototype = Object.create(ripe.Ripe.plugins.Plugin.prototype);

ripe.Ripe.plugins.SyncPlugin.prototype.register = function(owner) {
    ripe.Ripe.plugins.Plugin.prototype.register.call(this, owner);

    // binds to the part event to change the necessary parts
    // so that they comply with the product's sync rules
    this.owner.bind("part", function(newPart) {
        for (var key in this.rules) {
            // if a part was selected and it is part of
            // the rule then its value is used otherwise
            // the first part of the rule is used
            var rule = this.rules[key];
            var part = newPart && rule.indexOf(newPart.name) !== -1 ? newPart.name : rule[0];
            var value = this.owner.parts[part];

            // iterates through the parts of the rule and
            // sets their material and color to be the same
            // of the reference part
            for (var index = 0; index < rule.length; index++) {
                var _part = rule[index];
                this.owner.parts[_part].material = value.material;
                this.owner.parts[_part].color = value.color;
            }
        }
    }.bind(this));

    // resets the current selection to trigger the sync operation
    var initialParts = ripe.clone(this.owner.parts);
    this.owner.setParts(initialParts);
};

if (typeof window === "undefined" && typeof require !== "undefined") {
    var base = require("../base");
    var ripe = base.ripe;
}

ripe.Visual = function(owner, element, options) {
    ripe.Observable.call(this);
    ripe.Interactable.call(this, owner, options);

    this.element = element;
    ripe.Visual.prototype.init.call(this);
};

ripe.assign(ripe.Visual.prototype, ripe.Observable.prototype);
ripe.assign(ripe.Visual.prototype, ripe.Interactable.prototype);
ripe.Visual.constructor = ripe.Visual;

ripe.Visual.prototype.init = function() {};

if (typeof window === "undefined" && typeof require !== "undefined") {
    var base = require("../base");
    require("./visual");
    var ripe = base.ripe;
}

ripe.Configurator = function(owner, element, options) {
    ripe.Visual.call(this, owner, element, options);
    ripe.Configurator.prototype.init.call(this, options);
};

ripe.Configurator.prototype = Object.create(ripe.Visual.prototype);

ripe.Configurator.prototype.init = function() {
    this.width = this.options.width || 1000;
    this.height = this.options.height || 1000;
    this.size = this.options.size || null;
    this.maxSize = this.options.maxSize || 1000;
    this.sensitivity = this.options.sensitivity || 40;
    this.verticalThreshold = this.options.verticalThreshold || 15;
    this.interval = this.options.interval || 0;
    this.maskOpacity = this.options.maskOpacity || 0.4;
    this.maskDuration = this.options.maskDuration || 150;
    this.noMasks = this.options.noMasks === undefined ? true : this.options.noMasks;
    this.useMasks = this.options.useMasks === undefined ? !this.noMasks : this.options.useMasks;
    this.view = this.options.view || "side";
    this.position = this.options.position || 0;
    this.ready = false;

    // creates a structure the store the last presented
    // position of each view, to be used when returning
    // to a view for better user experience
    this._lastFrame = {};

    // ues the owner to retrieve the complete set of frames
    // that are available for the current model and runs
    // the intial layout update operation on result
    this.owner.getFrames(function(frames) {
        this.frames = frames;
        this._initLayout();
        this.ready = true;
        this.update();
    }.bind(this));

    // creates a set of sorted parts to be used on the
    // highlight operation (considers only the default ones)
    this.partsList = [];
    this.owner.getConfig(function(config) {
        var defaults = config.defaults;
        this.hiddenParts = config.hidden;
        this.partsList = Object.keys(defaults);
        this.partsList.sort();
    }.bind(this));

    this.owner.bind("parts", function(parts) {
        this.parts = parts;
    });

    this.owner.bind("selected_part", function(part) {
        this.highlight(part);
    }.bind(this));

    this.owner.bind("deselected_part", function(part) {
        this.lowlight();
    }.bind(this));
};

ripe.Configurator.prototype.resize = function(size) {
    if (this.element === undefined) {
        return;
    }

    size = size || this.element.clientWidth;
    if (this.currentSize === size) {
        return;
    }

    var area = this.element.querySelector(".area");
    var frontMask = this.element.querySelector(".front-mask");
    var back = this.element.querySelector(".back");
    var mask = this.element.querySelector(".mask");
    area.width = size;
    area.height = size;
    frontMask.width = size;
    frontMask.height = size;
    frontMask.style.width = size + "px";
    frontMask.style.marginLeft = "-" + String(size) + "px";
    back.width = size;
    back.height = size;
    back.style.marginLeft = "-" + String(size) + "px";
    mask.width = size;
    mask.height = size;
    this.currentSize = size;
    this.update({}, {
        force: true
    });
};

ripe.Configurator.prototype.update = function(state, options) {
    options = options || {};

    if (this.ready === false) {
        return;
    }

    var view = this.element.dataset.view;
    var position = this.element.dataset.position;
    var size = this.element.dataset.size || this.size;
    var width = size || this.element.dataset.width || this.width;
    var height = size || this.element.dataset.height || this.height;

    var animate = options.animate || false;
    var force = options.force || false;
    var duration = options.duration;
    var callback = options.callback;

    // checks if the parts drawed on the target have
    // changed and animates the transition if they did
    var previous = this.signature || "";
    var signature = this.owner._getQuery() + "&width=" + String(width) + "&height=" + String(height);
    var changed = signature !== previous;
    animate = animate || (changed && "simple");
    this.signature = signature;

    // if the parts and the position haven't changed
    // since the last frame load then ignores the
    // load request and returns immediately
    previous = this.unique;
    var unique = signature + "&view=" + String(view) + "&position=" + String(position);
    if (previous === unique && !force) {
        callback && callback();
        return false;
    }
    this.unique = unique;

    // runs the load operation for the current frame, taking into
    // account the multiple requirements for such execution
    this._loadFrame(view, position, {
        draw: true,
        animate: animate,
        duration: duration
    }, callback);

    // runs the pre-loading process so that the remaining frames are
    // loaded for a smother experience when dragging the element,
    // note that this is only performed in case this is not a single
    // based update (not just the loading of the current position)
    // and the current signature has changed
    var preloaded = this.element.classList.contains("preload");
    var mustPreload = changed || !preloaded;
    mustPreload && this._preload(this.options.useChain);
};

ripe.Configurator.prototype.changeFrame = function(frame, options) {
    var _frame = ripe.parseFrameKey(frame);
    var nextView = _frame[0];
    var nextPosition = parseInt(_frame[1]);

    options = options || {};
    var duration = options.duration || this.duration;
    var type = options.type;
    var preventDrag = options.preventDrag === undefined ? true : options.preventDrag;

    var view = this.element.dataset.view;
    var position = parseInt(this.element.dataset.position);

    var viewFrames = this.frames[nextView];
    if (!viewFrames || nextPosition >= viewFrames) {
        throw new RangeError("Frame " + frame + " is not supported.");
    }

    // removes any part highlight in case it is set
    // to replicate the behaviour of dragging the product
    this.lowlight();

    // saves the position of the current view
    // so that it returns to the same position
    // when coming back to the same view
    this._lastFrame[view] = position;
    this.element.dataset.position = nextPosition;

    // if there is a new view and the product supports
    // it then animates the transition with a crossfade
    // and ignores all drag movements while it lasts
    var animate = false;
    if (view !== nextView && viewFrames !== undefined) {
        this.element.dataset.view = nextView;
        animate = "cross";
    }

    // if an animation duration was provided then changes
    // to the next step instead of the target frame
    var stepDuration = 0;
    if (duration) {
        animate = type || animate;

        // calculates the number of steps of
        // the animation and the step duration
        var stepCount = view !== nextView ? 1 : nextPosition - position;
        stepDuration = duration / Math.abs(stepCount);
        options.duration = duration - stepDuration;

        // determines the next step and sets it
        // as the position
        var stepPosition = stepCount !== 0 ? position + stepCount / stepCount : position;
        stepPosition = stepPosition % viewFrames;
        this.element.dataset.position = stepPosition;
    }

    // determines if the current change frame operation
    // is an animated one or if it's a discrete one
    var animated = Boolean(duration);

    // if the frame change is animated and preventDrag is true
    // then ignores drag movements until the animation is finished
    preventDrag = preventDrag && (animate || duration);
    preventDrag && this.element.classList.add("no-drag", "animating");

    var newFrame = ripe.getFrameKey(
        this.element.dataset.view,
        this.element.dataset.position
    );
    this.trigger("changed_frame", newFrame);
    this.update({}, {
        animate: animate,
        duration: stepDuration,
        callback: function() {
            // if there is no step transition or the transition
            // has finished, then allows drag movements again,
            // otherwise waits the provided interval and
            // proceeds to the next step
            if (!animated || stepPosition === nextPosition) {
                preventDrag && this.element.classList.remove("no-drag", "animating");
            } else {
                var timeout = animate ? 0 : stepDuration;
                setTimeout(function() {
                    this.changeFrame(frame, options);
                }.bind(this), timeout);
            }
        }.bind(this)
    });
};

ripe.Configurator.prototype.highlight = function(part, options) {
    // verifiers if masks are meant to be used for the current model
    // and if that's not the case returns immediately
    if (!this.useMasks) {
        return;
    }

    // captures the current context to be used by clojure callbacks
    var self = this;

    // runs the default operation for the parameters that this
    // function receives
    options = options || {};

    // determines the current position of the configurator so that
    // the proper mask URL may be created and properly loaded
    var view = this.element.dataset.view;
    var position = this.element.dataset.position;
    var frame = ripe.getFrameKey(view, position);
    var backgroundColor = options.backgroundColor || this.backgroundColor;
    var size = this.element.dataset.size || this.size;
    var width = size || this.element.dataset.width || this.width;
    var height = size || this.element.dataset.height || this.height;
    var maskOpacity = this.element.dataset.mask_opacity || this.maskOpacity;
    var maskDuration = this.element.dataset.mask_duration || this.maskDuration;

    // adds the highlight class to the current target configurator meaning
    // that the front mask is currently active and showing info
    this.element.classList.add("highlight");

    // constructs the full URL of the mask image that is going to be
    // set for the current highlight operation (to be determined)
    var url = this.owner._getMaskURL({
        frame: ripe.frameNameHack(frame),
        size: size,
        width: width,
        height: height,
        color: backgroundColor,
        part: part
    });

    var frontMask = this.element.querySelector(".front-mask");
    var src = frontMask.getAttribute("src");
    if (src === url) {
        return;
    }
    var frontMaskLoad = function() {
        this.classList.add("loaded");
        this.classList.add("highlight");
        self.trigger("highlighted_part", part);
    };
    frontMask.removeEventListener("load", frontMaskLoad);
    frontMask.addEventListener("load", frontMaskLoad);
    frontMask.addEventListener("error", function() {
        this.setAttribute("src", "");
    });
    frontMask.setAttribute("src", url);

    var animationId = frontMask.dataset.animation_id;
    cancelAnimationFrame(animationId);
    ripe.animateProperty(frontMask, "opacity", 0, maskOpacity, maskDuration);
};

ripe.Configurator.prototype.lowlight = function(options) {
    // verifiers if masks are meant to be used for the current model
    // and if that's not the case returns immediately
    if (!this.useMasks) {
        return;
    }

    // retrieves the reference to the current front mask and removes
    // the highlight associated classes from it and the configurator
    var frontMask = this.element.querySelector(".front-mask");
    frontMask.classList.remove("highlight");
    this.element.classList.remove("highlight");
};

ripe.Configurator.prototype.enterFullscreen = function(options) {
    if (this.element === undefined) {
        return;
    }
    this.element.classList.add("fullscreen");
    var maxSize = this.element.dataset.max_size || this.maxSize;
    this.resize(maxSize);
};

ripe.Configurator.prototype.leaveFullscreen = function(options) {
    if (this.element === undefined) {
        return;
    }
    this.element.classList.remove("fullscreen");
    this.resize();
};

ripe.Configurator.prototype._initLayout = function() {
    // clears the elements children
    while (this.element.firstChild) {
        this.element.removeChild(this.element.firstChild);
    }

    // sets the element's style so that it supports two canvas
    // on top of each other so that double buffering can be used
    this.element.classList.add("configurator");

    // creates the area canvas and adds it to the element
    var area = ripe.createElement("canvas", "area");
    var context = area.getContext("2d");
    context.globalCompositeOperation = "multiply";
    this.element.appendChild(area);

    // adds the front mask element to the element,
    // this will be used to highlight parts
    var frontMask = ripe.createElement("img", "front-mask");
    this.element.appendChild(frontMask);

    // creates the back canvas and adds it to the element,
    // placing it on top of the area canvas
    var back = ripe.createElement("canvas", "back");
    var backContext = back.getContext("2d");
    backContext.globalCompositeOperation = "multiply";
    this.element.appendChild(back);

    // creates the mask element that will de used to display
    // the mask on top of an highlighted or selected part
    var mask = ripe.createElement("canvas", "mask");
    this.element.appendChild(mask);

    // adds the framesBuffer placeholder element that will be used to
    // temporarily store the images of the product's frames
    var framesBuffer = ripe.createElement("div", "frames-buffer");

    // creates a masksBuffer element that will be used to store the various
    // mask images to be used during highlight and select operation
    var masksBuffer = ripe.createElement("div", "masks-buffer");

    // creates two image elements for each frame and
    // appends them to the frames and masks buffers
    for (var view in this.frames) {
        var viewFrames = this.frames[view];
        for (var index = 0; index < viewFrames; index++) {
            var frameBuffer = ripe.createElement("img");
            frameBuffer.dataset.frame = ripe.getFrameKey(view, index);
            framesBuffer.appendChild(frameBuffer);
            var maskBuffer = frameBuffer.cloneNode(true);
            masksBuffer.appendChild(maskBuffer);
        }
    }
    this.element.appendChild(framesBuffer);
    this.element.appendChild(masksBuffer);

    // set the size of area, frontMask, back and mask
    this.resize();

    // sets the initial view and position
    this.element.dataset.view = this.view;
    this.element.dataset.position = this.position;

    // register for all the necessary DOM events
    this._registerHandlers();
};

ripe.Configurator.prototype._loadFrame = function(view, position, options, callback) {
    // runs the defaulting operation on all of the parameters
    // sent to the load frame operation (defaulting)
    view = view || this.element.dataset.view || "side";
    position = position || this.element.dataset.position || 0;
    options = options || {};

    var frame = ripe.getFrameKey(view, position);

    var size = this.element.dataset.size || this.size;
    var width = size || this.element.dataset.width || this.width;
    var height = size || this.element.dataset.height || this.height;

    var draw = options.draw === undefined || options.draw;
    var animate = options.animate;
    var duration = options.duration;
    var framesBuffer = this.element.querySelector(".frames-buffer");
    var masksBuffer = this.element.querySelector(".masks-buffer");
    var area = this.element.querySelector(".area");
    var image = framesBuffer.querySelector("img[data-frame='" + String(frame) + "']");
    var front = area.querySelector("img[data-frame='" + String(frame) + "']");
    var maskImage = masksBuffer.querySelector("img[data-frame='" + String(frame) + "']");
    image = image || front;

    // constructs the URL for the mask and updates it
    this._loadMask(maskImage, view, position, options);

    // builds the URL that will be set on the image
    var url = this.owner._getImageURL({
        frame: ripe.frameNameHack(frame),
        size: size,
        width: width,
        height: height
    });

    // creates a callback to be called when the frame
    // is drawn to trigger the callback passed to this
    // function if it's set
    var drawCallback = function() {
        callback && callback();
    };

    // verifies if the loading of the current image
    // is considered redundant (already loaded or
    // loading) and avoids for performance reasons
    var isRedundant = image.dataset.src === url;
    if (isRedundant) {
        if (!draw) {
            callback && callback();
            return;
        }
        var isReady = image.dataset.loaded === "true";
        isReady && this._drawFrame(image, animate, duration, drawCallback);
        return;
    }

    // adds load callback to the image to
    // draw the frame when it is available
    image.onload = function() {
        image.dataset.loaded = true;
        image.dataset.src = url;
        if (!draw) {
            callback && callback();
            return;
        }
        this._drawFrame(image, animate, duration, drawCallback);
    }.bind(this);

    // sets the src of the image to trigger the request
    // and sets loaded to false to indicate that the
    // image is not yet loading
    image.src = url;
    image.dataset.src = url;
    image.dataset.loaded = false;
};

ripe.Configurator.prototype._loadMask = function(maskImage, view, position, options) {
    // constructs the URL for the mask and then at the end of the
    // mask loading process runs the final update of the mask canvas
    // operation that will allow new highlight and selection operation
    // to be performed according to the new frame value
    var self = this;
    if (maskImage.dataset.src) {
        setTimeout(function() {
            self._drawMask(maskImage);
        }, 150);
    } else {
        var backgroundColor = options.backgroundColor || this.backgroundColor;
        var size = this.element.dataset.size || this.size;
        var width = size || this.element.dataset.width || this.width;
        var height = size || this.element.dataset.height || this.height;
        var frame = ripe.getFrameKey(view, position);
        var url = this.owner._getMaskURL({
            frame: ripe.frameNameHack(frame),
            size: size,
            width: width,
            height: height,
            color: backgroundColor
        });

        maskImage.onload = function() {
            setTimeout(function() {
                self._drawMask(maskImage);
            }, 150);
        };
        maskImage.addEventListener("error", function() {
            this.setAttribute("src", null);
        });
        maskImage.crossOrigin = "Anonymous";
        maskImage.dataset.src = url;
        maskImage.setAttribute("src", url);
    }
};

ripe.Configurator.prototype._drawMask = function(maskImage) {
    var mask = this.element.querySelector(".mask");
    var maskContext = mask.getContext("2d");
    maskContext.clearRect(0, 0, mask.width, mask.height);
    maskContext.drawImage(maskImage, 0, 0, mask.width, mask.height);
};

ripe.Configurator.prototype._drawFrame = function(image, animate, duration, callback) {
    var area = this.element.querySelector(".area");
    var back = this.element.querySelector(".back");

    var visible = area.dataset.visible === "true";
    var current = visible ? area : back;
    var target = visible ? back : area;
    var context = target.getContext("2d");
    context.clearRect(0, 0, target.clientWidth, target.clientHeight);
    context.drawImage(image, 0, 0, target.clientWidth, target.clientHeight);

    target.dataset.visible = true;
    current.dataset.visible = false;

    if (!animate) {
        current.style.zIndex = 1;
        current.style.opacity = 0;
        target.style.zIndex = 1;
        target.style.opacity = 1;
        callback && callback();
        return;
    }

    var currentId = current.dataset.animation_id;
    var targetId = target.dataset.animation_id;
    currentId && cancelAnimationFrame(parseInt(currentId));
    targetId && cancelAnimationFrame(parseInt(targetId));

    duration = duration || (animate === "immediate" ? 0 : 500);
    if (animate === "cross") {
        ripe.animateProperty(current, "opacity", 1, 0, duration);
    }

    ripe.animateProperty(target, "opacity", 0, 1, duration, function() {
        current.style.opacity = 0;
        current.style.zIndex = 1;
        target.style.zIndex = 1;
        callback && callback();
    });
};

ripe.Configurator.prototype._preload = function(useChain) {
    var position = this.element.dataset.position || 0;
    var index = this.index || 0;
    index++;
    this.index = index;
    this.element.classList.add("preload");

    // adds all the frames to the work pile
    var work = [];
    for (var view in this.frames) {
        var viewFrames = this.frames[view];
        for (var _index = 0; _index < viewFrames; _index++) {
            if (_index === position) {
                continue;
            }
            var frame = ripe.getFrameKey(view, _index);
            work.push(frame);
        }
    }
    work.reverse();

    var self = this;
    var mark = function(element) {
        var _index = self.index;
        if (index !== _index) {
            return;
        }

        // removes the preloading class from the image element
        // and retrieves all the images still preloading,
        element.classList.remove("preloading");
        var framesBuffer = self.element.querySelector(".frames-buffer");
        var pending = framesBuffer.querySelectorAll("img.preloading") || [];

        // if there are images preloading then adds the
        // preloading class to the target element and
        // prevents drag movements to avoid flickering
        // else and if there are no images preloading and no
        // frames yet to be preloaded then the preload
        // is considered finished so drag movements are
        // allowed again and the loaded event is triggered
        if (pending.length > 0) {
            self.element.classList.add("preloading");
            self.element.classList.add("no-drag");
        } else if (work.length === 0) {
            self.element.classList.remove("preloading");
            self.element.classList.remove("no-drag");
            self.trigger("loaded");
        }
    };

    var render = function() {
        var _index = self.index;
        if (index !== _index) {
            return;
        }
        if (work.length === 0) {
            return;
        }

        // retrieves the next frame to be loaded
        // and its corresponding image element
        // and adds the preloading class to it
        var frame = work.pop();
        var framesBuffer = self.element.querySelector(".frames-buffer");
        var reference = framesBuffer.querySelector("img[data-frame='" + String(frame) + "']");
        reference.classList.add("preloading");

        // if a chain base loaded is used then
        // marks the current frame as pre-loaded
        // and proceeds to the next frame
        var callbackChain = function() {
            mark(reference);
            render();
        };

        // if all the images are pre-loaded at the
        // time then just marks the current one as
        // pre-loaded
        var callbackMark = function() {
            mark(reference);
        };

        // determines if a chain based loading should be used for the
        // pre-loading process of the various image resources to be loaded
        var _frame = ripe.parseFrameKey(frame);
        var view = _frame[0];
        var position = _frame[1];
        self._loadFrame(view, position, {
            draw: false
        }, useChain ? callbackChain : callbackMark);
        !useChain && render();
    };

    // if there are frames to be loaded then adds the
    // preloading class, prevents drag movements and
    // starts the render process after a timeout
    work.length > 0 && this.element.classList.add("preloading");
    if (work.length > 0) {
        this.element.classList.add("no-drag");
        setTimeout(function() {
            render();
        }, 250);
    }
};

ripe.Configurator.prototype._registerHandlers = function() {
    // captures the current context to be used inside clojures
    var self = this;

    // retrieves the reference to the multiple elements that
    // are going to be used for event handler operations
    var area = this.element.querySelector(".area");
    var back = this.element.querySelector(".back");

    // registes for the selected part event on the owner
    // so that we can highlight the associated part
    this.owner.bind("selected_part", function(part) {
        this.highlight(part);
    }.bind(this));

    // binds the mousedown event on the element to prepare
    // it for drag movements
    this.element.addEventListener("mousedown", function(event) {
        var _element = this;
        _element.dataset.view = _element.dataset.view || "side";
        self.base = _element.dataset.position || 0;
        self.down = true;
        self.referenceX = event.pageX;
        self.referenceY = event.pageY;
        self.percent = 0;
        _element.classList.add("drag");
    });

    // listens for mouseup events and if it occurs then
    // stops reacting to mouse move events has drag movements
    this.element.addEventListener("mouseup", function(event) {
        var _element = this;
        self.down = false;
        self.percent = 0;
        self.previous = self.percent;
        _element.classList.remove("drag");
    });

    // listens for mouse leave events and if it occurs then
    // stops reacting to mousemove events has drag movements
    this.element.addEventListener("mouseleave", function(event) {
        var _element = this;
        self.down = false;
        self.percent = 0;
        self.previous = self.percent;
        _element.classList.remove("drag");
    });

    // if a mouse move event is triggered while the mouse is
    // pressed down then updates the position of the drag element
    this.element.addEventListener("mousemove", function(event) {
        if (this.classList.contains("no-drag")) {
            return;
        }
        var down = self.down;
        self.mousePosX = event.pageX;
        self.mousePosY = event.pageY;
        down && self._parseDrag();
    });

    area.addEventListener("click", function(event) {
        var preloading = self.element.classList.contains("preloading");
        var animating = self.element.classList.contains("animating");
        if (preloading || animating) {
            return;
        }
        event = ripe.fixEvent(event);
        var index = self._getCanvasIndex(this, event.offsetX, event.offsetY);
        if (index === 0) {
            return;
        }

        // retrieves the reference to the part name by using the index
        // extracted from the masks image (typical strategy for retrieval)
        var part = self.partsList[index - 1];
        self.hiddenParts.indexOf(part) === -1 && self.owner.selectPart(part);
        event.stopPropagation();
    });

    area.addEventListener("mousemove", function(event) {
        var preloading = self.element.classList.contains("preloading");
        var animating = self.element.classList.contains("animating");
        if (preloading || animating) {
            return;
        }
        event = ripe.fixEvent(event);
        var index = self._getCanvasIndex(this, event.offsetX, event.offsetY);

        // in case the index that was found is the zero one this is a special
        // position and the associated operation is the removal of the highlight
        // also if the target is being dragged the highlight should be removed
        if (index === 0 || self.down === true) {
            self.lowlight();
            return;
        }

        // retrieves the reference to the part name by using the index
        // extracted from the masks image (typical strategy for retrieval)
        var part = self.partsList[index - 1];
        self.hiddenParts.indexOf(part) === -1 && self.highlight(part);
    });

    area.addEventListener("dragstart", function(event) {
        event.preventDefault();
    });

    back.addEventListener("click", function(event) {
        var preloading = self.element.classList.contains("preloading");
        var animating = self.element.classList.contains("animating");
        if (preloading || animating) {
            return;
        }
        event = ripe.fixEvent(event);
        var index = self._getCanvasIndex(this, event.offsetX, event.offsetY);
        if (index === 0) {
            return;
        }

        // retrieves the reference to the part name by using the index
        // extracted from the masks image (typical strategy for retrieval)
        var part = self.partsList[index - 1];
        self.hiddenParts.indexOf(part) === -1 && self.owner.selectPart(part);
        event.stopPropagation();
    });

    back.addEventListener("mousemove", function(event) {
        var preloading = self.element.classList.contains("preloading");
        var animating = self.element.classList.contains("animating");
        if (preloading || animating) {
            return;
        }
        event = ripe.fixEvent(event);
        var index = self._getCanvasIndex(this, event.offsetX, event.offsetY);

        // in case the index that was found is the zero one this is a special
        // position and the associated operation is the removal of the highlight
        // also if the target is being dragged the highlight should be removed
        if (index === 0 || self.down === true) {
            self.lowlight();
            return;
        }

        // retrieves the reference to the part name by using the index
        // extracted from the masks image (typical strategy for retrieval)
        var part = self.partsList[index - 1];
        self.hiddenParts.indexOf(part) === -1 && self.highlight(part);
    });

    back.addEventListener("dragstart", function(event) {
        event.preventDefault();
    });

    // listens for attribute changes to redraw the configurator
    // if needed, this makes use of the mutation observer
    var Observer = MutationObserver || WebKitMutationObserver;
    var observer = Observer ? new Observer(function(mutations) {
        for (var index = 0; index < mutations.length; index++) {
            var mutation = mutations[index];
            mutation.type === "style" && self.resize();
            mutation.type === "attributes" && self.update();
        }
    }) : null;
    observer && observer.observe(this.element, {
        attributes: true,
        subtree: false,
        characterData: true
    });

    // adds handlers for the touch events so that they get
    // parsed to mouse events for the configurator element,
    // taking into account that there may be a touch handler
    // already defined
    ripe.touchHandler(this.element);
};

ripe.Configurator.prototype._parseDrag = function() {
    // retrieves the last recorded mouse position
    // and the current one and calculates the
    // drag movement made by the user
    var child = this.element.querySelector("*:first-child");
    var referenceX = this.referenceX;
    var referenceY = this.referenceY;
    var mousePosX = this.mousePosX;
    var mousePosY = this.mousePosY;
    var base = this.base;
    var deltaX = referenceX - mousePosX;
    var deltaY = referenceY - mousePosY;
    var elementWidth = this.element.clientWidth;
    var elementHeight = this.element.clientHeight || child.clientHeight;
    var percentX = deltaX / elementWidth;
    var percentY = deltaY / elementHeight;
    this.percent = percentX;
    var sensitivity = this.element.dataset.sensitivity || this.sensitivity;
    var verticalThreshold = this.element.dataset.verticalThreshold || this.verticalThreshold;

    // if the drag was vertical then alters the
    // view if it is supported by the product
    var view = this.element.dataset.view;
    var nextView = view;
    if (sensitivity * percentY > verticalThreshold) {
        nextView = view === "top" ? "side" : "bottom";
        this.referenceY = mousePosY;
    } else if (sensitivity * percentY < -verticalThreshold) {
        nextView = view === "bottom" ? "side" : "top";
        this.referenceY = mousePosY;
    }
    if (this.frames[nextView] === undefined) {
        nextView = view;
    }

    // retrieves the current view and its frames
    // and determines which one is the next frame
    var viewFrames = this.frames[nextView];
    var nextPosition = parseInt(base - (sensitivity * percentX)) % viewFrames;
    nextPosition = nextPosition >= 0 ? nextPosition : viewFrames + nextPosition;

    // if the view changes then uses the last
    // position presented in that view, if not
    // then shows the next position according
    // to the drag
    nextPosition = view === nextView ? nextPosition : (this._lastFrame[nextView] || 0);

    var nextFrame = ripe.getFrameKey(nextView, nextPosition);
    this.changeFrame(nextFrame);
};

ripe.Configurator.prototype._getCanvasIndex = function(canvas, x, y) {
    var canvasRealWidth = canvas.getBoundingClientRect().width;
    var mask = this.element.querySelector(".mask");
    var ratio = mask.width && canvasRealWidth && mask.width / canvasRealWidth;
    x = parseInt(x * ratio);
    y = parseInt(y * ratio);

    var maskContext = mask.getContext("2d");
    var pixel = maskContext.getImageData(x, y, 1, 1);
    var r = pixel.data[0];
    var index = parseInt(r);

    return index;
};

if (typeof window === "undefined" && typeof require !== "undefined") {
    var base = require("../base");
    require("./visual");
    var ripe = base.ripe;
}

ripe.Image = function(owner, element, options) {
    ripe.Visual.call(this, owner, element, options);
    ripe.Image.prototype.init.call(this);
};

ripe.Image.prototype = Object.create(ripe.Visual.prototype);

ripe.Image.prototype.init = function() {
    this.frame = this.options.frame || 0;
    this.size = this.options.size || 1000;
    this.width = this.options.width || null;
    this.height = this.options.height || null;
    this.crop = this.options.crop || false;
    this.showInitials = this.options.showInitials || false;
    this.initialsBuilder = this.options.initialsBuilder || function(initials, engraving, element) {
        return {
            initials: initials,
            profile: [engraving]
        };
    };

    this._registerHandlers();
};

ripe.Image.prototype.update = function(state) {
    var frame = this.element.dataset.frame || this.frame;
    var size = this.element.dataset.size || this.size;
    var width = this.element.dataset.width || this.width;
    var height = this.element.dataset.height || this.height;
    var crop = this.element.dataset.crop || this.crop;

    this.initials = state !== undefined ? state.initials : this.initials;
    this.engraving = state !== undefined ? state.engraving : this.engraving;

    var initialsSpec = this.showInitials ? this.initialsBuilder(this.initials, this.engraving, this.element) : {};

    var url = this.owner._getImageURL({
        frame: ripe.frameNameHack(frame),
        size: size,
        width: width,
        height: height,
        crop: crop,
        initials: initialsSpec.initials,
        profile: initialsSpec.profile
    });
    if (this.element.src === url) {
        return;
    }
    this.element.width = width;
    this.element.height = height;
    this.element.src = url;
};

ripe.Image.prototype.setFrame = function(frame, options) {
    this.frame = frame;
    this.update();
};

ripe.Image.prototype.setInitialsBuilder = function(builder, options) {
    this.initialsBuilder = builder;
    this.update();
};

ripe.Image.prototype._registerHandlers = function() {
    this.element.addEventListener("load", function() {
        this.trigger("loaded");
    }.bind(this));
    var Observer = MutationObserver || WebKitMutationObserver;
    var observer = Observer ? new Observer(function(mutations) {
        this.update();
    }.bind(this)) : null;
    observer && observer.observe(this.element, {
        attributes: true,
        subtree: false
    });
};
