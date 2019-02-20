package hutool_poi;

import cn.hutool.core.text.csv.CsvUtil;
import cn.hutool.core.text.csv.CsvWriter;
import cn.hutool.core.util.CharsetUtil;
import cn.hutool.core.util.RandomUtil;

public class CSVTool {
    public static void main(String[] args) {
        String filePath = "D:\\data\\csv\\sundi3.csv";
        writeToCSV(filePath);

    }


    /**
     * @Author sundi
     * @Description 写入CSV 范例
     * @Date 2019/2/20  23:43
     * @Param filePath
     * @Throws
     * @Return void
     */
    public static void writeToCSV(String filePath) {
        CsvWriter writer = CsvUtil.getWriter(filePath, CharsetUtil.CHARSET_UTF_8);

        for (int i = 0; i < 100000; i++) {
            String[] strs = new String[2];
            strs[0] = String.valueOf(RandomUtil.randomInt(999999));
            strs[1] = String.valueOf(RandomUtil.randomString(2));
            writer.write(strs);
        }
        System.out.println("导出完毕");
        writer.close();
    }


}
