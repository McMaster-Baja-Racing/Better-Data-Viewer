// Written by Gavin, history of pain on this one
package com.mcmasterbaja.live;

import com.fazecast.jSerialComm.*;
import com.mcmasterbaja.binary_csv.Packet;
import java.io.FileWriter;

public class Serial {
  public static volatile boolean exit = true;

  public static void readLive() {
    String rootLocation = "./uploads"; // To be replaced with a path
    exit = false;
    String port = "COM4";
    SerialPort comPort = SerialPort.getCommPort(port);
    boolean setPort = false;

    while (!setPort) {
      SerialPort[] portList = SerialPort.getCommPorts();
      for (SerialPort serialPort : portList) {
        // check if the comport desciption contains the word arduino
        System.out.println(serialPort.getDescriptivePortName());
        if (serialPort.getDescriptivePortName().contains("Arduino")
            || serialPort.getDescriptivePortName().contains("Serial")) {
          // if it does, set the comport to the current port
          comPort = serialPort;
          // break out of the loop
          setPort = true;
          break;
        }
      }
      if (!setPort) { // throwing exception if port not found
        throw new Exception("No suitable port found")
      }
    }

  try {
      comPort.setBaudRate(115200);
      if (comPort.openPort()) {
        System.out.println("Connected to port"); 
        comPort.setComPortTimeouts(SerialPort.TIMEOUT_READ_BLOCKING, 2000, 0);
      } else {
        System.out.println("Could not connect to port.")
      }
  } catch (Exception E) {
    System.out.println("Error during port setup");
    E.printStackTrace(); 
  } finally {
    if (comPort.openPort()) {
      comPort.closePort(); 
      System.out.println("Port closed");
    }
  }

    FileWriter fw = null;
    FileWriter fw2 = null;
    FileWriter fw42 = null;
    // define an array of file writers with 6 elements
    FileWriter[] strains = new FileWriter[6];
    String[] strainNames = {"Force X", "Force Z", "Force Y", "Moment X", "Moment Z", "Moment Y"};
    try {
      // print the current path
      // TODO: Use the correct path from the application.properties file
      fw = new FileWriter(rootLocation.toString() + "/live_F_RPM_PRIM.csv");
      fw2 = new FileWriter(rootLocation.toString() + "/live_F_RPM_SEC.csv");
      fw42 = new FileWriter(rootLocation.toString() + "/live_F_BELT_SPEED.csv");
      fw.write("Timestamp (ms),F_RPM_PRIM\n");
      fw2.write("Timestamp (ms),F_RPM_SEC\n");
      fw42.write("Timestamp (ms),F_BELT_SPEED\n");

      for (int i = 1; i <= 6; i++) {
        // create a new file writer for each file
        strains[i - 1] =
            new FileWriter(rootLocation.toString() + "/Live " + strainNames[i - 1] + ".csv");
        // write the header to the file
        strains[i - 1].write("Timestamp (ms)" + "," + strainNames[i - 1] + "\n");
      }

    } catch (Exception e) {
      e.printStackTrace();
    }

    // flush the file writer
    try {
      fw.flush();
      fw2.flush();
      fw42.flush();

      for (FileWriter f : strains) {
        f.flush();
      }

    } catch (Exception e) {
      e.printStackTrace();
    }
    try {
      while (!exit) {
        byte[] readBuffer = new byte[8];
        int numRead = comPort.readBytes(readBuffer, readBuffer.length);

        System.out.println("Read " + numRead + " bytes. Number of Bytes: " + readBuffer.length+ "
        Bytes: " + readBuffer[0] + ", " + readBuffer[1] + ", " + readBuffer[2] + ", " +
        readBuffer[3] + ", " + readBuffer[4] + ", " + readBuffer[5] + ", " + readBuffer[6] + ", "
        + readBuffer[7] );

        Packet p = new Packet(readBuffer);
        System.out.println(p.getTimestamp() + ", " + p.getPacketType() + ", " + p.getFloatData());

        switch (p.getPacketType()) {
          case 37: 
            fw.write(p.getTimestamp() + "," + p.getFloatData() + "\n");
            fw.flush();
            break;

          case 36: 
            fw2.write(p.getTimestamp() + "," + p.getFloatData() + "\n");
            fw2.flush();  
            break; 

          case 42: 
            fw42.write(p.getTimestamp() + "," + p.getFloatData() + "\n");
            fw42.flush();
            break; 
          
          default: 
            if (p.getPacketType() >= 28 && p.getPacketType() <= 33) {
              System.out.println("Read " + numRead + " bytes. Number of Bytes: " + readBuffer.length+
              " Bytes: " + readBuffer[0] + ", " + readBuffer[1] + ", " + readBuffer[2] + ", " +
              readBuffer[3] + ", " + readBuffer[4] + ", " + readBuffer[5] + ", " + readBuffer[6] + ",
              " + readBuffer[7] );
              System.out.println(p.getTimestamp() + ", " + p.getPacketType() + ", " +
              p.getFloatData());
              strains[p.getPacketType() - 28].write(p.getTimestamp() + "," + p.getFloatData() + "\n");
              strains[p.getPacketType() - 28].flush();
            }
        }
      }
    } catch (Exception e) {
      e.printStackTrace();
    }
    comPort.closePort();

    // close fw and fw2
    try {
      fw.close();
      fw2.close();
      fw42.close();
      for (FileWriter f : strains) {
        f.close();
      }
    } catch (Exception e) {
      e.printStackTrace();
    }
  }
  public static void readLive() { // processes data from COM5 and safely shuts down
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

            if (comPort.bytesAvailable() >=8) {
                byte[] readBuffer = new byte[8];
                int numRead = comPort.readBytes(readBuffer, 8);
                System.out.println("Read " + numRead + " bytes.");
                System.out.println(bytesToHex(readBuffer));
                Packet p = new Packet(readBuffer);
                System.out.println(p.getTimestamp() + ", " + p.getPacketType() + ", " + p.getFloatData());

            }
        }
    } catch (Exception e) { e.printStackTrace(); };
  }

  public static void readLive() {
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
}

  public static byte[] readSerial() {
    return null;
  }

  // write a main to test this
  public static void main(String[] args) {
    readLive();
  }
}