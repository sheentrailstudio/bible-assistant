//為GCP load balancer 健康檢查

class SystemController {
    healthCheck(req, res) {
        // 返回 HTTP 200 狀態碼，並帶上一個簡單的內容
        return res.status(200).send('OK');
    }
}

module.exports = new SystemController();