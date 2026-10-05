param(
    [string]$Endpoint = "https://integrate.api.nvidia.com/v1/chat/completions",
    [string]$Model = "nvidia/cosmos3-nano-reasoner"
)

$ErrorActionPreference = "Stop"

Write-Host "Elaris Cosmos hosted smoke V0"
Write-Host "Endpoint: $Endpoint"
Write-Host "Model:    $Model"
Write-Host "Data:     SYNTHETIC / NON-SENSITIVE"
Write-Host ""

$secureKey = Read-Host "NVIDIA API key" -AsSecureString
$bstr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secureKey)

try {
    $apiKey = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($bstr)

    if ([string]::IsNullOrWhiteSpace($apiKey)) {
        throw "No NVIDIA API key provided."
    }

    $headers = @{
        Authorization = "Bearer $apiKey"
        Accept        = "application/json"
        "Content-Type" = "application/json"
    }

    $body = @{
        model = $Model
        messages = @(
            @{
                role = "system"
                content = "You analyze Physical AI scenarios. Treat all facts according to their stated evidence class. Never invent observations, probabilities, failure rates, remaining useful life, or safety certification."
            },
            @{
                role = "user"
                content = @"
SYNTHETIC TEST ONLY. No real robot or field data is included.

Scenario:
- robot class: humanoid
- component: left knee actuator
- environment: indoor industrial floor
- observed evidence: NONE
- synthetic assumption: actuator temperature rises above its nominal operating range during repetitive lifting

Return a concise analysis with exactly these sections:
PLAUSIBLE_HYPOTHESES
EVIDENCE_REQUIRED
UNSUPPORTED_CONCLUSIONS

Clearly state that the scenario is synthetic and that none of the hypotheses are observed facts.
"@
            }
        )
        max_tokens = 700
        temperature = 0.2
        stream = $false
    } | ConvertTo-Json -Depth 10

    $startedAt = (Get-Date).ToUniversalTime()
    $response = Invoke-RestMethod -Method POST -Uri $Endpoint -Headers $headers -Body $body
    $finishedAt = (Get-Date).ToUniversalTime()

    if (-not $response.choices -or -not $response.choices[0].message) {
        throw "NVIDIA returned an unexpected response shape."
    }

    $result = [ordered]@{
        smoke = "ELARIS_COSMOS_HOSTED_V0"
        success = $true
        evidence_class = "INFERRED"
        input_class = "SYNTHETIC_NON_SENSITIVE"
        endpoint = $Endpoint
        requested_model = $Model
        returned_model = $response.model
        started_at_utc = $startedAt.ToString("o")
        finished_at_utc = $finishedAt.ToString("o")
        response = $response.choices[0].message.content
    }

    $result | ConvertTo-Json -Depth 10
}
catch {
    $statusCode = $null
    if ($_.Exception.Response -and $_.Exception.Response.StatusCode) {
        try { $statusCode = [int]$_.Exception.Response.StatusCode } catch {}
    }

    $failure = [ordered]@{
        smoke = "ELARIS_COSMOS_HOSTED_V0"
        success = $false
        input_class = "SYNTHETIC_NON_SENSITIVE"
        endpoint = $Endpoint
        requested_model = $Model
        http_status = $statusCode
        error = $_.Exception.Message
    }

    $failure | ConvertTo-Json -Depth 10
    exit 1
}
finally {
    if ($bstr -ne [IntPtr]::Zero) {
        [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr)
    }
    Remove-Variable apiKey -ErrorAction SilentlyContinue
}
