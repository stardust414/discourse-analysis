# Metadata collection only. Does not launch the app or alter Windows settings.
[CmdletBinding()]
param(
    [string]$PackageRoot = $PSScriptRoot,
    [string]$EvidenceRoot = (Join-Path $PSScriptRoot 'W2-results'),
    [ValidateSet('not-recorded','100','125','150')][string]$OperatorDisplayScale = 'not-recorded',
    [ValidateSet('not-recorded','small','default','maximized')][string]$WindowCondition = 'not-recorded'
)
$ErrorActionPreference = 'Stop'
if ($env:OS -ne 'Windows_NT') { throw 'Windows is required. No Windows runtime result can be collected on another OS.' }
$expected = '8b69136698e7bd29fc54f86971e5bfc4d37ac62f782a46131fea6d5df320b356'
$exe = Join-Path $PackageRoot 'Discourse Analysis 3.3.1 x64 Portable.exe'
if (-not (Test-Path -LiteralPath $exe -PathType Leaf)) { throw 'The original W1 portable EXE is missing.' }
$actual = (Get-FileHash -LiteralPath $exe -Algorithm SHA256).Hash.ToLowerInvariant()
if ($actual -ne $expected) { throw 'EXE SHA-256 mismatch. Stop testing and verify the package source.' }
$warnings = New-Object System.Collections.Generic.List[string]
function Redact-Path([string]$Value) {
    if (-not $Value) { return $null }
    $pairs = @(
        @($env:TEMP, '%TEMP%'), @($env:LOCALAPPDATA, '%LOCALAPPDATA%'),
        @($env:APPDATA, '%APPDATA%'), @($env:OneDrive, '%OneDrive%'),
        @($env:USERPROFILE, '%USERPROFILE%')
    )
    foreach ($pair in $pairs) {
        $prefix = [string]$pair[0]
        if ($prefix -and ($Value.Equals($prefix, [StringComparison]::OrdinalIgnoreCase) -or $Value.StartsWith($prefix.TrimEnd('\') + '\', [StringComparison]::OrdinalIgnoreCase))) {
            return [string]$pair[1] + $Value.Substring($prefix.Length)
        }
    }
    return '%UNMAPPED_PATH_REDACTED%'
}
$os = $null; $cpuArchitecture = @(); $languages = @()
try {
    $w = Get-CimInstance -ClassName Win32_OperatingSystem
    $os = [ordered]@{ Caption = $w.Caption; Version = $w.Version; BuildNumber = $w.BuildNumber; OSArchitecture = $w.OSArchitecture }
    $cpuArchitecture = @(Get-CimInstance -ClassName Win32_Processor | ForEach-Object { [int]$_.Architecture } | Select-Object -Unique)
} catch { $warnings.Add('OS/CPU CIM metadata could not be read.') }
try { $languages = @(Get-WinUserLanguageList | ForEach-Object { $_.LanguageTag }) } catch { $warnings.Add('Preferred language list could not be read.') }
$hostClass = 'unknown'
if ($cpuArchitecture -contains 12) { $hostClass = 'Windows ARM64; successful x64 app execution would be x64 emulation, not native x64 hardware' }
elseif ($cpuArchitecture -contains 9) { $hostClass = 'Windows x64 architecture; physical versus virtual hardware still requires operator confirmation' }
$nativeAvailable = $false
try {
    if (-not ('W2.Native' -as [type])) {
        Add-Type -TypeDefinition @'
using System;
using System.Runtime.InteropServices;
namespace W2 {
  public static class Native {
    [DllImport("user32.dll")] public static extern uint GetDpiForWindow(IntPtr hwnd);
    [DllImport("user32.dll")] public static extern IntPtr GetWindowDpiAwarenessContext(IntPtr hwnd);
    [DllImport("user32.dll")] public static extern int GetAwarenessFromDpiAwarenessContext(IntPtr context);
  }
}
'@
    }
    $nativeAvailable = $true
} catch { $warnings.Add('Read-only DPI helper unavailable. Do not change execution/security policy; record display scale manually.') }
$windows = @()
foreach ($process in @(Get-Process -Name 'Discourse Analysis' -ErrorAction SilentlyContinue)) {
    if ($process.MainWindowHandle -eq [IntPtr]::Zero) { continue }
    $dpi = $null; $awareness = $null; $binaryPath = $null
    if ($nativeAvailable) {
        try {
            $dpi = [W2.Native]::GetDpiForWindow($process.MainWindowHandle)
            $awareness = [W2.Native]::GetAwarenessFromDpiAwarenessContext([W2.Native]::GetWindowDpiAwarenessContext($process.MainWindowHandle))
        } catch { $warnings.Add('Window DPI query failed; use Settings and screenshots as evidence.') }
    }
    try { $binaryPath = Redact-Path $process.Path } catch { $warnings.Add('Running application path could not be read.') }
    $windows += [ordered]@{ ObservedMainWindow = $true; ExecutablePathRedacted = $binaryPath; EffectiveWindowDpi = $dpi; DpiAwareness = $awareness; Responding = $process.Responding }
}
$storage = @()
foreach ($name in @('Discourse Analysis','discourse-analysis')) {
    $candidate = Join-Path $env:APPDATA $name
    if (Test-Path -LiteralPath $candidate -PathType Container) {
        $storage += [ordered]@{ PathRedacted = (Redact-Path $candidate); Exists = $true; LocalStorageDirectoryExists = (Test-Path -LiteralPath (Join-Path $candidate 'Local Storage') -PathType Container); ConfirmedByAppGetPath = $false }
    }
}
$version = [Diagnostics.FileVersionInfo]::GetVersionInfo($exe)
$result = [ordered]@{
    CollectedAt = (Get-Date).ToString('o'); CollectorVersion = '1'; Status = 'metadata_only_not_a_test_pass'
    Exe = [ordered]@{ ExpectedSHA256 = $expected; ActualSHA256 = $actual; Bytes = (Get-Item -LiteralPath $exe).Length; FileVersionResource = $version.FileVersion; ProductVersionResource = $version.ProductVersion; AppGetVersion = $null }
    Windows = $os; ProcessorArchitectureCodes = $cpuArchitecture; HostClassification = $hostClass
    Is64BitOperatingSystem = [Environment]::Is64BitOperatingSystem; PowerShellVersion = $PSVersionTable.PSVersion.ToString(); PreferredLanguages = $languages
    OperatorReportedDisplayScale = $OperatorDisplayScale; OperatorReportedWindowCondition = $WindowCondition
    ObservedApplicationWindows = $windows; UserDataCandidates = $storage; UserDataConfirmedByAppGetPath = $null
    WindowsRuntimePass = $false; WindowsArmX64EmulationPass = $false; NativeX64HardwarePass = $false
    Note = 'A visible process and version resources do not prove the application workflow, IME, DPI layout, app.getVersion, app.getPath, or native x64 hardware. Complete the manual checklist.'
    Warnings = @($warnings.ToArray())
}
if (-not (Test-Path -LiteralPath $EvidenceRoot)) { New-Item -ItemType Directory -Path $EvidenceRoot | Out-Null }
$file = Join-Path $EvidenceRoot ('metadata-' + (Get-Date -Format 'yyyyMMdd-HHmmss-fff') + '.json')
$result | ConvertTo-Json -Depth 12 | Set-Content -LiteralPath $file -Encoding UTF8
Write-Host ('Metadata written to: ' + (Redact-Path $file))
Write-Host 'No runtime tests were automatically marked as passed. Review output before sharing.'
