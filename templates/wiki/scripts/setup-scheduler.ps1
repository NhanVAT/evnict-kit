# LLM Wiki - Windows Task Scheduler Setup
# Run: powershell -ExecutionPolicy Bypass -File "scripts/setup-scheduler.ps1"

$taskName = "LLM-Wiki-AutoRun"
$bashPath = "C:\Program Files\Git\bin\bash.exe"
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectDir = Split-Path -Parent $scriptDir
$scriptPath = Join-Path $scriptDir "run-wiki.sh"

# Remove old task
Unregister-ScheduledTask -TaskName $taskName -Confirm:$false -ErrorAction SilentlyContinue

# Trigger: every 2 hours, repeat for 365 days
$trigger = New-ScheduledTaskTrigger -Once -At (Get-Date) -RepetitionInterval (New-TimeSpan -Hours 2) -RepetitionDuration (New-TimeSpan -Days 365)

# Action: run bash script
$action = New-ScheduledTaskAction -Execute $bashPath -Argument $scriptPath -WorkingDirectory $projectDir

# Settings
$settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable -RunOnlyIfNetworkAvailable

# Register task
Register-ScheduledTask -TaskName $taskName -Trigger $trigger -Action $action -Settings $settings -Description "LLM Wiki auto run every 2 hours" -RunLevel Limited

Write-Host "OK - Task '$taskName' created!"
Write-Host "Project: $projectDir"
Write-Host "Check: Get-ScheduledTask -TaskName '$taskName'"
Write-Host "Run now: Start-ScheduledTask -TaskName '$taskName'"
Write-Host "Delete: Unregister-ScheduledTask -TaskName '$taskName'"
