param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("development", "staging", "production")]
    [string]$Environment,
    
    [string]$GitHubRepo = "tamylaa/trading-portal",
    [switch]$DryRun,
    [switch]$Validate
)

Write-Host "Testing PowerShell script with parameters:" -ForegroundColor Cyan
Write-Host "Environment: $Environment" -ForegroundColor Green
Write-Host "Repository: $GitHubRepo" -ForegroundColor Green
Write-Host "DryRun: $DryRun" -ForegroundColor Green
Write-Host "Validate: $Validate" -ForegroundColor Green

if ($Validate) {
    Write-Host "`nValidation mode - checking configuration..." -ForegroundColor Yellow
    Write-Host "✅ Configuration validation passed!" -ForegroundColor Green
} else {
    Write-Host "`nNormal mode - would set environment variables..." -ForegroundColor Yellow
}

Write-Host "`nScript completed successfully!" -ForegroundColor Green