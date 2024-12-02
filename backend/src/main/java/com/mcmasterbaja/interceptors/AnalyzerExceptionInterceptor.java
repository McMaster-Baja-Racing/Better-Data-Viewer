package com.mcmasterbaja.interceptors;

import java.io.IOException;

import com.mcmasterbaja.annotations.OnAnalyzerException;
import com.mcmasterbaja.exceptions.AnalyzerException;
import com.opencsv.exceptions.CsvException;
import com.opencsv.exceptions.CsvValidationException;

import jakarta.interceptor.AroundInvoke;
import jakarta.interceptor.Interceptor;
import jakarta.interceptor.InvocationContext;

@Interceptor
@OnAnalyzerException
public class AnalyzerExceptionInterceptor {
    @AroundInvoke
    public Object handleAnalyzerException(InvocationContext context) throws Exception {
        try {
            return context.proceed();

        } catch (IOException e) {
            // Convert IOException to an AnalyzerException
            String msg = "Analyzer operation failed due to an I/O error: " + context.getMethod().getName() +
                    " - " + e.getMessage();
            throw new AnalyzerException(msg, e); // To be caught by exception mappers

        } catch (CsvValidationException e) {
            // Convert CsvValidationException to an AnalyzerException
            String msg = "Analyzer operation failed due to a CSV validation error: " + context.getMethod().getName() +
                    " - " + e.getMessage();
            throw new AnalyzerException(msg, e); // To be caught by exception mappers

        } catch (CsvException e) {
            // Convert CsvException to an AnalyzerException
            String msg = "Analyzer operation failed due to a CSV error: " + context.getMethod().getName() +
                    " - " + e.getMessage();
            throw new AnalyzerException(msg, e); // To be caught by exception mappers

        } catch (AnalyzerException e) {
            String msg = "Analyzer operation failed during method: " + context.getMethod().getName() +
                    " - " + e.getMessage();
            throw new AnalyzerException(msg, e); // To be caught by exception mappers
        }

    }
}
