import * as req from '@/common/utils/req';

/**
 * 用户接口
 */
const userApi = {
  prefix: '/gw/lunling-linkage-core/v2',
  items: [
    // 用户分页查询
    { key: 'queryPaging', url: '/page/all', method: 'get' },
  ]
};

export default {
  ...req.genAjax(userApi)
};
