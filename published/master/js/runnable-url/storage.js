/**
 * Static helper methods for setting, loading, and deleting `localStorage` data.
 */
export class RunnableStorage {
  static PREFIX = '';
  static SEPARATOR = '';

  /**
   * Clears all `localStorage` for current document origin.
   */
  static clear() {
    localStorage.clear();
    return true;
  }

  /**
   * Deletes `localStorage` value for specified key.
   *
   * @param {string} key Key of value to delete.
   * @param {string} prefix Optional prefix to include prior to key.
   */
  static delete(key, prefix = this.PREFIX) {
    return localStorage.removeItem(`${prefix}${this.SEPARATOR}${key}`);
  }

  /**
   * Gets the `localStorage` value for specified key.
   *
   * @param {string} key Key of value to retrieve.
   * @param {string} prefix Optional prefix to include prior to key.
   */
  static get(key, prefix = this.PREFIX) {
    return localStorage.getItem(`${prefix}${this.SEPARATOR}${key}`);
  }

  /**
   * Sets the `localStorage` value for specified key.
   *
   * @param {string} key Key of value to set.
   * @param {any} value Value to set.
   * @param {string} prefix Optional prefix to include prior to key.
   */
  static set(key, value, prefix = this.PREFIX) {
    return localStorage.setItem(`${prefix}${this.SEPARATOR}${key}`, value);
  }
}
