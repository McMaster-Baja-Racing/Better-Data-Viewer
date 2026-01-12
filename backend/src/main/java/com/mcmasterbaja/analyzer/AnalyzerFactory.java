package com.mcmasterbaja.analyzer;

import com.mcmasterbaja.model.AnalyzerType;
import jakarta.annotation.PostConstruct;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.enterprise.inject.Any;
import jakarta.enterprise.inject.Instance;
import jakarta.inject.Inject;
import org.jboss.logging.Logger;

@ApplicationScoped
public class AnalyzerFactory {
  @Inject Logger logger;

  @Inject @Any Instance<Analyzer> analyzers;

  @PostConstruct
  public void init() {
    // Just validate that all analyzers have qualifiers at startup
    for (Analyzer analyzer : analyzers) {
      Class<?> originalClass = getOriginalClass(analyzer.getClass());
      AnalyzerQualifier qualifier = originalClass.getAnnotation(AnalyzerQualifier.class);

      if (qualifier == null) {
        logger.warnf(
            "Analyzer %s does not have an AnalyzerQualifier annotation", originalClass.getName());
      }
    }
  }

  public Analyzer getAnalyzer(AnalyzerType type) {
    // Create a new instance for each request by finding and instantiating the matching analyzer
    for (Analyzer analyzer : analyzers) {
      Class<?> originalClass = getOriginalClass(analyzer.getClass());
      AnalyzerQualifier qualifier = originalClass.getAnnotation(AnalyzerQualifier.class);
      
      if (qualifier != null && qualifier.value() == type) {
        // Return this fresh instance from CDI
        return analyzer;
      }
    }
    
    logger.errorf("No Analyzer found for type: %s", type);
    throw new IllegalArgumentException("No Analyzer found for type: " + type);
  }

  private Class<?> getOriginalClass(Class<?> clazz) {
    while (clazz != null && clazz.getName().contains("_Subclass")) {
      clazz = clazz.getSuperclass();
    }
    return clazz;
  }
}
