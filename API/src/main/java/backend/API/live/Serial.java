//Written by Gavin, history of pain on this one

package backend.API.live;

import java.io.FileWriter;
import java.nio.charset.StandardCharsets;

import com.fazecast.jSerialComm.*;

import backend.API.binary_csv.Packet;



public class Serial {


    public static volatile boolean exit = true;

    public static void readLive() {
        String port = "COM4";
        SerialPort comPort = SerialPort.getCommPort(port);
        comPort.setBaudRate(115200);
        comPort.openPort();
        //comPort.setComPortTimeouts(SerialPort.TIMEOUT_READ_BLOCKING, 10000, 0);
        comPort.setComPortTimeouts(SerialPort.TIMEOUT_READ_BLOCKING, 20000, 0);
        exit = false;

        FileWriter fw = null;
        FileWriter fw2 = null;
        FileWriter fw42 = null;
        try {
            //print the current path
            fw = new FileWriter("./upload-dir/live_F_RPM_PRIM.csv");
            fw2 = new FileWriter("./upload-dir/live_F_RPM_SEC.csv");
            fw42 = new FileWriter("./upload-dir/live_F_BELT_SPEED.csv");
            fw.write("Timestamp (ms),F_RPM_PRIM\n");
            fw2.write("Timestamp (ms),F_RPM_SEC\n");
            fw42.write("Timestamp (ms),F_BELT_SPEED\n");

        } catch (Exception e) { e.printStackTrace(); }

        //flush the file writer
        try {
            fw.flush();
            fw2.flush();
            fw42.flush();

        } catch (Exception e) { e.printStackTrace(); }
        try {
        while (!exit)
        {
            //System.out.println(comPort.bytesAvailable() + " bytes available");
            

                //make a byte array to hold the data, it's exactly 8 bytes long
                byte[] readBuffer = new byte[8];

                int numRead = comPort.readBytes(readBuffer, readBuffer.length);

                System.out.println("Read " + numRead + " bytes. Number of Bytes: " + readBuffer.length+ " Bytes: " + readBuffer[0] + ", " + readBuffer[1] + ", " + readBuffer[2] + ", " + readBuffer[3] + ", " + readBuffer[4] + ", " + readBuffer[5] + ", " + readBuffer[6] + ", " + readBuffer[7] );
                //make a packet object from the byte array

                //make a new byte array that is a flipped version of readBuffer
                Packet p = new Packet(readBuffer);
                System.out.println(p.getTimestamp() + ", " + p.getPacketType() + ", " + p.getFloatData());
                if (p.getPacketType() == 37) {
                    //write the timestamp and the float data to the file
                    fw.write(p.getTimestamp() + "," + p.getFloatData()+"\n");
                    //flush the file writer
                    fw.flush();
                } else if (p.getPacketType() == 36) {
                    //write the timestamp and the float data to the file
                    fw2.write(p.getTimestamp() + "," + p.getFloatData()+"\n");
                    //flush the file writer
                    fw2.flush();

                } else if (p.getPacketType() == 42) {
                    //write the timestamp and the float data to the file
                    fw42.write(p.getTimestamp() + "," + p.getFloatData()+"\n");
                    //flush the file writer
                    fw42.flush();
                }
        }
        } catch (Exception e) { e.printStackTrace(); }
        comPort.closePort();

        //close fw and fw2
        try {
            fw.close();
            fw2.close();
            fw42.close();
        } catch (Exception e) { e.printStackTrace(); }
        
        exit = false;
    }
 /*  
    
    public static void readLive() {

        

        String port = "COM5";
        SerialPort comPort = SerialPort.getCommPort(port);
        comPort.openPort();
        comPort.closePort();
        comPort.openPort();
        Runtime.getRuntime().addShutdownHook(new Thread(() -> {comPort.closePort();}));
        
        try {
            Thread.sleep(1000);
            while (true)
            {
            //print the number of bytes available
            System.out.println(comPort.bytesAvailable() + " bytes available");
            Thread.sleep(2000);
               while (comPort.bytesAvailable() == 0)
                  Thread.sleep(20);
         
                /*if (comPort.bytesAvailable() >=8) {
                    byte[] readBuffer = new byte[8];
                    int numRead = comPort.readBytes(readBuffer, 8);
                    System.out.println("Read " + numRead + " bytes.");
                    System.out.println(bytesToHex(readBuffer));
                    Packet p = new Packet(readBuffer);
                    System.out.println(p.getTimestamp() + ", " + p.getPacketType() + ", " + p.getFloatData());
                }
            }
    } catch (Exception e) { e.printStackTrace(); };
}*/

    /*public static void readLive() {
        SerialPort comPort = SerialPort.getCommPort("COM5");
        comPort.setBaudRate(115200);
        comPort.openPort();
        comPort.addDataListener(new SerialPortPacketListener() {
            @Override
            public int getListeningEvents() { return SerialPort.LISTENING_EVENT_DATA_RECEIVED; }
         
            @Override
            public int getPacketSize() { 
                return 8; 
            }
         
            @Override
            public void serialEvent(SerialPortEvent event)
            {
                byte[] newData = event.getReceivedData();
                System.out.println("Received data of size: " + newData.length);
                for (int i = 0; i < newData.length; ++i)
                    System.out.print((char)newData[i]);
                System.out.println("\n");
                Packet p = new Packet(newData);
                System.out.println(p.getTimestamp() + ", " + p.getPacketType() + ", " + p.getFloatData());
            }
        });
    }*/
    public static byte[] readSerial(){
        return null;
    }

    //write a main to test this 
    public static void main(String[] args) {
        readLive();
    }

    


}
