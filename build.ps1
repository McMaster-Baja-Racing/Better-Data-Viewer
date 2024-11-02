# Set global error handling preference
$ErrorActionPreference = "Stop"

# Define paths
$backendPath = "backend"
$frontendPath = "front-end"
$backendTargetPath = "$backendPath\target"
$backendDLLPath = "$backendPath\src\main\java\com\mcmasterbaja\binary_csv"
$frontendBackendPath = "$frontendPath\backend"

try {
    # Step 1: Run the Maven package command in the backend folder
    Write-Output "Building backend package..."
    Set-Location -Path $backendPath
    ./mvnw clean package -D quarkus.package.type=uber-jar
    Set-Location -Path ..

    # Step 2: Run the frontend build command
    Write-Output "Building frontend package..."
    Set-Location -Path $frontendPath
    npm run build:frontend
    Set-Location -Path ..

    # Step 3: Create the backend folder in the frontend folder if it doesn't exist
    Write-Output "Setting up backend folder in frontend..."
    if (!(Test-Path -Path $frontendBackendPath)) {
        New-Item -ItemType Directory -Path $frontendBackendPath | Out-Null
    }

    # Step 4: Copy the DLL file to the frontend/backend folder
    Write-Output "Copying binary_to_csv_lib.dll..."
    Copy-Item -Path "$backendDLLPath\binary_to_csv_lib.dll" -Destination $frontendBackendPath

    # Step 5: Copy the -runner.jar file to the frontend/backend folder
    Write-Output "Copying -runner.jar file..."
    $runnerJar = Get-ChildItem -Path $backendTargetPath -Filter "*-runner.jar" | Select-Object -First 1
    if ($runnerJar) {
        Copy-Item -Path $runnerJar.FullName -Destination $frontendBackendPath
    } else {
        throw "No -runner.jar file found in $backendTargetPath."
    }

    # Step 6: Build the Electron app
    Write-Output "Building Electron package..."
    Set-Location -Path $frontendPath
    npm run build:electron
    Set-Location -Path ..

    # Step 7: Delete the frontend/backend folder and its contents
    Write-Output "Cleaning up..."
    Remove-Item -Path $frontendBackendPath -Recurse -Force

    Write-Output "Build and cleanup process completed successfully."

} catch {
    Write-Output "An error occurred: $_"
    exit 1
}