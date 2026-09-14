$ErrorActionPreference = 'Stop'
$env:ASTRO_TELEMETRY_DISABLED = '1'
$previewAddress = 'http://127.0.0.1:4174/'
$previewReady = $false
try { $previewReady = (Invoke-WebRequest -Uri $previewAddress -TimeoutSec 2).StatusCode -eq 200 } catch { }
if (-not $previewReady) {
    Push-Location -LiteralPath $PSScriptRoot
    try {
        if (-not (Test-Path -LiteralPath (Join-Path $PSScriptRoot 'dist\index.html'))) {
            & (Join-Path $PSScriptRoot 'node_modules\.bin\astro.cmd') build
            if ($LASTEXITCODE -ne 0) { throw 'Build failed.' }
        }
        & (Join-Path $PSScriptRoot 'node_modules\.bin\astro.cmd') preview --host 127.0.0.1 --port 4174
        if ($LASTEXITCODE -ne 0) { throw 'Preview failed to start.' }
    } finally { Pop-Location }
}
Start-Process $previewAddress
