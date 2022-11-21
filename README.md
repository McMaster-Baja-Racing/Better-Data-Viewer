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


## Sources
https://jar-download.com/artifacts/org.openmuc/jrxtx/1.0.1/source-code/gnu/io/SerialPort.java
https://www.thingsconnected.io/java-serial-tools/