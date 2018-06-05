import {Component, ElementRef, HostListener, OnDestroy, ViewChild} from '@angular/core';
import {NavParams, ViewController} from 'ionic-angular';

@Component({
  templateUrl: 'counter-popover.component.html'
})
export class CounterPopoverComponent {
  @ViewChild( 'myInput') inputElm : ElementRef;
  @HostListener( 'keydown', ['$event'] )
  keyEvent( e )
  {
    var code = e.keyCode || e.which;
    if( code === 13 )
    {
      if( e.srcElement.tagName === "INPUT" )
      {
        e.preventDefault();
        e.srcElement.blur();
      }
    }
  };

  private background: string;
  private name: string;

  constructor(public viewCtrl: ViewController, private navParams: NavParams) {}

  ngOnInit() {
    if (this.navParams.data) {
      this.navParams.data.background && (this.background = this.navParams.data.background);
      this.navParams.data.name && (this.name = this.navParams.data.name);
    }
  }

  cancel() {
    this.viewCtrl.dismiss({cancel:true});
  }

  ok() {
    this.viewCtrl.dismiss({cancel:false, name:this.name, color:this.background});
  }

  changeBackground(color) {
    this.background = color;
  }
}
