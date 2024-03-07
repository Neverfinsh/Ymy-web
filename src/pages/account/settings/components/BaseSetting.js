import React, { useEffect, useRef, useState } from 'react';
import { connect } from 'umi';
import { Button, Card, Form, Input, Modal, Row, Select, Space, Spin, Table } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import useForm from 'antd/lib/form/hooks/useForm';
import TextArea from 'antd/es/input/TextArea';
import { delSettingImp, findSettingList, saveSetting, updateSettingImp } from '@/services/setting';
import { findDeviceList } from '@/services/device';
import { openNotification } from '@/utils/utils';

const BaseSetting=()=>{

  const[settingModalForm] = useForm();
  const [settingModalOpen,setSettingModalOpen]=useState(false);
  const [tableDatas,setTableDatas]=useState([]);
  const [tableLoading,setTableLoding]=useState(false);
  const operRef=useRef({data:''})
  const [deviceOption,setDeviceOption]=useState([]);
  const [moduleOptions,setModuleOptions]=useState([]);

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
      // todo 筛选
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




  const  initDviceOption =()=>{

    const  accountStr=localStorage.getItem("user")
    const  accountObj=JSON.parse(accountStr);
    const  {userAccount} = accountObj

    const  options=[]
    const  defaultObj={}
    defaultObj.value='all'
    defaultObj.label='------全部------'
    options.push(defaultObj)

    findDeviceList(userAccount).then(res=>{
      if(res.code===0){
        const   deviceNames=[]
        const   deviceList=res.res
        for(let i=0;i<deviceList.length; i += 1){
          deviceNames.push(deviceList[i].dviceName)
          const obj={}
          obj.value=deviceList[i].dviceName
          obj.label=deviceList[i].dviceName
          options.push(obj)
        }
        setDeviceOption(options);
      }
    }).catch((error)=>{
      openNotification('error',`获取设备编号失败!原因:${error}`,3)
    });
  }

  const  initSettingList =()=>{

    const userStr=localStorage.getItem("user");
    const user=JSON.parse(userStr);

    const param={}
          param.module=null
          param.deviceId=null
          param.accountId=user.userAccount
    findSettingList(param).then(result=>{
      console.log('res' ,res);
      const datas=[]
      const {res}=result
      // eslint-disable-next-line no-restricted-syntax
      for(const item of res){
           const obj={}
            obj.id=item.id
            obj.module=item.module
            obj.name=item.name
            obj.code=item.code
            obj.remark=item.remark
            obj.deviceId=item.deviceId
            obj.accountId=item.accountId
            obj.label=item.module
            obj.value=item.module
        datas.push(obj)
      }
       setTableDatas(datas)
      //
      const dataOptions=[];
      for(const item of res){
        const obj={}
              obj.label=item.module
              obj.value=item.module
        dataOptions.push(obj)
      }
      const uniqueArr = dataOptions.filter((obj, index, self) =>
        index === self.findIndex((t) => (
          t.label === obj.label && t.value === obj.value
        ))
      );
      setModuleOptions(uniqueArr)
    }).catch(err=>{
      console.log(' 发生错误' ,err);
    })
  }


  useEffect(()=>{
    initSettingList()
    initDviceOption()
  },[])



  const addSettingClick=()=>{
      operRef.current.data='add'
      setSettingModalOpen(true)
  }

  const updateSettingClick=(record)=>{
    console.log('--编辑的参数---' ,record);
      operRef.current.data='update'
      setSettingModalOpen(true)
       const arr=[]
       arr.push(record.module)
      settingModalForm.setFieldsValue({
        "id":record.id,
        "deviceId":record.deviceId,
        "module":arr,
        "settingName":record.name,
        "settingCode":record.code,
        "remark":record.remark
      })
  }


  const delSettingClick=(record)=>{
    Modal.confirm({
      title:   '确认删除',
      content: '确定要删除吗？',
      onOk() {
        const settingId=record.id
        delSettingImp(settingId).then(result=>{
            if(result.code===0){
              openNotification("success",`删除配置成功`,)
            }
        }).catch(error=>{
             openNotification("error",`删除配置失败,原因: ${error}`,)
        })
      },
      onCancel() {},
    });
  }

  const modalOk=()=>{

    const userStr=localStorage.getItem("user");
    const user=JSON.parse(userStr);
   const formDatas= settingModalForm.getFieldsValue();

    const param={}
          param.deviceId=formDatas.deviceId
          param.accountId=user.userAccount
          const moduleName=formDatas.module[0]
          param.module=moduleName

          param.name=formDatas.settingName
          param.code=formDatas.settingCode
          param.id=formDatas.id
          param.remark=formDatas.remark

    if( operRef.current.data === 'add'){
      saveSetting(param).then(result => {
        console.log('--新增参数---' ,param);
        if(result.code === 0){
           openNotification('success',`新增一条配置成功`)
           setSettingModalOpen(false)
        }
      }).catch((error) => {
         openNotification('error',`新增一条配置成功,失败原因:${error}`)
      });
    }else {
      // TODO 编辑
      updateSettingImp(param).then(result => {
        console.log('--编辑参数---' ,param);
        if(result.code === 0){
          openNotification('success',`编辑一条配置成功`)
          setSettingModalOpen(false)
        }
      }).catch((error) => {
         openNotification('error',`编辑一条配置成功,失败原因:${error}`)
      });
    }

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
           <Button    type= 'primary'  icon={<PlusOutlined />}  onClick={initSettingList}>刷新</Button>
        </Space>
        <Spin spinning={tableLoading}>
          <Table
            rowKey="id"
            columns={columns}
            dataSource={tableDatas}
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
            mode="tags"
            style={{ width: '100%', }}
            placeholder="选择配置模块"
            onChange={onChange}
            options={moduleOptions}
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
          label="输入设备编号"
          name="deviceId"
          rules={[{required: true}]}
        >
          <Select
            style={{ width: 150 }}
            options={deviceOption}
          />
        </Form.Item>
         <Form.Item
          label="备注"
          name="remark"
          rules={[{required: false}]}
         >
          <Input/>
         </Form.Item>
        <Form.Item
          label="配置ID"
          name="id"
          hidden
        >
          <Input/>
        </Form.Item>
      </Form>
    </Modal>
  </>)
}
export default connect(() => ({
}))(BaseSetting);
