"use strict";

/*

Definición informal del lenguaje

Cada instruccion está separada por punto.

<sujeto>(tiene)<n><objeto> =

Ejemplo: "Maria tiene 2 manzana. Si se come 2. Cuántas tendrá?"

*/

const asignacion = /(\w+)\s+(tiene)\s+(\d+)\s+(\w+)/

function ejecutar(codigo) {
    const codigo_separado = codigo.split('.');
    const codigo_limpio = codigo_separado.map((linea_codigo) => linea_codigo.trim());
    const instrucciones = codigo_limpio.map((instruccion) => asignacion.exec(instruccion));
    console.log(instrucciones);
}
