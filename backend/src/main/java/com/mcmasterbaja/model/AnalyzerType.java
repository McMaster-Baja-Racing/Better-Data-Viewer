package com.mcmasterbaja.model;

public enum AnalyzerType {
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
  SHIFT_CURVE,
  SMOOTH_STRICT_PRIM,
  SMOOTH_STRICT_SEC;

  public String toString() {
    return this.name();
  }
}
