package com.mcmasterbaja.interceptors;

import com.mcmasterbaja.annotations.OnAnalyzerException;
import com.mcmasterbaja.exceptions.AnalyzerException;
import com.mcmasterbaja.exceptions.InvalidColumnException;
import com.mcmasterbaja.exceptions.InvalidHeaderException;
import com.mcmasterbaja.exceptions.InvalidInputFileException;
import com.mcmasterbaja.exceptions.InvalidOutputFileException;
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
      throw new AnalyzerException(msg, e);

    } catch (CsvValidationException e) {
      // Convert CsvValidationException to an AnalyzerException
      String msg =
          "Analyzer operation failed due to a CSV validation error: "
              + context.getMethod().getName()
              + " - "
              + e.getMessage();
      throw new AnalyzerException(msg, e);

    } catch (CsvException e) {
      // Convert CsvException to an AnalyzerException
      String msg =
          "Analyzer operation failed due to a CSV error: "
              + context.getMethod().getName()
              + " - "
              + e.getMessage();
      throw new AnalyzerException(msg, e);

    } catch (InvalidInputFileException e) {
      String msg =
          "Analyzer operation failed due to an invalid input file: "
              + context.getMethod().getName()
              + " - "
              + e.getMessage();
      throw new InvalidInputFileException(msg, e);

    } catch (InvalidOutputFileException e) {
      String msg =
          "Analyzer operation failed due to an invalid output file: "
              + context.getMethod().getName()
              + " - "
              + e.getMessage();
      throw new InvalidOutputFileException(msg, e);

    } catch (InvalidHeaderException e) {
      String msg =
          "Analyzer operation failed due to a header error: "
              + context.getMethod().getName()
              + " - "
              + e.getMessage();
      throw new InvalidHeaderException(msg, e);

    } catch (InvalidColumnException e) {
      String msg =
          "Analyzer operation failed due to an invalid column: "
              + context.getMethod().getName()
              + " - "
              + e.getMessage();
      throw new InvalidColumnException(msg, e);

    } catch (Exception e) {
      String msg =
          "Analyzer operation failed during method: "
              + context.getMethod().getName()
              + " - "
              + e.getMessage();
      throw new AnalyzerException(msg, e);
    }
  }
}
