import * as mongo from 'mongodb';
import dns = require('dns');
import { Config } from '../config';
import { MONGOADDRESS_LEVERAGE, MONGOADDRESS, MONGOADDRESS_ALERTS } from '../apiqueryhelper';
const logger: any = require('./logger.service');


export async function getDBEntry(period: string): Promise<any> {
    try {
        const db: mongo.Db = await mongo.connect(Config.mongo.dash);
        if (db === null || db === undefined) {
            return null;
        }
        const col: mongo.Collection = await db.collection('current');
        const data: any = await col.findOne({ _id: period });
        db.close();
        if (data) {
            return data;
        } else {
            return null;
        }
    } catch (err) {
        logger.error('DB Error', err);
    }
}

export async function getAllActionableTicketsFromDB(): Promise<number> {
    const data: DB.Today = await getDBEntry('today');
    if (data) {
        return data.actionable;
    } else {
        return 0;
    }
}

export async function getAllAssignedTicketsFromDB(): Promise<{}> {
    const data: DB.Today = await getDBEntry('today');
    if (data) {
        return data.assignedTickets;
    } else {
        return null;
    }
}

export async function getAllAgedTicketsFromDB(): Promise<DB.TicketDetails[]> {
    const data: DB.Today = await getDBEntry('today');
    if (data) {
        return data.agedTickets;
    } else {
        return null;
    }
}

/** DEPRECATED */
export async function getAgedTicketsForDateRangeFromDB(range: number[]): Promise<DB.TicketDetails[]> {
    const data: DB.Today = await getDBEntry('today');
    if (data) {
        return data.agedTickets;
    } else {
        return null;
    }
}

export async function getClosedTicketsFromDB(period: string): Promise<number> {
    const data: any = await getDBEntry(period);
    if (data) {
        return data.ticketsClosed;
    } else {
        return 0;
    }
}

export async function getCreatedTicketsFromDB(period: string): Promise<number> {
    const data: any = await getDBEntry(period);
    if (data) {
        return data.ticketsCreated;
    } else {
        return 0;
    }
}

export async function getTimeEntriesFromDB(period: string): Promise<DB.TimeEntries> {
    const data: any = await getDBEntry(period);
    if (data) {
        return data.timeEntries;
    } else {
        return null;
    }
}

export async function getUpdatedTicketsFromDB() {
    const data: DB.Today = await getDBEntry('today');
    if (data) {
        return data.clientUpdated;
    } else {
        return null;
    }
}

export async function getTicketsInSLAFromDB(period: string): Promise<any> {
    const data: any = await getDBEntry(period);
    if (data) {
        if (period === 'today') {
            return data.slaBreach;
        } else {
            if (data.ticketsClosed !== 0) {
                let percentage = Math.round((data.ticketsClosedInSLA / data.ticketsClosed) * 100);
                return percentage;
            } else {
                return 100;
            }
        }
    } else {
        return 100;
    }

}

export async function getAllTicketPrioritiesFromDB(): Promise<any> {
    const data: DB.Today = await getDBEntry('today');
    if (data) {
        return data.priorities;
    } else {
        return null;
    }
}

export async function saveCompaniesToDB(companies: Company[]) {
    logger.info('Saving list of Companies To DB');
    let db: mongo.Db;
    try {
        db = await mongo.connect(MONGOADDRESS_LEVERAGE);
        const col: mongo.Collection = await db.collection('companies');
        col.remove({});
        const r: mongo.InsertWriteOpResult = await col.insertMany(companies);
        logger.info('Added ' + r.insertedCount + ' companies to DB');
        db.close();
    } catch (err) {
        logger.error('Error saving all companies to database', { function: 'SaveCompaniesToDB', source: 'companies.service', error: err });
        db.close();
        return null;
    }
}

export async function getAllCompaniesFromDB(): Promise<Company[]> {
    let db: mongo.Db;
    try {
        db = await mongo.connect(MONGOADDRESS_LEVERAGE);
        const col: mongo.Collection = await db.collection('companies');
        const allCompanies: Company[] = await col.find({}).toArray();
        db.close();
        return allCompanies;
    } catch (err) {
        logger.error('Error getting all companies from database', { function: 'getCompaniesFromDB', source: 'companies.service', error: err });
        db.close();
        return null;
    }
}

export async function getMonthDataFromDB(companyId: number, month: Date): Promise<MonthlyData> {
    logger.info('Getting month data From DB:', { companyID: companyId, month: month.toISOString() });
    let db: mongo.Db;
    try {
        db = await mongo.connect(MONGOADDRESS_LEVERAGE);
        const col = db.collection('month');

        const data: MonthlyData = await col.findOne({ companyId: companyId, date: month.toISOString() });
        db.close();
        if (data) {
            logger.info('No data in DB for companyID ' + companyId + ' and month: ' + month.toISOString());
            return data;
        } else {
            return null;
        }
    } catch (err) {
        logger.error('Error getting data from DB', { companyID: companyId, month: month.toISOString(), function: 'getMonthDataFromDB', source: 'companies.service', error: err });
        db.close();
        return null;
    }
}

export async function updateMonthDataInDB(data: MonthlyData): Promise<void> {
    logger.info('Updating DB with monthly data', { data: data });
    let db: mongo.Db;
    try {
        db = await mongo.connect(MONGOADDRESS_LEVERAGE);
        const r = await db.collection('month').insertOne(data);
        if (r.insertedCount === 1) {
            logger.log('Inserted data', { data: data });
        } else {
            logger.error('Error inserting data', {data: data})
        }
        db.close();
    } catch (err) {
        logger.error('Error inserting monthly data into database', { data: data, function: 'updateMonthDataInDB', source: 'data.service', error: err });
        db.close();
    }
}

export async function updateOpenTicketsInDB(jsonData: any): Promise<void> {
    logger.info('Updating DB with open ticket data', { data: jsonData.length });
    let db: mongo.Db;
    try {
        db = await mongo.connect(MONGOADDRESS);
        const col = db.collection('current');
        const r = await col.updateOne({ _id: 'openTickets' }, { tickets: jsonData }, { upsert: true });
        db.close();
        logger.info("Updated open tickets");
    } catch (err) {
        logger.error("Error updating open tickets", err);
    }
}

export async function getOpenTicketsFromDB(): Promise<any> {
    let db: mongo.Db;
    try {
        db = await mongo.connect(MONGOADDRESS);
        const col = db.collection('current');
        const tickets = await col.findOne({ _id: 'openTickets' });
        db.close();
        return tickets.tickets;
    } catch (err) {
        logger.error("Error getting open tickets", err);
        return null;
    }
}

export async function getAlertsFromDB(collection: string): Promise<any[]> {

    const db: mongo.Db = await mongo.connect(MONGOADDRESS_ALERTS);
    const col: mongo.Collection = await db.collection(collection);
    const entries: any[] = await col.find({}).toArray();
    db.close();
    if (entries.length > 0) {
        return entries;
    } else {
        return [];
    }
}

export async function deleteAlertFromDB(collection: string, id: string): Promise<any> {

    const db: mongo.Db = await mongo.connect(MONGOADDRESS_ALERTS);
    const col: mongo.Collection = await db.collection(collection);
    const deleteResult: mongo.FindAndModifyWriteOpResultObject = await col.findOneAndDelete({_id: new mongo.ObjectID(id)});
    db.close();
    if (deleteResult.value) {
        return deleteResult.value;
    } else {
        return null;
    }
}

export async function saveClosedAlertToDB(alert: any, ip: string): Promise<any> {
    const db: mongo.Db = await mongo.connect(MONGOADDRESS_ALERTS);
    const col: mongo.Collection = await db.collection('closed');
    const alertToSave = {
        type: 'Server',
        companyName: alert.companyName,
        siteOrComputerName: alert.computerName,
        closingComputer: '',
        timeStamp: new Date().getTime(),
    };
    logger.info('Saving Alert', alertToSave);
    // get the hostname of the computer that closed the alert
    dns.reverse(ip, async (err, hostnames) => {
        if (err) {
            throw err;
        }
        logger.info('Found hostnames:', hostnames);
        alertToSave.closingComputer = hostnames[0];
        const result: mongo.InsertOneWriteOpResult = await col.insertOne(alertToSave);
        db.close();
        if (result.insertedCount === 1) {
            return true;
        } else {
            return false;
        }
    });
}

export async function getClosedAlertsFromDB(): Promise<any[]> {
    const db: mongo.Db = await mongo.connect(MONGOADDRESS_ALERTS);
    const col: mongo.Collection = await db.collection('closed');
    const entries: any[] = await col.find({}).sort({timeStamp: - 1}).limit(10).toArray();
    db.close();
    if (entries.length > 0) {
        return entries;
    } else {
        return [];
    }
}
