// 替换为你的Cloudflare Worker地址（替代原ipinfo.io）
const API_BASE_URL = 'https://morning-unit-e130.2725546472067.workers.dev/';

// 页面元素
const elements = {
    ipInput: null,
    loading: null,
    error: null,
    ipInfo: null,
    searchBtn: null
};

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    // 获取页面元素
    elements.ipInput = document.getElementById('ipInput');
    elements.loading = document.getElementById('loading');
    elements.error = document.getElementById('error');
    elements.ipInfo = document.getElementById('ipInfo');
    elements.searchBtn = document.getElementById('searchBtn');

    // 绑定搜索按钮点击事件（关键：原代码缺失此绑定）
    elements.searchBtn.addEventListener('click', queryIP);

    // 绑定回车键事件
    elements.ipInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            queryIP();
        }
    });

    // 自动查询当前IP
    queryMyIP();
});

// 显示加载状态
function showLoading() {
    elements.loading.style.display = 'block';
    elements.error.style.display = 'none';
    elements.ipInfo.style.display = 'none';
}

// 隐藏加载状态
function hideLoading() {
    elements.loading.style.display = 'none';
}

// 显示错误信息
function showError(message) {
    elements.error.textContent = message;
    elements.error.style.display = 'block';
    elements.ipInfo.style.display = 'none';
}

// 验证IP地址格式
function validateIP(ip) {
    const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (!ipRegex.test(ip)) {
        return false;
    }

    const parts = ip.split('.');
    return parts.every(part => {
        const num = parseInt(part, 10);
        return num >= 0 && num <= 255;
    });
}

// 查询IP地址
async function queryIP() {
    const ip = elements.ipInput.value.trim();

    if (!ip) {
        showError('⚠ 请输入IP地址');
        return;
    }

    if (!validateIP(ip)) {
        showError('⚠ 请输入有效的IP地址格式（如：8.8.8.8）');
        return;
    }

    await fetchIPInfo(ip);
}

// 查询当前用户的IP
async function queryMyIP() {
    await fetchIPInfo('');
}

// 获取IP信息（补全原代码缺失的fetch逻辑）
async function fetchIPInfo(ip) {
    showLoading();

    try {
        // 修复URL拼接：根据是否传IP拼接参数，适配Worker代理地址
        const url = ip ? `${API_BASE_URL}?ip=${ip}` : API_BASE_URL;
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`请求失败，状态码：${response.status}`);
        }

        const data = await response.json();
        hideLoading();
        renderIPInfo(data); // 渲染IP信息到页面
    } catch (error) {
        hideLoading();
        showError(`查询失败：${error.message}`);
        console.error('IP查询错误：', error);
    }
}

// 渲染IP信息到页面（新增：原代码缺失渲染逻辑）
function renderIPInfo(data) {
    elements.ipInfo.innerHTML = `
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
