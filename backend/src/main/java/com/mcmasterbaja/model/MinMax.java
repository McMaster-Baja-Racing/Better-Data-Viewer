package com.mcmasterbaja.model;

import lombok.Getter;
import lombok.ToString;

@ToString
@Getter
public class MinMax {
  private final Double min;
  private final Double max;

  public MinMax(Double min, Double max) {
    this.min = min;
    this.max = max;
  }
}
