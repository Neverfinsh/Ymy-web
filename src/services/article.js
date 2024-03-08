import request from 'umi-request';

const url = 'http://101.201.33.155:8099';

// const url = 'http://localhost:8099';
/**
 *  获取所有文章列表
 * @returns {Promise<void>}
 */
export async function findArticleList(params) {
  return request(`${url}/article/web/findArticleList`, {
    method: 'POST',
    data: params,
  });
}

export async function findArticleImgRelList(articleId) {
  return request(`${url}/article/web/findArticleImgRelList/${articleId}`, {
    method: 'Get',
  });
}



/**
 *  新增
 * @returns {Promise<void>}
 */
export async function adddArticle(params) {
  return request(`${url}/article/web/addArticle`, {
    method: 'POST',
    data: params,
  });
}




/**
 *  删除
 * @returns {Promise<void>}
 */
export async function delArticle(articleId) {
  return request(`${url}/article/web/delArticle/${articleId}`, {
    method: 'DELETE',
  });
}


/**
 *  编辑
 * @returns {Promise<void>}
 */
export async function updateArticleImpl(params) {
  return request(`${url}/article/web/updateArticle`, {
    method: 'POST',
    data: params,
  });
}
