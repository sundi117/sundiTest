package com.wss.sparkruntest

import cn.hutool.core.date.DateUtil
import cn.hutool.core.io.FileUtil
import org.apache.spark.sql.types.{StringType, StructField, StructType}
import org.apache.spark.sql.{DataFrame, Row, SparkSession}

import scala.util.control.Breaks._

object SparkDemo2 {

  var dfAll: DataFrame = _


  def main(args: Array[String]): Unit = {

    val timer = DateUtil.timer

    val sparkSession = SparkSession.builder
      .master("local[*]")
      .appName("sundiSpark")
      .getOrCreate()


    val fromCsvPath: String = "D:\\data\\csv\\sundi.csv"
    val toPaquetPath: String = "D:\\data\\parquet\\sundi.parquet"

    val toCsvPath: String = "D:\\data\\csv\\sundi4.csv"
    val fromPaquetPath: String = "D:\\data\\parquet\\sundi.parquet"

    val csvRootPath = "D:\\data\\csv"

    getDataByCondition1(sparkSession, csvRootPath, 0)

    //    parquetToCSV(toCsvPath, fromPaquetPath);
    //    csvToParquet(csvPath, paquetPath)


    System.out.println("耗时为：" + (timer.interval / (1000.toDouble)).toDouble + "秒")
  }


  def csvToParquet(sparkSession: SparkSession, csvPath: String, paquetPath: String): Unit = {

    val sparkcontext = sparkSession.sparkContext

    /*    val schema = StructType(
          Array(
            StructField("primary_key", StringType, true),
            StructField("user_name", StringType, true)
          )
        )*/

    val df = sparkSession.read.option("header", "true").csv(csvPath)
    df.show(20)
    df.write.parquet(paquetPath)
  }

  def parquetToCSV(sparkSession: SparkSession, csvPath: String, paquetPath: String): Unit = {
    val sparkcontext = sparkSession.sparkContext

    /*    val schema = StructType(
          Array(
            StructField("primary_key", StringType, true),
            StructField("user_name", StringType, true)
          )
        )*/

    val df = sparkSession.read.option("header", "true").parquet(paquetPath)
    df.show(20)
    df.write.csv(csvPath)
  }


  def getDataByCondition1(sparkSession: SparkSession, path: String, colNum: Int): Unit = {
    val sparkcontext = sparkSession.sparkContext

    val ls = FileUtil.ls(path)
    var filepath = ""
    //    val dfAll = sparkSession.createDataFrame(sparkcontext.emptyRDD[Row] , )
    var index = 1
    for (file <- ls) {

      if (FileUtil.isFile(file)) {
        System.out.println(file.getAbsolutePath)
        filepath = file.getAbsolutePath
        var df = sparkSession.read.option("header", "false").csv(filepath)

        breakable {
          if (index == 1) {
            dfAll = df
            break
          } else {
            dfAll = dfAll union (df)
          }
        }
        dfAll.show(20)
      }
      index += 1
    }

    val rddAll = dfAll.rdd
    val rddAllNew = rddAll.map(row => (row(colNum), 1)).groupBy(_._1).map(r => r._1.asInstanceOf[Row])
//    import sparkSession.implicits._
//    rddAllNew.toDF("a1","a2")

    val schema = StructType(
      Array(
        StructField("primary_key", StringType, true)
        //        StructField("user_name", StringType, true)
      )
    )

    val df2 = sparkSession.createDataFrame(rddAllNew, schema)
    val toCsvPath2: String = "D:\\data\\csv\\sundiAll.csv"
    df2.write.csv(toCsvPath2)


  }


  def test2(): Unit = {
    /* 同类合并、计算 */

    /*
        val source = Source.fromFile("E:test.txt").getLines.toArray
        val sourceRDD = sc.parallelize(source)                                  /* spark单机读取数据 */
        sourceRDD.map {
          line =>
            val lines = line.split(",")                                         /* 拆分数据 */
            (s"${lines(0)}", s"${lines(1)},${lines(2)},${lines(3)}")            /* 找出同样的数据为K，需要进行计算的为V，拼成map */
        }.groupByKey.map {                                                      /* 分组，最重要的就是这，同类的数据分组到一起，后面只需要计算V了 */
          case (k, v) =>
            var a, b, c = 0                                                     /* 定义几个存数据的变量，恩，这很java，一般scala中很少见到var */
            v.foreach {                                                         /* 遍历需要计算的V  */
              x =>
                val r = x.split(",")                                            /* 将V拆分 */
                a += r(0).toInt                                                 /* 计算 */
                b += r(1).toInt
                c += r(2).toInt
            }
            s"$k,$a,$b,$c"                                                      /* 拼字符串，返回数据 */
        }.foreach(println)

    */


  }


}

//  代码补充
//    val rdd = spark.sparkContext.textFile("D:\\data\\csv\\sundi.csv")
/*
    val writer = CsvUtil.getWriter("D:\\data\\csv\\sundiDistinct.csv", CharsetUtil.CHARSET_UTF_8)
    rdd.map {
      r =>
        r
    }.distinct().foreach(println)
    writer.close()
    */


/*    dfAll.map {
      row => (row(colNum), 1)
    }.groupByKey(_._1)
    */

