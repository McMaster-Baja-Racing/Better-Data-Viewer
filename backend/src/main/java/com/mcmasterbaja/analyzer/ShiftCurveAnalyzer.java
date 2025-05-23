package com.mcmasterbaja.analyzer;

import com.mcmasterbaja.annotations.OnAnalyzerException;
import com.mcmasterbaja.model.AnalyzerParams;
import com.mcmasterbaja.model.AnalyzerType;
import jakarta.enterprise.context.Dependent;
import jakarta.inject.Inject;
import lombok.SneakyThrows;
import org.jboss.logging.Logger;

@Dependent
@AnalyzerQualifier(AnalyzerType.SHIFT_CURVE)
@OnAnalyzerException
public class ShiftCurveAnalyzer extends Analyzer {

  @Inject private Logger logger;
  @Inject private AnalyzerFactory factory;

  @Override
  @SneakyThrows
  public void analyze(AnalyzerParams params) {
    extractParams(params);
    logger.info(
        "Running composite pipeline: StrictTimestamp -> sGolay -> ProInterpolater (hardcoded)");

    // Hardcoded inputs and columns
    String file1 = params.getInputFiles()[0];
    String file2 = params.getInputFiles()[1];
    String col1 = "RPM_SEC"; // params.getInputColumns()[0];
    String col2 = "RPM_PRIM"; // params.getInputColumns()[1];

    // 1a) StrictTimestamp for file1/col1
    Analyzer strict1 = factory.getAnalyzer(AnalyzerType.STRICT_TIMESTAMP);
    AnalyzerParams sp1 = new AnalyzerParams();
    sp1.setInputFiles(new String[] {file1});
    sp1.setInputColumns(new String[] {col1});
    sp1.setType(AnalyzerType.STRICT_TIMESTAMP);
    sp1.setOptions(new String[0]);
    sp1.generateOutputFileNames(); // file1_STRICT_TIMESTAMP.csv
    strict1.analyze(sp1);
    String strictOut1 = sp1.getOutputFiles()[0];

    // 1b) StrictTimestamp for file2/col2
    Analyzer strict2 = factory.getAnalyzer(AnalyzerType.STRICT_TIMESTAMP);
    AnalyzerParams sp2 = new AnalyzerParams();
    sp2.setInputFiles(new String[] {file2});
    sp2.setInputColumns(new String[] {col2});
    sp2.setType(AnalyzerType.STRICT_TIMESTAMP);
    sp2.setOptions(new String[0]);
    sp2.generateOutputFileNames();
    strict2.analyze(sp2);
    String strictOut2 = sp2.getOutputFiles()[0];

    // 2a) Savitzky-Golay (100,3) for strictOut1
    Analyzer sGolay1 = factory.getAnalyzer(AnalyzerType.SGOLAY);
    AnalyzerParams sg1 = new AnalyzerParams();
    sg1.setInputFiles(new String[] {strictOut1, strictOut1});
    sg1.setInputColumns(new String[] {"Timestamp (ms)", col1});
    sg1.setType(AnalyzerType.SGOLAY);
    sg1.setOptions(new String[] {"100", "3"});
    sg1.generateOutputFileNames(); // strictOut1_S_GOLAY.csv
    sGolay1.analyze(sg1);
    String sgOut1 = sg1.getOutputFiles()[0];

    // 2b) Savitzky-Golay (100,3) for strictOut2
    Analyzer sGolay2 = factory.getAnalyzer(AnalyzerType.SGOLAY);
    AnalyzerParams sg2 = new AnalyzerParams();
    sg2.setInputFiles(new String[] {strictOut2, strictOut2});
    sg2.setInputColumns(new String[] {"Timestamp (ms)", col2});
    sg2.setType(AnalyzerType.SGOLAY);
    sg2.setOptions(new String[] {"100", "3"});
    sg2.generateOutputFileNames();
    sGolay2.analyze(sg2);
    String sgOut2 = sg2.getOutputFiles()[0];

    // 3) ProInterpolater on both sgOut1 and sgOut2 -> final outputs
    Analyzer pro = factory.getAnalyzer(AnalyzerType.INTERPOLATER_PRO);
    AnalyzerParams pp = new AnalyzerParams();
    pp.setInputFiles(new String[] {sgOut1, sgOut2});
    pp.setInputColumns(new String[] {col1, col2});
    pp.setType(AnalyzerType.INTERPOLATER_PRO);
    pp.setOptions(new String[0]);
    pp.setOutputFiles(params.getOutputFiles());
    pro.analyze(pp);
  }
}
