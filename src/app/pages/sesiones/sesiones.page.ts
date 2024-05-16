import {Component, ElementRef, OnInit, Renderer2, ViewChild} from '@angular/core';
import { Router } from '@angular/router';
import {AutenticacionService} from '../../servicios/autenticacion.service'
import {NgxSpinnerService} from 'ngx-spinner'
import { firstValueFrom } from 'rxjs';
import swal from 'sweetalert2';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FirestoreService } from 'src/app/servicios/firestore.service';


@Component({
  selector: 'app-sesiones',
  templateUrl: './sesiones.page.html',
  styleUrls: ['./sesiones.page.scss'],
})
export class SesionesPage implements OnInit {

  @ViewChild("login") public login!:ElementRef;
  @ViewChild("register") public register!:ElementRef;
  @ViewChild("reset") public reset!:ElementRef;
  @ViewChild("loginA") public loginA!:ElementRef;
  @ViewChild("registerA") public registerA!:ElementRef;
  @ViewChild("resetA") public resetA!:ElementRef;


  public email : string = "";
  public clave : string = "";
  public mensajeError : string = "";

  public formularioRegistro: FormGroup = this.forms.group({
    email: ['', [Validators.email, Validators.required]],
    clave: ['', [Validators.required, Validators.minLength(6)]]
  }); 

  constructor(private renderer2:Renderer2,private forms: FormBuilder,private router:Router,private autenticador:AutenticacionService, private firestore:FirestoreService ,private spinner:NgxSpinnerService)
  {

  }

  ngOnInit(): void 
  {
    this.formularioRegistro.reset();
  }

  esValidoElCampo(campo: string): boolean | null 
  {
    return this.formularioRegistro.controls[campo].errors && this.formularioRegistro.controls[campo].touched;
  }

  obtenerError(campo: string): string | null {
    if (!this.formularioRegistro.controls[campo] && !this.formularioRegistro.controls[campo].errors) return null;

    const errores = this.formularioRegistro.controls[campo].errors;
    for (const clave of Object.keys(errores!)) 
    {
      switch (clave) 
      {
        case 'required':
          return "Este campo es requerido";
        case 'minlength':
          return `Minimo ${errores!['minlength'].requiredLength} caracteres.`;
        case 'maxlength':
          return `Maximo ${errores!['maxlength'].requiredLength} caracteres.`;
        case 'min':
          return `Como minimo debe ser ${errores!['min'].min}.`;
        case 'max':
          return `Como maximo debe ser ${errores!['max'].max}.`;
        case 'email':
          return "El formato del mail es incorrecto";
      }
    }
    return null;
  }

  public cambiarPanel(estado:string)
  {
    this.email = "";
    this.clave = "";
    this.formularioRegistro.reset();
    this.mensajeError = "";

    if (estado == "login")
    {
      this.renderer2.addClass(this.login.nativeElement,"show");
      this.renderer2.removeClass(this.login.nativeElement,"hide");
      this.renderer2.removeClass(this.register.nativeElement,"show");
      this.renderer2.removeClass(this.reset.nativeElement,"show");
      this.renderer2.addClass(this.register.nativeElement,"hide");
      this.renderer2.addClass(this.reset.nativeElement,"hide");

      this.renderer2.addClass(this.loginA.nativeElement,"active")
      this.renderer2.removeClass(this.registerA.nativeElement,"active");
      this.renderer2.removeClass(this.resetA.nativeElement,"active");

    }
    else
    {
      if(estado == "register")
      {
        this.renderer2.addClass(this.register.nativeElement,"show");
        this.renderer2.removeClass(this.register.nativeElement,"hide");
        this.renderer2.removeClass(this.login.nativeElement,"show");
        this.renderer2.removeClass(this.reset.nativeElement,"show");
        this.renderer2.addClass(this.login.nativeElement,"hide");
        this.renderer2.addClass(this.reset.nativeElement,"hide");

        this.renderer2.removeClass(this.loginA.nativeElement,"active")
        this.renderer2.addClass(this.registerA.nativeElement,"active");
        this.renderer2.removeClass(this.resetA.nativeElement,"active");
      }
      else
      {
        this.renderer2.addClass(this.reset.nativeElement,"show");
        this.renderer2.removeClass(this.reset.nativeElement,"hide");
        this.renderer2.removeClass(this.register.nativeElement,"show");
        this.renderer2.removeClass(this.login.nativeElement,"show");
        this.renderer2.addClass(this.register.nativeElement,"hide");
        this.renderer2.addClass(this.login.nativeElement,"hide");

        this.renderer2.removeClass(this.loginA.nativeElement,"active")
        this.renderer2.removeClass(this.registerA.nativeElement,"active");
        this.renderer2.addClass(this.resetA.nativeElement,"active");
      }
    }
  }

  public registrarse()
  {
    this.spinner.show()

    setTimeout(() => {
      if(this.formularioRegistro.valid)
      {
        console.log(this.formularioRegistro.value.email);
        this.autenticador.registro(this.formularioRegistro.value.email,this.formularioRegistro.value.clave).then(respuesta => {
          setTimeout(() => {
            if(typeof respuesta != "string")
            {
              console.log("Registrado con éxito: " + this.formularioRegistro.value.email);
              swal.fire
              (
                {
                  icon:"success",
                  title:"El usuario se ha registrado con éxito",
                  text:"Se ha enviado un email a " + this.formularioRegistro.value.email + " por favor verificar el mismo",
                  heightAuto: false
                }
              ).then(()=>
                {
                  this.cambiarPanel("login");
                })
            }
            else
            {
              this.mensajeError = "Error al registrarse. Usuario ya registrado";
              setTimeout(() => {
                this.mensajeError = "";
              }, 2000);
            }
          }, 500)
        }) 
      }
      else
      {
        this.formularioRegistro.markAllAsTouched();
      }

      this.spinner.hide();
    }, 2000);
  }

  public accesoRapido(email:string,clave:string)
  {
    this.email = email;
    this.clave = clave;
    //this.loguearse();
  }

  public loguearse()
  {
    this.spinner.show()  
    this.autenticador.login(this.email,this.clave).then(respuesta => {
      setTimeout(async () =>{

        if(typeof respuesta != "string")
        {
          const observable = this.autenticador.obtenerUsuarioLogueado();
          this.autenticador.usuarioActual = await firstValueFrom(observable);
          await this.firestore.obtenerInfoUsuario(this.autenticador.usuarioActual.email);
          this.navigate("tabs");
        }
        else
        {
          this.mostrarError(respuesta);
          setTimeout(() => {
            this.mensajeError = "";
          }, 3000);
        }
        this.spinner.hide();
      },2000)
    })
  }

  public mostrarError(error:string)
  {
    switch(error)
    {
      case "auth/invalid-email":
        this.mensajeError = 'El formato de correo es invalido';
        break;
      case "auth/operation-not-allowed":
        this.mensajeError = "Operación no permitida"
        break;
      default:
        this.mensajeError = 'Los datos no son correctos. Por favor verifique los mismos.'
    }

    if (this.email == "" || this.clave == "")
    {
      this.mensajeError = "El campo email o contraseña están vacios por favor ingrese sus datos";
    }

    if (this.email == "")
    {
      this.mensajeError = "El campo email está vació. Por favor ingrese su mail";
    }
  }

  public async recuperarClave()
  {
    this.spinner.show();
    let respuesta = await this.autenticador.recuperarClave(this.email);

    setTimeout(() => {
      if(respuesta)
      {
        swal.fire
        (
          {
            icon:"success",
            title:"Recuperación de clave exitosa",
            text:"Se ha enviado un email a " + this.email + " por favor verificar el mismo para poder recuperar la clave",
            heightAuto: false
          }
        ).then(()=>
          {
            this.cambiarPanel("login");
          })    
      }
      else
      {
        swal.fire
        (
          {
            icon:"error",
            title:"Recuperación de clave fallida",
            text:"Error al enviar el email. revise el formato del mismo por favor",
            heightAuto: false
          }
        )
      }
      this.spinner.hide();
    }, 500);
  }
  
  public navigate(url:string)
  {
    this.router.navigateByUrl(url);
  }
}
