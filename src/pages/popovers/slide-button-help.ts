import {Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {MenuController, Nav, NavController, PopoverController, ViewController} from 'ionic-angular';
import {CountersPreset} from '../../shared/counter';
import {CountersStorageService} from '../../services/counters-storage.service';
import {Subscription} from 'rxjs/Subscription';
import {Log} from '../../shared/log';
import moment from 'moment';

@Component({
  selector: 'page-slide-button-help',
  templateUrl: 'slide-button-help.html',
})
export class SlideButtonHelpPage {
  constructor(public viewCtrl: ViewController) {}
  close() {
    this.viewCtrl.dismiss({});
  }
}
