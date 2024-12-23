package com.mcmasterbaja.analyzer;

import com.mcmasterbaja.model.AnalyzerType;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.enterprise.inject.Any;
import jakarta.enterprise.inject.Instance;
import jakarta.inject.Inject;
import java.util.EnumMap;
import java.util.Map;
import org.jboss.logging.Logger;

@ApplicationScoped
public class AnalyzerFactory {
  @Inject Logger logger;

  @Inject @Any Instance<Analyzer> analyzers;

  private Map<AnalyzerType, Analyzer> analyzerMap;

  @Inject
  public void init() {
    analyzerMap = new EnumMap<>(AnalyzerType.class);
    for (Analyzer analyzer : analyzers) {
      AnalyzerQualifier qualifier = analyzer.getClass().getAnnotation(AnalyzerQualifier.class);
      if (qualifier != null) {
        analyzerMap.put(qualifier.value(), analyzer);
      }
    }
  }

  public Analyzer getAnalyzer(AnalyzerType type) {
    Analyzer analyzer = analyzerMap.get(type);
    if (analyzer == null) {
      logger.errorf("No Analyzer found for type: %s", type);
      throw new IllegalArgumentException("No Analyzer found for type: " + type);
    }
    return analyzer;
  }
}
