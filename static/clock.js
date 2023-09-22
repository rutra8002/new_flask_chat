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

// Add event listeners for both mouse and touch events
clock.addEventListener("mousedown", startDrag);
clock.addEventListener("mousemove", drag);
clock.addEventListener("mouseup", stopDrag);
clock.addEventListener("mouseleave", stopDrag);

clock.addEventListener("touchstart", startDrag);
clock.addEventListener("touchmove", drag);
clock.addEventListener("touchend", stopDrag);

function startDrag(e) {
  e.preventDefault();
  isDragging = true;
  offset.x = e.clientX - clock.getBoundingClientRect().left;
  offset.y = e.clientY - clock.getBoundingClientRect().top;
}

function drag(e) {
  if (isDragging) {
    var left = (e.clientX || e.touches[0].clientX) - offset.x;
    var top = (e.clientY || e.touches[0].clientY) - offset.y;
    var right = left + clock.offsetWidth;

    clock.style.left = left + "px";
    clock.style.top = top + "px";
    clock.style.right = "auto";
  }
}

function stopDrag() {
  isDragging = false;
}
