(() => {
  const repoURL = new URL("source.json", window.location.href).href;
  const repoUrlText = document.getElementById("repoUrlText");
  if (repoUrlText) {
    repoUrlText.textContent = repoURL;
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
      const versionLabel = `v${latest.version} · iOS ${latest.minOSVersion || "16.0"}+ · IPA`;

      const heroVersion = document.getElementById("heroVersion");
      const heroSize = document.getElementById("heroSize");
      if (heroVersion) heroVersion.textContent = versionLabel;
      if (heroSize) heroSize.textContent = sizeLabel;

      const metaText = `Version ${latest.version} · ${sizeLabel} · iOS ${latest.minOSVersion || "16.0"}+`;
      ["releaseMetaSideStore", "releaseMetaAltStore", "releaseMetaDirect"].forEach((id) => {
        const el = document.getElementById(id);
        if (el) el.textContent = metaText;
      });

      const sidestoreHref = `sidestore://source?url=${encodeURIComponent(repoURL)}`;
      const altstoreHref = `altstore://source?url=${encodeURIComponent(repoURL)}`;
      const ipaHref = latest.downloadURL || "#install";

      const sidestoreBtn = document.getElementById("sidestoreBtn");
      const directIpaBtn = document.getElementById("directIpaBtn");
      const paneSideStoreLink = document.getElementById("paneSideStoreLink");
      const paneAltStoreLink = document.getElementById("paneAltStoreLink");
      const paneDirectLink = document.getElementById("paneDirectLink");

      if (sidestoreBtn) sidestoreBtn.href = sidestoreHref;
      if (paneSideStoreLink) paneSideStoreLink.href = sidestoreHref;
      if (paneAltStoreLink) paneAltStoreLink.href = altstoreHref;
      if (directIpaBtn) directIpaBtn.href = ipaHref;
      if (paneDirectLink) paneDirectLink.href = ipaHref;
    })
    .catch(() => {});

  // Scroll progress hairline
  const scrollProgress = document.getElementById("scrollProgress");
  const updateScrollProgress = () => {
    if (!scrollProgress) return;
    const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const ratio = Math.min(1, Math.max(0, window.scrollY / maxScroll));
    scrollProgress.style.transform = `scaleX(${ratio.toFixed(4)})`;
  };
  window.addEventListener("scroll", updateScrollProgress, { passive: true });
  updateScrollProgress();

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

  // Interactive 3D Hero Stage pointer tilt (desktop)
  const heroStage = document.getElementById("heroStage");
  const stage3d = document.getElementById("stage3d");
  if (heroStage && stage3d && window.matchMedia("(pointer: fine)").matches) {
    heroStage.addEventListener("mousemove", (e) => {
      const rect = heroStage.getBoundingClientRect();
      const nx = (e.clientX - rect.left) / rect.width - 0.5;
      const ny = (e.clientY - rect.top) / rect.height - 0.5;
      stage3d.style.setProperty("--rx", `${(-nx * 9).toFixed(2)}deg`);
      stage3d.style.setProperty("--ry", `${(ny * 7).toFixed(2)}deg`);
    });
    heroStage.addEventListener("mouseleave", () => {
      stage3d.style.setProperty("--rx", "-5deg");
      stage3d.style.setProperty("--ry", "3deg");
    });
  }

  // Subtle 3D hover tilt on pipeline and capability cards
  if (window.matchMedia("(pointer: fine)").matches) {
    document.querySelectorAll("[data-tilt]").forEach((card) => {
      card.addEventListener("mousemove", (e) => {
        const rect = card.getBoundingClientRect();
        const nx = (e.clientX - rect.left) / rect.width - 0.5;
        const ny = (e.clientY - rect.top) / rect.height - 0.5;
        card.style.transform = `rotateY(${(nx * 6).toFixed(2)}deg) rotateX(${(-ny * 6).toFixed(2)}deg) translateY(-2px)`;
      });
      card.addEventListener("mouseleave", () => {
        card.style.transform = "";
      });
    });
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

  // Live Dual-Lane Waveform Canvas
  let activeMode = "boost";
  const canvas = document.getElementById("waveformCanvas");
  if (canvas && canvas.getContext) {
    const ctx = canvas.getContext("2d");
    let phase = 0;
    const drawWave = () => {
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      const showWifi = activeMode === "wifi" || activeMode === "boost";
      const showCell = activeMode === "cellular" || activeMode === "boost";

      const renderLane = (color, amp, freq, speedOffset) => {
        ctx.beginPath();
        for (let x = 0; x <= w; x += 6) {
          const env = Math.sin((x / w) * Math.PI);
          const y = h * 0.55 + Math.sin(x * freq + phase * speedOffset) * amp * env + Math.cos(x * freq * 0.5 - phase) * (amp * 0.35);
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.8;
        ctx.stroke();
      };

      if (showWifi) renderLane("#1496FF", activeMode === "boost" ? 9 : 8, 0.032, 1.35);
      if (showCell) renderLane("#2DD4A8", activeMode === "boost" ? 5.5 : 6, 0.044, 0.95);

      phase += 0.045;
      window.requestAnimationFrame(drawWave);
    };
    window.requestAnimationFrame(drawWave);
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
      activeMode = mode;

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

  // Install method tabs
  document.querySelectorAll(".install-tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      const target = tab.dataset.install;
      document.querySelectorAll(".install-tab").forEach((btn) => {
        const active = btn === tab;
        btn.classList.toggle("is-active", active);
        btn.setAttribute("aria-selected", String(active));
      });
      document.querySelectorAll(".install-pane").forEach((pane) => {
        const match = pane.dataset.pane === target;
        pane.hidden = !match;
        pane.classList.toggle("is-active", match);
      });
    });
  });

  // Copy repo URL
  const copyBtn = document.getElementById("copyRepoBtn");
  if (copyBtn) {
    copyBtn.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(repoURL);
        copyBtn.textContent = "Copied";
        setTimeout(() => {
          copyBtn.textContent = "Copy URL";
        }, 1600);
      } catch {
        copyBtn.textContent = "Copy manually";
      }
    });
  }
})();
