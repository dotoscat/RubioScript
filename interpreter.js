"use strict";

let sujetos = new Map();
let respuestas = [];

// definicion informal del lenguaje
// <sujeto>, tiene, <cantidad> <objeto>
const regexAsignacion = /(\w+)\s+(tiene)\s+(\d+)\s+(\w+)/
// (Cuantos|Cuantas) <objeto> (tiene) <sujeto>
const regexRespuesta = /([Cc]u[aá]nt[oa]s)\s+(\w+)\s+(tiene)\s+(\w+)\s*?\??/
// (Cuantos|Cuantas) <objeto> hay en total?
const regexRespuestaGlobal = /[Cc]u[aá]nt[oa]s\s+(\w+)\s+hay\s+en\s+total\s*?\??/
// <cantidad> <objeto> <sujeto>, 'quita' es una suma negativa, o resta
const regexObjetoASujeto = /[Ss]i se (da|quita)\s+(\d+)\s+(\w+)\s*?a\s*?(\w+)/
// Si <sujeto> le (da/quita) <cantidad> <objetos> a <receptor>
const regexObjetoEntreSujetos = /[Ss]i\s+(\w+)\s+le\s+(da|quita)\s+(\d+)\s+(\w+)\s+a\s+(\w+)/

let tablaOperaciones = new Map();
tablaOperaciones.set(regexAsignacion, operacionAsignacion);
tablaOperaciones.set(regexRespuesta, operacionRespuesta);
tablaOperaciones.set(regexRespuestaGlobal, operacionRespuestaGlobal);
tablaOperaciones.set(regexObjetoASujeto, operacionSuma);
tablaOperaciones.set(regexObjetoEntreSujetos, operacionSumaSujetoReceptor);

function limpiarInterprete(){
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

function operacionSumaSujetoReceptor(instruccion){
    const sujeto = instruccion[1];
    const accion = instruccion[2];
    const cantidad = accion === "da" ? parseInt(instruccion[3]) : -parseInt(instruccion[3]);
    const objeto = instruccion[4];
    const receptor = instruccion[5];
    const sujetoCantidadObjeto = obtenerSujetoCantidadObjeto(sujeto, objeto);
    ponerSujetoCantidadObjeto(sujeto, sujetoCantidadObjeto + -cantidad, objeto);
    const receptorCantidadObjeto = obtenerSujetoCantidadObjeto(receptor, objeto);
    ponerSujetoCantidadObjeto(receptor, receptorCantidadObjeto + cantidad, objeto);
}

function operacionSuma(instruccion){
    const accion = instruccion[1];
    const cantidad = accion === "da" ? parseInt(instruccion[2]) : -parseInt(instruccion[2])
    const objeto = instruccion[3];
    const sujeto = instruccion[4];
    const sujetoCantidadObjeto = obtenerSujetoCantidadObjeto(sujeto, objeto);
    ponerSujetoCantidadObjeto(sujeto, sujetoCantidadObjeto + cantidad, objeto);
}

function operacionAsignacion(instruccion){
    const sujeto = instruccion[1];
    const verbo = instruccion[2];
    const cantidad = parseInt(instruccion[3]);
    const objeto = instruccion[4];
    ponerSujetoCantidadObjeto(sujeto, cantidad, objeto);
}

function operacionRespuesta(instruccion){
    const pronombre = instruccion[1];
    const objeto = instruccion[2];
    const verbo = instruccion[3];
    const sujeto = instruccion[4];
    const sujeto_posesion = obtenerSujetoCantidadObjeto(sujeto, objeto);
    const respuesta = sujeto + " " + verbo + " " + sujeto_posesion + " " + objeto;
    respuestas.push(respuesta);
}

function operacionRespuestaGlobal(instruccion){
    const objeto = instruccion[1];
    let cantidad = 0;
    for (let bolsa of sujetos.values()){
        cantidad += bolsa.get(objeto);
    }
    const respuesta = "Hay " + cantidad + " " + objeto + " en total.";
    respuestas.push(respuesta);
}

function prepararCodigo(codigo) {
    const codigoSeparado = codigo.split(/\.|,|\?(?=\s)/);
    console.log("separado", codigoSeparado);
    const codigoLimpio = codigoSeparado.map((lineaCodigo) => lineaCodigo.trim());
    console.log("limpio", codigoLimpio);
    const instrucciones = codigoLimpio.map((instruccion) => {
        for (let operacion of tablaOperaciones){
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
    limpiarInterprete();
    const instrucciones = prepararCodigo(codigo);
    for (let instruccion of instrucciones) {
        if (instruccion === null) continue;
        instruccion.operacion(instruccion.encuentro);
    }
    let respuesta = "";
    while(respuestas.length > 0){
        let una = respuestas.pop();
        respuesta = respuestas.length === 0 ? respuesta + una : respuesta + una + ", ";
    }
    console.log(respuesta);
    return respuesta;
}
