# Set global error handling preference
$ErrorActionPreference = "Stop"

# Define paths
$backendPath = "backend"
$frontendPath = "front-end"
$jrePath = "target/jre"

try {
    # Build the backend
    Write-Output "Building backend package..."
    Set-Location -Path $backendPath
    ./mvnw clean package -D quarkus.package.type=uber-jar

    # Build the JRE
    Write-Output "Building JRE..."
    # Move to the backend directory

    # Get modules
    Write-Output "Getting modules..."
    $modules = jdeps --module-path $JAVA_HOME/jmods --multi-release 21 --print-module-deps --ignore-missing-deps target/backend-1.2.0-runner.jar
    Write-Output "modules: $modules"

    # Create the JRE
    Write-Output "Creating JRE..."

    # Delete target folder if it exists
    if (Test-Path $jrePath) {
        Remove-Item -Recurse -Force $target
    }

    # Run jlink to create the JRE
    jlink --module-path $JAVA_HOME/jmods --add-modules $modules --output $jrePath
    Write-Output "JRE created successfully."

    # Return to the root directory
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