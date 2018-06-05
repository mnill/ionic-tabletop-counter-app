import { Component, ViewChild } from '@angular/core';
import { AlertController, ModalController, Nav, NavController, Platform, ToastController } from 'ionic-angular';
import { Insomnia } from '@ionic-native/insomnia';
import { HomePage } from '../pages/home/home';
import { LoadPage } from '../pages/load/load';
import { CountersStorageService}  from '../services/counters-storage.service';
import { LogsPage} from '../pages/logs/logs';
import { LocalStorageService } from 'ngx-webstorage';
import { PremiumPage } from '../pages/premium/premium';
import { IapService } from '../services/iap.service';
import { HelpPage } from '../pages/help/help';

declare let appMetrica: any;
declare let navigator: any;
declare let StatusBar: any;

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  @ViewChild(Nav) nav;
  rootPage:any = HomePage;

  constructor(private insomnia: Insomnia, private iap: IapService, public modalCtrl: ModalController, private toastCtrl: ToastController, platform: Platform, private alertCtrl: AlertController, private countersStorageService:CountersStorageService) {
    platform.ready().then(() => {
      setTimeout(function () {
        if ('cordova' in window) {
          navigator.splashscreen.hide();
          StatusBar.styleBlackOpaque();
          this.insomnia.keepAwake();
          //appmetrika - plugin for users behaivor analytics
          appMetrica.activate({
            apiKey: 'YOUR_API_KEY_HERE',
            trackLocationEnabled: true,
            handleFirstActivationAsUpdateEnabled: true,
            sessionTimeout: 15
          });
          appMetrica.reportEvent('open-app');
        }
      }, 300);
    });
  }

  private checkPremium(): boolean {
    return this.iap.isPremiumUnlocked();
  }

  private openPremium() {
    let modal = this.modalCtrl.create(PremiumPage);
    modal.present();
  }

  openPage(page) {
    if (this.checkPremium()) {
      if (page === 'load')
        this.nav.push(LoadPage);
      else if (page === 'logs')
        this.nav.push(LogsPage);
    } else {
      if (page === 'help') {
        this.nav.push(HelpPage);
      } else {
        this.openPremium();
      }
    }
  }

  saveCounters() {
    if (this.countersStorageService.getCountersCount() === 0) {
      return this.showAlert('Error', 'You have no active counters');
    }
    let alert = this.alertCtrl.create({
      title: 'Save counters preset',
      inputs: [
        {
          name: 'name',
          placeholder: 'Name'
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
        },
        {
          text: 'Save',
          handler: data => {
            if (!data.name || data.name.length < 0) {
              data.name = 'Unnamed';
            }
            if (this.countersStorageService.isCountersPresetNameAvailable(data.name)) {
              this.countersStorageService.saveCountersToPreset(data.name);
              this.showAlert('Success', 'Saved');
            } else {
              let alert = this.alertCtrl.create({
                title: `Overwrite ${data.name} preset?`,
                message: `${data.name} is already exist, Do you really want to overwrite?`,
                buttons: [
                  {
                    text: 'Cancel',
                    role: 'cancel'
                  },
                  {
                    text: 'Save',
                    handler: () => {
                      this.countersStorageService.saveCountersToPreset(data.name);
                      this.showAlert('Success', 'Saved');
                    }
                  }
                ]
              });
              alert.present();
            }
          }
        }
      ]
    });
    alert.present();
  }

  undo() {
    if (this.checkPremium()) {
      if (!this.countersStorageService.undo()) {
        let toast = this.toastCtrl.create({
          message: 'No actions in history',
          duration: 3000,
          position: 'middle'
        });
        toast.present();
      }
    } else {
      this.openPremium();
    }
  }

  showAlert(title:string, subTitle:string) {
    let alert = this.alertCtrl.create({
      title: title,
      subTitle: subTitle,
      buttons: ['OK']
    });
    alert.present();
  }
}
