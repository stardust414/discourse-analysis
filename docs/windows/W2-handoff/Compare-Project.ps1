# Read-only semantic comparison; no project file is rewritten.
[CmdletBinding()]
param(
    [Parameter(Mandatory=$true)][string]$Reference,
    [Parameter(Mandatory=$true)][string]$Candidate,
    [string]$ReferenceProfile,
    [string]$CandidateProfile,
    [string]$OutputFile
)
$ErrorActionPreference = 'Stop'
function Canonical($Value) {
    if ($null -eq $Value) { return 'null' }
    if ($Value -is [string] -or $Value -is [ValueType]) { return (ConvertTo-Json -InputObject $Value -Compress -Depth 100) }
    if ($Value -is [System.Collections.IDictionary]) {
        $keys = [string[]]@($Value.Keys); [Array]::Sort($keys, [StringComparer]::Ordinal)
        $pairs = @($keys | ForEach-Object { (ConvertTo-Json -InputObject $_ -Compress) + ':' + (Canonical $Value[$_]) })
        return '{' + ($pairs -join ',') + '}'
    }
    if ($Value -is [System.Collections.IEnumerable]) { return '[' + (@($Value | ForEach-Object { Canonical $_ }) -join ',') + ']' }
    $keys = [string[]]@($Value.PSObject.Properties.Name); [Array]::Sort($keys, [StringComparer]::Ordinal)
    return '{' + (@($keys | ForEach-Object { (ConvertTo-Json -InputObject $_ -Compress) + ':' + (Canonical $Value.PSObject.Properties[$_].Value) }) -join ',') + '}'
}
function Digest([string]$Text) {
    $sha = [Security.Cryptography.SHA256]::Create()
    try { return ([BitConverter]::ToString($sha.ComputeHash([Text.Encoding]::UTF8.GetBytes($Text)))).Replace('-','').ToLowerInvariant() }
    finally { $sha.Dispose() }
}
function Read-Project([string]$File) {
    $data = Get-Content -LiteralPath $File -Raw -Encoding UTF8 | ConvertFrom-Json
    if ($null -eq $data.PSObject.Properties['propositions']) { throw 'Not a project JSON file.' }
    $data.PSObject.Properties.Remove('exportedAt')
    return $data
}
$a = Read-Project $Reference; $b = Read-Project $Candidate
$ha = Digest (Canonical $a); $hb = Digest (Canonical $b)
$changed = @()
$keys = @(@($a.PSObject.Properties.Name) + @($b.PSObject.Properties.Name) | Sort-Object -Unique)
foreach ($key in $keys) {
    $left = $a.PSObject.Properties[$key]; $right = $b.PSObject.Properties[$key]
    if ($null -eq $left -or $null -eq $right -or (Canonical $left.Value) -cne (Canonical $right.Value)) { $changed += $key }
}
$profileResult = $null
if ([bool]$ReferenceProfile -ne [bool]$CandidateProfile) { throw 'Provide both profile files, or neither.' }
if ($ReferenceProfile) {
    $pa = Get-Content -LiteralPath $ReferenceProfile -Raw -Encoding UTF8 | ConvertFrom-Json
    $pb = Get-Content -LiteralPath $CandidateProfile -Raw -Encoding UTF8 | ConvertFrom-Json
    $profileResult = ((Canonical $pa) -ceq (Canonical $pb))
}
$result = [ordered]@{ ComparedAt = (Get-Date).ToString('o'); ProjectEqual = ($ha -eq $hb); ReferenceCanonicalSHA256 = $ha; CandidateCanonicalSHA256 = $hb; ChangedTopLevelFields = $changed; IgnoredRootField = 'exportedAt'; ProfileEqual = $profileResult; RuntimeVerification = 'not implied by data comparison' }
$json = $result | ConvertTo-Json -Depth 8
if ($OutputFile) { $json | Set-Content -LiteralPath $OutputFile -Encoding UTF8 }
$json
if (-not $result.ProjectEqual -or $profileResult -eq $false) { exit 2 }
