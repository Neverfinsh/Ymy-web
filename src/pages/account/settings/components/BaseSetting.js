import React, { useRef, useState } from 'react';
import { connect } from 'umi';
import { Button, Card, Form, Input, Modal, Row, Select, Space, Spin, Table } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import useForm from 'antd/lib/form/hooks/useForm';
import TextArea from 'antd/es/input/TextArea';
import { delThemImp } from '@/services/them';

const BaseSetting=()=>{

  const[settingModalForm] = useForm();
  const [settingModalOpen,setSettingModalOpen]=useState(false);

  const data=[
    {
      "id":"1",
      "name":"测试配置",
      "code":"1",
      "deviceId":"1",
      "accountId":"1",
      "remark":"1",
      "module":"测试模块",
    }
  ]

  const columns=[
    {
      title: '序号',
      dataIndex: 'id',
      key: 'id',
      onFilter: (value, record) => record.id.indexOf(value) === 0,
    },
    {
      title: '账号',
      dataIndex: 'accountId',
      key: 'accountId',
    },
    {
      title: '设备编号',
      dataIndex: 'deviceId',
      key: 'deviceId',
    },
    {
      title: '功能模块',
      dataIndex: 'module',
      key: 'module',
    },
    {
      title: '配置名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '配置编码',
      dataIndex: 'code',
      key: 'code',
    },
    {
      title: '备注',
      dataIndex: 'remark',
      key: 'remark',
    },
    {
      title: '操作',
      width: 250,
      key: 'option',
      valueType: 'option',
      // eslint-disable-next-line no-unused-vars
      render: (_, record) => [
        <Space key="opt">
          {/* eslint-disable-next-line no-use-before-define */}
         <a onClick={()=>delSettingClick(record)}>删除</a>
          {/* eslint-disable-next-line no-use-before-define */}
         <a onClick={()=>updateSettingClick(record)}>编辑</a>
        </Space>

      ],
    },
  ];

  const [tableLoading,setTableLoding]=useState(false);
  const operRef=useRef({data:''})

  const addSettingClick=()=>{
    operRef.current.data='add'
      setSettingModalOpen(true)
  }

  const updateSettingClick=()=>{
    operRef.current.data='update'
    setSettingModalOpen(true)
  }

  const delSettingClick=()=>{
    Modal.confirm({
      title:   '确认删除',
      content: '确定要删除吗？',
      onOk() {
        const settingId=record.id
        // delThemImp(themId).then(res=>{
        //   const resultCode=res.code
        //   // eslint-disable-next-line no-empty
        //   if(resultCode===0){
        //     openNotification("success",`删除主题列表成功`,)
        //   }
        //   initThemList();
        // }).catch((error)=>{
        //   openNotification("error",`删除主题列表失败,原因: ${error}`,)
        // })
      },
      onCancel() {},
    });
  }

  const modalOk=()=>{

  }


  const onChange = (value) => {
    console.log(`selected ${value}`);
  };

  const onSearch = (value) => {
    console.log('search:', value);
  };

// Filter `option.label` match the user type `input`
  const filterOption = (input, option) =>
    (option?.label ?? '').toLowerCase().includes(input.toLowerCase());
  return(<>
    <Row gutter={24}>
      <Card bordered style={{ marginBottom: 24 , width:'100%',height: '80%' }} >
        <Space  style={{ marginBottom: 16}}>
           <Button    type= 'primary'  icon={<PlusOutlined />}  onClick={addSettingClick}>新增配置详情</Button>
        </Space>
        <Spin spinning={tableLoading}>
          <Table
            rowKey="id"
            columns={columns}
            dataSource={data}
            scroll={{ x: 1500 }}
          />
        </Spin>
      </Card>
    </Row>
    <Modal
      title="操作配置"
      open={settingModalOpen}
      onOk={modalOk}
      onCancel={()=>{ setSettingModalOpen(false)}}
      width='60%'
      style={{height:'500px'}}
      destroyOnClose
    >
      <Form
        form={settingModalForm}
        labelCol={{ span: 4 }}
        wrapperCol={{ span: 16 }}
        autoComplete="off"
      >
        <Form.Item
          label="配置模块"
          name="module"
          rules={[{required: true}]}
        >
          <Select
            showSearch
            optionFilterProp="children"
            onChange={onChange}
            onSearch={onSearch}
            filterOption={filterOption}
            options={[
              {
                value: 'jack',
                label: 'Jack',
              },
              {
                value: 'lucy',
                label: 'Lucy',
              },
              {
                value: 'tom',
                label: 'Tom',
              },
            ]}
          />
        </Form.Item>
        <Form.Item
          label="配置名称"
          name="settingName"
          rules={[{required: true}]}
        >
          <TextArea rows={5}/>
        </Form.Item>
         <Form.Item
          label="配置编码"
          name="settingCode"
          rules={[{required: true}]}
         >
          <TextArea rows={5}/>
         </Form.Item>
         <Form.Item
          label="备注"
          name="remark"
          rules={[{required: true}]}
         >
          <Input/>
         </Form.Item>
      </Form>
    </Modal>
  </>)
}
export default connect(() => ({
}))(BaseSetting);
