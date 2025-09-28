# Manual Realtek Driver Download Script
# Alternative methods when automatic download fails

Write-Host "=== Realtek Driver Manual Download Guide ===" -ForegroundColor Magenta

# Get system information
Write-Host "System Information:" -ForegroundColor Cyan
$osInfo = Get-WmiObject -Class Win32_OperatingSystem
$boardInfo = Get-WmiObject -Class Win32_BaseBoard
$audioInfo = Get-WmiObject -Class Win32_SoundDevice | Where-Object {$_.Name -like "*Realtek*"}

Write-Host "OS: $($osInfo.Caption) $($osInfo.Version)" -ForegroundColor White
Write-Host "Motherboard: $($boardInfo.Manufacturer) $($boardInfo.Product)" -ForegroundColor White
if ($audioInfo) {
    Write-Host "Audio Device: $($audioInfo.Name)" -ForegroundColor White
}

# Method 1: Direct download commands
Write-Host "`n=== Method 1: Direct PowerShell Download Commands ===" -ForegroundColor Yellow

$downloadCommands = @"
# Download Realtek R2.83 (Latest)
`$url = "https://github.com/alanfox2000/realtek-hda-release/releases/download/R2.83/Realtek-HDA-Driver-v6.0.9559.1.exe"
`$output = "C:\Temp\RealtekDriver\Realtek-HDA-Driver-R2.83.exe"
Invoke-WebRequest -Uri `$url -OutFile `$output -UserAgent "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"

# Download Realtek R2.82 (Alternative)
`$url2 = "https://github.com/alanfox2000/realtek-hda-release/releases/download/R2.82/Realtek-HDA-Driver-v6.0.9545.1.exe"
`$output2 = "C:\Temp\RealtekDriver\Realtek-HDA-Driver-R2.82.exe"
Invoke-WebRequest -Uri `$url2 -OutFile `$output2 -UserAgent "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
"@

Write-Host $downloadCommands -ForegroundColor Green

# Method 2: Windows Update via PowerShell
Write-Host "`n=== Method 2: Windows Update Driver Search ===" -ForegroundColor Yellow

$updateCommands = @"
# Search for Realtek drivers in Windows Update
`$session = New-Object -ComObject Microsoft.Update.Session
`$searcher = `$session.CreateUpdateSearcher()
`$searchResult = `$searcher.Search("IsInstalled=0 and Type='Driver' and DriverName like '%Realtek%'")
`$searchResult.Updates | Select-Object Title, DriverName
"@

Write-Host $updateCommands -ForegroundColor Green

# Method 3: Device Manager commands
Write-Host "`n=== Method 3: Device Manager Driver Update ===" -ForegroundColor Yellow

$deviceCommands = @"
# Open Device Manager
devmgmt.msc

# Or via PowerShell
Get-PnpDevice -Class AudioEndpoint | Where-Object {`$_.FriendlyName -like "*Realtek*"} | Update-Driver -Online
"@

Write-Host $deviceCommands -ForegroundColor Green

# Method 4: Manufacturer specific
Write-Host "`n=== Method 4: ASUS Motherboard Driver Download ===" -ForegroundColor Yellow

Write-Host "Your motherboard: ASUS B560M-P" -ForegroundColor Cyan
Write-Host "ASUS Driver Download URLs:" -ForegroundColor Green
Write-Host "1. ASUS Support: https://www.asus.com/support/download-center/" -ForegroundColor White
Write-Host "2. ASUS B560M-P: https://www.asus.com/Motherboards-Components/Motherboards/PRIME/PRIME-B560M-P/HelpDesk_Download/" -ForegroundColor White

# Method 5: Alternative download sources
Write-Host "`n=== Method 5: Alternative Download Sources ===" -ForegroundColor Yellow

$altSources = @"
# Realtek Official (requires manual verification)
https://www.realtek.com/en/component/zoo/category/pc-audio-codecs-high-definition-audio-codecs-software

# DriverPack (automated driver installation)
https://driverpack.io/

# Snappy Driver Installer (offline driver database)
https://sdi-tool.org/

# 3DP Chip (automatic driver detection)
https://www.3dpchip.com/3dpchip/index_eng.html
"@

Write-Host $altSources -ForegroundColor Green

# Installation commands
Write-Host "`n=== Installation Commands ===" -ForegroundColor Yellow

$installCommands = @"
# Install downloaded driver (replace with actual path)
Start-Process -FilePath "C:\Temp\RealtekDriver\Realtek-HDA-Driver-R2.83.exe" -ArgumentList "/S" -Verb RunAs

# Silent installation with progress
Start-Process -FilePath "C:\Temp\RealtekDriver\Realtek-HDA-Driver-R2.83.exe" -ArgumentList "/S /V`"/qn`"" -Wait -Verb RunAs

# Uninstall old driver first (optional)
pnputil /delete-driver oem*.inf /uninstall /force
"@

Write-Host $installCommands -ForegroundColor Green

# Verification commands
Write-Host "`n=== Verification Commands ===" -ForegroundColor Yellow

$verifyCommands = @"
# Check installed audio devices
Get-WmiObject -Class Win32_SoundDevice | Select-Object Name, Manufacturer, Status

# Check Realtek driver version
Get-WmiObject -Class Win32_PnPSignedDriver | Where-Object {`$_.DeviceName -like "*Realtek*"} | Select-Object DeviceName, DriverVersion, DriverDate

# Test audio functionality
# Open Sound settings
start ms-settings:sound
"@

Write-Host $verifyCommands -ForegroundColor Green

Write-Host "`n=== Quick Download and Install ===" -ForegroundColor Magenta
Write-Host "Run this single command to download and install:" -ForegroundColor Cyan
Write-Host 'powershell -Command "`$url=`"https://github.com/alanfox2000/realtek-hda-release/releases/download/R2.83/Realtek-HDA-Driver-v6.0.9559.1.exe`"; `$out=`"C:\Temp\RealtekDriver\RealtekDriver.exe`"; Invoke-WebRequest -Uri `$url -OutFile `$out; Start-Process `$out -ArgumentList `/S -Verb RunAs"' -ForegroundColor White

Write-Host "`n=== Script completed ===" -ForegroundColor Magenta
