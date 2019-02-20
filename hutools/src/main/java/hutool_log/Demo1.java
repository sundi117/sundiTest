package hutool_log;

import cn.hutool.log.Log;
import cn.hutool.log.LogFactory;
import cn.hutool.log.level.Level;

public class Demo1 {

    public static void main(String[] args) {

        Log log = LogFactory.get();

        log.debug("This is {} log", Level.DEBUG);
        log.info("This is {} log", Level.INFO);
        log.warn("This is {} log", Level.WARN);

        Exception e = new Exception("test Exception");
        log.error(e, "This is {} log", Level.ERROR);


    }
}
