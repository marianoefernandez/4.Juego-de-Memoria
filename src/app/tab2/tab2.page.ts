import { Component, OnDestroy, OnInit } from '@angular/core';
import { AutenticacionService } from '../servicios/autenticacion.service';
import { Subscription, firstValueFrom } from 'rxjs';
import { puntaje, tiempo } from './puntajes';
import { FirestoreService } from '../servicios/firestore.service';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page implements OnInit,OnDestroy{

  public mi_avatar : string;
  public puntajes: puntaje[] = []
  public suscripcion:Subscription | null = null
  public suscripcionDos:Subscription | null = null;
  public dificultadFiltrada:string = "FÁCIL";
  public indiceDificultad:number = 0;
  public usuarios:any[] = [];
  // public puntajesFiltrados: puntaje[] = []

  constructor(public autenticador:AutenticacionService, public firestore:FirestoreService,private spinner:NgxSpinnerService) {

    this.mi_avatar = "";
    this.GenerarAvatar();

  }

  async ngOnInit()
  {
    this.autenticador.usuarioActual =  await firstValueFrom(this.autenticador.obtenerUsuarioLogueado());
    this.suscripcion = this.firestore.obtenerPuntajes().subscribe(puntajes =>
    {
      this.spinner.show();

      setTimeout(async () => {
        this.puntajes = await firstValueFrom(this.firestore.obtenerPuntajes());
        this.ordenarPuntajes();
        this.spinner.hide();
      }, 1000);
    })

    this.suscripcionDos = this.firestore.obtenerUsuarios().subscribe(usuarios =>
      {
        this.usuarios = this.usuarios.concat(usuarios);
      })
    // this.suscripcion = this.firstore.
    
  }
  
  public formatearFecha(fecha:Date)
  {
    let nuevaFecha = fecha.getDate() + "/" + (fecha.getMonth() + 1) + "/" + fecha.getFullYear();
    return nuevaFecha;
  }

  public obtenerEmail(id:number)
  {
    for (let i = 0; i < this.usuarios.length; i++) 
    {
        if(this.usuarios[i].id ==  id)
        {
          return this.usuarios[i].email;
        }
    }

    return "";
  }

  private ordenarPuntajes()
  {
    this.puntajes.sort( (a, b) => 
    {
      let retorno = 0;
      let segundoA = a.puntaje[this.indiceDificultad].segundos;
      let segundoB = b.puntaje[this.indiceDificultad].segundos;

      if(segundoA != null &&  segundoB != null)
      {
        retorno = segundoA - segundoB;

        if(retorno == 0)
        {
          let centesimaA = a.puntaje[this.indiceDificultad].centesimas;
          let centesimaB = b.puntaje[this.indiceDificultad].centesimas;

          if(centesimaA != null && centesimaB != null)
          {
            retorno = centesimaA - centesimaB;
          }
        }
      }
      else
      {
        if(segundoA == null)
        {
          retorno = 2000;
        }
        else
        {
          retorno = -2000;
        }
      }

      return retorno;
    });
  }


  
  async ngOnDestroy()
  {
    this.suscripcion?.unsubscribe();
    this.suscripcionDos?.unsubscribe();
  }

  public cambiarDificultad(dificultad:string)
  {

    if(this.dificultadFiltrada != dificultad)
    {
      this.spinner.show();
      setTimeout(() => {
        this.dificultadFiltrada = dificultad;
    
        switch(dificultad)
        {
          case "FÁCIL":
            this.indiceDificultad = 0;
            break;
          case "MEDIO":
            this.indiceDificultad = 1;
            break;
          default:
            this.indiceDificultad = 2;
        }
        
        this.ordenarPuntajes();
        this.spinner.hide();
      }, 1000);
    }
  }

  GenerarAvatar(){
  
    const valor : number = Date.now()
    const cadena : string = valor.toString() + "?d=identicon&f=y";

    this.mi_avatar = `https://www.gravatar.com/avatar/${ cadena }`;
    
  }

  hardcodearPuntajes()
  {
    const tiempoFacil : tiempo = {segundos:10,centesimas:33,fecha:new Date()};
    const tiempoMedio: tiempo = {segundos:19,centesimas:55,fecha:new Date(2022,4,11,4,8,17)};
    const tiempoDificil : tiempo = {segundos:22,centesimas:11,fecha:new Date(2023,6,6,9,15,7)};
    let listaTiempo: tiempo [] = [];

    listaTiempo.push(tiempoFacil);
    listaTiempo.push(tiempoMedio);
    listaTiempo.push(tiempoDificil);

    const puntajeNuevo : puntaje = 
    {
      id:10,
      puntaje:listaTiempo,
    }

    this.firestore.agregarNuevoPuntaje(puntajeNuevo);
  }


}
