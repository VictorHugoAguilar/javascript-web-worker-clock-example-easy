# WEB WORKERS

Los navegadores ejecutan las aplicaciones en un único thread, lo que significa que si JavaScript está ejecutando una tarea muy complicada, que se traduce en tiempo de procesado, el rendimiento del navegador se ve afectado. Los Web workers se introdujeron con la idea de simplificar la ejecución de threads en el navegador. Un worker permite crear un entorno en el que un bloque de código JavaScript puede ejecutarse de manera paralela sin afectar al thread principal del navegador. Los Web workers utilizan un protocolo de paso de mensajes similar a los utilizados en programación paralela.

Estos Web workers se ejecutan en un subproceso aislado. Como resultado, es necesario que el código que ejecutan se encuentre en un archivo independiente. Sin embargo, antes de hacer esto, lo primero que se tiene que hacer es crear un nuevo objeto Worker en la página principal:

````js
var worker = new Worker('task.js');
````

Si el archivo especificado existe, el navegador generará un nuevo subproceso de Worker que descargará el archivo JavaScript de forma asíncrona. El Worker no comenzará a ejecutarse hasta que el archivo se haya descargado completamente. Si la ruta al nuevo Worker devuelve un error 404, el Worker fallará automáticamente.

Antes de comenzar a utilizar los Worker, es necesario conocer el protocolo de paso de mensajes, que también es utilizado en otras APIs como WebSocket y Server-Sent Event.

## 1. TRANSFERENCIA DE MENSAJES

El API de transferencia de mensajes es una manera muy simple de enviar cadenas de caracteres entre un origen (o un dominio) a un destino. Por ejemplo podemos utilizarlo para enviar información a una ventana abierta como popup, o a un iframe dentro de la página, aún cuando tiene como origen otro dominio.

La comunicación entre un Worker y su página principal se realiza mediante un modelo de evento y el método postMessage(). En función del navegador o de la versión, postMessage() puede aceptar una cadena o un objeto JSON como argumento único. Las últimas versiones de los navegadores modernos son compatibles con la transferencia de objetos JSON. De todas maneras, siempre podemos utilizar los métodos JSON.stringify y JSON.parse para la transferencia de objetos entre el thread principal y los Worker.

A continuación, se muestra un ejemplo sobre cómo utilizar una cadena para transferir "Hello World" a un Worker en doWork.js. El Worker simplemente devuelve el mensaje que se le transfiere.

Secuencia de comandos principal:

````js
worker.postMessage('Hello World'); // Send data to our worker.
````

````js
doWork.js (el Worker):
````

````js
self.addEventListener('message', function(e) {
    self.postMessage(e.data);
}, false);
````

Cuando se ejecuta postMessage() desde la página principal, el Worker es capaz de obtener este mensaje escuchando al evento message. Se puede acceder a los datos del mensaje (en este caso "Hello World") a través de la propiedad data del evento. Aunque este ejemplo concreto no es demasiado complejo, demuestra que postMessage() también sirve para transferir datos de vuelta al thread principal, una vez que los datos de origen se hayan procesado correctamente.

Los mensajes que se transfieren entre el origen y los Worker se copian, no se pasan por referencia. Por ejemplo, en el siguiente ejemplo, a la propiedad msg del mensaje JSON se accede en las dos ubicaciones. Parece que el objeto se transfiere directamente al Worker aunque se esté ejecutando en un espacio específico e independiente. En realidad, lo que ocurre es que el objeto se serializa al transferirlo al Worker y, posteriormente, se anula la serialización en la otra fase del proceso. El origen y el Worker no comparten la misma instancia, por lo que el resultado final es la creación de un duplicado en cada transferencia. La mayoría de los navegadores implementan esta función mediante la codificación/descodificación JSON automática del valor en la otra fase del proceso, cuando el paso de objetos está soportado.

En el siguiente ejemplo, que es más complejo, se transfieren mensajes utilizando objetos JavaScript.

Secuencia de comandos principal:

````html
<button onclick="sayHI()">Say HI</button>
<button onclick="unknownCmd()">Send unknown command</button>
<button onclick="stop()">Stop worker</button>
<output id="result"></output>

<script>
function sayHI() {
    worker.postMessage({'cmd': 'start', 'msg': 'Hi'});
}
function stop() {
    worker.postMessage({'cmd': 'stop', 'msg': 'Bye'});
}
function unknownCmd() {
    worker.postMessage({'cmd': 'foobard', 'msg': '???'});
}
var worker = new Worker('doWork.js');
worker.addEventListener('message', function(e) {
    document.getElementById('result').textContent = e.data;
}, false);
</script>
````

doWork.js:

````js
this.addEventListener('message', function(e) {
    var data = e.data;
    switch (data.cmd) {
        case 'start':
            this.postMessage('WORKER STARTED: '+data.msg);
            break;
        case 'stop':
            this.postMessage('WORKER STOPPED: '+data.msg+'. (buttons will no longer work)');
            this.close(); // Terminates the worker.
            break;
        default:
            this.postMessage('Unknown command: '+data.msg);
    };
}, false);
````

## 2. UTILIZACIÓN DE WEB WORKERS

Un Worker es una manera ejecutar código JavaScript de manera paralela al proceso principal, sin interferir con el navegador. El navegador sigue siendo responsable de solicitar y analizar ficheros, renderizar la vista, ejecutar JavaScript y cualquier otro proceso que consuma tiempo de procesado y que haga que el resto de tareas tengan que esperar. Y es aquí donde los Web workers toman importancia.

Al igual que con el resto de funcionalidades de HTML5, debemos comprobar su disponibilidad en el navegador en el que ejecutamos la aplicación:

````js
if(Modernizr.webworkers) {
    alert('El explorador soporta Web workers');
} else {
    alert('El explorador NO soporta Web workers');
}
````

Crear nuevo Worker es muy sencillo. Tan sólo tenemos que crear una nueva instancia del objeto Worker, indicando como parámetro del constructor el fichero JavaScript que contiene el código que debe ejecutar el Worker.

````js
var worker = new Worker('my_worker.js');
````

De esta manera tenemos disponible y listo para utilizar un nuevo Worker. En este momento, podríamos pensar que podemos llamar a métodos o utilizar objetos definidos dentro del nuevo Worker, pero no nada más lejos de la realidad. La única manera de comunicarnos con el nuevo Worker es a través del paso de mensajes, como hemos visto anteriormente.

````js
worker.postMessage('Hello World');
````

Éste método únicamente acepta un parámetro, la cadena de texto a enviar al Worker. Por otra parte, la manera de recibir mensajes originados en el Worker es definiendo un escuchador para el evento message. Los datos incluidos por el Worker se encuentran disponibles en la propiedad data del evento.

````js
worker.addEventListener('message', function(e) {
    alert(e.data);
}, false);
````

### 2.1. DENTRO DE UN WORKER
Evidentemente, dentro de un Worker necesitamos comunicarnos con el thread principal, tanto para recibir los datos de los mensajes como para nuevos datos de vuelta. Para ello, añadimos un escuchador para el evento message, y enviamos los datos de vuelta utilizando el mismo método postMessage.

````js
this.addEventListener('message', function(e) {
    postMessage("I'm done!");
});
````

Es conveniente saber, que a diferencia de la ejecución un script en el documento principal, la visibilidad de un Worker es mucho más reducida. En concreto, la palabra reservada this no hace referencia al objeto window, sino al Worker en sí mismo. Debido al comportamiento de ejecución en paralelo de los Web workers, éstos solo pueden acceder al siguiente conjunto de funciones de JavaScript (según la especificación):

* Enviar datos con postMessage y aceptar mensajes entrantes a través del evento onmessage.
* close, para terminar con el Worker actual.
* Realizar peticiones Ajax.
* Utilizar las funciones de tiempo setTimeout()/clearTimeout() y setInterval()/clearInterval().
* Las siguientes funciones de JavaScript: eval, isNaN, escape, etc.
* WebSockets.
* EventSource.
* Bases de datos Web SQL, IndexedDB.
* Web Workers.

En cambio, los Workers NO pueden acceder a las siguientes funciones:

* DOM (no es seguro para el subproceso).
* Objeto window.
* Objeto document.
* Objeto parent.

## 3. SUBWORKERS

Los Workers tienen la capacidad de generar Workers secundarios. Esto significa, que podemos dividir la tarea principal en subtareas, y crear nuevos Workers dentro del Worker principal. Sin embargo, a la hora de utilizar los Subworkers, y antes de poder devolver el resultado final al hilo principal, es necesario asegurarse que todos los procesos han terminado.

````js
var pendingWorkers = 0, results = {},;

onmessage = function (event) {
    var data = JSON.parse(event.data), worker = null;
    pendingWorkers = data.length;
    for (var i = 0; i < data.length; i++) {
        worker = new Worker('subworker.js');
        worker.postMessage(JSON.stringify(data[i]));
        worker.onmessage = storeResult;
    }
}

function storeResult(event) {
    var result = JSON.parse(event.data);
    pendingWorkers--;
    if (pendingWorkers <= 0) {
        postMessage(JSON.stringify(results));
    }
}
````

## 4. GESTIONAR ERRORES
Si se produce un error mientras se ejecuta un Worker, se activa un evento error. La interfaz incluye tres propiedades útiles para descubrir la causa del error: filename (el nombre de la secuencia de comandos del Worker que causó el error), lineno (el número de línea donde se produjo el error) y message (una descripción significativa del error).

Ejemplo: workerWithError.js intenta ejecutar 1/x, donde el valor de x no se ha definido:

````html
<output id="error" style="color: red;"></output>
<output id="result"></output>

<script>
    
function onError(e) {
    document.getElementById('error').textContent = [
        'ERROR: Line ', e.lineno, ' in ', e.filename, ': ', e.message].join('');
}
function onMsg(e) {
    document.getElementById('result').textContent = e.data;
}
    
var worker = new Worker('workerWithError.js');
worker.addEventListener('message', onMsg, false);
worker.addEventListener('error', onError, false);
worker.postMessage(); // Start worker without a message.
    
</script>
````

workerWithError.js:

````js
self.addEventListener('message', function(e) {
    postMessage(1/x); // Intentional error.
};
````

## 5. SEGURIDAD

Debido a las restricciones de seguridad de Google Chrome (otros navegadores no aplican esta restricción), los Workers no se ejecutarán de forma local (por ejemplo, desde file://) en las últimas versiones del navegador. En su lugar, fallan de forma automática. Para ejecutar tu aplicación desde el esquema file://, ejecuta Chrome con el conjunto de marcadores --allow-file-access-from-files.

Las secuencias de comandos del Worker deben ser archivos externos con el mismo esquema que su página de llamada. Por ello, no se puede cargar una secuencia de comandos desde una URL data: o una URL javascript:. Asimismo, una página https: no puede iniciar secuencias de comandos de Worker que comiencen con una URL http:.

## 6. Otras referencias

[Otra visión de los web worker](https://github.com/VictorHugoAguilar/javascript-web-worker-clock-example-easy/blob/main/web_worker_explained.md)
