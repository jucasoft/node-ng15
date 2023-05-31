import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CalendarModule } from 'primeng/calendar';
import { CheckboxModule } from 'primeng/checkbox';
import { DropdownModule } from 'primeng/dropdown';
import { InputMaskModule } from 'primeng/inputmask';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { InputNumberModule } from 'primeng/inputnumber';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { NgSelectModule } from '@ng-select/ng-select';
import { TooltipModule } from 'primeng/tooltip';

// import { DatePickerConditionComponent } from './date-picker-condition.component';
// import { MultiselectConditionComponent } from './multiselect-condition.component';
// import { TextInputConditionComponent } from './text-input-condition.component';
import { InputConditionBaseComponent } from './input-condition-base.component';
// import { NumberInputConditionComponent } from './number-input-condition.component';
import { NgSelectConditionComponent } from './ng-select-condition.component';

@NgModule({
  declarations: [
    // DatePickerConditionComponent,
    // TextInputConditionComponent,
    // NumberInputConditionComponent,
    // MultiselectConditionComponent,
    InputConditionBaseComponent,
    NgSelectConditionComponent,
  ],
  exports: [
    // DatePickerConditionComponent,
    // TextInputConditionComponent,
    // NumberInputConditionComponent,
    // MultiselectConditionComponent,
    NgSelectConditionComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CalendarModule,
    CheckboxModule,
    DropdownModule,
    InputMaskModule,
    InputTextModule,
    MultiSelectModule,
    FormsModule,
    InputNumberModule,
    AutoCompleteModule,
    NgSelectModule,
    TooltipModule,
  ],
})
export class InputConditionModule {}
