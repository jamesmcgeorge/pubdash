import { Component, Input, AfterViewInit, OnDestroy } from '@angular/core';
import { TeamBox } from './teambox';
import { HoursByTechService } from './hours-by-tech.service';
import { BarChartPackage, BarChartData } from './graphobjects'


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
                (chartHover)="chartHovered($event)"
                (chartClick)="chartClicked($event)"></canvas>
      </div>
    </div>
  `
})
export class HoursByTechComponent implements AfterViewInit, OnDestroy {
    interval: any;
    public barChartOptions: any = {
        scaleShowVerticalLines: false,
        responsive: true
    };
    public barChartLabels: string[] = ['2006', '2007', '2008', '2009', '2010', '2011', '2012'];
    public barChartType: string = 'bar';
    public barChartLegend: boolean = true;

    public barChartData: any[] = [
        { data: [65, 59, 80, 81, 56, 55, 40], label: 'Series A' },
        { data: [28, 48, 40, 19, 86, 27, 90], label: 'Series B' }
    ];

    constructor(private hoursByTechService: HoursByTechService) { }

    ngOnInit(): void {
        console.log("Trying to query hours by tech");

        this.hoursByTechService.getHoursByTech()
            .then(this.processChart)
            .catch(function () { console.error("Error Getting Created Tickets") });
    }
    processChart(chartPackage: BarChartPackage) {
        this.barChartLabels = chartPackage.Labels;
        this.barChartData = chartPackage.Data;
    }


    ngAfterViewInit() {
        this.getData();
    }
    ngOnDestroy() {
        clearInterval(this.interval);
    }
    getData() {
        this.interval = setInterval(() => {
            this.hoursByTechService.getHoursByTech()
                .then(this.processChart);
        }, 300000);

    }
    public chartClicked(e: any): void {
        console.log(e);
    }

    public chartHovered(e: any): void {
        console.log(e);
    }


}
