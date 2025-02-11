// Written by Gavin, history of pain on this one
package com.mcmasterbaja.live;

import com.fazecast.jSerialComm.*;
import com.mcmasterbaja.binary_csv.Packet;
import java.io.FileWriter;
import java.io.IOException;
import java.io.Serializable;
import com.mcmasterbaja.live.PacketType; 
import java.util.HashMap; 
import java.util.Map; 
import org.eclipse.microprofile.config.inject.ConfigProperty;
import java.nio.file.Path;

public class Serial implements Serializable {
  private SerialPort comPort; // converted comPort to a variable
  private FileWriter fw = null; 
  private FileWriter fw2 = null; 
  public boolean exit = false;
  private FileWriter fw42 = null; 
  private Map<PacketType, FileWriter> fileWriters = new HashMap<>(); 

  @ConfigProperty(name = "quarkus.http.body.uploads-directory")
  private Path rootLocation;

  public Serial() {}

  public Serial(SerialPort port) {
    this.comPort = port;  
  }

  public void readLive() throws Exception { // made readLive method non-static
    String rootLocation = "./uploads"; // To be replaced with a path
    String port = "COM4";

    while (!exit) {
      SerialPort[] portList = SerialPort.getCommPorts();
      for (SerialPort serialPort : portList) {
        // check if the comport desciption contains the word arduino
        System.out.println(serialPort.getDescriptivePortName());
        if (serialPort.getDescriptivePortName().contains("Arduino")
            || serialPort.getDescriptivePortName().contains("Serial")) {
          // if it does, set the comport to the current port
          comPort = serialPort;
          // break out of the loop
          exit = true;
          break;
        }
      }
      if (!exit) { // throwing exception if port not found
        throw new Exception("No suitable port found"); 
      }
    }

  try {
      comPort.setBaudRate(115200);
      if (comPort.openPort()) {
        System.out.println("Connected to port"); 
        comPort.setComPortTimeouts(SerialPort.TIMEOUT_READ_BLOCKING, 2000, 0);
      } else {
        System.out.println("Could not connect to port."); 
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
    // define an array of file writers with 6 elements
    FileWriter[] strains = new FileWriter[6];
    String[] strainNames = {"Force X", "Force Z", "Force Y", "Moment X", "Moment Z", "Moment Y"};
    try {
      // print the current path
      // TODO: Use the correct path from the application.properties file
      // creat a writer for each thing in the enum
      fw = new FileWriter(rootLocation.toString() + "/live_F_RPM_PRIM.csv");
      fw2 = new FileWriter(rootLocation.toString() + "/live_F_RPM_SEC.csv");
      fw42 = new FileWriter(rootLocation.toString() + "/live_F_BELT_SPEED.csv");
      fileWriters.put(PacketType.F_RPM_PRIM, fw); 
      fileWriters.put(PacketType.F_RPM_SEC, fw2); 
      fileWriters.put(PacketType.F_BELT_SPEED, fw42); 
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
      while (true) {
        byte[] readBuffer = new byte[8];
        int numRead = comPort.readBytes(readBuffer, readBuffer.length);

        String s = ""; 
        for (int i = 0; i < 7; i++) {
          s += readBuffer[i] + ", "; 
        }
        s += readBuffer[7]; 


        System.out.println("Read " + numRead + " bytes. Number of Bytes: " + readBuffer.length+ "Bytes: " + s);

        Packet p = new Packet(readBuffer);
        System.out.println(p.getTimestamp() + ", " + p.getPacketType() + ", " + p.getFloatData());

        try {
          fileWriters.get(p.getPacketType()).write(p.getTimestamp() + "," + p.getFloatData() + "\n");
          fileWriters.get(p.getPacketType()).flush();
        } catch (Exception e) {
            if (p.getPacketType() >= 28 && p.getPacketType() <= 33) {
              s = ""; 
              for (int i = 0; i < 7; i++) {
                s += readBuffer[i] + ", "; 
              }
              s += readBuffer[7]; 
              System.out.println("Read " + numRead + " bytes. Number of Bytes: " + readBuffer.length + " Bytes: " + s);
              System.out.println(p.getTimestamp() + ", " + p.getPacketType() + ", " + p.getFloatData());
              strains[p.getPacketType() - 28].write(p.getTimestamp() + "," + p.getFloatData() + "\n");
              strains[p.getPacketType() - 28].flush();   
            }
        }  
      }
    } catch (Exception e) {
      e.printStackTrace();
    }
    comPort.closePort();
    try {
      for (FileWriter f : fileWriters.values()) {
        f.close();
      }
      for (FileWriter f : strains) {
        f.flush();
      }
    } catch (Exception e) {
      e.printStackTrace();
    }
  }

  public static byte[] readSerial() {
    return null;
  }

  // write a main to test this
  public static void main(String[] args) {
    SerialPort sp = SerialPort.getCommPorts()[0]; 
    Serial serial = new Serial(sp); 
    try {
      serial.readLive();
    } catch (Exception e) {
      e.printStackTrace();
    }
  }
}