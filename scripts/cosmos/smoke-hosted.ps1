param(
    [string]$BaseUrl = "https://integrate.api.nvidia.com/v1",
    [string]$Model = "nvidia/cosmos3-nano-reasoner"
)

$ErrorActionPreference = "Stop"

function Get-HttpErrorBody {
    param($ErrorRecord)

    try {
        $response = $ErrorRecord.Exception.Response
        if ($null -eq $response) { return $null }

        $stream = $response.GetResponseStream()
        if ($null -eq $stream) { return $null }

        $reader = New-Object System.IO.StreamReader($stream)
        try {
            return $reader.ReadToEnd()
        }
        finally {
            $reader.Dispose()
        }
    }
    catch {
        return $null
    }
}

Write-Host "Elaris Cosmos hosted smoke V0"
Write-Host "Base URL: $BaseUrl"
Write-Host "Model:    $Model"
Write-Host "Data:     SYNTHETIC / NON-SENSITIVE"
Write-Host ""

$secureKey = Read-Host "NVIDIA Build API key" -AsSecureString
$bstr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secureKey)

try {
    $apiKey = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($bstr)

    if ([string]::IsNullOrWhiteSpace($apiKey)) {
        throw "No NVIDIA API key provided."
    }

    $headers = @{
        Authorization  = "Bearer $apiKey"
        Accept         = "application/json"
        "Content-Type" = "application/json"
    }

    # Preflight: validate hosted API access and model visibility before inference.
    Write-Host "Preflight: checking NVIDIA hosted model catalogue..."
    try {
        $catalog = Invoke-RestMethod -Method GET -Uri "$BaseUrl/models" -Headers $headers
    }
    catch {
        $statusCode = $null
        if ($_.Exception.Response -and $_.Exception.Response.StatusCode) {
            try { $statusCode = [int]$_.Exception.Response.StatusCode } catch {}
        }

        $failure = [ordered]@{
            smoke = "ELARIS_COSMOS_HOSTED_V0"
            stage = "HOSTED_API_PREFLIGHT"
            success = $false
            input_class = "SYNTHETIC_NON_SENSITIVE"
            base_url = $BaseUrl
            requested_model = $Model
            http_status = $statusCode
            error = $_.Exception.Message
            response_body = Get-HttpErrorBody $_
            hint = "Use the API key generated from the model Experience / Free Endpoint flow, not only the Deploy / NGC container key."
        }

        $failure | ConvertTo-Json -Depth 10
        exit 1
    }

    $modelIds = @()
    if ($catalog.data) {
        $modelIds = @($catalog.data | ForEach-Object { $_.id })
    }

    $modelVisible = $modelIds -contains $Model

    Write-Host ("Preflight: hosted API reachable; target model visible = {0}" -f $modelVisible)

    if (-not $modelVisible) {
        $matching = @($modelIds | Where-Object { $_ -match "cosmos" })

        $failure = [ordered]@{
            smoke = "ELARIS_COSMOS_HOSTED_V0"
            stage = "MODEL_VISIBILITY"
            success = $false
            input_class = "SYNTHETIC_NON_SENSITIVE"
            base_url = $BaseUrl
            requested_model = $Model
            target_model_visible = $false
            visible_cosmos_models = $matching
            hint = "The hosted API key is valid, but this account/key does not currently expose the requested Cosmos model."
        }

        $failure | ConvertTo-Json -Depth 10
        exit 1
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

    $endpoint = "$BaseUrl/chat/completions"
    $startedAt = (Get-Date).ToUniversalTime()

    try {
        $response = Invoke-RestMethod -Method POST -Uri $endpoint -Headers $headers -Body $body
    }
    catch {
        $statusCode = $null
        if ($_.Exception.Response -and $_.Exception.Response.StatusCode) {
            try { $statusCode = [int]$_.Exception.Response.StatusCode } catch {}
        }

        $failure = [ordered]@{
            smoke = "ELARIS_COSMOS_HOSTED_V0"
            stage = "INFERENCE"
            success = $false
            input_class = "SYNTHETIC_NON_SENSITIVE"
            endpoint = $endpoint
            requested_model = $Model
            target_model_visible = $true
            http_status = $statusCode
            error = $_.Exception.Message
            response_body = Get-HttpErrorBody $_
        }

        $failure | ConvertTo-Json -Depth 10
        exit 1
    }

    $finishedAt = (Get-Date).ToUniversalTime()

    if (-not $response.choices -or -not $response.choices[0].message) {
        throw "NVIDIA returned an unexpected response shape."
    }

    $result = [ordered]@{
        smoke = "ELARIS_COSMOS_HOSTED_V0"
        stage = "INFERENCE"
        success = $true
        evidence_class = "INFERRED"
        input_class = "SYNTHETIC_NON_SENSITIVE"
        endpoint = $endpoint
        requested_model = $Model
        returned_model = $response.model
        target_model_visible = $true
        started_at_utc = $startedAt.ToString("o")
        finished_at_utc = $finishedAt.ToString("o")
        response = $response.choices[0].message.content
    }

    $result | ConvertTo-Json -Depth 10
}
catch {
    $failure = [ordered]@{
        smoke = "ELARIS_COSMOS_HOSTED_V0"
        stage = "LOCAL_SCRIPT"
        success = $false
        input_class = "SYNTHETIC_NON_SENSITIVE"
        base_url = $BaseUrl
        requested_model = $Model
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
