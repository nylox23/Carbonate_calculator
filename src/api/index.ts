import { Api } from './Api';
import { api_proxy_addr, target_tauri, target_gh } from '../target_config';

const baseUrl = (target_tauri || target_gh) ? api_proxy_addr : "/";

export const api = new Api({
    baseURL: baseUrl,
});

api.instance.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});