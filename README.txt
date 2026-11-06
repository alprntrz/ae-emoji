AE EMOJI 4.4.4
Color emojis for editable After Effects text

WHAT IT DOES
AE Emoji adds full-color Apple-style emojis to After Effects while keeping your
text editable. Each emoji has its own layer and follows its position in the text.
It converts pasted emojis, numbered codes and names, and supports multi-line
text and TikTokText Boxed Text. The panel includes an illustrated emoji library,
favorites, recent choices, personal codes and saved appearance presets.
The interface and help are in English. No keyboard shortcut is installed.

REQUIREMENTS
- A Mac with Apple Silicon or an Intel processor, running macOS 13 or later.
- After Effects 2025 or later, on a macOS version supported by that AE release.
- The Mac's built-in Apple Color Emoji font.
- Permission for After Effects scripts to write files (see step 4 below).
This is a macOS package; it does not run on Windows.
Python, Xcode, Homebrew and separate emoji fonts are not required.
TikTokText is optional and is not included.

INSTALL
1. Save your work and completely quit After Effects.
2. Extract the ZIP. Keep Install.command, README.txt, Checksums.txt and the
   extension folder together.
3. Double-click Install.command. It checks the package and installs AE Emoji
   for the current macOS user. It does not require an administrator password.
   An existing AE Emoji installation is backed up before replacement.
4. Open After Effects. Go to Settings > Scripting & Expressions and enable
   "Allow Scripts to Write Files and Access Network". AE Emoji needs file
   access to save emoji images; it does not send your text over the network.
5. Open Window > Extensions > AE Emoji. Keep "Auto-convert in After Effects"
   enabled. Save your project before adding emojis. Read the status under the
   switch: it should say Ready after you finish text editing.

macOS may request approval for downloaded software. If it blocks the installer
or sevemoji-render, review the file and use the normal approval option in
System Settings > Privacy & Security. This package is not Apple-notarized.
The Adobe extension has its own package signature; no CEP debug mode is needed.
An Adobe package signature is separate from Apple Developer ID signing. The
installer and native renderer need Apple Developer ID signing and notarization
for a normal verified distribution. This ZIP does not provide that approval.
No installer step disables Gatekeeper or changes macOS security settings.
For details: https://support.apple.com/en-us/102445

QUICK START
1. Save the AEP in a writable folder.
2. Create a normal text layer and type Hello /s :smile, Hello /s :1, or Hello 😄.
3. Finish editing with Command+Enter, then press V for the Selection tool.
4. AE Emoji converts the emoji into a separate color layer automatically.
5. Edit the text normally. The emoji follows its position in the text.

Conversion pauses while a text layer is selected with the Type tool. Always
finish editing and return to the Selection tool. A new emoji may take longer
on its first use. Open AE Emoji after each After Effects launch. Built-in emoji conversion can
continue after closing the panel for that session. Keep it open for custom
emojis, status messages and automatic watcher recovery.

USING THE PANEL
- Emojis: enter text, select an emoji and click Add text + emoji.
- Load selected: load an existing AE Emoji text or emoji layer into the panel.
- Replace emoji: change the selected emoji while keeping the text editable.
- Favorites: click the star on an emoji card to save or remove it.
- Recent: shows the last 24 choices and automatic conversions on this Mac.
- How to Use: detailed instructions, examples and known limits.
The panel preserves emojis at the start, middle and end of your text. Each
occurrence gets a separate layer. A gallery choice is added at the end.
Fonts, text size and color are edited in After Effects.

EMOJI CODES
/s :1 or /s :smile          😄
/s :heart                  ❤️
/smoji :fire               🔥

Start each code in text with /s or /smoji, followed by a space. Plain :1 and
:smile remain literal text. Names ignore capitalization. Unknown commands
and times such as 12:30 are preserved. Real pasted emojis convert as before.

Every command adds a separate emoji, even when the same emoji is repeated:
/s :smile this is a test /s :smile  ->  😄 this is a test 😄
Append another command to add another emoji. Use Replace emoji to change an
existing emoji. The dedicated Emoji field and Personal codes emoji field
still accept bare :1 and :smile because those fields only choose emojis.

PERSONAL CODES AND NUMBERS
Settings > Personal codes lets you create names and optional numbers.
Enter a name, one emoji (or library code), and optionally a number from 61 to
999999. Click Save code. Example: coffee, ☕, 101 gives you both /s :coffee
and /s :101. The initial names are happy, love and coffee; no personal numbers
are preassigned. Personal entries appear in the gallery and search.

Click a saved entry to change its name, emoji or number, then click Update
code. Clear Number to remove its numeric code. New code clears the form;
Remove deletes the entry. Each number must be unique. Built-in names and
numbers 1–60 stay reserved. Changes affect future commands, not emojis already
placed in a project. Personal codes work in the panel, native text layers
and TikTokText. Settings persist locally across restarts.

ALIGNMENT UPDATE IN 4.4.4
Restores the native glyph size and baseline used before 4.4. Measurements use
the surrounding text font, including wrapped text and TikTokText boxes. Existing emoji layers
are corrected when auto-conversion checks them. Use Repair project to update
the whole project, then save. Your manual emoji size and offset stay intact.

EMOJI APPEARANCE
Settings > Emoji appearance controls emoji size and vertical position.
- Size (%): 100 is the normal size; 85 makes the emoji smaller.
- Vertical offset (px): negative moves it up; positive moves it down.
- Save preset: save the current values under a name. Reusing a name updates it.
- Default for new emojis: apply a saved preset to future conversions.
- Read selected: load values from a selected emoji.
- Apply to selected: apply values to selected emojis, or every emoji attached
  to selected text layers. This action can be undone in AE.
Standard, Compact and Raised are included. Replacing an existing emoji retains
its size, offset and cuts. Larger emojis can extend beyond a TikTokText box.

TIKTOKTEXT BOXED TEXT
Paste text with emojis or AE Emoji codes into TikTokText, then create Boxed Text.
AE Emoji converts its completed, unselected text layer while preserving its
box and body text formatting. For later direct text edits, finish with
Command+Enter and V. TikTokText must be installed separately to create its boxes.

TRIM, SPLIT AND MOVE
Select the text and its visible emoji layers together when trimming, moving
in time or splitting. Split segments can be edited independently. Keep the
hidden measurement layers; AE Emoji uses them to position the emojis.
Use Repair project if an older project needs its links repaired.

SAVE AND TRANSFER PROJECTS
Emoji images are saved in a Sevemoji Assets folder beside the AEP. Always move
or share that folder together with the project. A recovery copy is stored in
the project; Repair project can restore missing files while AE Emoji is installed.
Save the AEP again after repair.

LOCAL DATA AND PRIVACY
This distribution contains application files, generic emoji assets and this
guide. It includes no creator projects, account details, usernames, absolute
personal paths, usage history, favorites, personal settings or private keys.
Favorites, recent choices, personal codes and presets are created locally for
whoever uses the plugin. Text and emoji rendering run locally without analytics.
The plugin is installed under the current user's Library/Application Support/
Adobe/CEP/extensions/co.sevenapps.paste. Local settings and update backups live
under Library/Application Support/Sevemoji. These paths are resolved on the
receiving computer; they are not tied to the original development computer.

AUTOMATIC CONVERSION IN 4.4.4
The panel now shows why conversion is waiting: script file access, an unsaved
project, the Type tool, a stopped watcher or a conversion error. A lightweight
health check restarts a lost watcher while the panel is open. Restart auto-convert
lets you request another start without changing your text or security settings.

TROUBLESHOOTING
- Panel missing: quit AE, run Install.command again, then reopen AE. Use a
  supported AE version. Keep the signed extension files unchanged.
- Panel works but text-layer commands do not: open AE Emoji and read the
  status under Auto-convert. Panel image saving and automatic image saving use
  different AE interfaces; panel success does not prove script file access is
  enabled. Enable it in AE Settings > Scripting & Expressions when required.
  Save the project, type Hello /s :1, finish with Command+Enter, then press V.
  Plain :1 intentionally stays text. Click Restart auto-convert if needed.
- Install.command permission error: open Terminal, type /bin/zsh followed by
  a space, drag Install.command into the window and press Return.
- Renderer blocked by macOS: review and allow the downloaded software using
  the standard Privacy & Security approval flow, then rerun the installer.
- Missing emoji assets: keep Sevemoji Assets beside the project or use Repair
  project, then save again.

LIMITS
There is no fixed emoji-count limit. More emoji layers take longer to process;
32 emojis in one layer were tested. The panel accepts up to 6,000 characters.
Source Text keyframes and expressions are not converted automatically. Manual line breaks and paragraph wrapping are
supported. Some joined family/profession sequences may be split by After Effects.
Text paths, character animation and right-to-left layouts are not fully supported.
Emoji availability and appearance can vary with the receiving Mac's macOS version.

REMOVE AE EMOJI
Quit AE. In Finder, choose Go > Go to Folder and enter:
~/Library/Application Support/Adobe/CEP/extensions/
Move co.sevenapps.paste to the Trash. Keep project asset folders with your AEPs.
Local preferences remain available if you reinstall.

TECHNICAL NOTE
The renderer includes native arm64 and x86_64 builds. The extension is packaged
with a generic AE Emoji self-signed certificate, valid for ten years from signing.
No signing private key is included. Adobe's packaging reference:
https://github.com/Adobe-CEP/Getting-Started-guides/tree/master/Package%20Distribute%20Install
