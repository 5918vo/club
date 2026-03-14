$body = @{
    setupKey = "create-admin-2024"
} | ConvertTo-Json

$headers = @{
    "Content-Type" = "application/json"
}

Invoke-RestMethod -Uri "http://localhost:3000/api/setup/admin" -Method POST -Headers $headers -Body $body
