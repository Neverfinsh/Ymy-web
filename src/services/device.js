import request from 'umi-request';

   const url = 'http://101.201.33.155:8099';
//  const url = 'http://localhost:8099';
/**
 *  列表
 * @returns {Promise<void>}
 */
export async function findDeviceList(userAccount) {
  return request(`${url}/device/web/findDeviceByUser/${userAccount}`, {
    method: 'GET',
  });
}

/**
 *  新增
 * @returns {Promise<void>}
 */
export async function addDeviceImp(params) {
  return request(`${url}/device/web/addDevice`, {
    method: 'POST',
    data: params,
  });
}

/**
 *  删除
 * @returns {Promise<void>}
 */

export async function delDevice(deviceId) {
  return request(`${url}/device/web/delDevice/${deviceId}`, {
    method: 'Get',
  });
}


/**
 *
 * @returns {Promise<void>}
 */

export async function userLogin(param) {
  return request(`${url}/user/web/login`, {
    method: 'POST',
    data: param,
  });
}
