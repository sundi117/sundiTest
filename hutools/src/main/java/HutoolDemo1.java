import cn.hutool.core.io.FileUtil;
import cn.hutool.core.lang.Console;
import cn.hutool.core.text.csv.*;
import cn.hutool.core.util.CharsetUtil;
import com.github.stuxuhai.jpinyin.PinyinException;
import com.github.stuxuhai.jpinyin.PinyinHelper;

import java.util.List;
import java.util.Scanner;

public class HutoolDemo1 {

    public static void main(String[] args) {

        readCSV();
    }


    public static void readCSV() {
        CsvReader reader = CsvUtil.getReader();
//从文件中读取CSV数据
        Scanner input = new Scanner(System.in);
        System.out.println("请你输入需要读取的Csv文件路径，形如  C:\\Users\\Administrator\\Desktop\\sundiCSVDemo1.csv");
        String pathInput = input.next();
        CsvData data = reader.read(FileUtil.file(pathInput), CharsetUtil.CHARSET_GBK);
        List<CsvRow> rows = data.getRows();
//遍历行
        for (CsvRow csvRow : rows) {
            //getRawList返回一个List列表，列表的每一项为CSV中的一个单元格（既逗号分隔部分）
//            Console.log(csvRow.getRawList());
            System.out.println(csvRow.getRawList());
        }
    }


    public static void readfromCSVAndWrite() {
        CsvReader reader = CsvUtil.getReader();
        //指定路径和编码
        CsvWriter writer = CsvUtil.getWriter("C:\\Users\\Administrator\\Desktop\\sundiCSVDemo1.csv", CharsetUtil.CHARSET_UTF_8);
        //按行写出
        writer.write(
                new String[]{"a1", "b1", "c1"},
                new String[]{"a2", "b2", "c2"},
                new String[]{"a3", "b3", "c3"}
        );
        //从文件中读取CSV数据
        CsvData data = reader.read(FileUtil.file("C:\\Users\\Administrator\\Desktop\\sundiCSVDemo1.csv"), CharsetUtil.CHARSET_GBK);
        List<CsvRow> rows = data.getRows();
        //遍历行
        for (CsvRow csvRow : rows) {
            //getRawList返回一个List列表，列表的每一项为CSV中的一个单元格（既逗号分隔部分）
            Console.log(csvRow.getRawList());
        }
    }


    public static void pinyinTest() {
        try {
            String s = PinyinHelper.convertToPinyinString("水向东流，时间怎么偷", " ");
            System.out.println(s);
        } catch (PinyinException e) {
            e.printStackTrace();
        }
    }

}
