# Better-Data-Viewer
This is the second iteration of a telemetry viewer headed by Kai, Travis, Ariel and Gavin

## How to run
### Required tools:

NodeJS and NPM
JDK

### To setup:

1. Clone repository.
2. Inside a terminal, navigate to the folder Better-Data-Viewer\front-end, then run the command `npm i --force`
3. Inside a terminal, navigate to the folder Better-Data-Viewer\API, then run the command `./mvnw spring-boot:run`
4. Inside start.ps1. add your JDK path to the list of `javaHomeLocations`.
Setup complete!

### To run:

1. Ensure your Java Development Kit directory is added into the list `javaHomeLocations`
2. Run the command `./start.ps1`, and leave all terminals open.
3. Go to `localhost:3000` to begin.

## Known errors
- Powershell script unsigned, means script won't run unless `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass` is run in powershell first
  Optionally, run `Set-ExecutionPolicy unrestricted` in an administrator terminal to set it permanently


## Rust Library Build/Setup (Only necessary if making library changes)
- first have rustup installed https://www.rust-lang.org/tools/install
- complete setup and use the stable branch of rust
- in the binary-to-csv-lib folder, run `cargo build --release`
- once that is complete, copy the resulting dll file(windows) that is now in the `target/release/` folder
- paste this folder in the `Better-Data-Viewer\API\src\main\java\backend\API\binary_csv\` Folder

## TODO

### Front End
- Add more feedback, such as a loading screen, success messages, etc
- Multiple graphs at same time
- Flush the graph before re-rendering data to avoid weird line connections, or use scatter
- Warning for intense data (too big, too slow)
- Cookies - Remember users previous setup and autoload

### Back End
- Incorporate folders into the storage service, have a folder for live data, separate for saved data, etc
- GAVIN Serial connects properly without unplugging
- DataAnalyzers can be called statically
- Added information for shift curve -graham


## Sources
https://jar-download.com/artifacts/org.openmuc/jrxtx/1.0.1/source-code/gnu/io/SerialPort.java
https://www.thingsconnected.io/java-serial-tools/
https://www.papaparse.com/docs
https://medium.com/how-to-react/how-to-parse-or-read-csv-files-in-reactjs-81e8ee4870b0
https://github.com/highcharts/highcharts-react
https://dzone.com/articles/how-to-read-a-big-csv-file-with-java-8-and-stream
https://css-tricks.com/snippets/css/a-guide-to-flexbox/
pass info from child to parent - https://bobbyhadz.com/blog/react-pass-data-from-child-to-parent#:~:text=To%20pass%20data%20from%20child,the%20function%20in%20the%20Parent%20.
spring boot stuff - https://spring.io/guides/gs/uploading-files/


