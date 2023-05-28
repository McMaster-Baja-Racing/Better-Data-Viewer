#If the script does not run add your java home locations to the array below
$javaHomeLocations = @('C:\Program Files\Java\jdk-17.03\','C:\Program Files\Java\jdk-19\','C:\Program Files\Java\jdk-17.0.5\','C:\Program Files\Java\jdk-17.0.2\', 'C:\Program Files\Java\jdk-19')
$counter = 0
$env:JAVA_HOME = $javaHomeLocations[0]
try{
    Set-Location front-end

    Start-Process powershell {npm start}
    Set-Location ../API
    ./mvnw spring-boot:run
    while ($counter -lt $javaHomeLocations.Length)
    {
            if ($LastExitCode -ne 0)
            {
                    "Add your Java Home locations to the array in the start.ps1 file"
                    $env:JAVA_HOME = $javaHomeLocations[$counter]
                    ./mvnw spring-boot:run
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