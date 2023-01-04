package backend.API;

/*
 * "In a production scenario, you more likely would store the files in a temporary location, 
 * a database, or perhaps a NoSQL store (such as Mongo’s GridFS). It is best to NOT load up 
 * the file system of your application with content."
 * 
 * This is probably worth considering...   buuuutttt...  I'm not going to do that.    :D
 */

import java.io.IOException;
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

@Controller
public class FileUploadController {

	private final StorageService storageService;

	@Autowired
	public FileUploadController(StorageService storageService) {
		this.storageService = storageService;
	}

	//This is the method that shows the upload form page
	@GetMapping("/")
	public String listUploadedFiles(Model model) throws IOException {

		model.addAttribute("files", storageService.loadAll().map(
				path -> MvcUriComponentsBuilder.fromMethodName(FileUploadController.class,
						"serveFile", path.getFileName().toString()).build().toUri().toString())
				.collect(Collectors.toList()));

		return "uploadForm";
	}

	//This is the method that returns information about all the files
	@GetMapping("/files")
	@ResponseBody
	public ResponseEntity<String> listUploadedFiles() throws IOException{

		HttpHeaders responseHeaders = new HttpHeaders();
		//allow access control origin to all
		responseHeaders.add(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN, "*");
		//allow access control allow credentials to true
		responseHeaders.add(HttpHeaders.ACCESS_CONTROL_ALLOW_CREDENTIALS, "true");

		return ResponseEntity.ok().headers(responseHeaders).body(storageService.loadAll().map(
				path -> MvcUriComponentsBuilder.fromMethodName(FileUploadController.class,
						"serveFile", path.getFileName().toString()).build().toUri().toString().substring(28))
				.collect(Collectors.toList()).toString().substring(1).replace("]", ""));

		// I added some trims to remove the exact address of the file from the response, and the brackets
	}

	//This method returns information about a specific file, given the filename.
	//It should return the first row of the file (the header row)
	@GetMapping("/files/{filename:.+}/info")
	@ResponseBody
	public ResponseEntity<String> listUploadedFile(@PathVariable String filename) throws IOException{

		HttpHeaders responseHeaders = new HttpHeaders();
		//allow access control origin to all
		responseHeaders.add(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN, "*");
		//allow access control allow credentials to true
		responseHeaders.add(HttpHeaders.ACCESS_CONTROL_ALLOW_CREDENTIALS, "true");

		String fileinfo = storageService.readHeaders(filename);

		return ResponseEntity.ok().headers(responseHeaders).body(fileinfo);
	}

	//This is the method that returns the file itself
	@GetMapping("/files/{filename:.+}")
	@ResponseBody
	public ResponseEntity<Resource> serveFile(@PathVariable String filename) {

		Resource file = storageService.loadAsResource(filename);

		HttpHeaders responseHeaders = new HttpHeaders();

    	responseHeaders.add(HttpHeaders.CONTENT_DISPOSITION,
		"attachment; filename=\"" + file.getFilename() + "\"");
		//allow access control origin to all
		responseHeaders.add(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN, "*");
		//allow access control allow credentials to true
		responseHeaders.add(HttpHeaders.ACCESS_CONTROL_ALLOW_CREDENTIALS, "true");

		return ResponseEntity.ok().headers(responseHeaders).body(file);
	}

	//This is the method that uploads the file
	@PostMapping("/")
	public String handleFileUpload(@RequestParam("file") MultipartFile file,
			RedirectAttributes redirectAttributes) {

		storageService.store(file);
		redirectAttributes.addFlashAttribute("message",
				"You successfully uploaded " + file.getOriginalFilename() + "!");

		return "redirect:/";
	}

	@ExceptionHandler(StorageFileNotFoundException.class)
	public ResponseEntity<?> handleStorageFileNotFound(StorageFileNotFoundException exc) {
		return ResponseEntity.notFound().build();
	}

}