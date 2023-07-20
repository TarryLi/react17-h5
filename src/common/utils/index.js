// 全局通用方法
import qs from 'qs';
import dayjs from 'dayjs';

// 加载js标签
export const loadScript = (src) => new Promise((res, rej) => {
  const script = document.createElement('script');
  script.src = src;
  script.onload = res;
  script.onfaild = rej;
  document.body.appendChild(script);
});

// 连接容器
export const loadComponent = (scope, module) => async () => {
  // 初始化共享作用域（shared scope）用提供的已知此构建和所有远程的模块填充它
  await __webpack_init_sharing__('default');
  const container = window[scope]; // 或从其他地方获取容器
  // 初始化容器 它可能提供共享模块
  await container.init(__webpack_share_scopes__.default);
  const factory = await window[scope].get(module);
  const Module = factory();
  return Module;
};

/**
 * 计算两个时间之差
 * @param {string | Date} startTime 开始时间 2021-05-27 00:00:00
 * @param {string | Date} endTime 结束时间 2021-05-28 10:20:50
 * @param {boolean} hiddenZero 隐藏前面的补零
 * @returns {obj} { day: 1, hours: 10, minute: 20, seconds: 50, }
 */
export const timeDiff = (startTime, endTime, hiddenZero) => {
  const start = dayjs(startTime);
  const end = dayjs(endTime);
  const day = end.diff(start, 'day');
  const hours = end.subtract(day, 'day').diff(start, 'hour');
  const minute = end
    .subtract(day, 'day')
    .subtract(hours, 'hour')
    .diff(start, 'minute');
  const seconds = end
    .subtract(day, 'day')
    .subtract(hours, 'hour')
    .subtract(minute, 'minute')
    .diff(start, 'second');

  return hiddenZero ? {
    day, hours, minute, seconds
  } : {
    day,
    hours: String(hours).padStart(2, '0'),
    minute: String(minute).padStart(2, '0'),
    seconds: String(seconds).padStart(2, '0'),
  };
};

// 判断变量类型
export const getType = (value) => Object.prototype.toString.call(value)
  .slice(8, -1);

// 格式化url中的search部分
export const formatSearch = () => {
  const search = window.location.href.split('?')[1];
  if (search) {
    return qs.parse(search);
  }
  return {};
};

// 时间戳转字符串 yyyy-MM-DD hh:mm:ss
export function formatDate(time, format = 'YYYY-MM-DD HH:mm:ss') {
  if (!time) return '';
  return dayjs(time).format(format);
}

// 防抖
export function debounce(func, delay = 120) {
  let timer = null;
  return function (...args) {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
}

// 节流
export function throttle(func, delay = 120) {
  let timer = null;
  return function (...args) {
    if (timer) return;
    func.apply(this, args);
    timer = setTimeout(() => {
      timer = null;
    }, delay);
  };
}

// 转译字符串
export function escape(str) {
  return str.replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quto;')
    .replace(/'/g, '&#39;')
    .replace(/`/g, '&#96;')
    .replace(/\//g, '&#x2F;');
}

// 筛选有效值
export const filterEmpty = (obj) => {
  const filterObj = {};
  Object.entries(obj).forEach(item => {
    const [key, value] = item;
    if (value || value === 0) {
      filterObj[key] = value;
    }
  });
  return filterObj;
};

// 读token
export const getAccessToken = () => window.dright?.accessInfo.Authorization || '';
