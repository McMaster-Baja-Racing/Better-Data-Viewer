package com.mcmasterbaja.model;

public enum AnalyzerType {
  ROLL_AVG,
  SGOLAY,
  INTERPOLATER_PRO,
  ACCEL_CURVE,
  RDP_COMPRESSION,
  SPLIT,
  LINEAR_MULTIPLY,
  AVERAGE,
  CUBIC,
  LINEAR_INTERPOLATE;

  public String toString() {
      return this.name();
  }
}