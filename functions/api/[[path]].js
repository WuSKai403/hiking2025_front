// functions/api/[[path]].js

/**
 * Cloudflare Pages 函式，用於代理 API 請求
 * @param {EventContext<any, string, any>} context
 */
export async function onRequest(context) {
  // 從 context 中獲取請求和參數
  const { request, params, env } = context;

  // 重建請求路徑
  // params.path 是一個陣列，包含了 [[path]] 捕捉到的所有路徑片段
  const path = params.path.join('/');

  // 從環境變數中讀取 API URL，如果不存在則使用預設值
  const apiUrl = env.API_URL || 'https://api.hikingweatherguide.com';

  // 目標後端 API 的 URL
  const destinationURL = `${apiUrl}/api/${path}`;

  // 建立一個新的請求物件，將原始請求的方法、標頭、內文都轉發過去
  const apiRequest = new Request(destinationURL, request);

  // 發送到真正的後端 API
  const apiResponse = await fetch(apiRequest);

  // 複製 API 的回應，以便我們修改標頭
  const response = new Response(apiResponse.body, apiResponse);

  // 加上 CORS 標頭，允許前端存取
  response.headers.set('Access-Control-Allow-Origin', 'https://hikingweatherguide.com');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  return response;
}
