$env:JAVA_HOME = 'C:\Program Files\Java\jdk-19\'
cd front-end

start powershell {npm start}
cd ../API
./mvnw spring-boot:run
cd ..