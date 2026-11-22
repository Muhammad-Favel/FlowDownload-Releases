(() => {
  // Theme switcher (Ink Dark / Ink Light)
  const root = document.documentElement;
  const themeToggle = document.getElementById("themeToggle");
  const applyTheme = (theme) => {
    root.setAttribute("data-theme", theme);
    if (themeToggle) {
      themeToggle.setAttribute(
        "aria-label",
        theme === "light" ? "Switch to dark theme" : "Switch to light theme"
      );
    }
    document.querySelectorAll("#screenshots img[data-dark-src][data-light-src]").forEach((img) => {
      const nextSrc = theme === "light" ? img.dataset.lightSrc : img.dataset.darkSrc;
      if (nextSrc && img.getAttribute("src") !== nextSrc) {
        img.setAttribute("src", nextSrc);
      }
    });
    const nextFavicon = theme === "light" ? "assets/favicon.png?v=3" : "assets/favicon-dark.png?v=3";
    ["faviconIcon", "faviconShortcut"].forEach((id) => {
      const link = document.getElementById(id);
      if (link && link.getAttribute("href") !== nextFavicon) {
        link.setAttribute("href", nextFavicon);
      }
    });
  };
  const savedTheme = localStorage.getItem("flowdownload-theme");
  const preferredTheme =
    savedTheme ||
    (window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark");
  applyTheme(preferredTheme);

  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      const next = root.getAttribute("data-theme") === "light" ? "dark" : "light";
      localStorage.setItem("flowdownload-theme", next);
      applyTheme(next);
    });
  }

  const formatBytes = (bytes) => {
    if (!bytes || Number.isNaN(bytes)) return "56.0 MB";
    return `${(bytes / 1_000_000).toFixed(1)} MB`;
  };

  fetch("./source.json")
    .then((res) => (res.ok ? res.json() : null))
    .then((data) => {
      const app = data?.apps?.[0];
      const latest = app?.versions?.[0];
      if (!latest) return;

      const sizeLabel = formatBytes(latest.size);
      const versionLabel = `v${latest.version}`;

      const heroVersion = document.getElementById("heroVersion");
      const heroSize = document.getElementById("heroSize");
      if (heroVersion) heroVersion.textContent = versionLabel;
      if (heroSize) heroSize.textContent = sizeLabel;

      const metaText = `Version ${latest.version} · ${sizeLabel} · iOS ${latest.minOSVersion || "16.0"}+`;
      const releaseMetaDirect = document.getElementById("releaseMetaDirect");
      if (releaseMetaDirect) releaseMetaDirect.textContent = metaText;

      const ipaHref = latest.downloadURL || "#install";
      const paneDirectLink = document.getElementById("paneDirectLink");
      if (paneDirectLink) paneDirectLink.href = ipaHref;
    })
    .catch(() => {});

  // Scroll reveal + benchmark animation
  const revealNodes = document.querySelectorAll("[data-reveal]");
  const animateBenchmark = () => {
    document.querySelectorAll(".anim-bar").forEach((bar) => {
      const target = bar.dataset.width;
      if (target) bar.style.width = target;
    });
  };

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          if (entry.target.id === "benchmarkPanel") {
            animateBenchmark();
          }
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.14 }
    );
    revealNodes.forEach((el) => observer.observe(el));
  } else {
    revealNodes.forEach((el) => el.classList.add("is-visible"));
    animateBenchmark();
  }

  // Mobile nav toggle
  const menuToggle = document.getElementById("menuToggle");
  const mobileNav = document.getElementById("mobileNav");
  if (menuToggle && mobileNav) {
    menuToggle.addEventListener("click", () => {
      const open = mobileNav.hidden;
      mobileNav.hidden = !open;
      menuToggle.setAttribute("aria-expanded", String(open));
    });
  }

  // Hero Boost mode preview switcher + SVG stream state
  const modeSnapshots = {
    wifi: {
      meta: "233.9 MB / 1.82 GB · Wi-Fi only (BN-01)",
      total: "6.44 MB/s",
      pct: "13%",
      wifi: "6.44 MB/s",
      cell: "0.00 MB/s",
      conn: "1 active · Wi-Fi",
      wifiPct: "68%",
      cellPct: "0%",
      hud: "Wi-Fi single lane (BN-01)",
      wifiOpacity: "1",
      cellOpacity: "0.15"
    },
    cellular: {
      meta: "70.0 MB / 1.82 GB · Cellular only (BN-02)",
      total: "1.51 MB/s",
      pct: "4%",
      wifi: "0.00 MB/s",
      cell: "1.51 MB/s",
      conn: "1 active · Cellular",
      wifiPct: "0%",
      cellPct: "26%",
      hud: "Cellular single lane (BN-02)",
      wifiOpacity: "0.15",
      cellOpacity: "1"
    },
    boost: {
      meta: "405.6 MB / 1.82 GB · Direct Boost (BN-03)",
      total: "7.80 MB/s",
      pct: "22%",
      wifi: "6.48 MB/s",
      cell: "1.32 MB/s",
      conn: "6 active · 57 reused",
      wifiPct: "66%",
      cellPct: "14%",
      hud: "98% radio aggregation",
      wifiOpacity: "1",
      cellOpacity: "1"
    }
  };

  document.querySelectorAll(".lane-tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      const mode = tab.dataset.mode;
      const snap = modeSnapshots[mode];
      if (!snap) return;

      document.querySelectorAll(".lane-tab").forEach((btn) => {
        const active = btn === tab;
        btn.classList.toggle("is-active", active);
        btn.setAttribute("aria-selected", String(active));
      });

      document.getElementById("previewFileMeta").textContent = snap.meta;
      document.getElementById("previewTotalSpeed").textContent = snap.total;
      document.getElementById("previewPct").textContent = snap.pct;
      document.getElementById("previewWifiSpeed").textContent = snap.wifi;
      document.getElementById("previewCellSpeed").textContent = snap.cell;
      document.getElementById("previewConn").textContent = snap.conn;
      document.getElementById("previewBarWifi").style.width = snap.wifiPct;
      document.getElementById("previewBarCell").style.width = snap.cellPct;

      const hud = document.getElementById("hudEfficiency");
      const svgWifi = document.getElementById("svgStreamWifi");
      const svgCell = document.getElementById("svgStreamCell");
      if (hud) hud.textContent = snap.hud;
      if (svgWifi) svgWifi.style.opacity = snap.wifiOpacity;
      if (svgCell) svgCell.style.opacity = snap.cellOpacity;
    });
  });

  // Install method tabs (scoped per .install-panel so iOS tabs never hide Android)
  document.querySelectorAll(".install-tab[data-install]").forEach((tab) => {
    tab.addEventListener("click", () => {
      const target = tab.dataset.install;
      const panel = tab.closest(".install-panel");
      if (!panel) return;

      panel.querySelectorAll(".install-tab[data-install]").forEach((btn) => {
        const active = btn === tab;
        btn.classList.toggle("is-active", active);
        btn.setAttribute("aria-selected", String(active));
      });
      panel.querySelectorAll(".install-pane[data-pane]").forEach((pane) => {
        const match = pane.dataset.pane === target;
        pane.hidden = !match;
        pane.classList.toggle("is-active", match);
      });
    });
  });

})();
