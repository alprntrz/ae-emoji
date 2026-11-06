param([string]$AppDataRoot = $env:APPDATA)
$ErrorActionPreference = 'Stop'
$package = $PSScriptRoot
if ([string]::IsNullOrWhiteSpace($AppDataRoot)) { throw 'APPDATA is not set.' }
if (Get-Process -Name AfterFX -ErrorAction SilentlyContinue) { throw 'Save your work and quit After Effects before installing.' }
$checks = Join-Path $package 'Checksums.txt'
if (!(Test-Path -LiteralPath $checks)) { throw 'Checksums.txt is missing. Extract the original ZIP again.' }
foreach ($line in [IO.File]::ReadAllLines($checks)) {
 if ($line -notmatch '^([0-9a-fA-F]{64})  (.+)$') { throw 'Invalid checksum entry.' }
 $hash=$Matches[1].ToLowerInvariant(); $relative=$Matches[2]
 if ($relative -match '(^[\\/]|(^|[\\/])\.\.([\\/]|$)|:)') { throw 'Invalid package path.' }
 $item=Join-Path $package $relative
 if (!(Test-Path -LiteralPath $item -PathType Leaf) -or (Get-FileHash -LiteralPath $item -Algorithm SHA256).Hash.ToLowerInvariant() -ne $hash) { throw "Package verification failed: $relative" }
}
$parent=Join-Path $AppDataRoot 'Adobe\CEP\extensions'
$destination=Join-Path $parent 'co.sevenapps.paste'
$stage=Join-Path $parent ('.ae-emoji-install-'+[guid]::NewGuid().ToString('N'))
$backup=$null
New-Item -ItemType Directory -Force -Path $parent | Out-Null
try {
 New-Item -ItemType Directory -Path $stage | Out-Null
 Copy-Item -Path (Join-Path $package 'extension\*') -Destination $stage -Recurse -Force
 if (Test-Path -LiteralPath $destination) {
  $backupParent=Join-Path $AppDataRoot 'Sevemoji\Backups'
  New-Item -ItemType Directory -Force -Path $backupParent | Out-Null
  $backup=Join-Path $backupParent ((Get-Date -Format 'yyyyMMdd-HHmmss')+'-'+[guid]::NewGuid().ToString('N'))
  Move-Item -LiteralPath $destination -Destination $backup
 }
 try { Move-Item -LiteralPath $stage -Destination $destination }
 catch { if ($backup -and (Test-Path -LiteralPath $backup) -and !(Test-Path -LiteralPath $destination)) { Move-Item -LiteralPath $backup -Destination $destination }; throw }
 Write-Host 'AE Emoji installed. Open After Effects > Window > Extensions > AE Emoji.'
 Write-Host 'Enable Allow Scripts to Write Files and Access Network in After Effects settings.'
} finally { if (Test-Path -LiteralPath $stage) { Remove-Item -LiteralPath $stage -Recurse -Force } }
