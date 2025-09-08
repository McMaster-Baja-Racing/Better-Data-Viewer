// Written by Gavin, history of pain on this one
package com.mcmasterbaja.live;

import com.fazecast.jSerialComm.*;
import com.mcmasterbaja.binary_csv.Packet;
import java.io.FileWriter;
import java.io.IOException;
import java.io.Serializable;
import java.nio.file.Path;
import java.util.HashMap;
import java.util.Map;
import org.eclipse.microprofile.config.inject.ConfigProperty;

public class Serial implements Serializable {
  private SerialPort comPort; // converted comPort to a variable  
  public boolean exit = false;
  private Map<Byte, FileWriter> fileWriters = new HashMap<>();

  @ConfigProperty(name = "quarkus.http.body.uploads-directory")
  private Path rootLocation;

  public Serial() {

  }

  public Serial(SerialPort port) {
    this.comPort = port;
  }

  public void readLive() throws Exception { // made readLive method non-static
    String rootLocation = "./uploads"; // To be replaced with a path

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
      } 
      try {
        while (true) {
          byte[] readBuffer = new byte[8];
          int numBytes = comPort.readBytes(readBuffer, 8); 
          
          if (numBytes != 8) continue;
  
          Packet p = new Packet(readBuffer);
          int timestamp = p.getTimestamp();  
          byte packetType = p.getPacketType();
          float value = p.getFloatData();  
  
          String filename = rootLocation + "/live_" + packetType + ".csv"; 
    
          FileWriter writer = fileWriters.get(packetType); 
          if (writer == null) {
            writer = new FileWriter(filename); 
            fileWriters.put(packetType, writer); 
            writer.write("Timestamp (ms),Value\n"); 
          } 
          writer.write(timestamp + ","  + value + "\n"); 
          writer.flush(); 
        }
      } catch (IOException e) {
        e.printStackTrace();
      } finally {
        for (FileWriter writer : fileWriters.values()) {
          writer.close(); 
        }
      }
    } catch (Exception E) {
      System.out.println("Error during port setup");
      E.printStackTrace();
    } finally {
      if (comPort != null && comPort.isOpen()) {
        comPort.closePort();
        System.out.println("Port closed");
      }
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
