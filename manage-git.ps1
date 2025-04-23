function Show-Status {
    Write-Host "`nCurrent Git Status:" -ForegroundColor Cyan
    git status
}

function Sync-Repository {
    git fetch origin main
    $behind = git rev-list HEAD..origin/main --count
    $ahead = git rev-list origin/main..HEAD --count
    
    if ($behind -gt 0) {
        Write-Host "Your branch is behind by $behind commits" -ForegroundColor Yellow
        $pull = Read-Host "Pull changes? (y/n)"
        if ($pull -eq 'y') {
            git pull origin main
        }
    }
    
    if ($ahead -gt 0) {
        Write-Host "Your branch is ahead by $ahead commits" -ForegroundColor Yellow
        $push = Read-Host "Push changes? (y/n)"
        if ($push -eq 'y') {
            git push origin main
        }
    }
}

Show-Status
Sync-Repository