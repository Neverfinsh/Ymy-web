import React, { useEffect, useState } from 'react';
import {
  Button,
  Card,
  Col,
  DatePicker,
  Form,
  Input,
  InputNumber, message,
  Modal,
  Row,
  Select,
  Space,
  Table,
  Upload,
} from 'antd';
import { connect } from 'umi';
import { GridContent } from '@ant-design/pro-layout';
import { CloudUploadOutlined, PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import useForm from 'antd/lib/form/hooks/useForm';
import moment from 'moment';
// eslint-disable-next-line import/no-extraneous-dependencies
import axios from 'axios';


// eslint-disable-next-line no-unused-vars
const Center = ({ currentUser = {}, currentUserLoading, dispatch }) => {


  const [addThemform] = useForm();

  const[isModalOpen,setIsModalOpen]=useState(false);
  const[isInportFileModalOpen,setIsInportFileModalOpen]=useState(false);

  // 【获取当前用户信息】
  useEffect(() => {
    dispatch({
      type: 'user/fetchCurrentUser',
    });
  }, [dispatch]);

  const columns=[
    {
      title: '序号',
      dataIndex: 'index',
      key: 'index',
    },
    {
      title: '账号',
      dataIndex: 'userId',
      key: 'userId',
    },
    {
      title: '主题名',
      dataIndex: 'articleThem',
      key: 'articleThem',
    },
    {
      title: '篇数',
      dataIndex: 'articleNum',
      key: 'articleNum',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (text) => `${text === 0 ? '未发布' : '已发布'}`,
    },
    {
      title: '发布时间',
      dataIndex: 'articleSendTime',
      key: 'articleSendTime',
    },
    {
      title: '发布平台',
      dataIndex: 'articleChannel',
      key: 'articleChannel',
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
      // eslint-disable-next-line no-unused-vars
      render: (_, record) => [
        <Space>
          <a >编辑</a>
          <a >删除</a>
          <a >立即发布</a>
          <a >转化任务</a>
        </Space>

      ],
    },
  ];

  const tableDataSource=[
    {
      index:1,
      userId:'LIUWU001',
      key: '1',
      articleThem: '如何让女人“舒服”？5点取悦女人，让女人对你越来越爱',
      articleNum: 32,
      articleChannel:'今日头条',
      status: 1,
      articleSendTime: '2024-01-27 23:00:00',
      createTime: '2024-01-27 23:00:00',
      updateTime: '2024-01-27 23:00:00',
    },
  ]

  const onFinish = (values) => {
    console.log('Success:', values);

  };

  const onFinishFailed = (errorInfo) => {
    console.log('Failed:', errorInfo);
  };


  const addThemModalClick=()=>{
       setIsModalOpen(true)
  }

  const importFileModalClick=()=>{
    setIsInportFileModalOpen(true)
  }


  const onModalFileOk=()=>{
     setIsInportFileModalOpen(false)
  }

  const onModalFileCancel=()=>{
     setIsInportFileModalOpen(false)
  }

  const onModalOk=()=>{
    setIsModalOpen(false)
    const   param= addThemform.getFieldsValue();
    console.log('param' ,param);
    console.log('时间' ,moment(param.articleSendTime));

    //   const initDataSource = () => {
    //   setTableLoading(true);
    //   listLineDetail({}).then(res => {
    //   setFilterTableData(res.res.records)
    //   setTotal(res.res.total)
    //   setTableLoading(false);
    //     }).catch((error) => {
    //     message.error(error.message)
    //     setTableLoading(false);
    //     });
    //     }


    //   dispatch({
    //   type: 'user/deleteBatchMessage',
    //   payload: {
    //   ids: "",
    //   },
    //   callback: () => {
    //   message.success('批量删除信息成功。').then();
    //   },
    //   });



  }

  const onModalCancel=()=>{
    setIsModalOpen(false)
  }

  const handleUpload = (options) => {
    const {file, onSuccess, onError} = options;
    const formData = new FormData();
    formData.append('file', file);
    axios.post('http://101.201.33.155:8099/them/import/all/file/', formData, {
   // axios.post('http://localhost:8099/them/import/all/file/', formData, {
      headers: {'Content-Type': 'multipart/form-data'},
    }).then((response) => {
      console.log('response' ,response);
      onSuccess('上传成功');
    })
      .catch((error) => {
        console.log('error' ,error);
        onError('上传失败');
      });
  };

  // eslint-disable-next-line no-unused-vars
  const handleRemove = (e) => {
  //  currentNodeFilePath.current = currentNodeFilePath.current.filter(v => v.uid !== e.uid);
  };

  return (
    <GridContent>
      <Row gutter={24}>
          <Card bordered style={{ marginBottom: 24 , width:'100%',height: '80%' }} >
            <Space  style={{ marginBottom: 16}}>
              {/* eslint-disable-next-line react/jsx-no-undef */}
              <Button    type= 'primary'  icon={<PlusOutlined />} onClick={addThemModalClick}>新增</Button>
              <Button     icon={<CloudUploadOutlined />}  type= 'primary' onClick={importFileModalClick}   > 导入</Button>
{/*            <Button   type= 'primary'       icon={<ReloadOutlined />} >刷新</Button>
              <Input placeholder= "输入搜索的内容..." />
              <Button  type= 'primary'       icon={<ReloadOutlined />} >查询</Button> */}
            </Space>
            <Table
              columns={columns}
              dataSource={tableDataSource}
              pagination={false}
            />
          </Card>
      </Row>
      {/**/}
      <Modal
        title="新增主题"
        open={isModalOpen}
        onOk={onModalOk}
        onCancel={onModalCancel}
        width='60%'
        style={{height:'500px'}}
        destroyOnClose

      >
        <Form
          form={addThemform}
          name="basic"
          labelCol={{ span: 8 }}
          wrapperCol={{ span: 16 }}
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          autoComplete="off"
        >
          <Form.Item
            label="主题"
            name="articleThem"
            rules={[{required: true}]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="文章篇数"
            name="articleNum"
            rules={[{required: true}]}
          >
            <InputNumber />
          </Form.Item>
          <Form.Item
            label="开始发布时间"
            name="articleSendTime"
            tooltip="开始发布的时间"
            rules={[{required: true}]}
          >
              <DatePicker />
          </Form.Item>
          <Form.Item
            label="选择设备"
            name="userId"
            rules={[{required: true}]}
          >
            <Select>
                <Select.Option value="Linwu001">Linwu001</Select.Option>
            </Select>
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
        </Form>
      </Modal>
       <Modal
         title="导入txt文件"
         open={isInportFileModalOpen}
         onOk={onModalFileOk}
         onCancel={onModalFileCancel}
         width='40%'
         style={{height:'500px'}}
         destroyOnClose
       >

         <Row>
           <Col>
             <div>选择设备:</div>
           </Col>

           <Col style={{marginLeft:'50px'}}>
             <Select style={{width:'200px'}}>
               <Select.Option value="1" >全部设备</Select.Option>
               <Select.Option value="Linwu001" >Linwu001</Select.Option>
             </Select>
           </Col>
         </Row>

         <Upload
           name="file"
           customRequest={handleUpload}
           onRemove={handleRemove}
         >
           <Button key="upload" icon={<CloudUploadOutlined />}  type= 'primary'  > 导入</Button>
         </Upload>
       </Modal>
    </GridContent>

  );
};

export default connect(({ loading, user }) => ({
  currentUser: user.currentUser,
  currentUserLoading: loading.effects['user/fetchCurrentUser'],
}))(Center);
