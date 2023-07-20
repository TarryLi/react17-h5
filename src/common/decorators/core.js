import { isArray, isFunction } from 'lodash';

export const mixins = function (sups, bound) {
  return function (target) {
    sups = isArray(sups) ? sups : [sups];
    sups = sups.reduce((res, sup) => ({ ...res, ...sup }), {});
    const keys = Object.keys(sups);
    if (bound) {
      keys.forEach(key => {
        if (!Object.prototype.hasOwnProperty.call(target, key)) {
          if (isFunction(sups[key])) {
            Object.defineProperty(target, key, {
              configurable: true,
              enumerable: true,
              get() {
                return sups[key].bind(this);
              }
            });
          } else {
            target[key] = sups[key];
          }
        }
      });
    } else {
      keys.forEach(key => {
        if (!Object.prototype.hasOwnProperty.call(target, key)) {
          target[key] = sups[key];
        }
      });
    }
  };
};
