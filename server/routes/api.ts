const express = require('express');
const router = express.Router();
const createdTickets = require('./created/index');
const closedTickets = require('./closed/index');
const time = require('./time/index');
const agedTickets = require('./aged/index');
const priority = require('./priority/index');
const worked = require('./worked/index');
const updated = require('./updated/index');
const assigned = require('./assigned/index');
const actionable = require('./actionable/index');
const sla = require('./sla/index');
const alerts = require('./alerts/index');

const leverage = require('./leverage/index');

const leave = require('./leave/index');

router.get('/', (req: any, res: any) => {
    res.send('API works!');
});

router.use('/created', createdTickets);
router.use('/closed', closedTickets);
router.use('/time', time);
router.use('/aged', agedTickets);
router.use('/priority', priority);
router.use('/worked', worked);
router.use('/updated', updated);
router.use('/assigned', assigned);
router.use('/actionable', actionable);
router.use('/sla', sla);
router.use('/leverage', leverage);
router.use('/leave', leave);
router.use('/alerts', alerts);


module.exports = router;
