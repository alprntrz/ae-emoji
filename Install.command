#!/bin/zsh
set -euo pipefail

_sevemoji_install() {
  local sevemoji_source="$1" sevemoji_library="$2"
  local sevemoji_parent="$sevemoji_library/Application Support/Adobe/CEP/extensions"
  local sevemoji_destination="$sevemoji_parent/co.sevenapps.paste"
  local sevemoji_stage sevemoji_backup=''
  mkdir -p "$sevemoji_parent"
  sevemoji_stage=$(/usr/bin/mktemp -d "$sevemoji_parent/.sevemoji-install.XXXXXX")
  if ! /usr/bin/ditto "$sevemoji_source" "$sevemoji_stage"; then
    /bin/rm -rf "$sevemoji_stage"
    print -u2 'Could not prepare AE Emoji. The existing installation was not changed.'
    return 1
  fi
  /bin/chmod 755 "$sevemoji_stage/native/sevemoji-render"
  if [[ -e "$sevemoji_destination" ]]; then
    sevemoji_backup="$sevemoji_library/Application Support/Sevemoji/Backups/$(/bin/date +%Y%m%d-%H%M%S)-$$"
    mkdir -p "${sevemoji_backup:h}"
    if ! /bin/mv "$sevemoji_destination" "$sevemoji_backup"; then
      /bin/rm -rf "$sevemoji_stage"
      print -u2 'Could not back up the existing installation.'
      return 1
    fi
  fi
  if ! /bin/mv "$sevemoji_stage" "$sevemoji_destination"; then
    if [[ -n "$sevemoji_backup" ]]; then /bin/mv "$sevemoji_backup" "$sevemoji_destination"; fi
    /bin/rm -rf "$sevemoji_stage"
    print -u2 'Installation failed. The previous installation was restored.'
    return 1
  fi
  print 'AE Emoji 4.4.4 installed successfully.'
  print 'Open After Effects > Window > Extensions > AE Emoji.'
  print 'In AE Settings > Scripting & Expressions, enable:'
  print '  Allow Scripts to Write Files and Access Network'
  print 'Save the AEP. Type Hello /s :1, finish with Command+Enter, then press V.'
  print 'The panel shows auto-conversion status and a Restart auto-convert button.'
  print 'This installer does not change macOS or AE security settings.'
}

_sevemoji_main() {
  local sevemoji_package="${1:A:h}"
  if [[ "$(/usr/bin/uname -s)" != Darwin ]]; then
    print -u2 'This package is for macOS only.';return 1
  fi
  local sevemoji_os=$(/usr/bin/sw_vers -productVersion)
  if (( ${sevemoji_os%%.*} < 13 )); then
    print -u2 'AE Emoji requires macOS 13 or later and a compatible After Effects version.';return 1
  fi
  if /usr/bin/pgrep -x 'After Effects' >/dev/null; then
    print -u2 'Save your work and quit After Effects, then run Install.command again.';return 1
  fi
  print 'Checking the package…'
  if ! (cd "$sevemoji_package" && /usr/bin/shasum -a 256 -c Checksums.txt >/dev/null); then
    print -u2 'The package is incomplete or changed. Extract the original ZIP again.';return 1
  fi
  local sevemoji_check
  if ! sevemoji_check=$("$sevemoji_package/extension/native/sevemoji-render" <<<'{"action":"check"}'); then
    print -u2 'The emoji renderer could not start. See Troubleshooting in README.txt.';return 1
  fi
  if [[ "$sevemoji_check" != *'"ok":true'* ]]; then
    print -u2 'The emoji renderer could not start. See README.txt.';return 1
  fi
  _sevemoji_install "$sevemoji_package/extension" "$HOME/Library"
}

if [[ "$ZSH_EVAL_CONTEXT" == toplevel ]]; then
  _sevemoji_main "$0"
  if [[ -t 0 ]]; then read -r '?Press Return to close this window. '; fi
fi
