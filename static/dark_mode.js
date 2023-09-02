const darkModeToggle = document.querySelector("#dark-mode-toggle");

// Check if dark mode preference is saved in localStorage
if (localStorage.getItem("dark_mode") === "true") {
    document.body.classList.add("dark-mode");
    updateDarkModeText("Light Mode");
} else {
    updateDarkModeText("Dark Mode");
}

darkModeToggle.addEventListener("click", function () {
    document.body.classList.toggle("dark-mode");
    if (document.body.classList.contains("dark-mode")) {
        localStorage.setItem("dark_mode", "true");
        updateDarkModeText("Light Mode");
    } else {
        localStorage.setItem("dark_mode", "false");
        updateDarkModeText("Dark Mode");
    }
});

function updateDarkModeText(text) {
    const darkModeText = document.querySelector("#dark-mode-toggle");
    darkModeText.textContent = text;
}
