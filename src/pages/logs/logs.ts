import {Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {MenuController, Nav, NavController, PopoverController} from 'ionic-angular';
import {CountersPreset} from '../../shared/counter';
import {CountersStorageService} from '../../services/counters-storage.service';
import {Subscription} from 'rxjs/Subscription';
import {Log} from '../../shared/log';
import moment from 'moment';

@Component({
  selector: 'page-logs',
  templateUrl: 'logs.html',
})
export class LogsPage implements OnDestroy, OnInit {
  @ViewChild('scrollMe') private myScrollContainer: ElementRef;

  logs:Log[] = [];
  logsSubscription: Subscription;

  constructor(public navCtrl: NavController, private countersStorageService:CountersStorageService) {}

  ngOnInit() {
    this.logsSubscription = this.countersStorageService.getLogs().subscribe(logs => {
      this.logs = logs;
      setTimeout(function () {
        this.scrollToBottom();
      }.bind(this), 100);
    });
  }

  ngOnDestroy() {
    this.logsSubscription.unsubscribe();
  }

  scrollToBottom(): void {
    try {
      this.myScrollContainer.nativeElement.parentNode.scrollTop = this.myScrollContainer.nativeElement.parentNode.scrollHeight;
    } catch(err) {}
  }
}
