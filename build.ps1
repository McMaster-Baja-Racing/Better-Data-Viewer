# Set global error handling preference
$ErrorActionPreference = "Stop"

# Define paths
$backendPath = "backend"
$frontendPath = "front-end"

try {
    # Build the backend
    Write-Output "Building backend package..."
    Set-Location -Path $backendPath
    ./mvnw clean package -D quarkus.package.type=uber-jar
    Set-Location -Path ..

    # Build the frontend
    Write-Output "Building frontend package..."
    Set-Location -Path $frontendPath
    npm run build:frontend
    Set-Location -Path ..

    # Package the application
    Write-Output "Packaging application..."
    .\package.ps1

    Write-Output "Build process completed successfully."

} catch {
    Write-Output "An error occurred: $_"
    exit 1
}