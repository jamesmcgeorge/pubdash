import * as exp from 'express';
import { getTimeEntriesFromDB } from '../../services/database.service';

export async function getAllTimeEntries(req: exp.Request, res: exp.Response) {
    const timeEntries = await getTimeEntriesFromDB('today');
    res.status(200).json({ data: timeEntries });
}
