# Simple Realtek Audio Driver Download Script
# For Windows 10/11

param(
    [string]$DownloadPath = "C:\Temp\RealtekDriver"
)

# Create download directory
if (!(Test-Path $DownloadPath)) {
    New-Item -ItemType Directory -Path $DownloadPath -Force
    Write-Host "Created download directory: $DownloadPath" -ForegroundColor Green
}

Write-Host "=== Realtek Audio Driver Download Tool ===" -ForegroundColor Magenta

# Method 1: Direct download from GitHub releases
function Download-FromGitHub {
    Write-Host "Trying to download from GitHub releases..." -ForegroundColor Yellow
    
    $urls = @{
        "R2.83" = "https://github.com/alanfox2000/realtek-hda-release/releases/download/R2.83/Realtek-HDA-Driver-v6.0.9559.1.exe"
        "R2.82" = "https://github.com/alanfox2000/realtek-hda-release/releases/download/R2.82/Realtek-HDA-Driver-v6.0.9545.1.exe"
    }
    
    foreach ($version in $urls.Keys) {
        $url = $urls[$version]
        $fileName = "Realtek-HDA-Driver-$version.exe"
        $filePath = Join-Path $DownloadPath $fileName
        
        try {
            Write-Host "Downloading version $version..." -ForegroundColor Cyan
            Invoke-WebRequest -Uri $url -OutFile $filePath -UserAgent "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
            
            if (Test-Path $filePath) {
                $fileSize = (Get-Item $filePath).Length / 1MB
                Write-Host "Successfully downloaded: $fileName (Size: $([math]::Round($fileSize, 2)) MB)" -ForegroundColor Green
                return $filePath
            }
        }
        catch {
            Write-Host "Failed to download version $version : $($_.Exception.Message)" -ForegroundColor Red
            continue
        }
    }
    
    return $null
}

# Method 2: Windows Update search
function Search-WindowsUpdate {
    Write-Host "Searching Windows Update for Realtek drivers..." -ForegroundColor Yellow
    
    try {
        $session = New-Object -ComObject Microsoft.Update.Session
        $searcher = $session.CreateUpdateSearcher()
        $searchResult = $searcher.Search("IsInstalled=0 and Type='Driver' and DriverName like '%Realtek%'")
        
        if ($searchResult.Updates.Count -gt 0) {
            Write-Host "Found $($searchResult.Updates.Count) Realtek driver updates:" -ForegroundColor Green
            foreach ($update in $searchResult.Updates) {
                Write-Host "- $($update.Title)" -ForegroundColor Cyan
            }
            return $true
        } else {
            Write-Host "No Realtek drivers found in Windows Update" -ForegroundColor Yellow
            return $false
        }
    }
    catch {
        Write-Host "Windows Update search failed: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

# Method 3: Manufacturer website
function Open-ManufacturerSite {
    Write-Host "Getting motherboard manufacturer information..." -ForegroundColor Yellow
    
    try {
        $manufacturer = (Get-WmiObject -Class Win32_BaseBoard).Manufacturer
        $product = (Get-WmiObject -Class Win32_BaseBoard).Product
        
        Write-Host "Motherboard Manufacturer: $manufacturer" -ForegroundColor Cyan
        Write-Host "Motherboard Model: $product" -ForegroundColor Cyan
        
        $manufacturerUrls = @{
            "ASUS" = "https://www.asus.com/support/download-center/"
            "MSI" = "https://www.msi.com/support/download/"
            "Gigabyte" = "https://www.gigabyte.com/Support"
            "ASRock" = "https://www.asrock.com/support/index.asp"
        }
        
        if ($manufacturerUrls.ContainsKey($manufacturer)) {
            Write-Host "Opening manufacturer website: $($manufacturerUrls[$manufacturer])" -ForegroundColor Green
            Start-Process $manufacturerUrls[$manufacturer]
            return $true
        } else {
            Write-Host "Unknown manufacturer: $manufacturer" -ForegroundColor Yellow
            return $false
        }
    }
    catch {
        Write-Host "Failed to get motherboard info: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

# Install driver
function Install-Driver {
    param([string]$DriverPath)
    
    if (!(Test-Path $DriverPath)) {
        Write-Host "Driver file not found: $DriverPath" -ForegroundColor Red
        return $false
    }
    
    try {
        Write-Host "Installing Realtek driver..." -ForegroundColor Yellow
        Start-Process -FilePath $DriverPath -ArgumentList "/S" -Wait -Verb RunAs
        Write-Host "Driver installation completed. Please restart your computer." -ForegroundColor Green
        return $true
    }
    catch {
        Write-Host "Driver installation failed: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

# Main execution
Write-Host "Download path: $DownloadPath" -ForegroundColor Cyan

# Check admin privileges
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")
if (!$isAdmin) {
    Write-Host "Warning: Running as administrator is recommended for full functionality" -ForegroundColor Yellow
}

# Try different download methods
$driverPath = Download-FromGitHub

if (!$driverPath) {
    $updateResult = Search-WindowsUpdate
    if (!$updateResult) {
        Open-ManufacturerSite
    }
}

if ($driverPath) {
    Write-Host "Driver downloaded to: $driverPath" -ForegroundColor Green
    Write-Host "To install the driver, run:" -ForegroundColor Yellow
    Write-Host "Start-Process -FilePath `"$driverPath`" -ArgumentList `/S` -Verb RunAs" -ForegroundColor White
}

Write-Host "=== Script execution completed ===" -ForegroundColor Magenta
