const express = require('express');
const bodyParser = require('body-parser');
const vhost = require('vhost');
import path = require('path');
import { getTodaysData, getThisWeekData, getLastWeekData, getYesterdayData } from './services/data.service';
import { updateAllCompanies } from './db/leverage/companies.service';
const http = require('http');
const schedule = require('node-schedule');
const logger = require('./services/logger.service');

const api = require('./routes/api');

const dashapp = express(); 


logger.info('Making Server');

const allowCrossDomain = (req: any, res: any, next: any) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');

    next();
};
const portalApp = require('./vhost');
const dashHost = vhost('xx.xxx.xx', express.static(__dirname + '/client/dash'));
const testHost = vhost('xx.xxx.xx', express.static(__dirname + '/client2'));
const leverageReportHost = vhost('xx.xxx.xx', express.static(__dirname + '/client/leverage'));
const leaveFormHost = vhost('xx.xxx.xx', express.static(__dirname + '/client/leave'));
const portalHost = vhost('xx.xxx.xx', portalApp);

dashapp.use(dashHost);
dashapp.use(testHost);
dashapp.use(leverageReportHost);
dashapp.use(leaveFormHost);
dashapp.use(portalHost);
dashapp.use(bodyParser.json());
dashapp.use(express.static(__dirname + '/client'));
dashapp.use(allowCrossDomain);
dashapp.use('/api', api);

// catch 404 and forward to error handler
dashapp.use((req: any, res: any, next: any) => {
    const err = new Error('Not Found');
    err['status'] = 404;
    next(err);
});


const port = process.env.PORT || '80';
dashapp.set('port', port);
const server = http.createServer(dashapp);
server.listen(port, () => logger.info(`API running on localhost:${port}`));

const currentJob = schedule.scheduleJob('*/10 6-18 * * 0-6', getTodaysData);
const thisweekJob = schedule.scheduleJob('45 */4 * * 0-6', getThisWeekData);
const yesterdayJob = schedule.scheduleJob('30 1 * * 0-6', getYesterdayData);
const lastweekJob = schedule.scheduleJob('30 2 * * 0', getLastWeekData);
const updateCompanyJob = schedule.scheduleJob('40 3 1 * *', updateAllCompanies);
