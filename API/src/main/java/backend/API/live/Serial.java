package backend.API.live;

import java.io.FileWriter;

import com.fazecast.jSerialComm.*;

import backend.API.binary_csv.Packet;



public class Serial {

    private String port = "COM3";

    public static volatile boolean exit = true;

    public static void readLive() {
        String port = "COM3";
        SerialPort comPort = SerialPort.getCommPort(port);
        comPort.openPort();
        exit = false;


        // open a file named live_F_RPM_PRIM.csv and live_F_RPM_SEC.csv
        //write the first line Timestamp (ms),F_RPM_PRIM
        //write the first line Timestamp (ms),F_RPM_SEC in the second file
        
        //create a file writer for each file
        FileWriter fw = null;
        FileWriter fw2 = null;
        try {
            //print the current path
            fw = new FileWriter("./upload-dir/live_F_RPM_PRIM.csv");
            fw2 = new FileWriter("./upload-dir/live_F_RPM_SEC.csv");
            fw.write("Timestamp (ms),F_RPM_PRIM\n");
            fw2.write("Timestamp (ms),F_RPM_SEC\n");
        } catch (Exception e) { e.printStackTrace(); }

        //flush the file writer
        try {
            fw.flush();
            fw2.flush();
        } catch (Exception e) { e.printStackTrace(); }
 
        try {
        while (!exit)
        {
            while (comPort.bytesAvailable() < 8)
                Thread.sleep(20);

            byte[] readBuffer = new byte[comPort.bytesAvailable()];
            int numRead = comPort.readBytes(readBuffer, readBuffer.length);
            System.out.println("Read " + numRead + " bytes.");
            //make a packet object from the byte array
            Packet p = new Packet(readBuffer);
            System.out.println(p.getTimestamp() + ", " + p.getPacketType() + ", " + p.getFloatData());
            if (p.getPacketType() == 37) {
                //write the timestamp and the float data to the file
                fw.write(p.getTimestamp() + "," + p.getFloatData()+"\n");
                //flush the file writer
                fw.flush();
            } if (p.getPacketType() == 36) {
                //write the timestamp and the float data to the file
                fw2.write(p.getTimestamp() + "," + p.getFloatData()+"\n");
                //flush the file writer
                fw2.flush();
            }
        }
        } catch (Exception e) { e.printStackTrace(); }
        comPort.closePort();

        //close fw and fw2
        try {
            fw.close();
            fw2.close();
        } catch (Exception e) { e.printStackTrace(); }
        
        exit = false;
    }

    public static byte[] readSerial(){
        return null;
    }



}
