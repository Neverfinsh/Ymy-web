import { Badge, Button, Calendar, Modal, Select, Space } from 'antd';
import React, { useEffect, useState } from 'react';
import moment from 'moment';
import { PlusOutlined } from '@ant-design/icons';
import { useForm } from 'antd/es/form/Form';
import { openNotification } from '@/utils/utils';
import { findDataRecordList } from '@/services/data';


const App = () => {


  const initCalendarData = () => {

    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    const allDatesOfMonth = [];
    for (let date = firstDayOfMonth; date <= lastDayOfMonth; date.setDate(date.getDate() + 1)) {
        allDatesOfMonth.push(new Date(date));
    }


    const userStr=localStorage.getItem("user");
    const user=JSON.parse(userStr);

    const myMap = new Map();
    // eslint-disable-next-line no-const-assign
    for(let i=0;i<allDatesOfMonth.length; i++){
      // eslint-disable-next-line no-shadow
      const firstDayOfMonth=allDatesOfMonth[i];
      const startOfDay = new Date(firstDayOfMonth.getFullYear(), firstDayOfMonth.getMonth(), firstDayOfMonth.getDate(), 0, 0, 0);
      const endOfDay = new Date(firstDayOfMonth.getFullYear(), firstDayOfMonth.getMonth(), firstDayOfMonth.getDate(), 23, 59, 59)

      const   param={}
      param.uid=user.userAccount
      param.deviceId='003'
      param.channel=null
      param.status=null
      param.startTime=moment(startOfDay).format('YYYY-MM-DD HH:mm:ss')
      param.endTime=moment(endOfDay).format('YYYY-MM-DD HH:mm:ss')

      findDataRecordList(param).then(res => {

        const mapKey=moment(firstDayOfMonth).format('YYYY-MM-DD HH:mm:ss')
        // console.log('============  firstDayOfMonth  ============' ,moment(firstDayOfMonth).format('YYYY-MM-DD HH:mm:ss'));
         const resArr=res.res
        const finish=resArr[0].finishedCount
        const unfinish=resArr[0].unfinishedCount

        const mapValue={}
              mapValue.finish=finish
              mapValue.unfinish=unfinish

       //  myMap.set(JSON.stringify(mapKey) , JSON.stringify(mapValue))
        myMap.set(mapKey , mapValue)

      }).catch((error) => {
        openNotification('error',`查询数据统计过列表失败！,原因:${error}`)
      });
    }



  };

  useEffect(() => {
    initCalendarData();
  }, []);


  const onDateSelect=(value)=>{
    const seletcData=moment(value).format('YYYY-MM-DD')
    console.log('select Date' ,moment(value).format('YYYY-MM-DD HH:mm:ss'));
    // eslint-disable-next-line no-use-before-define
    setIsModalOpen(true);
    // eslint-disable-next-line no-use-before-define
    setSelectDate(seletcData)
  }

  const getListData = (value) => {
    // console.log('----getListData----', moment(value).format('YYYY-MM-DD HH:mm:ss'));
     console.log('----getListData--value--', value.date());

    const valueDate=JSON.stringify(moment(value).format('YYYY-MM-DD'));
    console.log('----getListData--value222--', valueDate);

    let listData;
    switch (value.date()) {
      case 8:
        listData = [
          {
            type: 'warning',
            content: 'This is warning event.',
          },
          {
            type: 'success',
            content: 'This is usual event.',
          },
        ];
        break;
      case 10:
        listData = [
          {
            type: 'warning',
            content: 'This is warning event.',
          },
          {
            type: 'success',
            content: 'This is usual event.',
          },
        ];
        break;
      case 15:
        listData = [
          {
            type: 'warning',
            content: 'This is warning event',
          },
          {
            type: 'success',
            content: 'This is very long usual event。。....',
          },
        ];
        break;
      default:
    }
    return listData || [];
  };


// eslint-disable-next-line consistent-return
  const getMonthData = (value) => {
    if (value.month() === 8) {
      return 1394;
    }
  };


  const monthCellRender = (value) => {
    const num = getMonthData(value);
    return num ? (
      <div className='notes-month'>
        <section>{num}</section>
        <span>Backlog number</span>
      </div>
    ) : null;
  };


  const dateCellRender = (value) => {
    console.log('111111' ,);
    const listData = getListData(value);
    return (
      <ul className='events'>
        {listData.map((item) => (
          <li key={item.content}>
            <Badge status={item.type} text={item.content} style={{ paddingLeft: 6 }} />
          </li>
        ))}
      </ul>
    );
  };

  const [cellItem,setCellItem]=useState({
        dataValue:null,
        contentValue:null,
  })
  const [taskForm]=useForm();
  const [isModalOpen,setIsModalOpen]=useState(false);
  const [selectdDate,setSelectDate]=useState(null);
  const [selectContent,setSelectContent]=useState(null);

  const onModalOk=()=>{}
   return <>
            <Space>
              <Button    type= 'primary'  icon={<PlusOutlined />} >新增</Button>
              <a style={{ color: 'black' }}>选择设备:</a>
              <Select style={{ width: 170 }}>
                <Select.Option value='Linwu001'>Linwu001</Select.Option>
                <Select.Option value='Linwu001'>Linwu001</Select.Option>
                <Select.Option value='Linwu001'>Linwu001</Select.Option>
              </Select>
              <Button type='primary'>查询</Button>
            </Space>

            <Calendar
                dateCellRender={dateCellRender}
                monthCellRender={monthCellRender}
               style={{ marginTop: 20 }}
               onSelect={onDateSelect}
            />
            {/**/}
    <Modal
      title={`${selectdDate}查看具体的任务详情`}
      open={isModalOpen}
      onOk={onModalOk}
      onCancel={()=>{  setIsModalOpen(false)}}
      width='50%'
      style={{height:'500px'}}
      destroyOnClose
    >
      {/* <Form */}
      {/*  form={taskForm} */}
      {/*  name="basic" */}
      {/*  labelCol={{ span: 4 }} */}
      {/*  wrapperCol={{ span: 16 }} */}
      {/*  autoComplete="off" */}
      {/* > */}

      {/* </Form> */}
    </Modal>


  </>;
};

export default App;
