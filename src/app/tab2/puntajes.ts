export interface puntaje
{
    id:number,
    puntaje:tiempo[]
}

export interface tiempo
{
    segundos:number | null,
    centesimas:number | null
    fecha:any | null
}