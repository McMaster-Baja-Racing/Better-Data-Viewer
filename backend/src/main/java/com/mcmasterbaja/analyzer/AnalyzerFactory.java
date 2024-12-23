package com.mcmasterbaja.analyzer;

import com.mcmasterbaja.model.AnalyzerType;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.jboss.logging.Logger;

@ApplicationScoped
public class AnalyzerFactory {

  @Inject Logger logger;

  @Inject
  @AnalyzerTypeQualifier(AnalyzerType.ACCEL_CURVE)
  Analyzer accelCurveAnalyzer;

  @Inject
  @AnalyzerTypeQualifier(AnalyzerType.AVERAGE)
  Analyzer averageAnalyzer;

  @Inject
  @AnalyzerTypeQualifier(AnalyzerType.CONSTANT_ADDER)
  Analyzer constantAdderAnalyzer;

  @Inject
  @AnalyzerTypeQualifier(AnalyzerType.CUBIC)
  Analyzer cubicAnalyzer;

  @Inject
  @AnalyzerTypeQualifier(AnalyzerType.INTERPOLATER_PRO)
  Analyzer interpolaterProAnalyzer;

  @Inject
  @AnalyzerTypeQualifier(AnalyzerType.LINEAR_MULTIPLY)
  Analyzer linearMultiplyAnalyzer;

  @Inject
  @AnalyzerTypeQualifier(AnalyzerType.RDP_COMPRESSION)
  Analyzer rdpCompressionAnalyzer;

  @Inject
  @AnalyzerTypeQualifier(AnalyzerType.ROLL_AVG)
  Analyzer rollAvgAnalyzer;

  @Inject
  @AnalyzerTypeQualifier(AnalyzerType.SGOLAY)
  Analyzer sgolayAnalyzer;

  @Inject
  @AnalyzerTypeQualifier(AnalyzerType.SPLIT)
  Analyzer splitAnalyzer;

  public Analyzer createAnalyzer(AnalyzerType type) {
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
