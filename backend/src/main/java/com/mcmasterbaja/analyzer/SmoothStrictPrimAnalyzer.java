package com.mcmasterbaja.analyzer;

import com.mcmasterbaja.annotations.OnAnalyzerException;
import com.mcmasterbaja.model.AnalyzerParams;
import com.mcmasterbaja.model.AnalyzerType;
import jakarta.enterprise.context.Dependent;
import jakarta.inject.Inject;
import lombok.SneakyThrows;
import org.jboss.logging.Logger;

@Dependent
@AnalyzerQualifier(AnalyzerType.SMOOTH_STRICT_PRIM)
@OnAnalyzerException
public class SmoothStrictPrimAnalyzer extends Analyzer {

  @Inject private Logger logger;
  @Inject private AnalyzerFactory factory;

  @Override
  @SneakyThrows
  public void analyze(AnalyzerParams params) {
    extractParams(params);
    logger.info("Running pipeline: StrictTimestamp -> Outlier Removal -> sGolay (PRIM RPM)");

    // Single file and column
    String file = params.getInputFiles()[0];
    String col = params.getInputColumns()[0];

    // 1) StrictTimestamp for the single file/column
    Analyzer strict = factory.getAnalyzer(AnalyzerType.STRICT_TIMESTAMP);
    AnalyzerParams sp = new AnalyzerParams();
    sp.setInputFiles(new String[] {file});
    sp.setInputColumns(new String[] {col});
    sp.setType(AnalyzerType.STRICT_TIMESTAMP);
    sp.setOptions(new String[0]);
    sp.generateOutputFileNames();
    strict.analyze(sp);
    String strictOut = sp.getOutputFiles()[0];

    // 2) Outlier removal for RPM > 20000
    Analyzer outlierRemoval = factory.getAnalyzer(AnalyzerType.DELETE_OUTLIER);
    AnalyzerParams or = new AnalyzerParams();
    or.setInputFiles(new String[] {strictOut});
    or.setInputColumns(new String[] {"Timestamp (ms)", "RPM PRIM"});
    or.setType(AnalyzerType.DELETE_OUTLIER);
    or.setOptions(
        new String[] {
          "0", // minX (minimum timestamp - keep all)
          "999999999", // maxX (maximum timestamp - keep all)
          "0", // minY (minimum RPM - keep all above 0)
          "20000" // maxY (maximum RPM - remove above 20000)
        });
    or.generateOutputFileNames();
    outlierRemoval.analyze(or);
    String outlierOut = or.getOutputFiles()[0];

    // 3) Savitzky-Golay for the outlier-removed output
    Analyzer sGolay = factory.getAnalyzer(AnalyzerType.SGOLAY);
    AnalyzerParams sg = new AnalyzerParams();
    sg.setInputFiles(new String[] {outlierOut, outlierOut});
    sg.setInputColumns(new String[] {"Timestamp (ms)", "RPM PRIM"});
    sg.setType(AnalyzerType.SGOLAY);
    sg.setOptions(new String[] {"101", "3"});
    sg.setOutputFiles(params.getOutputFiles());
    sGolay.analyze(sg);

    logger.info("Completed pipeline: StrictTimestamp -> Outlier Removal -> sGolay for PRIM RPM");
  }
}
