# 使用 AWS Lambda Node.js 基础镜像 支持16版本
FROM public.ecr.aws/lambda/nodejs:20

# 安装构建工具 关闭了证书
# 禁用 SSL 验证
RUN echo "sslverify=0" >> /etc/dnf/dnf.conf && \
    dnf install -y gcc-c++ make python3 python3-devel

# 设置 Python 环境变量 创建 python 的软链接
RUN ln -sf /usr/bin/python3 /usr/bin/python  

# 设置工作目录
WORKDIR /var/task

# 将代码复制到容器中
COPY . .

# 安装 Node.js 依赖
RUN npm i --verbose

# 告诉 Lambda 执行哪个文件
CMD ["index.handler"]