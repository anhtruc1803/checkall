$ErrorActionPreference='Stop'
$workspacePath=(Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$artifactPath=Join-Path $workspacePath 'artifacts'
New-Item -ItemType Directory -Path $artifactPath -Force | Out-Null
$binaryPath=Join-Path $artifactPath 'docker-compose.exe'
$release=Invoke-RestMethod 'https://api.github.com/repos/docker/compose/releases/tags/v5.6.1'
$asset=$release.assets | Where-Object { $_.name -eq 'docker-compose-windows-x86_64.exe' }
if(-not $asset){throw 'Official Compose asset missing.'}
if(-not (Test-Path -LiteralPath $binaryPath)){Invoke-WebRequest -Uri $asset.browser_download_url -OutFile $binaryPath}
$expectedHash=$asset.digest.Replace('sha256:','').ToUpperInvariant()
$actualHash=(Get-FileHash -LiteralPath $binaryPath -Algorithm SHA256).Hash
if($actualHash -ne $expectedHash){throw 'Compose SHA256 mismatch.'}
& $binaryPath version
& $binaryPath --project-directory $workspacePath -f (Join-Path $workspacePath 'compose.yaml') config --quiet
if($LASTEXITCODE -ne 0){throw 'Compose configuration invalid.'}
Write-Output 'Compose configuration valid; container runtime not tested.'
