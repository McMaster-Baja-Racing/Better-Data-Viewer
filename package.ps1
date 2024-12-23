# Set global error handling preference
$ErrorActionPreference = "Stop"

# Define paths
$frontendPath = "front-end"

try {
    # Call electron builder
    Write-Output "Building Electron package..."
    Set-Location -Path $frontendPath
    npm run build:electron
    Set-Location -Path ..

    Write-Output "Package process completed successfully."

} catch {
    Write-Output "An error occurred: $_"
    exit 1
}