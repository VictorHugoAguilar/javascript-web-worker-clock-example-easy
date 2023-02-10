function timedCount() {
  postMessage(cargarReloj());
  setTimeout("timedCount()", 1000);
}

timedCount();

function cargarReloj() {
  // Haciendo uso del objeto Date() obtenemos la hora, minuto y segundo
  let fechahora = new Date();
  let hora = fechahora.getHours();
  let minuto = fechahora.getMinutes();
  let segundo = fechahora.getSeconds();

  // Variable meridiano con el valor 'AM'
  let meridiano = "AM";

  // Si la hora es igual a 0, declaramos la hora con el valor 12
  if (hora === 0) {
    hora = 12;
  }

  // Si la hora es mayor a 12, restamos la hora - 12 y mostramos la variable meridiano con el valor 'PM'
  if (hora > 12) {
    hora = hora - 12;

    // Variable meridiano con el valor 'PM'
    meridiano = "PM";
  }

  // Formateamos los ceros '0' del reloj
  hora = hora < 10 ? "0" + hora : hora;
  minuto = minuto < 10 ? "0" + minuto : minuto;
  segundo = segundo < 10 ? "0" + segundo : segundo;

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  let curWeekDay = days[fechahora.getDay()];
  let curDay = fechahora.getDate();
  let curMonth = months[fechahora.getMonth()];
  let curYear = fechahora.getFullYear();

  const hour = hora + ":" + minuto + ":" + segundo + " " + meridiano;
  const date = curWeekDay + ", " + curDay + " " + curMonth + " " + curYear;

  // Cargamos el reloj a los 500 milisegundos
  setTimeout(cargarReloj, 500);

  return { hour, date };
}
