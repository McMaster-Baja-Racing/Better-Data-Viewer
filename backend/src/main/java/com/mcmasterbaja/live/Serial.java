// Written by Gavin, history of pain on this one
package com.mcmasterbaja.live;

import com.fazecast.jSerialComm.*;
import com.mcmasterbaja.binary_csv.Packet;
import java.io.FileWriter;
import java.io.Serializable;

public enum PacketType {
  F_IMU_ABS_X = 0,
  F_IMU_ABS_Y,
  F_IMU_ABS_Z,
  F_IMU_ACCEL_X,
  F_IMU_ACCEL_Y,
  F_IMU_ACCEL_Z,
  F_IMU_GRAVITY_X,
  F_IMU_GRAVITY_Z,
  F_IMU_GRAVITY_Y,
  F_IMU_GYRO_X,
  F_IMU_GYRO_Y,
  F_IMU_GYRO_Z,
  F_IMU_TEMP,
  F_GPS_LATITUDE,
  INT_GPS_LAT,
  F_GPS_LONGITUDE,
  INT_GPS_LON,
  F_GPS_ANGLE,
  F_GPS_SPEED,
  INT_GPS_TIME,
  INT_GPS_DAYMONTHYEAR,
  INT_GPS_SECONDMINUTEHOUR,
  INT_PRIM_TEMP,
  F_SEC_TEMP,
  INT_SUS_TRAV_FR,
  INT_SUS_TRAV_FL,
  INT_SUS_TRAV_RR,
  INT_SUS_TRAV_RL,
  INT_STRAIN1,
  INT_STRAIN2,
  INT_STRAIN3,
  INT_STRAIN4,
  INT_STRAIN5,
  INT_STRAIN6,
  F_RPM_FR,
  F_RPM_FL,
  F_RPM_SEC,
  F_RPM_PRIM, 
  INT_BATT_PERC,
  F_BATT_VOLT,
  F_BRAKE_PRESS,
  IMU_QUAT_W,
  IMU_QUAT_X,
  IMU_QUAT_Y,
  IMU_QUAT_Z,
}

public class Serial implements Serializable {
  private SerialPort comPort; // converted comPort to a variable
  private boolean isLive = true; 
  private FileWriter fw = null; 
  private FileWriter fw2 = null; 
  private FileWriter fw42 = null; 
  private Map<PacketType, FileWriter> fileWriters = new HashMap<>(); 

  public Serial(SerialPort port) {
    this.comPort = port;  
  }

  public void readLive() { // made readLive method non-static
    String rootLocation = "./uploads"; // To be replaced with a path
    exit = false;
    String port = "COM4";
    
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
      while (!exit) {
        byte[] readBuffer = new byte[8];
        int numRead = comPort.readBytes(readBuffer, readBuffer.length);

        System.out.println("Read " + numRead + " bytes. Number of Bytes: " + readBuffer.length+ "
        Bytes: " + readBuffer[0] + ", " + readBuffer[1] + ", " + readBuffer[2] + ", " +
        readBuffer[3] + ", " + readBuffer[4] + ", " + readBuffer[5] + ", " + readBuffer[6] + ", "
        + readBuffer[7] );

        Packet p = new Packet(readBuffer);
        System.out.println(p.getTimestamp() + ", " + p.getPacketType() + ", " + p.getFloatData());

        try {
          fileWriters.get(p.getPacketType()).write(p.getTimestamp() + "," + p.getFloatData() + "\n");
          fileWriters.get(p.getPacketType()).flush();
        } catch (Exception e) {
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
    try {
      fileWriters.values().forEach((p, f) -> f.close()); 
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
    readLive();
  }
}