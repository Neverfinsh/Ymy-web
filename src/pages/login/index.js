import React, { useState } from 'react';
import { Alert, Button, Checkbox, Form, Input } from 'antd';
import { LockTwoTone, UserOutlined } from '@ant-design/icons';
import { connect, history } from 'umi';
import styles from './index.less';
import { findDeviceList, userLogin } from '@/services/device';
import { openNotification } from '@/utils/utils';

const FormItem = Form.Item;

const LoginMessage = ({ content }) => (
  <Alert
    style={{
      marginBottom: 24,
    }}
    message={content}
    type="error"
    showIcon
  />
);

const Login = (props) => {
  const { status = {}, submitting } = props;
  const [autoLogin, setAutoLogin] = useState(true);

  const handleSubmit = (values) => {
    const param=values
    userLogin(param).then(res=>{
      if(res.code === 0){
        console.log('登录结果返回:' ,res);
        openNotification('success',`登录成功`,5)
        const     userInfo=res.res;
        const     user={}
                  user.userAccount=userInfo.userAccount;
                  user.userUserName=userInfo.userUserName
        localStorage.setItem("user",JSON.stringify(user))
        localStorage.setItem("userUserName",userInfo.userUserName)
        //  存入设备信息
        const account=  userInfo.userAccount
        // eslint-disable-next-line no-shadow
        findDeviceList(account).then(res=>{
            if(res.code===0){
                  const  deviceNames=[]
                  const   deviceList=res.res
              // eslint-disable-next-line no-plusplus
                 for(let i=0;i<deviceList.length;i++){
                    deviceNames.push(deviceList[i].dviceName)
                 }
                localStorage.setItem("devices",JSON.stringify(deviceNames))
                history.push("../../data")
            }
        }
        ).catch((error)=>{
          openNotification('error',`获取用户相关的设备列表错误！原因${error}`,5)
        });

      }else {
        openNotification('error',`登录失败！失败`)
      }
    }).catch((error)=>{
      openNotification('error',`登录失败！失败原因:${error}`)
    })
  };

  return (
    <div className={styles.login}    >
      <Form
        form={props.from}
        onFinish={(values) => {
           handleSubmit(values);
        }}

      >
        {status === 'error' && !submitting && <LoginMessage content="账户或密码错误（user/123456）" />}
        <FormItem
          name="userAccount"
          rules={[
            {
              required: true,
              message: '请输入用户名!',
            },
          ]}
        >

          <Input
            size="large"
            placeholder="用户名"
            // prefix={<UserOutlined style={{ color: 'transparent' }} className={styles.prefixIcon} />}
            prefix={<UserOutlined   className={styles.prefixIcon} /> }
          />
        </FormItem>
        <FormItem
          name="userAccountPassword"
          rules={[
            {
              required: true,
              message: '请输入密码！',
            },
          ]}
        >
          <Input.Password
            size="large"
            placeholder="密码"
            prefix={<LockTwoTone className={styles.prefixIcon} />}
          />
        </FormItem>
        <div>
          <Checkbox checked={autoLogin} onChange={(e) => setAutoLogin(e.target.checked)}>
            自动登录
          </Checkbox>
          <a style={{ float: 'right' }}> 忘记密码 </a>
        </div>
        <FormItem>
          <Button className={styles.submit} size="large" type="primary" htmlType="submit" loading={submitting}>
            登录
          </Button>
        </FormItem>
      </Form>
    </div>
  );
};

export default connect()(Login);
