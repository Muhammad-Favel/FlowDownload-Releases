<p align="center">
  <img src="assets/app-icon.png" alt="FlowDownload icon" width="96" height="96" />
</p>

<h1 align="center">FlowDownload</h1>

<p align="center">
  <strong>Bond Wi-Fi and Cellular into one download stream on iOS &amp; Android — with native torrents, external USB export, and automatic SHA-256 verification.</strong>
</p>

<p align="center">
  <a href="https://muhammad-favel.github.io/FlowDownload-Releases/">
    <img src="https://img.shields.io/badge/Website-Live-1496FF?style=for-the-badge" alt="Website" />
  </a>
  <a href="https://github.com/Muhammad-Favel/FlowDownload-Releases/releases/tag/v1.0.0">
    <img src="https://img.shields.io/badge/Release-v1.0.0-2DD4A8?style=for-the-badge" alt="Release v1.0.0" />
  </a>
  <a href="https://github.com/Muhammad-Favel/FlowDownload-Installer/releases/tag/v0.1.0">
    <img src="https://img.shields.io/badge/Desktop%20USB%20Installer-v0.1.0-111827?style=for-the-badge" alt="Desktop USB Installer" />
  </a>
  <img src="https://img.shields.io/badge/iOS-16.0%2B-0b0d14?style=for-the-badge" alt="iOS 16.0+" />
  <img src="https://img.shields.io/badge/Android-8.0%2B-0b0d14?style=for-the-badge" alt="Android 8.0+" />
</p>

<p align="center">
  <a href="https://muhammad-favel.github.io/FlowDownload-Releases/">Website</a> ·
  <a href="#install">Install</a> ·
  <a href="#screenshots">Screenshots</a> ·
  <a href="#how-boost-works">Architecture</a> ·
  <a href="#measured-boost-benchmark-bn-01--bn-03-iphone-12-pro">Benchmark</a> ·
  <a href="https://github.com/Muhammad-Favel/FlowDownload-Releases/issues">Report an Issue</a>
</p>

---

## Install

| Platform | Method | Package | Size | Direct Link |
| :--- | :--- | :--- | :---: | :--- |
| **iOS** (`16.0+`) | **Desktop USB Installer** (Windows) | `.exe` | `5.3 MB` | [Download Windows Installer](https://github.com/Muhammad-Favel/FlowDownload-Installer/releases/download/v0.1.0/FlowDownload-Installer-v0.1.0-windows-x64.exe) |
| **iOS** (`16.0+`) | **Desktop USB Installer** (macOS) | `.dmg` | `7.6 MB` | [Download macOS Installer](https://github.com/Muhammad-Favel/FlowDownload-Installer/releases/download/v0.1.0/FlowDownload-Installer-v0.1.0-macos-arm64.dmg) |
| **iOS** (`16.0+`) | **Direct IPA** (TrollStore / Sideloadly / Feather) | `.ipa` | `56.0 MB` | [Download FlowDownload-v1.0.0.ipa](https://github.com/Muhammad-Favel/FlowDownload-Releases/releases/download/v1.0.0/FlowDownload-v1.0.0.ipa) |
| **Android** (`8.0+`) | **Direct APK** (`arm64-v8a` &amp; `x86_64`) | `.apk` | `26.4 MB` | [Download FlowDownload-v1.0.0.apk](https://github.com/Muhammad-Favel/FlowDownload-Releases/releases/download/v1.0.0/FlowDownload-v1.0.0.apk) |

### iOS Desktop USB Installer & 3-App-ID Budget

[FlowDownload Installer](https://github.com/Muhammad-Favel/FlowDownload-Installer) downloads the latest `.ipa`, signs it with your Apple ID via Anisette v3, tracks your **7-day signature** for in-place USB refresh without losing app data, and lets you choose an App ID budget:

| Profile | App IDs | Included | Trade-Off |
| :--- | :---: | :--- | :--- |
| **Full** | `3` | Core app + Share Sheet + Safari extension | Uses all 3 free Apple ID slots |
| **Share Only** | `2` | Core app + Share Sheet handoff | Drops Safari toolbar popup |
| **Core** | `1` | Boost, `libtorrent`, AdGuard browser, USB export, SHA-256 | Drops Safari &amp; Share extensions |

> [!TIP]
> **Refreshing after 7 days:** Do **not** delete FlowDownload from your iPhone. Plug in via USB, sign in with the same Apple ID and profile, and your downloads, active torrents, and browser tabs stay intact.

---

## Screenshots

<p align="center">
  <img src="assets/screenshots/boost-direct.jpg" alt="Direct Boost 13.9 MB/s" width="168" />
  <img src="assets/screenshots/boost-torrent.jpg" alt="Torrent Boost 70 peers" width="168" />
  <img src="assets/screenshots/browser.jpg" alt="Flow Browser with AdGuard" width="168" />
  <img src="assets/screenshots/settings-storage.jpg" alt="Storage and USB settings" width="168" />
  <img src="assets/screenshots/file-verified.jpg" alt="SHA-256 Verified at completion" width="168" />
</p>

---

## How Boost Works

```mermaid
flowchart LR
    W["Wi-Fi (en0)"] -->|HTTP Range & Peer Sockets| S["APFS Staging Buffer"]
    C["Cellular (pdp_ip0)"] -->|HTTP Range & Peer Sockets| S
    S -->|Sequential 4 MiB Writes| U["Internal Storage / USB-C Drive"]
    U -->|Auto Checksum| V["SHA-256 Verified"]
```

1. **Dual-Interface Dispatch:** Assigns HTTP byte-range chunks and `libtorrent` peer sockets explicitly across Wi-Fi (`en0`) and Cellular (`pdp_ip0`), with stalled-lane recovery and connection reuse.
2. **APFS Staging Buffer:** Coalesces out-of-order chunks on fast internal flash so network sockets never stall waiting on slow Lightning or USB-C drives.
3. **Sequential USB Export & SHA-256:** Streams sequential `4 MiB` blocks to external drives and validates companion `.sha256` files or pasted hashes automatically on completion.

---

## Core Capabilities

| Subsystem | iOS (`SwiftUI`) | Android (`Jetpack Compose`) |
| :--- | :--- | :--- |
| **Multi-Path Boost** | `NWPath` / `en0` + `pdp_ip0` range scheduler | `ConnectivityManager` Wi-Fi + Cellular bonding |
| **Torrent Engine** | Embedded C++ `LibtorrentNative` (`magnet:` &amp; `.torrent`) | Native NDK `libtorrent` (`arm64-v8a` &amp; `x86_64`) |
| **External Storage** | Security-scoped USB-C / Lightning export | Storage Access Framework (SAF) USB OTG export |
| **Built-in Browser** | Content-blocking `WKWebView` with AdGuard rules | AdGuard-backed WebView with tab persistence |
| **Integrity & Privacy** | Automatic SHA-256 verification · Zero telemetry | Automatic SHA-256 verification · Zero telemetry |

---

## Measured Boost Benchmark (`BN-01` – `BN-03`, iPhone 12 Pro)

| Test ID | Transport Mode | Avg Speed | Peak / Efficiency |
| :---: | :--- | :---: | :--- |
| `BN-01` | Wi-Fi Only | `6.44 MB/s` | `8.14 MB/s` steady-state · `10.44 MB/s` peak |
| `BN-02` | Cellular Only | `1.51 MB/s` | `4.12 MB/s` peak |
| `BN-03` | **Boost (Wi-Fi + Cellular)** | **`7.80 MB/s`** | **98% of combined radio sum (`+21%` vs Wi-Fi, `10.09 MB/s` peak)** |

---

## Privacy & Verification

- **No telemetry or analytics:** Downloads, browser tabs, AdGuard rules, and diagnostics stay strictly on-device.
- **Android APK SHA-256:** `f79abc2f18d80419d4081728ede0f6ed8432c0f83838cee5210a40b4675434f1`
- **Local Site Preview:** `python3 -m http.server 8080`
