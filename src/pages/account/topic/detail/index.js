import React, { useEffect, useRef, useState } from 'react';
import { Breadcrumb, Button, Card, Form, Modal, notification, Row, Select, Space, Spin, Table } from 'antd';
import { connect, history } from 'umi';
import { GridContent } from '@ant-design/pro-layout';
import { DeleteOutlined, PlusOutlined, ReloadOutlined, SettingOutlined } from '@ant-design/icons';
import useForm from 'antd/lib/form/hooks/useForm';
import moment from 'moment';
import axios from 'axios';
import TextArea from 'antd/es/input/TextArea';
import { debounce } from 'lodash';
import { delTopicImp, findTopicKeyList, saveTopic, updateTopicImp } from '@/services/topicKey'
import { findDeviceList } from '@/services/device';

const Center = () => {


  const [addTopicform] = useForm();

  const [importTopicform] = useForm();


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
 const  initTopicList=()=>{

   setTableLoading(true)

   const userStr=localStorage.getItem("user");
   const user=JSON.parse(userStr);

   let defaultDeviceId="";
   if(optionValue===""||optionValue===undefined|| optionValue===null){
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
     openNotification("error",`查询主题列表失败,原因: ${error}`,)
   });



 }

  // 【 初始化 】
  useEffect(() => {
    initTopicList()
    initDviceOption();
  }, []);


 // 【 刷新 】
 const onRefresh=()=>{
   setTableLoading(true)
   initTopicList();
   setTimeout(()=>{
     setTableLoading(false)
   },1000)

 }

 // 【 编辑 】
  const updateTopic=(record)=>{
    setIsModalOpen(true)
    operationRef.current.data="编辑"
    setIsModalOpen(true)

    addTopicform.setFieldsValue({
      'articleTopic': record.articleTopic,
      'articleTitle': record.articleTitle,
      'articleNum':  Number(record.articleNum),
      'articleSendTime': moment(record.articleSendTime),
      'userId': record.uid,
      'articleChannel': record.articleChannel,
      'id': record.id
    });

  }


  // [删除]
  const delTopic=(record)=>{
    Modal.confirm({
      title:   '确认删除',
      content: '确定要删除吗？',
      onOk() {
        const TopicId=record.id
        delTopicImp(TopicId).then(res=>{
          const resultCode=res.code
          // eslint-disable-next-line no-empty
          if(resultCode===0){
            openNotification("success",`删除主题列表成功`,)
          }
          initTopicList();
        }).catch((error)=>{
          openNotification("error",`删除主题列表失败,原因: ${error}`,)
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
      title: '收藏主题',
      content: '是否收藏主题?',
      onOk() {
        //  修改状态为2的状态
        params.status = 2;
        updateTopicImp(params).then(res => {
          if (res.code === 0) {
            openNotification('success', '收藏文章成功', 3.5);
          }
          initTopicList();

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
      dataIndex: 'uid',
      key: 'uid',
      width:'10%'
    },
    {
      title: '设备编号',
      dataIndex: 'deviceId',
      key: 'deviceId',
      width:'10%'
    },
    {
      title: '话题观点',
      dataIndex: 'topicDetail',
      key: 'topic',
      width:'20%'
    },
    {
      title: '话题观点',
      dataIndex: 'topicDetailComplete',
      key: 'topicDetailComplete',
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
        <Space key="TopicOpera">
          <a   onClick={()=>{updateTopic(record)}}>编辑</a>
          <a   onClick={()=>{updateTopic(record)}}>转换成主题</a>
        </Space>

      ],
    },
  ];

  const dataSource=[
    {
      "id":"1",
      "uid":"003",
      "deviceId":"15084762140",
      "topicDetail":"有大智慧，能看清形势，把握机会",
      "topicDetailComplete":"有大智慧，能看清形势，把握机会。据这个设定，以第一人称的口吻，写一篇200字的短文，语言通俗易懂，语言口语化，段落清晰，情感要真实 ，不要带有第一句话。",
      "createTime":"2024-00-00 00:00:00",
      "status":"已完成",
    }
  ]

//  【 新增-按钮】
  const addTopicModalClick=()=>{
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
    const param= addTopicform.getFieldsValue();
    param.uid=localUser.userAccount
    // eslint-disable-next-line no-self-assign
    param.deviceId=param.deviceId
    param.status=0
    param.createTime=moment(param.articleSendTime).format('YYYY-MM-DD HH:mm:ss')
    param.updateTime=moment(param.articleSendTime).format('YYYY-MM-DD HH:mm:ss')
    param.articleSendTime=moment(param.articleSendTime).format('YYYY-MM-DD HH:mm:ss')

    if(operationRef.current.data==="新增"){
      saveTopic(param).then(res => {
        if(res.code === 0){
            openNotification("success","【新增一条主题】成功",3.5)
        }
          initTopicList();
      }).catch((error) => {
        openNotification("error",`【新增一条主题】失败,原因:${error}`,5)
      });
    }

    if(operationRef.current.data==="编辑"){
      updateTopicImp(param).then(res => {
        if(res.code === 0){
          openNotification("success","【编辑主题】成功",3.5)
        }
        initTopicList();
      }).catch((error) => {
        openNotification("error",`【编辑主题】失败,原因:${error}`,5)
      });
    }

  }

  // 【 执行上传 】
  const handleUpload = (options) => {
    const upLoadForm= importTopicform.getFieldsValue();
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
    axios.post('http://101.201.33.155:8099/Topic/import/params/file', formData, {
 //   axios.post('http://localhost:8099/Topic/import/params/file', formData, {
      headers: {'Content-Type': 'multipart/form-data'}
      // eslint-disable-next-line no-unused-vars
    }).then((res) => {
      onSuccess(
        openNotification("success",`导入主题成功`,3.5)
      )
    }).catch((error) => {
      onError(
        openNotification("error",`导入主题失败，原因: ${error}`,3.5)
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
      if(tableDataSource[i].articleTopic.toString().indexOf(inputContent)>-1){
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
          initTopicList();
          openNotification("success",`删除【${item.articleTopic}】列表成功`,3);
       }
     }).catch((error)=>{
       openNotification("error",`删除【${item.articleTopic}】失败,原因: ${error}`,3);
     })
   });
  initTopicList();
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

  findTopicList(param).then(res => {
    let dates=[]
    dates=res.res;
    setTableDataSource(dates)
  }).catch((error) => {
    openNotification("error",`查询主题列表失败,原因: ${error}`,)
  });
}

  return (
    <GridContent>
      <Breadcrumb style={{marginBottom:20}}>
        <Breadcrumb.Item> <a onClick={()=>{history.push("../topic")}}>话题列表</a></Breadcrumb.Item>
        <Breadcrumb.Item>
          <a href="">话题详情</a>
        </Breadcrumb.Item>
      </Breadcrumb>

      <Row gutter={24}>
          <Card bordered style={{ marginBottom: 24 , width:'100%',height: '80%' }} >
            <Space  style={{ marginBottom: 16}}>
              <Button    type= 'primary'  icon={<PlusOutlined />} onClick={onDelBath}>批量转换主题</Button>
              <Button    icon={<DeleteOutlined />}  type= 'primary'  danger  onClick={onDelBath} > 批量删除</Button>
              <Button     type= 'primary'  icon={<SettingOutlined /> } onClick={onRefresh} >配置模板</Button>
              <Button     type= 'primary'  icon={<ReloadOutlined />} onClick={onRefresh} >刷新</Button>
            </Space>
            <Spin spinning={tableLoaidng}>
              <Table
                rowKey="id"
                columns={columns}
                // dataSource={tableDataSource}
                dataSource={dataSource}
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
        title={`${operationRef.current.data}主题`}
        open={isModalOpen}
        onOk={onModalOk}
        onCancel={()=>{    setIsModalOpen(false)}}
        width='60%'
        style={{height:'500px'}}
        destroyOnClose
      >
        <Form
          form={addTopicform}
          name="basic"
          labelCol={{ span: 8 }}
          wrapperCol={{ span: 16 }}
          autoComplete="off"
        >
          <Form.Item
            label="话题"
            name="articleTopic"
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
        </Form>
      </Modal>

    </GridContent>

  );
};

export default connect(({ loading, user }) => ({
  currentUser: user.currentUser,
  currentUserLoading: loading.effects['user/fetchCurrentUser'],
}))(Center);
