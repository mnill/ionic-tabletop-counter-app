import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import {IonicApp, IonicErrorHandler, IonicModule, MenuController, NavController, ToastController} from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { Insomnia } from '@ionic-native/insomnia';
import { AppRate } from '@ionic-native/app-rate';

import { MyApp } from './app.component';
import { HomePage } from '../pages/home/home';
import {CounterComponent} from '../pages/home/counter.component';
import {CounterPopoverComponent} from '../pages/home/counter-popover.component';
import {LocalStorageService} from 'ngx-webstorage';
import {CountersStorageService} from '../services/counters-storage.service';
import {Ng2Webstorage} from 'ngx-webstorage';
import {LoadPage} from '../pages/load/load';
import {LogsPage} from '../pages/logs/logs';
import {BigButtonHelpPage} from '../pages/popovers/big-button-help';
import {StepButtonHelpPage} from '../pages/popovers/step-button-help';
import {SlideButtonHelpPage} from '../pages/popovers/slide-button-help';
import {PremiumPage} from '../pages/premium/premium';
import {IapService} from '../services/iap.service';
import {NativeAudio} from '@ionic-native/native-audio';
import {keyboardFix} from '../directives/keyboard-fix-directive';
import {HelpPage} from '../pages/help/help';

@NgModule({
  declarations: [
    MyApp,
    HomePage,
    LoadPage,
    LogsPage,
    BigButtonHelpPage,
    StepButtonHelpPage,
    SlideButtonHelpPage,
    PremiumPage,
    CounterComponent,
    keyboardFix,
    HelpPage,
    CounterPopoverComponent
  ],
  imports: [
    BrowserModule,
    Ng2Webstorage,
    IonicModule.forRoot(MyApp, {
      menuType: 'overlay',
    })
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage,
    LoadPage,
    LogsPage,
    BigButtonHelpPage,
    StepButtonHelpPage,
    SlideButtonHelpPage,
    HelpPage,
    PremiumPage,
    CounterPopoverComponent
  ],
  providers: [
    StatusBar,
    SplashScreen,
    MenuController,
    CountersStorageService,
    IapService,
    NativeAudio,
    Insomnia,
    ToastController,
    {provide: ErrorHandler, useClass: IonicErrorHandler}
  ]
})
export class AppModule {}
