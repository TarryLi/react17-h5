/* eslint-disable no-unused-vars */
import React, { useEffect } from 'react';
import { observer } from 'mobx-react';
import { Tabs } from 'antd-mobile';
import styles from './index.module.less';
import store from './stores';

export default observer(() => {
  useEffect(() => {
  }, []);

  return (
    <div className={styles.wrap}>
      <Tabs>
        <Tabs.Tab title="水果" key="fruits">
          菠萝
        </Tabs.Tab>
        <Tabs.Tab title="蔬菜" key="vegetables">
          西红柿
        </Tabs.Tab>
        <Tabs.Tab title="动物" key="animals">
          蚂蚁
        </Tabs.Tab>
      </Tabs>
      <div className={styles.name}>px2rem</div>
    </div>
  );
});
