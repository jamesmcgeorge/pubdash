import { Component, AfterViewInit, OnDestroy } from '@angular/core';
import { HoursByTechService } from './hours-by-tech.service';
import { DialogService } from 'ng2-bootstrap-modal';
import { TicketListModalComponent } from './ticket-list-modal.component';
import { TechData, TicketLink } from './helperobjects';

@Component({
    selector: 'hours-by-tech',
    template: `
    <div>
      <div style="display: block">
        <canvas baseChart
                [datasets]="barChartData"
                [labels]="barChartLabels"
                [options]="barChartOptions"
                [legend]="barChartLegend"
                [chartType]="barChartType"
                [colors]="barChartColors"
                (chartHover)="chartHovered($event)"
                (chartClick)="chartClicked($event)"></canvas>
      </div>
    </div>
  `
})
export class HoursByTechComponent implements AfterViewInit, OnDestroy {
    interval: NodeJS.Timer;
    techDataArray: TechData[];
    public barChartOptions: any = {
        scaleShowVerticalLines: false,
        responsive: true,
        maintainAspectRatio: false,
        tooltips: {
            enabled: false
        },
        scales: {
            yAxes: [{
                ticks: {
                    suggestedMax: 8,
                    stepSize: 1,
                    fontColor: "white"
                }
            }],
            xAxes: [{
                ticks: {
                    fontColor: "white"
                },
                gridLines: {
                    display: false,
                }
            }]
        },
        hover: { animationDuration: 0 },
        animation: {
            duration: 1000,
            onComplete: function() {
                const chartInstance = this.chart,
                ctx = chartInstance.ctx;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'bottom';
                ctx.fillStyle = 'white';

                this.data.datasets.forEach(function(dataset, i) {
                    const meta = chartInstance.controller.getDatasetMeta(i);
                    meta.data.forEach(function(bar, index) {
                        const data = dataset.data[index];
                        ctx.fillText(data, bar._model.x, bar._model.y - 2);
                    });
                });
            }
        }
    };

    barChartLabels: string[] = ['Test', 'Temp'];
    public barChartColors: Array<any> = [
        {
            backgroundColor: 'rgba(11,76,138,1)'
        }

    ];
    public barChartType: string = 'bar';
    public barChartLegend: boolean = false;

    public barChartData: any[] = [
        { "data": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] }
        ];

    constructor(private hoursByTechService: HoursByTechService, private dialogService: DialogService) { }

    ngOnInit(): void {
        console.log('Trying to Query Time Entries');
        this.getData();
    }

    setupIntervals() {
        this.interval = setInterval(() => {
            this.getData();
        }, 300000 + Math.floor(Math.random() * 20000) + 1);
    }

    ngAfterViewInit() {
        this.setupIntervals();
    }
    ngOnDestroy() {
        clearInterval(this.interval);
    }
    getData() {
        this.hoursByTechService.getTechData()
            .then(data => {
                this.techDataArray = data;
                // Angular won't update the page unless using the same variables
                const chartLabels: string[] = this.barChartLabels;
                const dataArray: number[] = new Array<number>();
                // Need to pop off all current data and replace it
                for (let i = chartLabels.length; i > 0; i--) {
                    chartLabels.pop();
                }
                // Adding the new data to the local variables
                for (const entry in data) {
                    chartLabels.push(data[entry].name);
                    dataArray.push(data[entry].uniqueTimeEntered);
                }
                // Same deal here, must replace the existing data
                const clone = JSON.parse(JSON.stringify(this.barChartData));
                clone[0].data = dataArray;
                this.barChartData = clone;
            })
            .catch(function(err) { console.error('Error Getting Tech Data: ' + err) });

    }
    public chartClicked(e: any): void {
        console.log(e);
        const clickedTech = e.active[0]._model.label;
        let clickedTechData: TechData;
        for (const i in this.techDataArray) {
            if (this.techDataArray[i].name === clickedTech) {
                clickedTechData = this.techDataArray[i];
            }
        }
        this.showClickedModal(clickedTechData);
    }

    public chartHovered(e: any): void {
        console.log(e);
    }

    showClickedModal(techData: TechData) {
        console.log('Clicked Tech: ' + techData.name);
        console.log('Clicked Tech Hours: ' + techData.uniqueTimeEntered);
        console.log('Clicked Tech Tickets: ' + techData.tickets);
        const tickets = new Array<TicketLink>();
        for (const i in techData.tickets) {
            let ticketlink: TicketLink = {
                id: techData.tickets[i].id.toString(), summary: techData.tickets[i].summary, link: "https://cw1.transparent.ca/v4_6_release/services/system_io/Service/fv_sr100_request.rails?service_recid=" + techData.tickets[i].id + "&companyName=tsc"
            };
            tickets.push(ticketlink);
        }
        this.dialogService.addDialog(TicketListModalComponent, { title: 'Ticket List for ' + techData.name, tickets: tickets });
    }
}
