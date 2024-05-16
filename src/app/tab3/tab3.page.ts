import { Component } from '@angular/core';
import { AutenticacionService } from '../servicios/autenticacion.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss']
})
export class Tab3Page {

  public mi_color:string;



  constructor(public autenticador:AutenticacionService) {
    this.mi_color = "";
  }

  async ngOnInit()
  {
    this.autenticador.usuarioActual =  await firstValueFrom(this.autenticador.obtenerUsuarioLogueado());
  }

  CambiarColor(color: string){

    this.mi_color = color;
  }

}
