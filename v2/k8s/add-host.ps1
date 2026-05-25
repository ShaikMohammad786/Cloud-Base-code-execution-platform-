# ============================================================
# Add Hosts Entry for Minikube Ingress
# ============================================================
# Adds DNS entries to C:\Windows\System32\drivers\etc\hosts
# so that <replId>.cloudcode.local and 
# <replId>.cloudcodeterminal.local resolve to 127.0.0.1.
#
# Usage (Run as Administrator):
#   .\add-host.ps1 <replId>
#   .\add-host.ps1 my-project
#
# To remove entries:
#   .\add-host.ps1 <replId> -Remove
# ============================================================

param(
    [Parameter(Mandatory=$true, Position=0)]
    [string]$ReplId,

    [switch]$Remove
)

$hostsFile = "C:\Windows\System32\drivers\etc\hosts"
$ip = "127.0.0.1"

$entry1 = "$ip  $ReplId.cloudcode.local"
$entry2 = "$ip  $ReplId.cloudcodeterminal.local"

# Check if running as Administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Host "ERROR: This script must be run as Administrator!" -ForegroundColor Red
    Write-Host "Right-click PowerShell -> 'Run as Administrator'" -ForegroundColor Yellow
    exit 1
}

$content = Get-Content $hostsFile -Raw

if ($Remove) {
    # Remove entries
    $lines = Get-Content $hostsFile | Where-Object {
        $_ -notmatch [regex]::Escape("$ReplId.cloudcode.local") -and
        $_ -notmatch [regex]::Escape("$ReplId.cloudcodeterminal.local")
    }
    Set-Content $hostsFile -Value $lines
    Write-Host "Removed hosts entries for '$ReplId'" -ForegroundColor Green
} else {
    # Add entries (skip if already present)
    $added = $false

    if ($content -notmatch [regex]::Escape("$ReplId.cloudcode.local")) {
        Add-Content $hostsFile "`n$entry1"
        Write-Host "Added: $entry1" -ForegroundColor Green
        $added = $true
    } else {
        Write-Host "Already exists: $entry1" -ForegroundColor Yellow
    }

    if ($content -notmatch [regex]::Escape("$ReplId.cloudcodeterminal.local")) {
        Add-Content $hostsFile "`n$entry2"
        Write-Host "Added: $entry2" -ForegroundColor Green
        $added = $true
    } else {
        Write-Host "Already exists: $entry2" -ForegroundColor Yellow
    }

    if ($added) {
        Write-Host "`nHosts file updated! Your replId '$ReplId' is ready." -ForegroundColor Cyan
        Write-Host "Make sure 'minikube tunnel' is running in another terminal." -ForegroundColor Gray
    }
}
