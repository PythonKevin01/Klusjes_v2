Write-Host "Quick deployment to klusjes.casa (no cleanup)..." -ForegroundColor Green

# Build the app (already built)
Write-Host "Files already built in out/ directory"

Write-Host "Uploading files directly..." -ForegroundColor Yellow

# Upload built files directly
scp -i ~/.ssh/site_eu_key -o "StrictHostKeyChecking=no" -r out/* qhid28cbba@klusjes.casa:/home/qhid28cbba/domains/klusjes.casa/public_html/ 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "Upload complete!" -ForegroundColor Green
    Write-Host "Visit: https://klusjes.casa/" -ForegroundColor Cyan
} else {
    Write-Host "Upload failed" -ForegroundColor Red
} 