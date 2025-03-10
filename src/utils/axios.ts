import axios, { AxiosHeaders } from 'axios';
import jwtService from 'src/app/auth/services/jwtService';

const axiosInstance = axios.create({
  // baseURL: '',
  headers: {
    // 'x-custom-appId': "65dcf47e-2ec2-4d5a-85e6-fe6853ef09b9"
  }
});

axiosInstance.interceptors.request.use(
  async (request) => {
    let token = "";
    try {
      token = await jwtService.getAccessToken();
    } catch {
      token = "<Not Required>"
    };
    // @ts-ignore
    (request.headers as AxiosHeaders) = { ...request.headers, Authorization: `Bearer ${token}` }
    return request;
  },
  (error) =>
    Promise.reject(
      (error.response && error.response.data) || 'There is an error!'
    )
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    console.log(error)
    return Promise.reject(
      (error.response && error.response.data) || 'There is an error!'
    )
  }
);

export default axiosInstance;
