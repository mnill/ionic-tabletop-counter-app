import {LocalStorageService} from 'ngx-webstorage';
import {Observable} from 'rxjs/Observable';
import {Counter, CountersPreset} from '../shared/counter';
import {Subject} from 'rxjs/Subject';
import {Injectable, OnInit} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {Log} from '../shared/log';
import {PurchaseState} from '../shared/purchase-state';
import {Platform} from 'ionic-angular';

declare let store: any;

@Injectable()
export class IapService {
  private purchaseStateSubject = new BehaviorSubject<PurchaseState>(PurchaseState.Loading);
  private _purchaseState: PurchaseState = PurchaseState.Loading;
  private premiumPriceSubject = new BehaviorSubject<string>('');

  private set purchaseState(state: PurchaseState) {
    if (this._purchaseState !== PurchaseState.Purchased) {
      this._purchaseState = state;
      this.purchaseStateSubject.next(this._purchaseState);
    }
  }

  private get purchaseState(): PurchaseState {
    return this._purchaseState;
  }

  constructor(private storage:LocalStorageService, platform: Platform) {
    if (this.storage.retrieve('premium') === 'true') {
      this.purchaseState = PurchaseState.Purchased;
    }
    platform.ready().then(() => {
      if ('cordova' in window && this.purchaseState !== PurchaseState.Purchased) {
        this.initStore();
      }
    });
  }

  isPremiumUnlocked(): boolean {
    return this.purchaseState === PurchaseState.Purchased;
  }

  getPurchaseState(): Observable<PurchaseState> {
    return this.purchaseStateSubject.asObservable();
  }

  getPremiumPrice(): Observable<string> {
    return this.premiumPriceSubject.asObservable();
  }

  purchasePremium() : boolean {
    if (this.purchaseState !== PurchaseState.Purchased && this.purchaseState !== PurchaseState.Loading) {
      this.purchaseState = PurchaseState.InProgress;
      store.order('com.mnillstone.counter.premium');
      return true;
    } else {
      return false;
    }
  }

  restore() {
    if (store.restore)
      store.restore();
    else
      store.refresh();
  }

  initStore() {
    this.registerProduct('com.mnillstone.counter.premium');
    store.register({
      id: "com.mnillstone.counter.premium",
      alias: "Premium",
      type: store.NON_CONSUMABLE
    });
    store.refresh();
  }

  registerProduct(id:string) {
    store.when(id).loaded((product) => {
      if (product.canPurchase) {
        if (id === 'com.mnillstone.counter.premium') {
          this.premiumPriceSubject.next(product.price);
          this.purchaseState = PurchaseState.Initiated;
        }
      }
    });
    store.when(id).cancelled(() => {
      this.purchaseState = PurchaseState.Canceled;
    });
    store.when(id).error(() => {
      this.purchaseState = PurchaseState.Fail;
    });
    store.when(id).unverified(() => {
      this.purchaseState = PurchaseState.Fail;
    });
    store.when(id).approved((product) => {
      this.purchaseState = PurchaseState.Purchased;
    });
  }
}
