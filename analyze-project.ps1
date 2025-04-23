$projectRoot = $PSScriptRoot
$report = Join-Path $projectRoot "project-analysis.md"

# Excluded directories
$excludeDirs = @(
    "node_modules",
    "build",
    "dist",
    ".git",
    ".vscode"
)

function Write-MarkdownSection {
    param(
        [string]$title,
        [string]$content
    )
    Add-Content -Path $report -Value "`n## $title`n`n$content"
}

function Analyze-Directory {
    param(
        [string]$dir,
        [int]$level = 0
    )
    
    $indent = "  " * $level
    $structure = ""
    $items = Get-ChildItem -Path $dir | Where-Object {
        $exclude = $false
        foreach ($excludeDir in $excludeDirs) {
            if ($_.FullName -like "*$excludeDir*") {
                $exclude = $true
                break
            }
        }
        -not $exclude
    }
    
    foreach ($item in $items) {
        $structure += "$indent- $($item.Name)`n"
        if ($item.PSIsContainer) {
            $structure += Analyze-Directory -dir $item.FullName -level ($level + 1)
        }
    }
    
    return $structure
}

# Create report
Set-Content -Path $report -Value "# Project Analysis Report`n"

# Analyze each project
@("trading-portal", "trading-portal-frontend", "trading-portal-api") | ForEach-Object {
    $projectPath = Join-Path $projectRoot $_
    if (Test-Path $projectPath) {
        Write-MarkdownSection -title $_ -content (Analyze-Directory -dir $projectPath)
    }
}

# Open report in VS Code
code $report