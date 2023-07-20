/* eslint-disable no-unused-vars */
import React from 'react';
import { ConfigProvider } from 'antd-mobile';
import zhCN from 'antd-mobile/es/locales/zh-CN';
import 'antd-mobile/es/global';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
import './styles/index.less';
import Router from './router';

dayjs.locale('zh-cn');

const App = () => (
  <ConfigProvider locale={zhCN}>
    <Router />
  </ConfigProvider>
);

export default App;
