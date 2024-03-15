import request from 'umi-request';

  const url = 'http://101.201.33.155:8099';
 // const url = 'http://localhost:8099';

/**
 * 查询列表
 * @returns {Promise<void>}
 */
export async function findThemList(params) {
  return request(`${url}/them/web/findThemList`, {
    method: 'POST',
    data: params,
  });
}


/**
 * 新增t主题
 * @returns {Promise<void>}
 */
export async function saveThem(params) {
  return request(`${url}/them/addThem`, {
    method: 'POST',
    data: params,
  });
}


/**
 * 编辑主题
 * @returns {Promise<void>}
 */
export async function updateThemImp(params) {
  return request(`${url}/them/web/updateThem`, {
    method: 'POST',
    data: params,
  });
}


/**
 * 删除主题
 * @returns {Promise<void>}
 */
export async function delThemImp(themId) {
  return request(`${url}/them/web/delThem/${themId}`, {
    method: 'POST',
  });
}


/**
 * 批量导入主题
 * @returns {Promise<void>}
 */
export async function importThem(params) {
  return request(`${url}/them/import/file/`, {
    method: 'POST',
    data: params,
  });
}
