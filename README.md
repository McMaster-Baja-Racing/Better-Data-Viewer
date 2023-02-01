# Better-Data-Viewer
This is the second iteration of a telemetry viewer headed by Kai, Travis, Ariel and Gavin

## How to run
### Required tools:

NodeJS and NPM
JDK

### To setup:

1. Clone repository.
2. Inside a terminal, navigate to the folder Better-Data-Viewer\front-end, then run the command `npm i`
3. Inside a terminal, navigate to the folder Better-Data-Viewer\API, then run the command `./mvnw spring-boot:run`
4. Set `JAVA_HOME` environment variable to the JDK path
Setup complete!

### To run:

1. Inside a terminal, navigate to the folder `Better-Data-Viewer\front-end`, then run the command npm start. Do not close this terminal.
2. In another terminal, navigate to the folder `Better-Data-Viewer\API`, then run the command `./mvnw spring-boot:run`. Do not close this terminal
3. Go to `localhost:3000` to begin.

## TODO

### Front End
#### MANDATORY FEATURES:
- Shift curve working best awesome
- ~~XY graph working with automatic axis names~~
- ~~Redo create graph for specifics - Kai~~

#### MANDATORY BUG FIXES:
- ~~Offline front end~~ - ez
- ~~Slow after 1 use (data loading probably)~~
- ~~Only accept .bin and .csv files~~ - Kai
- ~~Resize graphs is going oddly, it kinda shapes itself sometimes? -- kai -- nvm this was instantly fixed -- kai~~

#### Would be cool:
- Multiple graphs at same time - travis
- Make it pretty (working on it)
- ~~Re-sizeable~~, move-able, etc (Z-index)
- Warning for intense data (too big, too slow)
- Cookies - Remember users previous setup and autoload

### Back End
#### MANDATORY FEATURES:
- ~~Connecting API, so front end can talk to back end, Should maybe conform to REST - Kai~~
- ~~Unify backend - gavin, Kai!~~
- ~~X-Y Graph~~
- Added information for shift curve -graham

#### MANDATORY BUG FIXES:
- ~~Back-end round values~~
- Mobile / Other device errors

#### Would be cool:
- ~~Live data~~
- More dynamic parameters
- ~~Single script to start it all - gavin~~

## Known errors
- ~~https://stackoverflow.com/questions/43362431/uncaught-in-promise-syntaxerror-unexpected-end-of-json-input~~
- ~~this is a whole big along with sending and receiving protocols. Im moving forward as is, since it works, but sends an error response.~~
I fixed this :) I'm so smart -- kai
- Powershell script unsigned, means script won't run unless `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass` is run in powershell first

## DRIVEDAY 2023-01-30
- ~~GAVIN Round to 2 in ddl rust~~
- GAVIN Serial connects properly without unplugging
- ~~KAI Get all the analyzers (intepolate, roll average, etc) working~~
- ~~KAI Boost performance of the highcharts graph using BOOST~~
- ~~TRAVIS Scroll through all available files instead of listing them all~~
- KAI + GAVIN + TRAVIS + SALMA Optimize the frontend to be more user friendly and pass data properly to live / saved data (Specifically for the dyno demo).o

### Post laval ready changes
All of these are not crucial, but are important for a better user experience

#### Front End
- Add more feedback, such as a loading screen, success messages, etc
- Multiple graphs at same time
- Flush the graph before re-rendering data to avoid weird line connections, or use scatter

#### Back End
- Refactor code such that all files are only saved once, and only by the storage service
- Incorporate folders into the storage service, have a folder for live data, separate for saved data, etc


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


## Kai's list of possible changes
- Backend API should have one method that can handle all file requests (any number of files, any number of analyzers)
- DataAnalyzer uses Path instead of strings
- DataAnalyzers can be called statically
- REFACTOR EVERYTHING, all backend should go through storage service, not save it on its own...

