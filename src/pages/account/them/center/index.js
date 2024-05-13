import React, { useEffect, useRef, useState } from 'react';
import {
  Button,
  Card,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Modal,
  Row,
  Select,
  Space,
  Spin,
  Switch,
  Table,
} from 'antd';
import { connect, history } from 'umi';
import { GridContent } from '@ant-design/pro-layout';
import { SearchOutlined } from '@ant-design/icons';
import useForm from 'antd/lib/form/hooks/useForm';
import moment from 'moment';
import TextArea from 'antd/es/input/TextArea';
import { debounce } from 'lodash';
import { findOthersThemList, saveThem } from '@/services/them';
import { openNotification } from '@/utils/utils';

const CenterThem = () => {


  const [addThemform] = useForm();
  const[isModalOpen,setIsModalOpen]=useState(false);

  const [tableDataSource,setTableDataSource]=useState([]);
  const operationRef=useRef( {data:''});
  const [tableLoaidng,setTableLoading]=useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState([])
  const [selectedRows, setSelectedRows] = useState([])
  const [deviceOption,setDeviceOption]=useState([]);
  const [tmp,setTmp]=useState(true)
  // 批量发布选择的日期
  const [dataSelect,setDataSelect]=useState(moment().subtract(1,'months').format('YYYY-MM'));

  const titleTmp="例如：把 '如何谈恋爱'? 这个标题润色一下,使得标题更加吸引人眼球，更加具体创新力，不超过14个字，要求标题带有双引号,不要带有冒号";
  const themTmp="假如你是一个30岁单身的女性的，在广州上班，自身条件也不错，有身材有颜值，想找一个年龄比我大，阅历比我丰富的男性。如果有合适记得给我推荐。根据这个设定，以第一人称的口吻写一篇300字的短文，语言口语化，情感要真实 ，文章段落清晰，不要带有第一句。";


  const[filters,setFilters] =useState([])
  const filtersRef=useRef({data:[]})

  const columns=[
    {
      title: '序号',
      dataIndex: 'id',
      key: 'id',
      width:'5%'
    },
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
      title: '主题类型',
      dataIndex: 'type',
      key: 'type',
      width:'10%',
     // filters:filters,
      filters:filtersRef.current.data,
      // filters: [
      //   {
      //     text: '主题文',
      //     value: '主题文',
      //   },
      //   {
      //     text: 'Jim',
      //     value: 'Jim',
      //   },
      // ],
      onFilter: (value, record) => record.type.indexOf(value) === 0,
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
    //   title: '发布时间',
    //   dataIndex: 'articleSendTime',
    //   key: 'articleSendTime',
    //   width:'15%'
    // },
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
      // width: 30,
      render: (record) => [
        <Space key="themOpera">
          <a onClick={()=>{updateThem(record)}}>编辑/参考</a>
        </Space>

      ],
    },
  ];


  useEffect(() => {
    initList()
  }, []);



  useEffect(()=>{
    setTmp(tmp)
  },[tmp])

  const  initList=()=>{

    setTableLoading(true)
    const userStr=localStorage.getItem("user");
    const user=JSON.parse(userStr);

    if(user === undefined){
      history.push('/user/login');
      return ;
    }
    const  param={}
    param.userId=user.userAccount
  //  param.startTime=moment().subtract(1,'months').format('YYYY-MM')
    param.startTime=dataSelect
    findOthersThemList(param).then(res => {
      let   dates=[]
      dates=res.res;
      setTableDataSource(dates)


      let mySet = new Set();
      for (let item of dates) {
           mySet.add(item['type'])
      }
      let arr=[...mySet]
      console.log('-----arr -----' ,[...mySet]);
      let result=[]
      for (let i = 0; i < arr.length; i++) {
             let obj={}
             obj.text=arr[i]
             obj.value=arr[i]
             result.push(obj)
      }

      console.log('-----result -----' ,result);
      filtersRef.current.data=result
   //   setFilters(result)

      //  延迟加载Loading
      setTimeout(()=>{
        setTableLoading(false)
      },1000)
    }).catch((error) => {
      openNotification("error",`查询主题列表失败,原因: ${error}`,)
    });



  }








  const updateThem=(record)=>{

    const  devicesStr=localStorage.getItem("devices")
    const  devicesArr=JSON.parse(devicesStr);
    const  defaultValue=devicesArr[0]


    setIsModalOpen(true)
    operationRef.current.data="编辑"
    setIsModalOpen(true)


    addThemform.setFieldsValue({
      'articleThem': record.articleThem,
      'articleTitle': record.articleTitle,
      'articleNum':  Number(record.articleNum),
      'articleSendTime': moment().add(5,'minutes'),
      'userId': record.uid,
      'deviceId':defaultValue,
      'status':`${record.status}`,
      'articleChannel': record.articleChannel,
    });

  }


  const onModalOk = () => {

    setIsModalOpen(false);
    const localUser = JSON.parse(localStorage.getItem('user'));
    const param = addThemform.getFieldsValue();
    param.uid = localUser.userAccount;
    param.deviceId = param.deviceId;
    param.status = 0;
    param.createTime = moment(param.articleSendTime).format('YYYY-MM-DD HH:mm:ss');
    param.updateTime = moment(param.articleSendTime).format('YYYY-MM-DD HH:mm:ss');
    param.articleSendTime = moment(param.articleSendTime).format('YYYY-MM-DD HH:mm:ss');
    param.articleTitleStatus = tmp ? 0 : 1;

    saveThem(param).then(res => {
      if (res.code === 0) {
        openNotification('success', '【参考新增一条主题】成功', 3.5);
      }
      initList();
    }).catch((error) => {
      openNotification('error', `【参考新增一条主题】失败,原因:${error}`, 5);
    });

  }


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


  const onTableSelectChange = (selectedRowKeys, selectedRows) => {
    setSelectedRowKeys(selectedRowKeys)
    setSelectedRows(selectedRows)
  }

const dataPickeChage=(date, dateString)=>  {
    console.log('dateString' ,dateString);
    setDataSelect(dateString)
  }


  return (
    <GridContent>
      <Row gutter={24}>
          <Card bordered style={{ marginBottom: 24 , width:'100%',height: '80%' }} >
            <Space  style={{ marginBottom: 16}}>
              <a  style={{fontSize:15}}>主题日期:</a>
              <DatePicker  onChange={dataPickeChage}     id="dataPickerId"  value={moment(dataSelect)}   picker="month"  />
              <Input       placeholder= "输入搜索的主题序号、内容..."  onChange={ (e)=>{inputChange(e.target.value)}} style={{width:250}}/>
              <Button     type= 'primary'  icon={<SearchOutlined  />} onClick={()=>{ initList()}} >查询</Button>
            </Space>
            <Spin spinning={tableLoaidng}>
              <Table
                scroll={{
                  x: 1000,
                  y: 800,
                }}
                virtual
                rowKey="id"
                columns={columns}
                dataSource={tableDataSource}
                style={{width:'100%'}}
                // scroll={{ x: 1300 }}
                pagination={{
                  pageSizeOptions: [100],
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
      {/** *****************************************************************  [ 新增/编辑 modal]  ******************************************* */}
      <Modal
        title={`${operationRef.current.data}主题`}
        open={isModalOpen}
        onOk={onModalOk}
        onCancel={()=>{    setIsModalOpen(false)}}
        width='60%'
        // style={{height:'500px'}}
        destroyOnClose
        maskClosable={false}
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
            <TextArea   rows={8}  placeholder={themTmp} />
          </Form.Item>
          <Form.Item
            label="生成标题"
            name="articleTitleStatus"
            rules={[{required: true}]}
          >
              <Switch  onChange={(value)=>{setTmp(!value)}}  checkedChildren="是" unCheckedChildren="否" />
          </Form.Item>
             <a style={{marginLeft:'34%'}}  hidden={tmp}>{titleTmp}</a>
          <Form.Item
            label="生成标题模板"
            name="articleTitleTemplate"
            hidden={tmp}
            rules={[{required:`${tmp}` }]}
          >
            <TextArea   rows={6}  />
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
              <DatePicker showTime   />
          </Form.Item>
          <Form.Item
            label="选择设备编号"
            name="deviceId"
            rules={[{required: true}]}
          >
            <Select options={deviceOption}  />
          </Form.Item>
          {/*<Form.Item*/}
          {/*  label="状态"*/}
          {/*  name="status"*/}
          {/*  rules={[{required: true}]}*/}
          {/*>*/}
          {/*  <Select*/}
          {/*    style={{ width: 150 }}*/}
          {/*    options={statuOption}*/}
          {/*  />*/}
          {/*</Form.Item>*/}
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
            <Input/>
          </Form.Item>
        </Form>
      </Modal>

    </GridContent>

  );
};

export default connect()(CenterThem);
