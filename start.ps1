#If the script does not run add your java home locations to the array below
$javaHomeLocations = @('C:\Program Files\Java\jdk-21\', '')
$counter = 0
$env:JAVA_HOME = $javaHomeLocations[0]
try{
    Set-Location front-end

    Start-Process powershell {npm start}
    Set-Location ../backend
    ./mvnw quarkus:dev
    while ($counter -lt $javaHomeLocations.Length)
    {
            if ($LastExitCode -ne 0)
            {
                    "Add your Java Home locations to the array in the start.ps1 file"
                    $env:JAVA_HOME = $javaHomeLocations[$counter]
                    ./mvnw quarkus:dev
                    $counter++
            }
            else
            {
                    break
            }
    }
}
finally{
    Set-Location ..
}