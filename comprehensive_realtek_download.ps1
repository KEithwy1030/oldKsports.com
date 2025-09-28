# Comprehensive Realtek Driver Download Script
# Multiple download methods and sources

param(
    [string]$DownloadPath = "C:\Temp\RealtekDriver"
)

# Create download directory
if (!(Test-Path $DownloadPath)) {
    New-Item -ItemType Directory -Path $DownloadPath -Force | Out-Null
    Write-Host "Created download directory: $DownloadPath" -ForegroundColor Green
}

Write-Host "=== Realtek Audio Driver Download Tool ===" -ForegroundColor Magenta
Write-Host "System: Windows 10 Pro, ASUS B560M-P Motherboard" -ForegroundColor Cyan

# Method 1: Try multiple GitHub releases
function Try-GitHubDownloads {
    Write-Host "`n=== Method 1: GitHub Releases ===" -ForegroundColor Yellow
    
    $urls = @{
        "R2.84" = "https://github.com/alanfox2000/realtek-hda-release/releases/download/R2.84/Realtek-HDA-Driver-v6.0.9564.1.exe"
        "R2.83" = "https://github.com/alanfox2000/realtek-hda-release/releases/download/R2.83/Realtek-HDA-Driver-v6.0.9559.1.exe"
        "R2.82" = "https://github.com/alanfox2000/realtek-hda-release/releases/download/R2.82/Realtek-HDA-Driver-v6.0.9545.1.exe"
        "R2.81" = "https://github.com/alanfox2000/realtek-hda-release/releases/download/R2.81/Realtek-HDA-Driver-v6.0.9535.1.exe"
    }
    
    foreach ($version in $urls.Keys) {
        $url = $urls[$version]
        $fileName = "Realtek-HDA-Driver-$version.exe"
        $filePath = Join-Path $DownloadPath $fileName
        
        Write-Host "Trying version $version..." -ForegroundColor Cyan
        
        try {
            $userAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
            Invoke-WebRequest -Uri $url -OutFile $filePath -UserAgent $userAgent -TimeoutSec 30
            
            if (Test-Path $filePath -and (Get-Item $filePath).Length -gt 1MB) {
                $size = (Get-Item $filePath).Length / 1MB
                Write-Host "✓ Successfully downloaded: $fileName ($([math]::Round($size, 2)) MB)" -ForegroundColor Green
                return $filePath
            }
        }
        catch {
            Write-Host "✗ Failed: $($_.Exception.Message)" -ForegroundColor Red
            if (Test-Path $filePath) { Remove-Item $filePath -Force }
        }
    }
    
    return $null
}

# Method 2: Windows Update
function Try-WindowsUpdate {
    Write-Host "`n=== Method 2: Windows Update ===" -ForegroundColor Yellow
    
    try {
        $session = New-Object -ComObject Microsoft.Update.Session
        $searcher = $session.CreateUpdateSearcher()
        $searchResult = $searcher.Search("IsInstalled=0 and Type='Driver' and DriverName like '%Realtek%'")
        
        if ($searchResult.Updates.Count -gt 0) {
            Write-Host "Found $($searchResult.Updates.Count) Realtek driver updates:" -ForegroundColor Green
            foreach ($update in $searchResult.Updates) {
                Write-Host "- $($update.Title)" -ForegroundColor Cyan
            }
            
            $installer = New-Object -ComObject Microsoft.Update.UpdateInstaller
            $installer.Updates = $searchResult.Updates
            $installer.Install()
            
            return $true
        } else {
            Write-Host "No Realtek drivers found in Windows Update" -ForegroundColor Yellow
        }
    }
    catch {
        Write-Host "Windows Update search failed: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    return $false
}

# Method 3: Direct driver installation via Device Manager
function Try-DeviceManagerUpdate {
    Write-Host "`n=== Method 3: Device Manager Update ===" -ForegroundColor Yellow
    
    try {
        $audioDevices = Get-PnpDevice -Class AudioEndpoint | Where-Object { $_.FriendlyName -like "*Realtek*" }
        
        if ($audioDevices) {
            Write-Host "Found Realtek audio devices:" -ForegroundColor Green
            foreach ($device in $audioDevices) {
                Write-Host "- $($device.FriendlyName)" -ForegroundColor Cyan
            }
            
            foreach ($device in $audioDevices) {
                try {
                    Write-Host "Updating driver for: $($device.FriendlyName)" -ForegroundColor Yellow
                    Update-Driver -Id $device.InstanceId -Online -Verbose
                    return $true
                }
                catch {
                    Write-Host "Failed to update device: $($_.Exception.Message)" -ForegroundColor Red
                }
            }
        } else {
            Write-Host "No Realtek audio devices found" -ForegroundColor Yellow
        }
    }
    catch {
        Write-Host "Device Manager update failed: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    return $false
}

# Method 4: ASUS specific driver
function Try-ASUSDriver {
    Write-Host "`n=== Method 4: ASUS B560M-P Specific Driver ===" -ForegroundColor Yellow
    
    # ASUS B560M-P audio driver download page
    $asusUrl = "https://www.asus.com/Motherboards-Components/Motherboards/PRIME/PRIME-B560M-P/HelpDesk_Download/"
    
    Write-Host "Opening ASUS support page..." -ForegroundColor Cyan
    Write-Host "URL: $asusUrl" -ForegroundColor White
    
    try {
        Start-Process $asusUrl
        Write-Host "Please download the audio driver manually from the ASUS page" -ForegroundColor Green
        return $true
    }
    catch {
        Write-Host "Failed to open ASUS page: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

# Method 5: Alternative download sources
function Try-AlternativeSources {
    Write-Host "`n=== Method 5: Alternative Sources ===" -ForegroundColor Yellow
    
    $alternativeUrls = @{
        "Realtek Official" = "https://www.realtek.com/en/component/zoo/category/pc-audio-codecs-high-definition-audio-codecs-software"
        "DriverPack" = "https://driverpack.io/"
        "Snappy Driver Installer" = "https://sdi-tool.org/"
    }
    
    foreach ($source in $alternativeUrls.Keys) {
        $url = $alternativeUrls[$source]
        Write-Host "Opening $source..." -ForegroundColor Cyan
        Write-Host "URL: $url" -ForegroundColor White
        
        try {
            Start-Process $url
        }
        catch {
            Write-Host "Failed to open $source" -ForegroundColor Red
        }
        
        Start-Sleep -Seconds 2
    }
    
    return $true
}

# Installation function
function Install-Driver {
    param([string]$DriverPath)
    
    if (!(Test-Path $DriverPath)) {
        Write-Host "Driver file not found: $DriverPath" -ForegroundColor Red
        return $false
    }
    
    Write-Host "`n=== Installing Driver ===" -ForegroundColor Yellow
    Write-Host "Driver: $DriverPath" -ForegroundColor Cyan
    
    try {
        # Check if running as administrator
        $isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")
        
        if ($isAdmin) {
            Write-Host "Installing with administrator privileges..." -ForegroundColor Green
            Start-Process -FilePath $DriverPath -ArgumentList "/S" -Wait
        } else {
            Write-Host "Requesting administrator privileges..." -ForegroundColor Yellow
            Start-Process -FilePath $DriverPath -ArgumentList "/S" -Wait -Verb RunAs
        }
        
        Write-Host "Driver installation completed successfully!" -ForegroundColor Green
        Write-Host "Please restart your computer to complete the installation." -ForegroundColor Yellow
        
        return $true
    }
    catch {
        Write-Host "Driver installation failed: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

# Main execution
$driverPath = $null

# Try different methods
$driverPath = Try-GitHubDownloads

if (!$driverPath) {
    $updateResult = Try-WindowsUpdate
    if (!$updateResult) {
        $deviceResult = Try-DeviceManagerUpdate
        if (!$deviceResult) {
            Try-ASUSDriver
            Try-AlternativeSources
        }
    }
}

# If we got a driver file, offer to install it
if ($driverPath) {
    Write-Host "`n=== Driver Download Successful ===" -ForegroundColor Green
    Write-Host "Driver location: $driverPath" -ForegroundColor Cyan
    
    $install = Read-Host "Do you want to install the driver now? (Y/N)"
    if ($install -eq "Y" -or $install -eq "y") {
        Install-Driver -DriverPath $driverPath
    } else {
        Write-Host "To install later, run:" -ForegroundColor Yellow
        Write-Host "Start-Process -FilePath `"$driverPath`" -ArgumentList `/S` -Verb RunAs" -ForegroundColor White
    }
} else {
    Write-Host "`n=== Manual Download Required ===" -ForegroundColor Yellow
    Write-Host "Please download the Realtek audio driver manually from one of the provided sources." -ForegroundColor Cyan
}

Write-Host "`n=== Script completed ===" -ForegroundColor Magenta
