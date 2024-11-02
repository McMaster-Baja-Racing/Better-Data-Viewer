package com.mcmasterbaja.model;

public enum AnalyzerType {
  ACCEL_CURVE,
  AVERAGE,
  CUBIC,
  LINEAR_INTERPOLATE,
  LINEAR_MULTIPLY,
  INTERPOLATER_PRO,
  RDP_COMPRESSION,
  ROLL_AVG,
  SGOLAY,
  SPLIT;

  public String toString() {
    return this.name();
  }
}
