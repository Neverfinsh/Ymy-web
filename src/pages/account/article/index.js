import React, { useEffect, useRef, useState } from 'react';
import {
  Affix,
  Button,
  Card,
  DatePicker, Drawer,
  Form, Image,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Row,
  Select,
  Space,
  Spin, Switch,
  Table, Upload,
} from 'antd';
import { connect, history } from 'umi';
import { GridContent } from '@ant-design/pro-layout';
import {
  CloudUploadOutlined,
  PlusOutlined,
  ReloadOutlined,
  SearchOutlined,
  TeamOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import useForm from 'antd/lib/form/hooks/useForm';
import moment from 'moment';
import TextArea from 'antd/es/input/TextArea';
import axios from 'axios';
import { adddArticle, delArticle, findArticleImgRelList, findArticleList, updateArticleImpl } from '@/services/article';
import { findDeviceList } from '@/services/device';
import { isEmpty, openNotification } from '@/utils/utils';


const Article = () => {

  const[articleModalForm] = useForm();
  const[shortArticleModalForm] = useForm();
  const[originalArticleModalForm] = useForm();

  const[isModalOpen,setIsModalOpen]=useState(false);
  const[shortModalOpen,setShotModalOpen]=useState(false);
  const[orginalModalOpen,setOrignalModalOpen]=useState(false);
  const [openDrawer,setOpenDrawer]=useState(false);

  const[articleDataSource,setArticleDataSource]=useState([]);
  const[articleImgList,setArticleImgList]=useState([]);
  const operationRef=useRef( {data:''});
  const tableLoadRef=useRef( {flag:false})
  const [tableLoading,setTableLoading]=useState(false)

  const [selectedRowKeys, setSelectedRowKeys] = useState([])
  const [selectedRows, setSelectedRows] = useState([])

  const [selectedDrawRowKeys, setSelectedDrawRowKeys] = useState([])
  const [selectedDrawRows, setSelectedDrawRows] = useState([])

  const[totals,setTotals]=useState(0);
  const[totalsExpired,setTotalsExpired]=useState(0);

  const[optionValue,setOptionValue]=useState();
  // 初始化设备
  const [deviceOption,setDeviceOption]=useState([]);
  const [drawTableData,setDrawTableData]=useState([]);




  const  initDviceOption =()=>{
    const  accountStr=localStorage.getItem("user")
    const  accountObj=JSON.parse(accountStr);
    const  {userAccount} = accountObj

    const  options=[]
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


  useEffect(()=>{
    setDeviceOption(deviceOption)
  },[deviceOption])



  const initList=()=>{
    tableLoadRef.current.flag=true
    const userStr=localStorage.getItem("user");
    const user=JSON.parse(userStr);

    const devicesStr=localStorage.getItem("devices");
    const devices = JSON.parse(devicesStr);

    let  defaultDeviceId=devices[0]
    if(!isEmpty(optionValue)){
         defaultDeviceId=optionValue
    }
    console.log('--iniList---默认' ,defaultDeviceId);
    if(user === undefined){
      history.push('/user/login');
      return ;
    }
    const  param={}
          param.userId=user.userAccount
          param.deviceId=defaultDeviceId
    findArticleList(param).then(res => {
      const list=res.res
      // eslint-disable-next-line no-restricted-syntax,no-plusplus
      setArticleDataSource(list);
      setTotals(list.length)
      // eslint-disable-next-line no-use-before-define
          const len=checkExpired(list)
                 setTotalsExpired(len);
    }).catch((error) => {
      openNotification('error',`查询列表失败！,原因:${error}`)
    });
    tableLoadRef.current.flag=false
  }

  const checkExpired=(list)=>{
    const nowTime=moment()
        const arr=[]
        for(let i=0;i<list.length;i += 1){
            const sendTime=moment(list[i].articleSendTime)
            if(!nowTime.isBefore(sendTime)){
               arr.push(list[i])
            }
        }
    console.log('arr' ,arr.length);
    console.log('list' ,list);
    return arr.length;
  }


  // 【获取当前用户信息】
  useEffect(() => {
    const loginUser =localStorage.getItem("user")
    if(loginUser === null){
       history.push("../../user/login")
    }
  }, []);


  useEffect(() => {
    initList()
    initDviceOption()
  }, []);



  const confirmDel=(record)=>{
    const articleId=record.id
    delArticle(articleId).then(res => {
      if(res.code === 0){
          openNotification('success','删除成功')
          initList();
      }

    }).catch((error) => {
      openNotification('error',`删除失败，原因:${error}`)

    });
  }


  const imgColums=[
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: '图片',
      dataIndex: 'picPath',
      key: 'picPath',
      render:(text)=>{
          return  <Image width={200}  src={text} />
      }
    }
  ]



  const columns=[
    {
      title: '文章序号',
      dataIndex: 'id',
      key: 'id',
      onFilter: (value, record) => record.id.indexOf(value) === 0,
    },
    // {
    //   title: '账号',
    //   dataIndex: 'uid',
    //   key: 'userId',
    // },
    {
      title: '设备编号',
      dataIndex: 'deviceId',
      key: 'deviceId',
    },
    // {
    //   title: '篇数',
    //   dataIndex: 'articleNum',
    //   key: 'articleNum',
    // },
    // {
    //   title: '主题名',
    //   dataIndex: 'articleThem',
    //   key: 'articleThem',
    //   width: '20%',
    // },
    {
      title: '标题',
      dataIndex: 'articleTitle',
      key: 'articleTitle',
      // ellipsis:true,
      render: (text) => {
        return (text===""  || text===null )?'暂无标题':<a style={{fontWeight:'bold'}}>{text}</a>
      }
    },

    {
      title: '文章内容',
      dataIndex: 'articleContent',
      key: 'articleContent',
      ellipsis:true,
      width: '25%',
      onFilter: (value, record) => record.articleContent.indexOf(value) === 0,
      render: (text) => {
        return <a style={{fontWeight:'bold'}}>{text}</a>
      }
    },
    {
      title: '图片',
      dataIndex: 'imgList',
      key: 'imgList',
      render:(values)=>{
        return (
          <div style={{width:100}}>
            <Space direction="horizontal">
              { values !==null && values.map((imageUrl, index) => (
                <Image key={index} src={imageUrl} alt={`Image ${index}`} />
              ))}
            </Space>
          </div>
        )
      }
    },
    // {
    //   title: '状态',
    //   dataIndex: 'status',
    //   key: 'status',
    //   render: (text) => `${text === 0 ? '未发布' : '已发布'}`,
    // },
    {
      title: '发布时间',
      dataIndex: 'articleSendTime',
      key: 'articleSendTime',
      sorter: (a, b) => new Date(a.articleSendTime) - new Date(b.articleSendTime),
      render: (text) => {
            const sendTime=moment(text)
            const nowTime=moment()
            if(nowTime.isBefore(sendTime)){ // now 在 发送之之前。有问题
               return <a  style={{ color:'#151514'}}>{text}</a>
            }
              return  <Space> <WarningOutlined />  <a  style={{ color:'#F1D40D'}}>{text}</a> </Space>
      },
      defaultSortOrder : ['descend'],
    },
    // {
    //   title: '发布平台',
    //   dataIndex: 'articleChannel',
    //   key: 'articleChannel',
    //   render: (text) =>{
    //     return text === undefined ? '今日头条' : '其他平台'
    //   },
    // },
    // {
    //   title: '创建时间',
    //   dataIndex: 'createTime',
    //   key: 'createTime',
    //   sorter: (a, b) => new Date(a.createTime) - new Date(b.createTime),
    // },
    {
      title: '更新时间',
      dataIndex: 'updateTime',
      key: 'updateTime',
      sorter: (a, b) => new Date(a.updateTime) - new Date(b.updateTime),
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
          {/* <a  onClick={()=>{detailArticle(record)}}>详情</a> */}
          {/* eslint-disable-next-line no-use-before-define */}
          <a  onClick={()=>updateArticle(record)}>编辑</a>
          <Popconfirm
            title="是否删除文章"
            onConfirm={()=>confirmDel(record)}
            onCancel={()=>{}}
            okText="Yes"
            cancelText="No"
          >
             <a >删除</a>
          </Popconfirm>

          {/* eslint-disable-next-line no-use-before-define */}
          <a  onClick={()=>publishArticle(record)}>立即发布</a>
        </Space>

      ],
    },
  ];


  const bindImgDatasPic=()=>{
    const param= articleModalForm.getFieldsValue();
    const articleId=param.id
    let  records=[]
         records = selectedDrawRows
    for (const item of records) {
             const relParam={}
             relParam.articleId=articleId
             relParam.imageId=item.id
             relParam.imagePath=item.picPath
            axios.post('http://101.201.33.155:8099/image/web/addRelImg', relParam, {
         //   axios.post('http://localhost:8099/image/web/addRelImg', relParam, {
              headers: {'Content-Type': 'application/json'},
            }).then((response) => {
              console.log('response' ,response);
              setOpenDrawer(false)
              setSelectedDrawRowKeys([])
              setSelectedDrawRows([])
            })
    }
    //
    // eslint-disable-next-line no-use-before-define
    refreshImg()
  }

  const addThemModalClick=()=>{
         operationRef.current.data="新增"
         setIsModalOpen(true)
         articleModalForm.setFieldsValue({
          "articleSendTime":moment().add(10,'minutes'),
          "articleNum":1
    })
  }


  const addShortModalClick=()=>{
       setShotModalOpen(true)
       shortArticleModalForm.setFieldsValue({
         "articleSendTime":moment().add(10,'minutes'),
         "articleNum":1
       })
  }



  const addOriginalModalClick=()=>{
    setOrignalModalOpen(true)
    originalArticleModalForm.setFieldsValue({
      "articleSendTime":moment().add(10,'minutes'),
      "articleNum":1
    })
  }


  const  detailArticle=(record)=>{
            operationRef.current.data="详情"
           setIsModalOpen(true)
           articleModalForm.setFieldsValue({
             'articleThem': record.articleThem,
             'articleTitle': record.articleTitle,
             'articleContent': record.articleContent,
             'articleNum':  Number(record.articleNum),
             'articleSendTime': moment(record.articleSendTime),
             'userId': record.uid,
             'articleChannel': record.articleChannel,
        });
  }



  const handleChange = ({ fileList: newFileList }) => {
        setArticleImgList(newFileList)
  };

  const onRemoveImgRel=(file)=>{
    axios.delete(`http://localhost:8099/image/web/delRelImg/${file.uid}`, {
      headers: {'Content-Type': 'application/json'},
    }).then((response) => {
      console.log(response)
    })
  }

  const  updateArticle=(record)=>{

      const  articleId=record.id
      findArticleImgRelList(articleId).then(res => {
        const result=res.res
        const fileListArr=[]
        for(let i=0;i<result.length;i+=1){
          const fileItem={}
                fileItem.uid=result[i].id
                fileItem.status= 'done'
                fileItem.name=result[i].imagePath
                fileItem.url=result[i].imagePath
                fileListArr.push(fileItem)
        }
        setArticleImgList(fileListArr);
      }).catch((error) => {
        openNotification('error',`查询图片ID列表失败！,原因:${error}`)
      });
    //
    operationRef.current.data="编辑"
    setIsModalOpen(true)
    articleModalForm.setFieldsValue({
      'articleThem': record.articleThem,
      'articleTitle': record.articleTitle,
      'articleContent': record.articleContent,
      'articleNum':  Number(record.articleNum),
      'articleSendTime': moment(record.articleSendTime),
      'userId': record.uid,
      'articleChannel': record.articleChannel,
      'id':record.id ,
      'deviceId':record.deviceId
    });
  }



  const  publishArticle=(record)=>{
    //  【更新状态】 和  【修改发送时间为今天的时间】
    const param= record;
          param.articleSendTime=moment().add(1,'minutes').format('YYYY-MM-DD HH:mm:ss')

    Modal.confirm({
      title:   '发布文章',
      content: '是否立即发布文章？',
      onOk() {
        updateArticleImpl(param).then(res => {
          if(res.code === 0){
            openNotification('success','设置立即发布成功,【1】分钟后发布')
          }
           initList();
          setSelectedRows([])
          setSelectedRowKeys([])

        }).catch((error) => {
            openNotification('error',`设置立即发布失败,失败原因:${error}`)
        });
      },
      onCancel() {
           openNotification("success","取消设置立即发布")
      },
    });
  }


  const onModalOk=()=>{
      setIsModalOpen(false)
      const param= articleModalForm.getFieldsValue();

      param.status=0
      param.createTime=moment(param.articleSendTime).format('YYYY-MM-DD HH:mm:ss')
      param.articleSendTime=moment(param.articleSendTime).format('YYYY-MM-DD HH:mm:ss')
      param.updateTime=moment().format('YYYY-MM-DD HH:mm:ss')
      const  accountStr=localStorage.getItem("user")
      const  accountObj=JSON.parse(accountStr);
      const  {userAccount} = accountObj
      param.uid=userAccount

      // 【  新增方法 】
    console.log('新增' ,operationRef.current.data);
        if(operationRef.current.data ==="新增"){
          adddArticle(param).then(res => {
          if(res.code === 0){
            openNotification('success','新增一篇文章成功')
          }
          initList()
        }).catch((error) => {
            openNotification('error',`新增一篇文章失败,失败原因:${error}`)
        });
      }
      // 【  编辑方法 】
        if(operationRef.current.data ==="编辑"){
          updateArticleImpl(param).then(res => {
              if(res.code === 0){
                openNotification('success','编辑文章成功')
              }
              initList()
            }).catch((error) => {
              openNotification('error',`编辑文章失败,失败原因:${error}`)
            });
          setTableLoading(false)
      }
       // eslint-disable-next-line no-use-before-define
        refreshArtiList()
  }


  const onShortModalOk=()=>{

    const param= articleModalForm.getFieldsValue();

    param.status=0
    param.createTime=moment(param.articleSendTime).format('YYYY-MM-DD HH:mm:ss')
    param.articleSendTime=moment(param.articleSendTime).format('YYYY-MM-DD HH:mm:ss')
    param.updateTime=moment().format('YYYY-MM-DD HH:mm:ss')
    const  accountStr=localStorage.getItem("user")
    const  accountObj=JSON.parse(accountStr);
    const  {userAccount} = accountObj
    param.uid=userAccount

    // 【  新增方法 】
    console.log('新增' ,operationRef.current.data);
    if(operationRef.current.data ==="新增"){
      adddArticle(param).then(res => {
        if(res.code === 0){
          openNotification('success','新增一篇文章成功')
          setOrignalModalOpen(false)
        }
        initList()
      }).catch((error) => {
        openNotification('error',`新增一篇文章失败,失败原因:${error}`)
      });
    }
    // eslint-disable-next-line no-use-before-define
    refreshArtiList()
  }


  const onOrignalModalOk=()=>{

    const param= originalArticleModalForm.getFieldsValue();

    param.status=0
    param.createTime=moment(param.articleSendTime).format('YYYY-MM-DD HH:mm:ss')
    param.articleSendTime=moment(param.articleSendTime).format('YYYY-MM-DD HH:mm:ss')
    param.updateTime=moment().format('YYYY-MM-DD HH:mm:ss')
    const  accountStr=localStorage.getItem("user")
    const  accountObj=JSON.parse(accountStr);
    const  {userAccount} = accountObj
    param.uid=userAccount

      adddArticle(param).then(res => {
        if(res.code === 0){
          openNotification('success','新增一篇文章成功')
        }
      }).catch((error) => {
        openNotification('error',`新增一篇文章失败,失败原因:${error}`)
      });
    setOrignalModalOpen(false)
    // eslint-disable-next-line no-use-before-define
    refreshArtiList()
  }

  // 【 刷新】
  const refreshArtiList=()=>{
         setTableLoading(true)
         initList()
         setTimeout(()=>{
           setTableLoading(false)
         },2000)
  }

  const shuffleArray=(array)=> {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      // eslint-disable-next-line no-param-reassign
      [array[i], array[j]] = [array[j], array[i]];
    }
    return  array;
  }

  // 【 批量发布】
  const onPublicshBath=()=>{
    let count=1
    // eslint-disable-next-line no-restricted-syntax
    // todo：  需要测试
    const newOrderselectedRows=shuffleArray(selectedRows)
    // eslint-disable-next-line no-restricted-syntax
  //  const  newData=selectedRows[0].articleSendTime
    const  newData= moment()
    console.log('--newData--' ,moment(newData));
    for (const param of newOrderselectedRows) {
          const now1 = newData
         // 生成1-20内的随机整数
          const randomNumber = Math.floor(Math.random() * 20) + 1;
          console.log(" 批量发布:生成1-20内的随机整数:",randomNumber);
          const futureTime = now1.add(10+Number(count), 'minutes');
          const newArticleSendTime=futureTime.format('YYYY-MM-DD HH:mm:ss')
          console.log('articleSendTime' ,newArticleSendTime);
          param.articleSendTime=newArticleSendTime
          param.updateTime=moment().format('YYYY-MM-DD HH:mm:ss')

          updateArticleImpl(param).then(res => {
            if(res.code === 0){
               openNotification('success',`修改文章标题 【${param.id}】发布时间成功`)
            }
            initList()
            setSelectedRows([])
            setSelectedRowKeys([])
          }).catch((error) => {
              openNotification('error',`修改文章标题 【 ${param.id}】 发布时间失败,失败原因:${error}`)
          });
      // eslint-disable-next-line no-plusplus
         count++;
    }
  }


  // eslint-disable-next-line no-shadow
  const onTableSelectChange = (selectedRowKeys, selectedRows) => {
    setSelectedRowKeys(selectedRowKeys)
    setSelectedRows(selectedRows)
  }

  const onDrawTableSelectChange = (selectedDrawRowKeys, selectedDrawRows) => {
        setSelectedDrawRowKeys(selectedDrawRowKeys)
        setSelectedDrawRows(selectedDrawRows)
  }



  const onOptionChange=(value)=>{
      setOptionValue(value);
  }

  useEffect(()=>{
    setOptionValue(optionValue)
  },[optionValue])

const onSearch=()=>{
    setTableLoading(true)
    const userStr=localStorage.getItem("user");
    const user=JSON.parse(userStr);
    const  param={}
    param.userId=user.userAccount
    param.deviceId= optionValue
    findArticleList(param).then(res => {
      const list=res.res
      setArticleDataSource(list);
      setTotals(list.length)
    }).catch((error) => {
      openNotification('error',`查询列表失败！,原因:${error}`)
    });
   setTimeout(()=>{
    setTableLoading(false)
  },2000)
}

const onInputChange=(e)=>{
    const inputContent=e.target.value
    const newDataSource=[]
    for (let i = 0; i < articleDataSource.length;  i += 1) {
      if(articleDataSource[i].id.toString().indexOf(inputContent)>-1){
         newDataSource.push(articleDataSource[i])
      }
      if(articleDataSource[i].articleThem.toString().indexOf(inputContent)>-1){
         newDataSource.push(articleDataSource[i])
      }
    }
   setArticleDataSource(newDataSource)
}

  const upLoadImgRel = (options) => {
    // 上传图片风格
    const {file, onSuccess, onError} = options;
    const param= articleModalForm.getFieldsValue();
    const {deviceId,id} = param

    const  accountStr=localStorage.getItem("user")
    const  accountObj=JSON.parse(accountStr);
    const  {userAccount} = accountObj
    const accountId=userAccount


    const formData = new FormData();
    formData.append('files', file);
    formData.append('deviceId',  deviceId);
    formData.append('accountId', accountId);
    formData.append('groupCodeId', deviceId);
    formData.append('articleId', id);

    axios.post('http://101.201.33.155:8099/image/web/uploadImgRel', formData, {
      headers: {'Content-Type': 'multipart/form-data'},
    }).then((response) => {
      console.log(response)
      onSuccess('上传成功');
    })
      .catch((error) => {
        console.error('文件上传失败', error);
        onError('上传失败');
      });
  };



  // 【 执行上传 】
  const shortArticleHandleUpload = (options) => {
    const upLoadForm= shortArticleModalForm.getFieldsValue();
    //  todo 验证
    const localUser=JSON.parse(localStorage.getItem("user"));
    //  判断先填写form的选项
    const {file, onSuccess, onError} = options;
    const formData = new FormData();
    formData.append('file',  file);
    formData.append('uid',  localUser.userAccount);
    formData.append('deviceId',  upLoadForm.deviceId);
    formData.append('articleSendTime',  moment(upLoadForm.articleSendTime).format('YYYY-MM-DD HH:mm:ss'));
    formData.append('articleNum',  upLoadForm.articleNum);
    formData.append('channel',  upLoadForm.articleChannel);
    //
     axios.post('http://101.201.33.155:8099/article/web/import/shortArticle/file', formData, {
    // axios.post('http://localhost:8099/article/web/import/shortArticle/file', formData, {
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

  // 【 执行上传 】
  const originalArticleHandleUpload = (options) => {
    const upLoadForm= originalArticleModalForm.getFieldsValue();
    //  todo 验证
    const localUser=JSON.parse(localStorage.getItem("user"));
    //  判断先填写form的选项
    const {file, onSuccess, onError} = options;
    const formData = new FormData();
    formData.append('file',  file);
    formData.append('uid',  localUser.userAccount);
    formData.append('deviceId',  upLoadForm.deviceId);
    formData.append('articleSendTime',  moment(upLoadForm.articleSendTime).format('YYYY-MM-DD HH:mm:ss'));
    formData.append('articleNum',  upLoadForm.articleNum);
    formData.append('channel',  upLoadForm.articleChannel);
    //
     axios.post('http://101.201.33.155:8099/article/web/import/originalArticle/file', formData, {
    // axios.post('http://localhost:8099/article/web/import/originalArticle/file', formData, {
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


  // refresh
  const refreshImg = () => {
    const formParam= articleModalForm.getFieldsValue()
    const  articleId=formParam.id
    findArticleImgRelList(articleId).then(res => {
      const result=res.res
      const fileListArr=[]
      for(let i=0;i<result.length;i+=1){
        const fileItem={}
        fileItem.uid=result[i].id
        fileItem.status= 'done'
        fileItem.name=result[i].imagePath
        fileItem.url=result[i].imagePath
        fileListArr.push(fileItem)
      }
      setArticleImgList(fileListArr);
    }).catch((error) => {
      openNotification('error',`查询图片ID列表失败！,原因:${error}`)
    });
  };

  //  打开图片
  const imgDataBase = () => {
    const formParam= articleModalForm.getFieldsValue()
    const {deviceId} = formParam
    if (deviceId === null) {
        openNotification('warn', `请先选择具体的设备`, 5);
        return;
    }
    setOpenDrawer(true);
    const accountStr = localStorage.getItem('user');
    const accountObj = JSON.parse(accountStr);
    const { userAccount } = accountObj;
    const param = {};
    param.deviceId = deviceId;
    param.accountId = userAccount;
    param.groupCodeId = deviceId;
    axios.post('http://101.201.33.155:8099/image/web/imageList', param, { headers: { 'Content-Type': 'application/json' } })
      .then((response) => {
        const { data: { res } } = response;
        console.log('####  res  ######' ,res);
        const fileListArr = [];
        for (let i = 0; i < res.length; i += 1) {
          const fileItem = {};
                fileItem.id = res[i].id;
                fileItem.picPath = res[i].absolutelyPath;
                fileListArr.push(fileItem);
        }
        setDrawTableData(fileListArr);
      })
      .catch((error) => {
        console.error('文件上传失败', error);
      });
  };


  return (
    <GridContent>
      <Row gutter={24}>
          <Card bordered style={{ marginBottom: 24 , width:'100%',height: '80%' }} >
            <Space  style={{ marginBottom: 16}}>
              {/* eslint-disable-next-line react/jsx-no-undef */}
              <Button    type= 'primary'  icon={<PlusOutlined />} onClick={addThemModalClick}>新增</Button>
              {/* <Button    type= 'primary'  icon={<PlusOutlined />} onClick={addShortModalClick}>批量导入文章</Button> */}
              <Button    type= 'primary'  icon={<PlusOutlined />} onClick={addShortModalClick}>批量导入短文/换行</Button>
              <Button    type= 'primary'  icon={<PlusOutlined />} onClick={addOriginalModalClick}>批量导入原文</Button>
              <Button    type= 'primary'  icon={<TeamOutlined />} onClick={onPublicshBath} >批量发布</Button>
              {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
              <label>设备编号:</label>
              <Select
                style={{ width: 150 }}
                options={deviceOption}
                onChange={onOptionChange}
              />
              <Input placeholder= "输入搜索的内容、序号、主题..."  onChange={onInputChange} style={{width:250}} />
              <Button    type= 'primary'  icon={<SearchOutlined/>} onClick={onSearch} >查询</Button>
              <Button   type= 'primary'   icon={<ReloadOutlined />}  onClick={refreshArtiList}>刷新</Button>
              <a>待发布总计: {totals} 篇  </a>
              <a style={{ color:'#F1D40D'}} >过期: {totalsExpired} 篇 </a>

            </Space>
            <Spin spinning={tableLoading}>
              <Table
                rowKey="id"
                columns={columns}
                dataSource={articleDataSource}
                pagination={{
                  total: totals,
                  showTotal: total => `共${total}条`,
                  pageSizeOptions: [5,10,20,40],
                  showSizeChanger: true,
                }}
                rowSelection={{
                  selectedRowKeys,
                  onChange: onTableSelectChange
                }}
                scroll={{ x: 1500 }}
              />
            </Spin>
          </Card>
      </Row>
      { /** **************************************** 新增文章modal ************************************* * */}
      <Modal
        title={`${operationRef.current.data}文章内容`}
        open={isModalOpen}
        onOk={onModalOk}
        onCancel={()=>{  setIsModalOpen(false)}}
        width='50%'
        style={{height:'500px'}}
        destroyOnClose
        zIndex={1001}
      >
        <Form
          form={articleModalForm}
          name="basic"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
          autoComplete="off"
        >
          <Form.Item
            label="主题"
            name="articleThem"
            rules={[{required: true}]}
          >
            <TextArea   rows={4}  showCount   readOnly={operationRef.current.data === "详情"} />
          </Form.Item>
          <Form.Item
            label="是否生成标题"
            name="articleTitleStatus"
            rules={[{required: true}]}
          >
            <Switch defaultChecked />
          </Form.Item>
          <Form.Item
            label="标题"
            name="articleTitle"
            rules={[{required: true}]}
          >
            <TextArea   rows={4}  showCount   maxLength={20}   />
          </Form.Item>
          <Form.Item
            label="内容"
            name="articleContent"
            rules={[{required: true}]}
          >
            <TextArea rows={15}   showCount    maxLength={800} readOnly={operationRef.current.data === "详情"} />
          </Form.Item>

          <Form.Item
            label="文章篇数"
            name="articleNum"
            rules={[{required: true}]}
          >
            <InputNumber   min={1} readOnly={operationRef.current.data === "详情"} />
          </Form.Item>
          <Form.Item
            label="开始发布时间"
            name="articleSendTime"
            tooltip="开始发布的时间"
            rules={[{required: true}]}

          >
              <DatePicker showTime disabled ={operationRef.current.data === "详情"} />
          </Form.Item>
          <Form.Item
            label="输入设备编号"
            name="deviceId"
            rules={[{required: true}]}

          >
            <Select
              style={{ width: 150 }}
              options={deviceOption}
              disabled={operationRef.current.data === "详情"}
            />
            {/* <Input  readOnly={operationRef.current.data === "详情"} /> */}
          </Form.Item>
          {/* <Form.Item */}
          {/*  label="选择发布平台" */}
          {/*  name="articleChannel" */}
          {/*  rules={[{required: true}]} */}
          {/* > */}
          {/*  <Select> */}
          {/*    <Select.Option value="demo">今日头条</Select.Option> */}
          {/*    <Select.Option value="demo">小红书</Select.Option> */}
          {/*  </Select> */}
          {/* </Form.Item> */}
          <Form.Item
            label="文章配图"
            name="articleImg"
            rules={[{required: true}]}
            hidden={operationRef.current.data==='新增'}
          >
            <Space direction="horizontal">
              <Upload
                customRequest={upLoadImgRel}
                listType="picture-card"
                fileList={articleImgList}
                multiple
                onRemove={onRemoveImgRel}
                onChange={handleChange}
              >
                详情图片
              </Upload>
              <Button type="primary" style={{paddingBottom:'0'}}  onClick={imgDataBase}> 图库选择</Button>
              <Button type="primary" style={{paddingBottom:'0'}}  onClick={refreshImg}> 刷新</Button>
            </Space>
          </Form.Item>
          <Form.Item
            label="主键Id"
            name="id"
            rules={[{required: true}]}
            style={{display:'none'}}
          >
            <Input  />
          </Form.Item>
          <Form.Item
            label="主键Id"
            name="uid"
            rules={[{required: true}]}
            style={{display:'none'}}
          >
            <Input  />
          </Form.Item>
        </Form>
      </Modal>
      { /** **************************************** 新增 说说 ************************************* * */}
      <Modal
        title="批量新增短文,并且在标点符号进行换行"
        open={shortModalOpen}
        onOk={onShortModalOk}
        onCancel={()=>{  setShotModalOpen(false)}}
        width='60%'
        style={{height:'500px'}}
        destroyOnClose
      >
        <Form
          form={shortArticleModalForm }
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
          autoComplete="off"
        >
          <Form.Item
            label="文章篇数"
            name="articleNum"
            rules={[{required: true}]}
          >
            <InputNumber   min={1} readOnly={operationRef.current.data === "详情"}   style={{ width: 150 }}  />
          </Form.Item>
          <Form.Item
            label="开始发布时间"
            name="articleSendTime"
            tooltip="开始发布的时间,每5分钟"
            rules={[{required: true}]}

          >
            <DatePicker showTime disabled ={operationRef.current.data === "详情"}   />
          </Form.Item>
          <Form.Item
            label="输入设备编号"
            name="deviceId"
            rules={[{required: true}]}
          >
            <Select
              style={{ width: 150 }}
              options={deviceOption}
              disabled={operationRef.current.data === "详情"}
            />
          </Form.Item>
          <Form.Item
            label="批量导入短文"
            name="articleThemFile"
            rules={[{required: false}]}
          >
            <Upload
              name="file"
              customRequest={shortArticleHandleUpload}
            >
              <Button key="upload" icon={<CloudUploadOutlined />}  type= 'primary'   > 导入</Button>
            </Upload>
          </Form.Item>
          <Form.Item
            label="主键Id"
            name="id"
            rules={[{required: true}]}
            style={{display:'none'}}
          >
            <Input  />
          </Form.Item>
          <Form.Item
            label="主键Id"
            name="uid"
            rules={[{required: true}]}
            style={{display:'none'}}
          >
            <Input  />
          </Form.Item>
        </Form>
      </Modal>


      { /** **************************************** 新增 【原文】 ************************************* * */}
      <Modal
        title="批量新增原文"
        open={orginalModalOpen}
        onOk={onOrignalModalOk}
        onCancel={()=>{  setOrignalModalOpen(false)}}
        width='60%'
        style={{height:'500px'}}
        destroyOnClose
      >
        <Form
          form={originalArticleModalForm }
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
          autoComplete="off"
        >
          <Form.Item
            label="文章篇数"
            name="articleNum"
            rules={[{required: true}]}
          >
            <InputNumber   min={1} readOnly={operationRef.current.data === "详情"}   style={{ width: 150 }}  />
          </Form.Item>
          <Form.Item
            label="开始发布时间"
            name="articleSendTime"
            tooltip="开始发布的时间,每5分钟"
            rules={[{required: true}]}

          >
            <DatePicker showTime disabled ={operationRef.current.data === "详情"}   />
          </Form.Item>
          <Form.Item
            label="输入设备编号"
            name="deviceId"
            rules={[{required: true}]}
          >
            <Select
              style={{ width: 150 }}
              options={deviceOption}
              disabled={operationRef.current.data === "详情"}
            />
          </Form.Item>
          <Form.Item
            label="批量导入短文"
            name="articleThemFile"
            rules={[{required: false}]}
          >
            <Upload
              name="file"
              customRequest={originalArticleHandleUpload}
            >
              <Button key="upload" icon={<CloudUploadOutlined />}  type= 'primary'   > 导入</Button>
            </Upload>
          </Form.Item>
          <Form.Item
            label="主键Id"
            name="id"
            rules={[{required: true}]}
            style={{display:'none'}}
          >
            <Input  />
          </Form.Item>
          <Form.Item
            label="主键Id"
            name="uid"
            rules={[{required: true}]}
            style={{display:'none'}}
          >
            <Input  />
          </Form.Item>
        </Form>
      </Modal>
      { /** **************************************** 新增 【抽屉】 ************************************* * */}
      <Drawer

         width={400}
         title="图库列表展示"
         open={openDrawer}
         onClose={()=>{setOpenDrawer(false)}}
         getContainer={false}
         zIndex={1002}
      >
        <Space style={{marginBottom:50}}>
          <Affix offsetTop={100}>
            <Button type= 'primary' icon={<PlusOutlined />} onClick={bindImgDatasPic}>确认</Button>
          </Affix>
        </Space>
        <Table
          rowKey="id"
          columns={imgColums}
          dataSource={drawTableData}
          rowSelection={{
            selectedDrawRowKeys,
            onChange: onDrawTableSelectChange
          }}
          pagination={false}
        />
      </Drawer>

    </GridContent>

  );
};

export default connect(() => ({
}))(Article);
