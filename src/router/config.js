/**
 * 本地路由管理文件，属性说明如下:
 * @name [String] 菜单名称
 * @path [String] 路由地址
 * @redirect [String] 重定向地址
 * @children [Array] 子菜单
 * @hide [Boolean] 隐藏菜单
 * @hideBread [Boolean] 隐藏面包屑
 * @hideChildren [Boolean] 隐藏子菜单
 * @component [ReactNode|RenderFunction] 该路由对应渲染的组件
 */

export default [
  {
    path: '/',
    redirect: '/demo'
  },
  {
    path: '/demo',
    name: '首页',
    exact: true,
    component: () => import('@/views/Demo')
  }
];
