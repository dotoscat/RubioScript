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

function operacion_asignacion(instruccion){
    const sujeto = instruccion[1]
    const verbo = instruccion[2]
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

function preparar_codigo(codigo) {
    const codigo_separado = codigo.split('.');
    const codigo_limpio = codigo_separado.map((linea_codigo) => linea_codigo.trim());
    const instrucciones = codigo_limpio.map((instruccion) => asignacion.exec(instruccion));
    return instrucciones;
}

function ejecutar(codigo) {
    const instrucciones = preparar_codigo(codigo);
    for (let instruccion of instrucciones) {
        operacion_asignacion(instruccion);
    }
    console.log(sujetos);
    console.log(objetos);
}
