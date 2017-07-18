"use strict";

/*

Definición informal del lenguaje

Cada instruccion está separada por punto.

<sujeto>(tiene)<n><objeto> =

Ejemplo: "Maria tiene 2 manzana. Si se come 2. Cuántas tendrá?"

*/

let sujetos = new Map();
let objetos = new Map();

const asignacion = /(\w+)\s+(tiene)\s+(\d+)\s+(\w+)/
const respuesta = /(Cuantos|Cuantas)\s+(\w+)\s+tiene(\w+)\?/

let relaciones_operacion = new Map();
relaciones_operacion.set(asignacion, operacion_asignacion);
relaciones_operacion.set(respuesta, operacion_respuesta);

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
    console.log("Una respuesta");
}

function preparar_codigo(codigo) {
    const codigo_separado = codigo.split('.');
    const codigo_limpio = codigo_separado.map((linea_codigo) => linea_codigo.trim());
    const instrucciones = codigo_limpio.map((instruccion) => {
        for (let operacion of relaciones_operacion){
            let encuentro = operacion[0].exec(instruccion);
            if (encuentro === null) continue;
            return {operacion: operacion, encuentro: encuentro};
        }
        return null;
    });
    return instrucciones;
}

function ejecutar(codigo) {
    const instrucciones = preparar_codigo(codigo);
    for (let instruccion of instrucciones) {
        if (instruccion === null) continue;
        console.log(instruccion);
        //operacion_asignacion(instruccion);
    }
    console.log(sujetos);
    console.log(objetos);
}
