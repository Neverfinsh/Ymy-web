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
  Table,
} from 'antd';
import { connect, history } from 'umi';
import { GridContent } from '@ant-design/pro-layout';
import { PlusOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import useForm from 'antd/lib/form/hooks/useForm';
import moment from 'moment';
import TextArea from 'antd/es/input/TextArea';
import { adddArticle, delArticle, findArticleList, updateArticleImpl } from '@/services/article';


const Device = () => {

  const[articleModalForm] = useForm();
  const[isModalOpen,setIsModalOpen]=useState(false);


  const[articleDataSource,setArticleDataSource]=useState([]);
  const operationRef=useRef( {data:''});
  const tableLoadRef=useRef( {flag:false})
  const [tableLoading,setTableLoading]=useState(false)

  const [selectedRowKeys, setSelectedRowKeys] = useState([])
  const [selectedRows, setSelectedRows] = useState([])

  const[totals,setTotals]=useState(0);

  const openNotification = (type,content) => {
    notification[type]({
      message: content,
    });
  };

  const initList=()=>{
    tableLoadRef.current.flag=true
    const paramStr=localStorage.getItem("user");
    const param=JSON.parse(paramStr);
    findArticleList(param).then(res => {
      const list=res.res
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
      title: '序号',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: '账号',
      dataIndex: 'uid',
      key: 'userId',
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
    },
    {
      title: '标题',
      dataIndex: 'articleTitle',
      key: 'articleTitle',
    },
    {
      title: '文章内容',
      dataIndex: 'articleContent',
      key: 'articleContent',
      ellipsis:true,
      width: '30%',
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
    },
    {
      title: '发布平台',
      dataIndex: 'articleChannel',
      key: 'articleChannel',
      render: (text) =>{
        return text === undefined ? '今日头条' : '其他平台'
      },
    },
    // {
    //   title: '创建时间',
    //   dataIndex: 'createTime',
    //   key: 'createTime',
    //   sorter: (a, b) => new Date(a.createTime) - new Date(b.createTime),
    // },
    // {
    //   title: '更新时间',
    //   dataIndex: 'updateTime',
    //   key: 'updateTime',
    // },
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
         setIsModalOpen(true)
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

  const  updateArticle=(record)=>{
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
      'id':record.id
    });
  }

  const  publishArticle=(record)=>{

    //  【更新状态】 和  【修改发送时间为今天的时间】
    const param= record;
    param.articleSendTime=moment().format('YYYY-MM-DD HH:mm:ss')
    console.log('-----修复发布时间param------' ,param);
    Modal.confirm({
      title:   '发布文章',
      content: '是否立即发布文章？',
      onOk() {
        updateArticleImpl(param).then(res => {
          if(res.code === 0){
            openNotification('success','修改文章发布时间成功')
          }
           initList()
        }).catch((error) => {
            openNotification('error',`修改文章发布时间成功失败,失败原因:${error}`)
        });
      },
      onCancel() {
           openNotification("success","取消修改文章发布时间成功")
      },
    });



  }

  const onModalOk=()=>{
      setIsModalOpen(false)
      const param= articleModalForm.getFieldsValue();
      param.uid=param.userId
      param.deviceId=param.userId
      param.status=0
      param.createTime=moment(param.articleSendTime).format('YYYY-MM-DD HH:mm:ss')
      param.articleSendTime=moment(param.articleSendTime).format('YYYY-MM-DD HH:mm:ss')


      // 【  新增方法 】
        if(operationRef.current.data ==="新增"){
          adddArticle(param).then(res => {
          if(res.code === 0){
            openNotification('info','新增一篇文章成功')
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

  // 【 批量发布】
  const onPublicshBath=()=>{
    console.log('批量发布账号' ,selectedRows);
    // eslint-disable-next-line no-restricted-syntax
    for (const param of selectedRows) {
          param.articleSendTime=moment().format('YYYY-MM-DD HH:mm:ss')
          updateArticleImpl(param).then(res => {
            if(res.code === 0){
               openNotification('success',`修改文章标题 【${param.articleTitle}】发布时间成功`)
            }
          }).catch((error) => {
              openNotification('error',`修改文章标题 【 ${param.articleTitle}】 发布时间失败,失败原因:${error}`)
          });
    }
    // 刷新列表
    initList()
    // 清空
    setSelectedRows([])

  }




  // eslint-disable-next-line no-shadow
  const onTableSelectChange = (selectedRowKeys, selectedRows) => {
    setSelectedRowKeys(selectedRowKeys)
    setSelectedRows(selectedRows)
  }


  return (
    <GridContent>
      <Row gutter={24}>
          <Card bordered style={{ marginBottom: 24 , width:'100%',height: '80%' }} >
            <Space  style={{ marginBottom: 16}}>
              {/* eslint-disable-next-line react/jsx-no-undef */}
              <Button    type= 'primary'  icon={<PlusOutlined />} onClick={addThemModalClick}>绑定新设备</Button>
              <Button   type= 'primary'   icon={<ReloadOutlined />}  onClick={refreshArtiList}>刷新</Button>
              <Input placeholder= "输入搜索的内容..." />
              <Button    type= 'primary'  icon={<SearchOutlined  />} >查询</Button>
            </Space>
            <Spin spinning={tableLoading}>
              <Table
                rowKey="id"
                columns={columns}
                dataSource={articleDataSource}
                pagination={{
                  // current: searchParam.pageNum,
                  // pageSize: searchParam.pageSize,
                  // onChange: (pageNum, pageSize) => {
                  //   if (pageNum !== searchParam.pageNum || pageSize !== searchParam.pageSize) {
                  //     setSearchParam({ ...searchParam, pageNum, pageSize });
                  //     getTableData({ ...searchParam, pageNum, pageSize });
                  //   }
                  // },
                  total: totals,
                  showTotal: total => `共${total}条`,
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
      {/**/}
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
            <TextArea   showCount   readOnly={operationRef.current.data === "详情"} />
          </Form.Item>
          <Form.Item
            label="标题"
            name="articleTitle"
            rules={[{required: true}]}
          >
            <TextArea  showCount   maxLength={20}   />
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
              <DatePicker showTime />
          </Form.Item>
          <Form.Item
            label="输入设备名称"
            name="userId"
            rules={[{required: true}]}
          >
            <Input  readOnly={operationRef.current.data === "详情"} />
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
            label="输入设备名称"
            name="id"
            rules={[{required: true}]}
            style={{display:'none'}}
          >
            <Input  readOnly={operationRef.current.data === "详情"} />
          </Form.Item>
        </Form>
      </Modal>
    </GridContent>

  );
};

export default connect(() => ({
}))(Device);
