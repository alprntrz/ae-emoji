# AE Emoji

Color Apple-style emojis for editable After Effects text.

**[Download AE Emoji 4.4.4 for macOS](https://github.com/alprntrz/ae-emoji/releases/latest)**

AE Emoji converts pasted emojis and typed commands into separate PNG layers. Your text stays editable, and each emoji follows its place in the text.

## What it does

- Convert pasted Unicode emojis into color emoji layers.
- Type `/s :1`, `/s :smile`, or `/smoji :smile` directly in an AE text layer.
- Place multiple emojis at the beginning, middle, or end of a sentence.
- Use multiline text and TikTokText Boxed Text.
- Replace an emoji without rebuilding the text layer.
- Browse the gallery, Favorites, and Recent; create personal names and numbers.
- Adjust emoji size and vertical offset with reusable appearance presets.
- See why auto-conversion is waiting and restart it from the panel.
- Restore missing emoji images using recovery data stored in the project.

## Requirements

- macOS 13 or later on Apple Silicon or Intel.
- After Effects 2025 or later, on a macOS version supported by that release.
- The built-in Apple Color Emoji font.

Windows is not supported. TikTokText is optional and must be installed separately. Python, Xcode, Homebrew, and Node.js are not needed to use the extension.

## Install

1. Download **AE-Emoji-4.4.4-Mac.zip** from [Releases](https://github.com/alprntrz/ae-emoji/releases/latest).
2. Save your work and completely quit After Effects.
3. Extract the ZIP. Keep all files in its `AE-Emoji` folder together.
4. Double-click **Install.command**. An existing AE Emoji installation is backed up first.
5. Open AE. In **Settings → Scripting & Expressions**, enable **Allow Scripts to Write Files and Access Network**. AE Emoji uses this permission to save local emoji images.
6. Open **Window → Extensions → AE Emoji** and leave **Auto-convert in After Effects** enabled.

The release ZIP contains the installer, signed Adobe extension, and full README. For normal installation, use the release asset above.

### macOS approval

This release is **not Apple-notarized**. macOS may ask for approval or block the downloaded installer or renderer. Review the file and follow [Apple's standard approval instructions](https://support.apple.com/en-us/102445) if you trust its source. The installer does not disable Gatekeeper or change AE/macOS security settings. The Adobe extension signature is separate from Apple Developer ID signing and notarization.

## Quick start

1. Save the AEP in a writable folder.
2. Create an unlocked 2D text layer and type `Hello /s :smile`, or paste `Hello 😄`.
3. Finish typing with **Command+Enter**, then press **V**.
4. AE Emoji creates a separate emoji layer. Edit the text normally.

Open AE Emoji once after each AE launch. Keep the panel open for custom emojis, status messages, and automatic watcher recovery. Conversion pauses while a text layer is selected with the Type tool.

| Type in a text layer | Result |
| --- | --- |
| `Hello /s :1` | Hello 😄 |
| `Hello /s :smile` | Hello 😄 |
| `/smoji :fire` | 🔥 |
| `/s :smile this is a test /s :smile` | 😄 this is a test 😄 |
| `Literal :1` | Literal :1 |

Each command requires `/s` or `/smoji`, followed by a space. Bare `:1` and `:smile` remain text. The panel's dedicated Emoji field accepts bare codes because it only chooses an emoji.

## Personal codes

In **Settings → Personal codes**, choose a name, an emoji, and an optional number from **61 to 999999**. For example, `coffee`, ☕, and `101` let you use `/s :coffee` or `/s :101`. Built-in numbers 1–60 are reserved.

## Working with projects

- Change fonts, text size, alignment, and color in AE's Character and Paragraph panels.
- Select an emoji layer and use **Load selected → Replace emoji** to change that emoji.
- Trim or split the text and its visible emoji layers together. Keep the hidden measurement layers.
- Move the **Sevemoji Assets** folder with the AEP when sharing a project.
- Use **Repair project** to restore missing images or repair older links, then save.

## Troubleshooting

Read the message below **Auto-convert in After Effects**. It identifies missing script file access, an unsaved project, text editing mode, unsupported text layers, or a conversion error. Use **Restart auto-convert** to restart the watcher.

Panel insertion can work even when AE script file access is disabled: the panel and automatic conversion use different file-writing interfaces. If native text commands do not convert, check that permission, save the project, then finish typing with **Command+Enter → V**.

## Privacy

Text and emoji processing run locally without analytics. No account or API key is required. This repository excludes creator projects, local settings, caches, personal filesystem paths, credentials, and private signing keys. Favorites, recent choices, and personal codes are created on each user's own Mac.

## Limitations

- Source Text keyframes and expressions are not automatically converted.
- Some joined family/profession sequences can be separated by AE.
- Text paths, character animation, and right-to-left layouts are not fully supported.
- More emojis mean more layers and processing. The panel accepts up to 6,000 characters.
- Emoji availability and appearance depend on the Mac's installed emoji font.

## Repository contents

`extension/` contains the CEP panel, AE scripts, assets, and a precompiled universal macOS renderer. The native renderer's build source is not included in this repository. Private signing material is excluded; modifying extension files invalidates their existing Adobe package signature.

The dependency-free development checks require a recent Node.js version:

```sh
node tests/parser.js
node tests/automation.js
```

For the complete installation and usage guide, see [README.txt](README.txt).
