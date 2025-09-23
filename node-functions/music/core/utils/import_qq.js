
export async function getList(id, isProxy) {

    let proxy = "https://cors.zme.ink/"
    let url = "https://c.y.qq.com/v8/fcg-bin/fcg_v8_playlist_cp.fcg?newsong=1&id=" + id + "&format=json&inCharset=GB2312&outCharset=utf-8"
    if (isProxy) {
        url = proxy + url
    }

    let re = await fetch(url)
    let js = await re.json()

    let list = Array.from(js.data.cdlist).flatMap(u => u.songlist).map(m => {
        let item = { title: m.title, name: m.name, album: m.album.title, singers: Array.from(m.singer).map(c => c.name) }
        return item
    })

    //Array.from(data.data.cdlist).flatMap(u => u.songlist).map(m => m.name + " - " + Array.from(m.singer).map(c => c.name).reduce((s1, s2) => s1 + "," + s2)).reduce((s1, s2) => s1 + '\n' + s2)

    return { songListName: js.data.cdlist[0].dissname, songListId: "qq_" + id, nickname: js.data.cdlist[0].nickname, logo: js.data.cdlist[0].logo, headurl: js.data.cdlist[0].headurl, songlist: list }



}

export async function downloadMusic(id, type, qua = "standard") {
    // https://88.lxmusic.xn--fiqs8s/lxmusicv3/url/tx/576366/320k
    // kw/kg/tx/wy/mg/local
    let cpy = {
        qq: tx,
        kugou: kg,
        kuwo: kw,
        wangyi: wy,
        migu: mg,
    }
    // 128k / 320k / flac / flac24bit
    let quality = {
        low: "128k",
        high: "flac",
        standard: "320k",
        super: "flac24bit"
    }
    let url = `https://88.lxmusic.xn--fiqs8s/lxmusicv3/url/${cpy[type]}/${id}/${quality[qua]}`
    let re = await fetch(url)

    return re

}

export async function searchMusicGd(title, type) {
    // https://music-api.gdstudio.xyz/api.php?types=search&source=[MUSIC SOURCE]&name=[KEYWORD]&count=[PAGE LENGTH]&pages=[PAGE NUM]
    // netease（默认）、tencent、tidal、spotify、ytmusic、qobuz、joox、deezer、migu、kugou、kuwo、ximalaya、appl
    let cpy = {
        qq: tencent,
        kugou: kougou,
        kuwo: kuwo,
        wangyi: netease,
        migu: migu,
        spotify: spotify,
        tidal: tidal,
        ytmusic: ytmusic,
        qobuz: qobuz,
        joox: joox,
        deezer: deezer,
        ximalaya: ximalaya,
        apple: apple,
    }
    let url = `https://music-api.gdstudio.xyz/api.php?types=search&source=${cpy[type]}&name=${title}&count=20&pages=1`
    let re = await fetch(url)

    return re

}

export async function downloadMusicGd(id, type, qua = "standard") {
    // https://music-api.gdstudio.xyz/api.php?types=search&source=[MUSIC SOURCE]&name=[KEYWORD]&count=[PAGE LENGTH]&pages=[PAGE NUM]
    // netease（默认）、tencent、tidal、spotify、ytmusic、qobuz、joox、deezer、migu、kugou、kuwo、ximalaya、appl
    let cpy = {
        qq: tencent,
        kugou: kougou,
        kuwo: kuwo,
        wangyi: netease,
        migu: migu,
        spotify: spotify,
        tidal: tidal,
        ytmusic: ytmusic,
        qobuz: qobuz,
        joox: joox,
        deezer: deezer,
        ximalaya: ximalaya,
        apple: apple,
    }
    // 128、192、320、740、999（默认），其中740、999
    let quality = {
        low: "192",
        high: "320",
        standard: "740",
        super: "999"
    }
    let url = `https://music-api.gdstudio.xyz/api.php?types=url&source=${cpy[type]}&id=${id}&br=${quality[qua]}`
    let re = await fetch(url)

    return re

}

export async function getLyricGd(id, type) {
    let cpy = {
        qq: tencent,
        kugou: kougou,
        kuwo: kuwo,
        wangyi: netease,
        migu: migu,
        spotify: spotify,
        tidal: tidal,
        ytmusic: ytmusic,
        qobuz: qobuz,
        joox: joox,
        deezer: deezer,
        ximalaya: ximalaya,
        apple: apple,
    }
    let url = `https://music-api.gdstudio.xyz/api.php?types=lyric&source=${cpy[type]}&id=${id}`
    let re = await fetch(url)

    return re

}

export async function getPicGd(id, type, size = "300") {
    let cpy = {
        qq: tencent,
        kugou: kougou,
        kuwo: kuwo,
        wangyi: netease,
        migu: migu,
        spotify: spotify,
        tidal: tidal,
        ytmusic: ytmusic,
        qobuz: qobuz,
        joox: joox,
        deezer: deezer,
        ximalaya: ximalaya,
        apple: apple,
    }
    let url = `https://music-api.gdstudio.xyz/api.php?types=pic&source=${cpy[type]}&id=${id}&size=${size}`
    let re = await fetch(url)

    return re

}

