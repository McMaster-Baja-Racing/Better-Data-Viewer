# Better-Data-Viewer
This is the second iteration of a telemetry viewer headed by Kai, Travis, Ariel and Gavin

## Philosphy
The construction behind this application is meant to make use of the OPEN/CLOSE principle, as well as the other SOLID design choices.

This will create a modular view, ready to have different items added on

## Approach
See `UML.drawio` for the class diagram

### Input
Serial/Wifi/Idk - TBD By Ariel Wolle... smh

### Front-end
We chose React as the front-end for its modularity, wide=spread support and client-side rendering in order to speed up not only our server 
but interactions with the site and its different functions

### Graphing
We decided Highcharts was the way to go. Not only do they have very interactive graphing tools, but it has high compatibility with react and
a lot of support, should be easy to use.

### Storage
CSV/CSV+SQL/IDK - talk to prof

## TODO

### Front-End
- Rizeable graphs, option to make new graph and move around seamlessly, resize, etc
- Add more graphs, types of graphs
- saveable views 


## Sources
https://jar-download.com/artifacts/org.openmuc/jrxtx/1.0.1/source-code/gnu/io/SerialPort.java
https://www.thingsconnected.io/java-serial-tools/
https://www.papaparse.com/docs
https://medium.com/how-to-react/how-to-parse-or-read-csv-files-in-reactjs-81e8ee4870b0
https://github.com/highcharts/highcharts-react
https://dzone.com/articles/how-to-read-a-big-csv-file-with-java-8-and-stream
https://css-tricks.com/snippets/css/a-guide-to-flexbox/
pass info from child to parent - https://bobbyhadz.com/blog/react-pass-data-from-child-to-parent#:~:text=To%20pass%20data%20from%20child,the%20function%20in%20the%20Parent%20.


