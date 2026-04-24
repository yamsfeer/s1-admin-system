import axios from 'axios';
import { ElMessage } from 'element-plus';
import { useUserStore } from '@/stores/user';

const request = axios.create({
  baseURL: '/api',
  timeout: 10000
});

// 请求拦截器：自动携带 Token
request.interceptors.request.use(
  (config) => {
    const userStore = useUserStore();
    if (userStore.token) {
      config.headers.Authorization = `Bearer ${userStore.token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器：统一处理错误
request.interceptors.response.use(
  (response) => {
    // Blob 响应直接返回，跳过 JSON 格式校验
    if (response.config.responseType === 'blob') {
      return response;
    }

    const res = response.data;
    if (res.code !== 0) {
      ElMessage.error(res.message || '请求失败');
      return Promise.reject(new Error(res.message || '请求失败'));
    }
    return res;
  },
  (error) => {
    const { response } = error;
    if (response) {
      if (response.status === 401) {
        ElMessage.error('登录已过期，请重新登录');
        const userStore = useUserStore();
        userStore.clearUser();
        window.location.href = '/login';
      } else if (response.status === 403) {
        ElMessage.error('无权限访问该资源');
      } else {
        ElMessage.error(response.data?.message || '服务器错误');
      }
    } else {
      ElMessage.error('网络错误，请检查网络连接');
    }
    return Promise.reject(error);
  }
);

export default request;
