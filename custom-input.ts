import { Component, Input, ViewChild, Output, EventEmitter, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { FormControl } from '@angular/forms';
import { DatePipe, DecimalPipe, } from '@angular/common';
import { TextInput } from 'ionic-angular';

/* Usage Examples:
 *   When there is a formControlName we can use the following attaching the exact form field to the [formField] Input():
 *
 *   <custom-number-input item-content
 *         [placeholder]="'0.00'"
 *         [formField]="productForm.controls.price"
 *         (ionChange)="assignPrice('defaultPrice', 'pricelist1', $event)
 *    >
 *    </custom-number-input>
 *
 *   When there is the ngModel need, we can address it the same way but with double binding on the field "model", as follows:
 *
 *    <custom-number-input item-content
 *      [(model)]="priceLists[menu]['defaultPrice']"
 *       [placeholder]="0.00"
 *    ></custom-number-input>
 */
@Component({
  selector: 'custom-number-input',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ion-input [placeholder]="placeholder"
        (change)="update($event)"
        [value]="displayValue"
        type="tel"
        pattern="\\d*"
    >
    </ion-input>
    <!-- ion-label color='danger' *ngIf="formField.hasError('wrongFormat')">X,XXX.XX | XXXX.XX</ion-label -->
    `,
})
export class OxlNumberComponent {

  @Input() placeholder: string;

  /* formControl version */
  @Input() formField: FormControl;

  /* used to grab regular text change event */
  @ViewChild(TextInput) textInput: TextInput;

  /* event that encapsulates the real ionChange, used same name to avoid confusion */
  @Output() ionChange: EventEmitter<any> = new EventEmitter();

  /* The user has the option to set the identation mode on or off. Default is on. */
  @Input()
  set ident(val) {
    if (typeof (val) === 'boolean')
      this.modifyValue = val;
  }

  /* ngModel equivalent Version */
  @Input()
  get model() {
    return this._ngModel;
  }

  set model(val) {
    this._ngModel = val;
    if (!this.modifyValue)
      this.displayValue = val;
    else
      this.displayValue = !this._ngModel ? '0.00' : this.decimalPipe.transform(this._ngModel, '1.2-2');
    this.textInput.setValue(this.displayValue);
    this.modelChange.emit(this._ngModel);
    this.ref.markForCheck();
    // this.actualUpdate({ fromNgModel: true });
  }

  @Output() modelChange = new EventEmitter();
  _ngModel: any;

  /* this is the string displayed value */
  displayValue: string;
  numberValue: any;
  modifyValue: boolean = true;


  constructor(private decimalPipe: DecimalPipe, private ref: ChangeDetectorRef) {
  }

  ngAfterViewInit() {
    if (this.formField)
      this.formField.registerOnChange(() => {
        this.update({ value: this.formField.value ? this.formField.value : null, fromForm: true });
      });
  }

  update(event) {
    /* if the form changed value, display it only */
    if (event.fromForm) {
      this.displayValue = this.returnCorrectValue(event);
      // this.displayValue = !event.value ? '0.00' : this.decimalPipe.transform(event.value, '1.2-2');
      this.numberValue = !event.value ? 0 : Number(event.value);
      if (this.formField.value !== this.numberValue) {
        // if (this.displayValue === 'ERROR') {
        //   this.formField.setErrors({ 'wrongFormat': true });
        // }
        /* restrict this */
        this.formField.setValue(Number(this.numberValue));
        this.formField.parent.markAsDirty();
      }
    }
    /* if this is a regular text input situation, display it */
    else {
      this.displayValue = this.returnCorrectValue(this.textInput);
      // this.displayValue = !this.textInput.value ? '0.00' : this.decimalPipe.transform(this.textInput.value, '1.2-2');
      this.numberValue = !this.textInput.value ? 0 : Number(this.textInput.value);
      /* also set the form field if exists to the correct value */
      if (this.formField) {
        if (this.formField.value !== this.numberValue) {
          // if (this.displayValue === 'ERROR') {
          //   this.formField.setErrors({ 'wrongFormat': true });
          // }
          /* restrict this */
          this.formField.setValue(Number(this.numberValue));
          this.formField.markAsDirty();
        }
      }
    }

    // TODO code below needs refactoring
    /* prepare the ngmodel */
    this._ngModel = Number(this.numberValue);
    /* check refiring ... */
    this.model = this._ngModel;
    /* return the ionChange event to be grabbed when needed */
    event['value'] = this._ngModel;
    // this.model();
    this.textInput.setValue(this.displayValue);
    this.ionChange.emit(event);
    this.ref.markForCheck();
  }

  returnCorrectValue(input) {
    if (!this.modifyValue)
      return input;
    if (!input.value) { return '0.00'; }
    if (input.value && typeof input.value === 'string')
      input.value = input.value.split(/[\s,]+/).join('');
    try {
      return this.decimalPipe.transform(input.value, '1.2-2');
    }
    catch (e) {
      console.log((<Error>e).message);
      return 'ERROR';
    }
  }
}

