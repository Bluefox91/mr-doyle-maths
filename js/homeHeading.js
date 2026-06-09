document.addEventListener("DOMContentLoaded", () => {
  const words = ["students", "teachers", "revision", "lessons", "exams"];
  let index = 0;

  const wordEl = document.getElementById("changing-word");

  setInterval(() => {
    // fade out
    wordEl.style.transform = "scale(0.9)";
    wordEl.style.opacity = "0";

    setTimeout(() => {
      index = (index + 1) % words.length;
      wordEl.textContent = words[index];

      // fade in
      wordEl.style.transform = "scale(1)";
      wordEl.style.opacity = "1";
    }, 600); // 👈 half of transition time
  }, 2800);
});