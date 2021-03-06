// interpreter.js: El interprete para RubioScript
// Copyright (C) 2017   Oscar Triano 'dotoscat'
//
// This JavaScript program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>..

"use strict";
const VERSION = "1.0.0";

let sujetos = new Map();
let respuestas = [];

// definicion informal del lenguaje
// <sujeto>, tiene, <cantidad> <objeto>
const regexAsignacion = /(\w+)\s+(tiene)\s+(\d+)\s+(\w+)/
// En (un|una) <sujeto> (hay|había) <cantidad> <objeto>
const regexAsignacionContenedor = /En\s+(un|una)\s+(\w+)\s+(hay|habia)\s+(\d+)\s+(\w+)/
// (Cuantos|Cuantas) <objeto> (tiene) <sujeto>
const regexRespuesta = /([Cc]u[aá]nt[oa]s)\s+(\w+)\s+(tiene)\s+(\w+)\s*?\??/
// (Cuantos|Cuantas) <objeto> hay en (el|la|ese|esa) <sujeto>
const regexRespuestaContenedor = /([Cc]u[aá]nt[oa]s)\s+(\w+)\s+(hay en)\s+(el|la|ese|esa)\s+(\w+)\s*?\??/
// (Cuantos|Cuantas) <objeto> hay en total?
const regexRespuestaGlobal = /[Cc]u[aá]nt[oa]s\s+(\w+)\s+hay en\s+total\s*?\??/
// <cantidad> <objeto> <sujeto>, 'quita' es una suma negativa, o resta
const regexObjetoASujeto = /[Ss]i se (da|quita)\s+(\d+)\s+(\w+)\s*?a\s*?(\w+)/
// Si <sujeto> le (da/quita) <cantidad> <objetos> a <receptor>
const regexObjetoEntreSujetos = /[Ss]i\s+(\w+)\s+le\s+(da|quita)\s+(\d+)\s+(\w+)\s+a\s+(\w+)/
// <sujeto> coge <cantidad> <objeto> de (la|el|un|una) <contenedor>
const regexSujetoCogeContenedor = /(\w+)\s+(coge)\s+(\d+)\s+(\w+)\s+de\s+(la|el|un|una)\s+(\w+)/
// <sujeto> pone <cantidad> <objeto> en (la|el|un|una) <contenedor>
const regexSujetoPoneContenedor = /(\w+)\s+(pone)\s+(\d+)\s+(\w+)\s+en\s+(la|el|un|una)\s+(\w+)/

let tablaOperaciones = new Map();
tablaOperaciones.set(regexAsignacion, operacionAsignacion);
tablaOperaciones.set(regexAsignacionContenedor, operacionAsignacionContenedor);
tablaOperaciones.set(regexRespuesta, operacionRespuesta);
tablaOperaciones.set(regexRespuestaContenedor, operacionRespuesta);
tablaOperaciones.set(regexRespuestaGlobal, operacionRespuestaGlobal);
tablaOperaciones.set(regexObjetoASujeto, operacionSuma);
tablaOperaciones.set(regexObjetoEntreSujetos, operacionSumaSujetoReceptor);
tablaOperaciones.set(regexSujetoCogeContenedor, operacionSujetoCogeContenedor);
tablaOperaciones.set(regexSujetoPoneContenedor, operacionSujetoCogeContenedor);

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

function operacionSujetoCogeContenedor(instruccion){
    const sujeto = instruccion[1];
    const verbo = instruccion[2] === "coge" ? "quita" : "da";
    const cantidad = parseInt(instruccion[3]);
    const objeto = instruccion[4];
    const determinante = instruccion[5];
    const contenedor = instruccion[6];
    operacionSumaSujetoReceptor([null, sujeto, verbo, cantidad, objeto, contenedor]);
}

function operacionAsignacion(instruccion){
    const sujeto = instruccion[1];
    const verbo = instruccion[2];
    const cantidad = parseInt(instruccion[3]);
    const objeto = instruccion[4];
    ponerSujetoCantidadObjeto(sujeto, cantidad, objeto);
}

function operacionAsignacionContenedor(instruccion){
    const contenedor = instruccion[2];
    const cantidad = parseInt(instruccion[4]);
    const objeto = instruccion[5];
    ponerSujetoCantidadObjeto(contenedor, cantidad, objeto);
    //console.log(instruccion);
}

function operacionRespuesta(instruccion){
    const pronombre = instruccion[1];
    const objeto = instruccion[2];
    const verbo = instruccion[3];//'hay en' no es exactamente un verbo
    const determinante = instruccion.length === 6 ? instruccion[4] : null;
    const sujeto = instruccion.length === 6 ? instruccion[5] : instruccion[4];
    const sujetoPosesion = obtenerSujetoCantidadObjeto(sujeto, objeto);
    const respuesta = determinante === null ?
        sujeto + " " + verbo + " " + sujetoPosesion + " " + objeto :
        "Hay en " + determinante + " " + sujeto + " " + sujetoPosesion + " " + objeto;
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
    // console.log("separado", codigoSeparado);
    const codigoLimpio = codigoSeparado.map((lineaCodigo) => lineaCodigo.trim());
    // console.log("limpio", codigoLimpio);
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
    // console.log(respuesta);
    return respuesta;
}
