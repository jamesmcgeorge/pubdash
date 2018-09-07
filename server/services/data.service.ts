import { getOpenTicketsFromDB } from "./database.service";
import { TimeSpan } from "../helperobjects";
import { getThisWeek, getLastWeek } from "../apiqueryhelper";
import { getTechNames, getTechTimeEntryData, getOpenTickets, getCreatedTickets, getClosedTickets, getSLAClosedTickets } from "./connectwise.service";
import { updateCurrentData } from "../db/mongo";
const logger = require('./logger.service');

export async function getTicketPriorities() {
    logger.info('Getting Priority Tickets');
    const openTix = await getOpenTicketsFromDB();
    const prioritiesOut = {
        one: 0,
        two: 0,
        three: 0,
        four: 0
    }
    for (const ticket of openTix) {
        if (ticket.board.id === 1){
            if (ticket.priority.sort == 2) {
                prioritiesOut.one += 1
            } else if (ticket.priority.sort == 4) {
                prioritiesOut.two += 1
            } else if (ticket.priority.sort == 6) {
                prioritiesOut.three += 1
            } else if (ticket.priority.sort == 8) {
                prioritiesOut.four += 1
            }
        }
    }
    logger.info('Got Priority Tickets');
    return prioritiesOut;
}

export async function getCustomerUpdatedTickets() {
    logger.info('Getting Customer Updated Tickets');
    const openTix = await getOpenTicketsFromDB();
    const updateTicketPackages: UpdatedTicketPackage[] = [];
    for (const ticket of openTix) {
        if (ticket.board.name === 1 && ticket.customerUpdatedFlag === true) {
            const update: UpdatedTicketPackage = {
                id: ticket.id,
                summary: ticket.summary,
                resources: ticket.resources,
            }
            updateTicketPackages.push(update);
        }
    }
    logger.info('Got Customer Updated Tickets');
    return updateTicketPackages;
}

export async function getAgedTickets() {
    logger.info('Getting Aged Tickets');
    const openTix = await getOpenTicketsFromDB();
    const date = new Date(new Date().getTime() - (7 * 86400000));
    const agedPackages: TicketPackage[] = [];
    for (const ticket of openTix) {
        if (ticket.board.id === 1 && (new Date(ticket.dateEntered)) <= date) {
            try {
                let agedPackage: TicketPackage = {
                    id: ticket.id,
                    summary: ticket.summary,
                    resources: ticket.resources,
                    type: ticket.type.name,
                    company: ticket.company.name,
                    dateEntered: ticket.dateEntered,
                }
                agedPackages.push(agedPackage);
            } catch (err) {
                logger.error("Failed Aged Package", ticket);
            }
        }
    }
    logger.info('Got Aged Tickets');
    return agedPackages;
}

export async function getSLABreachTickets() {
    logger.info('Getting SLA Breach Tickets');
    const openTix = await getOpenTicketsFromDB();
    const SLAPackages: TicketPackage[] = [];
    for (const ticket of openTix) {
        if (ticket.board.id === 1 && ticket.isInSLA === false) {
            let SLAPackage: TicketPackage = {
                id: ticket.id,
                summary: ticket.summary,
                resources: ticket.resources,
                type: ticket.type.name,
                company: ticket.company.name,
                dateEntered: ticket.dateEntered,
            }
            SLAPackages.push(SLAPackage);
        }
    }
    logger.info('Got SLA Breach Tickets');
    return SLAPackages;
}

export async function getActionableTickets() {
    logger.info('Getting Actionable Tickets');
    const openTix = await getOpenTicketsFromDB();
    let count = 0;
    for (const ticket of openTix) {
        if (ticket.board.id === 1 && ticket.status.id !== 321 && ticket.status.id !== 92 && 
            ticket.status.id !== 91 && ticket.status.id !== 39 && ticket.status.id !== 36 && 
            ticket.status.id !== 15 && ticket.status.id !== 9) {
                count +=1 ;
        }
    }
    logger.info('Got Actionable Tickets');
    return count;
}

export function getUniqueTime(entries: fc.TimeEntry[]): number {
    let uniqueTime = 0;

    entries.sort(function (a, b) {
        var x = new Date(a.timeStart).getTime();
        var y = new Date(b.timeStart).getTime();
        if (x < y) { return -1; }
        if (x > y) { return 1; }
        return 0;
    });
    let lastTimeEnd = null;
    let uTinMilli = 0;
    for (var i in entries) {

        if (entries[i].isSameTimeFrame === false) { continue; }

        let startMilli = new Date(entries[i].timeStart).getTime();
        let endMilli = new Date(entries[i].timeEnd).getTime();

        if (lastTimeEnd === null) {
            uniqueTime += (endMilli - startMilli) / 3600000;
            lastTimeEnd = endMilli;
        } else if (startMilli < lastTimeEnd) {
            if (endMilli > lastTimeEnd) {
                uniqueTime += (endMilli - lastTimeEnd) / 3600000;
                lastTimeEnd = endMilli;
            }
        } else {
            uniqueTime += (endMilli - startMilli) / 3600000;
            lastTimeEnd = endMilli;
        }

    }

    return uniqueTime;
}

export function checkEntry(ticketArray: any[], id: number) {
    return ticketArray.some(function (el) {
        return el.id === id;
    });
}


export function parseEntry(timespan:any, entry: any): number {
    let number = 0;

    let timeStart = new Date(entry.timeStart);
    let date;
    let flag = "OneDay";
    if (timespan === TimeSpan.Today) {
        date = new Date();
    } else if (timespan === TimeSpan.Yesterday) {
        date = new Date(new Date().getTime() - (1 * 86400000));
    } else {
        flag = "OneWeek";
    }

    if (flag === "OneDay") {
        if (date.getDate() === timeStart.getDate() && date.getMonth() === timeStart.getMonth()) {
            //logger.info("Time was entered for the same day");
            number = entry.actualHours;
        } 
    }
    if (flag === "OneWeek") {
        if (timespan === TimeSpan.ThisWeek) {
            let dates: Date[] = getThisWeek();
            let start = new Date(timeStart.getTime() - (timeStart.getDay() * 86400000));
            /*logger.info("This Week Dates:");
            logger.info(start.toString());
            logger.info(dates[0].toString());*/
            if (start.getDate() === dates[0].getDate() && start.getMonth() === dates[0].getMonth()) {
                number = entry.actualHours;
            }

        }
        if (timespan === TimeSpan.LastWeek) {
            let dates: Date[] = getLastWeek();
            let start = new Date(timeStart.getTime() - (timeStart.getDay() * 86400000));
            /*logger.info("Last Week Dates:");
            logger.info(start.toString());
            logger.info(dates[0].toString());*/
            if (start.getDate() === dates[0].getDate() && start.getMonth() === dates[0].getMonth()) {
                number = entry.actualHours;
            }
        }
    }
    return number;
}

export async function getTechData(timeSpan: any) {
    let techNames;
    try {
        techNames = await getTechNames();
    } catch (err) {
        logger.error('Error Tech Data:', err);
    }
    const techData = {};
    for (const tech of techNames) {
        try {
            const data = await getTechTimeEntryData(timeSpan, tech);
            techData[tech] = data;
        } catch (err) {
            logger.error('Error Tech Data Time Entry: ' + tech, err);
        }
    }
    return techData;
}

async function getAssignedTickets(timeEntries: Object) {
    const assignedTicketsObject = {};
    for (const index in timeEntries) {
        assignedTicketsObject[timeEntries[index].name] = { name: timeEntries[index].name, amount: 0 };
    }
    const openTix = await getOpenTicketsFromDB();
    for (const ticket of openTix) {
        if (ticket.resources === null || ticket.resources === undefined) { continue; }
        if (ticket.board.id !== 1) {continue;}
        let resources = ticket.resources.split(", ");
        for (var j = 0; j < resources.length; j++) {
            //logger.info("Adding: " + resources[j]);
            if (assignedTicketsObject[resources[j]] === undefined) { continue; }
            assignedTicketsObject[resources[j]].amount = assignedTicketsObject[resources[j]].amount + 1;
        }
    }
    const arrOut = [];
    for (const tech in assignedTicketsObject) {
        if (assignedTicketsObject[tech].amount <= 0) {
            delete assignedTicketsObject[tech];
        }
    }
    return assignedTicketsObject;
}

export async function getTodaysData() {
    logger.info('Starting to get Today\'s data');
    const start = Date.now();
    await getOpenTickets();
       
    const promiseArray = [
        getCreatedTickets(TimeSpan.Today),
        getClosedTickets(TimeSpan.Today),
        getTechData(TimeSpan.Today),
        getTicketPriorities(),
        getCustomerUpdatedTickets(),
        getAgedTickets(),
        getSLABreachTickets(),
        getActionableTickets()
    ]

    const resultArray = await Promise.all(promiseArray);
    
    let objectOut = { 
        ticketsCreated: resultArray[0], 
        ticketsClosed: resultArray[1], 
        timeEntries: resultArray[2], 
        priorities: resultArray[3], 
        clientUpdated: resultArray[4], 
        agedTickets: resultArray[5], 
        slaBreach: resultArray[6], 
        actionable: resultArray[7], 
        time: new Date().toISOString(), 
        assignedTickets: await getAssignedTickets(resultArray[2])
    };
    updateCurrentData(objectOut, TimeSpan.Today);
    const end = Date.now();
    logger.info('Got and updated data in ' + (end - start) + 'ms --- NEW WAY');
}

export async function getThisWeekData() {
    const promiseArray = [
        getCreatedTickets(TimeSpan.ThisWeek),
        getClosedTickets(TimeSpan.ThisWeek),
        getTechData(TimeSpan.ThisWeek),
        getSLAClosedTickets(TimeSpan.ThisWeek),
    ];

    const resultArray = await Promise.all(promiseArray);

    const results = {
        ticketsCreated: resultArray[0],
        ticketsClosed: resultArray[1],
        timeEntries: resultArray[2],
        ticketsClosedInSLA: resultArray[3],
        time: new Date().toISOString(),
        ticketsClosedInSLAPercentage: resultArray[3] / resultArray[1]
    }
    updateCurrentData(results, TimeSpan.ThisWeek);
}

export async function getLastWeekData() {
    const promiseArray = [
        getCreatedTickets(TimeSpan.LastWeek),
        getClosedTickets(TimeSpan.LastWeek),
        getTechData(TimeSpan.LastWeek),
        getSLAClosedTickets(TimeSpan.LastWeek),
    ];

    const resultArray = await Promise.all(promiseArray);

    const results = {
        ticketsCreated: resultArray[0],
        ticketsClosed: resultArray[1],
        timeEntries: resultArray[2],
        ticketsClosedInSLA: resultArray[3],
        time: new Date().toISOString(),
        ticketsClosedInSLAPercentage: resultArray[3] / resultArray[1]
    }
    updateCurrentData(results, TimeSpan.LastWeek);
}

export async function getYesterdayData() {
    const promiseArray = [
        getCreatedTickets(TimeSpan.Yesterday),
        getClosedTickets(TimeSpan.Yesterday),
        getTechData(TimeSpan.Yesterday),
    ];

    const resultArray = await Promise.all(promiseArray);

    const results = {
        ticketsCreated: resultArray[0],
        ticketsClosed: resultArray[1],
        timeEntries: resultArray[2],
        time: new Date().toISOString()
    }
    updateCurrentData(results, TimeSpan.Yesterday);
}
