import React, { useEffect, useRef, useState } from 'react';
import { Button, Card, DatePicker, Form, Row, Select, Space, Spin, Table } from 'antd';
import { connect, history } from 'umi';
import { GridContent } from '@ant-design/pro-layout';
import { SearchOutlined } from '@ant-design/icons';
import moment from 'moment';
import { findDeviceList } from '@/services/device';
import { openNotification } from '@/utils/utils';
import { findDataRecordList } from '@/services/data';


const DataCenter = () => {

  const[countDataSource,setCountDataSource]=useState([]);

  const[totals,setTotals]=useState(0);
  const[optionValue,setOptionValue]=useState();
  const[optionDataValue,setOptionDataValue]=useState();
  const [empt,setEmpt]=useState(false)

  const [deviceOption,setDeviceOption]=useState([]);
 // 预定义周期
  const [dataOption]=useState([
      { value: 'afterTomorrow',     label: '后天' },
      { value: 'tomorrow',     label: '明天' },
      { value: 'today',        label: '今天' },
      { value: 'yesterday'   , label: '昨天' },
      { value: 'threeday',     label: '最近天' },
      { value: 'week',         label: '一周' },
  ]);
 // 自定义周期

  useEffect(()=>{
    setDeviceOption(deviceOption)
  },[deviceOption])

  // 【获取当前用户信息】
  useEffect(() => {
    const loginUser =localStorage.getItem("user")
    if(loginUser === null){
      history.push("../../user/login")
    }
  }, []);



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
        // eslint-disable-next-line no-plusplus
        for(let i=0;i<deviceList.length;i++){
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
    setEmpt(true)
    const userStr=localStorage.getItem("user");
    const user=JSON.parse(userStr);

    if(user === undefined){
      history.push('/user/login');
      return ;
    }
    // 获取当前日期
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59)

    const   param={}
            param.uid=user.userAccount
            param.deviceId='all'
            param.channel=null
            param.status=null
            param.startTime=moment(startOfDay).format('YYYY-MM-DD HH:mm:ss')
            param.endTime=moment(endOfDay).format('YYYY-MM-DD HH:mm:ss')

    findDataRecordList(param).then(res => {
      const list=res.res
      setCountDataSource(list)
      setTotals(list.length)
    }).catch((error) => {
      openNotification('error',`查询数据统计过列表失败！,原因:${error}`)
    });
    setEmpt(false)
  }

  useEffect(() => {
    initList()
    initDviceOption()
  }, []);



  const  detailArticle=(record)=>{
    console.log('record' ,record);
  }


  const columns=[
    {
      title: '序号',
      dataIndex: 'index',
      key: 'index',
      render:(text,record,index)=>`${index+1}`,
    },
    {
      title: '账号',
      dataIndex: 'uid',
      key: 'userId',
    },
    {
      title: '设备编号',
      dataIndex: 'devicedId',
      key: 'devicedId',
    },

    {
      title: '主题数量',
      dataIndex: 'themTotalCount',
      key: 'themTotalCount',
    },
    {
      title: '文章完成数量',
      dataIndex: 'finishedCount',
      key: 'finishedCount',
    },
    {
      title: '文章未完成数量',
      dataIndex: 'unfinishedCount',
      key: 'unfinishedCount',
    },

    // {
    //   title: '发布平台',
    //   dataIndex: 'articleChannel',
    //   key: 'articleChannel',
    //   render: (text) =>{
    //      return text === undefined ? '今日头条' : '其他平台'
    //   }
    // },
    {
      title: '操作',
      width: 100,
      key: 'option',
      valueType: 'option',
      // eslint-disable-next-line no-unused-vars
      render: ( record) => [
        <Space key="opt" >
          <a onClick={()=>{detailArticle(record)}}>查看详情</a>
        </Space>

      ],
    },
  ];





  const onOptionChange=(value)=>{
    setOptionValue(value);
  }



  const onDataChange=(value)=>{
    setOptionDataValue(value);
  }

  useEffect(()=>{
    setOptionValue(optionValue)
  },[optionValue])




  const onSearch=()=>{

    setEmpt(true)
    const userStr=localStorage.getItem("user");
    const user=JSON.parse(userStr);

    if(user === undefined){
      history.push('/user/login');
      return ;
    }
    // 获取当前日期
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59)

    const   param={}
    if(optionDataValue === 'today'){
     param.startTime=moment(startOfDay).format('YYYY-MM-DD HH:mm:ss')
     param.endTime=moment(endOfDay).format('YYYY-MM-DD HH:mm:ss')
   }
    if(optionDataValue === 'yesterday'){
       const yesterdayStartTime = moment(startOfDay).subtract(1, 'days');
       const yesterdayEndTime = moment(endOfDay).subtract(1, 'days');
       param.startTime=moment(yesterdayStartTime).format('YYYY-MM-DD HH:mm:ss')
       param.endTime=moment(yesterdayEndTime).format('YYYY-MM-DD HH:mm:ss')
    }
    if(optionDataValue === 'tomorrow'){
      const yesterdayStartTime = moment(startOfDay).add(1, 'days');
      const yesterdayEndTime = moment(endOfDay).add(1, 'days');
      param.startTime=moment(yesterdayStartTime).format('YYYY-MM-DD HH:mm:ss')
      param.endTime=moment(yesterdayEndTime).format('YYYY-MM-DD HH:mm:ss')
    }
    if(optionDataValue === 'afterTomorrow'){
      const yesterdayStartTime = moment(startOfDay).add(2, 'days');
      const yesterdayEndTime = moment(endOfDay).add(2, 'days');
      param.startTime=moment(yesterdayStartTime).format('YYYY-MM-DD HH:mm:ss')
      param.endTime=moment(yesterdayEndTime).format('YYYY-MM-DD HH:mm:ss')
    }

    param.uid=user.userAccount
    param.deviceId='all'
    param.channel=null
    param.status=null

    findDataRecordList(param).then(res => {
      const list=res.res
      setCountDataSource(list)
      setTotals(list.length)
      setEmpt(false)

    }).catch((error) => {
      openNotification('error',`查询数据统计过列表失败！,原因:${error}`)
      setEmpt(false)
    });



  }




  return (
    <GridContent>
      <Row gutter={24}>
        <Card bordered style={{ marginBottom: 24 , width:'100%',height: '80%' }} >
          <Space  style={{ marginBottom: 16}}>
            <a style={{color:'black'}}> 设备编号:</a>
            <Select   defaultValue="all"  style={{ width: 150 }}   options={deviceOption}  onChange={onOptionChange}/>
            <a style={{color:'black'}}> 查询周期:</a>
            <Select    defaultValue="today"  style={{ width: 150 }}   options={dataOption}  onChange={onDataChange}  />
            <a style={{color:'black'}}>开始日期:</a>
            <DatePicker  showTime    style={{ width: 150 }} />
            <a style={{color:'black'}}>结束日期:</a>
            <DatePicker  showTime    style={{ width: 150 }} />
            <Button    type= 'primary'  icon={<SearchOutlined/>} onClick={onSearch} >查询</Button>
          </Space>
          <Spin spinning={ empt}>
            <Table
              rowKey="id"
              columns={columns}
              dataSource={countDataSource}
              pagination={{
                total: totals,
                showTotal: total => `共${total}条`,
                pageSizeOptions: [5,10, 20, 50, 100],
                showSizeChanger: true,
              }}
            />
          </Spin>

        </Card>
      </Row>
    </GridContent>

  );
};

export default connect(() => ({
}))(DataCenter);
