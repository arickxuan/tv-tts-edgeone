



1. 获取所有杂志接口。magType=1-4
https://ktx.cn/v3/api/magazine/all_mag_page_3?pageNo=0&magType=1&pageSize=10

```
{
    "status": 1,
    "msg": "success",
    "pageInfo": {
        "pageNo": 0,
        "pageSize": 10,
        "pageCount": 47,
        "rsCount": 464,
        "nextAble": true,
        "prevAble": false
    },
    "magList": [
        {
            "id": 720,
            "title": "当“超级中学生”抢跑进入大厂",
            "subtitle": "A时代，天才的赛道已经变了",
            "cover": "cover/2026/4/22/1776826503052.jpg",
            "author": "作者",
            "createTime": 1776826503000,
            "pubTime": 1777158000000,
            "releaseDate": 1777305600000,
            "publish": 1,
            "volYear": 11,
            "vol": 696,
            "isfree": 0,
            "articleTitle": "极端天气频发，航班变得越来越颠了||韩国史上最高遗产税，逼得三星继承者们疯狂凑钱||如何在最后50天提升高考数学成绩？只需多对一道题||一场侵权风波背后的“乐坛之困”",
            "price": 600,
            "isBuyMag": 0,
            "isNew": 1,
            "zipFile": "magzip/720.zip",
            "magType": 1,
            "isEnd": 1,
            "buyUserCount": 5052,
            "originalPrice": 600,
            "isHasCoupon": 0,
            "readPercent": 0,
            "isFavorite": null,
            "paidSubject": null,
            "articleList": null,
            "isPdfType": 0,
            "magStyle": "OFFICIAL",
            "publishType": "PUBLISH",
            "coverUrl": "https://oss.ktx.cn/cover/2026/4/22/1776826503052.jpg?x-oss-process=style/magcover",
            "createTimeFormat": "2026-04-22 10:55:03",
            "pubTimeFormat": "2026-04-26 07:00:00",
            "releaseDateFormat": "2026-04-28",
            "zipUrl": "https://oss.ktx.cn/magzip/720.zip"
        }
        
    ],
    "years": null
}
```

2. 杂志详情
curl 'https://ktx.cn/v3/api/magazine/get_mag?magId=561&ktxToken=' \
-H 'channel: ios' \
-H 'User-Agent: VistaKTX/3.7.8 (iPhone X;iOS16.7.11)' 

```

{"status":1,"msg":"success","mag":{"id":540,"title":"奇点","subtitle":"让我们一起观察，AI将如何 改变世界","cover":"articleimg/2022/08/29/1661747633174.jpg","author":"作者","createTime":1661745911000,"pubTime":1673511518000,"releaseDate":1661702400000,"publish":1,"volYear":0,"vol":0,"isfree":0,"articleTitle":"","price":2990,"isBuyMag":0,"isNew":0,"zipFile":"magzip/540.zip","magType":4,"isEnd":1,"buyUserCount":12497,"originalPrice":2990,"isHasCoupon":null,"readPercent":0,"isFavorite":0,"paidSubject":{"id":540,"intro":"让我们一起观察，AI将如何 改变世界","icon":"formui/2022/08/29/1661755336991.png","iconActive":"formui/2022/08/29/1661755340294.png","banner":"formui/2022/08/29/1661747666056.jpg","iconUrl":"https://oss.ktx.cn//formui/2022/08/29/1661755336991.png","bannerUrl":"https://oss.ktx.cn//formui/2022/08/29/1661747666056.jpg","iconActiveUrl":"https://oss.ktx.cn//formui/2022/08/29/1661755340294.png"},"articleList":null,"isPdfType":null,"isPdf":0,"pdfPublish":0,"article1":null,"article2":null,"article3":null,"article4":null,"publishType":"PUBLISH","magStyle":"PAID_SUBJECT","coverUrl":"https://oss.ktx.cn/articleimg/2022/08/29/1661747633174.jpg","createTimeFormat":"2022-08-29 12:05:11","futitle":"奇点","pubTimeFormat":"2023-01-12 16:18:38","releaseDateFormat":"2022-08-29","zipUrl":"https://oss.ktx.cn/magzip/540.zip","name":null,"fuId":540},"article1":null,"article2":null,"article3":null,"article4":null}
```

3. 获取杂志目录 magId 上一步传递的
curl 'https://ktx.cn/v3/api/magazine/mag_column_detail?magId=719' \
-H 'channel: ios' \
-H 'User-Agent: VistaKTX/3.7.8 (iPhone X;iOS16.7.11)' 

```
{
  "status": 1,
  "msg": "success",
  "columnList": [
    
    {
      "id": 6963,
      "magId": 720,
      "columnTypeId": 83,
      "title": "往前翻2026",
      "position": 12,
      "publish": 1,
      "articleCount": 1,
      "cover": "tmp/columnpic/2026/03/04/1772599307386.png",
      "coverWidth": null,
      "coverHeight": null,
      "publishType": "PUBLISH",
      "coverUrl": "https://oss.ktx.cn//tmp/columnpic/2026/03/04/1772599307386.png",
      "name": null,
      "fuId": 6963,
      "futitle": "往前翻2026",
      "articles": [
        {
          "id": 30042,
          "title": "往前翻｜春天就是这么来的",
          "cover": "cover/2026/04/22/1776827996534.jpg",
          "subtitle": "",
          "columnId": 6963,
          "publish": 1,
          "position": 0,
          "articleType": 2,
          "columnCover": "",
          "columnContent": "",
          "isOpenInColumn": 0,
          "magId": 720,
          "column": {
            "id": 6963,
            "magId": 720,
            "columnTypeId": 83,
            "title": "往前翻2026",
            "position": 12,
            "publish": 1,
            "articleCount": 1,
            "cover": null,
            "coverWidth": null,
            "coverHeight": null,
            "publishType": "PUBLISH",
            "coverUrl": "https://oss.ktx.cn//null",
            "name": null,
            "fuId": 6963,
            "futitle": "往前翻2026",
            "articles": null,
            "columnTypeData": {
              "id": 83,
              "title": "往前翻2026",
              "key": null,
              "publish": 1,
              "position": 51,
              "menuIcon": "tmp/columnpic/2026/03/04/1772599307386.png",
              "labelIcon": "tmp/columnpic/2026/03/04/1772599310993.png",
              "publishType": "PUBLISH",
              "labelIconUrl": "https://oss.ktx.cn//tmp/columnpic/2026/03/04/1772599310993.png",
              "menuIconUrl": "https://oss.ktx.cn//tmp/columnpic/2026/03/04/1772599307386.png"
            }
          },
          "articleImgs": null,
          "isFree": 0,
          "favoriteCount": 0,
          "likeCount": 0,
          "favCount": 0,
          "isLike": null,
          "isFav": null,
          "commentCount": 0,
          "author": "",
          "mag": null,
          "isFavorite": null,
          "isBuyArticle": 0,
          "isPreview": 0,
          "top": 0,
          "publishTime": 1776828475000,
          "isFreeMag": 0,
          "viewCount": null,
          "shareCount": null,
          "featuredContent": null,
          "isRead": 0,
          "hasAudio": 0,
          "columnCoverUrl": "https://vktx.oss-cn-hangzhou.aliyuncs.com/icon/empty_new.png",
          "articleStyle": "OLD_PICTURE",
          "coverUrl": "https://oss.ktx.cn/cover/2026/04/22/1776827996534.jpg",
          "hasColumnCover": 0
        }
      ],
      "columnTypeData": {
        "id": 83,
        "title": "往前翻2026",
        "key": null,
        "publish": 1,
        "position": 51,
        "menuIcon": "tmp/columnpic/2026/03/04/1772599307386.png",
        "labelIcon": "tmp/columnpic/2026/03/04/1772599310993.png",
        "publishType": "PUBLISH",
        "labelIconUrl": "https://oss.ktx.cn//tmp/columnpic/2026/03/04/1772599310993.png",
        "menuIconUrl": "https://oss.ktx.cn//tmp/columnpic/2026/03/04/1772599307386.png"
      }
    }
  ],
  "mag": {
    "id": 720,
    "title": "当“超级中学生”抢跑进入大厂",
    "subtitle": "A时代，天才的赛道已经变了",
    "cover": "cover/2026/4/22/1776826503052.jpg",
    "author": "作者",
    "createTime": 1776826503000,
    "pubTime": 1777158000000,
    "releaseDate": 1777305600000,
    "publish": 1,
    "volYear": 11,
    "vol": 696,
    "isfree": 0,
    "articleTitle": "极端天气频发，航班变得越来越颠了||韩国史上最高遗产税，逼得三星继承者们疯狂凑钱||如何在最后50天提升高考数学成绩？只需多对一道题||一场侵权风波背后的“乐坛之困”",
    "price": 600,
    "isBuyMag": 0,
    "isNew": 0,
    "zipFile": "magzip/720.zip",
    "magType": 1,
    "isEnd": 1,
    "buyUserCount": 5052,
    "originalPrice": 600,
    "isHasCoupon": 0,
    "readPercent": 0,
    "isFavorite": 0,
    "paidSubject": null,
    "articleList": null,
    "isPdfType": 0,
    "publishType": "PUBLISH",
    "magStyle": "OFFICIAL",
    "coverUrl": "https://oss.ktx.cn/cover/2026/4/22/1776826503052.jpg?x-oss-process=style/magcover",
    "createTimeFormat": "2026-04-22 10:55:03",
    "pubTimeFormat": "2026-04-26 07:00:00",
    "releaseDateFormat": "2026-04-28",
    "zipUrl": "https://oss.ktx.cn/magzip/720.zip"
  },
  "isBuyMag": 0,
  "isFree": 0,
  "preface": null,
  "topArticlesOne": [],
  "topArticlesTwo": []
}
```

magType=4 时使用
curl 'https://ktx.cn/v3/api/article/get_article_list_by_mag?magId=540&pageSize=10&sort=TIME_DESC&pageNo=0' \
-H 'channel: ios' \
-H 'User-Agent: VistaKTX/3.7.8 (iPhone X;iOS16.7.11)' 

```
{"status":1,"msg":"success","pageInfo":{"pageNo":0,"pageSize":1,"pageCount":31,"rsCount":31,"nextAble":true,"prevAble":false},"articles":[{"id":30061,"title":"当“超级中学生”抢跑进入大厂","cover":"cover/2026/04/24/1777022089439.jpg","subtitle":"","columnId":6965,"publish":1,"position":0,"articleType":1,"columnCover":"","columnContent":"当经验成为门槛时，人们拼命积累，而当所有人都有经验时，经验又开始失效。","isOpenInColumn":0,"magId":720,"column":null,"articleImgs":null,"isFree":1,"favoriteCount":11,"likeCount":11,"favCount":0,"isLike":null,"isFav":null,"commentCount":0,"author":"","mag":null,"isFavorite":null,"isBuyArticle":0,"isPreview":0,"top":0,"publishTime":1777022094000,"isFreeMag":0,"viewCount":null,"shareCount":null,"featuredContent":null,"isRead":0,"hasAudio":1,"columnCoverUrl":"https://vktx.oss-cn-hangzhou.aliyuncs.com/icon/empty_new.png","articleStyle":"ARTICLE","coverUrl":"https://oss.ktx.cn/cover/2026/04/24/1777022089439.jpg","hasColumnCover":0}]}
```

4. 文章内容

curl 'https://ktx.cn/v3/api/article/article_detail2?articleId=19849' \
-H 'channel: ios' \
-H 'User-Agent: VistaKTX/3.7.8 (iPhone X;iOS16.7.11)' 

```
{
  "status": 1,
  "msg": "success",
  "article": {
    "id": 24761,
    "title": "上影节闭幕，胡歌、大鹏共享影帝“双黄蛋”",
    "squareCover": "",
    "firstCover": "firstCover/2023/06/19/1687168213246.jpg",
    "subtitle": "",
    "contentShort": "<section style=\"line-height: 1.9; padding: 0px; box-sizing: border-box; text-align: justify;\">333</section><p><br/></p>",
    "content": "<p>123</p>",
    "createTime": 1687168088000,
    "magId": 546,
    "columnId": 0,
    "position": 978,
    "publish": 1,
    "author": "",
    "favoriteCount": 15,
    "likeCount": 15,
    "favCount": 0,
    "isLike": 0,
    "isFav": 0,
    "commentCount": 5,
    "articleType": 1,
    "isFree": 1,
    "columnSecond": "",
    "columnCover": "",
    "columnContent": "                                 ",
    "isOpenInColumn": 0,
    "reporterId": 0,
    "publishTime": 1687168088000,
    "hasAudio": 1,
    "articleAudioId": 8198,
    "reporter": null,
    "reporters": [],
    "mag": {
      "id": 546,
      "title": "贵圈放大镜",
      "subtitle": "换个角度，锐评泛文娱热点",
      "cover": "articleimg/2022/09/27/1664275934456.jpg",
      "author": "作者",
      "createTime": 1664275726000,
      "pubTime": 1689303297000,
      "releaseDate": 1664208000000,
      "publish": 1,
      "volYear": 0,
      "vol": 0,
      "isfree": 1,
      "articleTitle": "",
      "price": 0,
      "isBuyMag": 0,
      "isNew": 0,
      "zipFile": "magzip/546.zip",
      "magType": 4,
      "isEnd": 1,
      "buyUserCount": 12809,
      "originalPrice": 0,
      "isHasCoupon": null,
      "readPercent": 0,
      "isFavorite": null,
      "paidSubject": null,
      "articleList": null,
      "isPdfType": null,
      "isPdf": 0,
      "pdfPublish": 0,
      "article1": null,
      "article2": null,
      "article3": null,
      "article4": null,
      "magStyle": "PAID_SUBJECT",
      "publishType": "PUBLISH",
      "coverUrl": "https://oss.ktx.cn/articleimg/2022/09/27/1664275934456.jpg",
      "futitle": "贵圈放大镜",
      "createTimeFormat": "2022-09-27 18:48:46",
      "pubTimeFormat": "2023-07-14 10:54:57",
      "releaseDateFormat": "2022-09-27",
      "zipUrl": "https://oss.ktx.cn/magzip/546.zip",
      "name": null,
      "fuId": 546
    },
    "isBuyArticle": 0,
    "articleImgs": [],
    "column": null,
    "isFavorite": 0,
    "isFreeMag": null,
    "top": 0,
    "isPreview": 1,
    "featuredContent": null,
    "squareCoverUrl": "",
    "columnCoverUrl": "https://vktx.oss-cn-hangzhou.aliyuncs.com/icon/empty_new.png",
    "publishType": "PUBLISH",
    "articleStyle": "ARTICLE",
    "firstCoverUrl": "https://oss.ktx.cn/firstCover/2023/06/19/1687168213246.jpg",
    "coverUrl": "https://oss.ktx.cn/cover/2023/06/19/1687168063036.jpg"
  },
  "productPriceYear": {
    "id": 4,
    "price": 18800,
    "originalPrice": 178000,
    "content": "全年购买",
    "info": "",
    "name": "全年购买",
    "productStyle": "YEAR",
    "productType": 4,
    "productValue": 0
  },
  "recommentMag": {
    "id": 546,
    "title": "贵圈放大镜",
    "subtitle": "换个角度，锐评泛文娱热点",
    "cover": "articleimg/2022/09/27/1664275934456.jpg",
    "author": "作者",
    "createTime": 1664275726000,
    "pubTime": 1689303297000,
    "releaseDate": 1664208000000,
    "publish": 1,
    "volYear": 0,
    "vol": 0,
    "isfree": 1,
    "articleTitle": "",
    "price": 0,
    "isBuyMag": 0,
    "isNew": 0,
    "zipFile": "magzip/546.zip",
    "magType": 4,
    "isEnd": 1,
    "buyUserCount": 12809,
    "originalPrice": 0,
    "isHasCoupon": null,
    "readPercent": 0,
    "isFavorite": null,
    "paidSubject": null,
    "articleList": null,
    "isPdfType": null,
    "isPdf": 0,
    "pdfPublish": 0,
    "article1": null,
    "article2": null,
    "article3": null,
    "article4": null,
    "magStyle": "PAID_SUBJECT",
    "publishType": "PUBLISH",
    "coverUrl": "https://oss.ktx.cn/articleimg/2022/09/27/1664275934456.jpg",
    "futitle": "贵圈放大镜",
    "createTimeFormat": "2022-09-27 18:48:46",
    "pubTimeFormat": "2023-07-14 10:54:57",
    "releaseDateFormat": "2022-09-27",
    "zipUrl": "https://oss.ktx.cn/magzip/546.zip",
    "name": null,
    "fuId": 546
  },
  "shareUrl": "",
  "articleAudio": {
    "id": 8198,
    "articleId": 24761,
    "magId": 546,
    "articleTitle": "上影节闭幕，胡歌、大鹏共享影帝“双黄蛋”",
    "duration": 383000,
    "createTime": 1687168166000,
    "cover": "cover/2023/06/19/1687168063036.jpg",
    "audioPath": "mp3/2023/6/19/1687168764703.mp3",
    "articlePosition": null,
    "articlePublish": 1,
    "status": 1,
    "audioUrl": "https://oss.ktx.cn//mp3/2023/6/19/1687168764703.mp3",
    "coverUrl": "https://oss.ktx.cn/cover/2023/06/19/1687168063036.jpg"
  },
  "articleAudioVoice": null
}
```