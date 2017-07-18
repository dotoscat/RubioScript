"use strict";

/*

Definición informal del lenguaje

Cada instruccion está separada por punto.

<sujeto>(tiene)<n><objeto> =

Ejemplo: "Maria tiene 2 manzana. Si se come 2. Cuántas tendrá?"

*/

let sujetos = new Map();
let objetos = new Map();
let respuestas = [];

const regex_asignacion = /(\w+)\s+(tiene)\s+(\d+)\s+(\w+)/
const regex_respuesta = /(Cuantos|Cuantas)\s+(\w+)\s+(tiene)\s+(\w+)\s*?\?/

let relaciones_operacion = new Map();
relaciones_operacion.set(regex_asignacion, operacion_asignacion);
relaciones_operacion.set(regex_respuesta, operacion_respuesta);

function limpiar_interprete(){
    sujetos.clear();
    objetos.clear();
    respuestas = [];
}

function operacion_asignacion(instruccion){
    const sujeto = instruccion[1];
    const verbo = instruccion[2];
    const cantidad = Number(instruccion[3]);
    const objeto = instruccion[4];
    if (!sujetos.has(sujeto)){
        sujetos.set(sujeto, new Map());
    }
    sujetos.get(sujeto).set(objeto, cantidad);
    if (!objetos.has(objeto)){
        objetos.set(objeto, 0);
    }
    objetos.set(objeto, objetos.get(objeto) + cantidad);
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
        console.log(instruccion);
        //operacion_asignacion(instruccion);
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
