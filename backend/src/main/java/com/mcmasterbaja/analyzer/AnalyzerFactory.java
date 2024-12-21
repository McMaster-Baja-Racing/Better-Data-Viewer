package com.mcmasterbaja.analyzer;

import org.jboss.logging.Logger;

import com.mcmasterbaja.model.AnalyzerEnum;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

@ApplicationScoped
public class AnalyzerFactory {

  @Inject Logger logger;

  @Inject 
  @AnalyzerType(AnalyzerEnum.AVERAGE) 
  Analyzer averageAnalyzer;
  
    public Analyzer createAnalyzer(AnalyzerEnum type) {
      switch (type) {
        case AVERAGE:
          return averageAnalyzer;
      default:
        return null;
    }
  }
}
