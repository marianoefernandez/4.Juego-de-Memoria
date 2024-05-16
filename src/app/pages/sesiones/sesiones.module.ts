import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SesionesPageRoutingModule } from './sesiones-routing.module';

import { SesionesPage } from './sesiones.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SesionesPageRoutingModule,
    ReactiveFormsModule
  ],
  declarations: [SesionesPage]
})
export class SesionesPageModule {}
