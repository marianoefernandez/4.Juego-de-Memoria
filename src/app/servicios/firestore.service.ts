import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, onSnapshot, query, where, getDocs, updateDoc, doc } from '@angular/fire/firestore';
import { BehaviorSubject, Observable } from 'rxjs';
import { puntaje } from '../tab2/puntajes';

@Injectable({
  providedIn: 'root'
})

export class FirestoreService {

  constructor(private firestore: Firestore) { }

  private puntajes = collection(this.firestore,'puntajes');
  private usuarios = collection(this.firestore,"usuarios");
  public datosUsuarioActual:any;

  agregarInformacionUsuario(usuario:any)
  {
    try
    {
      return addDoc(this.usuarios,usuario);
    }
    catch(error:any)
    {
      console.log(error.code);
      return null;
    }
  }

  agregarNuevoPuntaje(puntaje:any)
  {
    try
    {
      return addDoc(this.puntajes,puntaje);
    }
    catch(error:any)
    {
      console.log(error.code);
      return null;
    }
  }

  async editarPuntaje(idJugador:number,dato:any)
  {
    try
    {
      const consulta = query(this.puntajes, where("id", "==", idJugador));
      const consultaEjecuto = await getDocs(consulta);
      consultaEjecuto.forEach(async (datos) => 
      {
        // doc.data() is never undefined for query doc snapshots
        const id = datos.id;
        await updateDoc(doc(this.firestore,"puntajes",id),dato)
      });   
      return true;
     }
    catch(error:any)
    {
      console.log(error.code);  
      return null;
    }
  }

  async obtenerPuntaje(idJugador:number)
  {
    try
    {
      const consulta = query(this.puntajes, where("id", "==", idJugador));
      const consultaEjecuto = await getDocs(consulta);
      let puntaje:any = null;
      consultaEjecuto.forEach((datos) => 
      {
        // doc.data() is never undefined for query doc snapshots
        puntaje = datos.data();
      });   
      return puntaje;
     }
    catch(error:any)
    {
      console.log(error.code);
      return null;
    }
  }

  async obtenerInfoUsuario(email:string)
  {
    try
    {
      const consulta = query(this.usuarios, where("email", "==", email));
      const consultaEjecuto = await getDocs(consulta);
      let datos = false;
      consultaEjecuto.forEach((datos) => 
      {
        // doc.data() is never undefined for query doc snapshots
        this.datosUsuarioActual = datos.data();
        return true;
      });   
      return false;
     }
    catch(error:any)
    {
      console.log(error.code);
      return null;
    }
  }

  obtenerPuntajes(): Observable<puntaje[]> 
  {
    return new Observable<any[]>((observable) => {
      onSnapshot(this.puntajes, (snap) => {
        const puntajes: any[] = [];
        snap.docChanges().forEach(x => {
          const punt = x.doc.data() as any;
          puntajes.push(punt);
        });
        observable.next(puntajes);
      });
    });
  }

  obtenerUsuarios(): Observable<any[]> 
  {
    return new Observable<any[]>((observable) => {
      onSnapshot(this.usuarios, (snap) => {
        const usuarios: any[] = [];
        snap.docChanges().forEach(x => {
          const user = x.doc.data() as any;
          usuarios.push(user);
        });
        observable.next(usuarios);
      });
    });
  }


}