# Quick Realtek Driver Download
$url = "https://github.com/alanfox2000/realtek-hda-release/releases/download/R2.83/Realtek-HDA-Driver-v6.0.9559.1.exe"
$output = "C:\Temp\RealtekDriver\RealtekDriver.exe"

Write-Host "Downloading Realtek Driver..." -ForegroundColor Green
Write-Host "URL: $url" -ForegroundColor Cyan
Write-Host "Output: $output" -ForegroundColor Cyan

try {
    Invoke-WebRequest -Uri $url -OutFile $output -UserAgent "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
    Write-Host "Download completed successfully!" -ForegroundColor Green
    
    if (Test-Path $output) {
        $size = (Get-Item $output).Length / 1MB
        Write-Host "File size: $([math]::Round($size, 2)) MB" -ForegroundColor Yellow
        Write-Host "To install, run:" -ForegroundColor Yellow
        Write-Host "Start-Process -FilePath `"$output`" -ArgumentList `/S` -Verb RunAs" -ForegroundColor White
    }
} catch {
    Write-Host "Download failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Trying alternative URL..." -ForegroundColor Yellow
    
    # Try alternative URL
    $url2 = "https://github.com/alanfox2000/realtek-hda-release/releases/download/R2.82/Realtek-HDA-Driver-v6.0.9545.1.exe"
    $output2 = "C:\Temp\RealtekDriver\RealtekDriver-R2.82.exe"
    
    try {
        Invoke-WebRequest -Uri $url2 -OutFile $output2 -UserAgent "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        Write-Host "Alternative download completed!" -ForegroundColor Green
        Write-Host "To install, run:" -ForegroundColor Yellow
        Write-Host "Start-Process -FilePath `"$output2`" -ArgumentList `/S` -Verb RunAs" -ForegroundColor White
    } catch {
        Write-Host "Alternative download also failed: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "Please try manual download from:" -ForegroundColor Yellow
        Write-Host "https://www.asus.com/support/download-center/" -ForegroundColor White
    }
}
