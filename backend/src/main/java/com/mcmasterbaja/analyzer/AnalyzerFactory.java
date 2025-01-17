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

    /**
   * Default output file names, inputfile_type.csv. As many output files as input files.
   * 
   * @param inputFiles Array of input file names
   * @param type Analyzer type
   * @return Array of output file names
   */
  public static String[] defaultOutputFileNames(String[] inputFiles, AnalyzerType type) {
    String[] outputFiles = new String[inputFiles.length];
    for (int i = 0; i < inputFiles.length; i++) {
      if (type == null) {
        outputFiles[i] = inputFiles[i];
      } else {
        outputFiles[i] = inputFiles[i].replace(".csv", "_" + type.toString() + ".csv");
      }
    }
    return outputFiles;
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
