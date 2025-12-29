export const target_tauri = false;
export const target_gh = false;
export const api_proxy_addr = "http://10.184.28.240:8080";
export const dest_api = (target_tauri || target_gh) ? api_proxy_addr + "/api" : "/api";
export const dest_root = (target_tauri) ? "" : "/Carbonate_calculator"; // Или как у вас настроено