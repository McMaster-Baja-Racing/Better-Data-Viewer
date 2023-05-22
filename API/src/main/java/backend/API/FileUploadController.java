package backend.API;

/*
 * This is the main controller for the entire backend. It handles all of the requests that come in from the front end
 * and then sends the appropriate response back. This is the only class that the front end should be interacting with.
 * There are quite a few moving parts, but each request should have
 * 		1. A unique mapping to the URL that the request is coming in on. This may include a variale such as {filename}
 * 		2. A method signature that includes the appropriate parameters (important ones are return type and input variables) for the request.
 * 			- The return type should generally be a ResponseEntity, which may contain any object that can be converted to JSON
 * 			- The input variables may be Path variables (such as ex/{filename}), Request Parameters (such as ?filename=), or Request Body (such as the file itself)
 * 		3. A method body that handles the request and returns the appropriate response.
 * 			- This may include calling other methods, but it should be self contained.
 * That's all I got for explanation, the internet and specifically the spring boot guides through their website daeldung.com are your friend.
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
import backend.API.storage.StorageService;

import backend.API.binary_csv.BinaryTOCSV;
import backend.API.live.Serial;

import backend.API.analyzer.Analyzer;

import backend.API.model.fileInformation;
import backend.API.model.fileList;

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
	// It returns an object of type fileList from the model folder
	@GetMapping("/files")
	@ResponseBody
	public ResponseEntity<fileList> listUploadedFiles() throws IOException{

		//Set these headers so that you can access from LocalHost
		HttpHeaders responseHeaders = new HttpHeaders();
		responseHeaders.add(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN, "*");
		responseHeaders.add(HttpHeaders.ACCESS_CONTROL_ALLOW_CREDENTIALS, "true");

		fileList files = new fileList();

		// Get name, headers and size of each file
		storageService.loadAll().forEach(path -> {
			try {
				long size = storageService.loadAsResource(path.getFileName().toString()).contentLength();
				String[] headers = storageService.readHeaders(path.getFileName().toString()).split(",");
				files.addFile(new fileInformation(path.getFileName().toString(), headers, size));
			} catch (IOException e) {
				e.printStackTrace();
			}
		});

		return ResponseEntity.ok().headers(responseHeaders).body(files);
	}


	@GetMapping("/deleteAllFiles")
	@ResponseBody
	public ResponseEntity<String> deleteAllFiles() {

		storageService.deleteAll();

		//Set these headers so that you can access from LocalHost
		HttpHeaders responseHeaders = new HttpHeaders();
		responseHeaders.add(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN, "*");
		responseHeaders.add(HttpHeaders.ACCESS_CONTROL_ALLOW_CREDENTIALS, "true");

		return ResponseEntity.ok().headers(responseHeaders).body("All files deleted");

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

		// Get size, headers, datetime, etc.
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
			Analyzer.createAnalyzer(analyzer[0], inputFiles, outputFiles, Arrays.copyOfRange(analyzer, 1, analyzer.length)).analyze();
		} else {
			// If no analyzer is selected, only one file is selected, copy it
			//storageService.copyFile(inputFiles[0], outputFiles[outputFiles.length - 1]);
			outputFiles[outputFiles.length - 1] = "./upload-dir/" + inputFiles[0];
		}
		// Then return the final file
		Resource file = storageService.loadAsResource(outputFiles[outputFiles.length - 1].split("/")[2]);

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

	@GetMapping("/deleteAll")
	@ResponseBody
	public ResponseEntity<String> deleteAll() {
		storageService.deleteAll();

		HttpHeaders responseHeaders = new HttpHeaders();
		//Set these headers so that you can access from LocalHost
		responseHeaders.add(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN, "*");
		responseHeaders.add(HttpHeaders.ACCESS_CONTROL_ALLOW_CREDENTIALS, "true");

		return ResponseEntity.ok().headers(responseHeaders).body("All files deleted");
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