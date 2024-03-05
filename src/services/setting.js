import request from 'umi-request';

// const url = 'http://101.201.33.155:8099';
  const url = 'http://localhost:8099';


export async function findSettingList(params) {
  return request(`${url}/setting/web/findSettingList`, {
    method: 'POST',
    data: params,
  });
}


export async function saveSetting(params) {
  return request(`${url}/setting/web/addSetting`, {
    method: 'POST',
    data: params,
  });
}


export async function updateSettingImp(params) {
  return request(`${url}/setting/web/updateSetting`, {
    method: 'POST',
    data: params,
  });
}


export async function delSettingImp(themId) {
  return request(`${url}/them/web/delThem/${themId}`, {
    method: 'POST',
  });
}


