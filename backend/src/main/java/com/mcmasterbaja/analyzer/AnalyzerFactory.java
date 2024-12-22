package com.mcmasterbaja.analyzer;

import com.mcmasterbaja.model.AnalyzerEnum;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.jboss.logging.Logger;

@ApplicationScoped
public class AnalyzerFactory {

  @Inject Logger logger;

  @Inject
  @AnalyzerType(AnalyzerEnum.ACCEL_CURVE)
  Analyzer accelCurveAnalyzer;

  @Inject
  @AnalyzerType(AnalyzerEnum.AVERAGE)
  Analyzer averageAnalyzer;

  @Inject
  @AnalyzerType(AnalyzerEnum.CONSTANT_ADDER)
  Analyzer constantAdderAnalyzer;

  @Inject
  @AnalyzerType(AnalyzerEnum.CUBIC)
  Analyzer cubicAnalyzer;

  @Inject
  @AnalyzerType(AnalyzerEnum.INTERPOLATER_PRO)
  Analyzer interpolaterProAnalyzer;

  @Inject
  @AnalyzerType(AnalyzerEnum.LINEAR_MULTIPLY)
  Analyzer linearMultiplyAnalyzer;

  @Inject
  @AnalyzerType(AnalyzerEnum.RDP_COMPRESSION)
  Analyzer rdpCompressionAnalyzer;

  @Inject
  @AnalyzerType(AnalyzerEnum.ROLL_AVG)
  Analyzer rollAvgAnalyzer;

  @Inject
  @AnalyzerType(AnalyzerEnum.SGOLAY)
  Analyzer sgolayAnalyzer;

  @Inject
  @AnalyzerType(AnalyzerEnum.SPLIT)
  Analyzer splitAnalyzer;

  public Analyzer createAnalyzer(AnalyzerEnum type) {
    switch (type) {
      case ACCEL_CURVE:
        return accelCurveAnalyzer;
      case AVERAGE:
        return averageAnalyzer;
      case CONSTANT_ADDER:
        return constantAdderAnalyzer;
      case CUBIC:
        return cubicAnalyzer;
      case INTERPOLATER_PRO:
        return interpolaterProAnalyzer;
      case LINEAR_MULTIPLY:
        return linearMultiplyAnalyzer;
      case RDP_COMPRESSION:
        return rdpCompressionAnalyzer;
      case ROLL_AVG:
        return rollAvgAnalyzer;
      case SGOLAY:
        return sgolayAnalyzer;
      case SPLIT:
        return splitAnalyzer;
      default:
        throw new IllegalArgumentException("Invalid analyzer type");
    }
  }
}
