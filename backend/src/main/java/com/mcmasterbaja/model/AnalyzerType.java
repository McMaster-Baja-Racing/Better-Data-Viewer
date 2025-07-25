package com.mcmasterbaja.model;

public enum AnalyzerType {
  ACCEL_CURVE,
  AVERAGE,
  CUBIC,
  DELETE_OUTLIER,
  LINEAR_MULTIPLY,
  INTERPOLATER_PRO,
  RDP_COMPRESSION,
  ROLL_AVG,
  SGOLAY,
  SPLIT,
  CONSTANT_ADDER,
  STRICT_TIMESTAMP,
  SHIFT_CURVE;

  public String toString() {
    return this.name();
  }
}
