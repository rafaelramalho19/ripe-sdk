if (
    typeof require !== "undefined" &&
    (typeof window === "undefined" || typeof __webpack_require__ !== "undefined") // eslint-disable-line camelcase
) {
    // eslint-disable-next-line no-redeclare
    var base = require("../base");
    // eslint-disable-next-line no-redeclare
    var ripe = base.ripe;
}

/**
 * Resolves the RIPE configuration options (includes DKU) from the provided set
 * of options or in alternative the current RIPE instance state.
 *
 * @param {Object} options An object of options to configure the request, such as:
 * - 'url' - The base URL.
 * @param {Function} callback Function with the result of the request.
 * s {XMLHttpRequest} The XMLHttpRequest instance of the API request.
 */
ripe.Ripe.prototype.configInfo = function(options, callback) {
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" || options === undefined ? {} : options;
    options = this._getConfigInfoOptions(options);
    options = this._build(options);
    return this._cacheURL(options.url, options, callback);
};

/**
 * Resolves the RIPE configuration options (includes DKU)  from the provided set
 * of options or in alternative the current RIPE instance state.
 *
 * @param {Object} options An object of options to configure the request, such as:
 * - 'url' - The base URL.
 * @param {Function} callback Function with the result of the request.
 * s {Promise} The model's configuration data.
 */
ripe.Ripe.prototype.configInfoP = function(options) {
    return new Promise((resolve, reject) => {
        this.configInfo(options, (result, isValid, request) => {
            isValid ? resolve(result) : reject(new ripe.RemoteError(request));
        });
    });
};

/**
 * Resolves the provided DKU value into a more structured set of model, brand,
 * parts, etc. so that it can be used under RIPE.
 *
 * @param {String} dku The DKU identifier to be used in the resolution.
 * @param {Object} options An object of options to configure the request, such as:
 * - 'url' - The base URL.
 * @param {Function} callback Function with the result of the request.
 * s {XMLHttpRequest} The XMLHttpRequest instance of the API request.
 */
ripe.Ripe.prototype.configDku = function(dku, options, callback) {
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" || options === undefined ? {} : options;
    options = Object.assign({ dku: dku, queryOptions: false, initialsOptions: false }, options);
    options = this._getConfigInfoOptions(options);
    options = this._build(options);
    return this._cacheURL(options.url, options, callback);
};

/**
 * Resolves the provided DKU value into a more structured set of mode, brand,
 * parts, etc. so that it can be used under RIPE.
 *
 * @param {String} dku The DKU identifier to be used in the resolution.
 * @param {Object} options An object of options to configure the request, such as:
 * - 'url' - The base URL.
 * @param {Function} callback Function with the result of the request.
 * s {Promise} The model's configuration data.
 */
ripe.Ripe.prototype.configDkuP = function(dku, options) {
    return new Promise((resolve, reject) => {
        this.configDku(dku, options, (result, isValid, request) => {
            isValid ? resolve(result) : reject(new ripe.RemoteError(request));
        });
    });
};

/**
 * Gets the configuration of a product identified by its unique product ID.
 *
 * @param {String} productId The identifier of the product to be resolved.
 * @param {Object} options An object of options to configure the request, such as:
 * - 'url' - The base URL.
 * @param {Function} callback Function with the result of the request.
 * s {XMLHttpRequest} The XMLHttpRequest instance of the API request.
 */
ripe.Ripe.prototype.configResolve = function(productId, options, callback) {
    callback = typeof options === "function" ? options : callback;
    options = typeof options === "function" || options === undefined ? {} : options;
    const url = this.url + "config/resolve/" + productId;
    options = Object.assign({ url: url }, options);
    options = this._build(options);
    return this._cacheURL(options.url, options, callback);
};

/**
 * Gets the configuration of a product identified by its unique product ID.
 *
 * @param {String} productId The identifier of the product to be resolved.
 * @param {Object} options An object of options to configure the request, such as:
 * - 'url' - The base URL.
 * s {Promise} The model's configuration data.
 */
ripe.Ripe.prototype.configResolveP = function(productId, options) {
    return new Promise((resolve, reject) => {
        this.configResolve(productId, options, (result, isValid, request) => {
            isValid ? resolve(result) : reject(new ripe.RemoteError(request));
        });
    });
};

/**
 * @ignore
 */
ripe.Ripe.prototype._getConfigInfoOptions = function(options = {}) {
    const dku = options.dku === undefined ? null : options.dku;
    const guess = options.guess === undefined ? this.guess : options.guess;
    const queryOptions = options.queryOptions === undefined ? true : options.queryOptions;
    const initialsOptions = options.initialsOptions === undefined ? true : options.initialsOptions;

    if (queryOptions) options = this._getQueryOptions(options);
    if (initialsOptions) options = this._getInitialsOptions(options);

    const params = options.params || {};
    options.params = params;

    if (dku !== undefined && dku !== null) {
        params.dku = dku;
    }
    if (guess !== undefined && guess !== null) {
        params.guess = guess ? "1" : "0";
    }

    const url = this.url + "config/info";

    return Object.assign(options, {
        url: url,
        method: "GET",
        params: params
    });
};
