package hutool_core;

import cn.hutool.core.io.FileUtil;

import java.util.regex.Pattern;

public class IODemo1 {

    private static Pattern FILE_NAME_INVALID_PATTERN_WIN = Pattern.compile("[\\\\/:*?\"<>|]");

    public static void main(String[] args) {
        System.out.println(  FileUtil.isWindows()  );


    }

}
