import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {MenuController, Nav, NavController, PopoverController} from 'ionic-angular';
import {CountersPreset} from '../../shared/counter';
import {CountersStorageService} from '../../services/counters-storage.service';
import {Subscription} from 'rxjs/Subscription';

@Component({
  selector: 'page-load',
  templateUrl: 'load.html',
})
export class LoadPage implements OnDestroy, OnInit {
  presets:CountersPreset[] = [];
  presetsSubscription: Subscription;

  constructor(public navCtrl: NavController, public menu:MenuController, public popoverCtrl: PopoverController, private countersStorageService:CountersStorageService) {}

  ngOnInit() {
    this.presetsSubscription = this.countersStorageService.getPresets().subscribe(presets => {
      this.presets = presets;
    });
  }

  loadPreset(name:string) {
    this.countersStorageService.loadPreset(name);
    this.navCtrl.pop();
  }

  removePreset(name:string) {
    this.countersStorageService.removePreset(name);
  }

  ngOnDestroy() {
    this.presetsSubscription.unsubscribe();
  }

}
