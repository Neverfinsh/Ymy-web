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
  CloudUploadOutlined, PlusCircleOutlined,
  PlusOutlined, PlusSquareOutlined, PlusSquareTwoTone,
  ReloadOutlined,
  SearchOutlined,
  TeamOutlined, ThunderboltOutlined,
  WarningOutlined, WindowsOutlined,
} from '@ant-design/icons';
import useForm from 'antd/lib/form/hooks/useForm';
import moment, { now } from 'moment';
import TextArea from 'antd/es/input/TextArea';
import axios from 'axios';
import { adddArticle, delArticle, findArticleImgRelList, findArticleList, updateArticleImpl } from '@/services/article';
import { findDeviceList } from '@/services/device';
import { isEmpty, openNotification } from '@/utils/utils';


const Article = () => {

  const[articleModalForm] = useForm();
  const[shortArticleModalForm] = useForm();
  const[originalArticleModalForm] = useForm();
  const[bashPbForm] = useForm();
  const[autoForm] = useForm();

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

  // 批量发布选择的日期
  const [dataSelect,setDataSelect]=useState(moment().format("YYYY-MM-DD"));

  const[bathPublishModalOpen,setBathPublishModalOpen]=useState(false);
  const[autoPublishModalOpen,setAutoPublishModalOpen]=useState(false);

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
          <a  onClick={()=>publishArticle(record)}>立即发布</a>
        </Space>

      ],
    },
  ];


  useEffect(()=>{setSelectedDrawRowKeys(selectedDrawRowKeys)},[selectedDrawRowKeys])

  useEffect(()=>{setSelectedDrawRows(selectedDrawRows)},[selectedDrawRows])


  // 【获取当前用户信息】
  useEffect(() => {
    const loginUser =localStorage.getItem("user")
    if(loginUser === null){
      history.push("../../user/login")
    }
  }, []);


  useEffect(()=>{
    setDeviceOption(deviceOption)
  },[deviceOption])



  useEffect(() => {
    initList()
    initDviceOption()
  }, []);


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
    if(user === undefined){
      history.push('/user/login');
      return ;
    }
    const  param={}
          param.userId=user.userAccount
          param.deviceId=defaultDeviceId

    const seletedDataArr=[]
    findArticleList(param).then(res => {
      const list=res.res
      const data1 = moment(dataSelect,'YYYY-MM-DD');
      for(const item of list){
        const  {articleSendTime}=item
        const  data2= moment(articleSendTime,'YYYY-MM-DD');
        if(data2.isSame(data1)){
           seletedDataArr.push(item)
        }
      }
      setArticleDataSource(seletedDataArr);
      setTotals(seletedDataArr.length)
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
    return arr.length;
  }


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
              setSelectedDrawRowKeys([])
              setSelectedDrawRows([])

              setOpenDrawer(false)
            })
    }
    setSelectedDrawRowKeys([])
    setSelectedDrawRows([])
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



  const handleChange = ({ fileList: newFileList }) => {
        setArticleImgList(newFileList)
  };


  const onRemoveImgRel=(file)=>{
    axios.delete(`http://101.201.33.155:8099/image/web/delRelImg/${file.uid}`, {
   // axios.delete(`http://localhost:8099/image/web/delRelImg/${file.uid}`, {
      headers: {'Content-Type': 'application/json'},
    }).then((response) => {
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
        //  重置表格
         articleModalForm.resetFields()
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
   setShotModalOpen(false)
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
           [array[i], array[j]] = [array[j], array[i]];
    }
    return  array;
  }

  const autoModalOk = () => {

    const params = autoForm.getFieldsValue();
    const { autoNum, autoInterval,autoDate } = params;
    console.log('--autoModalOk--' ,params);
    let count = 1;
    const newOrderselectedRows = shuffleArray(selectedRows);
    // 智能发布
    console.log('--newOrderselectedRows--' ,newOrderselectedRows);
    const increment=Number(autoNum);
    for(let i=0 ;i<newOrderselectedRows.length;i++){

      let param={}
      let futureTime;
      if (  i !== 0  &&  i % increment === 0) {
           console.log('-i--' ,i);
           futureTime = moment(autoDate).add(1, 'days');
      }else {
        console.log('-i--:' ,i);
          futureTime = moment(autoDate).add(Number(autoInterval) * Number(count), 'minutes');
      }
      const newArticleSendTime = futureTime.format('YYYY-MM-DD HH:mm:ss');
      console.log('newArticleSendTime--' ,newArticleSendTime);
      param.articleSendTime = newArticleSendTime;
      param.updateTime = newArticleSendTime;
      updateArticleImpl(param).then(res => {
        if (res.code === 0) {
          openNotification('success', `修改文章标题 【${newOrderselectedRows[i].id}】发布时间成功`);
        }
        initList();
        setSelectedRows([]);
        setSelectedRowKeys([]);
      }).catch((error) => {
        openNotification('error', `修改文章标题 【 ${newOrderselectedRows[i].id}】 发布时间失败,失败原因:${error}`);
      });
      count++;

    }
    setAutoPublishModalOpen(false)

    // for (const param of newOrderselectedRows) {
    //   const futureTime = moment(autoDate).add(Number(autoInterval) * Number(count), 'minutes');
    //   const newArticleSendTime = futureTime.format('YYYY-MM-DD HH:mm:ss');
    //   param.articleSendTime = newArticleSendTime;
    //   param.updateTime = newArticleSendTime;
    //
    //   updateArticleImpl(param).then(res => {
    //     if (res.code === 0) {
    //       openNotification('success', `修改文章标题 【${param.id}】发布时间成功`);
    //     }
    //     initList();
    //     setSelectedRows([]);
    //     setSelectedRowKeys([]);
    //
    //   }).catch((error) => {
    //     openNotification('error', `修改文章标题 【 ${param.id}】 发布时间失败,失败原因:${error}`);
    //   });
    //   count++;
    // }
    // setBathPublishModalOpen(false)
  };

  const bathModalOk = () => {

    const params = bashPbForm.getFieldsValue();
    const { bathPbDate, bathPbInterval } = params;
    let count = 1;
    const newOrderselectedRows = shuffleArray(selectedRows);
    // 智能发布
    for (const param of newOrderselectedRows) {
        const futureTime = moment(bathPbDate).add(Number(bathPbInterval) * Number(count), 'minutes');
        const newArticleSendTime = futureTime.format('YYYY-MM-DD HH:mm:ss');
        param.articleSendTime = newArticleSendTime;
        param.updateTime = newArticleSendTime;

      updateArticleImpl(param).then(res => {
        if (res.code === 0) {
            openNotification('success', `修改文章标题 【${param.id}】发布时间成功`);
        }
        initList();
        setSelectedRows([]);
        setSelectedRowKeys([]);

      }).catch((error) => {
           openNotification('error', `修改文章标题 【 ${param.id}】 发布时间失败,失败原因:${error}`);
      });
      count++;
    }
    setBathPublishModalOpen(false)
  };


  // 【 智能批量发布】
  const onPublicAutoBath=()=>{

    console.log('---optionValue--' ,optionValue);
    if(optionValue=== undefined ){
      openNotification('warn',`请先选择设备编号`)
      document.getElementById('deviceId').focus();
      return;
    }

    if(dataSelect === ""){
      openNotification('warn',`请选择批量发布的日期,然后点击查询`)
      document.getElementById('dataPickerId').focus();
      return;
    }
    if(articleDataSource.length === 0){
      openNotification('warn',`当前日期没有需要批量发布的文章`)
      return;
    }
    if(selectedRows.length === 0){
      openNotification('warn',`请先勾选批量发布的文章,然后点击查询`)
      return;
    }

    autoForm.setFieldsValue({
      "autoInterval": 10,
      "autoDate": moment().add(5,'minutes')

    })
    setAutoPublishModalOpen(true)
  }

  // 【 批量发布】
  const onPublicshBath=()=>{

    if(dataSelect === ""){
      openNotification('warn',`请选择批量发布的日期,然后点击查询`)
      document.getElementById('dataPickerId').focus();
      return;
    }
    if(articleDataSource.length === 0){
      openNotification('warn',`当前日期没有需要批量发布的文章`)
      return;
    }
    if(selectedRows.length === 0){
      openNotification('warn',`请先勾选批量发布的文章,然后点击查询`)
      return;
    }

    bashPbForm.setFieldsValue({
      "bathPbInterval": 10,
      "bathPbDate": moment().add(5,'minutes')

    })
    setBathPublishModalOpen(true)
  }


  const onTableSelectChange = (selectedRowKeys, selectedRows) => {
    setSelectedRowKeys(selectedRowKeys)
    setSelectedRows(selectedRows)
  }

  const onDrawTableSelectChange = (selectedDrawRowKeys, selectedDrawRows) => {
    // console.log('selectedDrawRowKeys' ,selectedDrawRowKeys);
    // console.log('selectedDrawRows' ,selectedDrawRows);
        setSelectedDrawRowKeys(selectedDrawRowKeys)
        setSelectedDrawRows(selectedDrawRows)
  }


  const onOptionChange=(value)=>{
      setOptionValue(value);
  }

  useEffect(()=>{
    setOptionValue(optionValue)
  },[optionValue])


  const onSearchAll=()=>{
    console.log('---optionValue--' ,optionValue);
    if(optionValue=== undefined ){
      openNotification('warn',`请先选择设备编号`)
      document.getElementById('deviceId').focus();
      return;
    }

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



const onSearch=()=>{

    setTableLoading(true)
    const userStr=localStorage.getItem("user");
    const user=JSON.parse(userStr);
    const  param={}
    param.userId=user.userAccount
    param.deviceId= optionValue
    const seletedDataArr=[]
      findArticleList(param).then(res => {
      const list=res.res
      const data1 = moment(dataSelect,'YYYY-MM-DD');
      for(const item of list){
          const  {articleSendTime}=item
          const  data2= moment(articleSendTime,'YYYY-MM-DD');
          if(data2.isSame(data1)){
              seletedDataArr.push(item)
          }
       }
      setArticleDataSource(seletedDataArr);
      setTotals(seletedDataArr.length)
    }).catch((error) => {
      openNotification('error',`查询列表失败！,原因:${error}`)
    });
   setTimeout(()=>{
    setTableLoading(false)
  },2000)
}


const onSearchExpired=()=>{
    setTableLoading(true)
    const userStr=localStorage.getItem("user");
    const user=JSON.parse(userStr);
    const  param={}
    param.userId=user.userAccount
    param.deviceId= optionValue
    const seletedDataArr=[]
    findArticleList(param).then(res => {
      const list=res.res
      const data1 = moment().format('YYYY-MM-DD HH:mm:ss');
      for(const item of list){
        const  {articleSendTime}=item
        const  data2= moment(articleSendTime,'YYYY-MM-DD HH:mm:ss');
        if(data2.isBefore(data1)){
           seletedDataArr.push(item)
        }
      }
      setArticleDataSource(seletedDataArr);
      setTotals(seletedDataArr.length)
    }).catch((error) => {
      openNotification('error',`查询列表失败！,原因:${error}`)
    });
    setTimeout(()=>{
      setTableLoading(false)
    },2000)
  }


  const upLoadImgRel = (options) => {

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
      onSuccess('上传成功');
    })
      .catch((error) => {
        onError('上传失败');
      });
  };


  // 【 执行上传 】
  const shortArticleHandleUpload = (options) => {
    const upLoadForm= shortArticleModalForm.getFieldsValue();
    const localUser=JSON.parse(localStorage.getItem("user"));
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
    const localUser=JSON.parse(localStorage.getItem("user"));
    const {file, onSuccess, onError} = options;
    const formData = new FormData();
    formData.append('file',  file);
    formData.append('uid',  localUser.userAccount);
    formData.append('deviceId',  upLoadForm.deviceId);
    formData.append('articleSendTime',  moment(upLoadForm.articleSendTime).format('YYYY-MM-DD HH:mm:ss'));
    formData.append('articleNum',  upLoadForm.articleNum);
    formData.append('channel',  upLoadForm.articleChannel);
     axios.post('http://101.201.33.155:8099/article/web/import/originalArticle/file', formData, {
    // axios.post('http://localhost:8099/article/web/import/originalArticle/file', formData, {
      headers: {'Content-Type': 'multipart/form-data'}
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

    setSelectedDrawRowKeys([])
    setSelectedDrawRows([])

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
      });
  };


  const  onDateChange=(date, dateString)=>{
     setDataSelect(dateString)
  }



 const  ondataFooterClick=(flag)=>{
   const tomorrow = moment().add(1, 'day').startOf('day');
   let time;
   switch (flag) {
     case 6:
        time = moment(tomorrow).set({ hour: 6, minute: 0, second: 0 });
        break;
     case 14:
        time = moment(tomorrow).set({ hour: 14, minute: 0, second: 0 });
       break;
     default:
        time = moment(tomorrow).set({ hour: 17, minute: 0, second: 0 });
   }
   bashPbForm.setFieldsValue({
     "bathPbDate":time
   })
 }


  const ondataFooter=()=>{
    return(
      <Space>
        <Button  type="primary"  onClick={()=>{ondataFooterClick(6)}} size="small">    明天6点 </Button>
        <Button  type="primary"  onClick={()=>{ondataFooterClick(14)}} size="small">  明天14点 </Button>
        <Button  type="primary"  onClick={()=>{ondataFooterClick(19)}} size="small">  明天19点 </Button>
      </Space>
    )
  }


   const cancelDrawer=()=>{
     setOpenDrawer(false)
   }

  const customMaskStyle = {
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // 设置遮盖层颜色为半透明黑色
    width: '100%',                         // 设置遮盖层宽度为屏幕宽度的50%
    height: '95vh',                        // 设置遮盖层高度为屏幕高度的50%
  };

  const customHeadStyle = {
    backgroundColor: 'rgb(149,201,243)', // 设置遮盖层颜色为半透明黑色
  };

  const customBodyStyle = {
    height: '98vh',            // 设置 Drawer 内容区域的高度为屏幕高度的80%
  };

  return (
    <GridContent>
      <Row gutter={24}>
          <Card bordered style={{ marginBottom: 24 , width:'100%',height: '80%' }} >
            <Space  style={{ marginBottom: 16}}>
              <Button    type= 'primary'  icon={<PlusOutlined />} onClick={addThemModalClick}>新增</Button>
              <Button    type= 'primary'  icon={<PlusCircleOutlined />} onClick={addShortModalClick}>批量导入短文/换行</Button>
              <Button    type= 'primary'  icon={<PlusSquareOutlined />} onClick={addOriginalModalClick}>批量导入原文</Button>
              <label>设备编号:</label>
              <Select
                id="deviceId"
                style={{ width: 150 }}
                options={deviceOption}
                onChange={onOptionChange}
              />
              <label>日期:</label>
              <DatePicker  onChange={onDateChange}  id="dataPickerId"  value={moment(dataSelect)} />
              <Button    type= 'primary'  icon={<SearchOutlined/>}       onClick={onSearch} >查询</Button>
              <Button    type= 'primary'  icon={<WindowsOutlined />}     onClick={onSearchAll} >查询全部</Button>
              <Button    type= 'primary'  icon={<TeamOutlined />}        onClick={onPublicshBath} >批量发布</Button>
              <Button    type= 'primary'  icon={<ThunderboltOutlined />} onClick={onPublicAutoBath} >智能发布</Button>
              <Button     type= 'primary' icon={<ReloadOutlined />}    onClick={refreshArtiList}>刷新</Button>
              <a>待发布: {totals}</a>
              <a style={{ color:'#e84242' ,marginLeft:20}}  onClick={onSearchExpired}>过期: {totalsExpired}</a>
            </Space>
            <Spin spinning={tableLoading}>
              <Table
                rowKey="id"
                columns={columns}
                dataSource={articleDataSource}
                pagination={{
                  total: totals,
                  showTotal: total => `共${total}条`,
                  pageSizeOptions: [20,40],
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
        onCancel={()=>{
          setIsModalOpen(false)
          articleModalForm.resetFields()
        }}
        width='50%'
        style={{height:'500px'}}
        zIndex={1001}
        destroyOnClose={true}
        maskClosable={false}
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
            <TextArea rows={15}   showCount    maxLength={5000} readOnly={operationRef.current.data === "详情"} />
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
        maskClosable={false}
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
        maskClosable={false}
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
      <div style={{
        padding: 48,
      }}>
      <Drawer
         width={400} // 设置抽屉的宽度
         title="图库列表展示"
         open={openDrawer}
         onClose={cancelDrawer}
         getContainer={false}
         zIndex={1002}
         extra={
           <Space size={15} >
             <Button   type="primary" onClick={bindImgDatasPic}  icon={<PlusOutlined />}  >绑定</Button>
             <Button   type="primary" onClick={cancelDrawer}>取消</Button>
           </Space>
         }
         destroyOnClose
         mask
         maskStyle={customMaskStyle}
         headerStyle={customHeadStyle}
         bodyStyle={customBodyStyle}
      >
        <Table
          style={{height:'50px'}}
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
      </div>
      { /** ****************************************  批量发布; 设置时间  ; 【抽屉】  ************************************* * */}
      <Modal
        title="批量发布设置间隔时间"
        open={bathPublishModalOpen}
        onOk={bathModalOk}
        onCancel={()=>{ setBathPublishModalOpen(false)}}
        destroyOnClose
        maskClosable={false}
      >
        <Form
          form={bashPbForm}
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
          autoComplete="off"
        >
          <Form.Item
            labelCol={{ span: 6}}
            label="开始发布时间"
            name="bathPbDate"
            rules={[{required: true}]}
          >
            <DatePicker showTime  renderExtraFooter={ondataFooter}  />
          </Form.Item>
          <Form.Item
            labelCol={{ span: 6}}
            label="选择间隔的时间"
            name="bathPbInterval"
            rules={[{required: true}]}
          >
            <InputNumber   width={30}  addonAfter="分钟" />
          </Form.Item>
        </Form>
      </Modal>

      { /** ****************************************  智能发布; 设置时间  ; 【抽屉】  ************************************* * */}
      <Modal
        title="智能发布"
        open={autoPublishModalOpen}
        onOk={autoModalOk}
        onCancel={()=>{ setAutoPublishModalOpen(false)}}
        destroyOnClose
        maskClosable={false}
      >
        <Form
          form={autoForm}
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
          autoComplete="off"
        >
          <Form.Item
            labelCol={{ span: 6}}
            label="文章数量"
            name="autoNum"
            rules={[{required: true}]}
          >
            <InputNumber   style={{width:200}}  />
          </Form.Item>
          <Form.Item
            labelCol={{ span: 6}}
            label="开始时间"
            name="autoDate"
            rules={[{required: true}]}
          >
            <DatePicker showTime   style={{width:200}}   renderExtraFooter={ondataFooter}  />
          </Form.Item>
          <Form.Item
            labelCol={{ span: 6}}
            label="间隔时间"
            name="autoInterval"
            rules={[{required: true}]}
          >
            <InputNumber   width={30}  addonAfter="分钟"   style={{width:200}}  />
          </Form.Item>
        </Form>
      </Modal>

    </GridContent>

  );
};



export default connect(() => ({
}))(Article);
