import { RunnableStorage } from './storage.js';

export const ValidPathTypes = ['alter', 'commit', 'mutate', 'query'];

/**
 * Represents a URL object used in a Runnable DOM element.
 * Handles dynamic changes to all URL properties and has methods for
 * saving and loading from local disk via `localStorage` using `RunnableStorage`.
 *
 * @see RunnableStorage.
 */
export class RunnableUrl {
  /**
   * Stores initial default values.
   * @memberof RunnableUrl
   */
  private = {
    hash: '',
    hostName: '127.0.0.1',
    port: '8080',
    pathName: '/query',
    pathType: 'query',
    protocol: 'http:',
    search: '',
    searchParams: {},
    statics: {
      searchParams: {
        latency: true
      }
    }
  };

  constructor(params = {}, overrides = {}) {
    Object.assign(this, params, overrides);
  }

  /**
   * Removes current `RunnableUrl` instance entry from `localStorage`.
   *
   * @see RunnableStorage
   */
  delete() {
    return RunnableStorage.delete(this.constructor.name);
  }

  /**
   * Creates and returns a new `RunnableUrl` instance using passed params and overrides.
   * Useful for creating temporary instances.
   *
   * @static
   * @param {Object} [params={}]
   * @param {Object} [overrides={}]
   * @returns RunnableUrl
   * @memberof RunnableUrl
   */
  static factory(params = {}, overrides = {}) {
    return new this(params, overrides);
  }

  /**
   * Retrieves `localStorage` JSON string for current `RunnableUrl` type.
   *
   * @see RunnableStorage
   * @param {Object} params - Optional params used to initialize loaded data.
   */
  static load(params = {}, pathType = 'query') {
    // Convert to object, if necessary.
    if (Array.isArray(params)) {
      params = RunnableUrl.reduceArrayToObject(params);
    }

    // Get valid path type.
    pathType = RunnableUrl.sanitizePathType(pathType);

    // Get saved data.
    let saved = RunnableStorage.get(
      `${this.prototype.constructor.name}-${pathType}`
    );
    let result;

    params = RunnableUrl.pathTypeInParams(pathType, params)
      ? params
      : undefined;

    // If no data saved, use params to set defaults.
    if (saved) {
      result = new this(params, JSON.parse(saved));
    } else {
      result = new this(
        {
          pathName: `/${pathType}`,
          pathType
        },
        params
      );
    }

    return result;
  }

  /**
   * Determines if passed path type exists within params object.
   *
   * @static
   * @param {*} pathType
   * @param {*} [params={}]
   * @returns
   * @memberof RunnableUrl
   */
  static pathTypeInParams(pathType, params = {}) {
    if (
      RunnableUrl.sanitizePathType(params.pathType) ===
      RunnableUrl.sanitizePathType(pathType)
    ) {
      return true;
    } else if (
      RunnableUrl.sanitizePathType(params.pathName) ===
      RunnableUrl.sanitizePathType(pathType)
    ) {
      return true;
    }
    return false;
  }

  /**
   * Reduces key/value Array pairs into key: value Object.
   * Removes all undefined or "falsy" values.
   *
   * @param {Array[[string, string]]} arr - Key/value pairs array.
   */
  static reduceArrayToObject(arr) {
    return arr.reduce((accumulator, element) => {
      if (element[1]) {
        accumulator[element[0]] = element[1];
      }
      return accumulator;
    }, {});
  }

  /**
   * Retrieves a valid path type from passed value.
   *
   * @static
   * @param {string} value
   * @returns
   * @memberof RunnableUrl
   */
  static sanitizePathType(value) {
    return ValidPathTypes.reduce((accumulator, current) => {
      // Check if value contains current path type.
      if (value && value.toLowerCase().indexOf(current) !== -1) {
        return current;
      }
      return accumulator;
    }, undefined);
  }

  /**
   * Serialize and save this `RunnableUrl` instance to `localStorage`.
   *
   * @see RunnableStorage
   */
  save() {
    RunnableStorage.set(
      `${this.constructor.name}-${this.pathType}`,
      JSON.stringify(this.toJSON())
    );
  }

  /**
   * Get JSON-like object of this instance.  Preferable to using built-in `JSON.stringify(this)`
   * to properly handle or ignore private properties.
   */
  toJSON() {
    return {
      hash: this.hash,
      hostName: this.hostName,
      port: this.port,
      pathName: this.pathName,
      protocol: this.protocol,
      search: this.search,
      searchParams: this.searchParams,
      statics: this.statics
    };
  }

  /**
   * Return the `url` property value.
   */
  toString() {
    return this.url;
  }

  get hash() {
    return this.private.hash;
  }

  set hash(value) {
    if (typeof value === 'string' && value.length > 0) {
      // Add # prefix if missing.
      this.private.hash = !value.startsWith('#') ? `#${value}` : value;
    } else {
      this.private.hash = value;
    }
  }

  get hostName() {
    return this.private.hostName;
  }

  set hostName(value) {
    if (typeof value === 'string') {
      this.private.hostName = value;
    }
  }

  get pathName() {
    return this.private.pathName;
  }

  set pathName(value) {
    if (typeof value === 'string' && value.length > 0) {
      // Add / prefix if missing.
      this.private.pathName = !value.startsWith('/') ? `\/${value}` : value;
    } else {
      this.private.pathName = value;
    }
  }

  get pathType() {
    return this.private.pathType;
  }

  set pathType(value) {
    this.private.pathType = RunnableUrl.sanitizePathType(value);
  }

  get port() {
    return this.private.port;
  }

  set port(value) {
    this.private.port = value;
  }

  get protocol() {
    return this.private.protocol;
  }

  set protocol(value) {
    if (typeof value === 'string' && value.length > 0) {
      // Add : suffix if missing.
      this.private.protocol = !value.endsWith(':') ? `${value}:` : value;
    }
  }

  get search() {
    if (
      typeof this.private.searchParams === 'object' &&
      Object.getOwnPropertyNames(this.private.searchParams).length > 0
    ) {
      return `?${new URLSearchParams(this.private.searchParams).toString()}`;
    }
  }

  set search(value) {
    if (typeof value === 'string' && value.length > 0) {
      // this.searchParams = {};
      for (let pair of new URLSearchParams(value).entries()) {
        this.private.searchParams[pair[0]] = pair[1];
      }
    }
  }

  get searchParams() {
    return this.private.searchParams;
  }

  set searchParams(value) {
    if (typeof value === 'string') {
      this.private.searchParams = {};
      for (let pair of new URLSearchParams(value).entries()) {
        this.private.searchParams[pair[0]] = pair[1];
      }
    } else if (value.constructor.name === 'URLSearchParams') {
      this.private.searchParams = {};
      for (let pair of value.entries()) {
        this.private.searchParams[pair[0]] = pair[1];
      }
    } else if (typeof value === 'object') {
      for (let pair of Object.entries(value)) {
        this.private.searchParams[pair[0]] = pair[1];
      }
    } else {
      this.private.searchParams = value;
    }
  }

  /**
   * Statics represent values that are common and can be associated with every instance.
   * Statics are not editable by user or displayed in UI, making them useful for 'hidden' configuration.
   * @example
   * const instance = new RunnableUrl({
   *    searchParams: {
   *      foo: 'bar'
   *    },
   *    statics: {
   *      searchParams: {
   *        happy: true
   *      }
   *    }
   *  });
   *
   * console.log(instance.url);
   * // returns 'http://127.0.0.1:8080?foo=bar'
   * // UI shows above URL and allows editing of that URL, without exposing statics.
   *
   * console.log(RunnableUrl.factory(instance, instance.statics).url);
   * // returns 'http://127.0.0.1:8080?foo=bar&happy=true'
   * // Passing statics to temp factory instance allows inclusion of hidden static properties.
   *
   * @memberof RunnableUrl
   */
  get statics() {
    return this.private.statics;
  }

  set statics(value) {
    this.private.statics = value;
  }

  get url() {
    return `${this.protocol}\/\/${this.hostName}${
      this.port ? `:${this.port}` : ''
    }${this.pathName}${this.search ? this.search : ''}${this.hash}`;
  }

  set url(value) {
    if (!value) return;
    if (typeof value === 'string' && value.length > 0) {
      try {
        const {
          hash,
          hostname,
          pathname,
          port,
          protocol,
          search,
          searchParams
        } = new URL(value);
        this.hash = hash;
        this.hostName = hostname;
        this.pathName = pathname;
        this.pathType = pathname;
        this.port = port;
        this.protocol = protocol;
        // Prefer to use searchParams rather than search.
        this.searchParams = searchParams;
      } catch (error) {
        console.log(`URL: ${value}`);
        console.log(error);
      }
    } else if (
      typeof value === 'object' &&
      value.constructor.name === this.constructor.name
    ) {
      Object.assign(this, value);
    }
  }
}
