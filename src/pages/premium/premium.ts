import {Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {AlertController, Loading, LoadingController, MenuController, NavController, PopoverController, ViewController} from 'ionic-angular';
import {Counter } from '../../shared/counter';
import {Subscription} from 'rxjs/Subscription';
import {BigButtonHelpPage} from '../popovers/big-button-help';
import {StepButtonHelpPage} from '../popovers/step-button-help';
import {SlideButtonHelpPage} from '../popovers/slide-button-help';
import {LocalStorageService} from 'ngx-webstorage';
import {IapService} from '../../services/iap.service';
import {PurchaseState} from '../../shared/purchase-state';

@Component({
  selector: 'page-premium',
  templateUrl: 'premium.html',
})
export class PremiumPage implements OnInit, OnDestroy{
  priceSubscription: Subscription;
  purchaseStateSubscription: Subscription;
  private loadingShowed = false;
  private loader: Loading;
  private price: string = 'Price is loading';
  constructor(public viewCtrl: ViewController, public loadingCtrl: LoadingController, private iap: IapService, private alertCtrl: AlertController) {}

  ngOnInit() {
    this.priceSubscription = this.iap.getPremiumPrice().subscribe((price: string) => {
      if (price && price.length > 0)
        this.price = 'Unlock for ' + price;
      else
        this.price = 'Price is loading';
    });
    this.purchaseStateSubscription = this.iap.getPurchaseState().subscribe((purchaseState: PurchaseState) => {
      if (purchaseState === PurchaseState.Purchased) {
        if (this.loadingShowed)
          this.hideLoading();
        this.showAlert('Success', 'Premium unlocked');
        this.dismiss();
      } else if (this.loadingShowed) {
        if (purchaseState === PurchaseState.Canceled) {
          this.hideLoading();
          this.showAlert('Canceled', 'Purchase canceled!');
        } else if (purchaseState === PurchaseState.Fail) {
          this.hideLoading();
          this.showAlert('Failed', 'Purchase failed!');
        }
      }
    });
  }

  ngOnDestroy() {
    this.priceSubscription.unsubscribe();
    this.purchaseStateSubscription.unsubscribe();
  }

  restore() {
    this.iap.restore();
  }

  hideLoading() {
    if (this.loadingShowed) {
      this.loadingShowed = false;
      this.loader.dismiss();
    }
  }

  showLoading() {
    if (!this.loadingShowed) {
      this.loadingShowed = true;
      this.loader = this.loadingCtrl.create({
        content: "Please wait...",
      });
      this.loader.present();
    }
  }

  dismiss() {
    this.viewCtrl.dismiss({});
  }

  purchase() {
    if (this.iap.purchasePremium()) {
      this.showLoading();
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
