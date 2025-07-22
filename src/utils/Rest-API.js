import axios from 'axios';
import config from '../../constants';
import Cookies from 'js-cookie';
const trustedOrigins = ['http://192.168.1.50:3000', "http://192.168.1.10:3000","http://192.168.1.9:3000", "http://192.168.5.143:3000", "http://192.168.5.144:3000", "http://192.168.5.145:3000"];
const getCorsHeaders = (origin) => {
  if (trustedOrigins.includes(origin)) {
    return { 'Access-Control-Allow-Origin': origin };
  }
  return {};
};
export const api = async (endpoint, data, type, token, isPrint = false, ip) => {
  let mainUrl = config.BaseUrl + '/api/v1';
  if (isPrint && isPrint === true) {
    mainUrl = `http://${ip}:4000/api/v1`;
  }
  let res;
  let tokendata;
  const storedData = Cookies.get('token');
  if (token && storedData) {
    tokendata = storedData;
  }
  try {
    const origin = window.location.origin;
    const corsHeaders = getCorsHeaders(origin);
    const headers = {
      'Content-Type': type === 'upload' ? 'multipart/form-data' : 'application/json',
      authorization: tokendata ? `${tokendata}` : undefined,
      ...corsHeaders,
    };
    switch (type) {
      case 'post':
        res = await axios.post(mainUrl + endpoint, data, { headers });
        break;
      case 'upload':
        res = await axios.post(mainUrl + endpoint, data, { headers });
        break;
      case 'get':
        res = await axios.get(mainUrl + endpoint, { headers });
        break;
      case 'put':
        res = await axios.put(mainUrl + endpoint, data, { headers });
        break;
      case 'delete':
        res = await axios.delete(mainUrl + endpoint, {
          headers,
          data: data,
        });
        break;
      case 'patch':
        res = await axios.patch(mainUrl + endpoint, data, { headers });
        break;
      default:
        return true;
    }
  } catch (err) {
    if (err.response) {
      if ([400, 401, 403, 503].includes(err.response.status)) {
        res = err.response;
      }
    }
  }
  return res;
};
export const checkData = () => {
  return true;
};
