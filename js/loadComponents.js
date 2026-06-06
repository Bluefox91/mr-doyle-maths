function loadComponent(id, file) {
  fetch(file)
    .then(res => res.text())
    .then(data => {
      document.getElementById(id).innerHTML = data;
    });
}

loadComponent("header", "assets/components/header.html");
loadComponent("footer", "assets/components/footer.html");