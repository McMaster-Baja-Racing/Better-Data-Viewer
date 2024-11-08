# Better-Data-Viewer
This is the second iteration of a telemetry viewer headed by Kai, Travis, Ariel and Gavin

## What is the Data Viewer
Welcome to The Data Viewer, a powerful and user-friendly software tool designed to help you navigate and explore data collected by the McMaster Baja DAQ team!

The Data Viewer serves as a streamlined portal, offering a seamless experience for users to interact with data effortlessly. Its primary function revolves around uploading data through a straightforward form and subsequently exploring, analyzing, and visualizing this information. Once data is uploaded, users gain access to a comprehensive set of analytical tools—referred to as "analyzers"—that enable them to apply filters and manipulate the data for deeper insights.

For McMaster Baja and its affiliates, The Data Viewer is an invaluable asset. It facilitates swift and efficient data interpretation after rigorous data collection sessions, enabling quick comprehension and actionable insights. Whether it's assessing performance metrics, scrutinizing vehicle diagnostics, or examining test runs, The Data Viewer empowers users to swiftly grasp essential patterns, trends, and anomalies within the collected data.

![Example Image of the Data Viewer](https://i.imgur.com/zzV76p0.png)

For an in-depth user guide, consult the McMaster Baja Wiki.

## How to run
### Required tools:
- NodeJS and NPM
- JDK 21+

### To setup:

1. Clone repository.
2. Inside a terminal, navigate to the folder Better-Data-Viewer\front-end, then run the command `npm i --force`
3. Inside a terminal, navigate to the folder Better-Data-Viewer\backend, then run the command `./mvnw quarkus:dev`
4. Inside start.ps1. add your JDK path to the list of `javaHomeLocations`.
Setup complete!

### To run:

1. Ensure your Java Development Kit directory is added into the list `javaHomeLocations` in the `start.ps1` file
2. Run the command `./start.ps1`, and leave all terminals open.
3. Go to `localhost:3000` to begin.

### Individual startup

For Quarkus, you can use the Quarkus CLI or Maven commands. For more information, see the readme in the `backend/` folder.
1. Ensure that java 21 is being used. You can check with the `java --version` command.
2. In the `backend/` folder, run either: `quarkus dev` or `./mvnw quarkus:dev`
3. Head to `localhost:8080` to test it out!

To run the front end, simply use the react scripts
1. Ensure you have NodeJS and npm installed.
2. In the `front-end/` folder, run the `npm start` command.
3. Head to `localhost:3000` to test it out!

## Known errors
- Powershell script unsigned, means script won't run unless `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass` is run in powershell first
  Optionally, run `Set-ExecutionPolicy unrestricted` in an administrator terminal to set it permanently

## Linting
- To run ESLint on the front end, simply download the ESLint extension (The ) in VSCode. You should then be able to run the `Auto-format file` command via the command palette (Ctrl + Shift + P).
- To run Java Google Format, go to the repository (https://github.com/google/google-java-format) and download the latest all-deps `.jar` file. Additionally you can find it locally in the backend folder. You can then run it via the command `java -jar /path/to/google-java-format-${GJF_VERSION?}-all-deps.jar <options> [files...]`. A common option to add is`--replace` which will automatically format it.
 - To run it easier, here's a cool command (run in `backend/` directory using bash) `find ./ -name "*.java" -type f -print | xargs java -jar google-java-format-1.22.0-all-deps.jar --replace` Just make sure to check over what it changes

## Rust Library Build/Setup (Only necessary if making library changes)
- first have rustup installed https://www.rust-lang.org/tools/install
- complete setup and use the stable branch of rust
- in the binary-to-csv-lib folder, run `cargo build --release`
- once that is complete, copy the resulting dll file(windows) that is now in the `target/release/` folder
- paste this folder in the `Better-Data-Viewer\API\src\main\java\backend\API\binary_csv\` Folder




