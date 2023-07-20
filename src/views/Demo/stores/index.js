/* eslint-disable no-unused-vars */
import { action } from 'mobx';
import * as store from '@/common/decorators/store';
import api from '../services';

const { tableMerge } = store;

/**
 * 默认状态
 */
const DEFAULTS = {

};

/**
 * 可配置ACTION
 */
const ACTIONS = {
  caller: api,
  items: [
    { key: 'queryPaging' }
  ]
};

@tableMerge(DEFAULTS, ACTIONS)
class User {
  constructor() {
    this.init();
  }

  // @action.bound async queryPaging() {

  // }
}

export default new User();
