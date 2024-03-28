package backend.API.storage;

public class StorageException extends RuntimeException {

  public StorageException(String message) {
    super(message);
    System.out.println("StorageException - " + message);
  }

  public StorageException(String message, Throwable cause) {
    super(message, cause);
    System.out.println("StorageException - " + message);
  }
}
