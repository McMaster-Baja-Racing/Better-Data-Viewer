$env:JAVA_HOME = 'C:\Program Files\Java\jdk-17.0.5\'
cd front-end

start powershell {npm start}
cd ../API
./mvnw spring-boot:run
cd ..