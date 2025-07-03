# Auto-deploy script voor Klusjes v2 – Next.js static export naar klusjes.casa

# ---------- Config ----------
$projectDir      = "."                                    # Project root (script run location)
$buildDir        = Join-Path $projectDir "out"           # Next.js export output
$apiDir          = Join-Path $projectDir "api"           # PHP API directory
$uploadsDir      = Join-Path $projectDir "public/uploads" # Uploads directory
$remoteUserHost  = "qhid28cbba@klusjes.casa"            # SSH-user@host
$remotePath      = "/home/qhid28cbba/domains/klusjes.casa/public_html"  # Doelpad op server
$sshKey          = "~/.ssh/site_eu_key"                 # Pad naar private key

# ---------- Helpers ----------
function ThrowIfFailed($message) {
  if ($LASTEXITCODE -ne 0) {
    Write-Host $message -ForegroundColor Red
    exit 1
  }
}

try {
  Write-Host "Start auto-deployment to klusjes.casa..." -ForegroundColor Green

  # ---------- Build ----------
  Write-Host "Building Next.js app..." -ForegroundColor Blue
  # In root map blijven (projectDir = .)

  # Zorg dat dependencies up-to-date zijn
  npm install
  ThrowIfFailed "NPM install failed - aborting."

  # Next.js productie-build + static export
  npm run build
  ThrowIfFailed "Next.js build failed - aborting."

  # ---------- Remote cleanup (selective) ----------
  Write-Host "Cleaning remote directory (preserving uploads)..." -ForegroundColor Yellow
  # Maak eerst een backup van de uploads directory
  ssh -i $sshKey $remoteUserHost "if [ -d $remotePath/public/uploads ]; then cp -r $remotePath/public/uploads /tmp/uploads_backup; fi"
  
  # Verwijder alles behalve de uploads
  ssh -i $sshKey $remoteUserHost "find $remotePath -mindepth 1 -maxdepth 1 ! -name 'public' -exec rm -rf {} + && find $remotePath/public -mindepth 1 -maxdepth 1 ! -name 'uploads' -exec rm -rf {} + 2>/dev/null || true"
  ThrowIfFailed "Remote cleanup failed - aborting."

  # ---------- Upload static files ----------
  Write-Host "Uploading exported static files..." -ForegroundColor Yellow
  scp -i $sshKey -r "$buildDir/*" "${remoteUserHost}:$remotePath/"
  ThrowIfFailed "SCP upload of static files failed - aborting."

  # ---------- Upload .htaccess files ----------
  Write-Host "Uploading .htaccess files..." -ForegroundColor Yellow
  # Main .htaccess
  if (Test-Path "$projectDir/public/.htaccess") {
    scp -i $sshKey "$projectDir/public/.htaccess" "${remoteUserHost}:$remotePath/"
  }

  # ---------- Upload API files ----------
  Write-Host "Uploading API files..." -ForegroundColor Yellow
  ssh -i $sshKey $remoteUserHost "mkdir -p $remotePath/api"
  scp -i $sshKey -r "$apiDir/*.php" "${remoteUserHost}:$remotePath/api/"
  ThrowIfFailed "SCP upload of API files failed - aborting."

  # ---------- Setup uploads directory ----------
  Write-Host "Setting up uploads directory..." -ForegroundColor Yellow
  ssh -i $sshKey $remoteUserHost "mkdir -p $remotePath/public/uploads"
  
  # Upload .htaccess for uploads directory if it exists
  if (Test-Path "$uploadsDir/.htaccess") {
    scp -i $sshKey "$uploadsDir/.htaccess" "${remoteUserHost}:$remotePath/public/uploads/"
  }
  
  # Restore uploads if backup exists
  ssh -i $sshKey $remoteUserHost "if [ -d /tmp/uploads_backup ]; then cp -r /tmp/uploads_backup/* $remotePath/public/uploads/ 2>/dev/null || true; rm -rf /tmp/uploads_backup; fi"

  # ---------- Permissions ----------
  Write-Host "Fixing file permissions..." -ForegroundColor Cyan
  ssh -i $sshKey $remoteUserHost @"
    find $remotePath -type d -exec chmod 755 {} + && 
    find $remotePath -type f -exec chmod 644 {} + &&
    find $remotePath -name '*.js' -exec chmod 644 {} + &&
    find $remotePath -name '*.css' -exec chmod 644 {} + &&
    find $remotePath -name '*.json' -exec chmod 644 {} + &&
    find $remotePath -name '.htaccess' -exec chmod 644 {} + &&
    chmod 755 $remotePath/api/*.php &&
    chmod 755 $remotePath/public/uploads
"@
  ThrowIfFailed "Setting permissions failed - aborting."

  Write-Host "Deployment complete!" -ForegroundColor Green
  Write-Host "Visit: https://klusjes.casa/" -ForegroundColor Cyan
  Write-Host "API endpoint: https://klusjes.casa/api/" -ForegroundColor Cyan
}
catch {
  Write-Host "❌  Deployment failed: $_" -ForegroundColor Red
  exit 1
} 