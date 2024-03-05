import React, { useEffect, useState } from 'react';
import { PlusOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import { Button, Card, Modal, Select, Space, Upload } from 'antd';
import axios from "axios";
import { findDeviceList } from '@/services/device';
import { openNotification } from '@/utils/utils';
import { findSettingList } from '@/services/setting';
import { updateArticleImpl } from '@/services/article';

const getBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });


const imgManage = (url, config) => {

  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [previewTitle, setPreviewTitle] = useState('');
  // 初始化设备
  const [deviceOption,setDeviceOption]=useState([]);
  const[optionValue,setOptionValue]=useState();



  const [fileList, setFileList] = useState([]);

  useEffect(()=>{
    setFileList(fileList)
  },[fileList])


  const initImgList=()=>{
    // 用户的名称
    const  accountStr=localStorage.getItem("user")
    const  accountObj=JSON.parse(accountStr);
    const  {userAccount} = accountObj

    const param={}
          param.module="ImgModule"
       //   param.deviceId=optionValue
          param.deviceId='LIWU004'
          param.accountId=userAccount
          param.groupCodeId='005'
    console.log('----图片列表请求参数param----' ,param);
    axios.post('http://101.201.33.155:8099/image/web/imageList', param, {
      headers: {'Content-Type': 'application/json'},
    }).then((response) => {
      const {data:{res}} = response
      const fileListArr=[]
      for(let i=0;i<res.length;i+=1){
           const fileItem={}
                 fileItem.uid=res[i].id
                 fileItem.name=res[i].name
                 fileItem.status= 'done'
                 fileItem.url=res[i].absolutelyPath
        fileListArr.push(fileItem)
      }
      setFileList(fileListArr)

      console.log('-----res---',res)
    })
      .catch((error) => {
        console.error('文件上传失败', error);
      });

    // findSettingList(param).then((res)=>{
    //   console.log('res' ,res);
    //   // setFileList
    //
    // }).catch((error)=>{
    //   console.log('error' ,error);
    // })


  }



  useEffect(()=>{
    initImgList()
  },[])


  const handleCancel = () => setPreviewOpen(false);

  const handlePreview = async (file) => {
    if (!file.url && !file.preview) {
       file.preview = await getBase64(file.originFileObj);
    }
    setPreviewImage(file.url || file.preview);
    setPreviewOpen(true);
    setPreviewTitle(file.name || file.url.substring(file.url.lastIndexOf('/') + 1));
  };

  const handleChange = ({ fileList: newFileList }) => {
    setFileList(newFileList)
  };


  const handleUploadChange = (options) => {
    // 获取参数
    const deviceId=optionValue

    const  accountStr=localStorage.getItem("user")
    const  accountObj=JSON.parse(accountStr);
    const  {userAccount} = accountObj

    console.log('111111111点击了---' ,);

    // 上传图片风格
    const {file, onSuccess, onError} = options;
    const formData = new FormData();
    formData.append('files', file);
    formData.append('deviceId',  'LIWU004');
    formData.append('accountId', '15084762140');
    formData.append('groupCodeId', '005');

    axios.post('http://101.201.33.155:8099/image/web/uploadImg', formData, {
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


  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    initDviceOption()
  }, []);

  useEffect(()=>{
    setOptionValue(optionValue)
  },[optionValue])


  const onOptionChange=(value)=>{
       setOptionValue(value);
  }

  const onRemove=(file)=>{
    console.log('删除111' ,file.uid);

    axios.delete(`http://localhost:8099/image/web/delImg/${file.uid}`, {
      headers: {'Content-Type': 'application/json'},
    }).then((response) => {
      console.log(response)
    })
  }

  return (
    <>
        <Space  style={{ marginBottom: 16}}>
          <Button type='primary' icon={<PlusOutlined />} >新增图片风格</Button>
          <a style={{color:'black'}}>当前类型:</a>
          <Select
            style={{ width: 150 }}
            options={[
              {
                "label":"美女",
                "value":1,
              }
            ]}
          />
          {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
          <label>设备编号:</label>
          <Select
            defaultValue="all"
            style={{ width: 150 }}
            options={deviceOption}
            onChange={onOptionChange}
          />

          <Button    type= 'primary'  icon={<SearchOutlined/>}   >查询</Button>
          <Button type='primary' icon={<ReloadOutlined />} >刷新</Button>
      </Space>

      <Card style={{width:'98%' }}>
        <Upload
          customRequest={handleUploadChange}
          listType="picture-card"
          fileList={fileList}
          multiple
          onPreview={handlePreview}
          onChange={handleChange}
          onRemove={onRemove}
        >
          上传图片
        </Upload>
      </Card>


      <Modal open={previewOpen} title={previewTitle} footer={null} onCancel={handleCancel}>
        <img
          alt="example"
          style={{
            width: '100%',
          }}
          src={previewImage}
        />
      </Modal>
    </>
  );
};
export default imgManage;
