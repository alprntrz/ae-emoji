AE EMOJI FOR WINDOWS — EXPERIMENTAL BUILD

This build has not yet been verified inside After Effects on Windows.
It is intended for testing; do not rely on it for production work yet.

REQUIREMENTS
Windows 10 or later, a compatible After Effects 2025 or later, and the
system Segoe UI Emoji font. After Effects must be allowed to write files.

INSTALL
1. Save your work and quit After Effects.
2. Extract the complete package; keep Install.cmd, Install.ps1,
   Checksums.txt, and the extension folder together.
3. Run Install.cmd. It checks the package, backs up an existing installation,
   and installs for the current user. No security settings are changed.
4. In After Effects, enable Edit > Preferences > Scripting & Expressions >
   Allow Scripts to Write Files and Access Network. Open Window > Extensions >
   AE Emoji. Save your project in a writable folder.
5. Type Hello /s :1 in a 2D text layer. Finish editing with Ctrl+Enter,
   then press V. The emoji should become a separate layer.

Built-in emoji use the supplied image assets, matching the macOS library.
Other emojis are rendered using Windows' Segoe UI Emoji font, so their style
and availability differ from Apple emoji. Keep the panel open when using
custom emojis. Emoji positions and support must be tested on your AE version.

If PowerShell's execution policy blocks the installer, consult your system
administrator or Microsoft's documentation. The installer does not change it.
The CEP extension is self-signed and is not a Microsoft-signed installer.
