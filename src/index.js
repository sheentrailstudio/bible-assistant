require('dotenv').config();
const express = require('express');
const cors =require('cors')
const router = require('./routes/index');
const qtPlanService = require('./services/qtPlanService')
const messageService = require('./services/messageService')
const { initializeSchedules } = require('./schedules/index');
const port = process.env.PORT || 8080;


async function startService() {

  console.time("preloadCache")
  await qtPlanService.preloadCache();
  console.timeEnd("preloadCache")

  console.time("activateNlpManager")
  await messageService;
  console.timeEnd("activateNlpManager")

  initializeSchedules();

  const app = express();
  // 允許特定來源
  app.use(cors({
    origin: ['*'],
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type','Accept','Access-Control-Allow-Origin']
  }));

  app.use(cors())
  app.use(express.json());
  app.use(
    express.urlencoded({
      extended: true,
    })
  );

  app.use("/", router)
  const server = app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });

  // 保存伺服器實例到全局變數
  global.server = server;
}

startService();