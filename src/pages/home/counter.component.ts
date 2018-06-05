import {ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output, ViewChild, ViewChildren} from '@angular/core';
import {Counter} from '../../shared/counter';
import {ItemSliding, PopoverController, Slides} from 'ionic-angular';
import {CounterPopoverComponent} from './counter-popover.component';

@Component({
  selector: 'tableCounter-counter',
  templateUrl: 'counter.component.html'
})
export class CounterComponent {
  @ViewChild('slidingItem') private slider: any;

  @Input() counter: Counter;
  @Output() onRemove = new EventEmitter();
  @Output() onChanged = new EventEmitter<Counter>();
  @Output() onValueChanged = new EventEmitter<any>();
  @Output() onStepChanged = new EventEmitter<Counter>();

  private lastChange: number = 0;
  private lastChangeTimer: number = 0;

  constructor(public popoverCtrl: PopoverController, ) {}

  edit(slidingItem) {
    let popover = this.popoverCtrl.create(CounterPopoverComponent, {background:this.counter.color, name:this.counter.name}, {showBackdrop: true, enableBackdropDismiss:false});
    popover.present();
    slidingItem.close();
    popover.onWillDismiss((data) => {
      if (data && data.cancel === false) {
        this.counter.name = data.name;
        this.counter.color = data.color;
        this.onChanged.emit(this.counter);
      }
    })
  }

  remove() {
    this.onRemove.emit();
  }

  clear (slidingItem: ItemSliding) {
    slidingItem.close();
    this.counter.value = 0;
    this.counter.step = 10;
    this.onChanged.emit(this.counter);
  }

  changeValue(toAdd:number, isStep:boolean, event: Event) {
    try {
      event.preventDefault();
      event.stopPropagation();
    } catch (e) {}

    this.lastChange += toAdd;
    if (this.lastChangeTimer)
      clearTimeout(this.lastChangeTimer);
    this.lastChangeTimer = setTimeout(function () {
      this.lastChangeTimer = 0;
      this.lastChange = 0;
    }.bind(this), 6000);
    this.onValueChanged.emit({value:this.counter.value + toAdd, isStep:isStep});
  }

  openSlider() {
    this.slider._setOpenAmount(1);

    setTimeout(() => {
      const children = Array.from(
        // use _leftOptions if buttons are on the left (could be made to be dynamic)
        this.slider._rightOptions._elementRef.nativeElement.children,
      );
      // Calculate the width of all of the buttons
      const width = children.reduce(
        (acc: number, child: HTMLElement) => acc + child.offsetWidth,
        0,
      );

      // Open to the calculated width
      this.slider.moveSliding(width);
      this.slider._setOpenAmount(width, false);
    }, 0);
  }

  closeSlider() {
    this.slider.close();
  }

  changeStep(toAdd) {
    try {
      event.preventDefault();
      event.stopPropagation();
    } catch (e) {}

    this.onStepChanged.emit(this.counter.step + toAdd);
  }
}
