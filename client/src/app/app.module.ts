import { NgModule }      from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { ChartsModule } from 'ng2-charts/ng2-charts';

import { AppComponent } from './app.component';

import { CreatedTodayComponent } from './created-today.component';
import { CreatedTodayService } from './created-today.service';

import { CreatedThisWeekComponent } from './created-this-week.component';
import { CreatedThisWeekService } from './created-this-week.service';

import { CreatedLastWeekComponent } from './created-last-week.component';
import { CreatedLastWeekService } from './created-last-week.service';

import { ClosedTodayComponent } from './closed-today.component';
import { ClosedTodayService } from './closed-today.service';

import { ClosedThisWeekComponent } from './closed-this-week.component';
import { ClosedThisWeekService } from './closed-this-week.service';

import { ClosedLastWeekComponent } from './closed-last-week.component';
import { ClosedLastWeekService } from './closed-last-week.service';

import { HoursByTechComponent } from './hours-by-tech.component';
import { HoursByTechService } from './hours-by-tech.service';

import { RespondedComponent } from './responded.component';
import { RespondedService } from './responded.service';
import { Aged7Component } from './aged7.component';
import { Aged7Service } from './aged7.service';
import { Aged14Component } from './aged14.component';
import { Aged14Service } from './aged14.service';
import { Aged30Component } from './aged30.component';
import { Aged30Service } from './aged30.service';


@NgModule({
    imports: [
        BrowserModule,
        FormsModule,
        HttpModule,
        ChartsModule
    ],
  declarations: [
      AppComponent,
      CreatedTodayComponent,
      ClosedTodayComponent,
      Aged7Component,
      Aged14Component,
      Aged30Component,
      RespondedComponent,
      CreatedThisWeekComponent,
      CreatedLastWeekComponent,
      ClosedThisWeekComponent,
      ClosedLastWeekComponent,
      HoursByTechComponent
    ],
  providers: [
      CreatedTodayService,
      ClosedTodayService,
      Aged7Service,
      Aged14Service,
      Aged30Service,
      RespondedService,
      CreatedThisWeekService,
      CreatedLastWeekService,
      ClosedThisWeekService,
      ClosedLastWeekService,
      HoursByTechService
  ],
  bootstrap:    [ AppComponent ]
})
export class AppModule { }
