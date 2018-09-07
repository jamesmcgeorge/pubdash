import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { SERVERURL } from '../apiqueryhelper';
import { TechData } from './helperobjects';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';

import 'rxjs/add/operator/toPromise';

@Injectable()
export class HoursByTechService {

    constructor(private http: Http) { }

    getTechData(): Promise<TechData[]> {
        return this.http.get(SERVERURL + '/api/time')
            .toPromise()
            .then(this.processTechData)
            .catch(this.handleError);

    }

    processTechData(response) {
        const techDataArray: TechData[] = new Array<TechData>();
        const data = response.json().data;

        for (const entry in data) {
            if (data[entry].name !== 'Andrew' && data[entry].name !== 'Office') {
                const techData: TechData = data[entry];
                techData.uniqueTimeEntered = parseFloat(techData.uniqueTimeEntered.toFixed(2));
                techDataArray.push(techData);
            }
        }
        techDataArray.sort(function (a, b) {
            const x = a.name.toLowerCase();
            const y = b.name.toLowerCase();
            if (x < y) { return -1; }
            if (x > y) { return 1; }
            return 0;
        });
        return techDataArray;
    }

    private handleError(error: Response | any) {
        let errMsg: string;
        if (error instanceof Response) {
            const body = error.json() || '';
            const err = body.error || JSON.stringify(body);
            errMsg = `${error.status} - ${error.statusText || ''} ${err}`;
        } else {
            errMsg = error.message ? error.message : error.toString();
        }
        console.error(errMsg);
        return Promise.reject(errMsg);
    }
}
