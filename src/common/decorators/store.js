import {
  isArray, isObject, isString, isEmpty, cloneDeep, get, has
} from 'lodash';
import { action, extendObservable } from 'mobx';
import { mixins } from './core';

/**
 * 生成默认action
 * @param {Object} defaults 默认可观察状态
 */
function genDefaultActions(defaults) {
  return {
    /**
     * 根据默认值初始化状态
     */
    init() {
      extendObservable(this, defaults);
    },
    /**
     * 状态更新
     * @param {Object|Array} payload {key: value} | [string, object]
     */
    update: action(function (payload) {
      let obj = {};
      let arr = [];
      if (isArray(payload)) {
        payload.forEach(item => {
          if (isString(item)) {
            arr.push(item);
          } else if (isObject(item)) {
            obj = { ...obj, ...item };
          }
        });
      } else if (isObject(payload)) {
        obj = { ...payload };
      }
      if (!isEmpty(obj)) {
        const keys = Object.keys(obj).filter(key => has(this, key));
        keys.forEach(key => {
          this[key] = obj[key];
        });
      }
      if (!isEmpty(arr)) {
        arr = arr.filter(key => has(this, key));
        arr.forEach(key => {
          this[key] = defaults[key];
        });
      }
    }),
    /**
     * 状态重置
     * @param {undefined|String|[String]}
     * 1. 传空重置所有状态
     * 2. 传字符串或者字符串数组时，对传入属性进行状态重置
     */
    reset: action(function (payload) {
      const keys = (isString(payload)
        ? [payload]
        : isArray(payload)
          ? payload
          : []
      ).filter(item => isString(item) && has(defaults, item));
      if (isEmpty(keys)) {
        Object.assign(this, cloneDeep(defaults));
      } else {
        keys.forEach(key => {
          this[key] = defaults[key];
        });
      }
    })
  };
}

/**
 * 根据配置动态生成action
 * @param {Object} config
 * {
 *  caller: 对应api模块
 *  items: [
 *    {
 *      key: store中对应的方法名
 *      callee: api模块下的方法名，若和key相同，可省略
 *      caller: 一般不设置，默认使用config中的caller, 若设置，优先级高于config中的caller
 *      map: 如果需要将返回数据更新到store，需要用到。map: 后端返回数据与store中的属性对应关系
 *    }
 *  ]
 * }
 */
function genConfigActions(config = {}) {
  const res = {};
  const { items = [] } = config;
  items.forEach(item => {
    if (item.key === 'queryPaging') {
      // 分页查询
      res[item.key] = async function ({ query, sorter, pagination } = {}) {
        this.update({
          loading: true,
          query: { ...this.query, ...query },
          sorter: { ...this.sorter, ...sorter },
          pagination: { ...this.pagination, ...pagination }
        });
        try {
          const data = await (item.caller || config.caller)[item.callee || item.key]({
            page: this.pagination.current,
            pageSize: this.pagination.pageSize,
            sort: isEmpty(this.sorter) ? null : {
              orders: [{
                property: this.sorter.field,
                direction: this.sorter.order === 'ascend' ? 'ASC' : 'DESC'
              }]
            },
            ...this.query
          });
          this.update({
            loading: false,
            pagination: {
              ...this.pagination,
              total: get(data, 'total') || 0
            },
            dataSource: get(data, 'list') || get(data, 'records') || []
          });
        } catch (error) {
          if (item.showError !== false && error && error.message) {
            // eslint-disable-next-line no-console
            console.error(error);
          }
          if (process.env.NODE_ENV === 'development') {
            // eslint-disable-next-line no-console
            console.error(error);
          }
        }
      };
    } else {
      res[item.key] = async function (params, done, fail) {
        try {
          const data = await (item.caller || config.caller)[item.callee || item.key](params);
          // 需要将返回数据更新到store，map: 前后端字段映射
          if (!isEmpty(item.map) && data !== null && typeof data !== 'undefined') {
            const payload = {};
            Object.keys(item.map).forEach(key => {
              if (item.map[key] === 'data') {
                payload[key] = data;
              } else {
                payload[key] = get(data, item.map[key]);
              }
            });
            this.update(payload);
          }
          done && done(data);
          return data;
        } catch (error) {
          fail && fail(error);
          if (item.showError !== false && error && error.message) {
            // eslint-disable-next-line no-console
            console.error(error);
          }
          if (process.env.NODE_ENV === 'development') {
            // eslint-disable-next-line no-console
            console.error(error);
          }
        }
      };
    }
  });
  return res;
}

/**
 * 对于 normal store混入属性和方法
 * @param {Object} defaults 默认可观察状态
 * @param {Object} actions 需要动态生成的action配置
 * @param {Object} methods 自定义方法
 */
export function merge(defaults, actions, methods) {
  return function (target) {
    mixins({
      ...methods,
      ...genConfigActions(actions),
      ...genDefaultActions(defaults)
    }, true)(target.prototype);
  };
}

/**
 * 对于table store 混入属性和方法
 */
export function tableMerge(defaults, actions, methods) {
  defaults = {
    // 列表查询参数
    query: {},
    // 列表排序参数
    sorter: {},
    // 列表分页参数
    pagination: {
      current: 1,
      total: 0,
      pageSize: 20,
      pageSizeOptions: ['10', '20', '30', '40'],
      showSizeChanger: true,
      showQuickJumper: true,
      hideOnSinglePage: false,
      showTotal: total => `共 ${total} 条`
    },
    // 列表加载状态
    loading: false,
    // 列表数据源
    dataSource: [],

    ...defaults
  };
  return merge(defaults, actions, methods);
}

/**
 * 生成 normal store 实例
 */
export function genStore(defaults, actions, methods) {
  function Store() {
    this.init();
  }
  merge(defaults, actions, methods)(Store);
  return new Store();
}

/**
 * 生成 table store实例
 */
export function genTableStore(defaults, actions, methods) {
  function Store() {
    this.init();
  }
  tableMerge(defaults, actions, methods)(Store);
  return new Store();
}
