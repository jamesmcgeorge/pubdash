const router = require('express').Router();
import { getSingleTimeEntry } from './single';
import { getAllTimeEntries } from './all';

router.use('/:user_id', getSingleTimeEntry);
router.use('/', getAllTimeEntries);

export = router;
