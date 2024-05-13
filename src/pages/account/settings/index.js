import React, { useRef, useState } from 'react';
import { Menu } from 'antd';
import { GridContent } from '@ant-design/pro-layout';
import { connect } from 'umi';
import styles from './style.less';
import DeviceView from '@/pages/account/settings/components/device';
import ImgManage from '@/pages/account/settings/components/imgManage';
import BaseSetting from '@/pages/account/settings/components/BaseSetting';
import SendSetting from '@/pages/account/settings/components/sendSetting';

const { Item } = Menu;

const Settings = () => {
  let main = useRef(null);

  const [mode, setMode] = useState('inline');
  const [menuMap] = useState({
    device:       '设备管理',
    base:         '基本设置',
    imgManage:    '图片管理',
    sendSetting:  '发布配置',

  });
 // const [selectKey, setSelectKey] = useState('device');
  const [selectKey, setSelectKey] = useState('sendSetting');

  const resize = () => {
    if (!main) {
      return;
    }
    requestAnimationFrame(() => {
      if (!main) {
        return;
      }
      let m = 'inline';
      const { offsetWidth } = main;
      if (main.offsetWidth < 641 && offsetWidth > 400) {
        m = 'horizontal';
      }
      if (window.innerWidth < 768 && offsetWidth > 400) {
        m = 'horizontal';
      }
      setMode(m);
    });
  };

  // useEffect(() => {
  //   // 为了能及时查看效果
  //   dispatch({
  //     type: 'user/fetchCurrentUser',
  //   });
  //   window.addEventListener('resize', resize);
  //   resize();
  //   return () => {
  //     window.removeEventListener('resize', resize);
  //   };
  // }, [dispatch]);

  const getMenu = () => {
    return Object.keys(menuMap).map((item) => <Item key={item}>{menuMap[item]}</Item>);
  };

  const getRightTitle = () => {
    return menuMap[selectKey];
  };

  const renderChildren = () => {
    switch (selectKey) {
      case 'base':
        return <BaseSetting />;
      case 'device':
        return <DeviceView />;
      case 'imgManage':
        return <ImgManage />;
      case 'sendSetting':
        return <SendSetting />;
      default:
        break;
    }

    return null;
  };

  return  (
    <GridContent>
      <div
        className={styles.main}
        ref={(ref) => {
          if (ref) {
            main = ref;
          }
        }}
      >
        <div className={styles.leftMenu}>
          <Menu mode={mode} selectedKeys={[selectKey]} onClick={({ key }) => setSelectKey(key)}>
            {getMenu()}
          </Menu>
        </div>
        <div className={styles.right}>
          <div className={styles.title}>{getRightTitle()}</div>
          {renderChildren()}
        </div>
      </div>
    </GridContent>)

};

export default connect()(Settings);
