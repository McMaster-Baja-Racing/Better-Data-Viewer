package com.mcmasterbaja.interceptors;

import com.mcmasterbaja.annotations.OnStorageException;
import com.mcmasterbaja.exceptions.StorageException;
import jakarta.interceptor.AroundInvoke;
import jakarta.interceptor.Interceptor;
import jakarta.interceptor.InvocationContext;
import java.io.IOException;

@Interceptor
@OnStorageException
public class StorageExceptionInterceptor {

  @AroundInvoke
  public Object handleStorageException(InvocationContext context) throws Exception {
    try {
      return context.proceed();

    } catch (IOException e) {
      // Convert IOException to a StorageException
      String msg =
          "Storage operation failed due to an I/O error: "
              + context.getMethod().getName()
              + " - "
              + e.getMessage();
      throw new StorageException(msg, e); // To be caught by exception mappers

    } catch (StorageException e) {
      String msg =
          "Storage operation failed during method: "
              + context.getMethod().getName()
              + " - "
              + e.getMessage();
      throw new StorageException(msg, e); // To be caught by exception mappers
    }
  }
}
