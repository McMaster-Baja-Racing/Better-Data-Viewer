# Better-Data-Viewer
This is the second iteration of a telemetry viewer headed by Kai, Travis, Ariel and Gavin

## Philosphy
The construction behind this application is meant to make use of the OPEN/CLOSE principle, as well as the other SOLID design choices.

This will create a modular view, ready to have different items added on

## Approach
See `UML.drawio` for the class diagram

### Input
Serial/Wifi/Idk - TBD By Ariel Wolle... smh --hurry_up_pls

### Front-end
We chose React as the front-end for its modularity, wide=spread support and client-side rendering in order to speed up not only our server 
but interactions with the site and its different functions

### Graphing
We decided Highcharts was the way to go. Not only do they have very interactive graphing tools, but it has high compatibility with react and
a lot of support, should be easy to use.

### Storage
CSV/CSV+SQL/IDK - talk to prof

## TODO

### Front End
#### MANDATORY FEATURES:
- Shift curve working best awesome
- XY graph working with automatic axis names
- Multiple graphs at same time - travis
- Redo create graph for specifics - Kai

#### MANDATORY BUG FIXES:
- Offline front end
- Slow after 1 use (data loading probably)

#### Would be cool:
- Make it ~pretty~
- Re-sizeable, move-able, etc (Z-index)
- Live data
- Warning for intense data (too big, too slow)
- Cookies - Remember users previous setup and autoload

### Back End
#### MANDATORY FEATURES:
- ~~Connecting API, so front end can talk to back end, Should maybe conform to REST~~
- Unify backend - gavin
- X-Y Graph
- Added information for shift curve

#### MANDATORY BUG FIXES:
- Back-end round values

#### Would be cool:
- Live data
- More dynamic parameters
- Single script to start it all

## Known errors
https://stackoverflow.com/questions/43362431/uncaught-in-promise-syntaxerror-unexpected-end-of-json-input
this is a whole big along with sending and receiving protocols. Im moving forward as is, since it works, but sends an error response.


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

