const koffi = require('koffi');
const crypto = require('crypto');
const fs = require('fs');
let sdkInitialized = false; // 用于标记 SDK 是否初始化
test()
// 封装结构体定义的函数
function defineStructures() {
    if (!sdkInitialized) {
        koffi.struct('WeWorkFinanceSdk_t', { placeholder: 'int' });
        koffi.struct('Slice_t', {
            buf: 'char *',
            len: 'int'
        });
        sdkInitialized = true; // 标记为已初始化
    }
}

function test() {
    // try {
    const libPath = __dirname + '/C_sdk/libWeWorkFinanceSdk_C.so';
    console.log("path  " + libPath);
    const privateKeyPath = __dirname + '/C_sdk/private.pem';
    
    defineStructures();
    // 加载动态库
    const weworkFinanceSdk = koffi.load(libPath);
    const NewSdk = weworkFinanceSdk.func('WeWorkFinanceSdk_t* NewSdk()');
    const Init = weworkFinanceSdk.func('int Init(WeWorkFinanceSdk_t*, const char*, const char*)');
    const GetChatData = weworkFinanceSdk.func('int GetChatData(WeWorkFinanceSdk_t*, unsigned long long, unsigned int, const char*, const char*, int, Slice_t*)');
    const NewSlice = weworkFinanceSdk.func('Slice_t* NewSlice()');
    const DecryptData = weworkFinanceSdk.func('int DecryptData(const char*, const char*, Slice_t*)');
    const DestroySdk = weworkFinanceSdk.func('void DestroySdk(WeWorkFinanceSdk_t*)');
    const GetContentFromSlice = weworkFinanceSdk.func('char* GetContentFromSlice(Slice_t*)');

    const sdk = NewSdk();
    // 应用ID和企业私钥
    const corpid = 'wx0111f7a9ee0bb512';
    const secret = 'BAfN0xiP84bvG3AWbOyKZk1LG7ZBSZn6eF0fg58y-SY';
    // console.log('sdk' +JSON.stringify(sdk));
    // 初始化 SDK
    const initResult = Init(sdk, corpid, secret);
    console.log('SDK初始化成功' + initResult);
    if (initResult === 0) {
        console.log('SDK初始化成功');
        // 拉取会话内容 (chatData 是从API获取的聊天数据)
        const seq = Number(0); // 从哪里开始拉取
        const timeout = Number(100);
        const limit = Number(100); // 每次拉取的条数
        const proxy = ""; // 如果需要代理，设置代理IP
        const passwd = ""; // 如果需要代理，设置代理密码
        // 获取聊天数据
        const chatData = NewSlice();
        const chatResult = GetChatData(sdk, 0, 1000, null, null, 10, chatData);
        console.log('chatResult:', chatResult);
        console.log('chatData:', chatData);
        if (chatResult === 0) {
            console.log('拉取会话内容成功');
        } else {
            console.error('拉取会话内容失败');
        }
        // 解析 chatData 指针
        // const data = GetContentFromSlice(chatData)
        // console.log('dataParse长度' + data);

        // const dataParse = JSON.parse(data);
        // // 查看 slice 的内容
        // console.log('dataParse长度' + dataParse.chatdata.length);
        const decryptDatas = [];
        const decryptDatasErr = [];
        // //需首先对每条消息的encrypt_random_key内容进行base64 decode,得到字符串str1
        // for (const info of dataParse.chatdata) {
        //     // a) Base64 decode 得到字符串 str1
        //     // str1 现在是一个 Buffer
        //     const str1 = Buffer.from(info.encrypt_random_key, 'base64');
        //     // console.log("str1  : " + str1)
        //     // b) 使用私钥和 RSA PKCS1 填充算法对 str1 解密，得到 str2
        //     const str2 = crypto.privateDecrypt(
        //         {
        //             key: privateKey,
        //             padding: crypto.constants.RSA_PKCS1_PADDING  // 使用 PKCS1 填充方式
        //         },
        //         str1  // 传入解码后的 buffer
        //     );
        const msg = NewSlice();
        let msgchat = "W1j0AcY5Ns0G/8UehoR1LMszd62mzv2fJnVLeXUezE2KEiOrNvlSb4CXEsuPFQ7On+bmRoimgtcJri/OqveLaxg4mbubQaEmwScYyC0sC/OmfaSOUA3y82XVMzojQbKRSzrL3X+Bdbb3IrW/9B6VnntDyfjI3zaiOI2seV6RzYAj+Fj92xJbWSHvdKuTp/JGqBrX3dHhBnBHkgDw/05NzTRaYBQ7tGHh7bAc9G9j4MxS33yUMXig11uQpPlG02ZCZv9uWt+1OF+9Pc/azSnhFeyiJ9TRQJAJ5AV9LADnSAaktC+maoer1LAKyIXo6sreO/Igsw9xFJbxduOWRh6PDFipqsu9tsjhzXHa9OOeEzX0s6ZedIXOISPzRaKYI2lV7HhG8eQ5mC0CrhXkQavUQTB5L/iJkzRKsuWsEhjVl3kL+2ToZa+OmFzn6XXw9fknzNx27oVndLrQzZt+kx8wPQ==LdkuJlgz7"
        let str = "7g/AYZqorQe/alCGS4hskKUV4tUX85rirRjEMk5Zo7uBZrH3a+Gc+poIN2jzoZkJAZsdQywI22+hh1Kr+L/SXw==";
        const ret = DecryptData(str, msgchat, msg);
        console.log("ret : " + ret)
        if (ret === 0) {
            const wechatMsgData = GetContentFromSlice(msg)
            decryptDatas.push(JSON.parse(wechatMsgData))
        } else {
            decryptDatasErr.push(ret)

        }
        // }
        // console.log("最后解析出得内容" + JSON.stringify(decryptDatas))
        if (decryptDatasErr.length) {
            console.log("最后解析失败" + JSON.stringify(decryptDatasErr))
        }
        // 销毁SDK
        DestroySdk(sdk);
        return {
            statusCode: 200,
            msg: "解析成功",
            body: decryptDatas,
        };
    } else {
        console.error('SDK初始化失败');
        return {
            statusCode: 500,
            msg: "SDK初始化失败",
        };
    }

    // } catch (error) {
    //     console.error(`错误信息：${error}`);
    //     return {
    //         statusCode: 500,
    //         body: JSON.stringify(`错误信息：${error}`),
    //     };
    // }
};
