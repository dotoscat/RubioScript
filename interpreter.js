"use strict";

/*

Definición informal del lenguaje

Cada instruccion está separada por punto.

<sujeto>(tiene)<n><objeto> =
si se le (quita|da) <objeto> a <sujeto> -+
si <sujeto> le da <n> <objetos> a <sujeto2> sujeto- sujeto+

Ejemplo: "Maria tiene 2 manzana. Si se quita 2. Cuántas tendrá?"

*/

let sujetos = new Map();
let objetos = new Map();
let respuestas = [];

// <sujeto>, tiene, <cantidad> <objeto>
const regex_asignacion = /(\w+)\s+(tiene)\s+(\d+)\s+(\w+)/
// (Cuantos|Cuantas) <objeto> (tiene) <sujeto>
const regex_respuesta = /(Cuantos|Cuantas)\s+(\w+)\s+(tiene)\s+(\w+)\s*?\?/
// <cantidad> <objeto> <sujeto>, 'quita' es una suma negativa, o resta
const regex_dar_a_sujeto = /[Ss]i se (da|quita)\s+(\d+)\s+(\w+)\s*?a\s*?(\w+)/

let relaciones_operacion = new Map();
relaciones_operacion.set(regex_asignacion, operacion_asignacion);
relaciones_operacion.set(regex_respuesta, operacion_respuesta);
relaciones_operacion.set(regex_dar_a_sujeto, operacion_suma);

function limpiar_interprete(){
    sujetos.clear();
    objetos.clear();
    respuestas = [];
}

function obtenerSujetoCantidadObjeto(sujeto, objeto){
    if (!sujetos.has(sujeto)){
        return 0;
    }
    return sujetos.get(sujeto).get(objeto);
}

function ponerSujetoCantidadObjeto(sujeto, cantidad, objeto){
    if (!sujetos.has(sujeto)){
        sujetos.set(sujeto, new Map());
    }
    sujetos.get(sujeto).set(objeto, cantidad < 0 ? 0 : cantidad);
}

function obtenerCantidadObjeto(objeto){
    if (!objetos.has(objeto)){
        return 0;
    }
    return objetos.get(objeto);
}

function ponerCantidadObjeto(cantidad, objeto){
    if (!objetos.has(objeto)){
        objetos.set(objeto, 0);
    }
    objetos.set(objeto, cantidad < 0 ? 0 : cantidad);
}

function operacion_suma(instruccion){
    const accion = instruccion[1];
    const cantidad = accion === "da" ? parseInt(instruccion[2]) : -parseInt(instruccion[2])
    const objeto = instruccion[3];
    const sujeto = instruccion[4];
    const sujetoCantidadObjeto = obtenerSujetoCantidadObjeto(sujeto, objeto);
    ponerSujetoCantidadObjeto(sujeto, sujetoCantidadObjeto + cantidad, objeto);
    ponerCantidadObjeto(obtenerCantidadObjeto() + cantidad, objeto);
}

function operacion_asignacion(instruccion){
    const sujeto = instruccion[1];
    const verbo = instruccion[2];
    const cantidad = parseInt(instruccion[3]);
    const objeto = instruccion[4];
    ponerSujetoCantidadObjeto(sujeto, cantidad, objeto);
    ponerCantidadObjeto(cantidad, objeto);
}

function operacion_respuesta(instruccion){
    let pronombre = instruccion[1];
    let objeto = instruccion[2];
    let verbo = instruccion[3];
    let sujeto = instruccion[4];
    let sujeto_posesion = sujetos.get(sujeto).get(objeto);
    const respuesta = sujeto + " " + verbo + " " + sujeto_posesion + " " + objeto;
    respuestas.push(respuesta);
}

function preparar_codigo(codigo) {
    const codigo_separado = codigo.split(/\./);
    console.log("separado", codigo_separado);
    const codigo_limpio = codigo_separado.map((linea_codigo) => linea_codigo.trim());
    const instrucciones = codigo_limpio.map((instruccion) => {
        for (let operacion of relaciones_operacion){
            let encuentro = operacion[0].exec(instruccion);
            if (encuentro === null) continue;
            return {operacion: operacion[1], encuentro: encuentro};
        }
        return null;
    });
    return instrucciones;
}

function ejecutar(codigo) {
    limpiar_interprete();
    const instrucciones = preparar_codigo(codigo);
    for (let instruccion of instrucciones) {
        if (instruccion === null) continue;
        instruccion.operacion(instruccion.encuentro);
    }
    let respuesta = "";
    while(respuestas.length > 0){
        let una = respuestas.pop();
        respuesta = respuestas + una;
    }
    console.log(respuesta);
    return respuesta;
    //console.log(sujetos);
    //console.log(objetos);
}
