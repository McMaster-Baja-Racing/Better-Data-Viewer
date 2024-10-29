package com.mcmasterbaja.analyzer;

import java.util.ArrayList;
import java.util.List;

import com.mcmasterbaja.readwrite.CSVReader;
import com.mcmasterbaja.readwrite.CSVWriter;
import com.mcmasterbaja.readwrite.Reader;
import com.mcmasterbaja.readwrite.Writer;

public class ConstantAdderAnalyzer extends Analyzer{
    private final double a;
    private final double b;
    private final double c;
    private final double d;

   public ConstantAdderAnalyzer(String[] inputFiles, String[] inputColumns, String[] outputFiles, double a, double b, double c, double d) {
       super(inputFiles, inputColumns, outputFiles);
       this.a = a;
       this.b = b;
       this.c = c;
       this.d = d;
   }
  public void analyze() {

    System.out.println("Add a constant value to a file named"+ super.inputFiles[0]+ " to make " + super.outputFiles[0]);
    Reader r = new CSVReader(super.inputFiles[0]);
    Writer w = new CSVWriter(super.outputFiles[0]);
    if(inputColumns.length==4) {
      w.write(constantAdder(r.read(), a, b, c, d)); //Writes in values with constants added in
    }
    
  }

  // split data from start to end and return the data
  public List<List<String>> constantAdder(List<List<String>> data, double a, double b, double c, double d) {

      List<List<String>> dataPoints = new ArrayList<List<String>>();
      List<String> dataPoint = new ArrayList<String>(4);
      int v1 = this.getAnalysisColumnIndex(0, data.get(0));
      int v2 = this.getAnalysisColumnIndex(1, data.get(0));
      int v3 = this.getAnalysisColumnIndex(2, data.get(0));
      int v4 = this.getAnalysisColumnIndex(3, data.get(0));
      // Add header
      dataPoint.add(data.get(0).get(v1));
      dataPoint.add(data.get(0).get(v2));
      dataPoint.add(data.get(0).get(v3));
      dataPoint.add(data.get(0).get(v4));
      dataPoints.add(dataPoint);

      dataPoint = new ArrayList<String>(4);

      // loop through the data and add the individual constants to each of the four vector components
      
    for (int i = 1; i < data.size(); i++) {
      try{
        dataPoint.add(Double.toString(Double.parseDouble(data.get(i).get(v1))+a));
        dataPoint.add(Double.toString(Double.parseDouble(data.get(i).get(v2))+b));
        dataPoint.add(Double.toString(Double.parseDouble(data.get(i).get(v3))+c));
        dataPoint.add(Double.toString(Double.parseDouble(data.get(i).get(v4))+d));
        dataPoints.add(dataPoint);
        dataPoint = new ArrayList<String>(4);
      } catch (Exception e) {break;}
      
    }

    return dataPoints;
  }
  public static void main(String[] args) {
    /*String[] filepaths = new String[1];
    String[] outputFiles = new String[1];
    filepaths[0] ="C:\\Users\\benji\\OneDrive\\Desktop\\CodeShit\\BajaStuff\\Better-Data-Viewer\\backend\\Test.csv\"";
    outputFiles[0] ="C:\\Users\\benji\\OneDrive\\Desktop\\CodeShit\\BajaStuff\\Better-Data-Viewer\\backend\\Output.csv\"";
    ConstantAdderAnalyzer r = new ConstantAdderAnalyzer(filepaths, "4", outputFiles, 1.0, 2.0,3.0,4.0);
    r.analyze();*/
  }
}
