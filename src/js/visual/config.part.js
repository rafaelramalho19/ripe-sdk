var ripe = ripe || {};

ripe.Config = function(owner, element, options) {
    ripe.Visual.call(this, owner, element, options);
    ripe.Config.prototype.init.call(this, options);
};

ripe.Config.prototype = Object.create(ripe.Visual.prototype);

ripe.Config.prototype.init = function() {
    this.maxSize = this.element.dataset.max_size || this.options.maxSize || 1000;
    this.sensitivity = this.element.dataset.sensitivity || this.options.sensitivity || 40;

    this.owner.bind("selected_part", function(part) {
        this.highlight(part);
    }.bind(this));

    this.ready = false;

    // creates a structure the store the last presented
    // position of each view, to be used when returning
    // to a view for better user experience
    this._lastFrame = {};

    this.owner.bind("frames", function(frames) {
        this.frames = frames;
        this._initLayout();
        this.ready = true;
        this.update();
    }.bind(this));
};

ripe.Config.prototype.resize = function(size) {
    if (this.element === undefined) {
        return;
    }

    size = size || this.element.clientWidth || this.options.size;
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
    this.element.dataset.current_size = size;
    this.update();
};

ripe.Config.prototype.update = function(state, options) {
    if (this.ready === false) {
        return;
    }

    var view = this.element.dataset.view;
    var position = this.element.dataset.position;
    options = options || {};
    var animate = options.animate || false;
    var callback = options.callback;

    // checks if the parts drawed on the target have
    // changed and animates the transition if they did
    var previous = this.element.dataset.signature || "";
    var signature = this.owner._getQuery();
    var changed = signature !== previous;
    animate = animate || (changed && "simple");
    this.element.dataset.signature = signature;

    // if the parts and the position haven't changed
    // since the last frame load then ignores the
    // load request and returns immediately
    var size = this.element.getAttribute("data-current-size");
    previous = this.element.dataset.unique;
    var unique = signature + "&view=" + String(view) + "&position=" + String(position) + "&size=" + String(size);
    if (previous === unique) {
        callback && callback();
        return false;
    }
    this.element.dataset.unique = unique;

    // runs the load operation for the current frame
    this._loadFrame(view, position, {
            draw: true,
            animate: animate
        },
        callback
    );

    // runs the pre-loading process so that the remaining frames are
    // loaded for a smother experience when dragging the element,
    // note that this is only performed in case this is not a single
    // based update (not just the loading of the current position)
    // and the current signature has changed
    var preloaded = this.element.classList.contains("preload");
    var mustPreload = changed || !preloaded;
    mustPreload && this._preload(this.options.useChain);
};

ripe.Config.prototype.changeFrame = function(frame, options) {
    var _frame = ripe.parseFrameKey(frame);
    var nextView = _frame[0];
    var nextPosition = _frame[1];

    options = options || {};
    var step = options.step;
    var interval = options.interval || this.options.interval || 0;
    var preventDrag = options.preventDrag === undefined ? true : options.preventDrag;

    var view = this.element.dataset.view;
    var position = this.element.dataset.position;

    // saves the position of the current view
    // so that it returns to the same position
    // when coming back to the same view
    this._lastFrame[view] = position;

    // if there is a new view and the product supports
    // it then animates the transition with a crossfade
    // and ignores all drag movements while it lasts
    var animate = false;
    var viewFrames = this.frames[nextView];
    if (view !== nextView && viewFrames !== undefined) {
        view = nextView;
        animate = "cross";
    }

    this.element.dataset.view = view;
    this.element.dataset.position = nextPosition;

    // if an animation step was provided then changes
    // to the next step instead of the target frame
    if (step) {
        var stepPosition = (parseInt(position) + step) % viewFrames;
        stepPosition = stepPosition < 0 ? viewFrames + stepPosition : stepPosition;
        if (step > 0 && stepPosition > nextPosition) {
            stepPosition = nextPosition;
        } else if (step < 0 && stepPosition < nextPosition) {
            stepPosition = nextPosition;
        }
        this.element.dataset.position = stepPosition;
    }

    // determines if the current change frame operation
    // is an animated one or if it's a discrete one
    var animated = Boolean(step);

    // if the frame change is animated and preventDrag is true
    // then ignores drag movements until the animation is finished
    preventDrag = preventDrag && (animate || step);
    preventDrag && this.element.classList.add("noDrag");

    var newFrame = ripe.getFrameKey(this.element.dataset.view, this.element.dataset.position);
    this._runCallbacks("changed_frame", newFrame);
    this.update({}, {
        animate: animate,
        callback: function() {
            // if there is no step transition
            // or the transition has finished
            // then allows drag movements again
            if (!animated || stepPosition == nextPosition) {
                preventDrag && this.element.classList.remove("noDrag");

            }

            // otherwise waits the provided interval
            // and proceeds to the next step
            else {
                setTimeout(function() {
                    this.changeFrame(frame, options);
                }.bind(this), interval);
            }
        }.bind(this)
    });
};

ripe.Config.prototype.highlight = function(part, options) {
    // adds the highlight class to the current target configurator meaning
    // that the front mask is currently active and showing info
    this.element.classList.add("highlight");

    // determines the current position of the configurator so that
    // the proper mask url may be created and properly loaded
    var view = this.element.dataset.view;
    var position = this.element.dataset.position;
    position = (view && view !== "side") ? view : position;
    options = options || {};
    var format = options.format || this.format;
    var backgroundColor = options.backgroundColor || this.backgroundColor;
    var size = options.size || this.element.clientWidth;

    // constructs the full url of the mask image that is going to be
    // set for the current highlight operation (to be determined)
    var url = this.url + "mask";
    var query = "?model=" + this.model + "&frame=" + position + "&part=" + part;
    var fullUrl = url + query + "&format=" + format;
    fullUrl += backgroundColor ? "&background=" + backgroundColor : "";
    fullUrl += size ? "&size=" + String(size) : "";

    var frontMask = this.element.querySelector(".front-mask");
    var src = frontMask.getAttribute("src");
    if (src === fullUrl) {
        return;
    }

    var self = this;
    var frontMaskLoad = function() {
        this.classList.add("loaded");
        this.classList.add("highlight");
        self._runCallbacks("highlighted_part", part);
    };
    frontMask.removeEventListener("load", frontMaskLoad);
    frontMask.addEventListener("load", frontMaskLoad);
    frontMask.addEventListener("error", function() {
        this.setAttribute("src", "");
    });
    frontMask.setAttribute("src", fullUrl);

    var animationId = frontMask.dataset.animation_id;
    cancelAnimationFrame(animationId);
    this._animateProperty(frontMask, "opacity", 0, 0.4, 250);
};

ripe.Config.prototype.lowlight = function(options) {
    var frontMask = this.element.querySelector(".front-mask");
    frontMask.classList.remove("highlight");
    this.element.classList.remove("highlight");
};

ripe.Config.prototype.enterFullscreen = function(options) {
    if (this.element === undefined) {
        return;
    }
    this.element.classList.add("fullscreen");
    var maxSize = options.maxSize || this.element.dataset.max_size || this.options.maxSize;
    this.resize(maxSize);
};

ripe.Config.prototype.exitFullscreen = function(options) {
    if (this.element === undefined) {
        return;
    }
    this.element.classList.remove("fullscreen");
    this.resize();
};

ripe.Config.prototype._initLayout = function() {
    // clears the elements children
    while (this.element.firstChild) {
        this.element.firstChild.remove();
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

    // register for all the necessary DOM events
    this._registerHandlers();
};

ripe.Config.prototype._loadFrame = function(view, position, options, callback) {
    // retrieves the image that will be used to store the frame
    view = view || this.element.dataset.view || "side";
    position = position || this.element.dataset.position || 0;
    var frame = ripe.getFrameKey(view, position);

    options = options || {};
    var draw = options.draw === undefined || options.draw;
    var animate = options.animate;
    var framesBuffer = this.element.querySelector(".frames-buffer");
    var area = this.element.querySelector(".area");
    var image = framesBuffer.querySelector("img[data-frame='" + String(frame) + "']");
    var front = area.querySelector("img[data-frame='" + String(frame) + "']");
    image = image || front;

    // builds the url that will be set on the image
    var url = this.owner._getImageURL({
        frame: frame
    });

    // creates a callback to be called when the frame
    // is drawn to trigger the callback passed to this
    // function if it's set
    var drawCallback = function() {
        callback && callback();
    }.bind(this);

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
        isReady && this._drawFrame(image, animate, drawCallback);
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
        this._drawFrame(image, animate, drawCallback);
    }.bind(this);

    // sets the src of the image to trigger the request
    // and sets loaded to false to indicate that the
    // image is not yet loading
    image.src = url;
    image.dataset.src = url;
    image.dataset.loaded = false;
};

ripe.Config.prototype._drawFrame = function(image, animate, callback) {
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

    var timeout = animate === "immediate" ? 0 : 500;
    if (animate === "cross") {
        ripe.animateProperty(current, "opacity", 1, 0, timeout);
    }

    ripe.animateProperty(target, "opacity", 0, 1, timeout, function() {
        current.style.opacity = 0;
        current.style.zIndex = 1;
        target.style.zIndex = 1;
        callback && callback();
    });
};

ripe.Config.prototype._preload = function(useChain) {
    var position = this.element.dataset.position || 0;
    var index = this.element.dataset.index || 0;
    index++;
    this.element.dataset.index = index;
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
        var _index = self.element.dataset.index;
        _index = parseInt(_index);
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
        if (pending.length > 0) {
            self.element.classList.add("preloading")
            self.element.classList.add("noDrag");
        }

        // if there are no images preloading and no
        // frames yet to be preloaded then the preload
        // is considered finished so drag movements are
        // allowed again and the loaded event is triggered
        else if (work.length === 0) {
            self.element.classList.remove("preloading");
            self.element.classList.remove("noDrag");
            self._runCallbacks("loaded");
        }
    };

    var render = function() {
        var _index = self.element.getAttribute("data-index");
        _index = parseInt(_index);

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
        this.element.classList.add("noDrag");
        setTimeout(function() {
            render();
        }, 250);
    }
};

ripe.Config.prototype._registerHandlers = function() {
    // binds the mousedown event on the element
    // to prepare it for drag movements
    this.element.addEventListener("mousedown", function(event) {
        var _element = this;
        _element.dataset.view = _element.dataset.view || "side";
        _element.dataset.base = _element.dataset.position || 0;
        _element.dataset.down = true;
        _element.dataset.referenceX = event.pageX;
        _element.dataset.referenceY = event.pageY;
        _element.dataset.percent = 0;
        _element.classList.add("drag");
    });

    // listens for mouseup events and if it
    // occurs then stops reacting to mousemove
    // events has drag movements
    this.element.addEventListener("mouseup", function(event) {
        var _element = this;
        _element.dataset.down = false;
        _element.dataset.percent = 0;
        _element.dataset.previous = _element.dataset.percent;
        _element.classList.remove("drag");
    });

    // listens for mouseleave events and if it
    // occurs then stops reacting to mousemove
    // events has drag movements
    this.element.addEventListener("mouseleave", function(event) {
        var _element = this;
        _element.dataset.down = false;
        _element.dataset.percent = 0;
        _element.dataset.previous = _element.dataset.percent;
        _element.classList.remove("drag");
    });

    // if a mousemove event is triggered while
    // the mouse is pressed down then updates
    // the position of the drag element
    var self = this;
    this.element.addEventListener("mousemove", function(event) {
        var _element = this;

        if (_element.classList.contains("noDrag")) {
            return;
        }
        var down = _element.dataset.down;
        _element.dataset.mousePosX = event.pageX;
        _element.dataset.mousePosY = event.pageY;
        down === "true" && self._parseDrag();
    });

    var area = this.element.querySelector(".area");
    var back = this.element.querySelector(".back");
    area.addEventListener("click", function(event) {
        // canvasClick(this, event);
    });

    area.addEventListener("mousemove", function(event) {
        var drag = this.classList.contains("drag");
        if (drag) {
            return;
        }
        event = self._fixEvent(event);
        var x = event.offsetX;
        var y = event.offsetY;
        var part = self._chosenPart(this, x, y);
        part && self.highlight(part);
    });

    area.addEventListener("dragstart", function(event) {
        event.preventDefault();
    });

    back.addEventListener("click", function(event) {
        // canvasClick(this, event);
    });

    back.addEventListener("mousemove", function(event) {
        var drag = this.classList.contains("drag");
        if (drag) {
            return;
        }
        event = self._fixEvent(event);
        var x = event.offsetX;
        var y = event.offsetY;
        var part = self._chosenPart(this, x, y);
        part && self.highlight(part);
    });

    back.addEventListener("dragstart", function(event) {
        event.preventDefault();
    });
};

ripe.Config.prototype._parseDrag = function() {
    // retrieves the last recorded mouse position
    // and the current one and calculates the
    // drag movement made by the user
    var child = this.element.querySelector("*:first-child");
    var referenceX = this.element.dataset.referenceX;
    var referenceY = this.element.dataset.referenceY;
    var mousePosX = this.element.dataset.mousePosX;
    var mousePosY = this.element.dataset.mousePosY;
    var base = this.element.dataset.base;
    var deltaX = referenceX - mousePosX;
    var deltaY = referenceY - mousePosY;
    var elementWidth = this.element.clientWidth;
    var elementHeight = this.element.clientHeight || child.clientHeight;
    var percentX = deltaX / elementWidth;
    var percentY = deltaY / elementHeight;
    this.element.dataset.percent = percentX;
    var sensitivity = this.element.dataset.sensitivity || this.sensitivity;

    // if the movement was big enough then
    // adds the move class to the element
    Math.abs(percentX) > 0.02 && this.element.classList.add("move");
    Math.abs(percentY) > 0.02 && this.element.classList.add("move");

    // if the drag was vertical then alters the
    // view if it is supported by the product
    var view = this.element.dataset.view;
    var nextView = view;
    if (sensitivity * percentY > 15) {
        nextView = view === "top" ? "side" : "bottom";
        this.element.dataset.referenceY = mousePosY;
    } else if (sensitivity * percentY < -15) {
        nextView = view === "bottom" ? "side" : "top";
        this.element.dataset.referenceY = mousePosY;
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

ripe.Config.prototype._chosenPart = function(canvas, x, y) {
    var canvasRealWidth = canvas.getBoundingClientRect().width;
    var mask = this.element.querySelector(".mask");
    var ratio = mask.width / canvasRealWidth;
    x = parseInt(x * ratio);
    y = parseInt(y * ratio);

    var maskContext = mask.getContext("2d");
    var maskData = maskContext.getImageData(x, y, 1, 1);
    var r = maskData.data[0];
    var index = parseInt(r);

    var down = this.element.dataset.down;
    // in case the index that was found is the zero one this is a special
    // position and the associated operation is the removal of the highlight
    // also if the target is being dragged the highlight should be removed
    if (index === 0 || down === "true") {
        this.lowlight(this.element);
        return;
    }

    // retrieves the reference to the part name by using the index
    // extracted from the masks image (typical strategy for retrieval)
    var part = this.partsList[index - 1];

    return (part === undefined) ? null : part;
};

ripe.Config.prototype._fixEvent = function(event) {
    if (event.hasOwnProperty("offsetX") && event.offsetX !== undefined) {
        return event;
    }

    var _target = event.target || event.srcElement;
    var rect = _target.getBoundingClientRect();
    event.offsetX = event.clientX - rect.left;
    event.offsetY = event.clientY - rect.top;
    return event;
};
