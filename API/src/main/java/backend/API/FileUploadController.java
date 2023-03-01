package backend.API;

/*
 * "In a production scenario, you more likely would store the files in a temporary location, 
 * a database, or perhaps a NoSQL store (such as Mongo’s GridFS). It is best to NOT load up 
 * the file system of your application with content."
 * 
 * This is probably worth considering...   buuuutttt...  I'm not going to do that.    :D
 */

import java.io.IOException;
import java.util.Arrays;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.mvc.method.annotation.MvcUriComponentsBuilder;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import backend.API.storage.StorageFileNotFoundException;
import backend.API.storage.StorageProperties;
import backend.API.storage.StorageService;

import backend.API.binary_csv.BinaryTOCSV;
import backend.API.live.Serial;

import backend.API.analyzer.Analyzer;

@Controller
public class FileUploadController {

	private final StorageService storageService;

	@Autowired
	public FileUploadController(StorageService storageService) {
		this.storageService = storageService;
	}

	//This is the method that shows the upload form page, used for debugging
	@GetMapping("/")
	public String listUploadedFiles(Model model) throws IOException {

		model.addAttribute("files", storageService.loadAll().map(
				path -> MvcUriComponentsBuilder.fromMethodName(FileUploadController.class,
						"serveFile", path.getFileName().toString()).build().toUri().toString())
				.collect(Collectors.toList()));

		return "uploadForm";
	}

	//This is the default method that returns a single file
	@GetMapping("/files/{filename:.+}")
	@ResponseBody
	public ResponseEntity<Resource> serveFile(@PathVariable String filename) {
		// Catch the exception if the file is not found

		Resource file = storageService.loadAsResource(filename);

		HttpHeaders responseHeaders = new HttpHeaders();

    	responseHeaders.add(HttpHeaders.CONTENT_DISPOSITION,
		"attachment; filename=\"" + file.getFilename() + "\"");
		//Set these headers so that you can access from LocalHost
		responseHeaders.add(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN, "*");
		responseHeaders.add(HttpHeaders.ACCESS_CONTROL_ALLOW_CREDENTIALS, "true");

		return ResponseEntity.ok().headers(responseHeaders).body(file);
	}

	//This is the method that returns information about all the files, to be used by fetch
	@GetMapping("/files")
	@ResponseBody
	public ResponseEntity<String> listUploadedFiles() throws IOException{

		//Set these headers so that you can access from LocalHost
		HttpHeaders responseHeaders = new HttpHeaders();
		responseHeaders.add(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN, "*");
		responseHeaders.add(HttpHeaders.ACCESS_CONTROL_ALLOW_CREDENTIALS, "true");

		return ResponseEntity.ok().headers(responseHeaders).body(storageService.loadAll().map(
				path -> MvcUriComponentsBuilder.fromMethodName(FileUploadController.class,
						"serveFile", path.getFileName().toString()).build().toUri().toString().substring(28))
				.collect(Collectors.toList()).toString().substring(1).replace("]", ""));
		// I added some trims to remove the exact address of the file from the response, and the brackets
	}

	//This method returns information about a specific file, given the filename.
	//It should return the first row of the file (the header row) + [datetime, and the number of rows eventually]
	@GetMapping("/files/{filename:.+}/info")
	@ResponseBody
	public ResponseEntity<String> listFileInformation(@PathVariable String filename) throws IOException{

		//Set these headers so that you can access from LocalHost
		HttpHeaders responseHeaders = new HttpHeaders();
		responseHeaders.add(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN, "*");
		responseHeaders.add(HttpHeaders.ACCESS_CONTROL_ALLOW_CREDENTIALS, "true");

		String fileinfo = storageService.readHeaders(filename);

		return ResponseEntity.ok().headers(responseHeaders).body(fileinfo);
	}

	// This is the be all end all method that should take in any number of file names and analyzers, plus live option and return a file
	@GetMapping("/analyze")
	@ResponseBody
	public ResponseEntity<Resource> handleFileRequest(@RequestParam(value = "inputFiles", required = true) String[] inputFiles,
		@RequestParam(value = "outputFiles", required = false) String[] outputFiles,
		@RequestParam(value = "analyzer", required = false) String[] analyzer,
		@RequestParam(value = "liveOptions", required = false) String[] liveOptions) throws InterruptedException {
		
		//Catch exceptions first
		if (inputFiles == null || inputFiles.length == 0) {
			throw new IllegalArgumentException("No input files selected");
		}

		// If no output files are selected, use the input files
		if (outputFiles == null || outputFiles.length == 0) {
			outputFiles = inputFiles;
		}

		// Then check if live is true, and set the options + files accordingly
		if (liveOptions[0].equals("true")) {
			// Maybe do the serial stuff here, but definitely look in live folder for data
		}

		// Then run the selected analyzer
		if (analyzer != null && analyzer.length != 0) {
			Analyzer.createAnalyzer(analyzer[0], Arrays.copyOf(inputFiles, inputFiles.length), Arrays.copyOf(outputFiles, outputFiles.length), Arrays.copyOfRange(analyzer, 1, analyzer.length)).analyze();
		} else {
			// If no analyzer is selected, only one file is selected, copy it
			storageService.copyFile(inputFiles[0], outputFiles[0]);
		}
		// Then return the final file
		Resource file = storageService.loadAsResource(outputFiles[outputFiles.length - 1]);

		// Set these headers so that you can access from LocalHost and download the file
		HttpHeaders responseHeaders = new HttpHeaders();
		responseHeaders.add(HttpHeaders.CONTENT_DISPOSITION,
		"attachment; filename=\"" + file.getFilename() + "\"");
		responseHeaders.add(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN, "*");
		responseHeaders.add(HttpHeaders.ACCESS_CONTROL_ALLOW_CREDENTIALS, "true");

		return ResponseEntity.ok().headers(responseHeaders).body(file);
	}


	//This next method is for live data! Ideally you can feed it any of the basic filenames that the car might output
	//And this will send the csv right back! Neat, huh?
	@GetMapping("/live/{filename:.+}")
	@ResponseBody
	public ResponseEntity<Resource> serveLiveFile(@PathVariable String filename) {

		filename = "live_" + filename;

		Resource file = storageService.loadAsResource(filename);

		HttpHeaders responseHeaders = new HttpHeaders();

		responseHeaders.add(HttpHeaders.CONTENT_DISPOSITION,
		"attachment; filename=\"" + file.getFilename() + "\"");
		//Set these headers so that you can access from LocalHost
		responseHeaders.add(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN, "*");
		responseHeaders.add(HttpHeaders.ACCESS_CONTROL_ALLOW_CREDENTIALS, "true");

		return ResponseEntity.ok().headers(responseHeaders).body(file);
	}

	//This is the method that uploads the file
	@PostMapping("/")
	public String handleFileUpload(@RequestParam("file") MultipartFile file,
			RedirectAttributes redirectAttributes) {

		String filename = file.getOriginalFilename();
		if (filename.substring(filename.lastIndexOf(".") + 1).equals("bin")) {
			storageService.store(file);
			BinaryTOCSV.toCSV(storageService.load(filename).toAbsolutePath().toString(), storageService.load("").toAbsolutePath().toString() + "\\", false);
			storageService.delete(filename);
		} else {
			storageService.store(file);
		}

		redirectAttributes.addFlashAttribute("message",
				"You successfully uploaded " + file.getOriginalFilename() + "!");

		return "redirect:/";
	}

	//Upload file without redirect
	@PostMapping("/upload")
	public ResponseEntity<String> handleFileUploadAPI(@RequestParam("file") MultipartFile file) {

		//Check type of file, either CSV or bin
		String filename = file.getOriginalFilename();
		if (filename.substring(filename.lastIndexOf(".") + 1).equals("bin")) {
			storageService.store(file);
			BinaryTOCSV.toCSV(storageService.load(filename).toAbsolutePath().toString(), storageService.load("").toAbsolutePath().toString() + "\\", false);
			storageService.delete(filename);
		} else {
			storageService.store(file);
		}

		//Set these headers so that you can access from LocalHost
		HttpHeaders responseHeaders = new HttpHeaders();
		responseHeaders.add(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN, "*");
		responseHeaders.add(HttpHeaders.ACCESS_CONTROL_ALLOW_CREDENTIALS, "true");
		
		return ResponseEntity.ok().headers(responseHeaders).body(String.format("%s uploaded", file.getOriginalFilename()));
	}

	//This method lets the backend know to collect live data and from which port
	@PostMapping("/live")
	public ResponseEntity<String> handleLive(@RequestParam(name = "port", required = false) String port) {
		//Start the live data collection

		//call the readLive function in Serial.java
		if (Serial.exit == false) {
			Serial.exit = true;
		} else {
			new Thread(() -> {
				Serial.readLive();
			}).start();
		}

		//Set these headers so that you can access from LocalHost
		HttpHeaders responseHeaders = new HttpHeaders();
		responseHeaders.add(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN, "*");
		responseHeaders.add(HttpHeaders.ACCESS_CONTROL_ALLOW_CREDENTIALS, "true");

		return ResponseEntity.ok().headers(responseHeaders).body(String.format("Live data collection started on port %s", port));
	}

	@ExceptionHandler(StorageFileNotFoundException.class)
	public ResponseEntity<?> handleStorageFileNotFound(StorageFileNotFoundException exc) {
		return ResponseEntity.notFound().build();
	}

}