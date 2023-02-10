if (typeof w == "undefined") {
  w = new Worker("counter.js");
}

w.onmessage = function (event) {
  document.getElementById("clock").innerHTML = event.data.hour;
  document.getElementById("date").innerHTML = event.data.date;
};

(function initialize() {
  let segundos_repeticiones = getSecondsInterval();
  setInterval(() => {
    const clock = document.getElementById("clock");
    const seconds = new Date().getSeconds();
    if (segundos_repeticiones.includes(seconds)) {
      clock.setAttribute("class", "animation");
    } else {
      clock.removeAttribute("class");
    }
    if (seconds === 0) {
      segundos_repeticiones = getSecondsInterval();
    }
  }, 1000);
})();

function getSecondsInterval(cantidad_fallos = 10) {
  let newSeconds = [];
  for (; newSeconds.length < cantidad_fallos; ) {
    const newSecond = Math.floor(Math.random() * 60);
    if (!newSeconds.includes(newSecond)) {
      newSeconds.push(newSecond);
    }
  }
  console.log('🍌', newSeconds)
  return newSeconds.sort((a, b) => a - b);
}
