# Realtek音频驱动PowerShell下载脚本
# 适用于Windows 10/11系统

param(
    [string]$DownloadPath = "C:\Temp\RealtekDriver",
    [switch]$AutoInstall = $false
)

# 创建下载目录
if (!(Test-Path $DownloadPath)) {
    New-Item -ItemType Directory -Path $DownloadPath -Force
    Write-Host "创建下载目录: $DownloadPath" -ForegroundColor Green
}

# 方法1: 尝试从官方源下载最新驱动
function Download-RealtekDriver-Official {
    Write-Host "尝试从Realtek官方源下载驱动..." -ForegroundColor Yellow
    
    # Realtek官方下载页面（需要处理验证码）
    $officialUrl = "https://www.realtek.com/en/component/zoo/category/pc-audio-codecs-high-definition-audio-codecs-software"
    
    try {
        # 下载页面内容
        $response = Invoke-WebRequest -Uri $officialUrl -UserAgent "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        Write-Host "成功访问Realtek官网页面" -ForegroundColor Green
        Write-Host "注意: 官网需要手动验证码，请手动下载最新驱动" -ForegroundColor Yellow
        Start-Process $officialUrl
        return $false
    }
    catch {
        Write-Host "无法直接访问Realtek官网: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

# 方法2: 从可信的第三方源下载
function Download-RealtekDriver-Alternative {
    Write-Host "尝试从备用源下载驱动..." -ForegroundColor Yellow
    
    # 常用的Realtek驱动版本和链接（这些链接可能会变化）
    $driverUrls = @{
        "R2.83" = "https://github.com/alanfox2000/realtek-hda-release/releases/download/R2.83/Realtek-HDA-Driver-v6.0.9559.1.exe"
        "R2.82" = "https://github.com/alanfox2000/realtek-hda-release/releases/download/R2.82/Realtek-HDA-Driver-v6.0.9545.1.exe"
    }
    
    foreach ($version in $driverUrls.Keys) {
        $url = $driverUrls[$version]
        $fileName = "Realtek-HDA-Driver-$version.exe"
        $filePath = Join-Path $DownloadPath $fileName
        
        try {
            Write-Host "尝试下载版本 $version..." -ForegroundColor Cyan
            Invoke-WebRequest -Uri $url -OutFile $filePath -UserAgent "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
            
            if (Test-Path $filePath) {
                $fileSize = (Get-Item $filePath).Length / 1MB
                Write-Host "成功下载: $fileName (大小: $([math]::Round($fileSize, 2)) MB)" -ForegroundColor Green
                return $filePath
            }
        }
        catch {
            Write-Host "下载版本 $version 失败: $($_.Exception.Message)" -ForegroundColor Red
            continue
        }
    }
    
    return $null
}

# 方法3: 通过Windows Update下载
function Download-RealtekDriver-WindowsUpdate {
    Write-Host "尝试通过Windows Update获取驱动..." -ForegroundColor Yellow
    
    try {
        # 使用Windows Update API搜索驱动
        $session = New-Object -ComObject Microsoft.Update.Session
        $searcher = $session.CreateUpdateSearcher()
        $searchResult = $searcher.Search("IsInstalled=0 and Type='Driver' and DriverName like '%Realtek%'")
        
        if ($searchResult.Updates.Count -gt 0) {
            Write-Host "找到 $($searchResult.Updates.Count) 个Realtek驱动更新" -ForegroundColor Green
            foreach ($update in $searchResult.Updates) {
                Write-Host "- $($update.Title)" -ForegroundColor Cyan
            }
            return $true
        } else {
            Write-Host "Windows Update中未找到Realtek驱动" -ForegroundColor Yellow
            return $false
        }
    }
    catch {
        Write-Host "Windows Update搜索失败: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

# 方法4: 从制造商官网下载
function Download-RealtekDriver-Manufacturer {
    Write-Host "尝试从制造商官网下载驱动..." -ForegroundColor Yellow
    
    # 获取主板制造商信息
    try {
        $manufacturer = (Get-WmiObject -Class Win32_BaseBoard).Manufacturer
        $product = (Get-WmiObject -Class Win32_BaseBoard).Product
        
        Write-Host "主板制造商: $manufacturer" -ForegroundColor Cyan
        Write-Host "主板型号: $product" -ForegroundColor Cyan
        
        # 常见的制造商下载链接
        $manufacturerUrls = @{
            "ASUS" = "https://www.asus.com/support/download-center/"
            "MSI" = "https://www.msi.com/support/download/"
            "Gigabyte" = "https://www.gigabyte.com/Support"
            "ASRock" = "https://www.asrock.com/support/index.asp"
        }
        
        if ($manufacturerUrls.ContainsKey($manufacturer)) {
            Write-Host "请访问制造商官网下载驱动: $($manufacturerUrls[$manufacturer])" -ForegroundColor Green
            Start-Process $manufacturerUrls[$manufacturer]
            return $true
        }
    }
    catch {
        Write-Host "无法获取主板信息: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    return $false
}

# 安装下载的驱动
function Install-RealtekDriver {
    param([string]$DriverPath)
    
    if (!(Test-Path $DriverPath)) {
        Write-Host "驱动文件不存在: $DriverPath" -ForegroundColor Red
        return $false
    }
    
    try {
        Write-Host "开始安装Realtek驱动..." -ForegroundColor Yellow
        Start-Process -FilePath $DriverPath -ArgumentList "/S" -Wait -Verb RunAs
        Write-Host "驱动安装完成，请重启计算机" -ForegroundColor Green
        return $true
    }
    catch {
        Write-Host "驱动安装失败: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

# 主执行流程
Write-Host "=== Realtek音频驱动PowerShell下载工具 ===" -ForegroundColor Magenta
Write-Host "下载路径: $DownloadPath" -ForegroundColor Cyan

# 检查管理员权限
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")
if (!$isAdmin) {
    Write-Host "警告: 建议以管理员身份运行此脚本以确保完整功能" -ForegroundColor Yellow
}

# 尝试不同的下载方法
$driverPath = $null

# 方法1: 备用源下载
$driverPath = Download-RealtekDriver-Alternative

if (!$driverPath) {
    # 方法2: Windows Update
    $updateResult = Download-RealtekDriver-WindowsUpdate
    
    if (!$updateResult) {
        # 方法3: 制造商官网
        $manufacturerResult = Download-RealtekDriver-Manufacturer
        
        if (!$manufacturerResult) {
            # 方法4: 官方源（需要手动操作）
            Download-RealtekDriver-Official
        }
    }
}

# 如果下载成功且指定自动安装
if ($driverPath -and $AutoInstall) {
    Install-RealtekDriver -DriverPath $driverPath
} elseif ($driverPath) {
    Write-Host "驱动已下载到: $driverPath" -ForegroundColor Green
    Write-Host "运行以下命令进行安装:" -ForegroundColor Yellow
    Write-Host "Start-Process -FilePath `"$driverPath`" -ArgumentList `/S` -Verb RunAs" -ForegroundColor White
}

Write-Host "=== 脚本执行完成 ===" -ForegroundColor Magenta
