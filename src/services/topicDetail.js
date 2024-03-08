import request from 'umi-request';

 const url = 'http://101.201.33.155:8099';
// const url = 'http://localhost:8099';

/**
 * 查询列表
 * @returns {Promise<void>}
 */
export async function findTopicDetailList(params) {
  return request(`${url}/topic/detail/web/findTopicDetailList`, {
    method: 'POST',
    data: params,
  });
}


/**
 * 新增话题
 * @returns {Promise<void>}
 */
export async function saveTopicDetail(params) {
  return request(`${url}/topic/detail/web/addTopic`, {
    method: 'POST',
    data: params,
  });
}


/**
 * 编辑话题
 * @returns {Promise<void>}
 */
export async function updateTopicDetailImp(params) {
  return request(`${url}/topic/detail/web/updateTopic`, {
    method: 'POST',
    data: params,
  });
}


/**
 * 删除话题
 * @returns {Promise<void>}
 */
export async function delTopicDetailImp(topicId) {
  return request(`${url}/topic/web/detail/delTopic/${topicId}`, {
    method: 'POST',
  });
}


/**
 * 批量导入话题
 * @returns {Promise<void>}
 */
export async function importTopicDetail(params) {
  return request(`${url}/topic/detail/import/file/`, {
    method: 'POST',
    data: params,
  });
}
