package backend.API.binary_csv;

import java.nio.ByteBuffer;
import java.nio.ByteOrder;
import java.util.Arrays;


public class Packet {

    private int timestamp;
    private byte packetType;
    private long intData;
    private float floatData;

    private boolean isFloat;

    public Packet(int timestamp, byte packetType, long data){
        this.timestamp = timestamp;
        this.packetType = packetType;
        this.intData = data;
        isFloat = false;
    }

    public Packet(int timestamp, byte packetType, float data){
        this.timestamp = timestamp;
        this.packetType = packetType;
        this.floatData = data;
        isFloat = true;
    }

    public Packet(byte[] data){
        //parse the byte array into a packet object
        //if the byte array is not 8 bytes, return null

        if (data.length != 8)
            return;

        ByteBuffer buffer = ByteBuffer.wrap(Arrays.copyOfRange(data, 0, 4));
        buffer.order(ByteOrder.LITTLE_ENDIAN);
        int timestamp = buffer.getInt();
        // Get id
        this.packetType = (byte)(timestamp & 0x3F);
        this.timestamp = timestamp >> 6;

        buffer = ByteBuffer.wrap(Arrays.copyOfRange(data, 4, 8));
        buffer.order(ByteOrder.LITTLE_ENDIAN);
        

        //if the packettype is 37, the data is a float
        if (this.packetType == 37 || this.packetType == 36){
            this.isFloat = true;
            this.floatData = buffer.getFloat();
        } else if (this.packetType >= 28 && this.packetType <= 33){
            //strain from WFT
            this.isFloat = true;
            this.floatData = buffer.getFloat();
        }
        else {
         this.intData = buffer.getInt();
        }
        
    }

    public int getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(int timestamp) {
        this.timestamp = timestamp;
    }

    public byte getPacketType() {
        return packetType;
    }

    public void setPacketType(byte packetType) {
        this.packetType = packetType;
    }


    public float getFloatData() {
        if (!isFloat)
            return 0;
        return floatData;
    }
    
    public long getIntData() {
        if (isFloat)
            return 0;
        return intData;
    }

    
    public static void main(String[] args) {
        // TODO Auto-generated method stub

    }

 

    public static Packet[] parse(byte[] data) {
        //parse the byte array into an array of packets
        //return the array of packets
        //if the byte array is not a multiple of 8, return null

        if (data.length % 8 != 0)
            return null;

        Packet[] packets = new Packet[data.length / 8];

        for (int i = 0; i < data.length; i+= 8){
            byte[] packetData = new byte[8];
            for (int j = 0; j < 8; j++){
                packetData[j] = data[i + j];
            }
            packets[i / 8] = new Packet(packetData);
        }
        return packets;
    }


    
}
