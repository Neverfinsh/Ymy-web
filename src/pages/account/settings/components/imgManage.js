import React, { useEffect, useState } from 'react';
import { PlusOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import { Button, Card, Modal, Select, Space, Upload } from 'antd';
import axios from 'axios';
import { findDeviceList } from '@/services/device';
import { openNotification } from '@/utils/utils';

const getBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });


const imgManage = () => {

  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [previewTitle, setPreviewTitle] = useState('');
  // 初始化设备
  const [deviceOption,setDeviceOption]=useState([]);
  const[optionValue,setOptionValue]=useState(null);
  const [fileList, setFileList] = useState([]);
 // const [moduleOptions,setModuleOptions]=useState([]);
 // const [imageModuleType,setImageModuleType]=useState();


  // eslint-disable-next-line react-hooks/rules-of-hooks
  // useEffect(()=>{
  //   initImgList()
  //   initImgCodeType()
  // },[])

  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(()=>{
    setFileList(fileList)
  },[fileList])



  // const  initImgCodeType =()=>{
  //   const userStr=localStorage.getItem("user");
  //   const user=JSON.parse(userStr);
  //   const param={}
  //   param.module="_IMG_MODULE"
  //   param.deviceId=null
  //   param.accountId=user.userAccount
  //   findSettingList(param).then(result=>{
  //     const {res}=result
  //     const dataOptions=[];
  //     for(const item of res){
  //       const obj={}
  //             obj.label=item.code
  //             obj.value=item.name
  //       dataOptions.push(obj)
  //     }
  //     const uniqueArr = dataOptions.filter((obj, index, self) =>
  //       index === self.findIndex((t) => (
  //         t.label === obj.label && t.value === obj.value
  //       ))
  //     );
  //     setModuleOptions(uniqueArr)
  //   }).catch(err=>{
  //     console.log(' 发生错误' ,err);
  //   })
  // }

  const initImgList=()=>{
    if(optionValue===null){
       openNotification('warn',`请先选择具体的设备`)
       document.getElementById('optionId').focus();
       return
    }
    const  accountStr=localStorage.getItem("user")
    const  accountObj=JSON.parse(accountStr);
    const  {userAccount} = accountObj
    const param={}
          param.deviceId=optionValue
          param.accountId=userAccount
          // param.groupCodeId='_IMG_MODULE'
          param.groupCodeId=optionValue
    axios.post('http://101.201.33.155:8099/image/web/imageList', param, { headers: {'Content-Type': 'application/json'}})
      .then((response) => {
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
    })
      .catch((error) => {
        console.error('文件上传失败', error);
      });
  }




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

    if(optionValue===null){
      openNotification('warn',`图片上传前,请先选择具体的设备`)
      document.getElementById('optionId').focus();
      return
    }

    // 获取参数
    const userStr=localStorage.getItem("user");
    const user=JSON.parse(userStr);
    // 上传图片风格
    const {file, onSuccess, onError} = options;
    const formData = new FormData();
    formData.append('files', file);
    formData.append('deviceId',    optionValue);
    formData.append('accountId',   user.userAccount);
    formData.append('groupCodeId', optionValue);

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
    // const   defaultObj={}
    //         defaultObj.value='all'
    //         defaultObj.label='------全部------'
    //         options.push(defaultObj)

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
    axios.delete(`http://localhost:8099/image/web/delImg/${file.uid}`, {
      headers: {'Content-Type': 'application/json'},
    }).then((response) => {
      console.log(response)
    })
  }

  // const beforeUploadEvent=()=>{
  //   console.log('调用之前的代码' ,);
  //   return false
  // }

  return (
    <>
        <Space  style={{ marginBottom: 16}}>
          <label>设备编号:</label>
          <Select
            style={{ width: 150 }}
            options={deviceOption}
            onChange={onOptionChange}
            id="optionId"
          />
          <Button    type= 'primary'  icon={<SearchOutlined/>} onClick={initImgList}  >查询</Button>
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
        //  beforeUpload={beforeUploadEvent}
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
