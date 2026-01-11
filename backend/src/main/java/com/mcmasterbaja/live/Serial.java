// Written by Gavin, history of pain on this one

package com.mcmasterbaja.live;

import com.fazecast.jSerialComm.*;
import com.mcmasterbaja.binary_csv.Packet;
import com.mcmasterbaja.exceptions.SerialException;
import java.io.FileWriter;
import java.io.IOException;
import java.io.Serializable;
import java.nio.file.Path;
import java.util.HashMap;
import java.util.Map;
import org.eclipse.microprofile.config.inject.ConfigProperty;

public class Serial implements Serializable {
  private SerialPort comPort; // converted comPort to a variable
  private Map<Byte, FileWriter> fileWriters = new HashMap<>();
  public boolean exit = false;

  @ConfigProperty(name = "quarkus.http.body.uploads-directory")
  private Path rootLocation;

  public Serial() {}

  public Serial(SerialPort port) {
    this.comPort = port;
  }

  /* readLive() connects to an Arduino/Serial device, reads + parses binary packets,
     and writes them to a csv file.
  */
  public void readLive() throws IOException { // made readLive method non-static
    SerialPort[] portList = SerialPort.getCommPorts();
    for (SerialPort serialPort : portList) {
      // check if the comport description contains the word arduino or serial
      System.out.println(serialPort.getDescriptivePortName());
      if (serialPort.getDescriptivePortName().contains("Arduino")
          || serialPort.getDescriptivePortName().contains("Serial")) {
        // if it does, set the comport to the current port
        comPort = serialPort;
        // break out of the loop
        exit = true;
        break;
      }

      if (comPort == null) {
        return;
      }
    }

    Packet p = null;
    int timestamp = 0;
    byte packetType = 0;
    float value = 0.0f;
    String filename = null;

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

          p = new Packet(readBuffer);
          timestamp = p.getTimestamp();
          packetType = p.getPacketType();
          value = p.getFloatData();

          filename = "/csv/live/" + packetType + ".csv";

          FileWriter writer = fileWriters.get(packetType);
          if (writer == null) {
            writer = new FileWriter(filename);
            fileWriters.put(packetType, writer);
            writer.write("Timestamp (ms),Value\n");
          }
          writer.write(timestamp + "," + value + "\n");
          writer.flush();
        }
      } finally {
        for (FileWriter writer : fileWriters.values()) {
          writer.close();
        }
      }
    } finally {
      if (comPort != null && comPort.isOpen()) {
        comPort.closePort();
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
      throw new SerialException("Failed to read serial data", e);
    }
  }
}
