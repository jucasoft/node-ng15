import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnInit,
} from '@angular/core';
import {
  UntypedFormBuilder,
  UntypedFormControl,
  UntypedFormGroup,
} from '@angular/forms';
import { Subscription } from 'rxjs';
import { FormConditionItem } from ',/form-condition';
import { Store } from '@ngrx/store';

export type ConditionType =
  | 'string'
  | 'string_list'
  | 'boolean'
  | 'date_time'
  | 'date'
  | 'number';

export type ConditionsType = 'condition' | 'conditionGroup';

export interface ConditionFilter {
  conditions: Condition[];
  conditionsLog: Condition[];
  conditionMap: { [key: string]: ConditionFilter };
  type: string;
}

export interface Condition {
  type: ConditionType;
  fieldName: string;
  fieldValue: any;
  operator: string;
  enabled: boolean;
}

@Component({
  selector: 'app-input-condition-base-component',
  template: ``,
  styles: [],
  providers: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputConditionBaseComponent implements OnInit {
  get elements(): FormConditionItem[] {
    return this._elements;
  }

  @Input()
  set elements(value: FormConditionItem[]) {
    this._elements = value;
    if (!!this.fieldValue) {
      this.fieldValue.updateValueAndValidity();
    }
  }

  public _elements: FormConditionItem[];

  @Input()
  label: string;

  @Input()
  fieldName = '';

  subscriptions: Subscription[] = [];

  form: UntypedFormGroup;
  fieldValue: UntypedFormControl;
  operator: UntypedFormControl;
  enabled: UntypedFormControl;

  operators = ['=', '!=', '<', '<=', '>=', '>'];

  get value(): Condition {
    return this.form.value;
  }

  set value(valueSouece: Condition) {
    // nel caso dovesse arrivare il: "enabled === undefined"
    const value: Condition = { enabled: !!valueSouece.enabled, ...valueSouece };
    const { fieldName, ...valueB } = value;

    // nel form control setto solo i valori presenti come controller.
    this.form.setValue({ ...valueB });
    // dispaccio
    if (!!this.fieldName) {
      this.onChange({ ...value, fieldName: this.fieldName });
    } else {
      this.onChange(value);
    }
    this.onTouched();
  }

  constructor(
    protected formBuilder: UntypedFormBuilder,
    protected cd: ChangeDetectorRef,
    protected store$: Store
  ) {}

  getFieldValueController(): UntypedFormControl {
    return this.formBuilder.control(null);
  }

  getEnabledValidatorController(): UntypedFormControl {
    return this.formBuilder.control({ value: true, disabled: false });
  }

  ngOnInit(): void {
    this.fieldValue = this.getFieldValueController();
    this.operator = this.formBuilder.control({ value: '', disabled: false });
    this.enabled = this.getEnabledValidatorController();

    // create the inner form
    this.form = this.formBuilder.group({
      fieldValue: this.fieldValue,
      operator: this.operator,
      enabled: this.enabled,
      type: this.formBuilder.control(''),
    });

    this.subscriptions.push(
      // any time the inner form changes update the parent of any change
      this.form.valueChanges.subscribe((val) => {
        // console.log('valueChanges: ' + value);
        const value = this.form.getRawValue();
        if (!!this.fieldName) {
          this.onChange({ ...value, fieldName: this.fieldName });
        } else {
          this.onChange(value);
        }

        this.onTouched();
      })
    );

    this.valueChangesSubscribe();
  }

  valueChangesSubscribe() {
    // this.subscriptions.push(
    //   // any time the inner form changes update the parent of any change
    //   this.fieldValue.valueChanges.subscribe((value) => {
    //     //console.log(this.constructor.name + ' label: ' + this.label + ' fieldValueValueChanges: ', value);
    //     this.updateEnableStatusFromValue(value);
    //   })
    // );
  }

  ngOnDestroy() {
    this.subscriptions.forEach((s) => s.unsubscribe());
  }

  onChange: any = () => {};
  onTouched: any = () => {};
  onValidatorChange: any = () => {};

  registerOnChange(fn: () => void) {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void) {
    this.onTouched = fn;
  }

  registerOnValidatorChange?(fn: () => void) {
    this.onValidatorChange = fn;
  }

  writeValue(condition: Condition) {
    if (condition) {
      this.updateEnableStatusFromCondition(condition);
      this.value = condition;
    }

    if (condition === null) {
      this.form.reset();
    }
  }

  // communicate the inner form validation to the parent form
  validate(_: UntypedFormControl) {
    return { ...this.enabled.errors, ...this.fieldValue.errors };
  }

  updateEnableStatusFromCondition(condition: Condition) {
    const value = condition.fieldValue;
    const hasValue = !(!value || (Array.isArray(value) && value.length === 0));

    if (!condition.enabled) {
      this.enabled.setValue(false);
      if (hasValue) {
        this.enabled.enable();
      } else {
        this.enabled.disable();
      }
    } else {
      this.enabled.setValue(true);
      this.enabled.enable();
    }
  }

  updateEnableStatusFromValue(value: any) {
    if (
      !value ||
      (Array.isArray(value) && value.length === 0) ||
      value === 'null'
    ) {
      this.enabled.setValue(false);
      this.enabled.disable();
    } else {
      this.enabled.setValue(true);
      this.enabled.enable();
    }
  }
}
