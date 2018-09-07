import { NgModule }      from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { ChartsModule } from 'ng2-charts/ng2-charts';

import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { CreatedTodayComponent } from './created-today.component';
import { CreatedTodayService } from './created-today.service';

import { ClosedTodayComponent } from './closed-today.component';
import { ClosedTodayService } from './closed-today.service';

import { ClosedThisLastWeekComponent } from './closed-thislast-week.component';
import { ClosedThisLastWeekService } from './closed-thislast-week.service';

import { CreatedThisLastWeekComponent } from './created-thislast-week.component';
import { CreatedThisLastWeekService } from './created-thislast-week.service';

import { HoursByTechComponent } from './hours-by-tech.component';
import { HoursByTechService } from './hours-by-tech.service';

import {TicketPriorityComponent } from './ticket-priority.component';
import {TicketPriorityService } from './ticket-priority.service';

import { RespondedComponent } from './responded.component';
import { RespondedService } from './responded.service';

import { AgedTicketComponent } from './aged.component';
import { AgedTicketService } from './aged.service';

import { BootstrapModalModule } from 'ng2-bootstrap-modal';
import { TicketListModalComponent } from './ticket-list-modal.component';

import { WorkedTodayComponent } from './worked-today.component';
import { WorkedTodayService } from './worked-today.service';

import { WorkedThisLastWeekComponent } from './worked-thislast-week.component';
import { WorkedThisLastWeekService } from './worked-thislast-week.service';

import { ClientUpdatedComponent } from './client-updated.component';
import { ClientUpdatedService } from './client-updated.service';

import { TicketsAssignedComponent } from './tickets-assigned.component';
import { TicketsAssignedService } from './tickets-assigned.service';

import { SLAComponent } from './sla.component';
import { SLAService } from './sla.service';

import { ActionableComponent } from './actionable.component';
import { ActionableService } from './actionable.service';

import { SLAThisLastWeekComponent } from './sla-thislast-week.component';
import { SLAThisLastWeekService } from './sla-thislast-week.service';

@NgModule({
    imports: [
        BrowserModule,
        FormsModule,
        HttpModule,
        ChartsModule,
        BrowserAnimationsModule,
        BootstrapModalModule
    ],
    declarations: [
        AppComponent,
        CreatedTodayComponent,
        ClosedTodayComponent,
        AgedTicketComponent,
        RespondedComponent,
        CreatedThisLastWeekComponent,
        HoursByTechComponent,
        TicketPriorityComponent,
        ClosedThisLastWeekComponent,
        TicketListModalComponent,
        WorkedTodayComponent,
        WorkedThisLastWeekComponent,
        ClientUpdatedComponent,
        TicketsAssignedComponent,
        SLAComponent,
        ActionableComponent,
        SLAThisLastWeekComponent
    ],
    providers: [
        CreatedTodayService,
        ClosedTodayService,
        AgedTicketService,
        RespondedService,
        CreatedThisLastWeekService,
        HoursByTechService,
        TicketPriorityService,
        ClosedThisLastWeekService,
        WorkedTodayService,
        WorkedThisLastWeekService,
        ClientUpdatedService,
        TicketsAssignedService,
        SLAService,
        ActionableService,
        SLAThisLastWeekService
    ],
    entryComponents: [
        TicketListModalComponent
    ],
  bootstrap:    [ AppComponent ]
})
export class AppModule { }
