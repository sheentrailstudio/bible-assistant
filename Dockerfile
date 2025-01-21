# 使用 Node.js 作為基礎映像
FROM node:18

#使用GCP SECRET_MANAGER 的變數
ENV LINEBOARDCAST=$LINEBOARDCAST
ENV LINEREPLY=$LINEREPLY
ENV LINEBOTTOKEN=$LINEBOTTOKEN
ENV CLIENTID=$CLIENTID
ENV CLIENTSECRET=$CLIENTSECRET

# 設定工作目錄
WORKDIR /app

# 複製 package.json 和 package-lock.json
COPY package*.json ./

# 安裝相依套件
RUN npm install

# 複製應用程式檔案
COPY . .

# Dockerfile

# 設定預設監聽端口
ENV PORT 8080

# 讓 Docker 知道需要暴露的端口
EXPOSE 8080


# 設定啟動命令，執行主任務
CMD ["node", "src/index.js"]