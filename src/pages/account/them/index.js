import React, { useEffect, useRef, useState } from 'react';
import {
  Button,
  Card,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Modal,
  notification,
  Row,
  Select,
  Space,
  Spin, Switch,
  Table,
  Upload,
} from 'antd';
import { connect, history } from 'umi';
import { GridContent } from '@ant-design/pro-layout';
import { CloudUploadOutlined, DeleteOutlined, PlusOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import useForm from 'antd/lib/form/hooks/useForm';
import moment from 'moment';
import axios from 'axios';
import TextArea from 'antd/es/input/TextArea';
import { debounce } from 'lodash';
import { delThemImp, findThemList, saveThem, updateThemImp } from '@/services/them';
import { findDeviceList } from '@/services/device';
import { findSettingList, saveSetting } from '@/services/setting';

const Center = () => {


  const [addThemform] = useForm();
  const [importThemform] = useForm();
  const [templateThemform] = useForm();
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
  const[tempplateModalOpen,setTempplateModalOpen]=useState(false);
  // [新增模板主题的 开始和结束的下拉框]、
  const [startTmpSelectDatas,setStartTemplateSelectDatas]=useState([]);
  const [endtmpSelectDatas,setEndTemplateSelectDatas]=useState([]);

  const [saveStartTmp,setSaveStartTmp]=useState(false)
  const [saveEndTmp,setSaveEndTmp]=useState(false)

  const titleTmp="例如：把 '如何谈恋爱'? 这个标题润色一下,使得标题更加吸引人眼球，更加具体创新力，不超过14个字，要求标题带有双引号,不要带有冒号";

  const themTmp="假如你是一个30岁单身的女性的，在广州上班，自身条件也不错，有身材有颜值，想找一个年龄比我大，阅历比我丰富的男性。如果有合适记得给我推荐。根据这个设定，以第一人称的口吻写一篇300字的短文，语言口语化，情感要真实 ，文章段落清晰，不要带有第一句。";

  const [statuOption]=useState([
    {
      "label":"已成文",
       "value":"1"
    },
    {
      "label":"未成文",
      "value":"0"
    },

    {
      "label":"已收藏",
      "value":"2"
    },
  ]);

  const  onStartChange =()=>{
    const param=templateThemform.getFieldsValue();
    templateThemform.setFieldsValue({
      "startTemplateContent":param.startTemplate
    })
  }

  const onEndChange=()=>{
    const param=templateThemform.getFieldsValue();
    templateThemform.setFieldsValue({
      "endTemplateContent":param.endTemplate
    })
  }

  //  【 通知工具类 】
  const openNotification = (type,content,time) => {
    notification[type]({
      message: content,
      duration: time
    });
  };



  const onTemplateMdalOk=()=>{

    const localUser=JSON.parse(localStorage.getItem("user"));
    const param=templateThemform.getFieldsValue();

    param.uid=localUser.userAccount
    // eslint-disable-next-line no-self-assign
    param.deviceId=param.deviceId
    param.status=0
    param.createTime=moment(param.articleSendTime).format('YYYY-MM-DD HH:mm:ss')
    param.updateTime=moment(param.articleSendTime).format('YYYY-MM-DD HH:mm:ss')
    param.articleSendTime=moment(param.articleSendTime).format('YYYY-MM-DD HH:mm:ss')
    const articleThem=param.startTemplateContent+param.keyWordTemplate+param.endTemplateContent
    param.articleThem=articleThem

    console.info("新增一条模板话题,请求参数:",param)
    saveThem(param).then(res => {
      if(res.code === 1){
        openNotification("success","【新增一条模板主题】成功",3.5)
        // eslint-disable-next-line no-use-before-define
        initThemList();
        setTempplateModalOpen(false)
      }
    }).catch((error) => {
       openNotification("error",`【模板新增一条主题】失败,原因:${error}`,5)
    });
  }


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
 const  initThemList=()=>{

   setTableLoading(true)

   const userStr=localStorage.getItem("user");
   const user=JSON.parse(userStr);

   let defaultDeviceId = '';
   if (optionValue === '' || optionValue === undefined || optionValue === null) {
     defaultDeviceId = 'all';
   } else {
     defaultDeviceId = optionValue;
   }

   if(user === undefined){
       history.push('/user/login');
       return ;
   }

   const  param={}
        param.userId=user.userAccount
        param.deviceId=defaultDeviceId
        param.status=Number(statuValue)

   findThemList(param).then(res => {
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
    initThemList()
    initDviceOption();
  }, []);


 // 【 刷新 】
 const onRefresh=()=>{
   setTableLoading(true)
   initThemList();
   setTimeout(()=>{
     setTableLoading(false)
   },1000)

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
      'deviceId':record.deviceId,
      'status':`${record.status}`,
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
            openNotification("success",`删除主题列表成功`,)
          }
          initThemList();
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
        updateThemImp(params).then(res => {
          if (res.code === 0) {
            openNotification('success', '收藏文章成功', 3.5);
          }
          initThemList();

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
      width:'5%'
    },
    // {
    //   title: '账号',
    //   dataIndex: 'uid',
    //   key: 'uid',
    //   width:'10%'
    // },
    // {
    //   title: '设备编号',
    //   dataIndex: 'deviceId',
    //   key: 'deviceId',
    //   width:'10%'
    // },
    {
      title: '标题模板',
      dataIndex: 'articleTitleTemplate',
      key: 'articleTitleTemplate',
      width:'20%',
      render: (text) => {
        return (text===""  || text===null )?'未设置标题模板':<a style={{fontWeight:'bold'}}>{text}</a>
      }
    },

    {
      title: '主题名',
      dataIndex: 'articleThem',
      key: 'articleThem',
      width:'20%'
    },

    {
      title: '篇数',
      dataIndex: 'articleNum',
      key: 'articleNum',
      width:'10%'
    },
    // {
    //   title: '状态',
    //   dataIndex: 'status',
    //   key: 'status',
    //   // eslint-disable-next-line no-nested-ternary
    //   render: (text) => `${text === 0 ? '未发布' : text === 2 ? '已收藏' :'已成文'}`,
    //   width:'10%'
    // },
    {
      title: '发布时间',
      dataIndex: 'articleSendTime',
      key: 'articleSendTime',
      width:'15%'
    },
    // {
    //   title: '发布平台',
    //   dataIndex: 'articleChannel',
    //   key: 'articleChannel',
    //   render: (text) =>{
    //     return text === undefined ? '今日头条' : '其他平台'
    //   },
    //   width:'15%'
    // },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
      sorter: (a, b) => new Date(a.createTime) - new Date(b.createTime),
      width:'15%'
    },
    // {
    //   title: '更新时间',
    //   dataIndex: 'updateTime',
    //   key: 'updateTime',
    //   sorter: (a, b) => new Date(a.updateTime) - new Date(b.updateTime),
    //   width:'15%'
    //
    // },
    {
      title: '操作',
      fixed: 'right',
      key: 'option',
      valueType: 'option',
      width: 150,
      render: (record) => [
        <Space key="themOpera">
          <a       onClick={()=>{updateThem(record)}}>编辑</a>
          <a       onClick={()=>{delThem(record)}}>删除</a>
          <a       onClick={()=>{castCollect(record)}}>收藏</a>
        </Space>

      ],
    },
  ];


//  【 新增-按钮】
  const addThemModalClick=()=>{
       operationRef.current.data="新增"
       setIsModalOpen(true)
       addThemform.setFieldsValue({
         "status":"0",
         "articleSendTime": moment().add(20,'minutes')
       })
  }
  //  【 新增-按钮】
  const addTemplateModalClick=()=>{



    if(optionValue === undefined || optionValue ==='all'){
       openNotification("warn","请先选择具体的设备",3.5)
       document.getElementById('deviceId').focus();
       return;
    }

    templateThemform.setFieldsValue({
      "deviceId":optionValue ,
      "articleNum":1 ,
      "articleSendTime":moment().add(50,'minutes')
    })

    // 查询这个账号和设备的模板信息
     const userStr=localStorage.getItem("user");
     const user=JSON.parse(userStr);

    const param={}
    param.accountId=user.userAccount
    param.deviceId=optionValue
    param.module='THEM_TP_START_MODULE'
    console.log('查询模板获取的的请求参数' ,param);
    findSettingList(param).then((apiResult)=>{
        const {res}=apiResult
      const startOptions=[]
      // eslint-disable-next-line no-restricted-syntax
      for(const item of res){
         const  option={}
                option.label=item.name;
                option.value=item.name;
        startOptions.push(option)
      }
      setStartTemplateSelectDatas(startOptions)
      // TODO: 查询结尾的模板
      let  endParams={}
      endParams=param
      endParams.module='THEM_TP_END_MODULE'
      console.log('查询模板获取的的请求参数[end]' ,endParams);
      findSettingList(endParams).then((apiResult2)=>{
        const res2 =apiResult2.res
        const endOptions=[]
        // eslint-disable-next-line no-restricted-syntax
        for(const item of res2){
          const   option={}
          option.label=item.name;
          option.value=item.name;
          endOptions.push(option)
        }
        setEndTemplateSelectDatas(endOptions)
      }).catch(err=>{
        openNotification("error",`请求结束模板参数错误:${err}`,3.5)
      })
      //
    }).catch(err=>{
      openNotification("error",`请求开头模板参数错误:${err}`,3.5)
    })

    setTempplateModalOpen(true)

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
    param.uid=localUser.userAccount
    // eslint-disable-next-line no-self-assign
    param.deviceId=param.deviceId
    param.status=0
    param.createTime=moment(param.articleSendTime).format('YYYY-MM-DD HH:mm:ss')
    param.updateTime=moment(param.articleSendTime).format('YYYY-MM-DD HH:mm:ss')
    param.articleSendTime=moment(param.articleSendTime).format('YYYY-MM-DD HH:mm:ss')
    // eslint-disable-next-line no-use-before-define
    param.articleTitleStatus=tmp?0:1

    if(operationRef.current.data==="新增"){
      saveThem(param).then(res => {
        if(res.code === 0){
            openNotification("success","【新增一条主题】成功",3.5)
        }
          initThemList();
      }).catch((error) => {
        openNotification("error",`【新增一条主题】失败,原因:${error}`,5)
      });
    }

    if(operationRef.current.data==="编辑"){
      updateThemImp(param).then(res => {
        if(res.code === 0){
          openNotification("success","【编辑主题】成功",3.5)
        }
        initThemList();
      }).catch((error) => {
        openNotification("error",`【编辑主题】失败,原因:${error}`,5)
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
    // axios.post('http://localhost:8099/them/import/params/file', formData, {
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
     delThemImp(item.id).then(res=>{
       const resultCode=res.code
       if(resultCode===0){
         setSelectedRowKeys([])
         setSelectedRows([])
          initThemList();
          openNotification("success",`删除【${item.articleThem}】列表成功`,3);
       }
     }).catch((error)=>{
       openNotification("error",`删除【${item.articleThem}】失败,原因: ${error}`,3);
     })
   });
  initThemList();
}


  const onOptionChange=(value)=>{
        setOptionValue(value);
  }

  const onStatuOptionChange=(value)=>{
         setStatuValue(value);
  }



  const onSaveStartTmpClick=()=>{

    const localUser=JSON.parse(localStorage.getItem("user"));
    const accountId=localUser.userAccount
    const tmpFormData=templateThemform.getFieldsValue();
    const startTmp=tmpFormData.startTemplateContent
    const startParam={}
          startParam.module="THEM_TP_START_MODULE"
          startParam.name= startTmp
          startParam.code=startTmp
          startParam.deviceId=optionValue
          startParam.accountId=accountId
          startParam.remark=""

    saveSetting(startParam).then((res)=>{
      console.log('res:' ,res);
      setSaveStartTmp(true)
    }).catch(error=>{
      console.log('error' ,error);
    })
  }



  const onSaveEndTmpClick=()=>{
    const localUser=JSON.parse(localStorage.getItem("user"));
    const accountId=localUser.userAccount
    const tmpFormData=templateThemform.getFieldsValue();
    const endTmp=tmpFormData.endTemplateContent

    const startParam={}
    startParam.name=  endTmp
    startParam.code= endTmp
    startParam.module="THEM_TP_END_MODULE"
    startParam.deviceId=  optionValue
    startParam.accountId= accountId
    startParam.remark=""

    console.log('---保存结尾模板的请求参数---' ,startParam);
    saveSetting(startParam).then((res)=>{
      console.log('res:' ,res);
      setSaveEndTmp(true)
    }).catch(error=>{
      console.log('error' ,error);
    })
  }

  const onDataAfterTmp=()=>{
    const today = moment().startOf('day');
    const time = moment(today).set({ hour: 14, minute: 0, second: 0 });
    addThemform.setFieldsValue({
       "articleSendTime":time
    })
  }

  const onDataMoringTmp=()=>{
    const today = moment().startOf('day');
    const time = moment(today).set({ hour: 6, minute: 0, second: 0 });
    addThemform.setFieldsValue({
       "articleSendTime":time
    })
  }
  const onDataNgTmp=()=>{
    const today = moment().startOf('day');
    const time = moment(today).set({ hour: 19, minute: 0, second: 0 });
    addThemform.setFieldsValue({
      "articleSendTime":time
    })
  }

  const onDataTMTmp=()=>{
  const tomorrow = moment().add(1, 'day').startOf('day');
  const time = moment(tomorrow).set({ hour: 6, minute: 0, second: 0 });
  addThemform.setFieldsValue({
      "articleSendTime":time
    })
  }

  const onDataTmAfTmp=()=>{
    const tomorrow = moment().add(1, 'day').startOf('day');
    const time = moment(tomorrow).set({ hour: 13, minute: 0, second: 0 });
    addThemform.setFieldsValue({
      "articleSendTime":time
    })
  }


  const onDataTmNgTmp=()=>{
    const tomorrow = moment().add(1, 'day').startOf('day');
    const time = moment(tomorrow).set({ hour: 19, minute: 0, second: 0 });
    addThemform.setFieldsValue({
      "articleSendTime":time
    })
  }


  const ondataFooter=()=>{
    return(
       <Space>
          <Button  type="primary"  onClick={onDataMoringTmp} size="small">今天6点 </Button>
          <Button  type="primary"  onClick={onDataAfterTmp} size="small"> 今天14点 </Button>
          <Button  type="primary"  onClick={onDataNgTmp} size="small">    今天19点 </Button>
          <Button  type="primary"  onClick={onDataTMTmp} size="small">   明天6点 </Button>
          <Button  type="primary"  onClick={onDataTmAfTmp} size="small"> 明天14点 </Button>
          <Button  type="primary"  onClick={onDataTmNgTmp} size="small"> 明天19点 </Button>
        </Space>
    )
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

  findThemList(param).then(res => {
    let dates=[]
    dates=res.res;
    setTableDataSource(dates)
  }).catch((error) => {
    openNotification("error",`查询主题列表失败,原因: ${error}`,)
  });
}


 // const [tmp,setTmp]=useState(false)
  const [tmp,setTmp]=useState(true)
  useEffect(()=>{
    setTmp(tmp)
  },[tmp])

const switchChange =(value)=>{
      setTmp(!value)
}

  return (
    <GridContent>
      <Row gutter={24}>
          <Card bordered style={{ marginBottom: 24 , width:'100%',height: '80%' }} >
            <Space  style={{ marginBottom: 16}}>
              <Button    type= 'primary'  icon={<PlusOutlined />} onClick={addThemModalClick}>新增</Button>
              <Button    icon={<CloudUploadOutlined />}  type= 'primary' onClick={importFileModalClick}   > 导入</Button>
              <Button    icon={<DeleteOutlined />}  type= 'primary'  danger  onClick={onDelBath} > 批量删除</Button>
              {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
              <a> 设备编号:</a>
              <Select     defaultValue="all" style={{ width: 150 }}       options={deviceOption}    onChange={onOptionChange} id="deviceId" />
              <Button    type= 'primary'  icon={<PlusOutlined />} onClick={addTemplateModalClick}>模板新增</Button>
              <Select     defaultValue="0"   style={{ width: 150 }}       options={statuOption}    onChange={onStatuOptionChange} />
              <Input      placeholder= "输入搜索的主题序号、内容..."  onChange={ (e)=>{inputChange(e.target.value)}} style={{width:250}}/>
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
        title={`${operationRef.current.data}主题`}
        open={isModalOpen}
        onOk={onModalOk}
        onCancel={()=>{    setIsModalOpen(false)}}
        width='60%'
        style={{height:'500px'}}
        destroyOnClose
      >
        <Form
          form={addThemform}
          name="basic"
          labelCol={{ span: 8 }}
          wrapperCol={{ span: 16 }}
          autoComplete="off"
        >
          <Form.Item
            label="主题"
            name="articleThem"
            rules={[{required: true}]}
          >
            <TextArea   rows={4}  placeholder={themTmp} />
          </Form.Item>
          <Form.Item
            label="生成标题"
            name="articleTitleStatus"
            rules={[{required: true}]}
          >
              <Switch  onChange={switchChange}  checkedChildren="是" unCheckedChildren="否" />
          </Form.Item>
             <a style={{marginLeft:'34%'}}  hidden={tmp}>{titleTmp}</a>
          <Form.Item
            label="生成标题模板"
            name="articleTitleTemplate"
            hidden={tmp}
            rules={[{required:`${tmp}` }]}
          >
            <TextArea   rows={4}  />
          </Form.Item>
          <Form.Item
            label="文章篇数"
            name="articleNum"
            rules={[{required: true}]}
          >
            <InputNumber  min={1}/>
          </Form.Item>
          <Form.Item
            label="开始发布时间"
            name="articleSendTime"
            tooltip="开始发布的时间"
            rules={[{required: true}]}
          >
              <DatePicker showTime  renderExtraFooter={ondataFooter}  />
          </Form.Item>
          <Form.Item
            label="选择设备编号"
            name="deviceId"
            rules={[{required: true}]}
          >
            <Select options={deviceOption}  />
          </Form.Item>
          <Form.Item
            label="状态"
            name="status"
            rules={[{required: true}]}
          >
            <Select
              style={{ width: 150 }}
              options={statuOption}
            />
          </Form.Item>
          {/* <Form.Item */}
          {/*  label="选择发布平台" */}
          {/*  name="articleChannel" */}
          {/*  rules={[{required: true}]} */}
          {/* > */}
          {/*  <Select> */}
          {/*    <Select.Option value="tt">今日头条</Select.Option> */}
          {/*    <Select.Option value="xhs">小红书</Select.Option> */}
          {/*  </Select> */}
          {/* </Form.Item> */}
          <Form.Item
            name="id"
            rules={[{required: true}]}
            style={{display:'none' , width: 100}}
          >
            {/* <Select> */}
            {/*  <Select.Option value="demo">今日头条</Select.Option> */}
            {/*  <Select.Option value="demo">小红书</Select.Option> */}
            {/* </Select> */}
            <Input/>
          </Form.Item>
        </Form>
      </Modal>


      {/** ******************************  [ 上传的 modal]  ******************************************* */}

      <Modal
        title="批量导入主题"
        open={isInportFileModalOpen}
        onOk={onModalFileOk}
        onCancel={onModalFileCancel}
        width='60%'
        style={{height:'500px'}}
        destroyOnClose
      >
        <Form
          form={importThemform}
          name="basic"
          labelCol={{ span: 8 }}
          wrapperCol={{ span: 16 }}
          autoComplete="off"
        >
          <Form.Item
            label="文章篇数"
            name="importArticleNum"
            rules={[{required: true}]}

          >
            <InputNumber  min={1}            style={{ width: 150 }}/>
          </Form.Item>
          <Form.Item
            label="开始发布时间"
            name="importArticleSendTime"
            tooltip="开始发布的时间"
            rules={[{required: true}]}
          >
            <DatePicker showTime  style={{ width: 150 }}  />
          </Form.Item>
          <Form.Item
            label="输入设备编号"
            name="importDeviceId"
            rules={[{required: true}]}
          >
            <Select style={{ width: 150 }} options={deviceOption}  />
          </Form.Item>
          <Form.Item
            label="选择发布平台"
            name="importArticleChannel"
            rules={[{required: true}]}
          >
            <Select  style={{ width: 150 }}>
              <Select.Option value="tt">今日头条</Select.Option>
              <Select.Option value="xhs">小红书</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            label="主题"
            name="articleThemFile"
            rules={[{required: false}]}
          >
            <Upload
               name="file"
               customRequest={handleUpload}
            >
              <Button key="upload" icon={<CloudUploadOutlined />}  type= 'primary'   > 导入</Button>
            </Upload>
          </Form.Item>
        </Form>
      </Modal>

      { /** ********************** 新增【模板】的话的modal   ************************ */}
      <Modal
        title="模板生成主题"
        open={tempplateModalOpen}
        onOk={onTemplateMdalOk}
        onCancel={()=>{setTempplateModalOpen(false)}}
        width='60%'
        style={{height:'500px'}}
        destroyOnClose
      >
        <Form
          form={templateThemform}
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
          autoComplete="off"
        >
          <Form.Item
            label="开头模板"
            name="startTemplate"
            rules={[{required: true}]}
          >

            <Select
              onChange={onStartChange}
              options={startTmpSelectDatas}
            />

          </Form.Item>
          <Form.Item
            label="开头模板"
            name="startTemplateContent"
            rules={[{required: true}]}
          >
            <TextArea rows={5} />
          </Form.Item>
          <Form.Item
            label="保存开头内容为模板"
            name="endTemplateContent"
            rules={[{required: true}]}
          >
            <Button  type="primary" onClick={onSaveStartTmpClick} disabled={saveStartTmp}>保存开头内容为模板</Button>
          </Form.Item>
          <Form.Item
            label="核心话题内容或者观点"
            name="keyWordTemplate"
            rules={[{required: true}]}
          >
            <TextArea rows={5}/>
          </Form.Item>
          <Form.Item
            label="结尾模板"
            name="endTemplate"
            rules={[{required: true}]}
          >
            <Select
              onChange={onEndChange}
              options={endtmpSelectDatas}
            />

          </Form.Item>
          <Form.Item
            label="结尾模板"
            name="endTemplateContent"
            rules={[{required: true}]}
          >
                <TextArea rows={5}/>
          </Form.Item>
          <Form.Item
            label="结尾模板"
            name="endTemplateContent"
            rules={[{required: true}]}
          >
            <Button  type="primary" onClick={onSaveEndTmpClick} disabled={saveEndTmp}>保持结尾内容为模板</Button>
          </Form.Item>
          <Form.Item
            label="文章篇数"
            name="articleNum"
            rules={[{required: true}]}

          >
            <InputNumber  min={1}    style={{ width: 150 }}/>
          </Form.Item>
          <Form.Item
            label="开始发布时间"
            name="articleSendTime"
            tooltip="开始发布的时间"
            rules={[{required: true}]}
          >
            <DatePicker showTime style={{ width: 150}}  renderExtraFooter="" />
          </Form.Item>
          <Form.Item
            label="输入设备编号"
            name="deviceId"
            rules={[{required: true}]}
          >
            <Select style={{ width: 150 }} options={deviceOption}  />
          </Form.Item>
          <Form.Item
            label="选择发布平台"
            name="articleChannel"
            rules={[{required: true}]}
          >
            <Select  style={{ width: 150 }}>
              <Select.Option value="tt">今日头条</Select.Option>
              <Select.Option value="xhs">小红书</Select.Option>
            </Select>
          </Form.Item>

        </Form>
      </Modal>

    </GridContent>

  );
};

export default connect()(Center);
