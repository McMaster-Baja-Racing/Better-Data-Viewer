package com.mcmasterbaja.analyzer;

import com.mcmasterbaja.model.AnalyzerType;
import jakarta.annotation.PostConstruct;
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

  @PostConstruct
  public void init() {
    analyzerMap = new EnumMap<>(AnalyzerType.class);
    for (Analyzer analyzer : analyzers) {
      // Get the original class (not the proxy subclass caused by interceptor)
      Class<?> originalClass = getOriginalClass(analyzer.getClass());
      AnalyzerQualifier qualifier = originalClass.getAnnotation(AnalyzerQualifier.class);

      if (qualifier != null) {
        // logger.infof("Found qualifier: %s for %s", qualifier.value(), originalClass.getName());
        analyzerMap.put(qualifier.value(), analyzer);
      } else {
        logger.warnf(
            "Analyzer %s does not have an AnalyzerQualifier annotation", originalClass.getName());
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

  private Class<?> getOriginalClass(Class<?> clazz) {
    while (clazz != null && clazz.getName().contains("_Subclass")) {
      clazz = clazz.getSuperclass();
    }
    return clazz;
  }
}
