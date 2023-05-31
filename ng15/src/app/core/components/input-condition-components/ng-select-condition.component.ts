import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  forwardRef,
  Input,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import {
  AbstractControl,
  ControlValueAccessor,
  UntypedFormControl,
  NG_VALIDATORS,
  NG_VALUE_ACCESSOR,
  ValidationErrors,
  Validator,
  ValidatorFn,
} from '@angular/forms';
import {
  Condition,
  InputConditionBaseComponent,
} from './input-condition-base.component';
import { FormConditionItem } from './form-condition';
// import { ValidatorOpt } from '@app/core/validators/j-validators';
import { Dictionary } from '@ngrx/entity';
import { Observable, of } from 'rxjs';
// import { FormConditionStoreSelectors } from '@root-store';

@Component({
  selector: 'app-ng-select-condition',
  template: `
    <div class="flex">
      <div class="inputgroup">
        <span class="error"></span>
        <p-dropdown
          *ngIf="operatorEnabled"
          [ariaLabel]="'input-operator ' + operator.value"
          class="input-operator"
          [formControl]="operator"
          [options]="operators"
        ></p-dropdown>
        <span class="p-float-label p-fluid">
          <ng-select
            #ngSelectComponent
            (open)="onOpen()"
            (change)="onNgChanged(); updateEnableStatusFromValue($event)"
            [loading]="loading$ | async"
            [bindLabel]="'description'"
            [formControl]="fieldValue"
            [groupBy]="multiple ? groupByFn : null"
            [items]="_elements"
            [multiple]="multiple"
            [closeOnSelect]="false"
            [hideSelected]="false"
            [selectableGroup]="multiple"
            [selectableGroupAsModel]="false"
            (keydown.control.a)="selectAll()"
            [virtualScroll]="true"
            id="{{ label }}"
          >
            <ng-template ng-multi-label-tmp let-items="items" let-clear="clear">
              <div
                *ngFor="let item of items.slice(0, 20)"
                [ngClass]="entitiesMap[item.key] ? null : getClass()"
                class="ng-value default"
              >
                <span *ngIf="item.disabled" class="ng-value-label">{{
                  item.description
                }}</span>
                <span
                  *ngIf="!item.disabled"
                  class="ng-value-label"
                  pTooltip="click to remove this item"
                  tooltipPosition="top"
                  (click)="clear(item); $event.stopPropagation()"
                  >{{ item.description }}</span
                >
              </div>

              <div class="ng-value" *ngIf="items.length > 10">
                <span class="ng-value-label"
                  >{{ items.length - 10 }} more...</span
                >
              </div>
            </ng-template>
            <ng-template ng-label-tmp let-item="item" let-clear="clear">
              <div
                [ngClass]="entitiesMap[item.key] ? null : getClass()"
                class="ng-value-wrapper default"
              >
                <span *ngIf="item.disabled" class="ng-value-label">{{
                  item.description
                }}</span>
                <span
                  *ngIf="!item.disabled"
                  class="ng-value-label"
                  pTooltip="click to remove this item"
                  tooltipPosition="top"
                  (click)="clear(item); $event.stopPropagation()"
                  >{{ item.description }}</span
                >
              </div>
            </ng-template>
            <ng-template
              ng-optgroup-tmp
              let-item="item"
              let-item$="item$"
              let-index="index"
            >
              <input
                id="item-{{ index }}"
                type="checkbox"
                [ngModel]="item$.selected"
                aria-label="{{ item.description }}"
                title="{{ item.description }}"
              />
              {{ item.description }}
            </ng-template>
            <ng-template
              ng-option-tmp
              let-item="item"
              let-item$="item$"
              let-index="index"
            >
              <input
                id="item-{{ index }}"
                type="checkbox"
                [ngModel]="item$.selected"
                aria-label="{{ item.description }}"
                title="{{ item.description }}"
              />
              {{ item.description }}
            </ng-template>
          </ng-select>
          <label for="{{ label }}">{{ label }} ({{ elements.length }})</label>
        </span>
        <span class="input-is-disable" *ngIf="!!this.fieldValue['warnings']">
          <button
            pButton
            type="button"
            pTooltip="remove items not allowed"
            tooltipPosition="top"
            icon="pi pi-eye-slash"
            class="p-button-xsm p-button-warning"
            (click)="removeItemsNotAllowed()"
          ></button>
        </span>
        <span class="input-is-disable">
          <p-checkbox
            [formControl]="enabled"
            binary="true"
            [ariaLabel]="label + ' checkbox ' + enabled.value"
          >
          </p-checkbox>
        </span>
      </div>
    </div>
  `,
  styleUrls: ['input-condition.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => NgSelectConditionComponent),
      multi: true,
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => NgSelectConditionComponent),
      multi: true,
    },
  ],
  styles: [``],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NgSelectConditionComponent
  extends InputConditionBaseComponent
  implements ControlValueAccessor, OnDestroy, Validator, AfterViewInit
{
  operators = ['=', '!='];

  selectedAll = false;

  loading$: Observable<boolean>;

  @Input()
  formControl: UntypedFormControl;

  @Input()
  multiple = true;

  @Input()
  operatorEnabled = false;

  @Input()
  typeOfSelect = 'string_list';

  @Input()
  validation: 'none' | 'warn' | 'error' = 'none';

  @ViewChild('ngSelectComponent')
  ngSelectComponent;

  groupByFn = (item) => 'ALL (CTRL+A)';

  entitiesMap: Dictionary<any>;

  get elements(): FormConditionItem[] {
    return this._elements;
  }

  onOpen() {
    setTimeout(() => {
      const scrollContainer = document.querySelector(
        '.ng-dropdown-panel-items'
      );
      if (scrollContainer) {
        scrollContainer.scrollTop = 0;
      }
    }, 0);
  }

  ngAfterViewInit(): void {
    this.loading$ = of(false);
    const input = this.ngSelectComponent.element.querySelector('input');
    input.ariaLabel = this.ariaLabelRenderer();
  }

  // per questo componente evito di stare in ascolto delle modifiche sul formControl
  // gestisco le eventuali modifiche attraverso il metodo della select.
  valueChangesSubscribe() {}

  /**
   * Creo una mappa dalla lista degli elementi selezionabili
   * Serve a capire se gli elementi selezionati sono presenti nella lista degli elementi da selezionare.
   * @param value
   */
  @Input()
  set elements(value: FormConditionItem[]) {
    this.entitiesMap = toDictionaryKey<FormConditionItem>(
      value,
      (item: FormConditionItem) => item.key
    );
    this._elements = value;
    if (!!this.fieldValue) {
      this.fieldValue.updateValueAndValidity();
    }
  }

  getClass(): string {
    if (this.fieldValue.invalid) {
      return 'p-error';
    }
    if (!!(this.fieldValue as any).warnings) {
      return 'p-warn';
    }
    return '';
  }

  override validate(_: UntypedFormControl): ValidationErrors {
    (this.formControl as any).warnings = (this.fieldValue as any).warnings;
    return this.fieldValue.errors;
  }

  registerOnChange(fn: () => void) {
    this.onChange = (value: Condition) =>
      (fn as any)({ ...value, type: this.typeOfSelect });
  }

  getFieldValueController() {
    const validators = [fieldValueValidator(this)];
    return this.formBuilder.control(null, validators);
  }

  selectAll() {
    if (this.selectedAll) {
      this.fieldValue.setValue(this._elements);
    } else {
      this.fieldValue.reset();
    }
    this.selectedAll = !this.selectedAll;
  }

  // writeValue(condition: Condition) {
  //   if (!this.multiple || Array.isArray(condition.fieldValue)) {
  //     super.writeValue(condition);
  //     return;
  //   }
  //   const fieldValue = condition.fieldValue
  //     .split(',')
  //     .filter((value) => value.length > 0);
  //   super.writeValue({ ...condition, fieldValue });
  // }

  ariaLabelRenderer(): string {
    let result: string = '';

    if (this.fieldValue.valid && Array.isArray(this.fieldValue.value)) {
      result =
        this.fieldValue.value && this.fieldValue.value.length > 0
          ? ` selected: ${(this.fieldValue.value as FormConditionItem[])
              .map((value: FormConditionItem) => value.description)
              .join(', ')}`
          : '';
    } else if (
      typeof this.fieldValue.value === 'string' ||
      typeof this.fieldValue.value === 'boolean' ||
      typeof this.fieldValue.value === 'number'
    ) {
      result = this.fieldValue.value as any;
    } else {
      result =
        this.fieldValue.errors &&
        this.fieldValue.errors.hasOwnProperty('multiselect')
          ? ` error: ${this.fieldValue.errors.multiselect.message}`
          : '';
    }
    return this.label + result;
    // return this.label;
  }

  removeItemsNotAllowed() {
    const items = (this.fieldValue.value as any[]).filter(
      (value) => !!this.entitiesMap[value.key]
    );
    this.fieldValue.setValue(items);
  }

  onNgChanged() {
    const input = this.ngSelectComponent.element.querySelector('input');
    input.ariaLabel = this.ariaLabelRenderer();
  }
}

export const fieldValueValidator = (elementsAware: {
  elements: FormConditionItem[];
  validation: 'none' | 'warn' | 'error';
}): ValidatorFn => {
  const optionsBase = new ValidatorOpt();
  optionsBase.error = true;
  optionsBase.level = elementsAware.validation;
  optionsBase.type = '';
  optionsBase.message = '';

  return (control: AbstractControl): ValidationErrors | null => {
    if (elementsAware.validation === 'none') {
      return null;
    }
    const elements: string[] = elementsAware.elements
      ? elementsAware.elements.map((value1) => value1.key)
      : [];
    const controlValue = control?.value ? control.value : [];
    const result = controlValue.reduce(
      (prev: string[], curr: FormConditionItem) => {
        if (!elements.includes(curr.key)) {
          prev.push(curr.description);
        }
        return prev;
      },
      []
    );
    if (result.length === 0) {
      (control as any).warnings = null;
      return null;
    }
    optionsBase.message = 'Elements not allowed: ' + result.join(', ');

    if (elementsAware.validation === 'warn') {
      (control as any).warnings = { multiselect: optionsBase };
      return null;
    } else {
      return { multiselect: optionsBase };
    }
  };
};

export const toDictionaryKey = <T>(
  items: T[],
  selectKey: (item: T) => string
) =>
  items.reduce((prev, curr: T) => {
    const id = selectKey(curr);
    prev[id] = curr;
    return prev;
  }, {});

export const booleanElements = [
  {
    description: 'true',
    enabled: true,
    key: true,
    type: 'boolean',
  },

  {
    description: 'false',
    enabled: true,
    key: false,
    type: 'boolean',
  },
] as any;
