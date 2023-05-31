import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { InputConditionModule } from './core/components/input-condition-components/input-condition.module';

const routes: Routes = [];

@NgModule({
  imports: [RouterModule.forRoot(routes), InputConditionModule],
  exports: [RouterModule]
})
export class AppRoutingModule { }
