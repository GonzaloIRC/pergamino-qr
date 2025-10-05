$curBranch = (git rev-parse -abbrev-ref HEAD).Trim()
$newBranch = "fix/phases-m1-m3"

# Create new branch
git checkout -b $newBranch

# Create commit
git add -A
git commit -m "M1-M3 base: navegaciÃ³n, contextos, firebaseClient Ãºnico [desde rama $curBranch]"

# Print instructions
Write-Output "Fase aplicada en rama $newBranch"
Write-Output "Siguiente:"
Write-Output "  git push -u origin $newBranch"
Write-Output "  gh pr create -fill -base main"
