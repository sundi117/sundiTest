package hutool_poi;

import cn.hutool.core.io.FileUtil;
import cn.hutool.poi.excel.ExcelReader;
import cn.hutool.poi.excel.ExcelUtil;
import cn.hutool.poi.excel.ExcelWriter;

import java.io.File;

public class ExcelTool {
    public static void main(String[] args) {

        //1、 从文件中读取Excel为ExcelReader

        File[] fs = FileUtil.ls("D:\\data\\excel\\");
        ExcelReader reader = null;
        ExcelWriter writer = ExcelUtil.getWriter("D:\\data\\excel\\sundi.xlsx");
        ;
        for (File f : fs) {
            String path = f.getAbsoluteFile().toString();
            reader = ExcelUtil.getReader(path);
            writer.write(reader.read());
        }
//        System.out.println(fs.toString());

        writer.close();
        reader.close();

//        System.out.println( reader.read()  );
//        ExcelWriter writer = ExcelUtil.getWriter("D:\\data\\excel\\sundi.xlsx");


    }


}
