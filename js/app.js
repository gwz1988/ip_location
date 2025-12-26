// 替换为你的Cloudflare Worker地址
const API_BASE_URL = 'https://morning-unit-e130.2725546472067.workers.dev/';

// 页面元素
const elements = {
    ipInput: null,
    loading: null,
    error: null,
    ipInfo: null,
    searchBtn: null,
    myIpBtn: null
};

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    elements.ipInput = document.getElementById('ipInput');
    elements.loading = document.getElementById('loading');
    elements.error = document.getElementById('error');
    elements.ipInfo = document.getElementById('ipInfo');
    elements.searchBtn = document.getElementById('searchBtn');
    elements.myIpBtn = document.getElementById('myIpBtn');

    // 绑定事件
    elements.searchBtn.addEventListener('click', queryIP);
    elements.myIpBtn.addEventListener('click', queryMyIP);
    elements.ipInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') queryIP();
    });

    // 自动查询本机IP
    queryMyIP();
});

// 显示/隐藏加载状态
function showLoading() {
    elements.loading.style.display = 'block';
    elements.error.style.display = 'none';
    elements.ipInfo.style.display = 'none';
}
function hideLoading() {
    elements.loading.style.display = 'none';
}

// 显示错误信息
function showError(message) {
    elements.error.textContent = message;
    elements.error.style.display = 'block';
    elements.ipInfo.style.display = 'none';
}

// 验证IP格式（支持IPv4/IPv6）
function validateIP(ip) {
    // IPv4正则
    const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
    // IPv6正则（简化版，适配主流格式）
    const ipv6Regex = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/;

    // 先判断是IPv4还是IPv6
    if (ipv4Regex.test(ip)) {
        const parts = ip.split('.');
        return parts.every(part => {
            const num = parseInt(part, 10);
            return num >= 0 && num <= 255;
        });
    } else if (ipv6Regex.test(ip)) {
        return true; // IPv6格式通过正则即视为有效
    } else {
        return false;
    }
}

// 查询指定IP（IPv4/IPv6通用）
async function queryIP() {
    const ip = elements.ipInput.value.trim();
    if (!ip) {
        showError('⚠ 请输入IP地址（IPv4/IPv6均可）');
        return;
    }
    if (!validateIP(ip)) {
        showError('⚠ 请输入有效的IPv4或IPv6地址格式');
        return;
    }
    await fetchIPInfo(ip);
}

// 查询本机IP
async function queryMyIP() {
    await fetchIPInfo('');
}

// 获取IP信息（适配IPv6参数传递）
async function fetchIPInfo(ip) {
    showLoading();
    try {
        const url = ip ? `${API_BASE_URL}?ip=${encodeURIComponent(ip)}` : API_BASE_URL;
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`请求失败，状态码：${response.status}`);
        }

        const data = await response.json();
        hideLoading();
        renderIPInfo(data);
    } catch (error) {
        hideLoading();
        showError(`查询失败：${error.message}`);
        console.error('IP查询错误：', error);
    }
}

// 渲染IP信息（区分IPv4/IPv6）
function renderIPInfo(data) {
    // 判断IP类型
    const ipType = data.ip.includes(':') ? 'IPv6' : 'IPv4';
    elements.ipInfo.innerHTML = `
        <div class="ip-item"><strong>IP类型：</strong>${ipType}</div>
        <div class="ip-item"><strong>IP地址：</strong>${data.ip || '未知'}</div>
        <div class="ip-item"><strong>城市：</strong>${data.city || '未知'}</div>
        <div class="ip-item"><strong>地区：</strong>${data.region || data.state || '未知'}</div>
        <div class="ip-item"><strong>国家：</strong>${data.country || '未知'}</div>
        <div class="ip-item"><strong>经纬度：</strong>${data.loc || '未知'}</div>
        <div class="ip-item"><strong>运营商：</strong>${data.org || '未知'}</div>
        <div class="ip-item"><strong>时区：</strong>${data.timezone || '未知'}</div>
    `;
    elements.ipInfo.style.display = 'block';
}
