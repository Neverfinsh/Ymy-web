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
  Popconfirm,
  Row,
  Select,
  Space,
  Spin,
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
import { isEmpty } from '@/utils/utils';


const Article = () => {

  const[articleModalForm] = useForm();
  const[isModalOpen,setIsModalOpen]=useState(false);
  const[shortModalOpen,setShotModalOpen]=useState(false);



  const[articleDataSource,setArticleDataSource]=useState([]);
  const[articleImgList,setArticleImgList]=useState([]);
  const operationRef=useRef( {data:''});
  const tableLoadRef=useRef( {flag:false})
  const [tableLoading,setTableLoading]=useState(false)

  const [selectedRowKeys, setSelectedRowKeys] = useState([])
  const [selectedRows, setSelectedRows] = useState([])

  const[totals,setTotals]=useState(0);

  const[optionValue,setOptionValue]=useState();
  // 初始化设备
  const [deviceOption,setDeviceOption]=useState([]);


  const openNotification = (type,content) => {
    notification[type]({
      message: content,
    });
  };


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
    }).catch((error) => {
      openNotification('error',`查询列表失败！,原因:${error}`)
    });
    tableLoadRef.current.flag=false
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


  const columns=[
    {
      title: '文章序号',
      dataIndex: 'id',
      key: 'id',
      onFilter: (value, record) => record.id.indexOf(value) === 0,
    },
    {
      title: '账号',
      dataIndex: 'uid',
      key: 'userId',
    },
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
    {
      title: '主题名',
      dataIndex: 'articleThem',
      key: 'articleThem',
      width: '20%',
    },
    // {
    //   title: '标题',
    //   dataIndex: 'articleTitle',
    //   key: 'articleTitle',
    //   ellipsis:true,
    // },
    {
      title: '文章内容',
      dataIndex: 'articleContent',
      key: 'articleContent',
      ellipsis:true,
      width: '25%',
      onFilter: (value, record) => record.articleContent.indexOf(value) === 0,
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
          <a  onClick={()=>{detailArticle(record)}}>详情</a>
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


  const addThemModalClick=()=>{
         operationRef.current.data="新增"
         setIsModalOpen(true)
  }


  const addShortModalClick=()=>{
       setShotModalOpen(true)
  }

  const  addThemByTemplate=()=>{
    //

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
    console.log('删除111' ,file.uid);

    axios.delete(`http://localhost:8099/image/web/delRelImg/${file.uid}`, {
      headers: {'Content-Type': 'application/json'},
    }).then((response) => {
      console.log(response)
    })
  }

  const  updateArticle=(record)=>{

     console.log('编辑record' ,record.id);
      const  articleId=record.id
      findArticleImgRelList(articleId).then(res => {
        const result=res.res
        console.log('---list----' ,result);
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
    for (const param of newOrderselectedRows) {
          const now = moment();
          const futureTime = now.add(10*count, 'minutes');
          const newArticleSendTime=futureTime.format('YYYY-MM-DD HH:mm:ss')
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

  // debounce((e) => {
  //   console.log(e);
  //   //  doSearch(e)
  // }, 800)
}

  const upLoadImgRel = (options) => {
    // 获取参数
    const param= articleModalForm.getFieldsValue();

    // 上传图片风格
    const {file, onSuccess, onError} = options;
    const formData = new FormData();
    formData.append('files', file);
    formData.append('deviceId',  'LIWU004');
    formData.append('accountId', '15084762140');
    formData.append('groupCodeId', '005');
    formData.append('articleId', '935');

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
    // axios.post('http://101.201.33.155:8099/them/import/params/file', formData, {
    axios.post('http://localhost:8099/them/import/params/file', formData, {
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


  //  打开图片
  const imgDataBase=()=>{
    // 打开modal ， 查询对应的数据把数据渲染到modal里面去，
  }

  return (
    <GridContent>
      <Row gutter={24}>
          <Card bordered style={{ marginBottom: 24 , width:'100%',height: '80%' }} >
            <Space  style={{ marginBottom: 16}}>
              {/* eslint-disable-next-line react/jsx-no-undef */}
              <Button    type= 'primary'  icon={<PlusOutlined />} onClick={addThemModalClick}>新增</Button>
              <Button    type= 'primary'  icon={<PlusOutlined />} onClick={addShortModalClick}>批量导入文章</Button>
              <Button    type= 'primary'  icon={<PlusOutlined />} onClick={addShortModalClick}>批量导入短文</Button>
              <Button    type= 'primary'  icon={<TeamOutlined />} onClick={onPublicshBath} >批量发布</Button>
              {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
              <label>设备编号:</label>
              <Select
                defaultValue="all"
                style={{ width: 150 }}
                options={deviceOption}
                onChange={onOptionChange}
              />
              <Input placeholder= "输入搜索的内容、序号、主题..."  onChange={onInputChange} style={{width:250}} />
              <Button    type= 'primary'  icon={<SearchOutlined/>} onClick={onSearch} >查询</Button>
              <Button   type= 'primary'   icon={<ReloadOutlined />}  onClick={refreshArtiList}>刷新</Button>
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
        width='60%'
        style={{height:'500px'}}
        destroyOnClose
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
          <Form.Item
            label="选择发布平台"
            name="articleChannel"
            rules={[{required: true}]}
          >
            <Select>
              <Select.Option value="demo">今日头条</Select.Option>
              <Select.Option value="demo">小红书</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            label="文章配图"
            name="articleImg"
            rules={[{required: true}]}
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
        title="批量新增短文"
        open={shortModalOpen}
        onOk={onShortModalOk}
        onCancel={()=>{  setShotModalOpen(false)}}
        width='60%'
        style={{height:'500px'}}
        destroyOnClose
      >
        <Form
          form={articleModalForm}
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
              customRequest={handleUpload}
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

    </GridContent>

  );
};

export default connect(() => ({
}))(Article);
