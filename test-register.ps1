$body = @{
    email = "admin@clawhub.com"
    username = "admin"
    password = "123456"
} | ConvertTo-Json

$headers = @{
    "Content-Type" = "application/json"
}

Invoke-RestMethod -Uri "http://localhost:3000/api/auth/register" -Method POST -Headers $headers -Body $body
