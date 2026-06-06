
function openPanel(title, items) {
    const panel = document.getElementById("sidePanel");
    const panelTitle = document.getElementById("panelTitle");
    const panelContent = document.getElementById("panelContent");

    panelTitle.innerText = title;
    panelContent.innerHTML = "";

    items.forEach(item => {
        const container = document.createElement("div");
        container.className = "panel-link";

        const row = document.createElement("div");
        row.className = "panel-row";

        row.innerHTML = item.header ? "<h2>" + item.header + "</h2>" : "<h4>" + item.label + "</h4>";

        const iconWrapper = document.createElement("div");
        iconWrapper.className = "icon-group";

        item.icons.forEach(icon => {
            const anchor = document.createElement("a");
            anchor.href = icon.url;
            anchor.target = "_blank";

            // stop triggering parent click
            anchor.addEventListener("click", e => e.stopPropagation());

            const iconImg = document.createElement("img");
            iconImg.src = icon.src;
            iconImg.alt = icon.alt;
            iconImg.className = "panel-icon";

            anchor.appendChild(iconImg);
            iconWrapper.appendChild(anchor);
        });

        container.appendChild(row);
        container.appendChild(iconWrapper);

        panelContent.appendChild(container);
    });

    panel.classList.add("open");
}

function closePanel() {
    document.getElementById("sidePanel").classList.remove("open");
}

// Add event listeners to boxes
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.box').forEach(box => {
        box.addEventListener('click', () => {
            const title = box.dataset.title;
            const items = JSON.parse(box.dataset.items);
            openPanel(title, items);
        });
    });
});
