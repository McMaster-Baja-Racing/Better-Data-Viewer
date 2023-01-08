package storage;

public class Packet {

    //add element id's here starting from 0 and incrementing by 1

    public enum PacketType {
        F_IMU_ABS_X(0),
        F_IMU_ABS_Y(1),
        F_IMU_ABS_Z(2),
        F_IMU_ACCEL_X(3),
        F_IMU_ACCEL_Y(4),
        F_IMU_ACCEL_Z(5),
        F_IMU_GRAVITY_X(6),
        F_IMU_GRAVITY_Z(7),
        F_IMU_GRAVITY_Y(8),
        F_IMU_GYRO_X(9),
        F_IMU_GYRO_Y(10),
        F_IMU_GYRO_Z(11),
        F_IMU_TEMP(12),
        F_GPS_LATITUDE(13),
        INT_GPS_LAT(14),
        F_GPS_LONGITUDE(15),
        INT_GPS_LON(16),
        F_GPS_ANGLE(17),
        F_GPS_SPEED(18),
        INT_GPS_TIME(19),
        INT_GPS_DAYMONTHYEAR(20),
        INT_GPS_SECONDMINUTEHOUR(21),
        F_PRIM_TEMP(22),
        F_SEC_TEMP(23),
        INT_SUS_TRAV_FR(24),
        INT_SUS_TRAV_FL(25),
        INT_SUS_TRAV_RR(26),
        INT_SUS_TRAV_RL(27),
        INT_STRAIN1(28),
        INT_STRAIN2(29),
        INT_STRAIN3(30),
        INT_STRAIN4(31),
        INT_STRAIN5(32),
        INT_STRAIN6(33),
        F_RPM_FR(34),
        F_RPM_FL(35),
        F_RPM_SEC(36),
        F_RPM_PRIM(37),
        INT_BATT_PERC(38),
        F_BATT_VOLT(39),
        F_BRAKE_PRESS(40),
    }


    private PacketType type;
    private float floatData = null;
    //note, java has no unsigned types, the choice was between using longs or ints with special unsigned functions
    private long intData = null;
    private int timestamp;

    public String getType() {
        return this.type;
    }
    

    public float getFloat() { 
        //todo: check if it's the correct type before returning
        if () {
            return this.floatData;
        } else {
            throw new Exception("This packet is not a float");
        }
        return this.floatData;
    }
    
    public long getInt() {
        return this.intData;
    }

    public int getTimestamp() {
        return this.timestamp;
    }
    

    public Packet(PacketType type, int timestamp, float floatData) {
        this.type = type;
        this.floatData = floatData;
        this.timestamp = timestamp;
    }

    public Packet(PacketType type, int timestamp, long intData) {
        this.type = type;
        this.intData = intData;
        this.timestamp = timestamp;
    }

    public static ArrayList<Packet> parse(String path) {
        //open a file and read all its contents
        //parse the first 26 bits as an int timestamp, the next 6 bits as PacketType enum, and the last 32 bits as either float or int depending on the enum, and repeat until the file is empty
        //return an array of packets

        File file = new File(path);
        FileInputStream fis = new FileInputStream(file);
        DataInputStream dis = new DataInputStream(fis);
        //make an array of packets big enough to hold all the packets in the file
        ArrayList<Packet> packets = new ArrayList<Packet>((int) file.length() / 8);
        //byte[] data = new byte[(int) file.length()];
        //fis.read(data);
        //fis.close();

        while (dis.available() > 0) {
            int id = dis.readUnsignedByte() & 0b111111;
            int time = dis.readUnsignedByte() << 2 | dis.readUnsignedByte() << 10 | dis.readUnsignedByte() << 18;
            long val = dis.readInt() & 0xffffffffL;

            //if the enum starts with INT, return an int unless it is INT_STRAIN, in which case return a float
            //if the enum starts with F, return a float
            if (id == PacketType.INT_STRAIN1.ordinal()) {
                float f = val * 4078.4f / 1024.0f * 3.3f - 7009.2f;
                
            } else if (id == PacketType.INT_STRAIN2.ordinal()) {
                float f = 
            }
            

            System.out.println("ID: " + String.format("%02d", id) + " Time: " + String.format("%08d", time) + " Val: " + val);
        }

    }

  
}
