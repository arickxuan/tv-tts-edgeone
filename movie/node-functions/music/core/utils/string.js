

export function removeBracketContent(text) {
    // 分别匹配不同类型的括号
    const patterns = [
        /\([^)]*\)/g,    // 英文圆括号 ()
        /（[^）]*）/g,    // 中文圆括号 （）
        /\[[^\]]*\]/g,   // 英文方括号 []
        /【[^】]*】/g,    // 中文方括号 【】
        /\{[^\}]*\}/g,   // 英文花括号 {}
        /\{[^}]*\}/g     // 中文花括号 {}
    ];

    patterns.forEach(pattern => {
        text = text.replace(pattern, '');
    });

    // console.log("text",text)

    return text;
}
// 创建清理标题的辅助函数
export const getCleanTitle = (title) =>
    title ? removeBracketContent(title).trim().toLowerCase() : '';


export function mergeSongList(list, s3arr) {
    let { songList } = list;
    let newList = [];

    // 第一部分：更新匹配歌曲的URL
    songList.forEach(song => {
        const cleanSongTitle = getCleanTitle(song.title);

        const matchingS3Item = s3arr.find(s3Item => {
            const cleanS3Title = getCleanTitle(s3Item.title);
            return cleanSongTitle === cleanS3Title;
        });

        if (matchingS3Item) {
            // console.log("matchingS3Item",matchingS3Item)
            song.url = matchingS3Item.url;
            newList.push(song);
        }else{
            // console.log("notContains", song.title)
            newList.push(song);
        }
    });

    // 第二部分：添加缺失的歌曲
    s3arr.forEach(s3Item => {
        const cleanS3Title = getCleanTitle(s3Item.title);

        const songExists = songList.some(song =>
            getCleanTitle(song.title) === cleanS3Title
        );

        if (!songExists) {
            // console.log("notContains", s3Item.Title);
            newList.push({
                title: s3Item.title,
                name: s3Item.name || s3Item.title,
                singer: s3Item.singer,
                singers: s3Item.singer.split("、"),
                url: s3Item.url
            });
        }
    });

    console.log("songList",songList.length)
    console.log("s3arr",s3arr.length)
    console.log("newList",newList.length)
    list.songList = newList;

    return list;
}

export function syncSongListByQQ(list, sbArr,sid,uid) {
    let { songList } = list;
    let newList = [];

    // 第一部分：更新匹配歌曲的URL
    songList.forEach(song => {
        const cleanSongTitle = getCleanTitle(song.title);
        const matchingS3Item = sbArr.find(item => {
            const cleanS3Title = getCleanTitle(item.title);
            return cleanSongTitle === cleanS3Title;
        });

        if (matchingS3Item) {
        }else{
            // console.log("notContains", song.title)
            let newSong = {
                sid:sid,
                uid:uid,
                title: song.title,
                name: cleanSongTitle,
                album: song.album,
                qq_id: song.mid,
                // singers: JSON.stringify(song.singers),
                singers: song.singers,
            }
            newList.push(newSong);
        }
    });

    return newList;
}

export function syncSongListByNetease(songList, sbArr,sid,uid) {
    let newList = [];

    // 第一部分：更新匹配歌曲的URL
    songList.forEach(song => {
        const cleanSongTitle = getCleanTitle(song.title);
        const matchingS3Item = sbArr.find(item => {
            const cleanS3Title = getCleanTitle(item.title);
            return cleanSongTitle === cleanS3Title;
        });

        if (matchingS3Item) {
        }else{
            // console.log("notContains", song.title)
            let newSong = {
                sid:sid,
                uid:uid,
                title: song.title,
                name: cleanSongTitle,
                album: song.album,
                netease_id: song.netease_id,
                // singers: JSON.stringify(song.singers),
                singers: song.singers,
            }
            newList.push(newSong);
        }
    });

    return newList;
}