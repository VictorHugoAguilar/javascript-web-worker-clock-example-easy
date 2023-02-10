# Web Workers en JavaScript para principiantes

Siempre hemos escuchado y creído que JavaScript tiene un solo subproceso. También hemos escuchado que los subprocesos múltiples son posibles con la introducción de la "API de trabajadores web". Pero, ¿qué es eso exactamente? 😕 😕

Mientras aprendía sobre lo mismo, me di cuenta de por qué no aprenderlo juntos. En esta publicación, he tratado de anotar las respuestas a algunas preguntas que surgieron en mi mente, como ¿qué son exactamente los trabajadores web? ¿Rompe la norma de que JavaScript sea de un solo subproceso? Y algunas nociones básicas que nos pueden ayudar a entenderlo mejor.

## ¿Qué son los trabajadores web?

Para entenderlo fácilmente, ¡veamos primero qué son las API del navegador! El navegador expone algunos métodos o interfaces conocidos como API del navegador que nos otorgan superpoderes para acceder a los datos del navegador y el entorno informático circundante y comunicarnos con ellos.

La más simple es la API de "Consola". 🎉 🎉 Sí, hemos utilizado una de las API del navegador. ¿Recuerdas las declaraciones de console.log que hemos estado escribiendo en nuestro código JavaScript? Console nos ayuda a imprimir declaraciones en la consola del navegador. Oculta la complejidad necesaria para indicar a la consola del
navegador que imprima la declaración.

> Bueno, los trabajadores web son una API simple expuesta por el navegador para generar un script de fondo como un hilo en nuestra aplicación web. Puede ayudarnos a mantener los trabajos que son computacionalmente intensivos en segundo plano sin bloquear la interfaz de usuario o la interacción del usuario.

Hay varios tipos de trabajadores. No los estamos discutiendo en esta publicación. Pero podemos leer y aprender sobre esto aquí.

### ¿Cómo crear un trabajador en nuestra aplicación?

Como ya se discutió sobre las API del navegador, el navegador expone el objeto Worker que oculta las complejidades y lo ayuda a ejecutar su secuencia de comandos en un hilo diferente al hilo principal a través del código JavaScript.

Los subprocesos de trabajo se pueden crear utilizando un constructor "Trabajador" expuesto por las API web en los navegadores.

A continuación se muestra mi módulo initialWorker.js y el script de trabajo (worker.js).

```js
import workerFile from "./worker";

export let logWorker, sendLog;

/**Checking if browser supports Workers */
if (window.Worker) {
  logWorker = new Worker(workerFile); //initiates a worker thread
  sendLog = (msg) => {
    logWorker.postMessage(msg); //postMessage helps to communicate with the worker thread.
  };
  logWorker.onmessage = function (e) {
    /** message event is triggered by the worker when some message is sent from worker thread */
    console.log("Message from Worker: " + e.data);
  };
} else {
  console.log("Your browser doesn't support web workers.");
}
```

```js
const workercode = () => {
  // eslint-disable-next-line no-restricted-globals
  self.onmessage = function (e) {
    console.log("Worker: Message received from main script", e.data);

    /** Here data passed is an object and i am accessing the type property passed from the main thread */
    if (e.data.type) {
      console.log(e.data);
    }
    let { type, href, fromProduct, user } = e.data;

    if (type === "navigation") {
      console.log(`User ${user} navigated from ${fromProduct} to ${href}`);
      postMessage("Log printed!"); //postMessage helps to communicate with the main thread.
    }
  };
};

/** Below lines are added as it gives me a url for the file contents which i can use to initialize my Worker thread using import. */
let code = workercode.toString();
code = code.substring(code.indexOf("{") + 1, code.lastIndexOf("}"));

/**The URL.createObjectURL() static method creates a DOMString containing a URL representing the object given in the parameter. The URL lifetime is tied to the document in the window on which it was created. The new object URL represents the specified File object or Blob object. */
const blob = new Blob([code], { type: "application/javascript" });
const worker_script = URL.createObjectURL(blob);

module.exports = worker_script;
```

He impreso el mensaje en el registro. Hay muchas otras API que se pueden usar en el archivo de trabajo para lograr nuestro objetivo de usar trabajadores web. Las funciones y API disponibles se enumeran en la página de MDN .

Además, el tipo de mensaje enviado al trabajador admite tipos principales, por ejemplo, he enviado un objeto al trabajador. La lista de tipos admitidos se menciona en el blog de MDN .

A continuación se muestra el ejemplo de cómo he usado el método sendLog expuesto en el componente React para registrar cualquier navegación realizada a través del enlace.

```jsx
import React from "react";
import { sendLog } from "../initiateWorker";

/** 
This is just a component for example which can be used in any react project .
This link in the component logs the navigation by passing the object to the worker using the sendLog exposed 
*/
const AnchorLinkWithLogging = () => {
  return (
    <a
      href="/"
      onClick={(e) => {
        e.preventDefault();
        if (sendLog) {
          sendLog({
            type: "navigation",
            href: "OtherUrl",
            fromProduct: "Current Product Name",
            user: "abcd@dummy.com",
          });
        }
      }}
    >
      Test Worker
    </a>
  );
};

export default AnchorLinkWithLogging;
```

### ¿Qué sucede cuando se crea un trabajador?

Entonces, cuando se crea un trabajador para un script. Se crea un nuevo subproceso de nivel de sistema operativo que maneja la ejecución del script de trabajo. A ver si se puede ver en las herramientas de desarrollador.

![hilos](https://raw.githubusercontent.com/VictorHugoAguilar/javascript-web-worker-clock-example-easy/main/images/hilo_motor.webp)

Si nos fijamos en el Panel de fuentes, 💥¡Boom! También hay una sección de hilos. La sección de subprocesos aparece generalmente cuando usa trabajadores. Aquí, podemos ver 2 subprocesos en ejecución.

El subproceso " Principal " ejecuta el JavaScript principal para su aplicación web y el siguiente subproceso corresponde al subproceso de trabajo con el nombre del script utilizado para generar el subproceso de trabajo.

Puede depurar y también pausar la ejecución del subproceso de trabajo desde la sección Subprocesos.

>NOTA : En mi caso, el nombre es la URL creada ya que usé `URL.createObjectURL` para obtener la URL.

### ¿Qué es este hilo y qué sucede cuando elegimos el hilo de trabajo?

Algunos puntos sobre el hilo del trabajador para tener en cuenta:

* El subproceso tiene su propia instancia de JS Engine.
* Cada objeto Worker Global Scope tiene un bucle de eventos distinto y sus colas de tareas tienen eventos, devoluciones de llamada y actividad de red como tareas.
* Los trabajadores web no tienen acceso a la API DOM.
* El subproceso se ejecuta en otro contexto global que es diferente de la ventana actual. Por lo tanto, las API como LocalStorage, etc. expuestas por Window no están disponibles para acceder con Workers. Además, si accede al objeto de ubicación, imprime la ubicación del script que se utilizó para iniciarlo.
* Habla con el subproceso principal y otros subprocesos de trabajo a través de "canales de mensajes". Como en el ejemplo anterior, el subproceso principal y el subproceso de trabajo, ambos se comunican a través de "postMessage", que nuevamente es un método expuesto por el objeto Worker.
* Durante la ejecución del trabajador, el bucle de eventos principal nunca se bloquea; solo está manejando los resultados del mensaje.

El siguiente diagrama muestra la diferencia en el proceso estándar y un proceso con subprocesos de trabajo.

![hilos](https://raw.githubusercontent.com/VictorHugoAguilar/javascript-web-worker-clock-example-easy/main/images/proceso_con_sin_subproceso_trabajo.webp)

Como en el diagrama, los subprocesos de trabajo tienen su propio contexto global de ejecución e instancian JS Engine.

En cuanto a lo que sucede cuando elegimos el subproceso de trabajo en el panel Fuente, el contexto cambia del subproceso principal al de trabajo, las pilas de llamadas, etc. para mostrar la información del subproceso de trabajo. El ejemplo de MDN ayuda a comprender.

**Conclusión:** JavaScript sigue siendo de un solo subproceso. El código principal de nuestra aplicación se ejecuta como un único subproceso, Web Workers ejecuta su propio subproceso y, por lo tanto, ayuda a ejecutar otros scripts en segundo plano, por lo tanto, la ejecución del subproceso principal no se ve obstaculizada. Se puede utilizar para mejorar el rendimiento de la aplicación moviendo código costoso como trabajos en segundo plano.
