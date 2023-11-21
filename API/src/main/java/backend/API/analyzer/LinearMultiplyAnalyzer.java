package backend.API.analyzer;

import java.util.ArrayList;
import java.util.List;

import java.text.DecimalFormat;

import backend.API.readwrite.Reader;
import backend.API.readwrite.CSVReader;
import backend.API.readwrite.Writer;
import backend.API.readwrite.CSVWriter;

public class LinearMultiplyAnalyzer extends Analyzer {
    private double m;
    private double b;

    private static final DecimalFormat df = new DecimalFormat("0.00");

    public LinearMultiplyAnalyzer(String[] inputFiles, String[] inputColumns, String[] outputFiles, double m, double b) {
        super(inputFiles, inputColumns, outputFiles);
        this.m = m;
        this.b = b;
    }


    @Override
    public void analyze(){

        System.out.println("Multiplyinh the file named" + super.inputFiles[0] + " to " + super.outputFiles[0] + " with a m value of " + m + " and an offset value of " + b);

        Reader r = new CSVReader(super.inputFiles[0]);
        Writer w = new CSVWriter(super.outputFiles[0]);

        w.write(linearMultiply(r.read(), m, b));
    }

    // split data from start to end and return the data
    public List<List<String>> linearMultiply(List<List<String>> data, double m, double b) {

        List<List<String>> dataPoints = new ArrayList<List<String>>();
        List<String> dataPoint = new ArrayList<String>(2);

        int independentColumn = this.getAnalysisColumnIndex(0, data.get(0));
        int dependentColumn = this.getAnalysisColumnIndex(1, data.get(0));

        // Add header
        dataPoint.add(data.get(0).get(independentColumn));
        dataPoint.add(data.get(0).get(dependentColumn));
        dataPoints.add(dataPoint);

        dataPoints = new ArrayList<List<String>>();

        //loop through the data and multiply the second coloum by m and then add b
        for (int i = 1; i < data.size(); i++) {
            dataPoint.add(data.get(i).get(independentColumn));
            dataPoint.add(df.format(Double.parseDouble(data.get(i).get(dependentColumn)) * m + b));
            dataPoints.add(dataPoint);
            dataPoint = new ArrayList<String>(2);
        }

        return dataPoints;
    }

    // make a main to test it
    public static void main(String[] args) {
        // String[] filepaths = new String[1];
        // String[] outputFiles = new String[1];
        // filepaths[0] = "C:/Users/Ariel/OneDrive/Documents/dev/Better-Data-Viewer/API/upload-dir/F_RPM_PRIM_split.csv";
        // outputFiles[0] = "C:/Users/Ariel/OneDrive/Documents/dev/Better-Data-Viewer/API/upload-dir/F_RPM_PRIM_split_multi.csv";
        // LinearMultiplyAnalyzer r = new LinearMultiplyAnalyzer(filepaths, outputFiles, 0.5, 0.0);
        // r.analyze();
    }
    
}
