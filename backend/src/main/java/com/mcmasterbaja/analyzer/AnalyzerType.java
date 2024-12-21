package com.mcmasterbaja.analyzer;

import static java.lang.annotation.ElementType.*;
import static java.lang.annotation.RetentionPolicy.RUNTIME;

import java.lang.annotation.Retention;
import java.lang.annotation.Target;

import com.mcmasterbaja.model.AnalyzerEnum;

import jakarta.inject.Qualifier;

@Qualifier
@Retention(RUNTIME)
@Target({ TYPE, METHOD, FIELD, PARAMETER })
public @interface AnalyzerType {
    AnalyzerEnum value();
}
