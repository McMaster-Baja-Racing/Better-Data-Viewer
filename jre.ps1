$backend = "backend"
$target = $backend + "/target/jre"

try {
    # Get the dependencies of the backend
    Write-Output "Getting dependencies of the backend..."
    Set-Location -Path $backend

    # Get jdeps modules
    $jdepsModules = & jdeps --module-path $JAVA_HOME/jmods --multi-release 21 --print-module-deps --ignore-missing-deps target/backend-1.2.0-runner.jar

    # Get modules from pom.xml


} catch {
    Write-Output "An error occurred: $_"
    exit 1
}