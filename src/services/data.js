import request from 'umi-request';

  const url = 'http://101.201.33.155:8099';
 // const url = 'http://localhost:8099';


export async function findDataRecordList(params) {
  return request(`${url}/data/web/recordList`, {
    method: 'POST',
    data: params,
  });
}
