package com.mcmasterbaja.interceptors;

import com.mcmasterbaja.annotations.OnAnalyzerException;
import com.mcmasterbaja.exceptions.AnalyzerException;
import com.mcmasterbaja.exceptions.HeaderException;
import com.opencsv.exceptions.CsvException;
import com.opencsv.exceptions.CsvValidationException;
import jakarta.interceptor.AroundInvoke;
import jakarta.interceptor.Interceptor;
import jakarta.interceptor.InvocationContext;
import java.io.IOException;

@Interceptor
@OnAnalyzerException
public class AnalyzerExceptionInterceptor {
  @AroundInvoke
  public Object handleAnalyzerException(InvocationContext context) throws Exception {
    try {
      return context.proceed();

    } catch (IOException e) {
      // Convert IOException to an AnalyzerException
      String msg =
          "Analyzer operation failed due to an I/O error: "
              + context.getMethod().getName()
              + " - "
              + e.getMessage();
      throw new AnalyzerException(msg, e); // To be caught by exception mappers

    } catch (CsvValidationException e) {
      // Convert CsvValidationException to an AnalyzerException
      String msg =
          "Analyzer operation failed due to a CSV validation error: "
              + context.getMethod().getName()
              + " - "
              + e.getMessage();
      throw new AnalyzerException(msg, e); // To be caught by exception mappers

    } catch (CsvException e) {
      // Convert CsvException to an AnalyzerException
      String msg =
          "Analyzer operation failed due to a CSV error: "
              + context.getMethod().getName()
              + " - "
              + e.getMessage();
      throw new AnalyzerException(msg, e); // To be caught by exception mappers

    } catch (NullPointerException e) {
      // Convert NullPointerException to a HeaderException
      String msg =
          "Analyzer operation failed due to a null pointer error: "
              + context.getMethod().getName()
              + " - "
              + e.getMessage();
      throw new HeaderException(msg, e); // To be caught by exception mappers

    } catch (AnalyzerException e) {
      String msg =
          "Analyzer operation failed during method: "
              + context.getMethod().getName()
              + " - "
              + e.getMessage();
      throw new AnalyzerException(msg, e); // To be caught by exception mappers
    }
  }
}
