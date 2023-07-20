/* eslint-disable import/no-mutable-exports */
import WebStorageCache from 'web-storage-cache';
import { isFunction } from 'lodash';

const local = new WebStorageCache({ storage: 'localStorage' });

const session = new WebStorageCache({ storage: 'sessionStorage' });

let getAccessToken = (key) => local.get(key || 'access_token');

let getAuthMap = (key) => local.get(key || 'authMap');

let getUserCtx = (key) => local.get(key || 'userCtx');

let clearAuth = (keys) => {
  if (keys && keys.length) {
    keys.forEach(key => {
      local.delete(key);
    });
  } else {
    local.delete('access_token');
    local.delete('authMap');
    local.delete('userCtx');
  }
};

function config({
  getAccessToken: _getAccessToken,
  getAuthMap: _getAuthMap,
  getUserCtx: _getUserCtx,
  clearAuth: _clearAuth
}) {
  if (_getAccessToken && isFunction(_getAccessToken)) {
    getAccessToken = _getAccessToken;
  }
  if (_getAuthMap && isFunction(_getAuthMap)) {
    getAuthMap = _getAuthMap;
  }
  if (_getUserCtx && isFunction(_getUserCtx)) {
    getUserCtx = _getUserCtx;
  }
  if (_clearAuth && isFunction(_clearAuth)) {
    clearAuth = _clearAuth;
  }
}

export {
  local,
  session,
  config,
  getAccessToken,
  getAuthMap,
  getUserCtx,
  clearAuth
};
