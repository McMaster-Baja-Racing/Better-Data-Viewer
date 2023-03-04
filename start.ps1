$env:JAVA_HOME = 'C:\Program Files\Java\jdk-17.0.2\'
cd front-end

start powershell {npm start}
cd ../API
./mvnw spring-boot:run
cd ..