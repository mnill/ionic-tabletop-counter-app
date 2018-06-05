import {Observable} from 'rxjs/Observable';
import {ChangeDetectorRef} from '@angular/core';

export class Counter {
  id: number;
  name: string;
  step: number;
  color: string;
  value: number;
}

export class CountersPreset {
  name: string;
  counters: Counter[];
}
