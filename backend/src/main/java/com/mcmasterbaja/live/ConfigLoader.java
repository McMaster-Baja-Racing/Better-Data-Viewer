// using Jackson to parse YAML

import java.io.File;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.dataformat.yaml.YAMLFactory;


public class ConfigLoader {
    public static AppConfig loadConfig(String filePath) throws Exception {
        ObjectMapper mapper = new ObjectMapper(new YAMLFactory()); 
        return mapper.readValue(new File(filePath), AppConfig.class)
    }
}
