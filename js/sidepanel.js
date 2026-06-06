function initSidepanel() {
  const container = document.querySelector(".container");
  const sidePanel = document.getElementById("side-panel");
  const panelContent = document.getElementById("panel-content");
  const closeBtn = document.querySelector(".close-btn");

  if (!container || !currentPageData) return;

  let activeBox = null;

  Object.entries(currentPageData).forEach(([name, config]) => {
    const box = document.createElement("div");

    box.id = name.toLowerCase().replace(/\s/g, "_");
    box.className = "box";
    box.textContent = name;

    box.addEventListener("click", () => {
      // ACTIVE STATE
      if (activeBox) {
        activeBox.classList.remove("active-box");
      }

      box.classList.add("active-box");
      activeBox = box;

      // FADE OUT CONTENT
      panelContent.style.opacity = "0";

      setTimeout(() => {
        panelContent.innerHTML = "";

        const title = document.createElement("h2");
        title.className = "panel-main-title";
        title.textContent = config.title || name;
        panelContent.appendChild(title);

        const data = config?.data || [];

        // HANDLE EMPTY DATA
        if (data.length === 0) {
          const msg = document.createElement("p");
          msg.textContent = "Coming soon...";
          panelContent.appendChild(msg);
        }

        data.forEach((item) => {
          // HEADER
          if (item.header) {
            const header = document.createElement("h3");
            header.textContent = item.header;
            panelContent.appendChild(header);
            return;
          }

          // ROW
          const row = document.createElement("div");
          row.className = "panel-link";

          row.style.cursor = "pointer";
          row.addEventListener("click", (e) => {
            if (e.target.tagName !== "IMG") {
              const firstLink = item.icons?.[0]?.url;
              if (firstLink && firstLink !== "#") {
                window.open(firstLink, "_blank");
              }
            }
          });

          const label = document.createElement("span");
          label.textContent = item.label || "";

          const iconGroup = document.createElement("div");
          iconGroup.className = "icon-group";

          // ICONS
          (item.icons || []).forEach((icon) => {
            const link = document.createElement("a");
            link.href = icon.url || "#";
            link.target = "_blank";

            const img = document.createElement("img");
            img.src = icon.src;
            img.alt = icon.alt || "";
            img.title = icon.alt || "";
            img.className = "panel-icon";

            link.appendChild(img);
            iconGroup.appendChild(link);
          });

          row.appendChild(label);
          row.appendChild(iconGroup);
          panelContent.appendChild(row);
        });

        panelContent.style.opacity = "1";
      }, 120);

      // OPEN PANEL
      requestAnimationFrame(() => {
        sidePanel.classList.add("open");
        document.body.classList.add("panel-open"); // ✅ LOCK BACKGROUND SCROLL
      });
    });

    container.appendChild(box);
  });

  // CLOSE BUTTON
  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      sidePanel.classList.remove("open");
      document.body.classList.remove("panel-open"); // ✅ UNLOCK SCROLL

      if (activeBox) {
        activeBox.classList.remove("active-box");
        activeBox = null;
      }
    });
  }

  // CLICK OUTSIDE
  sidePanel.addEventListener("click", (e) => {
    if (e.target === sidePanel) {
      sidePanel.classList.remove("open");
      document.body.classList.remove("panel-open"); // ✅ UNLOCK SCROLL

      if (activeBox) {
        activeBox.classList.remove("active-box");
        activeBox = null;
      }
    }
  });
}

// RUN
document.addEventListener("DOMContentLoaded", initSidepanel);