# Set global error handling preference
$ErrorActionPreference = "Stop"

# Define paths
$backendPath = "backend"
$frontendPath = "front-end"
$backendTargetPath = "$backendPath\target"
$backendDLLPath = "$backendPath\src\main\java\com\mcmasterbaja\binary_csv"
$frontendBackendPath = "$frontendPath\backend"

try {
    # Create backend folder in front-end
    Write-Output "Setting up backend folder in frontend..."
    if (!(Test-Path -Path $frontendBackendPath)) {
        New-Item -ItemType Directory -Path $frontendBackendPath | Out-Null
    }

    # Copy rust dll to backend folder
    Write-Output "Copying binary_to_csv_lib.dll..."
    Copy-Item -Path "$backendDLLPath\binary_to_csv_lib.dll" -Destination $frontendBackendPath

    # Copy backend jar to backend folder
    Write-Output "Copying -runner.jar file..."
    $runnerJar = Get-ChildItem -Path $backendTargetPath -Filter "*-runner.jar" | Select-Object -First 1 # uses regex to avoid versioning issues
    if ($runnerJar) {
        Copy-Item -Path $runnerJar.FullName -Destination $frontendBackendPath
    } else {
        throw "No -runner.jar file found in $backendTargetPath."
    }

    # Copy JRE folder to the backend folder
    Write-Output("Copying JRE folder...")
    Copy-Item -Path "$backendTargetPath\jre" -Destination $frontendBackendPath -Recurse

    # Call electron builder
    Write-Output "Building Electron package..."
    Set-Location -Path $frontendPath
    npm run build:electron
    Set-Location -Path ..

    # Delete the temporary backend folder in front-end
    Write-Output "Cleaning up..."
    Remove-Item -Path $frontendBackendPath -Recurse -Force

    Write-Output "Package process completed successfully."

} catch {
    Write-Output "An error occurred: $_"
    exit 1
}