import request from 'umi-request';

// const url = 'http://101.201.33.155:8099';
 const url = 'http://localhost:8099';

/**
 * 查询列表
 * @returns {Promise<void>}
 */
export async function findTopicKeyList(params) {
  return request(`${url}/topicKey/web/findTopicList`, {
    method: 'POST',
    data: params,
  });
}


/**
 * 新增话题
 * @returns {Promise<void>}
 */
export async function saveTopic(params) {
  return request(`${url}/topicKey/web/addTopic`, {
    method: 'POST',
    data: params,
  });
}


/**
 * 编辑话题
 * @returns {Promise<void>}
 */
export async function updateTopicImp(params) {
  return request(`${url}/topicKey/web/updateTopic`, {
    method: 'POST',
    data: params,
  });
}


/**
 * 删除话题
 * @returns {Promise<void>}
 */
export async function delTopicImp(topicId) {
  return request(`${url}/topicKey/web/delTopic/${topicId}`, {
    method: 'POST',
  });
}


/**
 * 批量导入话题
 * @returns {Promise<void>}
 */
export async function importTopic(params) {
  return request(`${url}/topic/import/file/`, {
    method: 'POST',
    data: params,
  });
}
