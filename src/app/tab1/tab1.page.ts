import { Component } from '@angular/core';
import { NavController } from '@ionic/angular';
import { AutenticacionService } from '../servicios/autenticacion.service';
import { firstValueFrom } from 'rxjs';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { carta } from './tarjeta';
import { puntaje, tiempo } from '../tab2/puntajes';
import { FirestoreService } from '../servicios/firestore.service';

const TIEMPOTIRADA = 3000;

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page {

  public nombre:string;
  public apellido:string;
  public mostrar:boolean;
  public direccion:string;
  public estadoJuego:string = "menu";
  public dificultad:string = "";
  public listaCartas : carta[] = [];
  public valorTabla = 0
  public valorTablaStr = "";
  public valorTablaCubiertaStr = "";
  public valorWith = "0%";
  public segundos = 0;
  public centesimas = 0;
  public intervaloTiempo : any = null; 
  public intervaloActualizacion : any = null;
  public primerTarjetaSeleccionada : carta | null = null;
  public segundaTarjetaSeleccionada : carta | null = null;
  public tiempoUltimoDestape = 0;
  public opacidad = 1;
  public alertHidden = true;
  public puntaje : puntaje | null = null;

  constructor(public navCtrl: NavController,public autenticador:AutenticacionService,private router:Router,public spinner:NgxSpinnerService,public firestore:FirestoreService) {
    this.nombre = "";
    this.apellido = "";
    this.mostrar = false;
    this.direccion = "";
  }

  async ngOnInit()
  {
    this.spinner.show();
    this.autenticador.usuarioActual =  await firstValueFrom(this.autenticador.obtenerUsuarioLogueado());

    if(this.firestore.datosUsuarioActual == null)
    {
      await this.firestore.obtenerInfoUsuario(this.autenticador.usuarioActual.email);
    }

    this.spinner.hide();
  }

  MostrarDatos(nombre:any, apellido:any){
    this.nombre = nombre;
    this.apellido = apellido;
    this.mostrar = true;
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

  public setearTiempo()
  {
    this.intervaloTiempo = setInterval(() => {
      this.centesimas += 1;
      if(this.centesimas == 99)
      {
        this.centesimas = 0;
        this.segundos += 1;
      }
    }, 10);
  }
  
  public salirDelJuego()
  {
    this.spinner.show();
    setTimeout(() => {
      this.estadoJuego = "menu";
      this.listaCartas = [];
      clearInterval(this.intervaloTiempo);
      clearInterval(this.intervaloActualizacion);
      this.alertHidden = true;
      this.spinner.hide();
    }, 2000);
  }

  private crearCartas(dificultad:string,cantidad:number)
  {
    for (let i = 0; i < cantidad/2; i++) 
    {
      const cartaCreada : carta = 
      {
        visible : false,
        descubierto : false,
        id : i,
        superficie:"../../assets/memost/" + dificultad + "/" + i.toString() + ".png"
      };
      const cartaCreadaDos : carta = 
      {
        visible : false,
        descubierto : false,
        id : i,
        superficie:"../../assets/memost/" + dificultad + "/" + i.toString() + ".png"
      };
      this.listaCartas.push(cartaCreada);
      this.listaCartas.push(cartaCreadaDos);
    }
  }

  private async obtenerPuntaje()
  {
    const puntaje = await this.firestore.obtenerPuntaje(this.firestore.datosUsuarioActual.id);

    return puntaje;
  }

  private generarCartas()
  {
    let descuento = 50;
    let division = 6;
    switch(this.dificultad)
    {
      case "facil":
        this.valorWith = "40%";
        this.crearCartas('facil',6);
        console.log(this.listaCartas);
        break;
      case "medio":
        this.valorWith = "40%";
        this.crearCartas('medio',10);
        division = 10;
        break;
      case "dificil":
        descuento = -20;
        this.valorWith = "20%";
        this.crearCartas('dificil',16);
        division = 10;
        break;
    }

    this.valorTabla = (450 - descuento ) / division * 2;
    this.valorTablaStr = this.valorTabla.toString() + "px";
    this.valorTablaCubiertaStr = (this.valorTabla - 2.5).toString() + "px";
    this.listaCartas.sort(function() { return Math.random() - 0.5 });
    
  }

  public voltearCarta(indice:number)
  {
    if(this.obtenerCantidadCartas(false) < 2)
    {
      if(!this.listaCartas[indice].visible)
      {
        if(this.primerTarjetaSeleccionada == null)
        {
          this.primerTarjetaSeleccionada = this.listaCartas[indice];
        }
        else
        {
          this.segundaTarjetaSeleccionada = this.listaCartas[indice];
        }

        this.listaCartas[indice].visible = true;
        this.tiempoUltimoDestape = new Date().getTime();
      }
    }
  }

  private obtenerCantidadCartas(estado:boolean)
  {
    let cantidad = 0;

    for (let i = 0; i < this.listaCartas.length; i++) {
      const carta = this.listaCartas[i];
      if(carta.descubierto == estado && carta.visible)
      {
        cantidad+=1;
      }
    }

    return cantidad;
  }
  public actualizarJuego()
  {
    this.intervaloActualizacion = setInterval(() => {
      let tiempoActual = new Date();
      if(tiempoActual.getTime() >= TIEMPOTIRADA + this.tiempoUltimoDestape && this.tiempoUltimoDestape > 0)
      {
        this.tiempoUltimoDestape = 0;
        
        for (let i = 0; i < this.listaCartas.length; i++) {
          const carta = this.listaCartas[i];
          if(carta.descubierto == false)
          {
            carta.visible = false;
            this.primerTarjetaSeleccionada = null;
            this.segundaTarjetaSeleccionada = null;
          } 
        }
      }

      if(this.tiempoUltimoDestape > 0)
      {
        let retorno = this.encontrarTarjetas();

        if(retorno != null)
        {
          if(retorno)
          {
            this.tiempoUltimoDestape = 0;
            console.log("COINCIDEN LAS IMAGENES");
            //SONIDO DE EXITO

            //VERIFICO SI SE TERMINO EL JUEGO
            if(this.obtenerCantidadCartas(true) == this.listaCartas.length)
            {
              this.terminarJuego();
            }
          }
          else
          {
            this.tiempoUltimoDestape-=2000;
            console.log("NO COINCIDEN LAS IMAGENES");
            //SONIDO DE FRACASO
          }

          this.primerTarjetaSeleccionada = null;
          this.segundaTarjetaSeleccionada = null;
        }
      }
    }, 8.33);
  }

  public async asignarPuntaje()
  {
    let puntaje = await this.obtenerPuntaje();
    let indice = 0;

    if(puntaje != null)
    {
      switch(this.dificultad)
      {
        case "facil":
          indice = 0;
          break;
        case "medio":
          indice = 1;
          break;
        default:
          indice = 2;
      }

      if(puntaje.puntaje[indice].segundos != null)
      {
        if(puntaje.puntaje[indice].segundos > this.segundos || (puntaje.puntaje[indice].segundos == this.segundos && puntaje.puntaje[indice].centesimas > this.centesimas))
        {
          puntaje.puntaje[indice].centesimas = this.centesimas;
          puntaje.puntaje[indice].segundos = this.segundos;   
          puntaje.puntaje[indice].fecha = new Date();   
        }
      }
      else
      {
        puntaje.puntaje[indice].centesimas = this.centesimas;
        puntaje.puntaje[indice].segundos = this.segundos;
        puntaje.puntaje[indice].fecha = new Date();
      }

      await this.firestore.editarPuntaje(this.firestore.datosUsuarioActual.id,puntaje);
    }
    else
    {
      const tiempoFacil : tiempo = {segundos:null,centesimas:null,fecha:null};
      const tiempoMedio: tiempo = {segundos:null,centesimas:null,fecha:null};
      const tiempoDificil : tiempo = {segundos:null,centesimas:null,fecha:null};
      let listaTiempo: tiempo [] = [];

      switch(this.dificultad)
      {
        case "facil":
          tiempoFacil.segundos = this.segundos;
          tiempoFacil.centesimas = this.centesimas;
          tiempoFacil.fecha = new Date();
          break;
        case "medio":
          tiempoMedio.segundos = this.segundos;
          tiempoMedio.centesimas = this.centesimas;
          tiempoFacil.fecha = new Date();
          break
        default:
          tiempoDificil.segundos = this.segundos;
          tiempoDificil.centesimas = this.centesimas;
          tiempoFacil.fecha = new Date();
      }

      listaTiempo.push(tiempoFacil);
      listaTiempo.push(tiempoMedio);
      listaTiempo.push(tiempoDificil);

      const puntajeNuevo : puntaje = 
      {
        id:this.firestore.datosUsuarioActual.id,
        puntaje:listaTiempo,
      }

      this.firestore.agregarNuevoPuntaje(puntajeNuevo);
    }
  }

  public async terminarJuego()
  {
    clearInterval(this.intervaloTiempo);
    clearInterval(this.intervaloActualizacion);

    this.spinner.show();
    await this.asignarPuntaje();
    
    setTimeout(() => {
      this.opacidad = 0.4;
      this.alertHidden = false;
      this.spinner.hide();
    }, 2000);
  }

  public encontrarTarjetas()
  {
    let retorno = null;
    if(this.primerTarjetaSeleccionada != null && this.segundaTarjetaSeleccionada != null)
    {
      retorno = false;

      if(this.primerTarjetaSeleccionada.id == this.segundaTarjetaSeleccionada.id)
      {
        this.descubrirTarjetas(this.primerTarjetaSeleccionada.id);
        retorno = true;
      }
    }

    return retorno;
  }

  public descubrirTarjetas(id:number)
  {
    let contador = 0;
    
    for (let i = 0; i < this.listaCartas.length; i++) {
      const carta = this.listaCartas[i];

      if(carta.id == id && carta.descubierto == false)
      {
        carta.descubierto = true;
        contador+=1;
      }

      if(contador == 2)
      {
        break;
      }
      
    }
  }

  public empezarJuego(dificultad:string)
  {
    this.spinner.show();
    setTimeout(() => {
      this.listaCartas = [];
      this.dificultad = dificultad;
      this.segundos = 0;
      this.centesimas = 0;
      this.estadoJuego = "jugando";
      this.opacidad = 1;
      this.alertHidden = true;
      this.generarCartas();
      this.setearTiempo();
      this.actualizarJuego();
      this.spinner.hide();
    }, 2000);
  }

}
