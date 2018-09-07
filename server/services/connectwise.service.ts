import cwr = require('connectwise-rest');
import { getTimeSpan } from '../apiqueryhelper';
import { updateOpenTicketsInDB } from './database.service';
import { parseEntry, getUniqueTime } from './data.service';
const logger = require('./logger.service');
    
export const cw = new cwr({
    companyId: 'xxx',
    companyUrl: 'xx.xxx.xx',
    debug: false, // optional, enable debug logging 
    publicKey: 'xxxxxxxxxxx',
    privateKey: 'xxxxxxxxxxx',
    entryPoint: 'v4_6_release', // optional, defaults to 'v4_6_release'       
    retry: false,               // optional, defaults to false 
    retryOptions: {             // optional, override retry behavior, defaults as shown 
        maxTimeout: 20000,        // maximum number of ms between retries 
        minTimeout: 50,           // number of ms to wait between retries 
        randomize: true,          // randomize timeouts 
        retries: 4,               // maximum number of retries 
    },
    timeout: 200000,   // optional, request connection timeout in ms, defaults to 20000                    
});

export async function getAllCompaniesFromCW() {
    const params = {
        conditions: 'type/id=1 and status/id=1 and deletedFlag=false',
        pageSize: 100,
        fields: 'id,name',
    };
    const companies: Company[] = await cw.CompanyAPI.Companies.getCompanies(params);
    return companies;
}

export async function getAgreementsFromCW(companyId: number) {
    const params = {
        conditions: 'company/id=' + companyId + ' and parentAgreementId=null and cancelledFlag=false and endDate=null',
        pageSize: 100,
        fields: 'id,name,company',
    };
    const agreements: Agreement[] = await cw.FinanceAPI.Agreements.getAgreements(params);
    return agreements;
}

export async function getAdditionsFromCW(agreementID: number) {
    const params = {
        conditions: 'cancelledDate=null',
        pageSize: 100,
        fields: 'id,product,quantity',
    };
    const additions = await cw.FinanceAPI.Additions.getAdditions(agreementID, params);
    const arrOut: Addition[] = [];
    for (const add of additions) {
        arrOut.push({
            id: add.id,
            productID: add.product.identifier,
            quantity: add.quantity,
        });
    }
    return arrOut;
}

export async function getMonthDataFromCW(companyId: number, month: Date) {
    const invoices = await getMonthInvoiceDataFromCW(companyId, month);
    if (invoices === null) { return null; }
    const ticketInfo = await getMonthTicketDataFromCW(companyId, month);
    const monthData: MonthlyData = {
        companyId: companyId,
        date: month.toISOString(),
        invoices: invoices,
        tickets: ticketInfo.tickets,
        hours: ticketInfo.hours,
    };
    return monthData;
}

export async function getMonthInvoiceDataFromCW(companyId: number, month: Date): Promise<any> {
    logger.info('Getting month invoice data from CW:', { companyID: companyId, month: month.toISOString() });
    const params = {
        conditions: 'company/id=' + companyId + ' and date=[' + month.toISOString() + ']',
        pageSize: 100,
        fields: 'id,invoiceNumber,productTotal,applyToId,type',
    };
    try {
        const invoices = await cw.API.api('/finance/invoices', 'GET', params);
        const arr = [];
        for (const invoice of invoices) {
            arr.push({
                id: invoice.id,
                type: invoice.type,
                agreementID: invoice.applyToId,
                productTotal: invoice.productTotal,
                invoiceNumber: invoice.invoiceNumber,
            });
        }
        return arr;
    } catch (err) {
        console.log(err);
    }
    
}

export async function getMonthTicketDataFromCW(companyId: number, month: Date): Promise<any> {
    logger.info('Getting month ticket data from CW:', { companyID: companyId, month: month.toISOString() });
    const params = {
        conditions: 'company/id=' + companyId + ' and dateEntered > [' + month.toISOString() + '] and dateEntered < [' + (addMonths(new Date(month), 1)).toISOString() + '] and board/name="Support"',
        pageSize: 1000,
        fields: 'id,company,actualHours,summary',
    };

    const tickets = await cw.ServiceDeskAPI.Tickets.getTickets(params);
    let count = 0;
    let time = 0;
    logger.info('Total tickets: ' + tickets.length);
    for (const ticket of tickets) {
        count += 1;
        if (ticket.actualHours) {
            time += ticket.actualHours;
        }
    }
    logger.info('Total Time: ' + time);
    return { tickets: count, hours: time};
}

function addMonths(date: Date, months: number): Date {
    const d = date.getUTCDate();
    date.setUTCMonth(date.getUTCMonth() + months);
    if (date.getUTCDate() !== d) {
        date.setUTCDate(1);
    }
    return date;
}

export async function getAgedTickets() {
    let date = new Date(new Date().getTime() - (7 * 86400000));
    const params = {
        conditions: 'board/name="Support" and closedFlag=false and status/name!="Completed" and dateEntered<=[' + date.toISOString() + ']',
        pageSize: 1000,
        fields: 'id,summary,resources,type,company,dateEntered',
    };
    const tickets = await cw.ServiceDeskAPI.Tickets.getTickets(params);
    const agedPackages: TicketPackage[] = [];
    for (const ticket of tickets) {
        let agedPackage: TicketPackage = {
            id: ticket.id,
            summary: ticket.summary,
            resources: ticket.resources,
            type: ticket.type.name,
            company: ticket.company.name,
            dateEntered: ticket.dateEntered,
        }
        agedPackages.push(agedPackage);
    }
    return agedPackages;
}

export async function getOpenTickets() {
    const params = {
        conditions: 'board/name!="Alerts" and board/name!="Backups" and board/name!="Office%20Admin" and closedFlag=false and status/name!="Completed"',
        pageSize: 1000,
        fields: 'id,board,summary,status,resources,priority,type,company,dateEntered',
    };
    const tickets = await cw.ServiceDeskAPI.Tickets.getTickets(params);
    await updateOpenTicketsInDB(tickets);
}

export async function getCreatedTickets(timeSpan: any) {
    if (timeSpan == null) {
        logger.error("Timespan not provided correctly: " + timeSpan);
        // callback("ERROR", "TimeSpan is null")
        return null;
    }
    console.log('Getting Created Tickets');
    let tnt = getTimeSpan(timeSpan);
    const params = {
        conditions: 'board/name="Support" and dateEntered>' + tnt[0] + ' and dateEntered<' + tnt[1],
        pageSize: 1000,
        fields: 'id',
    };
    const tickets = await cw.ServiceDeskAPI.Tickets.getTickets(params);
    console.log('Got Created Tickets');
    return tickets.length;    
}

export async function getClosedTickets(timeSpan: any) {
    if (timeSpan == null) {
        logger.error("Timespan not provided correctly: " + timeSpan);
        return null;
    }
    console.log('Getting Closed Tickets');
    let tnt = getTimeSpan(timeSpan);
    const params = {
        conditions: 'board/name="Support" and closedDate>' + tnt[0] + ' and closedDate<' + tnt[1],
        pageSize: 1000,
        fields: 'id',
    };
    const tickets = await cw.ServiceDeskAPI.Tickets.getTickets(params);
    console.log('Got Closed Tickets');
    return tickets.length;
}

export async function getTechNames(){
    const params = {
        conditions: 'licenseClass="F"',
        pageSize: 1000,
        fields: 'firstName',
    };
    const members = await cw.SystemAPI.Members.getMembers(params);
    const arrOut = [];
    for (const mem of members) {
        arrOut.push(mem.firstName);
    }
    return arrOut;
}

export async function getTechTimeEntryData(timeSpan: any, techName: string) {
    console.log('Getting Tech Data: ', techName);
    let tnt = getTimeSpan(timeSpan);
    const params = {
        conditions: 'enteredBy="' + techName + '" and dateEntered>' + tnt[0] + ' and dateEntered<' + tnt[1],
        pageSize: 1000,
        fields: 'id,timeStart,timeEnd,actualHours,dateEntered,chargeToId,chargeToType',
    };
    let entriesFromCW;
    try {
        entriesFromCW = await cw.TimeAPI.TimeEntries.getTimeEntries(params);
    } catch (err) {
        logger.error('Unable to get TimeEntries: ' + techName, err);
        return null;
    }
    let total = 0;
    const ticketArray: any[] = [];
    const tickets: any[] = [];
    const entries: any[] = [];

    for (const entry of entriesFromCW) {
        const timeEntered = parseEntry(timeSpan, entry);
        total += timeEntered;
        if (timeEntered === 0) {
            entries.push({ id: entry.id, timeStart: entry.timeStart, timeEnd: entry.timeEnd, actualHours: entry.actualHours, dateEntered: entry.dateEntered, chargeToId: entry.chargeToId, isSameTimeFrame: false  });
        } else {
            entries.push({ id: entry.id, timeStart: entry.timeStart, timeEnd: entry.timeEnd, actualHours: entry.actualHours, dateEntered: entry.dateEntered, chargeToId: entry.chargeToId, isSameTimeFrame: true });
        }
        if (timeEntered == 0 || ~ticketArray.indexOf(entry.chargeToId)) {
            // ticket already added to array
        } else {
            ticketArray.push(entry.chargeToId);

            if (entry.chargeToType === "ServiceTicket" || entry.chargeToType === "ProjectTicket") {
                let ticket;
                try {
                    ticket = await cw.ServiceDeskAPI.Tickets.getTicketById(entry.chargeToId);
                    tickets.push({ id: ticket.id, summary: ticket.summary, type: entry.chargeToType })
                } catch (err) {
                    logger.error('Error getting ticket data: ' + entry.chargeToId, err);
                    tickets.push({ id: entry.chargeToId, summary: "Error", type: entry.chargeToType });
                }
                
            } else {
                tickets.push({ id: entry.chargeToId, summary: "Activity", type: entry.chargeToType });
            }
        }
    }
    return { name: techName, timeEntered: total, uniqueTimeEntered: getUniqueTime(entries), tickets: tickets, entries: entries };
}

export async function getSLAClosedTickets(timeSpan: any) {
    if (timeSpan == null) {
        console.error("Timespan not provided correctly: " + timeSpan.name);
        return null;
    }
    let tnt = getTimeSpan(timeSpan);
    const params = {
        conditions: 'board/name="Support" and closedDate>' + tnt[0] + ' and closedDate<' + tnt[1],
        pageSize: 1000,
        fields: 'id,priority,resolveMinutes',
    };
    const tickets = await cw.ServiceDeskAPI.Tickets.getTickets(params);
    let count = 0;
    for (const ticket of tickets) {
        if (ticket.priority.id === 2 && ticket.resolveMinutes < 720) { //Priority 1
            count += 1;
        } else if (ticket.priority.id === 1 && ticket.resolveMinutes < 1200) { //Priority 2
            count += 1;
        } else if (ticket.priority.id === 4 && ticket.resolveMinutes < 2400) { //Priority 3
            count += 1;
        } else if (ticket.priority.id === 3 && ticket.resolveMinutes < 7200) { //Priority 4
            count += 1;
        }
    }
    return count;
}
