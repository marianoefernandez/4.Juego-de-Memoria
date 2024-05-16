import { Component } from '@angular/core';
import { AutenticacionService } from '../servicios/autenticacion.service';
import { firstValueFrom } from 'rxjs';
import { NgxSpinnerService } from 'ngx-spinner';
import { Router } from '@angular/router';
import { FirestoreService } from '../servicios/firestore.service';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss']
})
export class TabsPage {

  constructor(public autenticador:AutenticacionService, private spinner:NgxSpinnerService,private router:Router,private firestore:FirestoreService) 
  {

  }

  async ngOnInit()
  {
    this.autenticador.usuarioActual =  await firstValueFrom(this.autenticador.obtenerUsuarioLogueado());
    await this.firestore.obtenerInfoUsuario(this.autenticador.usuarioActual.email);
    //console.log(this.firestore.datosUsuarioActual);
  }

  cerrarSesion()
  {
    this.spinner.show();
    setTimeout(async () => {
      await this.autenticador.cerrarSesion();
      this.navigate("sesiones");
      this.spinner.hide();
      
    }, 500);
  }

  public navigate(url:string)
  {
    this.router.navigateByUrl(url);
  }

}
