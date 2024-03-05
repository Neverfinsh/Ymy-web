import React, { useEffect, useState } from 'react';
import { Button, Form, Input, Modal, notification, Space, Table } from 'antd';
import { PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import useForm from 'antd/lib/form/hooks/useForm';
import { addDeviceImp, delDevice, findDeviceList } from '@/services/device';

const DeviceView = () => {

  const [deviceModalForm] = useForm();
  const [deviceDataSource, setDeviceDataSource] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const columns = [
    {
      title: '序号',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: '设备编号',
      dataIndex: 'dviceName',
      key: 'dviceName',
    },
    {
      title: '账号类型',
      dataIndex: 'remark',
      key: 'remark',
    },
    {
      title: '硬件地址',
      dataIndex: 'deviceMac',
      key: 'deviceMac',
    },
    {
      title: '设备品牌',
      dataIndex: 'deviceBrand',
      key: 'deviceBrand',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (text) =>{
        return text === "0" ? '绑定' : '未绑定'
      },
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
      sorter: (a, b) => new Date(a.createTime) - new Date(b.createTime),
    },
    {
      title: '更新时间',
      dataIndex: 'updateTime',
      key: 'updateTime',
    },
    {
      title: '操作',
      width: 250,
      key: 'option',
      valueType: 'option',
      render: (record) => [
        <Space key="opt">
          {/* eslint-disable-next-line no-use-before-define */}
          <a onClick={() => delItem(record)}> 删除</a>
        </Space>
      ],
    },
  ];


  const openNotification = (type,content) => {
    notification[type]({
      message: content,
    });
  };


  // 【 初始化 】
  const  initDeviceList=()=>{
      const  accountStr=localStorage.getItem("user")
      const  accountObj=JSON.parse(accountStr);
      const  {userAccount} = accountObj
      findDeviceList(userAccount).then(res=>{
      const datas=res.res;
      setDeviceDataSource(datas);
    }).catch((error)=>{
        openNotification('error',`查询设备列表失败！原因:${error}`)
    });
  }


  useEffect(()=>{
    initDeviceList()
  },[])


// 【 删除】
  const delItem = (record) => {
    Modal.confirm({
      title:   '确认解绑',
      content: '确定要解绑吗？',
      onOk() {
        const devicedId=record.id
        delDevice(devicedId).then(res=>{
          if(res.code===0){
            openNotification('success','删除设备成功')
          }
          initDeviceList()
        }).catch((error)=>{
          openNotification('error',`删除设备失败,原因:${error}`)
        });
      },
      onCancel() {},
    });



  }


  // 【 新增】
  const addDevice = () => {
     setIsModalOpen(true)
  }


  // 【 刷新 】
  const refreshDevice = () => {
        initDeviceList();
  }

  // 【 新增modalOK 】
  const addModalOk=()=>{
    const  accountStr=localStorage.getItem("user")
    const  accountObj=JSON.parse(accountStr);
    const  {userAccount} = accountObj

    const  params= deviceModalForm.getFieldsValue();
           params.deviceUserAccount=userAccount
    addDeviceImp(params).then(res=>{
      if(res.code===0){
         openNotification('success','绑定设备成功')
      }
      initDeviceList();
    }).catch((error)=>{
        openNotification('success',`绑定设备失败。原因 :${error}`)
    })
    setIsModalOpen(false)
  }
  return ( <>
            <Space style={{ marginBottom: 16 }}>
              <Button type='primary' icon={<PlusOutlined />} onClick={addDevice}>绑定新设备</Button>
              <Button type='primary' icon={<ReloadOutlined />} onClick={refreshDevice}>刷新</Button>
            </Space>

            <Table
              rowKey="id"
              columns={columns}
              dataSource={deviceDataSource}
            />

    <Modal
      title="绑定新设备"
      open={isModalOpen}
      onOk={addModalOk}
      onCancel={()=>{  setIsModalOpen(false)}}
      width='800px'
      style={{height:'700px'}}
      destroyOnClose
    >
      <Form
        form={deviceModalForm}
        labelCol={{ span: 4 }}
        wrapperCol={{ span: 16 }}
        autoComplete="off"
      >
         <Form.Item
          label="设备编号"
          name="dviceName"
          rules={[{required: true}]}
         >
            <Input/>
         </Form.Item>
         <Form.Item
          label="设备硬件地址"
          name="deviceMac"
          rules={[{required: false}]}
         >
          <Input/>
         </Form.Item>
         <Form.Item
          label="设备品牌"
          name="deviceBrand"
          rules={[{required: false}]}
         >
          <Input/>
         </Form.Item>
         <Form.Item
          label="备注"
          name="remark"
          rules={[{required: false}]}
         >
          <Input/>
         </Form.Item>
      </Form>
    </Modal>
    </>
  )
}

export default DeviceView;
