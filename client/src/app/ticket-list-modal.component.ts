import { Component } from '@angular/core';
import { DialogComponent, DialogService } from 'ng2-bootstrap-modal';
import { TicketLink } from './helperobjects';

export interface AlertModel {
    title: string;
    tickets: TicketLink[];
}

@Component({
    selector: 'alert',
    template: `<div class="modal-dialog modal-xl">
                <div class="modal-content">
                   <div class="modal-header">
                     <button type="button" class="close" (click)="close()" >&times;</button>
                     <h4 class="modal-title">{{title || 'Alert!'}}</h4>
                   </div>
                   <div class="modal-body">
                     <li *ngFor="let ticket of tickets">
                      <a target="_blank" href={{ticket.link}}>{{ticket.id}}</a>: {{ticket.summary}}
                   </div>
                   <div class="modal-footer">
                     <button type="button" class="btn btn-primary" (click)="close()">OK</button>
                   </div>
                </div>
             </div>`
})
export class TicketListModalComponent extends DialogComponent<AlertModel, null> implements AlertModel {
    title: string;
    tickets: TicketLink[];
    constructor(dialogService: DialogService) {
        super(dialogService);
    }
}
