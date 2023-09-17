function updateClock() {
  var now = new Date();
  var hours = now.getHours();
  var minutes = now.getMinutes();
  var seconds = now.getSeconds();

  // Add leading zeros if necessary
  hours = hours < 10 ? "0" + hours : hours;
  minutes = minutes < 10 ? "0" + minutes : minutes;
  seconds = seconds < 10 ? "0" + seconds : seconds;

  var time = hours + ":" + minutes + ":" + seconds;

  document.getElementById("clock").textContent = time;
}

// Update the clock every second
setInterval(updateClock, 1000);

var clock = document.getElementById("clock");
var isDragging = false;
var offset = { x: 0, y: 0 };

clock.addEventListener("mousedown", startDrag);
clock.addEventListener("mousemove", drag);
clock.addEventListener("mouseup", stopDrag);
clock.addEventListener("mouseleave", stopDrag);

function startDrag(e) {
  isDragging = true;
  offset.x = e.clientX - clock.offsetLeft;
  offset.y = e.clientY - clock.offsetTop;
}

function drag(e) {
  if (isDragging) {
    var left = e.clientX - offset.x;
    var top = e.clientY - offset.y;
    var right = left + clock.offsetWidth;

    clock.style.left = left + "px";
    clock.style.top = top + "px";
    clock.style.right = "auto";
  }
}
function stopDrag() {
  isDragging = false;
}