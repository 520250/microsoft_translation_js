let microauth="mytoken"

// 返回有效的令牌或 false
async function refreshToken(token) {
    const decodedToken = parseJwt(token);
    const currentTimestamp = Math.floor(Date.now() / 1000); // 当前时间的UNIX时间戳（秒）
    // 如果令牌有效且未过期，则立即返回true
    if (decodedToken && currentTimestamp < decodedToken.exp) {
        return Promise.resolve(token);
    }
    // 如果令牌无效或已过期，则尝试获取新令牌
    try {
        const response = await fetch("https://edge.microsoft.com/translate/auth", { method: 'GET', redirect: 'follow' });
        if (!response.ok) return false;
        microauth=await response.text()
        return microauth;
    } catch (error) {
        console.error('请求 microsoft translation auth 发生错误: ', error);
        return false;
    }
}
// 解析 jwt，返回对象
function parseJwt(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    } catch (e) {
        return null;
    }
}

// 使用示例
refreshToken(microauth).then(result => {
    if (result) {
        console.log(result);
        myHeaders.set("authorization", jwttoken.replace("%s",microauth));
        microsoft_trans("hello world")
    } else {
        console.log("令牌获取失败")
    }
})

// microsoft translation request
let jwttoken="Bearer %s"
let myHeaders = new Headers();
myHeaders.append("Content-Type", "application/json");
// 输出：待翻译文本，输出：中文文本
function microsoft_trans(origin){
    let requestOptions = {method: 'POST',headers: myHeaders,body: JSON.stringify([{"Text":origin}]),redirect: 'follow'};
    fetch("https://api-edge.cognitive.microsofttranslator.com/translate?from=&to=zh&api-version=3.0&includeSentenceLength=true", requestOptions)
    .then(response => response.text())
    .then(result => console.log(result))
    .catch(error => console.log('error', error));
}