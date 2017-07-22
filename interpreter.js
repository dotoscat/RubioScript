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
let respuestas = [];

// <sujeto>, tiene, <cantidad> <objeto>
const regex_asignacion = /(\w+)\s+(tiene)\s+(\d+)\s+(\w+)/
// (Cuantos|Cuantas) <objeto> (tiene) <sujeto>
const regex_respuesta = /([Cc]uant[oa]s)\s+(\w+)\s+(tiene)\s+(\w+)\s*?\?/
// (Cuantos|Cuantas) <objeto> hay en total?
const regex_respuesta_global = /[Cc]uant[oa]s\s+(\w+)\s+hay\s+en\s+total\s*?\?/
// <cantidad> <objeto> <sujeto>, 'quita' es una suma negativa, o resta
const regex_dar_a_sujeto = /[Ss]i se (da|quita)\s+(\d+)\s+(\w+)\s*?a\s*?(\w+)/

let relaciones_operacion = new Map();
relaciones_operacion.set(regex_asignacion, operacion_asignacion);
relaciones_operacion.set(regex_respuesta, operacion_respuesta);
relaciones_operacion.set(regex_respuesta_global, operacion_respuesta_global);
relaciones_operacion.set(regex_dar_a_sujeto, operacion_suma);

function limpiar_interprete(){
    sujetos.clear();
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

function operacion_suma(instruccion){
    const accion = instruccion[1];
    const cantidad = accion === "da" ? parseInt(instruccion[2]) : -parseInt(instruccion[2])
    const objeto = instruccion[3];
    const sujeto = instruccion[4];
    const sujetoCantidadObjeto = obtenerSujetoCantidadObjeto(sujeto, objeto);
    ponerSujetoCantidadObjeto(sujeto, sujetoCantidadObjeto + cantidad, objeto);
}

function operacion_asignacion(instruccion){
    const sujeto = instruccion[1];
    const verbo = instruccion[2];
    const cantidad = parseInt(instruccion[3]);
    const objeto = instruccion[4];
    ponerSujetoCantidadObjeto(sujeto, cantidad, objeto);
}

function operacion_respuesta(instruccion){
    const pronombre = instruccion[1];
    const objeto = instruccion[2];
    const verbo = instruccion[3];
    const sujeto = instruccion[4];
    const sujeto_posesion = obtenerSujetoCantidadObjeto(sujeto, objeto);
    const respuesta = sujeto + " " + verbo + " " + sujeto_posesion + " " + objeto;
    respuestas.push(respuesta);
}

function operacion_respuesta_global(instruccion){
    const objeto = instruccion[1];
    const respuesta = "Hay " + obtenerCantidadObjeto(objeto) + " " + objeto;
    respuestas.push(respuesta);
}

function preparar_codigo(codigo) {
    const codigo_separado = codigo.split(/\.|,/);
    console.log("separado", codigo_separado);
    const codigo_limpio = codigo_separado.map((linea_codigo) => linea_codigo.trim());
    console.log("limpio", codigo_limpio);
    const instrucciones = codigo_limpio.map((instruccion) => {
        for (let operacion of relaciones_operacion){
            let encuentro = operacion[0].exec(instruccion);
            if (encuentro === null) continue;
            return {operacion: operacion[1], encuentro: encuentro};
        }
        return null;
    });
    console.log("instrucciones", instrucciones);
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
