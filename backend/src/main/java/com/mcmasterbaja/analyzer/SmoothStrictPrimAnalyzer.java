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

    @Inject
    private Logger logger;
    @Inject
    private AnalyzerFactory factory;

    @Override
    @SneakyThrows
    public void analyze(AnalyzerParams params) {
        extractParams(params);
        logger.info("Running pipeline: StrictTimestamp -> sGolay (single file RPM)");

        // Single file and column
        String file = params.getInputFiles()[0];
        String col = params.getInputColumns()[0];

        // 1) StrictTimestamp for the single file/column
        Analyzer strict = factory.getAnalyzer(AnalyzerType.STRICT_TIMESTAMP);
        AnalyzerParams sp = new AnalyzerParams();
        sp.setInputFiles(new String[] { file });
        sp.setInputColumns(new String[] { col });
        sp.setType(AnalyzerType.STRICT_TIMESTAMP);
        sp.setOptions(new String[0]);
        sp.generateOutputFileNames();
        strict.analyze(sp);
        String strictOut = sp.getOutputFiles()[0];

        // 2) Savitzky-Golay for the strict timestamp output
        Analyzer sGolay = factory.getAnalyzer(AnalyzerType.SGOLAY);
        AnalyzerParams sg = new AnalyzerParams();
        sg.setInputFiles(new String[] { strictOut, strictOut });
        sg.setInputColumns(new String[] { "Timestamp (ms)", "RPM PRIM" });
        sg.setType(AnalyzerType.SGOLAY);
        sg.setOptions(new String[] { "101", "3" });
        sg.setOutputFiles(params.getOutputFiles());
        sGolay.analyze(sg);

        logger.info("Completed pipeline: StrictTimestamp -> sGolay for single file RPM");
    }
}
