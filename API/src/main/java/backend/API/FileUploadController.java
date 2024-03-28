package backend.API;

/*
 * This is the main controller for the entire backend.
 * It handles all the requests that come in from the front end
 * and then sends the appropriate response back.
 * This is the only class that the front end should be interacting with.
 * There are quite a few moving parts, but each request should have
 *      1. A unique mapping to the URL that the request is coming in on.
 *         This may include a variable such as {filename}
 *      2. A method signature that includes the appropriate parameters
 *          - The return type should generally be a ResponseEntity,
 *            which may contain any object that can be converted to JSON
 *          - The input variables may be Path variables (such as ex/{filename}),
 *            Request Parameters (such as ?filename=), or Request Body (such as the file itself)
 *      3. A method body that handles the request and returns the appropriate response.
 *          - This may include calling other methods, but it should be self-contained.
 * That's all I got for explanation, the internet and specifically
 * the spring boot guides through their website daeldung.com are your friend.
 */

import backend.API.analyzer.Analyzer;
import backend.API.binary_csv.BinaryTOCSV;
import backend.API.live.Serial;
import backend.API.model.FileInformation;
import backend.API.model.FileList;
import backend.API.storage.StorageFileNotFoundException;
import backend.API.storage.StorageService;
import jakarta.servlet.http.HttpServletRequest;
import java.io.IOException;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Arrays;
import java.util.stream.Collectors;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.HandlerMapping;
import org.springframework.web.servlet.mvc.method.annotation.MvcUriComponentsBuilder;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

/**
 * Controller class for handling file uploads.
 */
@Controller
public class FileUploadController {

  private final StorageService storageService;

  @Autowired
  public FileUploadController(StorageService storageService) {
    this.storageService = storageService;
  }

  /**
   * Handles GET requests to the root ("/") URL. It retrieves all files from the storage service,
   * creates a URI for each file using MvcUriComponentsBuilder,
   * and adds these URIs to the model under the attribute "files".
   * Finally, it returns the name of the view ("uploadForm") to be rendered.

   * @param model the Model object to be used in the view
   * @return the name of the view to be rendered
   * @throws IOException if there's an error loading files from the storage service
   */
  @GetMapping("/")
  public String listUploadedFiles(Model model) throws IOException {

    model.addAttribute(
        "files",
        storageService
            .loadAll()
            .map(
                path ->
                    MvcUriComponentsBuilder.fromMethodName(
                            FileUploadController.class, "serveFile", path.getFileName().toString())
                        .build()
                        .toUri()
                        .toString())
            .collect(Collectors.toList()));

    return "uploadForm";
  }

  // This is the method that returns information about all the files, to be used
  // by fetch
  // It returns an object of type fileList from the model folder
  @GetMapping("/files")
  @ResponseBody
  public ResponseEntity<FileList> listUploadedFiles() throws IOException {

    // Set these headers so that you can access from LocalHost
    HttpHeaders responseHeaders = new HttpHeaders();
    responseHeaders.add(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN, "*");
    responseHeaders.add(HttpHeaders.ACCESS_CONTROL_ALLOW_CREDENTIALS, "true");

    FileList files = new FileList();

    // Get name, headers and size of each file
    storageService
            .loadAll()
            .forEach(
                    path -> {
                      try {
                        // Get the path and filename of each file and print it
                        long size = storageService.loadAsResource(path.toString()).contentLength();
                        String[] headers = storageService.readHeaders(path.toString()).split(",");
                        files.addFile(
                                new FileInformation(path.toString().replace("\\", "/"),
                                        headers,
                                        size
                                ));
                      } catch (IOException e) {
                        e.printStackTrace();
                      }
                    });

    return ResponseEntity.ok().headers(responseHeaders).body(files);
  }

  // This is the default method that returns a single file
  @GetMapping("/files/**")
  @ResponseBody
  public ResponseEntity<Resource> serveFile(HttpServletRequest request) {
    // Catch the exception if the file is not found
    String path =
        (String) request.getAttribute(HandlerMapping.PATH_WITHIN_HANDLER_MAPPING_ATTRIBUTE);
    path = path.substring("/files/".length());
    path = URLDecoder.decode(path, StandardCharsets.UTF_8);

    System.out.println("Serving file " + path);

    Resource file = storageService.loadAsResource(path);

    HttpHeaders responseHeaders = new HttpHeaders();

    responseHeaders.add(
        HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + file.getFilename() + "\"");
    // Set these headers so that you can access from LocalHost
    responseHeaders.add(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN, "*");
    responseHeaders.add(HttpHeaders.ACCESS_CONTROL_ALLOW_CREDENTIALS, "true");

    return ResponseEntity.ok().headers(responseHeaders).body(file);
  }

  // This method returns information about a specific file, given the filename.
  // It should return the first row of the file (the header row) + [datetime, and the number of rows
  // eventually]
  // Can be deleted?
  @GetMapping("/files/{filename:.+}/info")
  @ResponseBody
  public ResponseEntity<String> listFileInformation(@PathVariable String filename)
      throws IOException {

    // Set these headers so that you can access from LocalHost
    HttpHeaders responseHeaders = new HttpHeaders();
    responseHeaders.add(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN, "*");
    responseHeaders.add(HttpHeaders.ACCESS_CONTROL_ALLOW_CREDENTIALS, "true");

    // Get size, headers, datetime, etc.
    String fileinfo = storageService.readHeaders(filename);

    return ResponseEntity.ok().headers(responseHeaders).body(fileinfo);
  }

  // This is the be all end all method that should take in any number of file
  // names and analyzers, plus live option and return a file
  @GetMapping("/analyze")
  @ResponseBody
  public ResponseEntity<Resource> handleFileRequest(
      @RequestParam(value = "inputFiles", required = true) String[] inputFiles,
      @RequestParam(value = "inputColumns", required = true) String[] inputColumns,
      @RequestParam(value = "outputFiles", required = false) String[] outputFiles,
      @RequestParam(value = "analyzer", required = false) String[] analyzer,
      @RequestParam(value = "liveOptions", required = false) String[] liveOptions)
      throws InterruptedException {

    // Catch exceptions first
    if (inputFiles == null || inputFiles.length == 0) {
      throw new IllegalArgumentException("No input files selected");
    }

    // If no output files are selected, give it a single
    if (outputFiles == null || outputFiles.length == 0) {
      // Set output files to empty string
      outputFiles = new String[10];
    }

    // Then check if live is true, and set the options + files accordingly
    if (liveOptions[0].equals("true")) {
      // Maybe do the serial stuff here, but definitely look in live folder for data
    }

    // Then run the selected analyzer
    if (analyzer != null && analyzer.length != 0 && analyzer[0] != null) {
      try {
        Analyzer.createAnalyzer(
                analyzer[0],
                inputFiles,
                inputColumns,
                outputFiles,
                Arrays.copyOfRange(analyzer, 1, analyzer.length))
            .analyze();
      } catch (Exception e) {
        System.out.println(e);
      }
    } else {
      // If no analyzer is selected, only one file is selected, copy it
      // storageService.copyFile(inputFiles[0], outputFiles[outputFiles.length - 1]);
      outputFiles[outputFiles.length - 1] = "./upload-dir/" + inputFiles[0];
    }
    // Then return the final file, removing the prefix for upload dir
    final Resource file = storageService
            .loadAsResource(outputFiles[outputFiles.length - 1]
            .substring(13));

    // Set these headers so that you can access from LocalHost and download the file
    HttpHeaders responseHeaders = new HttpHeaders();
    Path absoluteFilePath = storageService.load(outputFiles[outputFiles.length - 1].substring(13));
    String relativePath = Paths.get("upload-dir").relativize(absoluteFilePath).toString();
    responseHeaders.add(
        HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + relativePath + "\"");
    responseHeaders.add(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN, "*");
    responseHeaders.add(HttpHeaders.ACCESS_CONTROL_ALLOW_CREDENTIALS, "true");
    responseHeaders.add(HttpHeaders.ACCESS_CONTROL_EXPOSE_HEADERS, "Content-Disposition");

    return ResponseEntity.ok().headers(responseHeaders).body(file);
  }

  // This next method is for live data! Ideally you can feed it any of the basic
  // filenames that the car might output
  // And this will send the csv right back! Neat, huh?
  @GetMapping("/live/{filename:.+}")
  @ResponseBody
  public ResponseEntity<Resource> serveLiveFile(@PathVariable String filename) {

    filename = "live_" + filename;

    Resource file = storageService.loadAsResource(filename);

    HttpHeaders responseHeaders = new HttpHeaders();

    responseHeaders.add(
        HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + file.getFilename() + "\"");
    // Set these headers so that you can access from LocalHost
    responseHeaders.add(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN, "*");
    responseHeaders.add(HttpHeaders.ACCESS_CONTROL_ALLOW_CREDENTIALS, "true");

    return ResponseEntity.ok().headers(responseHeaders).body(file);
  }

  @GetMapping("/deleteAll")
  @ResponseBody
  public ResponseEntity<String> deleteAll() {
    storageService.deleteAll();
    storageService.init();

    HttpHeaders responseHeaders = new HttpHeaders();
    // Set these headers so that you can access from LocalHost
    responseHeaders.add(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN, "*");
    responseHeaders.add(HttpHeaders.ACCESS_CONTROL_ALLOW_CREDENTIALS, "true");

    return ResponseEntity.ok().headers(responseHeaders).body("All files deleted");
  }

  // Method to get the maximum and minimum values of a column in a file
  @GetMapping("/files/maxmin/**")
  @ResponseBody
  public ResponseEntity<String> getMaxMin(
      HttpServletRequest request,
      @RequestParam(value = "headerName", required = true) String headerName)
      throws IOException {

    String filename =
        (String) request.getAttribute(HandlerMapping.PATH_WITHIN_HANDLER_MAPPING_ATTRIBUTE);
    filename = filename.substring("/files/maxmin/".length());
    // Decode to add spaces back in and special characters
    filename = URLDecoder.decode(filename, StandardCharsets.UTF_8);

    System.out.println("Getting max and min for " + headerName + " in " + filename);
    // Set these headers so that you can access from LocalHost
    HttpHeaders responseHeaders = new HttpHeaders();
    responseHeaders.add(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN, "*");
    responseHeaders.add(HttpHeaders.ACCESS_CONTROL_ALLOW_CREDENTIALS, "true");

    // Get size, headers, datetime, etc.
    String maxmin = storageService.getMaxMin(filename, headerName);

    return ResponseEntity.ok().headers(responseHeaders).body(maxmin);
  }

  // This is the method that uploads the file
  @PostMapping("/")
  public String handleFileUpload(
      @RequestParam("file") MultipartFile file, RedirectAttributes redirectAttributes) {

    String filename = file.getOriginalFilename();
    if (filename == null) {
      throw new IllegalArgumentException("No file selected");
    }
    if (filename.substring(filename.lastIndexOf(".") + 1).equals("bin")) {
      storageService.store(file);
      BinaryTOCSV.toCSV(
          storageService.load(filename).toAbsolutePath().toString(),
          storageService.load("").toAbsolutePath() + "\\",
          false);
      storageService.delete(filename);
    } else {
      storageService.store(file);
    }

    redirectAttributes.addFlashAttribute(
        "message", "You successfully uploaded " + file.getOriginalFilename() + "!");

    return "redirect:/";
  }

  // Upload file without redirect
  @PostMapping("/upload")
  public ResponseEntity<String> handleFileUploadApi(@RequestParam("file") MultipartFile file) {

    // Check type of file, either CSV or bin
    String filename = file.getOriginalFilename();
    if (filename == null) {
      throw new IllegalArgumentException("No file selected");
    }
    if (filename.substring(filename.lastIndexOf(".") + 1).equals("bin")) {
      storageService.store(file);
      BinaryTOCSV.toCSV(
          storageService.load(filename).toAbsolutePath().toString(),
          storageService.load("").toAbsolutePath() + "\\",
          true);
      storageService.delete(filename);
    } else {
      storageService.store(file);
    }

    // Set these headers so that you can access from LocalHost
    HttpHeaders responseHeaders = new HttpHeaders();
    responseHeaders.add(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN, "*");
    responseHeaders.add(HttpHeaders.ACCESS_CONTROL_ALLOW_CREDENTIALS, "true");

    return ResponseEntity.ok()
        .headers(responseHeaders)
        .body(String.format("%s uploaded", file.getOriginalFilename()));
  }

  // This method lets the backend know to collect live data and from which port
  @PostMapping("/live")
  public ResponseEntity<String> handleLive(
      @RequestParam(name = "port", required = false) String port) {
    // Start the live data collection

    // call the readLive function in Serial.java
    if (!Serial.exit) {
      Serial.exit = true;
    } else {
      new Thread(
              () -> {
                Serial.readLive();
              })
          .start();
    }

    // Set these headers so that you can access from LocalHost
    HttpHeaders responseHeaders = new HttpHeaders();
    responseHeaders.add(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN, "*");
    responseHeaders.add(HttpHeaders.ACCESS_CONTROL_ALLOW_CREDENTIALS, "true");

    return ResponseEntity.ok()
        .headers(responseHeaders)
        .body(String.format("Live data collection started on port %s", port));
  }

  @ExceptionHandler(StorageFileNotFoundException.class)
  public ResponseEntity<?> handleStorageFileNotFound(StorageFileNotFoundException exc) {
    return ResponseEntity.notFound().build();
  }
}
