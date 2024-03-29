import React from 'react';
import { Avatar, Menu, Spin } from 'antd';
import { LogoutOutlined, SettingOutlined, UserOutlined } from '@ant-design/icons';
import { history, connect } from 'umi';
import HeaderDropdown from '../HeaderDropdown';
import styles from './index.less';

const AvatarDropdown = ({ currentUser = { avatar: '', username: '' }, menu, dispatch }) => {
  const onMenuClick = (event) => {
    const { key } = event;

    if (key === 'logout') {
      dispatch({
        type: 'login/logout',
      });
      return;
    }

    history.push(`/account/${key}`);
  };


  const menuHeaderDropdown = (
    <Menu className={styles.menu} selectedKeys={[]} onClick={onMenuClick}>
      {menu && (
        <Menu.Item key="center">
          <UserOutlined />
          个人中心
        </Menu.Item>
      )}
      {menu && (
        <Menu.Item key="settings">
          <SettingOutlined />
          个人设置
        </Menu.Item>
      )}
      {menu && <Menu.Divider />}

      <Menu.Item key="logout">
        <LogoutOutlined />
        退出登录
      </Menu.Item>
    </Menu>
  );
  return currentUser && currentUser.username ? (
    <HeaderDropdown overlay={menuHeaderDropdown}>
      <span className={`${styles.action} ${styles.account}`}>
        <Avatar size="small" className={styles.avatar} src={currentUser.avatar} alt="avatar" />
        {/* <span className={`${styles.name} anticon`}>测试人员</span> */}
      </span>
    </HeaderDropdown>
  ) : (

    <HeaderDropdown overlay={menuHeaderDropdown}>
      <span className={`${styles.action} ${styles.account}`}>
        <Avatar size="small" className={styles.avatar} src="http://101.201.33.155/ymystatic/img/微信图片_20240223155933.jpg"  alt="avatar" />
        {localStorage.getItem("userUserName")}
      </span>
    </HeaderDropdown>
  );
};

export default connect(({ user }) => ({
  currentUser: user.currentUser,
}))(AvatarDropdown);
