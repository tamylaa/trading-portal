# Quick Compilation Check Script
# Fast TypeScript and ESLint validation for development

param(
    [switch]$Fix = $false,
    [switch]$Quiet = $false
)

function Write-Result { 
    param($msg, $color = "White") 
    if (!$Quiet) { Write-Host $msg -ForegroundColor $color } 
}

function Write-Status { 
    param($step, $status) 
    $color = if ($status -eq "PASS") { "Green" } elseif ($status -eq "FAIL") { "Red" } else { "Yellow" }
    Write-Result "[$status] $step" $color
}

$errors = 0

Write-Result ""
Write-Result "Quick Compilation Check" "Cyan"
Write-Result "==============================" "Gray"

# TypeScript Check
Write-Result ""
Write-Result "Checking TypeScript..." "Yellow"
$tscOutput = npx tsc --noEmit 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Status "TypeScript Compilation" "PASS"
} else {
    Write-Status "TypeScript Compilation" "FAIL"
    if (!$Quiet) {
        Write-Result $tscOutput "Red"
    }
    $errors++
}

# ESLint Check
Write-Result ""
Write-Result "Checking ESLint..." "Yellow"
$eslintOutput = npx eslint src --ext .js,.jsx,.ts,.tsx --format compact 2>&1
$eslintErrors = ($eslintOutput | Select-String "error" | Measure-Object).Count
$eslintWarnings = ($eslintOutput | Select-String "warning" | Measure-Object).Count

if ($eslintErrors -gt 0) {
    if ($Fix) {
        Write-Result "Auto-fixing ESLint errors..." "Yellow"
        npx eslint src --ext .js,.jsx,.ts,.tsx --fix
        
        # Re-check
        $eslintOutput = npx eslint src --ext .js,.jsx,.ts,.tsx --format compact 2>&1
        $eslintErrors = ($eslintOutput | Select-String "error" | Measure-Object).Count
    }
}

if ($eslintErrors -eq 0) {
    $eslintMessage = "ESLint ($eslintWarnings warnings)"
    Write-Status $eslintMessage "PASS"
} else {
    $eslintMessage = "ESLint ($eslintErrors errors)"
    Write-Status $eslintMessage "FAIL"
    if (!$Quiet) {
        Write-Result $eslintOutput "Red"
    }
    $errors++
}

# Summary
Write-Result ""
Write-Result "==============================" "Gray"
if ($errors -eq 0) {
    Write-Result "All checks passed!" "Green"
    exit 0
} else {
    $errorMessage = "$errors check(s) failed"
    Write-Result $errorMessage "Red"
    exit 1
}
