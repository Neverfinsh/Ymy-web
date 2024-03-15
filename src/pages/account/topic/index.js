import React, { useEffect, useRef, useState } from 'react';
import {
  Breadcrumb,
  Button,
  Card,
  DatePicker,
  Form,
  Input,
  Modal,
  notification,
  Row,
  Select,
  Space,
  Spin,
  Table,
} from 'antd';
import { connect, history } from 'umi';
import { GridContent } from '@ant-design/pro-layout';
import { DeleteOutlined, PlusOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import useForm from 'antd/lib/form/hooks/useForm';
import moment from 'moment';
import axios from 'axios';
import TextArea from 'antd/es/input/TextArea';
import { debounce } from 'lodash';
import { delThemImp, updateThemImp } from '@/services/them';
import { findDeviceList } from '@/services/device';
import { delTopicImp, findTopicKeyList, saveTopic } from '@/services/topicKey';

const Center = () => {


  const [addThemform] = useForm();

  const [importThemform] = useForm();


  const[isModalOpen,setIsModalOpen]=useState(false);

  const[isInportFileModalOpen,setIsInportFileModalOpen]=useState(false);

  const [tableDataSource,setTableDataSource]=useState([]);

  const operationRef=useRef( {data:''});

  const [tableLoaidng,setTableLoading]=useState(false);


  const [selectedRowKeys, setSelectedRowKeys] = useState([])

  const [selectedRows, setSelectedRows] = useState([])

  // 【 初始化下拉列表】
  const [deviceOption,setDeviceOption]=useState([]);

  const[optionValue,setOptionValue]=useState();

  const[statuValue,setStatuValue]=useState("0");

  const [statuOption]=useState([
    {
      "label":"已完成",
       "value":"1"
    },
    {
      "label":"未完成",
      "value":"0"
    },
  ]);

  //  【 通知工具类 】
  const openNotification = (type,content,time) => {
    notification[type]({
      message: content,
      duration: time
    });
  };



  const  initDviceOption =()=>{

    const  accountStr=localStorage.getItem("user")
    const  accountObj=JSON.parse(accountStr);
    const  {userAccount} = accountObj

    const  options=[]
    const defaultObj={}
          defaultObj.value='all'
          defaultObj.label='------全部------'
    options.push(defaultObj)

    findDeviceList(userAccount).then(res=>{
      if(res.code===0){
        const   deviceNames=[]
        const   deviceList=res.res
        for(let i=0;i<deviceList.length;i += 1){
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

  //  【初始化】
 const  initTopicKeyList=()=>{
   setTableLoading(true)
   const userStr=localStorage.getItem("user");
   const user=JSON.parse(userStr);

   let defaultDeviceId="";
   if(optionValue===""||optionValue===undefined|| optionValue===null){
     //  const devicesStr=localStorage.getItem("devices");
      // const devices = JSON.parse(devicesStr);
      // eslint-disable-next-line prefer-destructuring
      //  defaultDeviceId=devices[0]
           defaultDeviceId="all"
   }else {
          defaultDeviceId=optionValue
   }

   if(user === undefined){
       history.push('/user/login');
       return ;
   }

   const  param={}
          param.userId=user.userAccount
          param.deviceId=defaultDeviceId
          param.status=Number(statuValue)

   findTopicKeyList(param).then(res => {
     let   dates=[]
           dates=res.res;
     setTableDataSource(dates)
    setTimeout(()=>{
      setTableLoading(false)
    },1000)
   }).catch((error) => {
     openNotification("error",`查询话题列表失败,原因: ${error}`,)
   });



 }

  // 【 初始化 】
  useEffect(() => {
    initTopicKeyList()
    initDviceOption();
  }, []);


 // 【 刷新 】
 const onRefresh=()=>{
   setTableLoading(true)
   initTopicKeyList();
   setTimeout(()=>{
     setTableLoading(false)
   },1000)

 }


 const  detailTopic=()=>{
   history.push("../account/topic/detail")
 }
 // 【 编辑 】
  const updateThem=(record)=>{
    setIsModalOpen(true)
    operationRef.current.data="编辑"
    setIsModalOpen(true)

    addThemform.setFieldsValue({
      'articleThem': record.articleThem,
      'articleTitle': record.articleTitle,
      'articleNum':  Number(record.articleNum),
      'articleSendTime': moment(record.articleSendTime),
      'userId': record.uid,
      'articleChannel': record.articleChannel,
      'id': record.id
    });

  }


  // [删除]
  const delThem=(record)=>{
    Modal.confirm({
      title:   '确认删除',
      content: '确定要删除吗？',
      onOk() {
        const themId=record.id
        delThemImp(themId).then(res=>{
          const resultCode=res.code
          // eslint-disable-next-line no-empty
          if(resultCode===0){
            openNotification("success",`删除话题列表成功`,)
          }
          initTopicKeyList();
        }).catch((error)=>{
          openNotification("error",`删除话题列表失败,原因: ${error}`,)
        })
      },
      onCancel() {},
    });
  }



  // [立即专化成文章] 更换时间
  const castCollect = (record) => {
    const params = record;
    setTableLoading(true);
    Modal.confirm({
      title: '收藏话题',
      content: '是否收藏话题?',
      onOk() {
        //  修改状态为2的状态
        params.status = 2;
        updateThemImp(params).then(res => {
          if (res.code === 0) {
            openNotification('success', '收藏文章成功', 3.5);
          }
          initTopicKeyList();

        }).catch((error) => {
          openNotification('error',   `收藏文章失败,原因:${error}`, 5);
        });
        setTimeout(() => {
          setTableLoading(false);
        }, 2000);
      },
      onCancel() {
        openNotification('success', '取消收藏文章', 3.5);
      },
    });
    setTableLoading(false);
  };


  // [ 列名 ]
  const columns=[
    {
      title: '序号',
      dataIndex: 'id',
      key: 'id',
      width:'10%'
    },
    {
      title: '账号',
      dataIndex: 'userId',
      key: 'userId',
      width:'10%'
    },
    {
      title: '设备编号',
      dataIndex: 'deviceId',
      key: 'deviceId',
      width:'10%'
    },
    {
      title: '话题内容',
      dataIndex: 'name',
      key: 'name',
      width:'20%'
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      // eslint-disable-next-line no-nested-ternary
      render: (text) => `${text === 0 ? '未发布' : text === 2 ? '已收藏' :'已成文'}`,
      width:'10%'
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
      sorter: (a, b) => new Date(a.createTime) - new Date(b.createTime),
      width:'15%'
    },
    {
      title: '操作',
      fixed: 'right',
      key: 'option',
      valueType: 'option',
      width: 150,
      render: (record) => [
        <Space key="themOpera">
          <a   onClick={()=>{detailTopic(record)}}>查看列表</a>
        </Space>

      ],
    },
  ];


//  【 新增-按钮】
  const addTopicKeyModalClick=()=>{
       operationRef.current.data="新增"
       setIsModalOpen(true)
  }

  // 【导入-按钮】
  const importFileModalClick=()=>{
    setIsInportFileModalOpen(true)
  }


 // 【 导入 -modal-ok】
  const onModalFileOk=()=>{
     setIsInportFileModalOpen(false)
  }
// 【 导入 -modal-cancel】
  const onModalFileCancel=()=>{
     setIsInportFileModalOpen(false)
  }


  // 【新增/编辑，modal 确认 oK 】
  const onModalOk=()=>{
    setIsModalOpen(false)
    const localUser=JSON.parse(localStorage.getItem("user"));
    const param= addThemform.getFieldsValue();
    param.name=param.topicName
    param.userId=localUser.userAccount
    // eslint-disable-next-line no-self-assign
    param.deviceId=param.deviceId
    param.status=1
    param.createTime=moment(param.articleSendTime).format('YYYY-MM-DD HH:mm:ss')
    param.type=0
    param.remark=""

    if(operationRef.current.data==="新增"){
      saveTopic(param).then(res => {
        if(res.code === 0){
            openNotification("success","【新增一条话题】成功",3.5)
        }
          initTopicKeyList();
      }).catch((error) => {
        openNotification("error",`【新增一条话题】失败,原因:${error}`,5)
      });
    }

    if(operationRef.current.data==="编辑"){
      updateThemImp(param).then(res => {
        if(res.code === 0){
          openNotification("success","【编辑话题】成功",3.5)
        }
        initTopicKeyList();
      }).catch((error) => {
        openNotification("error",`【编辑话题】失败,原因:${error}`,5)
      });
    }

  }

  // 【 执行上传 】
  const handleUpload = (options) => {
    const upLoadForm= importThemform.getFieldsValue();
    const localUser=JSON.parse(localStorage.getItem("user"));
    //  判断先填写form的选项
    const {file, onSuccess, onError} = options;
    const formData = new FormData();
    formData.append('file',  file);
    formData.append('uid',  localUser.userAccount);
    formData.append('deviceId',  upLoadForm.importDeviceId);
    formData.append('articleSendTime',  moment(upLoadForm.importArticleSendTime).format('YYYY-MM-DD HH:mm:ss'));
    formData.append('articleNum',  upLoadForm.importArticleNum);
    formData.append('channel',  upLoadForm.importArticleChannel);
    //
    axios.post('http://101.201.33.155:8099/them/import/params/file', formData, {
  //   axios.post('http://localhost:8099/them/import/params/file', formData, {
      headers: {'Content-Type': 'multipart/form-data'}
      // eslint-disable-next-line no-unused-vars
    }).then((res) => {
      onSuccess(
        openNotification("success",`导入话题成功`,3.5)
      )
    }).catch((error) => {
      onError(
        openNotification("error",`导入话题失败，原因: ${error}`,3.5)
      )
    });
  };


  const inputChange = debounce((value) => {
    // 处理输入变化的逻辑
    const inputContent=value
    const newDataSource=[]

    for (let i = 0; i < tableDataSource.length;  i += 1) {
      if(tableDataSource[i].id.toString().indexOf(inputContent)>-1){
        newDataSource.push(tableDataSource[i])
      }
      if(tableDataSource[i].articleThem.toString().indexOf(inputContent)>-1){
        newDataSource.push(tableDataSource[i])
      }
    }
    setTableDataSource(newDataSource)
  }, 300); // 设置防抖的延迟时间，单位为毫秒


  // eslint-disable-next-line no-shadow
  const onTableSelectChange = (selectedRowKeys, selectedRows) => {
    setSelectedRowKeys(selectedRowKeys)
    setSelectedRows(selectedRows)
  }

const onDelBath=()=>{
  console.log('--selectedRows-' ,selectedRows);
  selectedRows.forEach(item => {
    delTopicImp(item.id).then(res=>{
       const resultCode=res.code
       if(resultCode===0){
         setSelectedRowKeys([])
         setSelectedRows([])
          initTopicKeyList();
          openNotification("success",`删除【${item.articleThem}】列表成功`,3);
       }
     }).catch((error)=>{
       openNotification("error",`删除【${item.articleThem}】失败,原因: ${error}`,3);
     })
   });
  initTopicKeyList();
}


  const onOptionChange=(value)=>{
        setOptionValue(value);
  }

  const onStatuOptionChange=(value)=>{
         setStatuValue(value);
  }



  const onSearch=()=>{

  const userStr=localStorage.getItem("user");
  const user=JSON.parse(userStr);

    let defaultDeviceId="";
    if(optionValue===""||optionValue===undefined|| optionValue===null){
      const devicesStr=localStorage.getItem("devices");
      const devices = JSON.parse(devicesStr);
      // eslint-disable-next-line prefer-destructuring
      defaultDeviceId=devices[0]
    }else {
      defaultDeviceId=optionValue
    }

  const   param={}
          param.userId=user.userAccount
          param.deviceId=defaultDeviceId
          param.status=Number(statuValue)

  findTopicKeyList(param).then(res => {
    let dates=[]
    dates=res.res;
    setTableDataSource(dates)
  }).catch((error) => {
    openNotification("error",`查询话题列表失败,原因: ${error}`,)
  });
}

  return (
    <GridContent>
      <Breadcrumb style={{marginBottom:20}}>
        <Breadcrumb.Item> <a>/话题列表</a></Breadcrumb.Item>
      </Breadcrumb>
      <Row gutter={24}>
          <Card bordered style={{ marginBottom: 24 , width:'100%',height: '80%' }} >
            <Space  style={{ marginBottom: 16}}>
              <Button    type= 'primary'  icon={<PlusOutlined />} onClick={addTopicKeyModalClick}>新增话题</Button>
              <Button    icon={<DeleteOutlined />}  type= 'primary'  danger  onClick={onDelBath} > 批量删除</Button>
              {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
              <a> 设备编号:</a>
              <Select     defaultValue="all" style={{ width: 150 }}       options={deviceOption}    onChange={onOptionChange} />
              <Select     defaultValue="0"   style={{ width: 150 }}       options={statuOption}    onChange={onStatuOptionChange} />
              <Input      placeholder= "输入搜索的话题序号、内容..."  onChange={ (e)=>{inputChange(e.target.value)}} style={{width:250}}/>
              <Button     type= 'primary'  icon={<SearchOutlined  />} onClick={onSearch} >查询</Button>
              <Button     type= 'primary'  icon={<ReloadOutlined />} onClick={onRefresh} >刷新</Button>
            </Space>
            <Spin spinning={tableLoaidng}>
              <Table
                rowKey="id"
                columns={columns}
                dataSource={tableDataSource}
                style={{width:'100%'}}
                scroll={{ x: 1300 }}
                pagination={{
                  pageSizeOptions: [5,10, 20, 50, 100],
                  showSizeChanger: true,
                }}
                rowSelection={{
                    selectedRowKeys,
                    onChange: onTableSelectChange
                }}
              />
            </Spin>
          </Card>
      </Row>
      {/** ******************************  [ 新增/编辑 modal]  ******************************************* */}
      <Modal
        title={`${operationRef.current.data}话题`}
        open={isModalOpen}
        onOk={onModalOk}
        onCancel={()=>{    setIsModalOpen(false)}}
        width='60%'
        style={{height:'500px'}}
        destroyOnClose
      >
        <Form
          form={addThemform}
          labelCol={{ span: 8 }}
          wrapperCol={{ span: 16 }}
          autoComplete="off"
        >
          <Form.Item
            label="话题"
            name="topicName"
            rules={[{required: true}]}
          >
            <TextArea   rows={4}  />
          </Form.Item>
          <Form.Item
            label="选择设备编号"
            name="deviceId"
            rules={[{required: true}]}
          >
            <Select options={deviceOption}  />
          </Form.Item>
          <Form.Item
            label="选择模板"
            name="deviceId"
            rules={[{required: true}]}
          >
            <Select options={deviceOption}  />
          </Form.Item>
              <Form.Item
                label="发布时间"
                name="SendTime"
                tooltip="开始发布的时间"
                rules={[{required: true}]}

              >
                <DatePicker showTime  style={{ width: 150 }}/>
              </Form.Item>
        </Form>
      </Modal>

      {/** ******************************  [ 上传的 modal]  ******************************************* */}

      {/* <Modal */}
      {/*  title="批量导入话题" */}
      {/*  open={isInportFileModalOpen} */}
      {/*  onOk={onModalFileOk} */}
      {/*  onCancel={onModalFileCancel} */}
      {/*  width='60%' */}
      {/*  style={{height:'500px'}} */}
      {/*  destroyOnClose */}
      {/* > */}
      {/*  <Form */}
      {/*    form={importThemform} */}
      {/*    name="basic" */}
      {/*    labelCol={{ span: 8 }} */}
      {/*    wrapperCol={{ span: 16 }} */}
      {/*    autoComplete="off" */}
      {/*  > */}
      {/*    <Form.Item */}
      {/*      label="文章篇数" */}
      {/*      name="importArticleNum" */}
      {/*      rules={[{required: true}]} */}

      {/*    > */}
      {/*      <InputNumber  min={1}            style={{ width: 150 }}/> */}
      {/*    </Form.Item> */}
      {/*    <Form.Item */}
      {/*      label="开始发布时间" */}
      {/*      name="importArticleSendTime" */}
      {/*      tooltip="开始发布的时间" */}
      {/*      rules={[{required: true}]} */}

      {/*    > */}
      {/*      <DatePicker showTime       style={{ width: 150 }}/> */}
      {/*    </Form.Item> */}
      {/*    <Form.Item */}
      {/*      label="输入设备编号" */}
      {/*      name="importDeviceId" */}
      {/*      rules={[{required: true}]} */}
      {/*    > */}
      {/*      <Select style={{ width: 150 }} options={deviceOption}  /> */}
      {/*    </Form.Item> */}
      {/*    <Form.Item */}
      {/*      label="选择发布平台" */}
      {/*      name="importArticleChannel" */}
      {/*      rules={[{required: true}]} */}
      {/*    > */}
      {/*      <Select  style={{ width: 150 }}> */}
      {/*        <Select.Option value="tt">今日头条</Select.Option> */}
      {/*        <Select.Option value="xhs">小红书</Select.Option> */}
      {/*      </Select> */}
      {/*    </Form.Item> */}
      {/*    <Form.Item */}
      {/*      label="话题" */}
      {/*      name="articleThemFile" */}
      {/*      rules={[{required: false}]} */}
      {/*    > */}
      {/*      <Upload */}
      {/*         name="file" */}
      {/*         customRequest={handleUpload} */}
      {/*      > */}
      {/*        <Button key="upload" icon={<CloudUploadOutlined />}  type= 'primary'   > 导入</Button> */}
      {/*      </Upload> */}
      {/*    </Form.Item> */}
      {/*  </Form> */}
      {/* </Modal> */}


    </GridContent>

  );
};

export default connect(({ loading, user }) => ({
  currentUser: user.currentUser,
  currentUserLoading: loading.effects['user/fetchCurrentUser'],
}))(Center);
