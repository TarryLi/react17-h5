/* eslint-disable no-param-reassign */
/* eslint-disable no-underscore-dangle */
/* eslint-disable max-len */
import axios from 'axios';
import qs from 'qs';
import {
  isBoolean, isString, isNumber, isArray, isFunction, isEmpty, has, omit
} from 'lodash';
import { getAccessToken } from './index';
// import { getAccessToken } from './cache';

const { NODE_ENV } = process.env;

// const { applicationCode = '' } = window.DRIGHT_CONFIG;

// const SYSTEM_CODE = applicationCode;
const SYSTEM_CODE = '';
const API_BASE_URL = '';

const CONTENT_TYPES = {
  1: 'application/json',
  2: 'application/x-www-form-url-urlencode',
  3: 'multipart/form-data'
};

function getValidResCodes(codes, defaults) {
  return (isArray(codes) && !isEmpty(codes))
    ? codes
    : (isNumber(codes) || (isString(codes) && codes))
      ? [codes]
      : defaults;
}

function getConfigValue(key, value, defaultValue) {
  if (typeof value !== 'undefined') {
    return value;
  }
  return defaultValue;
}

function getBaseURL(baseURL) {
  return getConfigValue('apiBaseURL', baseURL, API_BASE_URL);
}

function goLogin() {}

/**
 * 获取ajax请求
 * @param {Object} param
 * {
 *  baseURL {String}: axios baseURL属性
 *  withCredentials {Boolean}: axios withCredentials属性
 *  successCodes { Array | String | Number } 成功code
 *  noAuthCodes { Array | String | Number } 无权限code
 *  noAuthHandler {Function}: 无权限处理函数
 *  adjustConfig {Function}: config自定义校准函数
 *  doneHandle {Function}: 请求成功回调
 *  failHandle {Function}: 请求失败回调
 * }
 */
function ajaxGetter({
  baseURL,
  withCredentials,
  successCodes,
  noAuthCodes,
  noAuthHandler,
  adjustConfig,
  doneHandler,
  failHandler
} = {}) {
  withCredentials = isBoolean(withCredentials) ? withCredentials : true;
  successCodes = getValidResCodes(successCodes, [0, 200, '0', '00000']);
  noAuthCodes = getValidResCodes(noAuthCodes, [401]);
  noAuthHandler = isFunction(noAuthHandler) ? noAuthHandler : goLogin;
  // 缓存正在请求的ajax
  const pendings = [];
  return (url, options) => {
    const _noAuthHandler = isFunction(options.noAuthHandler) ? options.noAuthHandler : noAuthHandler;
    const auth = getConfigValue('auth', options.auth, true);
    const accessToken = getAccessToken();
    if (auth !== false && !accessToken) {
      // return _noAuthHandler();
    }
    const _appCode = SYSTEM_CODE;
    const _sysCode = SYSTEM_CODE;
    const _baseURL = getBaseURL(options.baseURL || baseURL);
    const method = (options.method || 'post').toLowerCase();
    // 是否需要节流处理，防止暴力点击
    const pending = `${url} ${method} ${JSON.stringify(options.data)}`;
    if (options.throttle !== false) {
      for (let i = 0, len = pendings.length; i < len; i++) {
        if (pendings[i] === pending) {
          if (NODE_ENV === 'development') {
            return Promise.reject(new Error(`[cityos-tbox] request too frequent, please try again later ${pending}`));
          }
          return;
        }
      }
      pendings.push(pending);
    }
    const headers = {};
    // headers中携带应用编码
    headers['cityos-application-code'] = _appCode;
    headers['x-os-system-code'] = _sysCode;
    // headers中携带token信息
    if (accessToken && auth !== false) {
      headers.Authorization = accessToken;
    }
    if (options.contentType) {
      headers['Content-Type'] = CONTENT_TYPES[options.contentType] || options.contentType;
    }
    const config = {
      url,
      method,
      baseURL: _baseURL,
      withCredentials: isBoolean(options.withCredentials)
        ? options.withCredentials
        : withCredentials,
      headers: { ...headers, ...(options.headers || {}) }
    };
    if (options.responseType) {
      config.responseType = options.responseType;
    }
    if (['get', 'delete'].indexOf(method) !== -1 && options.body !== true) {
      // remove Content-Type if data is undefined
      config.data = true;
      config.params = options.data;
      if (options.serialize) {
        config.paramsSerializer = (params) =>
          qs.stringify(params, isBoolean(options.serialize) ? { arrayFormat: 'repeat' } : options.serialize);
      }
    } else if (options.contentType === 2) {
      config.data = qs.stringify(options.data);
    } else {
      config.data = options.data;
    }
    const _adjustConfig = options.adjustConfig || adjustConfig;
    if (isFunction(_adjustConfig)) {
      _adjustConfig(config);
    }
    return axios(config)
      .then(({ headers: _headers, data: res }) => {
        const _doneHandler = options.doneHandler || doneHandler;
        if (isFunction(_doneHandler)) {
          return _doneHandler(res);
        }
        if (options.responseType === 'blob') {
          return { headers: _headers, data: res };
        }
        const {
          code, message, detailMsg, data
        } = res;
        const _successCodes = getValidResCodes(options.successCodes || successCodes);
        if (_successCodes.indexOf(code) !== -1) {
          return data;
        }
        const _noAuthCodes = getValidResCodes(options.noAuthCodes || noAuthCodes);
        if (auth !== false && _noAuthCodes.indexOf(code) !== -1) {
          return _noAuthHandler();
        }
        return Promise.reject(new Error(detailMsg || message));
      })
      .catch((error) => {
        const _noAuthCodes = getValidResCodes(options.noAuthCodes || noAuthCodes);
        if (auth !== false && error.response && _noAuthCodes.indexOf(error.response.status) !== -1) {
          return _noAuthHandler();
        }
        const _failHandler = options.failHandler || failHandler;
        if (isFunction(_failHandler)) {
          return _failHandler(error);
        }
        return Promise.reject(error);
      })
      .finally(() => {
        if (options.throttle !== false) {
          for (let i = 0, len = pendings.length; i < len; i++) {
            if (pendings[i] === pending) {
              pendings.splice(i, 1);
              break;
            }
          }
        }
      });
  };
}

/**
 * 获取ajax请求生成器
 * @param {Function} ajaxHandler
 */
function genAjaxGetter(ajaxHandler) {
  /**
   * 根据配置批量生成ajax请求
   * @param {Object} options
   */
  return (options) => {
    const result = {};
    options.items.forEach(item => {
      result[item.key] = function (params) {
        let url = (item.prefix || options.prefix || '') + (item.url || '');
        let data = params;
        // 解析restful风格的请求，eg：/a/:b/:c
        if (/\/:/.test(url)) {
          const excludes = [];
          url = url.replace(/:([^/]+)/g, (match, p1) => {
            if (has(data, p1)) {
              excludes.push(p1);
              return data[p1];
            }
            return match;
          });
          data = omit(data, excludes);
        }
        return ajaxHandler(
          url,
          {
            data,
            ...omit(options, ['prefix', 'items']),
            ...omit(item, ['key', 'url', 'prefix'])
          }
        );
      };
    });
    return result;
  };
}

const ajax = ajaxGetter();

const genAjax = genAjaxGetter(ajax);

export {
  ajax,
  genAjax,
  ajaxGetter,
  genAjaxGetter,
  getBaseURL
};
