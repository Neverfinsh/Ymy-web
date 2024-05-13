import React, { useEffect, useRef, useState } from 'react';
import { Button, Card, DatePicker, Form, Row, Select, Space, Spin, Table, Tag } from 'antd';
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
  const [empt,setEmpt]=useState(false)
  const [deviceOption,setDeviceOption]=useState([]);
  // 自定义周期
  const [startTime,setStartTime]=useState(new moment().subtract(1,'days'));
  const [endTime,setEndTime]=useState(new moment().add(6,'days'));

  const columns=[
    {
      title: '序号',
      dataIndex: 'index',
      key: 'index',
      render:(text,record,index)=>`${index+1}`,
    },
    {
      title: '统计日期',
      dataIndex: 'beginTime',
      key: 'beginTime',
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
      render:(text)=>{
        if(Number(text) === 0){
          return  <Tag color="volcano">{text}</Tag>
        }else {
          return  <Tag color="green">{text}</Tag>
        }
      }
    },
    {
      title: '文章完成数量',
      dataIndex: 'finishedCount',
      key: 'finishedCount',
      render:(text)=>{
          if(Number(text) === 0){
            return  <Tag color="volcano">{text}</Tag>
          }else {
            return  <Tag color="green">{text}</Tag>
          }
      }
    },
    {
      title: '文章未完成数量',
      dataIndex: 'unfinishedCount',
      key: 'unfinishedCount',
      render:(text)=>{
        if(Number(text) === 0){
          return  <Tag color="volcano">{text}</Tag>
        }else {
          return  <Tag color="green">{text}</Tag>
        }
      }
    },
    {
      title: '操作',
      width: 100,
      key: 'option',
      valueType: 'option',
      render: ( record) => [
        <Space key="opt" >
          {/*<a onClick={()=>{detailArticle(record)}}>查看详情</a>*/}
        </Space>

      ],
    },
  ];

  useEffect(() => {
    initDviceOption()
  }, []);


  useEffect(() => {
    initList()
  }, []);



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
    findDeviceList(userAccount).then(res=>{
      if(0 === res['code']){
        let     defaultValue
        const   deviceNames=[]
        const   { res: deviceList } = res
        for(let i=0;i<deviceList.length;i++){
          deviceNames.push(deviceList[i]['dviceName'])
          const obj={}
          obj.value=deviceList[i]['dviceName']
          obj.label=deviceList[i]['dviceName']
          defaultValue=deviceList[i]['dviceName']
          options.push(obj)
        }
        setDeviceOption(options);
        setOptionValue(defaultValue)
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

    const   param={}
    param.startTime=moment(startTime).set({ hour: 0, minute: 0, second: 0 }).format('YYYY-MM-DD HH:mm:ss')
    param.endTime=moment(endTime).set({ hour: 23, minute: 59, second: 59 }).format('YYYY-MM-DD HH:mm:ss')
    if(optionValue === undefined){
      const  devicesStr=localStorage.getItem("devices")
      const  devicesArr=JSON.parse(devicesStr);
      const  defaultValue=devicesArr[0]
      param.deviceId= defaultValue
    }else {
      param.deviceId= optionValue
    }
    param.uid= user.userAccount
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


  const  detailArticle=(record)=>{
       console.log('record' ,record);
  }

  const onOptionChange=(value)=>{
        setOptionValue(value);
  }

  useEffect(()=>{
    setOptionValue(optionValue)
  },[optionValue])



  const onSearch=()=>{
    initList()
  }

const startTimeChange=(date, dateString)=>{
    console.log('startTimeChange' ,dateString);
    setStartTime(dateString)
}

const endTimeChange=(date, dateString)=>{
     console.log('endTimeChange' ,dateString);
     setEndTime(dateString)
  }


  return (
    <GridContent>
      <Row gutter={24}>
        <Card bordered style={{ marginBottom: 24 , width:'100%',height: '80%' }} >
          <Space  style={{ marginBottom: 16}}>
            <a style={{color:'black'}}> 设备编号:</a>
            <Select   value={optionValue}  style={{ width: 150 }}   options={deviceOption}  onChange={onOptionChange}/>
            <a style={{color:'black'}}>开始日期:</a>
            <DatePicker      style={{ width: 150 }}  value={moment(startTime)}  onChange={startTimeChange} />
            <a style={{color:'black'}}>结束日期:</a>
            <DatePicker      style={{ width: 150 }}  value={moment(endTime)} onChange={endTimeChange}  />
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
