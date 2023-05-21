package backend.API.analyzer;

import backend.API.readwrite.Reader;
import backend.API.readwrite.CSVReader;
import backend.API.readwrite.Writer;
import backend.API.readwrite.CSVWriter;

import java.util.ArrayList;
import java.util.List;

public class DeleteRanom extends Analyzer {
    // This class takes the average of a range of a column and returns it as a double

    public DeleteRanom(String[] inputFiles, String[] outputFiles) {
        super(inputFiles, outputFiles);
    }

    public void analyze() {
        System.out.println("Delete outliers");

        Reader r = new CSVReader(super.inputFiles[0]);
        Writer w = new CSVWriter(super.outputFiles[0]);

        List<List<String>> data = r.read();

        // Create a single data point with the average
        List<String> dataPoint = new ArrayList<String>(2);
        List<List<String>> dataPoints = new ArrayList<List<String>>();


        dataPoint.add(data.get(0).get(0));
        dataPoint.add(data.get(0).get(1));
        dataPoints.add(dataPoint);

        dataPoint = new ArrayList<String>();
        

        for (int i = 1; i < data.size(); i++) {
            if (Double.parseDouble(data.get(i).get(1)) <= 10000) {
                dataPoint.add(data.get(i).get(0));
                dataPoint.add((data.get(i).get(1)));
                dataPoints.add(dataPoint);
                dataPoint = new ArrayList<String>(2);
            }
        }

        w.write(dataPoints);
        
    }

    // Takes average at found indices of second column

    //Make a main to test it
    public static void main(String[] args) {
        String[] inputFiles = {"C:/Users/Admin/Documents/GitHub/Better-Data-Viewer/API/upload-dir/F_RPM_PRIM.csv"};
        String[] outputFiles = {"C:/Users/Admin/Documents/GitHub/Better-Data-Viewer/API/upload-dir/F_RPM_PRIM_new.csv"};
        DeleteRanom a = new DeleteRanom(inputFiles, outputFiles);
        a.analyze();
    }

    

}