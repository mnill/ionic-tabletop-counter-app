import {Component, ElementRef, OnDestroy, OnInit, ViewChild, ViewChildren} from '@angular/core';
import {MenuController, ModalController, NavController, Platform, PopoverController, Slides} from 'ionic-angular';
import {Counter } from '../../shared/counter';
import {CounterPopoverComponent} from './counter-popover.component';
import {CountersStorageService} from '../../services/counters-storage.service';
import {Subscription} from 'rxjs/Subscription';
import {BigButtonHelpPage} from '../popovers/big-button-help';
import {StepButtonHelpPage} from '../popovers/step-button-help';
import {SlideButtonHelpPage} from '../popovers/slide-button-help';
import {LocalStorageService} from 'ngx-webstorage';
import { NativeAudio } from '@ionic-native/native-audio';
import {platformBrowserDynamic} from '@angular/platform-browser-dynamic';
declare let AppRate: any;


@Component({
  selector: 'page-home',
  templateUrl: 'home.html',
})
export class HomePage implements OnDestroy, OnInit {
  @ViewChildren('slidItem') private countersList: any;

  private counters: Counter[] = [];
  private title: string = '';
  counterSubscription: Subscription;

  titleSubscription: Subscription;
  soundLoaded = false;

  constructor(private modalCtrl: ModalController, private storage:LocalStorageService, private platform: Platform, private nativeAudio: NativeAudio, public menu:MenuController, public popoverCtrl: PopoverController, private countersStorageService:CountersStorageService) {}

  willEnter() {
    this.menu.enable(false);
  }

  didLeave() {
    this.menu.enable(true);
  }

  ngOnInit() {
    this.counterSubscription = this.countersStorageService.getCounters().subscribe(counters => {
      this.counters = counters;
    });
    this.titleSubscription = this.countersStorageService.getTitle().subscribe(title => {
      this.title = title;
    });
    this.platform.ready().then(() => {
      if (this.storage.retrieve('home:firstLaunch') !== 'true') {
        this.storage.store('home:firstLaunch', 'true');
        this.showHelp();
      }
      if ('cordova' in window) {
        AppRate.preferences.storeAppURL = {
          ios: '1260943938',
          android: 'market://details?id=com.mnillstone.counter',
        };
        AppRate.promptForRating(false);
        this.nativeAudio.preloadComplex('tick', 'assets/tick.mp3', 1, 1, 0).then(() => {
          this.soundLoaded = true;
        });
      }
    });
  }

  showHelp() {
    setTimeout(() => {
      if (document.querySelector('.counters-list').querySelectorAll('.counter-button-counter')[1]) {
        let popover = this.popoverCtrl.create(BigButtonHelpPage, {}, {showBackdrop: true, cssClass: /(android)/i.test(navigator.userAgent) ? 'popover-left' : '', enableBackdropDismiss:true});
        popover.present({ev: {
            target: document.querySelector('.counters-list').querySelectorAll('.counter-button-counter')[1]
          }});
        popover.onWillDismiss((data) => {
          if (document.querySelector('.counters-list').querySelectorAll('.counter-button-step')[0]) {
            let popover = this.popoverCtrl.create(StepButtonHelpPage, {}, {showBackdrop: true, cssClass: /(android)/i.test(navigator.userAgent) ? 'popover-top' : '', enableBackdropDismiss:true});
            popover.present({ev: {
              target: document.querySelector('.counters-list').querySelectorAll('.counter-button-step')[0]
            }});
            popover.onWillDismiss((data) => {
              if (document.querySelector('.counters-list').querySelector('.counter-name')) {
                let popover = this.popoverCtrl.create(SlideButtonHelpPage, {}, {showBackdrop: true, enableBackdropDismiss:true, cssClass: /(android)/i.test(navigator.userAgent) ? 'popover-center' : '',});
                popover.present({ev: {target: document.querySelector('.counters-list').querySelector('.counter-name')}});
                let firstCounter = this.countersList.toArray()[0];
                firstCounter && firstCounter.openSlider();
                popover.onWillDismiss((data) => {
                  firstCounter && firstCounter.closeSlider();
                })
              }
            });
          }
        });
      }
    }, 300);
  }

  ngOnDestroy() {
    this.counterSubscription.unsubscribe();
    this.titleSubscription.unsubscribe();
    this.nativeAudio.unload('tick');
  }

  trackByFn(index, counter) {
    return counter.id;
  }

  addCounter() {
    let popover = this.popoverCtrl.create(CounterPopoverComponent, {background:'black', name:''}, {showBackdrop: true, enableBackdropDismiss:false});
    popover.present();
    popover.onWillDismiss((data) => {
      if (data && data.cancel === false) {
        this.countersStorageService.addCounter({id: 0, name: data.name || '', value:0,step:10, color:data.color});
      }
    });
  }

  remove (toRemove: Counter) {
    this.countersStorageService.removeCounter(toRemove);
  }

  changeValue(id: number, changeEvent: {value:number, isStep:boolean}) {
    if (changeEvent.isStep && this.soundLoaded) {
      this.nativeAudio.play('tick');
    }
    this.countersStorageService.changeCounterValue(id, changeEvent.value);
  }

  changeStep(id: number, value:number) {
    this.countersStorageService.changeCounterStep(id, value);
  }

  change(newValue: Counter) {
    this.countersStorageService.changeCounter(newValue);
  }
}
