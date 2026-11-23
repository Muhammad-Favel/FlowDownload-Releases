# Contributing to FlowDownload Releases

Thank you for helping improve FlowDownload!

## Reporting Issues

When opening an issue for an iOS or Android release, please include:

- **Platform & OS version** (e.g. `iOS 17.7`, `iOS 18.4`, `iOS 26.x`, `iPhone Duo`, or `Android 14`)
- **App version** (e.g. `v1.0.0`)
- **Install method** (Direct `.ipa` via TrollStore / Sideloadly / Feather, AltStore / SideStore `source.json`, FlowDownload Desktop Installer, or `.apk`)
- **Steps to reproduce** and any relevant logs or screenshots

## Pull Requests

Contributions to the release site (`index.html`, `styles.css`, `app.js`, `README.md`, and documentation) are welcome:

1. Fork the repository and create a feature branch from `main`.
2. Keep changes focused and verify `source.json` remains valid JSON if touched.
3. Open a pull request with a clear summary of your changes.

## Checksum Integrity

Do not modify release `.sha256` values or `source.json` hashes without matching verified release artifacts on the corresponding GitHub Release tag.
