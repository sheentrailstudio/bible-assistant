require('dotenv').config();
const express = require('express');
const router = require('./routes/index');
const qtPlanService  = require('./services/qtPlanService')
const messageService  = require('./services/messageService')
const { initializeSchedules } = require('./schedules/index');
const port = process.env.PORT || 8080;


async function startService() {

  console.time("preloadCache")
  await qtPlanService.preloadCache();
  console.timeEnd("preloadCache")

  console.time("activateNlpManager")
  await messageService.train();
  console.timeEnd("activateNlpManager")

  initializeSchedules();

  const app = express();
  app.use(express.json());
  app.use(
    express.urlencoded({
      extended: true,
    })
  );

  app.use("/", router)
  app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });
}

startService();