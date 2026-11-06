# AE Emoji

**Color emojis for editable text in Adobe After Effects.**

AE Emoji is a macOS extension that adds Apple-style color emojis to your After Effects compositions. Paste a sentence containing emojis, type a short emoji code, or choose an emoji from the panel. AE Emoji turns each detected emoji into a separate image layer and keeps it linked to its position in your editable text.

**[Download AE Emoji for macOS](https://github.com/alprntrz/ae-emoji/releases/latest)** · [Installation](#installation) · [Quick start](#quick-start) · [Troubleshooting](#troubleshooting)

## Why AE Emoji?

Depending on the font and After Effects setup, a pasted emoji can appear as a monochrome glyph instead of the colorful emoji you expected. AE Emoji supplies a color PNG for each emoji while allowing the words to remain editable in an ordinary text layer.

For example, in a text layer:

```text
Today is a good day /s :smile
```

After you finish editing and switch to the Selection tool, the text displays as **Today is a good day 😄**. The words stay in the text layer; the color emoji appears on its own linked layer.

## Features at a glance

- **Paste emojis:** Copy text containing Unicode emojis and paste it into an AE text layer for automatic conversion.
- **Type commands:** Use a number, such as `/s :1`, or a name, such as `/s :smile`.
- **Use multiple emojis:** Add them at the start, middle, or end of a sentence, including across multiple lines.
- **Keep text editable:** Change the words, font, size, color, or alignment in After Effects. Linked emoji layers follow their place in the text.
- **Change an emoji:** Select a linked layer and replace the emoji through the panel.
- **Browse the library:** Search an illustrated collection by emoji, name, or number; save favorites and see recent choices.
- **Create personal codes:** Assign your own name and optional number to an emoji.
- **Adjust appearance:** Change emoji size and vertical offset; save those settings as a preset.
- **Keep projects portable:** Emoji PNGs are stored next to your project, with recovery data saved in the project as well.
- **See what is happening:** The panel reports when auto-conversion is waiting and provides a restart button.

## Requirements

| Requirement | Supported |
| --- | --- |
| Computer | Mac with Apple Silicon or Intel |
| macOS | macOS 13 or later |
| After Effects | After Effects 2025 or later, on a macOS version supported by that release |
| Emoji font | The Mac's built-in Apple Color Emoji font |
| Script access | **Allow Scripts to Write Files and Access Network** enabled in After Effects |

The current package is for **macOS only**; Windows is not supported. No separate emoji font, Python, Xcode, Homebrew, Node.js, account, or API key is needed to use the extension. See [Known limitations](#known-limitations) for text-layer and layout restrictions.

## Installation

1. Download **AE-Emoji-4.4.5-Mac.zip** from the [latest release](https://github.com/alprntrz/ae-emoji/releases/latest). Use the ZIP attached to the release, rather than GitHub's automatically generated source-code archive.
2. Save your work and **quit After Effects completely**.
3. Extract the ZIP. Keep `Install.command`, `README.txt`, `Checksums.txt`, and the `extension` folder together inside the extracted `AE-Emoji` folder.
4. Double-click **Install.command**. The installer checks the package and installs the extension for the current macOS user. If an existing installation is found, it is backed up before replacement.
5. Open After Effects. Go to **After Effects → Settings → Scripting & Expressions** and enable **Allow Scripts to Write Files and Access Network**. AE Emoji needs file access to save the generated emoji images.
6. Open **Window → Extensions → AE Emoji**. Make sure **Auto-convert in After Effects** is enabled.
7. Save your After Effects project before using AE Emoji.

### macOS security prompt

The Adobe extension has a self-signed package signature, but the installer and renderer are **not Apple-notarized**. macOS may request approval or block them when the package is downloaded. If you trust the source, review the file and follow [Apple's instructions for opening downloaded software](https://support.apple.com/en-us/102445). The installer does not disable Gatekeeper or change After Effects or macOS security settings.

The AE script setting mentioned above controls file-writing **and network access** for scripts generally; AE Emoji uses it for its local files. The setting is changed by you in After Effects, not by the installer.

## Quick start

1. Save your `.aep` project in a writable folder.
2. Open **AE Emoji** and check that **Auto-convert in After Effects** is on.
3. Create an unlocked 2D text layer in an open composition.
4. Type `Hello /s :smile`, or paste a sentence containing 😄.
5. Finish editing with **Command+Enter**, then press **V** to switch to the Selection tool.
6. AE Emoji detects the emoji and creates a separate color layer. You can edit the text again later.

**Finish editing before waiting for conversion.** AE Emoji pauses while a text layer is selected with the Type tool to avoid interfering with your insertion point. Open the panel once after every After Effects launch. Built-in emoji conversion can continue after the panel is closed during that session; keep it open for custom emojis, status messages, and watcher recovery.

## Ways to add emojis

### 1. Paste a sentence

Copy a sentence containing Unicode emojis and paste it into a regular AE text layer. Finish editing with **Command+Enter**, then press **V**. AE Emoji detects the emojis and creates color layers for them.

A first conversion may take longer while an emoji is prepared. More emojis create more layers and can take more time. Emoji appearance and availability depend on the Mac's installed emoji font.

### 2. Type a number or name

Each built-in emoji has a number and a name in the panel's gallery. Start every command **in a text layer** with `/s` or `/smoji`, followed by a space and the code:

| Type in the text layer | What you see after conversion |
| --- | --- |
| `Hello /s :1` | Hello 😄 |
| `Hello /s :smile` | Hello 😄 |
| `Hello /smoji :smile` | Hello 😄 |
| `Hot /s :fire` | Hot 🔥 |
| `/s :smile This is a test /s :smile` | 😄 This is a test 😄 |

You can combine different emojis and repeat the same one. Each occurrence gets a separate layer. The library displays the available numbers and names; built-in numbers **1–60** are reserved for the library.

**A bare code stays text.** For example, `:1`, `:smile`, and times such as `12:30` are not automatically replaced when typed alone in a text layer. Unknown commands also stay unchanged. Names are case-insensitive; underscores and hyphens are treated alike.

The panel's dedicated **Emoji** field is different: it accepts a bare code such as `:1` because that field is used only to choose an emoji.

### 3. Add text from the panel

1. Open a composition and save the project.
2. In the **Emojis** tab, enter text in the **Text** field. You can include Unicode emojis or commands such as `/s :smile`.
3. Optionally select an emoji in the gallery or enter a code in the separate **Emoji** field. This choice is added at the end of the text.
4. Click **Add text + emoji**. The text and each emoji are added as separate layers.
5. Use After Effects' **Character** and **Paragraph** panels to change typography and alignment.

## How the layers work

AE Emoji keeps the Unicode text editable and displays each color emoji using an imported PNG layer. It also creates hidden measurement layers that help position each image in relation to the text. A sentence can contain emojis at multiple positions, including multiple lines; an emoji at the end follows the end of the text as it changes.

The PNGs are saved in a **Sevemoji Assets** folder next to the saved `.aep`. The folder retains the earlier product name for compatibility with existing projects. Recovery data is also stored in the project to help restore missing emoji images.

**When moving or sharing a project:** keep its `Sevemoji Assets` folder beside the `.aep`. If an image is missing, open AE Emoji, click **Repair project**, and save the project again. Keep the hidden measurement layers in the project so linked emojis can continue to be positioned.

**When trimming or splitting:** select the text layer and its visible emoji layers together. The extension can reconnect split pairs to their own measurement layers. If an older project drifts, use **Repair project** and save.

## Replace an existing emoji

1. In the timeline, select the emoji layer you want to change. You may also select its linked text layer; if that text contains multiple emojis, selecting the text loads the last emoji.
2. In AE Emoji, click **Load selected**.
3. Choose another emoji in the gallery or enter one in the **Emoji** field.
4. Click **Replace emoji**, then save the project.

The text remains editable. Existing emoji size, offset, and layer cuts are retained when replacing an emoji.

## Gallery, favorites, and recent emojis

The **Emojis** tab displays the library with each emoji's name and number. Use the search field to find an emoji by its character, name, or number.

- **Favorites:** Click the star on an emoji card to save it. Click the star again to remove it.
- **Recent:** Displays up to 24 recent choices and conversions.
- **All:** Browse the complete built-in library and your personal entries.

Search operates within the currently selected collection. Favorites and recent choices are stored locally on the Mac.

## Create your own names and numbers

Personal codes are aliases for individual emojis. They allow you to use a name and an optional number of your choice.

1. Open **Settings → Personal codes**.
2. Enter a name and one emoji, or use a built-in library code in the emoji field.
3. Optionally enter a personal number from **61 to 999999**.
4. Click **Save code**.

For example, name `coffee`, emoji ☕, and number `101` give you both `/s :coffee` and `/s :101`. Personal numbers must be unique. The built-in names and numbers **1–60** are reserved; a personal name also cannot duplicate a built-in name.

To edit an entry, select it, make your changes, and click **Update code**. Clear the Number field to remove only the number; click **Remove** to delete the entry. Changes affect future commands and do not replace emojis already placed in a project. Personal codes are stored on the current Mac.

## Set emoji size and vertical offset

Open **Settings → Emoji appearance** to adjust how new or selected emojis look:

- **Size (%):** `100` is the standard size; `85` makes the emoji smaller.
- **Vertical offset (px):** A negative value moves the emoji up; a positive value moves it down.
- **Save preset:** Name and save the current values for reuse.
- **Default for new emojis:** Choose which preset applies to future conversions.
- **Read selected:** Load the selected emoji's size and offset into the panel.
- **Apply to selected:** Apply the values to selected emoji layers or to all linked emojis of selected text layers. This can be undone in After Effects.

The included presets are **Standard**, **Compact**, and **Raised**. Changing the default does not change existing layers. Larger emojis can extend beyond a text box.

## Troubleshooting

Start with the message below **Auto-convert in After Effects**. It explains whether the extension is waiting for a saved project, script file access, the Selection tool, a supported layer, or another action. If the watcher stops, click **Restart auto-convert**.

### A command or pasted emoji does not convert

1. Save the `.aep` in a writable location and open a composition.
2. Open the AE Emoji panel and enable **Auto-convert in After Effects**.
3. Check **After Effects → Settings → Scripting & Expressions → Allow Scripts to Write Files and Access Network**.
4. Use an unlocked 2D text layer. Source Text keyframes and expressions are not converted automatically.
5. Type a complete command such as `Hello /s :1`. Bare `:1` stays text.
6. Finish editing with **Command+Enter**, then press **V**. Check the status message and use **Restart auto-convert** if needed.
7. In **File → Project Settings → Expressions**, choose the JavaScript expression engine.

Adding an emoji through the panel can work even when automatic conversion cannot write files: the two workflows use different file-writing interfaces. Panel success alone therefore does not establish that AE script file access is enabled.

### The panel is missing

Quit After Effects, run **Install.command** again, and reopen AE. Check that the AE version is supported and open **Window → Extensions → AE Emoji**. Keep the signed extension files unchanged.

### The installer or renderer is blocked

Read the macOS prompt and, if you trust the downloaded file, follow Apple's standard approval process described in [macOS security prompt](#macos-security-prompt). If `Install.command` reports a permission error, open Terminal, type `/bin/zsh` followed by a space, drag `Install.command` into the window, and press Return.

### An emoji image is missing

Keep `Sevemoji Assets` beside the project. If an image is missing, open the extension and click **Repair project** to attempt recovery using the data stored in the project. Save the `.aep` after repair.

## Privacy and local files

Text and emoji processing run locally without analytics. The extension does not require an account or API key. The distribution excludes creator projects, local settings, caches, personal filesystem paths, credentials, and private signing keys.

Favorites, recent choices, personal codes, and appearance presets are created locally for the current user. The extension installs under the current user's `Library/Application Support/Adobe/CEP/extensions/co.sevenapps.paste`; local settings and update backups live under `Library/Application Support/Sevemoji`. These paths are resolved on each user's Mac.

## Known limitations

- Automatic conversion skips text layers with **Source Text keyframes or expressions**.
- Some joined family or profession emoji sequences may be separated by After Effects when pasted.
- Text paths, character animation, and right-to-left layouts are not fully supported.
- There is no fixed emoji-count limit, but more emojis create more layers and require more processing. The panel accepts up to 6,000 characters.
- Emoji availability and appearance depend on the Mac's installed emoji font and macOS version.
- The current distribution supports macOS, not Windows.

## Remove AE Emoji

Quit After Effects. In Finder, choose **Go → Go to Folder**, then open:

```text
~/Library/Application Support/Adobe/CEP/extensions/
```

Move `co.sevenapps.paste` to the Trash. Keep project asset folders with your `.aep` files. Local preferences remain available if you reinstall.

## For developers

`extension/` contains the CEP panel, After Effects scripts, assets, and a precompiled universal macOS renderer. The renderer's build source is not included in this repository. Private signing material is excluded. Modifying extension files invalidates their existing Adobe package signature.

The dependency-free checks require a recent Node.js version:

```sh
node tests/parser.js
node tests/automation.js
```

For the guide included in the installer, see [README.txt](README.txt).
