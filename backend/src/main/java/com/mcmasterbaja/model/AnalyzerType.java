package com.mcmasterbaja.model;

public enum AnalyzerType {
  ACCEL_CURVE,
  AVERAGE,
  CUBIC,
  LINEAR_MULTIPLY,
  INTERPOLATER_PRO,
  RDP_COMPRESSION,
  ROLL_AVG,
  SGOLAY,
  SPLIT,
  CONSTANT_ADDER;

  public String toString() {
    return this.name();
  }
}
