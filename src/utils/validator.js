// 校验工具函数
const getType = (x) => Object.prototype.toString.call(x).slice(8, -1);

export const validateFullname = (name) => {
  if (getType(name) !== 'String') return false;
  // 最少三个字符，且首字符为字母
  if (name.length < 3) return false;

  return /^[a-zA-Z]\w+/.test(name);
};

export const validateEmail = (email) => {
  if (getType(email) !== 'String') return false;

  return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(email);
};
