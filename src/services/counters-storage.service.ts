import {LocalStorageService} from 'ngx-webstorage';
import {Observable} from 'rxjs/Observable';
import {Counter, CountersPreset} from '../shared/counter';
import {Platform, PopoverController} from 'ionic-angular';
import {Subject} from 'rxjs/Subject';
import {Injectable, OnInit} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {Log} from '../shared/log';
import moment from 'moment';


class CountersStorageState {
  title: string;
  counters: Counter[];
}

@Injectable()
export class CountersStorageService {
  private counterSubject = new BehaviorSubject<Counter[]>([]);
  private titleSubject = new BehaviorSubject<string>('Counters');
  private presetsSubject = new BehaviorSubject<CountersPreset[]>([]);
  private logsSubject = new BehaviorSubject<Log[]>([]);

  private idCounter: number;

  private logs: Log[] = [];

  private _counters: Counter[] = [];
  private get counters(): Counter[] {
    return this._counters;
  }
  private set counters(_theCounters:Counter[]) {
    if (!_theCounters)
      _theCounters = [];
    this._counters = _theCounters;
    this.pushCounters();
  }
  private pushCounters(){
    this.counterSubject.next(this.counters.map(function (counter) {
      return Object.assign({}, counter);
    }));
  }

  private title: string;
  private statesList: CountersStorageState[] = [];

  constructor(private storage:LocalStorageService, platform: Platform) {
    platform.ready().then(() => {
      this.idCounter = parseInt(this.storage.retrieve('idCounter')) || 0;
      this.title = this.storage.retrieve('title') || 'Counters';
      try {
        this.counters = JSON.parse(this.storage.retrieve('counters'));
      } catch (e) {
        console.log(e);
      }
      !Array.isArray(this.counters) && (this.counters = []);
      if (this.storage.retrieve('firstLaunch') !== 'true') {
        this.storage.store('firstLaunch', 'true');
        this.counters.push({id:++this.idCounter, name:'MyCounter', value:0, step:10, color:'black'});
        this.saveCounters();
      }
      this.titleSubject.next(this.title);
      this.presetsSubject.next(this._getPresets());
      this.addToLog('App started');
    });
  }

  getCounters(): Observable<Counter[]> {
    return this.counterSubject.asObservable();
  }

  getCountersCount(): number {
    return this.counters.length;
  }

  getTitle(): Observable<string> {
    return this.titleSubject.asObservable();
  }

  saveCounters() {
    this.storage.store('counters', JSON.stringify(this.counters));
    this.storage.store('idCounter', this.idCounter);
    this.storage.store('title', this.title);
    this.pushCounters();
  }

  changeCounter(newCounter: Counter) {
    let toChange = this.counters.filter(function (counter) {
      return counter.id === newCounter.id;
    }).pop();
    if (toChange && toChange.name !== newCounter.name)
      this.addToLog(`Counter ${toChange.name} renamed to ${newCounter.name}`);
    toChange && this.saveStateToHistory() && (Object.assign(toChange, newCounter));
    this.saveCounters();
  }

  changeCounterValue(id:number, value:number) {
    let toChange = this.counters.filter(function (counter) {
      return counter.id === id;
    }).pop();
    toChange && this.addToLog(`Counter ${toChange.name} changed value from ${toChange.value} to ${value}`);
    toChange && this.saveStateToHistory() && (toChange.value = value);
    this.saveCounters();
  }

  changeCounterStep(id:number, value:number) {
    let toChange = this.counters.filter(function (counter) {
      return counter.id === id;
    }).pop();
    toChange && this.addToLog(`Counter ${toChange.name} changed step value from ${toChange.step} to ${value}`);
    toChange && this.saveStateToHistory() && (toChange.step = value);
    this.saveCounters();
  }

  addCounter(newCounter: Counter) {
    this.saveStateToHistory();
    newCounter.id = ++this.idCounter;
    this.counters.push(newCounter);
    this.saveCounters();
    this.addToLog(`Added counter ${newCounter.name}`);
  }

  removeCounter(counterToDelete: Counter) {
    let toDelete = this.counters.filter(function (counter) {
      return counter.id === counterToDelete.id
    }).pop();
    toDelete && this.saveStateToHistory() && (this.counters.splice(this.counters.indexOf(toDelete), 1));
    this.saveCounters();
    this.addToLog(`Removed counter ${counterToDelete.name}`);
  }

  undo(): boolean {
    if (this.statesList.length === 0) {
      return false;
    } else {
      let state = this.statesList.pop();
      this.counters = state.counters;
      this.title = state.title;
      this.titleSubject.next(this.title);
      this.saveCounters();
      this.addToLog(`Undo`);
    }
    return true;
  }

  private saveStateToHistory(): boolean {
    this.statesList.push({
      title:this.title,
      counters: this.counters.map(function (counter) {
        return Object.assign({}, counter); //copy function;
      })
    });
    return true;
  }

  getPresets(): Observable<CountersPreset[]> {
    return this.presetsSubject.asObservable();
  }

  private _getPresets():CountersPreset[] {
    try {
      let presets = JSON.parse(this.storage.retrieve('presets') || '[]');
      return presets;
    } catch (e) {
      return [];
    }
  }

  private setPresets(presets: CountersPreset[]) {
    this.storage.store('presets', JSON.stringify(presets));
    this.presetsSubject.next(presets);
  }

  saveCountersToPreset(name:string) {
    let presets = this._getPresets();
    let toRewrite = this._getPresets().filter((preset) => preset.name === name).pop();
    if (toRewrite) {
      toRewrite.counters = this.counters;
    } else {
      presets.push({name:name, counters:this.counters});
    }
    this.addToLog(`Saved preset ${name}`);
    this.setPresets(presets);
  }

  loadPreset(name:string) {
    let presetToLoad = this._getPresets().filter(function (preset) {
      return preset.name === name;
    }).pop();
    if (presetToLoad) {
      this.counters = presetToLoad.counters;
      this.title = name;
      this.titleSubject.next(this.title);
      this.addToLog(`Loaded preset ${this.title}`);
    }
  }

  removePreset(name:string) {
    let presets = this._getPresets();
    let toDelete = presets.filter(function (preset) {
      return preset.name === name
    }).pop();
    toDelete && (presets.splice(presets.indexOf(toDelete), 1));
    this.setPresets(presets);
    this.addToLog(`Removed preset ${name}`);
  }

  isCountersPresetNameAvailable(name:string): boolean {
    return this._getPresets().filter((preset) => preset.name === name).length === 0;
  }

  private addToLog(message:string) {
    this.logs.push({ts: moment().format('hh:mm:ss'), message:message});
    if (this.logs.length > 100)
      this.logs.shift();
    this.logsSubject.next(this.logs);
  }

  getLogs() {
    return this.logsSubject.asObservable();
  }
}
