use jni::objects::{JByteArray, JClass, JString};
use jni::sys::jboolean;
use jni::JNIEnv;

use num_enum::{IntoPrimitive, TryFromPrimitive};

use std::collections::HashMap;
use std::convert::TryFrom;
use std::fmt;
use std::fs::File;
use std::io::{BufWriter, Write};
use std::time::Instant;

// Adding a temporary comment to lib.rs

//create an enum  for each data string
#[allow(dead_code)]
#[allow(non_camel_case_types)]
#[derive(PartialEq, Eq, Copy, Clone, Hash, Debug, IntoPrimitive, TryFromPrimitive)]
#[repr(u8)]
pub enum DataType {
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

const DATA_TYPE_LEN: usize = DataType::F_BRAKE_PRESS as usize + 1;

impl<'a> From<&DataType> for &'a str {
    fn from(d: &DataType) -> Self {
        match d {
            DataType::F_IMU_ABS_X => "IMU_ABS_X",
            DataType::F_IMU_ABS_Y => "IMU_ABS_Y",
            DataType::F_IMU_ABS_Z => "IMU_ABS_Z",
            DataType::F_IMU_ACCEL_X => "IMU_ACCEL_X",
            DataType::F_IMU_ACCEL_Y => "IMU_ACCEL_Y",
            DataType::F_IMU_ACCEL_Z => "IMU_ACCEL_Z",
            DataType::F_IMU_GRAVITY_X => "IMU_GRAVITY_X",
            DataType::F_IMU_GRAVITY_Y => "IMU_GRAVITY_Y",
            DataType::F_IMU_GRAVITY_Z => "IMU_GRAVITY_Z",
            DataType::F_IMU_GYRO_X => "IMU_GYRO_X",
            DataType::F_IMU_GYRO_Y => "IMU_GYRO_Y",
            DataType::F_IMU_GYRO_Z => "IMU_GYRO_Z",
            DataType::F_IMU_TEMP => "IMU_TEMP",
            DataType::F_GPS_LATITUDE => "GPS_LATITUDE",
            DataType::INT_GPS_LAT => "GPS_LAT_CHAR",
            DataType::F_GPS_LONGITUDE => "GPS_LONGITUDE",
            DataType::INT_GPS_LON => "GPS_LON_CHARACTER",
            DataType::F_GPS_ANGLE => "GPS_ANGLE",
            DataType::F_GPS_SPEED => "GPS_SPEED",
            DataType::INT_GPS_TIME => "GPS_TIME",
            DataType::INT_GPS_DAYMONTHYEAR => "GPS_DAY_MONTH_YEAR",
            DataType::INT_GPS_SECONDMINUTEHOUR => "GPS_SECOND_MINUTE_HOUR",
            DataType::INT_PRIM_TEMP => "PRIM_TEMP",
            DataType::F_SEC_TEMP => "SEC_TEMP",
            //suspension data types are currently integers.
            DataType::INT_SUS_TRAV_FR => "SUS_TRAV_FR",
            DataType::INT_SUS_TRAV_FL => "SUS_TRAV_FL",
            DataType::INT_SUS_TRAV_RR => "SUS_TRAV_RR",
            DataType::INT_SUS_TRAV_RL => "SUS_TRAV_RL",

            DataType::INT_STRAIN1 => "STRAIN1",
            DataType::INT_STRAIN2 => "STRAIN2",
            DataType::INT_STRAIN3 => "STRAIN3",
            DataType::INT_STRAIN4 => "STRAIN4",
            DataType::INT_STRAIN5 => "STRAIN5",
            DataType::INT_STRAIN6 => "STRAIN6",
            DataType::F_RPM_FR => "RPM_FR",
            DataType::F_RPM_FL => "RPM_FL",
            DataType::F_RPM_SEC => "RPM_SEC",
            DataType::F_RPM_PRIM => "RPM_PRIM",
            DataType::INT_BATT_PERC => "BATT_PERC",
            DataType::F_BATT_VOLT => "BATT_VOLT",
            DataType::F_BRAKE_PRESS => "BRAKE_PRESS",
            DataType::IMU_QUAT_W => "IMU_QUAT_W",
            DataType::IMU_QUAT_X => "IMU_QUAT_X",
            DataType::IMU_QUAT_Y => "IMU_QUAT_Y",
            DataType::IMU_QUAT_Z => "IMU_QUAT_Z",
        }
    }
}

impl fmt::Display for DataType {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{}", <&DataType as std::convert::Into<&str>>::into(self))
    }
}

#[derive(Debug)]
enum Data {
    FloatData(f32),
    IntData(u32),
}

impl<'a> std::ops::BitAnd<u32> for &'a Data {
    type Output = Option<u32>;
    fn bitand(self, rhs: u32) -> Self::Output {
        match self {
            Data::IntData(a) => Some(a & rhs),
            _ => None,
        }
    }
}

#[allow(non_snake_case)]
impl std::fmt::Display for Data {
    fn fmt(&self, f: &mut std::fmt::Formatter) -> std::fmt::Result {
        match self {
            Data::FloatData(a) => write!(f, "{}", a),
            Data::IntData(a) => write!(f, "{}", a),
        }
    }
}

#[derive(Debug)]
struct Packet {
    timestamp: u32,
    datatype: DataType,
    data: Data,
}

#[no_mangle]
#[allow(non_snake_case)]
pub extern "system" fn read_data(path: &std::path::Path) -> Vec<u8> {
    match std::fs::read(path) {
        Ok(bytes) => bytes,
        Err(e) => {
            if e.kind() == std::io::ErrorKind::NotFound {
                eprintln!("The data file was not found");
            }
            panic!("{}", e);
        }
    }
}

#[no_mangle]
pub extern "system" fn convert_to_32bit(v: &Vec<u8>) -> Vec<u32> {
    let mut i = 0;
    let mut vec: Vec<u32> = Vec::with_capacity(v.len() / 4);
    while i < v.len() {
        vec.push(u32::from_le_bytes([v[i], v[i + 1], v[i + 2], v[i + 3]]));
        i += 4;
    }
    vec
}

#[no_mangle]
pub extern "system" fn get_writer(
    datatype: &DataType,
    destination: &str,
    path: &str,
    folder: bool,
) -> std::io::BufWriter<std::fs::File> {
    let path = if folder {
        path.to_owned()
    } else {
        destination.to_owned() + "/" + path + ".csv"
    };

    let path = if folder {
        path + "/" + datatype.into() + ".csv"
    } else {
        path + datatype.into() + ".csv"
    };
    let file = File::create(path)
        .expect("There was an error creating the file.\nMake sure existing files do not exist.");
    let mut writer = BufWriter::new(file);
    match datatype {
        DataType::INT_GPS_SECONDMINUTEHOUR => {
            writer
                .write_all("Timestamp (ms), Seconds, Minutes, Hours\n".as_bytes())
                .unwrap();
        }
        DataType::INT_GPS_DAYMONTHYEAR => {
            writer
                .write_all("Timestamp (ms), Day, Month, Year\n".as_bytes())
                .unwrap();
        }
        _ => {
            writer
                .write_all(format!("Timestamp (ms), {}\n", datatype).as_bytes())
                .unwrap();
        }
    }
    writer
}

#[no_mangle]
#[allow(non_snake_case)]
pub extern "system" fn Java_com_mcmasterbaja_binary_1csv_BinaryToCSV_toCSV<'local>(
    mut env: JNIEnv<'local>,
    _class: JClass,
    file_name: JString,
    destination: JString,
    folder: jboolean,
) {
    let now = Instant::now();

    let file_name: String = env
        .get_string(&file_name)
        .expect("Java string broken")
        .into();
    let destination: String = env
        .get_string(&destination)
        .expect("Java string broken")
        .into();

    let folder = !matches!(folder, 0);

    let file = std::path::Path::new(&file_name);
    let packets = convert_to_32bit(&read_data(file));

    //filter_map
    let parse = |x: &[u32]| {
        let timestamp: u32 = x[0] >> 6;
        let datatype: u8 = (x[0] & 0x3F) as u8;

        if datatype >= 45 {
            println!("Invalid datatype: {}", datatype);
            return None;
        }
        let datatype: DataType = TryFrom::try_from(datatype).unwrap();

        let data = match datatype {
            DataType::INT_GPS_LAT | DataType::INT_GPS_LON => None,
            DataType::F_GPS_LATITUDE => Some(Data::FloatData(
                f32::from_bits(x[1]) % 100.0 / 60.0 + (f32::from_bits(x[1]) / 100.0).floor(),
            )),
            DataType::F_GPS_LONGITUDE => Some(Data::FloatData(
                (f32::from_bits(x[1]) % 100.0 / 60.0 + (f32::from_bits(x[1]) / 100.0).floor())
                    * -1.0,
            )),
            DataType::INT_GPS_TIME
            | DataType::INT_GPS_DAYMONTHYEAR
            | DataType::INT_GPS_SECONDMINUTEHOUR
            | DataType::INT_STRAIN3
            | DataType::INT_STRAIN4
            | DataType::INT_STRAIN5
            | DataType::INT_STRAIN6
            | DataType::INT_BATT_PERC
            | DataType::INT_SUS_TRAV_FL
            | DataType::INT_SUS_TRAV_FR
            | DataType::INT_SUS_TRAV_RL
            | DataType::INT_SUS_TRAV_RR => Some(Data::IntData(x[1])),

            DataType::INT_STRAIN1 => Some(Data::FloatData(
                4078.4 * (f32::from_bits(x[1]) / 1024.0) * 3.3 - 7009.2,
            )),
            DataType::INT_STRAIN2 => Some(Data::FloatData(
                5288.0 * (f32::from_bits(x[1]) / 1024.0) * 3.3 - 5000.0,
            )),
            DataType::F_RPM_PRIM | DataType::F_RPM_SEC => {
                let raw = f32::from_bits(x[1]);
                (raw < 15000.0).then_some(Data::FloatData(raw))
            }
            _ => {
                let raw = f32::from_bits(x[1]);
                Some(Data::FloatData(raw))
            }
        };

        data.map(|data| Packet {
            timestamp,
            datatype,
            data,
        })
    };
    let parsed_packets = packets.chunks(2).filter_map(parse);
    let mut utilised_types: HashMap<DataType, BufWriter<std::fs::File>> =
        HashMap::with_capacity(DATA_TYPE_LEN);
    let extension_index = file_name.find('.').unwrap();
    let path_no_extension = &file_name[0..extension_index];
    if folder {
        match std::fs::create_dir(path_no_extension) {
            Ok(_) => println!("Created folder: {}", path_no_extension),
            Err(e) => {
                if e.kind() == std::io::ErrorKind::AlreadyExists {
                    println!(
                        "Folder already exists: {}\nAttempting to delete and reparse",
                        path_no_extension
                    );
                    std::fs::remove_dir_all(path_no_extension).unwrap();
                    std::fs::create_dir(path_no_extension).unwrap();
                } else {
                    panic!("{}", e);
                }
            }
        }
    }

    for packet in parsed_packets {
        utilised_types.entry(packet.datatype).or_insert_with(|| {
            get_writer(&packet.datatype, &destination, path_no_extension, folder)
        });

        match packet.datatype {
            DataType::F_GPS_LATITUDE | DataType::F_GPS_LONGITUDE => {
                utilised_types
                    .get_mut(&packet.datatype)
                    .unwrap()
                    .write_all(format!("{},{:.7}\n", packet.timestamp, packet.data).as_bytes())
                    .unwrap();
            }

            DataType::INT_GPS_DAYMONTHYEAR | DataType::INT_GPS_SECONDMINUTEHOUR => {
                utilised_types
                    .get_mut(&packet.datatype)
                    .unwrap()
                    .write_all(
                        format!(
                            "{},{},{},{}\n",
                            packet.timestamp,
                            ((&packet.data & (0b11111111 << 16)).unwrap() >> 16),
                            ((&packet.data & (0b11111111 << 8)).unwrap() >> 8),
                            (&packet.data & (0b11111111)).unwrap()
                        )
                        .as_bytes(),
                    )
                    .unwrap();
            }
            _ => {
                utilised_types
                    .get_mut(&packet.datatype)
                    .unwrap()
                    .write_all(format!("{},{:.2}\n", packet.timestamp, packet.data).as_bytes())
                    .unwrap();
            }
        };
    }
    println!("×All Done×\nCompleted in {}ms", now.elapsed().as_millis());
}

#[no_mangle]
#[allow(non_snake_case)]
pub extern "system" fn Java_com_mcmasterbaja_binary_1csv_BinaryToCSV_bytesToCSV<'local>(
    mut env: JNIEnv<'local>,
    _class: JClass,
    jbytes: JByteArray<'local>,
    destination: JString,
    file_name: JString,
    folder: jboolean,
) {
    let now = Instant::now();

    let file_name: String = env
        .get_string(&file_name)
        .expect("Java string broken")
        .into();
    let destination: String = env
        .get_string(&destination)
        .expect("Java string broken")
        .into();

    let folder = !matches!(folder, 0);
    let bytes = env.convert_byte_array(jbytes).unwrap();

    let packets = convert_to_32bit(&bytes);
    //let packets = convert_to_32bit(&read_data(file));

    //filter_map
    let parse = |x: &[u32]| {
        let timestamp: u32 = x[0] >> 6;
        let datatype: u8 = (x[0] & 0x3F) as u8;

        if datatype >= 45 {
            println!("Invalid datatype: {}", datatype);
            return None;
        }
        let datatype: DataType = TryFrom::try_from(datatype).unwrap();

        let data = match datatype {
            DataType::INT_GPS_LAT | DataType::INT_GPS_LON => None,
            DataType::F_GPS_LATITUDE => Some(Data::FloatData(
                f32::from_bits(x[1]) % 100.0 / 60.0 + (f32::from_bits(x[1]) / 100.0).floor(),
            )),
            DataType::F_GPS_LONGITUDE => Some(Data::FloatData(
                (f32::from_bits(x[1]) % 100.0 / 60.0 + (f32::from_bits(x[1]) / 100.0).floor())
                    * -1.0,
            )),
            DataType::INT_GPS_TIME
            | DataType::INT_GPS_DAYMONTHYEAR
            | DataType::INT_GPS_SECONDMINUTEHOUR
            | DataType::INT_STRAIN3
            | DataType::INT_STRAIN4
            | DataType::INT_STRAIN5
            | DataType::INT_STRAIN6
            | DataType::INT_BATT_PERC
            | DataType::INT_SUS_TRAV_FL
            | DataType::INT_SUS_TRAV_FR
            | DataType::INT_SUS_TRAV_RL
            | DataType::INT_SUS_TRAV_RR => Some(Data::IntData(x[1])),

            DataType::INT_STRAIN1 => Some(Data::FloatData(
                4078.4 * (f32::from_bits(x[1]) / 1024.0) * 3.3 - 7009.2,
            )),
            DataType::INT_STRAIN2 => Some(Data::FloatData(
                5288.0 * (f32::from_bits(x[1]) / 1024.0) * 3.3 - 5000.0,
            )),
            DataType::F_RPM_PRIM | DataType::F_RPM_SEC => {
                let raw = f32::from_bits(x[1]);
                (raw < 15000.0).then_some(Data::FloatData(raw))
            }
            _ => {
                let raw = f32::from_bits(x[1]);
                Some(Data::FloatData(raw))
            }
        };

        data.map(|data| Packet {
            timestamp,
            datatype,
            data,
        })
    };
    let parsed_packets = packets.chunks(2).filter_map(parse);
    let mut utilised_types: HashMap<DataType, BufWriter<std::fs::File>> =
        HashMap::with_capacity(DATA_TYPE_LEN);
    let extension_index = file_name.find('.').unwrap();
    let path_no_extension = destination.to_string() + "/" + &file_name[0..extension_index];
    if folder {
        match std::fs::create_dir(&path_no_extension) {
            Ok(_) => println!("Created folder: {}", path_no_extension),
            Err(e) => {
                if e.kind() == std::io::ErrorKind::AlreadyExists {
                    println!(
                        "Folder already exists: {}\nAttempting to delete and reparse",
                        path_no_extension
                    );
                    std::fs::remove_dir_all(&path_no_extension).unwrap();
                    std::fs::create_dir(&path_no_extension).unwrap();
                } else {
                    panic!("{}", e);
                }
            }
        }
    }

    for packet in parsed_packets {
        utilised_types.entry(packet.datatype).or_insert_with(|| {
            get_writer(&packet.datatype, &destination, &path_no_extension, folder)
        });

        match packet.datatype {
            DataType::F_GPS_LATITUDE | DataType::F_GPS_LONGITUDE => {
                utilised_types
                    .get_mut(&packet.datatype)
                    .unwrap()
                    .write_all(format!("{},{:.7}\n", packet.timestamp, packet.data).as_bytes())
                    .unwrap();
            }

            DataType::INT_GPS_DAYMONTHYEAR | DataType::INT_GPS_SECONDMINUTEHOUR => {
                utilised_types
                    .get_mut(&packet.datatype)
                    .unwrap()
                    .write_all(
                        format!(
                            "{},{},{},{}\n",
                            packet.timestamp,
                            ((&packet.data & (0b11111111 << 16)).unwrap() >> 16),
                            ((&packet.data & (0b11111111 << 8)).unwrap() >> 8),
                            (&packet.data & (0b11111111)).unwrap()
                        )
                        .as_bytes(),
                    )
                    .unwrap();
            }
            _ => {
                utilised_types
                    .get_mut(&packet.datatype)
                    .unwrap()
                    .write_all(format!("{},{:.2}\n", packet.timestamp, packet.data).as_bytes())
                    .unwrap();
            }
        };
    }
    println!("×All Done×\nCompleted in {}ms", now.elapsed().as_millis());
}
