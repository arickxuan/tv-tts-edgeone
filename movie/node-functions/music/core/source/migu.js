var _0xod7 = "jsjiami.com.v7";

"use strict";

const _0x49df7c = _0x2e9f;

(function(_0x3ff25c, _0x3b032f, _0x4930a7, _0x2090a7, _0x15f71c, _0x1c8116, _0x1266b8) {
    return _0x3ff25c = _0x3ff25c >> 1, _0x1c8116 = "hs", _0x1266b8 = "hs", function(_0x2e3ee5, _0x576da7, _0x5dd171, _0xdc8b24, _0x5c176b) {
        const _0xad1038 = _0x2e9f;
        _0xdc8b24 = "tfi", _0x1c8116 = _0xdc8b24 + _0x1c8116, _0x5c176b = "up", 
        _0x1266b8 += _0x5c176b, _0x1c8116 = _0x5dd171(_0x1c8116), _0x1266b8 = _0x5dd171(_0x1266b8), 
        _0x5dd171 = 0;
        const _0x48c296 = _0x2e3ee5();
        while (!![] && --_0x2090a7 + _0x576da7) {
            try {
                _0xdc8b24 = -parseInt(_0xad1038(808, "@FrH")) / 1 * (parseInt(_0xad1038(574, "s@%T")) / 2) + -parseInt(_0xad1038(800, "OPk0")) / 3 * (-parseInt(_0xad1038(677, "QYxY")) / 4) + parseInt(_0xad1038(650, "x&2V")) / 5 * (parseInt(_0xad1038(286, "Xuov")) / 6) + parseInt(_0xad1038(313, "BOH1")) / 7 * (-parseInt(_0xad1038(419, "qais")) / 8) + parseInt(_0xad1038(708, "x&2V")) / 9 + -parseInt(_0xad1038(311, "xvZL")) / 10 + parseInt(_0xad1038(315, "qDhz")) / 11 * (parseInt(_0xad1038(739, "QCah")) / 12);
            } catch (_0x3d6fe5) {
                _0xdc8b24 = _0x5dd171;
            } finally {
                _0x5c176b = _0x48c296[_0x1c8116]();
                if (_0x3ff25c <= _0x2090a7) _0x5dd171 ? _0x15f71c ? _0xdc8b24 = _0x5c176b : _0x15f71c = _0x5c176b : _0x5dd171 = _0x5c176b; else {
                    if (_0x5dd171 == _0x15f71c["replace"](/[gPdAOfLkRbTqhXWrelMFG=]/g, "")) {
                        if (_0xdc8b24 === _0x576da7) {
                            _0x48c296["un" + _0x1c8116](_0x5c176b);
                            break;
                        }
                        _0x48c296[_0x1266b8](_0x5c176b);
                    }
                }
            }
        }
    }(_0x4930a7, _0x3b032f, function(_0x527792, _0x12d332, _0x1fc73c, _0x5aa59d, _0x57d2b9, _0xc7de23, _0x5083c1) {
        return _0x12d332 = "split", _0x527792 = arguments[0], _0x527792 = _0x527792[_0x12d332](""), 
        _0x1fc73c = "reverse", _0x527792 = _0x527792[_0x1fc73c]("v"), _0x5aa59d = "join", 
        1637219, _0x527792[_0x5aa59d]("");
    });
}(386, 131408, _0x528f, 195), _0x528f) && (_0xod7 = _0x49df7c(885, "8h]s"));


import axios from 'axios'
// import cheerio from 'cheerio'
import CryptoJS from 'crypto-js'
 
const searchRows = 20;

async function searchBase(_0x12c9ea, _0x135665, _0x182a73) {
    const _0xd443e3 = _0x49df7c, _0x2e3581 = {
        prrvq: _0xd443e3(768, "[Q#0"),
        lsKpZ: _0xd443e3(507, "8biT"),
        eouEH: "keep-alive",
        rWYhA: _0xd443e3(542, "xvZL"),
        cxscr: "m.music.migu.cn",
        lXQlE: function(_0x1ccf73, _0x1ce322) {
            return _0x1ccf73(_0x1ce322);
        },
        lpWXa: _0xd443e3(792, "QYxY"),
        SwxNv: _0xd443e3(456, "Row4"),
        yccMb: "same-origin",
        owZfn: _0xd443e3(469, "PLar"),
        DvUZf: _0xd443e3(350, "j4DT")
    }, _0x585509 = {
        Accept: _0x2e3581[_0xd443e3(506, "^FVx")],
        "Accept-Encoding": _0x2e3581[_0xd443e3(645, "%fmY")],
        "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6",
        Connection: _0x2e3581["eouEH"],
        "Content-Type": _0x2e3581[_0xd443e3(876, "qais")],
        Host: _0x2e3581[_0xd443e3(795, "g*0B")],
        Referer: "https://m.music.migu.cn/v3/search?keyword=" + _0x2e3581["lXQlE"](encodeURIComponent, _0x12c9ea),
        "Sec-Fetch-Dest": _0x2e3581[_0xd443e3(344, "Hk(n")],
        "Sec-Fetch-Mode": _0x2e3581[_0xd443e3(539, "a4%o")],
        "Sec-Fetch-Site": _0x2e3581[_0xd443e3(807, "NICk")],
        "User-Agent": _0x2e3581["owZfn"],
        "X-Requested-With": _0x2e3581["DvUZf"]
    }, _0xcce38c = {
        keyword: _0x12c9ea,
        type: _0x182a73,
        pgc: _0x135665,
        rows: searchRows
    }, _0x2f6c7f = await axios[_0xd443e3(729, "KvQC")][_0xd443e3(503, "(eO&")](_0xd443e3(718, "%NhA"), {
        headers: _0x585509,
        params: _0xcce38c
    });
    return _0x2f6c7f[_0xd443e3(303, "OPk0")];
}

function musicCanPlayFilter(_0x21688a) {
    const _0x1f6f84 = _0x49df7c;
    return _0x21688a["mp3"] || _0x21688a[_0x1f6f84(325, "naHr")] || _0x21688a[_0x1f6f84(285, "PLar")] || _0x21688a[_0x1f6f84(857, "OPk0")];
}

async function searchMusic(_0x5cd16a, _0x217972) {
    const _0x4e08ac = _0x49df7c, _0x1e8689 = {
        dMJoP: function(_0x5edd0e, _0x249ec4, _0x4324ca, _0x15ffe0) {
            return _0x5edd0e(_0x249ec4, _0x4324ca, _0x15ffe0);
        },
        UmSFt: function(_0x194483, _0x57b08f) {
            return _0x194483 >= _0x57b08f;
        },
        QSuXA: function(_0x13a8b4, _0x2618bf) {
            return _0x13a8b4 * _0x2618bf;
        }
    }, _0x4f59a1 = await _0x1e8689[_0x4e08ac(727, "(eO&")](searchBase, _0x5cd16a, _0x217972, 2), _0x4ad6d6 = _0x4f59a1["musics"]["map"](_0x453481 => ({
        id: _0x453481["id"],
        artwork: _0x453481[_0x4e08ac(814, "%fmY")],
        title: _0x453481["songName"],
        artist: _0x453481[_0x4e08ac(307, "@FrH")],
        album: _0x453481[_0x4e08ac(554, "%[vJ")],
        url: musicCanPlayFilter(_0x453481),
        copyrightId: _0x453481["copyrightId"],
        singerId: _0x453481["singerId"]
    }));
    return {
        isEnd: _0x1e8689["UmSFt"](_0x1e8689[_0x4e08ac(547, "xvZL")](+_0x4f59a1[_0x4e08ac(443, "Xuov")], searchRows), _0x4f59a1["pgt"]),
        data: _0x4ad6d6
    };
}

async function searchAlbum(_0xa90fb8, _0x5ec1cd) {
    const _0x23393d = _0x49df7c, _0x33bc0a = {
        kCfCV: function(_0x24ca25, _0x50ef57) {
            return _0x24ca25 >= _0x50ef57;
        },
        LFdRz: function(_0x2cf3e2, _0x2627b5) {
            return _0x2cf3e2 * _0x2627b5;
        }
    }, _0x55a87a = await searchBase(_0xa90fb8, _0x5ec1cd, 4), _0x349611 = _0x55a87a["albums"]["map"](_0x1437d0 => ({
        id: _0x1437d0["id"],
        artwork: _0x1437d0[_0x23393d(659, "qDhz")],
        title: _0x1437d0[_0x23393d(375, "QCah")],
        date: _0x1437d0["publishDate"],
        artist: (_0x1437d0["singer"] || [])["map"](_0x51753e => _0x51753e[_0x23393d(516, "QYxY")])[_0x23393d(830, "#dlW")](","),
        singer: _0x1437d0[_0x23393d(308, "ChD)")],
        fullSongTotal: _0x1437d0[_0x23393d(333, "GGAw")]
    }));
    return {
        isEnd: _0x33bc0a[_0x23393d(366, "ynyD")](_0x33bc0a[_0x23393d(832, "a4%o")](+_0x55a87a[_0x23393d(841, "#dlW")], searchRows), _0x55a87a["pgt"]),
        data: _0x349611
    };
}

async function searchArtist(_0x1f0fd2, _0x197ac4) {
    const _0x2b2c94 = _0x49df7c, _0x21e4e0 = {
        QAttc: function(_0x5c64e6, _0x5217f6, _0x397947, _0x58218c) {
            return _0x5c64e6(_0x5217f6, _0x397947, _0x58218c);
        },
        TGjUN: function(_0x1410a4, _0x4ec7b0) {
            return _0x1410a4 >= _0x4ec7b0;
        },
        svyIn: function(_0x390ae8, _0x28c960) {
            return _0x390ae8 * _0x28c960;
        }
    }, _0x35d7fd = await _0x21e4e0[_0x2b2c94(737, "KvQC")](searchBase, _0x1f0fd2, _0x197ac4, 1), _0x15a4c5 = _0x35d7fd[_0x2b2c94(496, "Hk(n")][_0x2b2c94(816, "^wal")](_0x50438d => ({
        name: _0x50438d[_0x2b2c94(785, "#dlW")],
        id: _0x50438d["id"],
        avatar: _0x50438d[_0x2b2c94(486, "%NhA")],
        worksNum: _0x50438d[_0x2b2c94(690, "%[vJ")]
    }));
    return {
        isEnd: _0x21e4e0["TGjUN"](_0x21e4e0[_0x2b2c94(698, "KvQC")](+_0x35d7fd[_0x2b2c94(860, "8biT")], searchRows), _0x35d7fd["pgt"]),
        data: _0x15a4c5
    };
}

function _0x2e9f(_0x302ecb, _0x140cba) {
    const _0x528fcc = _0x528f();
    return _0x2e9f = function(_0x2e9ff8, _0x317c1f) {
        _0x2e9ff8 = _0x2e9ff8 - 285;
        let _0x5414ec = _0x528fcc[_0x2e9ff8];
        if (_0x2e9f["WjrYiQ"] === undefined) {
            var _0x36e22d = function(_0x3543a3) {
                const _0x1fbd06 = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+/=";
                let _0x51a84c = "", _0x5dbc01 = "";
                for (let _0x47fc18 = 0, _0x36d40e, _0x1d4254, _0x27c434 = 0; _0x1d4254 = _0x3543a3["charAt"](_0x27c434++); ~_0x1d4254 && (_0x36d40e = _0x47fc18 % 4 ? _0x36d40e * 64 + _0x1d4254 : _0x1d4254, 
                _0x47fc18++ % 4) ? _0x51a84c += String["fromCharCode"](255 & _0x36d40e >> (-2 * _0x47fc18 & 6)) : 0) {
                    _0x1d4254 = _0x1fbd06["indexOf"](_0x1d4254);
                }
                for (let _0x2826e6 = 0, _0x2012b0 = _0x51a84c["length"]; _0x2826e6 < _0x2012b0; _0x2826e6++) {
                    _0x5dbc01 += "%" + ("00" + _0x51a84c["charCodeAt"](_0x2826e6)["toString"](16))["slice"](-2);
                }
                return decodeURIComponent(_0x5dbc01);
            };
            const _0x372a39 = function(_0x3f2744, _0x4b18b2) {
                let _0x3eb7d = [], _0x12ecbf = 0, _0x4e0069, _0x22ac8c = "";
                _0x3f2744 = _0x36e22d(_0x3f2744);
                let _0x4cdc17;
                for (_0x4cdc17 = 0; _0x4cdc17 < 256; _0x4cdc17++) {
                    _0x3eb7d[_0x4cdc17] = _0x4cdc17;
                }
                for (_0x4cdc17 = 0; _0x4cdc17 < 256; _0x4cdc17++) {
                    _0x12ecbf = (_0x12ecbf + _0x3eb7d[_0x4cdc17] + _0x4b18b2["charCodeAt"](_0x4cdc17 % _0x4b18b2["length"])) % 256, 
                    _0x4e0069 = _0x3eb7d[_0x4cdc17], _0x3eb7d[_0x4cdc17] = _0x3eb7d[_0x12ecbf], 
                    _0x3eb7d[_0x12ecbf] = _0x4e0069;
                }
                _0x4cdc17 = 0, _0x12ecbf = 0;
                for (let _0x18ed5b = 0; _0x18ed5b < _0x3f2744["length"]; _0x18ed5b++) {
                    _0x4cdc17 = (_0x4cdc17 + 1) % 256, _0x12ecbf = (_0x12ecbf + _0x3eb7d[_0x4cdc17]) % 256, 
                    _0x4e0069 = _0x3eb7d[_0x4cdc17], _0x3eb7d[_0x4cdc17] = _0x3eb7d[_0x12ecbf], 
                    _0x3eb7d[_0x12ecbf] = _0x4e0069, _0x22ac8c += String["fromCharCode"](_0x3f2744["charCodeAt"](_0x18ed5b) ^ _0x3eb7d[(_0x3eb7d[_0x4cdc17] + _0x3eb7d[_0x12ecbf]) % 256]);
                }
                return _0x22ac8c;
            };
            _0x2e9f["PnnTeA"] = _0x372a39, _0x302ecb = arguments, _0x2e9f["WjrYiQ"] = !![];
        }
        const _0x17a18c = _0x528fcc[0], _0x292165 = _0x2e9ff8 + _0x17a18c, _0x5146c9 = _0x302ecb[_0x292165];
        return !_0x5146c9 ? (_0x2e9f["ZhxVha"] === undefined && (_0x2e9f["ZhxVha"] = !![]), 
        _0x5414ec = _0x2e9f["PnnTeA"](_0x5414ec, _0x317c1f), _0x302ecb[_0x292165] = _0x5414ec) : _0x5414ec = _0x5146c9, 
        _0x5414ec;
    }, _0x2e9f(_0x302ecb, _0x140cba);
}

async function searchMusicSheet(_0x5313e0, _0x18b2c4) {
    const _0x56cf5d = _0x49df7c, _0x24ab6f = {
        Hgbcy: function(_0x32d598, _0x56f2f1) {
            return _0x32d598 * _0x56f2f1;
        }
    }, _0x333ad3 = await searchBase(_0x5313e0, _0x18b2c4, 6), _0x13f39a = _0x333ad3[_0x56cf5d(334, "j4DT")][_0x56cf5d(868, "%NhA")](_0x44c337 => ({
        title: _0x44c337[_0x56cf5d(295, "(eO&")],
        id: _0x44c337["id"],
        artist: _0x44c337["userName"],
        artwork: _0x44c337[_0x56cf5d(665, "%b[x")],
        description: _0x44c337[_0x56cf5d(742, "[Q#0")],
        worksNum: _0x44c337["musicNum"],
        playCount: _0x44c337[_0x56cf5d(353, "r0Ru")]
    }));
    return {
        isEnd: _0x24ab6f[_0x56cf5d(533, "t7Y6")](+_0x333ad3["pageNo"], searchRows) >= _0x333ad3["pgt"],
        data: _0x13f39a
    };
}

async function searchLyric(_0xbc713, _0x57dba7) {
    const _0x163e98 = _0x49df7c, _0x4aa25e = {
        NiCNW: function(_0x37efd5, _0x251485, _0x1da50f, _0x50be3d) {
            return _0x37efd5(_0x251485, _0x1da50f, _0x50be3d);
        },
        uTGmi: function(_0x3cef28, _0x44b0a0) {
            return _0x3cef28 >= _0x44b0a0;
        },
        crTRe: function(_0x2ee35f, _0x305ac5) {
            return _0x2ee35f * _0x305ac5;
        }
    }, _0x3f3c9f = await _0x4aa25e[_0x163e98(634, "s@%T")](searchBase, _0xbc713, _0x57dba7, 7), _0x5f245d = _0x3f3c9f[_0x163e98(306, "OPk0")]["map"](_0x48a5b9 => ({
        title: _0x48a5b9[_0x163e98(442, "ChD)")],
        id: _0x48a5b9["id"],
        artist: _0x48a5b9[_0x163e98(587, "3X0y")],
        artwork: _0x48a5b9[_0x163e98(814, "%fmY")],
        lrc: _0x48a5b9[_0x163e98(579, "KvQC")],
        album: _0x48a5b9[_0x163e98(436, "x&2V")],
        copyrightId: _0x48a5b9["copyrightId"]
    }));
    return {
        isEnd: _0x4aa25e[_0x163e98(882, "fQnR")](_0x4aa25e[_0x163e98(664, "QCah")](+_0x3f3c9f[_0x163e98(391, "%[vJ")], searchRows), _0x3f3c9f["pgt"]),
        data: _0x5f245d
    };
}

async function getArtistAlbumWorks(_0x39b58a, _0x30759f) {
    const _0x7f8129 = _0x49df7c, _0x3dd773 = {
        fPzNK: "gzip, deflate, br",
        mXPOu: _0x7f8129(600, "8h]s"),
        hfakI: "keep-alive",
        Romrr: _0x7f8129(875, "naHr"),
        wTtAH: _0x7f8129(435, "fQnR"),
        BRAod: _0x7f8129(564, "eAqd"),
        AZOgA: function(_0x1ab8fb, _0x13a7c1) {
            return _0x1ab8fb(_0x13a7c1);
        },
        EzYKC: _0x7f8129(449, "OPk0"),
        FdvgQ: _0x7f8129(805, "@FrH"),
        VFpXF: ".album-play",
        ttrqf: _0x7f8129(320, "NICk"),
        asYdY: "disabled"
    }, _0x3d57f2 = {
        accept: _0x7f8129(583, "xoQM"),
        "accept-encoding": _0x3dd773[_0x7f8129(865, "t7Y6")],
        "accept-language": _0x3dd773["mXPOu"],
        connection: _0x3dd773[_0x7f8129(772, "r0Ru")],
        host: "music.migu.cn",
        referer: _0x3dd773[_0x7f8129(324, "C2D5")],
        "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/106.0.0.0 Safari/537.36",
        "Cache-Control": _0x3dd773[_0x7f8129(431, "yH8*")]
    }, _0x367c03 = (await axios["default"][_0x7f8129(291, "IRi!")](_0x7f8129(287, "LsE%") + _0x39b58a["id"] + _0x7f8129(699, "g*0B") + _0x30759f, {
        headers: _0x3d57f2
    }))["data"], _0x584f87 = (0, cheerio_1[_0x7f8129(877, "8h]s")])(_0x367c03), _0x13bd20 = _0x584f87(_0x3dd773[_0x7f8129(546, "8h]s")])["find"]("li"), _0x3b3ea0 = [];
    for (let _0x311fb3 = 0; _0x311fb3 < _0x13bd20[_0x7f8129(706, "t7Y6")]; ++_0x311fb3) {
        const _0x669ba9 = _0x3dd773[_0x7f8129(773, "QYxY")](_0x584f87, _0x13bd20[_0x311fb3]), _0x554b9f = _0x669ba9[_0x7f8129(434, "Vk$@")](_0x3dd773[_0x7f8129(314, "t7Y6")])["attr"](_0x3dd773[_0x7f8129(403, "Row4")]);
        _0x3b3ea0[_0x7f8129(529, "OPk0")]({
            id: _0x669ba9[_0x7f8129(799, "%fmY")](_0x3dd773[_0x7f8129(478, "3X0y")])["attr"](_0x3dd773[_0x7f8129(748, "eAqd")]),
            title: _0x669ba9[_0x7f8129(424, "x&2V")](_0x7f8129(437, "Row4"))[_0x7f8129(545, "Row4")](),
            artwork: _0x554b9f[_0x7f8129(530, "^FVx")]("//") ? "https:" + _0x554b9f : _0x554b9f,
            date: "",
            artist: _0x39b58a[_0x7f8129(624, "NICk")]
        });
    }
    return {
        isEnd: _0x584f87(_0x7f8129(695, "naHr"))[_0x7f8129(390, "%NhA")](_0x3dd773[_0x7f8129(531, "LsE%")]),
        data: _0x3b3ea0
    };
}

async function getArtistWorks(_0x2eca24, _0x269fb5, _0x13c026) {
    const _0x5f0465 = _0x49df7c, _0x4ad49e = {
        sEGpf: _0x5f0465(310, "qDhz"),
        CyzHs: _0x5f0465(326, "Hk(n"),
        SuWWN: _0x5f0465(605, "#dlW"),
        cokcG: _0x5f0465(493, "g*0B"),
        GAFCn: _0x5f0465(346, "%b[x"),
        RlHFJ: _0x5f0465(487, "qDhz"),
        ZdVCE: _0x5f0465(322, "xoQM"),
        VPDMv: _0x5f0465(416, "#dlW"),
        jiimX: _0x5f0465(584, "r0Ru"),
        VLBeO: _0x5f0465(689, "3X0y"),
        itZNK: "褰辫姒�",
        ZFnSx: "鍐呭湴姒�",
        CVlHe: _0x5f0465(482, "%fmY"),
        dMrzF: _0x5f0465(720, "8biT"),
        kbfTa: _0x5f0465(642, "x&2V"),
        fBxgp: _0x5f0465(467, "a4%o"),
        QVLTA: _0x5f0465(760, "Row4"),
        qyDzS: "jpn_kor",
        rBjYY: _0x5f0465(319, "fQnR"),
        lDyMQ: _0x5f0465(635, "ChD)"),
        bMUUA: "https://cdnmusic.migu.cn/tycms_picture/20/08/231/200818095442606_327x327_1298.png",
        fFNpS: function(_0x807ce1, _0x33d712) {
            return _0x807ce1 === _0x33d712;
        },
        FYYyi: _0x5f0465(787, "xoQM"),
        HVvxO: _0x5f0465(479, "GGAw"),
        lBJVX: _0x5f0465(452, "(eO&"),
        RPsOU: "application/x-www-form-urlencoded; charset=UTF-8",
        nJZUt: _0x5f0465(761, "LsE%"),
        tEzRO: "Mozilla/5.0 (Linux; Android 6.0.1; Moto G (4)) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.114 Mobile Safari/537.36 Edg/89.0.774.68",
        VNXHi: _0x5f0465(627, "8biT"),
        befkV: function(_0x29eb85, _0x1d146f) {
            return _0x29eb85 - _0x1d146f;
        },
        DynLB: function(_0x4529ef, _0x3ab7d9) {
            return _0x4529ef === _0x3ab7d9;
        },
        WjXgM: _0x5f0465(398, "NICk")
    };
    if (_0x4ad49e[_0x5f0465(844, "naHr")](_0x13c026, _0x5f0465(466, "%NhA"))) {
        if (_0x4ad49e[_0x5f0465(754, "3X0y")](_0x4ad49e[_0x5f0465(872, "naHr")], _0x4ad49e["FYYyi"])) {
            const _0x55baad = {
                Accept: _0x5f0465(628, "C2D5"),
                "Accept-Encoding": _0x5f0465(489, "Hk(n"),
                "Accept-Language": _0x4ad49e["HVvxO"],
                Connection: _0x4ad49e[_0x5f0465(649, "^Xu9")],
                "Content-Type": _0x4ad49e[_0x5f0465(439, "NICk")],
                Host: _0x4ad49e["nJZUt"],
                Referer: _0x5f0465(312, "PLar") + _0x2eca24["id"],
                "Sec-Fetch-Dest": _0x5f0465(552, "j4DT"),
                "Sec-Fetch-Mode": _0x5f0465(878, "g*0B"),
                "Sec-Fetch-Site": _0x5f0465(468, "PLar"),
                "User-Agent": _0x4ad49e[_0x5f0465(621, "ChD)")],
                "X-Requested-With": _0x4ad49e[_0x5f0465(850, "OPk0")]
            }, _0x30d5d7 = (await axios[_0x5f0465(571, "BOH1")]["get"]("https://m.music.migu.cn/migu/remoting/cms_artist_song_list_tag", {
                headers: _0x55baad,
                params: {
                    artistId: _0x2eca24["id"],
                    pageSize: 20,
                    pageNo: _0x4ad49e[_0x5f0465(476, "3X0y")](_0x269fb5, 1)
                }
            }))[_0x5f0465(474, "C2D5")] || {};
            return {
                data: _0x30d5d7["result"][_0x5f0465(515, "C2D5")]["map"](_0x3bb853 => ({
                    id: _0x3bb853["songId"],
                    artwork: _0x3bb853["picL"],
                    title: _0x3bb853[_0x5f0465(332, "x&2V")],
                    artist: (_0x3bb853[_0x5f0465(585, "ynyD")] || [])[_0x5f0465(409, "^wal")](", "),
                    album: _0x3bb853["albumName"],
                    url: musicCanPlayFilter(_0x3bb853),
                    rawLrc: _0x3bb853["lyricLrc"],
                    copyrightId: _0x3bb853[_0x5f0465(781, "^Xu9")],
                    singerId: _0x3bb853[_0x5f0465(873, "%fmY")]
                }))
            };
        } else {
            const _0x2c9ac0 = {
                title: _0x4ad49e[_0x5f0465(370, "ynyD")],
                data: [ {
                    id: "jianjiao_newsong",
                    title: _0x4ad49e[_0x5f0465(578, "naHr")],
                    coverImg: _0x4ad49e[_0x5f0465(836, "xoQM")]
                }, {
                    id: _0x4ad49e[_0x5f0465(330, "fQnR")],
                    title: _0x4ad49e[_0x5f0465(510, "xoQM")],
                    coverImg: _0x4ad49e[_0x5f0465(299, "^Xu9")]
                }, {
                    id: _0x4ad49e[_0x5f0465(292, "3X0y")],
                    title: _0x5f0465(838, "j4DT"),
                    coverImg: _0x4ad49e["VPDMv"]
                } ]
            }, _0x47637d = {
                title: _0x4ad49e["jiimX"],
                data: [ {
                    id: _0x4ad49e[_0x5f0465(518, "Row4")],
                    title: _0x4ad49e[_0x5f0465(688, "p4B8")],
                    coverImg: "https://cdnmusic.migu.cn/tycms_picture/20/05/136/200515161848938_360x360_673.png"
                }, {
                    id: _0x5f0465(663, "p4B8"),
                    title: _0x4ad49e[_0x5f0465(598, "NICk")],
                    coverImg: _0x5f0465(399, "j4DT")
                }, {
                    id: _0x4ad49e[_0x5f0465(586, "%fmY")],
                    title: _0x4ad49e[_0x5f0465(380, "%NhA")],
                    coverImg: _0x4ad49e[_0x5f0465(769, "%[vJ")]
                }, {
                    id: _0x4ad49e["fBxgp"],
                    title: _0x4ad49e[_0x5f0465(854, "fQnR")],
                    coverImg: "https://cdnmusic.migu.cn/tycms_picture/20/08/231/200818095229556_327x327_1383.png"
                }, {
                    id: _0x4ad49e[_0x5f0465(569, "IRi!")],
                    title: _0x5f0465(771, "4CwE"),
                    coverImg: _0x4ad49e[_0x5f0465(639, "NICk")]
                }, {
                    id: _0x5f0465(656, "%b[x"),
                    title: _0x5f0465(654, "Xuov"),
                    coverImg: "https://cdnmusic.migu.cn/tycms_picture/20/08/231/200818095356693_327x327_7955.png"
                }, {
                    id: "ktv",
                    title: "KTV姒�",
                    coverImg: "https://cdnmusic.migu.cn/tycms_picture/20/08/231/200818095414420_327x327_4992.png"
                }, {
                    id: "network",
                    title: _0x4ad49e[_0x5f0465(732, "*K#S")],
                    coverImg: _0x4ad49e[_0x5f0465(848, "j4DT")]
                } ]
            };
            return [ _0x2c9ac0, _0x47637d ];
        }
    } else {
        if (_0x4ad49e[_0x5f0465(606, "@FrH")](_0x13c026, _0x4ad49e[_0x5f0465(447, "Hk(n")])) return getArtistAlbumWorks(_0x2eca24, _0x269fb5);
    }
}

async function getLyric(_0x55daa3) {
    const _0x2ec1b3 = _0x49df7c, _0x20e54a = {
        tRqLN: _0x2ec1b3(671, "QYxY"),
        MFBXO: "gzip, deflate, br",
        elHWs: "keep-alive",
        FkhTJ: _0x2ec1b3(338, "yH8*"),
        VSANN: _0x2ec1b3(517, "xvZL"),
        pmnmp: _0x2ec1b3(411, "Hk(n"),
        vNvBt: "same-origin",
        sNIUP: _0x2ec1b3(377, "OPk0"),
        pednB: _0x2ec1b3(428, "%b[x")
    }, _0x102b65 = {
        Accept: _0x20e54a["tRqLN"],
        "Accept-Encoding": _0x20e54a["MFBXO"],
        "Accept-Language": _0x2ec1b3(853, "qais"),
        Connection: _0x20e54a[_0x2ec1b3(455, "*K#S")],
        "Content-Type": _0x20e54a[_0x2ec1b3(454, "4CwE")],
        Host: _0x2ec1b3(430, "8biT"),
        Referer: "https://m.music.migu.cn/migu/l/?s=149&p=163&c=5200&j=l&id=" + _0x55daa3["copyrightId"],
        "Sec-Fetch-Dest": _0x20e54a["VSANN"],
        "Sec-Fetch-Mode": _0x20e54a[_0x2ec1b3(577, "(eO&")],
        "Sec-Fetch-Site": _0x20e54a["vNvBt"],
        "User-Agent": _0x20e54a[_0x2ec1b3(372, "%NhA")],
        "X-Requested-With": _0x2ec1b3(801, "OPk0")
    }, _0x101042 = (await axios[_0x2ec1b3(400, "4CwE")][_0x2ec1b3(617, "^FVx")](_0x20e54a["pednB"], {
        headers: _0x102b65,
        params: {
            cpid: _0x55daa3[_0x2ec1b3(703, "BOH1")]
        }
    }))[_0x2ec1b3(697, "af5q")];
    return {
        rawLrc: _0x101042[_0x2ec1b3(774, "Hk(n")][_0x2ec1b3(758, "^Xu9")]
    };
}

async function getMusicSheetInfo(_0x5f3a4e, _0xb51ebd) {
    const _0x439d4a = _0x49df7c, _0x635102 = {
        RJeDm: function(_0x5ac607, _0x5025cd, _0x5a6810) {
            return _0x5ac607(_0x5025cd, _0x5a6810);
        },
        LjRiC: function(_0x24ef6b, _0x1eb497) {
            return _0x24ef6b === _0x1eb497;
        },
        YmfiZ: _0x439d4a(715, "PLar"),
        OQVjb: function(_0x166479, _0x2170a6) {
            return _0x166479 === _0x2170a6;
        },
        YVTRE: function(_0xd9f55, _0x38004d) {
            return _0xd9f55 !== _0x38004d;
        },
        kxSwN: _0x439d4a(835, "Hk(n"),
        hFqRz: function(_0x408985, _0x1db575) {
            return _0x408985 === _0x1db575;
        },
        oWTQr: function(_0x4dc7bd, _0xdf3755) {
            return _0x4dc7bd === _0xdf3755;
        },
        bYntN: function(_0x263ed6, _0x3cb607) {
            return _0x263ed6 === _0x3cb607;
        },
        nWaCF: function(_0x399920, _0x1e9f1f) {
            return _0x399920 === _0x1e9f1f;
        },
        xuyks: function(_0x579ff6, _0x14aebd) {
            return _0x579ff6 === _0x14aebd;
        },
        xBVjz: function(_0x53c7ae, _0x124cc6) {
            return _0x53c7ae !== _0x124cc6;
        },
        MnDja: _0x439d4a(809, "Xuov"),
        isUyK: _0x439d4a(565, "a4%o"),
        FMFUE: _0x439d4a(817, "t7Y6"),
        MhcMQ: "7242bd16f68cd9b39c54a8e61537009f",
        kMdhB: function(_0x4fc4a, _0x1b49f5) {
            return _0x4fc4a < _0x1b49f5;
        }
    }, _0x1aaa97 = (await axios[_0x439d4a(804, "#dlW")](_0x635102[_0x439d4a(750, "yH8*")], {
        params: {
            palylistId: _0x5f3a4e["id"],
            pageNo: _0xb51ebd,
            pageSize: 30
        },
        headers: {
            Host: _0x635102[_0x439d4a(527, "r0Ru")],
            referer: _0x635102[_0x439d4a(438, "^wal")],
            By: _0x635102[_0x439d4a(354, "%b[x")],
            "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1 Edg/113.0.0.0"
        }
    }))["data"][_0x439d4a(682, "qDhz")];
    if (!_0x1aaa97) return {
        isEnd: !![],
        musicList: []
    };
    const _0x83067b = _0x635102["kMdhB"](_0x1aaa97[_0x439d4a(388, "%b[x")], 30);
    return {
        isEnd: _0x83067b,
        musicList: _0x1aaa97[_0x439d4a(660, "Vk$@")][_0x439d4a(643, "KvQC")](_0x873fd8 => {
            const _0x1fbc1b = _0x439d4a;
            if (_0x635102["LjRiC"](_0x635102[_0x1fbc1b(429, "af5q")], _0x1fbc1b(717, "%NhA"))) return _0x635102[_0x1fbc1b(349, "C2D5")](_0x5a4328, _0xe53436, _0x880e93); else {
                var _0x10572f;
                return _0x635102[_0x1fbc1b(540, "PLar")](_0x635102[_0x1fbc1b(553, "QCah")](_0x10572f = _0x873fd8 === null || _0x635102[_0x1fbc1b(296, "^Xu9")](_0x873fd8, void 0) ? void 0 : _0x873fd8[_0x1fbc1b(379, "t7Y6")], null) || _0x635102[_0x1fbc1b(668, "g*0B")](_0x10572f, void 0) ? void 0 : _0x10572f[_0x1fbc1b(683, "8biT")], 0);
            }
        })[_0x439d4a(745, "[Q#0")](_0x2cab14 => {
            const _0x121535 = _0x439d4a;
            if (_0x635102[_0x121535(736, "*K#S")](_0x121535(384, "(eO&"), _0x635102[_0x121535(358, "p4B8")])) _0x4f4e76 = (_0x4f3ae7[_0x121535(712, "xvZL")](/https?:\/\/h5\.nf\.migu\.cn\/app\/v4\/p\/share\/playlist\/index.html\?.*id=([0-9]+)/) || [])[1]; else {
                var _0x1f4c96, _0x45bfe3, _0x5d1768, _0x2af700, _0x247c92, _0x2fe387, _0x2c273a, _0x43962f, _0x580555, _0x481180;
                return {
                    id: _0x2cab14["id"],
                    artwork: (_0x635102[_0x121535(492, "a4%o")](_0x1f4c96 = _0x2cab14[_0x121535(404, "NICk")], null) || _0x1f4c96 === void 0 ? void 0 : _0x1f4c96["startsWith"]("//")) ? _0x121535(475, "j4DT") + _0x2cab14[_0x121535(480, "s@%T")] : _0x2cab14[_0x121535(811, "^wal")],
                    title: _0x2cab14[_0x121535(743, "af5q")],
                    artist: _0x635102[_0x121535(582, "x&2V")](_0x2fe387 = _0x635102[_0x121535(381, "GGAw")](_0x247c92 = (_0x2af700 = _0x635102[_0x121535(633, "NICk")](_0x5d1768 = _0x635102[_0x121535(289, "g*0B")](_0x45bfe3 = _0x2cab14[_0x121535(790, "naHr")], null) || _0x635102[_0x121535(316, "%fmY")](_0x45bfe3, void 0) ? void 0 : _0x45bfe3[_0x121535(662, "Row4")], null) || _0x635102[_0x121535(613, "j4DT")](_0x5d1768, void 0) ? void 0 : _0x5d1768[_0x121535(528, "LsE%")](_0x45bfe3, _0xfcd30a => _0xfcd30a[_0x121535(383, "naHr")])) === null || _0x635102[_0x121535(343, "t7Y6")](_0x2af700, void 0) ? void 0 : _0x2af700[_0x121535(433, "Hk(n")], null) || _0x635102["bYntN"](_0x247c92, void 0) ? void 0 : _0x247c92[_0x121535(501, "#dlW")](_0x2af700, ","), null) && _0x635102[_0x121535(432, "(eO&")](_0x2fe387, void 0) ? _0x2fe387 : "",
                    album: _0x635102[_0x121535(523, "af5q")](_0x43962f = _0x635102["nWaCF"](_0x2c273a = _0x2cab14[_0x121535(451, "4CwE")], null) || _0x635102[_0x121535(636, "%[vJ")](_0x2c273a, void 0) ? void 0 : _0x2c273a[_0x121535(740, "a4%o")], null) && _0x635102[_0x121535(730, "%b[x")](_0x43962f, void 0) ? _0x43962f : "",
                    copyrightId: _0x2cab14[_0x121535(422, "xvZL")],
                    singerId: (_0x481180 = (_0x580555 = _0x2cab14[_0x121535(669, "xoQM")]) === null || _0x635102["OQVjb"](_0x580555, void 0) ? void 0 : _0x580555[0]) === null || _0x481180 === void 0 ? void 0 : _0x481180["id"]
                };
            }
        })
    };
}

function _0x528f() {
    const _0x3d6564 = function() {
        return [ _0xod7, "TTRjdsgqLjRierkamfilO.XchMombGg.RvF7AWlP==", "i8k7umocW5y", "lCokWRvdda", "W4hdMCk+WOZcPa", "WR8AWOjDkq", "W7aRWRhcVG3dQrDfWRZdVW", "BCo+eCkiW58CFuldSelcSbvSpZKpWRzpCWCwW4r8n8omjXytWPRcNSkGBSklBgFcUCoJgCosbmonW5FdNCkGvdRcRSkm", "ACkbWR7cGdPi", "rJVcG2mk", "W43dHd3dIW", "WR9eW4ddLGO", "xCoDfmk8W7C", "FJX8WR3dIG", "WPekW7ldQLRcM8owbSognq", "WQ9YW5aUWOS/W6uZWOy1W41f", "W4NdIcBdSW", "pSkUDSo0W5G", "yaFcTg4n", "WR5YW5mIWQOyW7CQWQ0", "W6KKECkmWPe", "BCo2cmklW4u", "W4O3W6C7iW", "E8kJW7GyeW", "W4iXq8ke", "WQyOWQjUgG", "WPD5W6JdLW", "W6u7k8ocsG", "BCo+W6XBWQC", "W6pdHCoPACobD8oxxt8AaSkVhSkPW53dV2hdG2xdN8oy", "W7/cGmkRWRFcOrKNWPX+qZdcOCo8afu", "W4SiW5uTgq", "W5pcNM3cLf8", "x3ldTJ8CW53dT8knW44", "WR/dPmkPrmkp", "cCknzmo4W7S", "W4WcW4uPhKmV", "WPbZW6xdKbSHaSoqWP0", "ncvc", "ACk7W45/cmkunu7dMW", "WOqlW6pdP28", "WRL7WRq", "gmksxCkPtG", "E2FcHmokWPG", "dZhdPxSQW5i", "kITCWRadoSoREG", "W6y4u8kpWRG", "pmoQW6FdMsK", "zaDjzNLQfSkvWROPWPzsWOGqDCk4WONdLCkSi8otW4CLyCo+l00TiCkOWOe5iCkOWPpcHsWBW73cPrNcJ8kWBYPkjGrLu1ldTCkzW51lodZcHMaCW6yTW6izW5LEtCkbWQlcIv4BgmkDW5LcWPxcQ8obWRdcMSojACoaW57cI8kQWRPXWP3cV0hcV2RdIYz6n1NdOIBdKH/cR8kUA8o/jgRcKuBcSgCJW5fXg8kxd8k/tcquWPyUWRG6W5CFW5JcMG3dImkikG", "5zoZ5zor54Ml6iQL5QEr", "cCkodmkyweZcUWpdH8oV", "WQ/dKmozymkH", "WOTUWRVcLvddMa", "mezLpvtdK8kxqY5+", "j8k5W5FdPCo+", "W6pdJCoRjG", "cvvlgIe", "D0tcTSoLWQq", "kmkSAmoNW6JdKq", "W5CHeCodwG", "W4iZwCkUWRm", "qSopmmkpW5a", "yxBcUeS", "FCk0W4u3ua", "d8kBWQyRW4Pma1qbDsBdIq", "WOD+WQZdUIbGkmorW4xcLK/dQ8kMl00EW7/dKxaQWPq3a8o0W7JdKYBdR3hdUKKQnmovAmojFCkIs8kTtmkSxfpcNaddTG", "WQXwW4ddUfO", "wNpdSsymWRJcRCoqW4hcIqpdL2KAW4tdPXCuWOBcOq8xdXVdQmkWW7JdNHBcSSoFWPCsDgCNngNcTHCkWPVdJfBcLgSDvCo3W7BcKIBdPM7dTmkKWO5OW43cOCoHnWJdKhZdHcZdPNlcSCorzGCuWRTtjNZdU8o3Fq", "zbRcJfCJ", "BJRcTwuy", "W4KQrCkhWRRcVIBdPSkJWPuAWObeW7NcLX0lj8kzaCkQW7LCWOXsW6ZdLf/cKwPSWPddUSkNcSoZWRBdVSkYW4qRW6ldSSkVqrJdLLXOW4PFvmkMW5FdNmoiWRG4tbD8vmoYWQNcJCksW6PMrrRcOLpdG8k2WPu6W6BcRWK", "W4tcU8oQBqO", "mCkSB8oU", "l0/cMSkYWR8", "FrD2WRFdUW", "W4NcJetcPYhdR8k9W7ajica", "WQLVW7xdVWFdSq4yWQxcQJmMiZFcJW7dQ8oqwYL2WP/dVCoVDq", "mCozhgpdMa", "fmksumoQW4m", "5BoL5RIz5Pw/", "WODOW7xdJvq", "EbzfyMW", "tG3dOW", "WOJdP8obsq", "dSoAiM7dGa", "BCoIa8krW5S", "BmkFW5uCfG", "zYTOWOFdRSk5", "W57dTSktWO7cVq", "sCktW4yb", "dvdcL8k/WP8uaq", "p0j0la", "tqnxWRRdTSk5FSk4WQ0EWR0KfqC", "imkeW6BdOSo7W556gKdcPCkhD8kzlSkRWQrVgCoHWPzjW7ZcMSoAW4vvWQvapu7cP8k8u8k1p8kcW7GUsWtcT8ouW6OkCmoe", "WQZdOSoIWQ3cUG", "tIxcKw0iWR0", "f8kcbSkwsfpcPqVdIq", "EmoVbSkTW5i", "AmkJW70osG", "fCoQWRLMmG", "572j57Ig5QsZ", "WQDRW4G8WRq", "omkuWQVcKdahrq", "o8kuWRVcJIOyFHzB", "vCkWW4e9Cq", "yCkGdmkrW4uwFXJdTetcUu86Csa", "uZX4WOOm", "dCoiW4FdUX/cVe1nW47dU8oGAmk4W5agW4mYBh/cJ8o6reeQWPJdUCovfNtdGqdcSCkifCkqlgqQWO9AaSkNW43cGSkxvSkgv8o3W6dcMGVcHN/cOComa8oHcSolqCkSWOpdISoMW47dUbSeW63cPCompSkXCSkLWQjEWOvrW58", "bshdU2ySW5m", "W4xdImkIWQBcVG", "WOddTCo+wmkE", "oHfvWO07", "W5CAj8o4qq", "s8koW6aTpW", "W5qmuCkRWQ4", "umooW4xdIrRdRYm", "aSoxnhJdHq", "mabfWPib", "W4BcPmooyrC", "5B636zoD5QwC", "o8kqWQ8", "rfT7W7RcUmkZW5GZ", "5BkB5y6g5y+S5yUh5Qsg", "usVdH8kcW6zHfrn0W7NcVCoC", "xmocW7XSWPiUlhK+", "BSk0W5/dRWa", "57Yk57IF5QAA", "W5tdGdu", "nKjPiXxdK8kvtG", "tctcTLyk", "tLLW", "lYFdUwm+", "psvgWRy", "FM3dLZ88", "yWTFDtnWeq", "W63cS8oREcO", "zgFcVeyNoXyqWRZcNY5cWRRcPtWoWOtdVCkKCSoDC8kBleKGcSkTyCozC3tdO30yW4pdJSkbW452a8kEmsDGW6W", "WPBdISopqSkl", "WPLtWPr9wrDRW7L4bCk7E8oE", "Db5gWPSsWO7dGCkQzG", "bIxdP2yW", "vx/cJG", "nYhdUbibfYi8WRFcTW", "W43dMSoPm8oZ", "WOjOWRVcJfdcLSoAWRVcVColW6rPALuDkIn0WRnDWQVdR8oYomost8oxo3ZdTColiSoHpvFcRmkVWR5UySk2eSkZW5zQWOyJeqjIE8ohW5HTavJcUw7cQCkHW6FcN8oIjs/dGSoCWPOjWPT6sG", "g8klamkkuhdcLa/dJW", "n1PYjbO", "wCopW6P4", "yYDRWRtdRSkSAq", "p8kuWOZcKcS", "pSk1sSk9FW", "WRj/W4u0WQ8", "fSo8ih/dUW", "mLDAaZi", "WODZWRNcLuBdNW", "WQXXW58WWOKJW7S", "W5VcN13cQ3/dTmkbW7Gdla", "WQpdUmkjv8kPA8ovW6nR", "EbzfyIu4", "E8kOW5y+ls3dLXddGG", "fM7cN8oLWOlcO1ddQCookZRdJgtcGSogkW", "W6ldG8o6jmoP", "W7dcI8oyEa", "ed7dRLSN", "hwBdQtqkW6/cVCkpW4pcIGJcHW", "WP57W6NdObq", "jCkfWR7cLsSgErzmfG", "B8k0W70Jha", "W4SiW5mXguy8W5L2o8kB", "h3v5hbq", "WRvTW5S+WQy7W79PWQS7W40oWORcOq", "WQ1+W6/dQeNcTG", "a1xcVmouWRe", "vmkiWOtcVL7cVLiQW5FdQmokuCkk", "W7/dKJhdVqO", "m8o3WO5yfSodDcFdNJVdJuH2idiamweNnWORWOZdHspcQmkeWRdcKmkSW7NdP8kixbrQgr/cTCorWRLgWQxcV8kSW5K3WP9uWPfmjCoJWPqwt8kfrg3cRZutaM02WR4aqSoborJdJsOJBmkhswJcLmojuhGiwmkPWPS5jaLgDLjRWRyErmkzrgRdIY5DECovgWCqWPFcPmo4o8ohmuWNeLxcG8kKW73dTe17WQ/dGIfsWRBdO8klW5pdGIeO", "iCojdeRdSa", "yCoVfCkhW54", "WP0QWQq", "eJhdLa", "WRmbWR5YaG", "b8oonvVdSG", "W53cOwhcLuS", "W5lcMv3cSN/cUSoGWRydzYpdNfeTmSkdW7G7W6eaW7hdUmo5WONcVmkLW6pdIXpcTmoOW7O4WOjKW53dPMmrWPRcT8okW4hcKCkBfSoeW6DEW67dTMG", "D15KW7pcVG", "5RI65y6+5QAh", "vfT5W7lcUq", "W5FcJf3cOwq", "W4pdJtldLXa", "WOhdP8obs8kS", "e3dcKCoDWRiJdW", "W7dcSSoewcS", "dmkYECkRBG", "bCorxSkXtxBcPqP3WOmMq8oVpCoU", "bY3dSxm8W41b", "x3zbW7/cSa", "pSkfWQVcLYXpavbBgIxdQ1TQW70jogNdSfVcJuddPez3kwxcVX1BW5y0WQy8oSk9ACo2WRjoxmklab1QW7PVWRZcOCoUaSk1qav1n1BdPmojyCotvcOTW6hdGSoTW49BgWZcJ8kcvN7dMmoQdh9mda", "WOxdTSo2WQFcQa", "p8kICSoH", "du3cMmk2WP4hafC", "ySkHW5NdQG", "WRddPmoBWRJcVa" ].concat(function() {
            return [ "mGNdO2yQ", "WRpcMmofe8oRvmotBG", "hwpdMJzAW6ewWQTzWP8LlW", "W7pdGSkKWRFcVZ4LW592", "m01ZnY8", "cxFcI8oiWRG", "W7RcI8obFa", "W5NcGLNcU37dQCkOW7eAacO", "dxJcJW", "mSkPWRFcPJK", "WOHeW6FdKIm", "W7pdMmoTnSog", "cNBcLSou", "WQWiW5FdUxC", "W7xdHmoiaCoL", "cw1Insm", "WPG/WQbhomoSEIJdJNddRLnisSkLW5vZtCktWRS9WRr2EK0wWPWoWOpcRLeqWOFcNmoEW5CghMbCW6OdmxFdRCoBsCkTWPBcPCo+FJ4bW4noCWDVE8oDzeBcQJiAkCoEW4NdS8ovorLvDbddNmkGvmoZrq", "WOXAWOhcJha", "zmo6fCkuW4vfmXNdUKNcSfDHysCBW68pFa8rWOCYlmkrpWOEWPtcGSkBE8kgndpcR8o5hCkprCkyWOZdKmonl07cSmkfW6xdNuldUNSYhXlcS8kiWQxdPmoaWQdcJSk/W7JcQ8ojgSkJW6jyW7TvWQ7cQmk7WOfjW4uiW6C", "W5NcTCoQrYe", "fSovW53dRaNdTbe", "W5q3ACkuWPxcO0Hv", "yW7cT0Ga", "5Q6E57YV5QEz", "dSkvo3JdM8ojWR8OWRH3xxJdQwVdVa", "pmkMCG", "bSouW5BdRH7dRW0", "W5aGAmkhWQa", "W5RdGcBdLWy", "dMBdUMC6W4HwlaC9W49ZeNtcVG", "AmoRb8kfW4mtAa", "awNcJ8owWR4YhrroW5RcOSkxeSksfmkzW5RdHx0sWPCjWQqCWRBdRSkYWQSGFSoiWR4bcmkrWQZcSrSxDhO7W5xdT3LC", "WRr8W5CdWQy", "FtPVWOldSCo3iCofWQvbWQu0frPEW5bdW5jFWPlcTIhdTCoLWOVcR1KdhGSOWOjDWPVdSGi6BSkQW4D8FNBcPwpcT8kHWRLWW7SDW4S", "5PAB6z+q5QwL", "msjtWRWe", "re3cG00p", "W5xcQdxdSG", "5B2X6zcz5QsZ", "5A2S5ysi5PE86zwU5zgJ5Q6e5y+g5AEq5Boy5P2B5yEO77206k6U6igi5B2J566W5B2N", "W4KQrCkhWRRcVIBdPSkJWPuAWObeW7NcLX0lj8kzaCkQW7LCWOXsW6ZdLf/cKwPSWPddUSkNcSoZWRBdVSkYW4qRW6ldSSkLqrNdK0j1W4HFvSkUW5pdLCokWRe7sHz6umkuWQNdPmkrWQbIcXNdJ1BcPCk4WPSHWQpdRX5maW", "CsT9WPpdT8kHEG", "uIvvWRhdHa", "yXzqycjXnCkrWQjT", "W5SHA8keWOtcHL1EEKy0", "WPmKWQrooCk/mM/dMv3dPa", "WQVdT8kmB8kL", "CSkIW6micW", "W5u3rCkBWQW", "WRvxW4/dGaG", "xWPeCre", "WRDQW4uNWRrSWRLOWQSWW45nWONdPxjlx8kGWOJdNbhdKmo6tgiWW7FdUSkXiIb/CmkIW6pcG0BcRgFdOSoVg8kcWQ/dGCojdmoVWRBdQ0WwcXKeut1oymogW67dGSoaWOTFWOdcOXyikmoCbtJcHqiMWRVdRmovWOpcNa", "EJrrWOddKG", "s3FcKmoLWO7cV0i", "WPqSr8k1WR/dRuG", "yhRcVf43", "WPhdK8oHWQFcQq", "W7CyFmoEWPu", "ux/dTJun", "W64ca8kLW6GoWQddIHxcReS", "W5hcR0dcJui", "nCkBW4xdUSoGW5r1cq", "WORdR8oBta", "WRPviSkDW5KpWQhdSG", "W5uGp8kuW64tWRFdSatcLfOgWQfO", "jSkrW6i", "FSoRemkrW5mmAa", "W4y7rq", "W6tcO8oWqguZW7ddUcdcJLhdQ8kV", "WRutWQfqdq", "xSkrW4GPsG", "WRFdS8kYuG0QW6tdGa8", "WRzQWRrSW5PcWOyvW6FdGJhdMruMbu9lW7ldVmo+WOhcQfGWWQpcKwldIdJcGSoSWQVdIaNcSHTEWRBdMWCqW5VdJmkQoZlcPSkGr8oxWO/dOLJdP8kj", "fSocWPTugmkxWRJdL8kdW7u", "W44To8oPvSk8WRSHFq", "W5JcNmozBG4", "eKdcI8kXWPKQafa", "WO/dQCodtCk2", "Cmk0W4CIEW", "W44PlW", "WQLVW7xdV07dPa5AW6BdQsSGot3dGK3dR8oEsxi7WPlcVmk2mcCey8k+WPVcHSoOxrCXkSkkrtZcJLCS", "W4CPk8oH", "W6tcO8oWqa", "k2Hpbty", "mtbgWQC+yCkPmmk1aSo1W4y6rKxcG8ktvSo/mSkcWOVdJSolxCkdcCk4WQDOWOyRoSkYWQyDp14ojtFcLc/cHCkTWP44W4jZqmo1cCkQWQhcMstdLtJdUmokeq4BW7unf0nZW6esW6RcJrVcRCkHuhZcPCka", "cZXOWOmh", "F8k/W6CSxmotW7NcSSorWRhcT2rODG", "WR7dQmkEvG", "Cq9wWOiuW5NcVSoSAgBcOmoaWR/dO28eWRFcL8k+W4elzCkmWR7cM8ocDSozW7nVW5NcTmkeWPVdR8k1lmkuW7hdScy", "pK5Woqa", "WONdSmopySk1", "lmkvW6ldRCo6", "W48/xmks", "W4SXwmkz", "DbPlWPWlWOldV8kN", "W57dQmkIWPdcQa", "amkpt8k8CXlcJWRcKCo7zmkKymkxWRaPssP+B8o/mmoDWRK1WPbxz3ldNgDkqSkrW70MW7BdS8o6WR3dRLBdI23cR2CQ", "q8knW5JdIGq", "W6hcPGFdUfu", "qXDMrrG", "EGLhWPmtWOBdHmkWydRcHmor", "5Bgn5yYO5y6z5yQB5Qs9", "W63cT8o3scS", "mYpdThqT", "W5e/vSksWOFdQW", "WQHfW4FdLce", "iSkBW6BdT8oGW5r8bL3cG8kn", "xLJcSmoYWRG", "5zop5zcP5BkL5y2G5QEW", "hLRcO8kUBxNdNSkmWPBcJ8kkWOddG8keibbdWQ5HxWiFFCoDrs3dVZdcRHFdHCoK", "W7NdI8kJWRldVXeOW5TLtW", "oCkou8ovW6a", "W4uvh8kyW5e", "W5SJk8kuW7m", "n8oSWPTm", "WOydW6C", "lmkzW7lcPbfzvbCdd3BcTGaGWRGpEd/dQahdIedcVWq9mZhcMZitW7H5W79XECoKFSo9WRaPp8kFqrH1W6zQ", "W4e7rSooWQ4", "AeFcOLOg", "WPPrWPDWjgaoW6LGnq", "W6eeamkFW6G", "jctdKf4d", "lSkBW4BdP8oH", "zs98WPFdJmkI", "h2zriq4", "W47cTmopuYi", "W7OeA8o0WOxcOCoYWPJcIdRdTaWQn8ooWP4", "5RMk5y2m5QsV", "WQDlW7VdGxy", "qtFcJ2e", "DIfPWOe", "W5FcJfK", "WRrUWQ5dW4ixW5S", "umopW6P6WPC", "tMFcHeyj", "FKFcP8o7WOi", "WP/dR8oBt8kHdSkwW6G", "ycZdU8oVzq", "ugRcISoYW5hdOH7dSmosnZ3cGItcISoxomoDW5VcV2O", "jmkMWOBcJX4", "WPf5W6ddNq", "uwJdTYu", "W53cOdldKgW", "WRrPW60", "BKnFW7tcNW", "W6u5tCo3WOy", "W7NcI8oC", "W4OKWRxcIWWOy8kpWPJdKuRcUmoSlWniWQJcItqJW4uHxSoUWQZcIdJcNWpdSqfX", "WPDLW6VdKa8Ho8kxWP3cIb/dTCo+iq", "WPWIWQDMoG", "W68VW7GRWP9lWP1oW5lcGIRdVXa", "c8opiN3dM8kAW7mPWRHRswtcPcBdV15DW7DTjwVdTCkSW5/dU8oUWQOCW5SRW7bJlvhcHZNdIGC", "W5SoW40VdL0O", "wKhdTaqf", "p8k3f8kDBG", "WQNdUmkz", "WRb4WPNcV2y", "s8kBW5GqtCojW5JcKq", "W5uVAW", "bSkExSkH", "W7CFtCkxWPq", "W5VcVSoKACkhfmk5W5W", "WOFdK8oIWO8", "W6OIu8k7WRW", "dCkoDCkhAq", "yxlcQKS7nam", "yu/cPgSO", "W6Kmb8k9", "gSkjy8kCAq", "ugRcISoYWPJdTX7cSSokmsFcIgNdICotnSopWOddSMCEjCowWOS/W6ZdUCkzlCoozmk9W5artxvXWQhdIMG", "W74chCk7W6K", "W6hcSmoWsdSO", "A8kZW4ePpda", "aCkPzSkCuW", "5zkx5zc75Bki5y+Y5QwJ", "pCk8wCoCWODpDuxdIMhcR14", "WPG/WQbhomoSEIJdGdRdRuToumkVWPGWsCkDWQLMW7L7oW8lWOiyW4hcSsfFWP3dGSkBWPznxt9tW6SAmMNcOCout8kTWOVcPmoOjdTCW50xlG8", "WP8RW6OJoN4+", "WOrHW5JdHh4", "cCkAW4rnWRqVnua", "WOtdGmoeESk+", "Cs9VWPm", "rfTNW6ZcUmkZW5e8WQZdGCoy", "W7GzFSoQWPZdSSk8W5JcTdBdTruSk8ojWPRdJmocBfNcL18judqZwmowFmozf8kpASkfp8kYW7PqWPunxmopWOFcL27cICkZW6VdUeKeWQPqWOjJa8oXW5lcHcZcMtBdUfNcJxHccsPWWRdcP8kcuSoFAmkIW4PZW40N", "q8ktW58fbCooW60", "WPXMW7hdLqCVm8onWPFcIbZdTmoWoXymW6BdH2D4W5z0fSkTW6/dKw7dHLdcRLXYymoaF8kgCmkTfmklESoJedVdUgJdRCoN", "EGTqFdXRa8kxWOLQWOvlWP8vCSk6WOq", "g8klamkkuhFcMXBdMmoL", "e8kBW7VdVmoG", "vhFcJCo2WO7cO2tdR8ol", "5BkN5yYI5PEX5Q+F5QAc", "W5xdMdFdLGa", "cCktuCkXuW", "jCkqsCkTuNpcPWSVW4rXfSoPeSoPW4tcSq/dUqaFWQnPWR3cVheNWPRcTSk7nGldLCobqmk0dHJcPLH7DmkRkCoXW4dcTmkwDGPbWQ7dMsLlW73dUfHIpSkiWRPKWQ8SaCo2WRPfW6aOCwddOYBcLgpdO8o5W608WQNcTYOYhuz1sZldNmoTW7r9b8o3W5C5e3ddGCoVW57dSSk2W7jSA8oNWRuEWRhcHvjrW4tdUmkIW4WTW78RWRZcH8kOWRfuWQKkxX/cSs3cMmk+eX7dSSoYuSkIWRVcOq", "W7mcyCo5WQG", "W6yIt8o5WR4", "fSotW53dRcldPW8h", "FW5oWP40WOZdV8kKusFcUCouWQa", "kmkSAmoNW63dNmo0gSo4", "acxdV0SZ", "WRDQW4uNWRrSWRLOWQv6W41vWO/dV3GghmkKWOBdJKRcNCo3", "W5tcIwJcOhG" ].concat(function() {
                return [ "WOawW6pdV3/cKCoebSoMpGddHwVcOIxcI8oiWPxcQCoKWQzwW6lcPbGgW7/dQ8ksW7fMWPJdV2ddVCkTe8k7W5ntmCkWa1dcNXPXbq", "W6WYDmkdWRW", "yt1dWORdMW", "5Bkw5yYP5Ps05Q2T5QEu", "W7hcPSoHysK", "WQ5mW5xdNK8", "W53cUrBdI38", "5zgg5zctW7r4WPtVVABOHlxLUBBMRQdLJkKF5yIu5lMNpUwKVowlMEMsGEAnPE+9SUEyT+AoIoEZOUI0U+wpH+wmSW", "5BcX5y+F54o65Q+z5Qww", "AmoVfCkf", "pJ5BWQDHE8oIESkWcSo6W58QgqZcGSop", "e8k+W7pdISo/", "a8kosSoiW5xdGCo3pmoUWRrOW57cQSkE", "W4dcHqtcGulcRmk1W7fvohpcMqX9FCoiW7TPW7DiW6/cTCkVWORcTmkIWQNdUx7dVCo8WQPNW5G6WP/dPcjpWQZcLSkUW4pdICoksSkr", "pCoXW7/dGXJdSHiWW4JdRSo7ymk+W5C", "ksHtWQ4dlSoR", "ALX0W5JcMW", "W5tcJYJdIHbFe8oDhmkzi8k1rCo7Ba", "W67cPSofqZW", "WQxdNCkzkNHHWQNdJcJdRCkzWPrX", "mfTtoJC", "5PwO6z6e5QEV", "imkyW7tdU8o/W44", "W7hcHCoVCdG", "tLfeW6lcVG", "W78SW6qEoa", "WRrCW7FdVw4", "l8kIyCooW4ddMmoI", "eCkKbmk8AW", "WRmAWOfcpa", "a8ktnSkjFG", "r8ofjmkWW4a", "cCkIjCkpwW", "5yEn5l2j5y+gW43NPjJMIitPLBBPNPS", "W4NcO2dcL1W", "qmkxW58", "5zc+5zg/54Uv6iMR5QEr", "wZ/cLMGk", "wZpcMNbaWRSKWOHgW7O1bCojWPVdTmklr2LOW69maCkYW7SAW4PBB8oIW77dGmkVWP0PxMWlxmouW4hcTmkxW5TzW5dcTaBcVwBdRhNdTWFdHSoKWQbwWOioWPTPm1jyWQ49qmogW5dcTCkgASk4W7JdVmk0W7CgW5zHWPVdRZ0UW4m+WQfgwZFdICoFWQpdKSk8WRTOurZcKxtcKIjAWOldGSk6gezAW58KxSkbcxbkC8kWc2LSW7Kd", "W4accCk1W7ylWQBcJvtdIX9dW7PqwSkAzmkBEZTeBbOwDCkkW5BcJCoRhSkNF3KWW7ZcOCoGW6FcIKFcNmkiW4RdH8kzqmo8W47dSSk1mmk4jxdcGCkRW4LoDeOHgxtcSSoeb17dV3bMdSoCW6NcSuRdMwFdNdChWOldUJbqlbWcqsNdN8onmhWlW6xcSJ9Xje1oWQ7cPSoWeCoDW5xcUvFcNubcW7e7WRNdU3pdUmo5WOeDBSo4oZJdVmkLWRXSlKBcK8o6WPnqW7JdJarYW51sWRVdRW", "a8kRWOZcTY4", "WQDUW63dO27cSu8s", "W57cOfVcUeO", "vrfWWPSK", "s2RcN8oWWP/cVMBdTmotla", "vN/cK8oN", "omkqDCkVDq", "DdPzuZa", "WPXMW7hdLqCVm8onWPFcIbZdTmoIzq4vWR3dINvYW5XTfmkYW7ZdI2RdM1dcS1fNCmoxF8opn8oMxCoyBSkQhudcNb8", "WQVdQ8ozzCk1", "u1TJW7tcPG", "eXFcLmkTWOKper1cdYpdIXJdPCoU", "W5lcJfRcGwddOCk8W6O", "WQ9/W5yYWOK5", "W4ucW4CHhKilW5HH", "rg7dTratW6pdPq", "DWDf", "tbddP8oZFwNcNa", "EbzfyIu4tCoxWRSRWPPxWOSvF8o1WOxdImkIoCktWOSZjSo8DG5Rlmk2WOr2B8kOWO/cIdWuW7xcOGq", "FxBcOMCE", "rSkEW4Krrq", "m8k3CSoWW5lcJ8kOqCoOWQfZW5BcRmkzWQRdQmoNywNdJNe7A1JcL2ldL8obmNWZWRP/WR3dISkarI8lfSo6W4btW6RdGhu1WPWZWOFdQCoHWRKXASkrlh3dO8k2W7axW5ldOIhdQtvMWQHIcq7cPmkRW4pcSCo2WQpdOa7dNa", "gLZcN8k5WO8kbG", "WPvQWQPiW4G", "AW1YWQOW", "W7/dHtpdMdi", "sSkxW48nxCokW5NcICox", "BwpcUfO9yLHlWRJdNI0yWQpcVZboW4xcTmk3ySklzmoAAv5IrmkZD8oyC2FcUcvxWPNdJG", "BrRcULaO", "C3vMW7FcOq", "jSoQWOf/D3ldLXVdNsbiWQqBpG", "W4KNnSoU", "zCoJamkdW5m", "W5lcPJpdOa", "WPe4WQDElmk4", "eSkKF8okW4G", "W5SpW4yThW", "W6JcRdpdQNC", "W4KQrCkhWRRcVIBdPSkJWPuAWObeW7NcLX0lj8kzaCkQW7LCWOXsW6ZdLf/cKwPSWPddUSkNcSoZWRBdVSkYW4qRW6ldSSkPqrldMvXOW4PFuSkMW5RdNmomWRS5srf7x8kyW4xcImkuWQiTqbZdJt7dI8k5WPmGWRJcSqbf", "W5ZdVmkdWO3cIa", "W6GVWOCKWOiGW7awWOa", "z8ogW6RdLgPahcvGoX/dOue", "eLZcL8k/WO4o", "5yEo5yU2pSkB", "B8oHeCkDW4qwE17dRwtcUG", "EbDaWOCkWQ3dSmkUya", "a8ovW53dRW", "ASkHW47dOrS", "sCopW7LQ", "FMz0W6/cHq", "t0bJW6xcUCoGWPL7WRxcPSorWQaiWRxcPSkYW4GGW6zrtL8ExJFcQeJdJ3CNDCkpWQ7dHmoWbKG6amodW61cW4D0oSo9obyCWP/cMLy", "W43cH8okCbC", "Egb2WOFdSCkKBCoeWQugWQ80sbbt", "WPyYW6FdKL4", "mCkPz8kwEW", "W5VcPIJdVq", "yCkPW5tdPG", "W70mCSk3WO7cR8o2W4RdPW", "bmoqW5hdVGhdIampW4G", "WPFdGcNdNrzBxCkDemkDiq", "W6ufgCovzG", "DCkIW5GRFq", "W4W/qq", "WQbPW7xdPK7cQG", "BmkZW5SIpa", "WQ5/WQD5W6Cx", "amklr8k0tsxdQqT5WO4Vw8k0lCoPW4NdQHRcQ0CRW6nUWQhdVgW6W5NdRCoMwvZcJCkzfmkmeWNdPKOmE8kZjCo3W5VcP8oMkuGDW7VcTN0rWOBcQbL8oCkoWRXZWQ1feSoSW4z1WODxcHpdSxNdHtRcQmkPW4q+", "WQTTW4/dL1y", "WQTSWQW", "W6BcOXNdTfm", "kCkaW6ldVSkOWPi0a1ZcUCkao8kslCkTW6qRwmo8WODqW6BdKSohWOPnWQfhCvhcU8k/tSo6mmofWRa1xLtcRSkzW6vnjmoi", "WQmzg8kPW7CfW6RdIWZcGG", "t8kgW58uw8kDWQBdJ8ozW67cR3rOA8oUWOjJp0G5nNJdSxaIW601fmo6kfDufcxdJ8o9hCkQuSojcYBcH8o0b8oKWOTbW4S7jSkhW4WoW4DtW43dOmkTWOuv", "h1xcM8kTWPC", "a8kAvSk0e37cQK1SWO8", "aJJdP34GW4juDGm7W4yPvMtcV1GsW44Icg4YCgpdS1lcQeOfWR1GkKCMWOmcW4CsauZcJ1dcJSkpW4b3", "oflcKCkmWRa", "WOZdNSohWR3cIG", "W5RdJJFdJa", "tKbYW7JcUq", "WOD5WQVcLvBdGCkLW73cSW", "W7tdHCoXimofD8oQua", "bmoEiG", "pmkEWRBcIq", "x2tcL8oYW4FdRvxdUmobkdxcLw/dI8kEpCoA", "F2JdVZ8tW67dO8oqWPFdG13cMJq+W4tdQL0wWPJcTvP3ofxdTSo0WQ/cJuddOCoxWO4visDPzNtcRXetWPtcVr7dIZvlm8k9WQBdQx/cQNddUCkNWObZW4/cP8o1lNhcQNFcULldVsRdRSkkoJ0aW4ubDdNdPmkWoSoeiLezgSorqbxcQKC8WOCIdCkIW6qcW4FcGmknwGKGW6hcUCkJWOBcGmorW49sgs7cUSo9ere7W55DWRn/W4xcU8k0bmkzDG", "W4S8k8oWumoRW4rNCYm7aCkGrNpdVSopWQrutLRdSMVdMuXXWOJdRxi1c8k0WP7dSMj6W7u6W7NdRmo+FNvkWOLZl8kgcW", "keOAW4vrW5dcPCk3xsBcU8oMWRO", "W5FcMfRcQ28", "W7FdM8k0WP3cPWmL", "WOmQWRLszSk5j27dIN3dRG", "WR0KWQ5Ej8k6ncJcMdRcSb4vDCkLW5GOwmobW7WjW7rXzG0lWOfnW5JdSZ5oW5/dHmkkW68BdYboWP0mkxVdQ8oawSoDW4NdP8kIk1fvWPK1i0zYFmoxzL3cR1Sjm8kIW7NcLmkQqMPek0hcHmoRbmoAr8orW4FdRSo6WQBcNSoWW4pdKZZcUmoMkCkRWONcOmoWW4ddRc3dS8oXFtqeW7dcRNlcSY8bnmkpW4xdJCoLqSkVot95lmktlCoxWO3dSNRcPY7dS8oRcwX8e8kLWPXXW4FdUCoJ", "W4tdLmoxbmom", "zSkSW5JdTX7cJSkGx1S", "le/cSSkpWQi", "WPG/WQbhomoSEIJdGdRdRuToumkVWPGWsCkDWQLMW7L7oW8lWOiyWOpcQh0jWO3dKmocWPDBgsycWRzoBI7cSmknvCo0W5BdUSkR", "jCkvW6ldRW", "m8k3CSoWWPS", "WOH5WQNcL3u", "bHTxWQqanmoIASk6aW", "WRXAWR/cPgu", "yXmpWRePW4/dQ8kRpJNdSmkfW6lcSYbpWRtdHCkOWOKvkmoAWR3cImkyDmoZW4qNW4hdQSkBW4xcTmo4mmkwWRxdLGevbaXFveG", "nSoMWP5bemkuc2hdKa", "xdNcJgmMWRC", "WOtdRCobxW", "CmobW6rWWPmsjdvheMFcSZ0VWPSybc0AW4qFlftcRmkmF8kroSkPW6xdMSkhWOZcNCk0W6JcVSouC0j7WQH4DwVdKHNcOeddTmo7tGxcISoEW4RcS35yW5GwxaLWFW8gWOOLWOT1zJ/cU8k8W6mAW4pdVhhdMWeDuSohWRddJdCtWRldGCoEW64vW5xdH8k+W57cMx81WPjIW5a+uf9CEKFdUCktowNdUSkMWR4qW4S6WOxdJSktWO/dR8kJWR/cKSo0hCkeW6mHWQ1DW40SFZpdNfddSSkL", "m1D0pqRcIa", "55AN6kwO5yQH", "W5VcN13cQ3/dTmkFW7anbq", "vCoAW6PPWOXeAJurwdNdVMaqWPSvxZHiWOmRBfpcSmomySkmECoYWRJcTCozW5tdHCoGW5dcO8ofm1amWQDGDw3dGGddJGlcTmkNh2ldL8knWRFdQtXdW50Dxr8CEHKEWRLEW6KiDsxcRSoOWR1FW5BcSLe", "W4yGnCkKW4O", "W5BcSYJdOZi5W4hdUmouWPJcMCk3WRFdKJ3cOYu", "W6/dMmoRn8otp8kmgY8kqCkJb8k4W4hdSwldGMxdI8ozDv7cUqC7W7FdL8o+F8kMb3NdSSk2W4i4W7m5WQucW4m/W5rrBXFcLGCfgmkrW44WW78IWOJcM3KVs8kgxSkmWQ3dGCo4W7NcGSkzW7JcI35kb8k+qGuuWOi", "C8kwW4ZdRsq", "W53dV8kqWQJcSa", "wg7dPdGvW6VdO8kqW73cHqldJM8gW4pdOW", "umkCW7KjBq", "nuNcSCk0WR0", "W5dcUZxdUM1TW5y", "W6WbeCkPW7C", "l8oSWO5jcq", "zdVcKxuE", "nKX2jbZdGq", "W4i/xCkB", "xmocW7XSWPi", "d8kArW", "fmkgd8kA", "5ywP5z625QsP", "wrRdPCoQFG", "CJrYWOlcRSoTASkpWQ4dWQK1a18DWPXC", "z8obW6/dL2PnguKptq", "tqpdJ8o7FW", "vYn3utG", "yK/dJmk2", "W7/dOmkmWOxcTq", "mSkuWRNcHIOzwG", "kSo/fmkfW5OwAe/cPa", "m8krW6xdU8o+W4LO", "A3BcOu8", "ACoJeCkqW48", "W6/dRqFdMIW", "pHbEzxHipCk7WRL1WO5XWPCsEW", "W7xdICoSn8opA8oqurK8yW", "WRbVWONcUwS", "t0bJW6xdSmo1WPK5WQ3dU8ovWRzvWRtcPmo1W5eOW69dfXiEfc7dRKZdIZKLEConWRNdMCo4b0j8tCoeW60", "W43cVmo4sWG", "emknqCoqW5C", "W5RdKYddNHDtjCkafmkccSkHbSo9", "ivibiMyYu8opW6y2", "mdDNWQ4g", "amoAoMe", "W70yamk0", "wHZdTSoUE27cUmotWOtdKq", "aSoid2NdSq", "qgtcIxWO", "WOL8W6pdReq", "rt/cG2OfWROXWOP1WRGXaSokWPJdS8kp", "WQpcS8kas8kVB8oMWQrLxSoJWPP0W5pdJG", "W7yPymomWQC" ];
            }());
        }());
    }();
    _0x528f = function() {
        return _0x3d6564;
    };
    return _0x528f();
}

async function importMusicSheet(_0x5db0b3) {
    const _0x5571b0 = _0x49df7c, _0x4829f6 = {
        RvKWX: function(_0x2cf208, _0xf408bc) {
            return _0x2cf208 === _0xf408bc;
        },
        hnszV: function(_0x3edc05, _0x1c73b8) {
            return _0x3edc05 === _0x1c73b8;
        },
        fMAkl: function(_0x2fda6f, _0x55deea) {
            return _0x2fda6f === _0x55deea;
        },
        rvPXW: function(_0x145426, _0x417a75) {
            return _0x145426 === _0x417a75;
        },
        xanMP: function(_0xf983c8, _0x2a363e) {
            return _0xf983c8 === _0x2a363e;
        },
        Uogqm: function(_0x159890, _0x208928) {
            return _0x159890 === _0x208928;
        },
        FstBi: function(_0x14279d, _0x51c9d7) {
            return _0x14279d === _0x51c9d7;
        },
        Gfbxq: function(_0x32be1c, _0x2f6ec5) {
            return _0x32be1c >= _0x2f6ec5;
        },
        wnRmE: function(_0x1ec6c1, _0x52fdd8) {
            return _0x1ec6c1 < _0x52fdd8;
        },
        VcvYQ: "data-cid",
        LvuwC: function(_0x2f4045, _0xad64ed) {
            return _0x2f4045 !== _0xad64ed;
        },
        kBiON: _0x5571b0(861, "p4B8"),
        cmhYz: function(_0x4135c9, _0x507b4c) {
            return _0x4135c9 === _0x507b4c;
        },
        Lnngu: function(_0x5c1bc9, _0x702998) {
            return _0x5c1bc9 === _0x702998;
        },
        CQUuw: function(_0x5d0460, _0x3ddd57) {
            return _0x5d0460 === _0x3ddd57;
        },
        NREOZ: function(_0x377bcc, _0x1ba1d8) {
            return _0x377bcc === _0x1ba1d8;
        },
        AlWaw: _0x5571b0(842, "8h]s"),
        xxVBw: _0x5571b0(789, "8biT"),
        guvDz: "WNTCv",
        Yeryi: function(_0x17e719, _0x10678a) {
            return _0x17e719 === _0x10678a;
        },
        ytTvC: _0x5571b0(463, "g*0B"),
        hyVpy: function(_0x10e120, _0xea2841) {
            return _0x10e120 === _0xea2841;
        },
        KtjTa: function(_0x5d1e43, _0x4130d2) {
            return _0x5d1e43 !== _0x4130d2;
        },
        isDVS: "zpxqQ",
        BrZGX: _0x5571b0(499, "QCah"),
        kaiYz: _0x5571b0(728, "(eO&"),
        rhWFE: _0x5571b0(575, "yH8*"),
        fdxIW: "same-origin",
        tsXxY: _0x5571b0(823, "NICk"),
        NkhiH: function(_0x381aed, _0x4184e1) {
            return _0x381aed(_0x4184e1);
        },
        IwHaU: function(_0x4e4660, _0x71b93) {
            return _0x4e4660 < _0x71b93;
        },
        iDwEL: function(_0x2ac54f, _0x1190ac) {
            return _0x2ac54f - _0x1190ac;
        },
        YRczO: _0x5571b0(519, "xoQM"),
        CxHCl: _0x5571b0(596, "xvZL")
    };
    var _0x259bbe, _0x1ceb23, _0x28f9a0, _0x2b595a;
    let _0x286615;
    !_0x286615 && (_0x4829f6["cmhYz"](_0x4829f6[_0x5571b0(604, "QCah")], _0x4829f6[_0x5571b0(537, "j4DT")]) ? _0x4d8b20 = _0x4829f6[_0x5571b0(591, "p4B8")](_0x2395a9 = _0x5bd4c5[_0x5571b0(724, "%fmY")](/^\s*(\d+)\s*$/), null) || _0x2e228b === void 0 ? void 0 : _0x512c47[1] : _0x286615 = (_0x5db0b3[_0x5571b0(686, "%[vJ")](/https?:\/\/music\.migu\.cn\/v3\/(?:my|music)\/playlist\/([0-9]+)/) || [])[1]);
    !_0x286615 && (_0x286615 = (_0x5db0b3[_0x5571b0(619, "LsE%")](/https?:\/\/h5\.nf\.migu\.cn\/app\/v4\/p\/share\/playlist\/index.html\?.*id=([0-9]+)/) || [])[1]);
    if (!_0x286615) {
        if (_0x4829f6[_0x5571b0(417, "a4%o")](_0x4829f6["guvDz"], _0x4829f6[_0x5571b0(794, "fQnR")])) _0x286615 = (_0x259bbe = _0x5db0b3["match"](/^\s*(\d+)\s*$/)) === null || _0x4829f6[_0x5571b0(415, "Hk(n")](_0x259bbe, void 0) ? void 0 : _0x259bbe[1]; else {
            var _0x35b2f7, _0x4db86b, _0x3cff7f, _0x1ad458, _0x221bd0, _0x481223;
            return {
                id: _0x22188e["id"],
                artwork: (_0x4829f6[_0x5571b0(741, "p4B8")](_0x35b2f7 = _0x3da4ff[_0x5571b0(572, "8h]s")], null) || _0x4829f6[_0x5571b0(589, "C2D5")](_0x35b2f7, void 0) ? void 0 : _0x35b2f7["startsWith"]("//")) ? _0x5571b0(693, "xoQM") + _0x20088a[_0x5571b0(392, "BOH1")] : _0x6d6a73["mediumPic"],
                title: _0x1b1279[_0x5571b0(298, "*K#S")],
                artist: (_0x3cff7f = (_0x4db86b = _0x25e8da[_0x5571b0(725, "[Q#0")]) === null || _0x4db86b === void 0 ? void 0 : _0x4db86b[_0x5571b0(294, "^Xu9")](_0x59ce70 => _0x59ce70["name"])) === null || _0x3cff7f === void 0 ? void 0 : _0x3cff7f[_0x5571b0(461, "qais")](", "),
                album: _0x4829f6["rvPXW"](_0x1ad458 = _0x2ac37f[_0x5571b0(620, "xvZL")], null) || _0x4829f6[_0x5571b0(397, "QYxY")](_0x1ad458, void 0) ? void 0 : _0x1ad458[_0x5571b0(680, "ynyD")],
                copyrightId: _0x3a3a72[_0x5571b0(782, "PLar")],
                singerId: _0x4829f6["Uogqm"](_0x481223 = _0x4829f6["xanMP"](_0x221bd0 = _0x2a674c["singers"], null) || _0x4829f6["fMAkl"](_0x221bd0, void 0) ? void 0 : _0x221bd0[0], null) || _0x4829f6[_0x5571b0(562, "^wal")](_0x481223, void 0) ? void 0 : _0x481223["id"]
            };
        }
    }
    if (!_0x286615) {
        const _0x122d90 = _0x4829f6[_0x5571b0(793, "*K#S")](_0x1ceb23 = _0x5db0b3[_0x5571b0(870, "qDhz")](/(https?:\/\/c\.migu\.cn\/[\S]+)\?/), null) || _0x4829f6[_0x5571b0(304, "(eO&")](_0x1ceb23, void 0) ? void 0 : _0x1ceb23[1];
        if (_0x122d90) {
            const _0x48d861 = (await axios[_0x5571b0(400, "4CwE")][_0x5571b0(373, "NICk")](_0x122d90, {
                headers: {
                    "User-Agent": _0x4829f6[_0x5571b0(368, "ynyD")],
                    Accept: _0x5571b0(376, "QCah"),
                    host: "c.migu.cn"
                },
                validateStatus(_0x2557cf) {
                    const _0x3ce3a9 = _0x5571b0;
                    return _0x4829f6["Gfbxq"](_0x2557cf, 200) && _0x4829f6[_0x3ce3a9(702, "ChD)")](_0x2557cf, 300) || _0x4829f6["hnszV"](_0x2557cf, 403);
                }
            }))[_0x5571b0(803, "xvZL")], _0x17d343 = _0x4829f6["LvuwC"](_0x28f9a0 = _0x48d861 === null || _0x4829f6[_0x5571b0(335, "KvQC")](_0x48d861, void 0) ? void 0 : _0x48d861["path"], null) && _0x4829f6[_0x5571b0(812, "af5q")](_0x28f9a0, void 0) ? _0x28f9a0 : _0x48d861 === null || _0x4829f6["hyVpy"](_0x48d861, void 0) ? void 0 : _0x48d861[_0x5571b0(520, "eAqd")];
            if (_0x17d343) {
                if (_0x4829f6[_0x5571b0(401, "Xuov")](_0x4829f6[_0x5571b0(567, "%NhA")], _0x4829f6[_0x5571b0(711, "LsE%")])) _0x286615 = _0x4829f6["xanMP"](_0x2b595a = _0x17d343[_0x5571b0(828, "C2D5")](/id=(\d+)/), null) || _0x4829f6[_0x5571b0(402, "GGAw")](_0x2b595a, void 0) ? void 0 : _0x2b595a[1]; else return _0x4829f6[_0x5571b0(581, "#dlW")](_0x5e27ff, 200) && _0x4829f6[_0x5571b0(494, "NICk")](_0x25ef74, 300) || _0x4829f6[_0x5571b0(764, "^Xu9")](_0x42372f, 403);
            }
        }
    }
    if (!_0x286615) return;
    const _0x2392a8 = {
        host: _0x4829f6["kaiYz"],
        "Sec-Fetch-Dest": _0x4829f6[_0x5571b0(751, "eAqd")],
        "Sec-Fetch-Mode": _0x5571b0(867, "8biT"),
        "Sec-Fetch-Site": _0x4829f6["fdxIW"],
        "User-Agent": _0x5571b0(483, "qDhz"),
        "X-Requested-With": _0x4829f6[_0x5571b0(340, "8biT")],
        Referer: _0x5571b0(336, "%[vJ")
    }, _0x4d1f00 = (await axios[_0x5571b0(513, "qais")][_0x5571b0(802, "C2D5")](_0x5571b0(710, "s@%T") + _0x286615, {
        headers: _0x2392a8
    }))[_0x5571b0(303, "OPk0")], _0x717152 = _0x4829f6["NkhiH"](parseInt, _0x4d1f00["rsp"]["playList"][0]["contentCount"]), _0x3f35fb = [];
    let _0x2aa1d3 = 1;
    while (_0x4829f6[_0x5571b0(881, "%b[x")](_0x4829f6[_0x5571b0(652, "r0Ru")](_0x2aa1d3, 1) * 20, _0x717152)) {
        const _0x307651 = (await axios[_0x5571b0(503, "(eO&")](_0x5571b0(305, "naHr") + _0x286615 + _0x5571b0(543, "qais") + _0x2aa1d3))[_0x5571b0(597, "QYxY")], _0x129ed5 = (0, 
        cheerio_1[_0x5571b0(851, "s@%T")])(_0x307651);
        _0x4829f6["NkhiH"](_0x129ed5, _0x4829f6[_0x5571b0(427, "%b[x")])[_0x5571b0(735, "Vk$@")]((_0x47f357, _0x5abab2) => {
            const _0x21bc19 = _0x5571b0;
            _0x3f35fb[_0x21bc19(824, "IRi!")](_0x129ed5(_0x5abab2)["attr"](_0x4829f6[_0x21bc19(560, "PLar")]));
        }), _0x2aa1d3 += 1;
    }
    if (_0x4829f6["xanMP"](_0x3f35fb[_0x5571b0(420, "4CwE")], 0)) {
        if (_0x5571b0(603, "QCah") !== _0x4829f6[_0x5571b0(470, "eAqd")]) return; else return;
    }
    const _0x3743ac = (await (0, axios)({
        url: _0x5571b0(679, "3X0y") + _0x3f35fb["join"](","),
        headers: {
            referer: _0x5571b0(611, "t7Y6")
        },
        xsrfCookieName: "XSRF-TOKEN",
        withCredentials: !![]
    }))["data"];
    return _0x3743ac["items"]["filter"](_0x2d3cb3 => _0x2d3cb3[_0x5571b0(393, "g*0B")] === 0)[_0x5571b0(573, "r0Ru")](_0x35a0b3 => {
        const _0x15f562 = _0x5571b0;
        if (_0x4829f6["LvuwC"](_0x15f562(646, "r0Ru"), _0x4829f6[_0x15f562(797, "%NhA")])) {
            var _0x16c16c, _0x448bda, _0x271b9a, _0x2b9320, _0x442ad3, _0x29b2ec;
            return {
                id: _0x35a0b3[_0x15f562(593, "j4DT")],
                artwork: _0x35a0b3[_0x15f562(566, "BOH1")],
                title: _0x35a0b3["songName"],
                artist: (_0x448bda = _0x4829f6[_0x15f562(700, "8h]s")](_0x16c16c = _0x35a0b3[_0x15f562(757, "x&2V")], null) || _0x4829f6["Lnngu"](_0x16c16c, void 0) ? void 0 : _0x16c16c[_0x15f562(713, "PLar")](_0x15330b => _0x15330b[_0x15f562(691, "%NhA")])) === null || _0x4829f6[_0x15f562(709, "Row4")](_0x448bda, void 0) ? void 0 : _0x448bda[_0x15f562(607, "j4DT")](", "),
                album: (_0x2b9320 = (_0x271b9a = _0x35a0b3[_0x15f562(360, "C2D5")]) === null || _0x271b9a === void 0 ? void 0 : _0x271b9a[0]) === null || _0x4829f6[_0x15f562(367, "PLar")](_0x2b9320, void 0) ? void 0 : _0x2b9320[_0x15f562(471, "Vk$@")],
                copyrightId: _0x35a0b3["copyrightId"],
                singerId: _0x4829f6[_0x15f562(472, "4CwE")](_0x29b2ec = _0x4829f6[_0x15f562(595, "#dlW")](_0x442ad3 = _0x35a0b3[_0x15f562(288, "BOH1")], null) || _0x4829f6[_0x15f562(615, "t7Y6")](_0x442ad3, void 0) ? void 0 : _0x442ad3[0], null) || _0x4829f6["NREOZ"](_0x29b2ec, void 0) ? void 0 : _0x29b2ec["artistId"]
            };
        } else return {
            url: _0x4e1035[_0x15f562(880, "t7Y6")]
        };
    });
}

async function getTopLists() {
    const _0x325246 = _0x49df7c, _0x322743 = {
        GkNCF: _0x325246(845, "x&2V"),
        eoecI: _0x325246(534, "QCah"),
        DMbHw: _0x325246(341, "@FrH"),
        FcGOW: _0x325246(821, "r0Ru"),
        PppZP: _0x325246(863, "fQnR"),
        fXrBc: "灏栧彨鐑瓕姒�",
        KKETv: "https://cdnmusic.migu.cn/tycms_picture/20/04/99/200408163640868_360x360_6587.png",
        JGZxk: "jianjiao_original",
        UZSPq: _0x325246(657, "OPk0"),
        cyWVJ: _0x325246(490, "eAqd"),
        asZAd: _0x325246(374, "af5q"),
        Lonqw: _0x325246(500, "p4B8"),
        Wfddl: "褰辫姒�",
        JXWKH: _0x325246(831, "GGAw"),
        XDvtC: _0x325246(505, "%fmY"),
        tVvoW: "hktw",
        ZsFEH: _0x325246(864, "x&2V"),
        evzJq: "eur_usa",
        eqFCW: _0x325246(753, "PLar"),
        VJyyA: _0x325246(869, "Xuov"),
        cLCnf: _0x325246(359, "OPk0"),
        IgyJi: "coloring",
        tiNCy: _0x325246(775, "ChD)"),
        iDcBs: _0x325246(777, "#dlW"),
        Ywnfi: "ktv",
        uRfkM: "KTV姒�",
        dkXgp: _0x325246(731, "qais"),
        zLzjO: _0x325246(637, "qais")
    }, _0x5a1d16 = {
        title: _0x322743[_0x325246(779, "8biT")],
        data: [ {
            id: _0x322743[_0x325246(696, "eAqd")],
            title: _0x322743[_0x325246(834, "Vk$@")],
            coverImg: _0x322743["FcGOW"]
        }, {
            id: _0x322743["PppZP"],
            title: _0x322743["fXrBc"],
            coverImg: _0x322743[_0x325246(369, "xvZL")]
        }, {
            id: _0x322743[_0x325246(641, "GGAw")],
            title: _0x322743[_0x325246(378, "qais")],
            coverImg: _0x322743[_0x325246(558, "ChD)")]
        } ]
    }, _0x427299 = {
        title: _0x322743["asZAd"],
        data: [ {
            id: _0x322743[_0x325246(666, "KvQC")],
            title: _0x322743[_0x325246(644, "a4%o")],
            coverImg: "https://cdnmusic.migu.cn/tycms_picture/20/05/136/200515161848938_360x360_673.png"
        }, {
            id: _0x322743["JXWKH"],
            title: _0x322743["XDvtC"],
            coverImg: _0x325246(602, "g*0B")
        }, {
            id: _0x322743[_0x325246(491, "Vk$@")],
            title: _0x322743[_0x325246(521, "3X0y")],
            coverImg: _0x325246(444, "(eO&")
        }, {
            id: _0x322743[_0x325246(827, "%fmY")],
            title: "娆х編姒�",
            coverImg: _0x322743[_0x325246(300, "(eO&")]
        }, {
            id: _0x322743[_0x325246(685, "(eO&")],
            title: _0x322743[_0x325246(707, "[Q#0")],
            coverImg: _0x325246(788, "%[vJ")
        }, {
            id: _0x322743[_0x325246(413, "j4DT")],
            title: _0x322743[_0x325246(594, "^wal")],
            coverImg: _0x322743["iDcBs"]
        }, {
            id: _0x322743[_0x325246(756, "@FrH")],
            title: _0x322743[_0x325246(747, "8h]s")],
            coverImg: _0x322743[_0x325246(509, "^FVx")]
        }, {
            id: _0x322743[_0x325246(672, "%fmY")],
            title: _0x325246(661, "j4DT"),
            coverImg: _0x325246(755, "xvZL")
        } ]
    };
    return [ _0x5a1d16, _0x427299 ];
}

const UA = "Mozilla/5.0 (Linux; Android 6.0.1; Moto G (4)) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.114 Mobile Safari/537.36 Edg/89.0.774.68", By = CryptoJS["MD5"](UA)[_0x49df7c(798, "C2D5")]();

async function getTopListDetail(_0x30770b) {
    const _0x2f6f36 = _0x49df7c, _0x608a43 = {
        dXhAf: function(_0x4204c5, _0xf5a5d1) {
            return _0x4204c5 === _0xf5a5d1;
        },
        eLMxd: function(_0x223782, _0x5dace0) {
            return _0x223782 !== _0x5dace0;
        },
        QvcjE: _0x2f6f36(339, "#dlW"),
        KNGPv: "ymYnL",
        ieSwt: function(_0x1873ce, _0x5a3475) {
            return _0x1873ce === _0x5a3475;
        },
        LXULo: function(_0xd1753a, _0x390aef) {
            return _0xd1753a === _0x390aef;
        },
        mvAHv: function(_0x34d6a6, _0x4ba84b) {
            return _0x34d6a6 === _0x4ba84b;
        },
        EPmGC: function(_0x1f096a, _0x26df41) {
            return _0x1f096a === _0x26df41;
        },
        jvNXk: _0x2f6f36(714, "naHr"),
        GmlMq: _0x2f6f36(462, "naHr")
    }, _0x1039cd = await axios["get"](_0x2f6f36(473, "PLar"), {
        params: {
            pathName: _0x30770b["id"],
            pageNum: 1,
            pageSize: 100
        },
        headers: {
            Accept: _0x608a43[_0x2f6f36(445, "t7Y6")],
            "Accept-Encoding": _0x608a43[_0x2f6f36(387, "%fmY")],
            Connection: "keep-alive",
            Host: _0x2f6f36(389, "4CwE"),
            referer: _0x2f6f36(405, "QYxY") + _0x30770b["id"],
            "User-Agent": UA,
            By: By
        }
    });
    return Object[_0x2f6f36(630, "QCah")](Object[_0x2f6f36(412, "PLar")]({}, _0x30770b), {
        musicList: _0x1039cd[_0x2f6f36(733, "j4DT")][_0x2f6f36(618, "%fmY")][_0x2f6f36(721, "%b[x")]["items"][_0x2f6f36(676, "naHr")](_0x30a6db => {
            const _0x8e75e8 = _0x2f6f36, _0x504f50 = {
                zlwhs: function(_0x26e20f, _0x268d6d) {
                    const _0x1c4a75 = _0x2e9f;
                    return _0x608a43[_0x1c4a75(385, "xoQM")](_0x26e20f, _0x268d6d);
                }
            };
            if (_0x608a43[_0x8e75e8(342, "af5q")](_0x608a43[_0x8e75e8(608, "4CwE")], _0x608a43[_0x8e75e8(524, "j4DT")])) {
                var _0x37787e, _0x17b5b5, _0x8af2b5, _0x601277, _0x5dae3e, _0x5b7cf8;
                return {
                    id: _0x30a6db["id"],
                    artwork: (_0x608a43[_0x8e75e8(726, "af5q")](_0x37787e = _0x30a6db[_0x8e75e8(692, "IRi!")], null) || _0x37787e === void 0 ? void 0 : _0x37787e[_0x8e75e8(382, "naHr")]("//")) ? _0x8e75e8(484, "p4B8") + _0x30a6db[_0x8e75e8(458, "3X0y")] : _0x30a6db[_0x8e75e8(631, "ynyD")],
                    title: _0x30a6db[_0x8e75e8(504, "ynyD")],
                    artist: _0x608a43[_0x8e75e8(746, "qais")](_0x8af2b5 = _0x608a43["dXhAf"](_0x17b5b5 = _0x30a6db[_0x8e75e8(625, "4CwE")], null) || _0x608a43[_0x8e75e8(684, "qais")](_0x17b5b5, void 0) ? void 0 : _0x17b5b5[_0x8e75e8(440, "#dlW")](_0x395792 => _0x395792[_0x8e75e8(866, "QCah")]), null) || _0x608a43[_0x8e75e8(302, "QYxY")](_0x8af2b5, void 0) ? void 0 : _0x8af2b5[_0x8e75e8(561, "8h]s")](", "),
                    album: _0x608a43[_0x8e75e8(759, "QCah")](_0x601277 = _0x30a6db[_0x8e75e8(328, "(eO&")], null) || _0x608a43["mvAHv"](_0x601277, void 0) ? void 0 : _0x601277[_0x8e75e8(423, "GGAw")],
                    copyrightId: _0x30a6db[_0x8e75e8(843, "C2D5")],
                    singerId: _0x608a43[_0x8e75e8(623, "a4%o")](_0x5b7cf8 = _0x608a43[_0x8e75e8(362, "%b[x")](_0x5dae3e = _0x30a6db["singers"], null) || _0x608a43[_0x8e75e8(629, "*K#S")](_0x5dae3e, void 0) ? void 0 : _0x5dae3e[0], null) || _0x608a43["ieSwt"](_0x5b7cf8, void 0) ? void 0 : _0x5b7cf8["id"]
                };
            } else _0x35b19a = _0x504f50["zlwhs"](_0x343226 = _0x521458[_0x8e75e8(722, "%NhA")](/id=(\d+)/), null) || _0x504f50[_0x8e75e8(723, "Row4")](_0x306eda, void 0) ? void 0 : _0x5d9a90[1];
        })
    });
}

async function getRecommendSheetTags() {
    const _0x53159a = _0x49df7c, _0x3b4f4f = {
        Hnqqi: function(_0x25dd16, _0x294e6f) {
            return _0x25dd16 === _0x294e6f;
        },
        NvKrj: function(_0x1d3b2d, _0x168f6e) {
            return _0x1d3b2d === _0x168f6e;
        },
        uGvrS: function(_0x19a606, _0x296678) {
            return _0x19a606 === _0x296678;
        },
        UMgLI: function(_0x31cab3, _0x24cde4) {
            return _0x31cab3 !== _0x24cde4;
        },
        GAUMu: "dXknf",
        OZHgO: "https://m.music.migu.cn/migumusic/h5/playlist/allTag",
        euDoW: _0x53159a(396, "xoQM"),
        EXugF: _0x53159a(884, "8h]s"),
        mMAwg: _0x53159a(614, "3X0y"),
        STOcf: _0x53159a(508, "qais"),
        JvvtS: _0x53159a(485, "a4%o"),
        EsEVf: _0x53159a(541, "t7Y6"),
        jOlsn: _0x53159a(810, "NICk"),
        vIOki: "1000001749",
        RxZTJ: _0x53159a(526, "xoQM")
    }, _0x366a3c = (await axios[_0x53159a(778, "8biT")][_0x53159a(762, "j4DT")](_0x3b4f4f[_0x53159a(592, "naHr")], {
        headers: {
            host: _0x53159a(640, "xvZL"),
            referer: _0x3b4f4f["euDoW"],
            "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1 Edg/113.0.0.0",
            By: _0x3b4f4f[_0x53159a(806, "PLar")]
        }
    }))[_0x53159a(590, "eAqd")]["data"][_0x53159a(426, "qDhz")], _0x14f93e = _0x366a3c["map"](_0x489438 => {
        const _0x1f2283 = _0x53159a, _0x5dca3f = {
            ejaQy: function(_0xf2da68, _0x3c8ac6) {
                return _0xf2da68 === _0x3c8ac6;
            },
            cEjOC: function(_0x20fc49, _0x227598) {
                return _0x20fc49 === _0x227598;
            },
            iVUXm: function(_0x49583f, _0x1f056b) {
                return _0x3b4f4f["Hnqqi"](_0x49583f, _0x1f056b);
            },
            DVyQm: function(_0x17f2e8, _0x331713) {
                const _0x3432b3 = _0x2e9f;
                return _0x3b4f4f[_0x3432b3(862, "@FrH")](_0x17f2e8, _0x331713);
            },
            mRKAA: function(_0x25cb80, _0x4a70a7) {
                const _0x2566d9 = _0x2e9f;
                return _0x3b4f4f[_0x2566d9(687, "LsE%")](_0x25cb80, _0x4a70a7);
            },
            grlYb: function(_0x5e2e22, _0xe8e71b) {
                const _0x13fb71 = _0x2e9f;
                return _0x3b4f4f[_0x13fb71(364, "t7Y6")](_0x5e2e22, _0xe8e71b);
            },
            Pkcfd: function(_0x2a97e1, _0x53996f) {
                return _0x2a97e1 === _0x53996f;
            },
            PPrBX: function(_0x1751d5, _0x545c04) {
                return _0x3b4f4f["UMgLI"](_0x1751d5, _0x545c04);
            },
            ducVZ: function(_0x4b6828, _0x2a0ffc) {
                return _0x4b6828 === _0x2a0ffc;
            },
            IDlsj: function(_0x358b45, _0x2e24cb) {
                return _0x358b45 === _0x2e24cb;
            }
        };
        if (_0x3b4f4f["UMgLI"](_0x3b4f4f["GAUMu"], _0x1f2283(820, "p4B8"))) return {
            title: _0x489438[_0x1f2283(365, "j4DT")],
            data: _0x489438[_0x1f2283(426, "qDhz")][_0x1f2283(655, "qais")](_0x246b53 => ({
                id: _0x246b53[_0x1f2283(632, "xvZL")],
                title: _0x246b53["tagName"]
            }))
        }; else {
            var _0x5c3eaf, _0x10cc5d, _0x5e391b, _0x45411e, _0x18e41f, _0x372b58, _0x404a48, _0x5acf66, _0x1b0321, _0x474329;
            return {
                id: _0x3670d8["id"],
                artwork: (_0x5dca3f["ejaQy"](_0x5c3eaf = _0x1d008d[_0x1f2283(674, "GGAw")], null) || _0x5dca3f["cEjOC"](_0x5c3eaf, void 0) ? void 0 : _0x5c3eaf[_0x1f2283(701, "qais")]("//")) ? _0x1f2283(616, "xoQM") + _0xee3198["mediumPic"] : _0x2249f2[_0x1f2283(638, "qais")],
                title: _0x1b7518["name"],
                artist: (_0x372b58 = _0x5dca3f[_0x1f2283(309, "(eO&")](_0x18e41f = _0x5dca3f[_0x1f2283(783, "IRi!")](_0x45411e = (_0x5e391b = _0x5dca3f[_0x1f2283(704, "p4B8")](_0x10cc5d = _0x4c2a8b["singers"], null) || _0x5dca3f["mRKAA"](_0x10cc5d, void 0) ? void 0 : _0x10cc5d["map"]) === null || _0x5dca3f["grlYb"](_0x5e391b, void 0) ? void 0 : _0x5e391b["call"](_0x10cc5d, _0x3e94c7 => _0x3e94c7[_0x1f2283(829, "#dlW")]), null) || _0x45411e === void 0 ? void 0 : _0x45411e[_0x1f2283(749, "[Q#0")], null) || _0x5dca3f[_0x1f2283(840, "KvQC")](_0x18e41f, void 0) ? void 0 : _0x18e41f["call"](_0x45411e, ",")) !== null && _0x372b58 !== void 0 ? _0x372b58 : "",
                album: _0x5dca3f["PPrBX"](_0x5acf66 = _0x5dca3f[_0x1f2283(716, "LsE%")](_0x404a48 = _0x379c4a[_0x1f2283(497, "OPk0")], null) || _0x404a48 === void 0 ? void 0 : _0x404a48["albumName"], null) && _0x5dca3f[_0x1f2283(563, "qDhz")](_0x5acf66, void 0) ? _0x5acf66 : "",
                copyrightId: _0x47833a["copyrightId"],
                singerId: (_0x474329 = (_0x1b0321 = _0x41c1e5[_0x1f2283(790, "naHr")]) === null || _0x5dca3f["ejaQy"](_0x1b0321, void 0) ? void 0 : _0x1b0321[0]) === null || _0x5dca3f[_0x1f2283(874, "^FVx")](_0x474329, void 0) ? void 0 : _0x474329["id"]
            };
        }
    });
    return {
        pinned: [ {
            title: _0x3b4f4f[_0x53159a(601, "t7Y6")],
            id: _0x3b4f4f[_0x53159a(648, "ChD)")]
        }, {
            title: _0x3b4f4f[_0x53159a(678, "eAqd")],
            id: _0x3b4f4f[_0x53159a(532, "QYxY")]
        }, {
            title: "姘戣埃",
            id: _0x3b4f4f["jOlsn"]
        }, {
            title: "鏃呰",
            id: _0x3b4f4f[_0x53159a(538, "s@%T")]
        }, {
            title: "鎬濆康",
            id: _0x3b4f4f[_0x53159a(822, "r0Ru")]
        } ],
        data: _0x14f93e
    };
}

async function getRecommendSheetsByTag(_0x55cf0f, _0xb2380d) {
    const _0x516622 = _0x49df7c, _0x2f1803 = {
        kSFjm: "Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1 Edg/113.0.0.0",
        jxLFR: _0x516622(846, "^FVx"),
        hYmEy: function(_0x16adb3, _0x552fff) {
            return _0x16adb3 > _0x552fff;
        },
        yYGag: function(_0x1ec4f1, _0x18b22c) {
            return _0x1ec4f1 * _0x18b22c;
        }
    }, _0x15348d = 20, _0x3d5280 = (await axios[_0x516622(291, "IRi!")]("https://m.music.migu.cn/migumusic/h5/playlist/list", {
        params: {
            columnId: 15127272,
            tagId: _0x55cf0f["id"],
            pageNum: _0xb2380d,
            pageSize: _0x15348d
        },
        headers: {
            "user-agent": _0x2f1803["kSFjm"],
            host: _0x516622(535, "IRi!"),
            By: _0x2f1803[_0x516622(784, "ChD)")],
            Referer: _0x516622(825, "GGAw")
        }
    }))[_0x516622(818, "^wal")][_0x516622(347, "xvZL")], _0x54a884 = _0x2f1803[_0x516622(609, "8biT")](_0x2f1803[_0x516622(670, "af5q")](_0xb2380d, _0x15348d), _0x3d5280[_0x516622(498, "s@%T")]), _0x445d65 = _0x3d5280[_0x516622(457, "%b[x")]["map"](_0x5f07f1 => ({
        id: _0x5f07f1[_0x516622(549, "yH8*")],
        artist: _0x5f07f1[_0x516622(525, "Row4")],
        title: _0x5f07f1[_0x516622(550, "%[vJ")],
        artwork: _0x5f07f1[_0x516622(544, "QCah")][_0x516622(780, "xoQM")]("//") ? "http:" + _0x5f07f1["image"] : _0x5f07f1[_0x516622(410, "xvZL")],
        playCount: _0x5f07f1["playCount"],
        createUserId: _0x5f07f1[_0x516622(837, "GGAw")]
    }));
    return {
        isEnd: _0x54a884,
        data: _0x445d65
    };
}

async function getMediaSourceByMTM(_0x563316, _0x2d8af0) {
    const _0x23fe3c = _0x49df7c, _0x31c13d = {
        ONAxl: function(_0x4521d3, _0x544865) {
            return _0x4521d3 === _0x544865;
        },
        mPnpH: _0x23fe3c(734, "4CwE"),
        mNJGg: function(_0x3ebd74, _0x1c45d7) {
            return _0x3ebd74 === _0x1c45d7;
        },
        qGkQp: _0x23fe3c(871, "QYxY"),
        WKGVS: function(_0x53fa58, _0x131cee) {
            return _0x53fa58 === _0x131cee;
        },
        Qjbqg: _0x23fe3c(386, "8h]s"),
        TAqbk: _0x23fe3c(833, "ynyD"),
        hTyEs: _0x23fe3c(675, "KvQC"),
        HxlDK: "same-origin",
        EPubS: _0x23fe3c(770, "8biT")
    };
    if (_0x31c13d["ONAxl"](_0x2d8af0, _0x31c13d[_0x23fe3c(855, "QYxY")]) && _0x563316[_0x23fe3c(446, "Xuov")]) return _0x31c13d[_0x23fe3c(512, "a4%o")](_0x31c13d[_0x23fe3c(361, "@FrH")], _0x23fe3c(495, "4CwE")) ? {
        url: _0x563316["url"]
    } : {
        isEnd: !![],
        musicList: []
    }; else {
        if (_0x31c13d[_0x23fe3c(363, "BOH1")](_0x2d8af0, _0x31c13d["mPnpH"])) {
            const _0x140738 = {
                Accept: _0x31c13d[_0x23fe3c(555, "^Xu9")],
                "Accept-Encoding": _0x23fe3c(348, "r0Ru"),
                "Accept-Language": _0x31c13d[_0x23fe3c(407, "%b[x")],
                Connection: _0x23fe3c(588, "p4B8"),
                "Content-Type": _0x23fe3c(321, "8h]s"),
                Host: _0x23fe3c(766, "KvQC"),
                Referer: "https://m.music.migu.cn/migu/l/?s=149&p=163&c=5200&j=l&id=" + _0x563316[_0x23fe3c(318, "%b[x")],
                "Sec-Fetch-Dest": _0x31c13d["hTyEs"],
                "Sec-Fetch-Mode": _0x23fe3c(411, "Hk(n"),
                "Sec-Fetch-Site": _0x31c13d[_0x23fe3c(849, "OPk0")],
                "User-Agent": _0x23fe3c(483, "qDhz"),
                "X-Requested-With": "XMLHttpRequest"
            }, _0x3fd0d2 = (await axios[_0x23fe3c(852, "yH8*")](_0x31c13d[_0x23fe3c(290, "ynyD")], {
                headers: _0x140738,
                params: {
                    cpid: _0x563316[_0x23fe3c(318, "%b[x")]
                }
            }))[_0x23fe3c(667, "r0Ru")][_0x23fe3c(667, "r0Ru")];
            return {
                artwork: _0x563316["artwork"] || _0x3fd0d2["picL"],
                url: _0x3fd0d2["listenUrl"] || _0x3fd0d2[_0x23fe3c(293, "NICk")] || _0x3fd0d2[_0x23fe3c(879, "Hk(n")]
            };
        }
    }
}

const qualityLevels = {
    low: "PQ",
    standard: "HQ",
    high: "SQ",
    super: _0x49df7c(511, "naHr")
};

async function getMediaSource(_0x34967d, _0x5cc7f7) {
    const _0x30f983 = _0x49df7c, _0x58ec2f = (await axios[_0x30f983(576, "Xuov")](_0x30f983(448, "C2D5") + _0x34967d["id"] + _0x30f983(514, "xvZL") + qualityLevels[_0x5cc7f7]))[_0x30f983(317, "8biT")];
    return {
        url: _0x58ec2f[_0x30f983(626, "p4B8")][_0x30f983(568, "g*0B")]
    };
}

export default {
    platform: _0x49df7c(421, "OPk0"),
    author: _0x49df7c(371, "#dlW"),
    version: "0.1.0",
    appVersion: _0x49df7c(408, "ChD)"),
    hints: {
        importMusicSheet: [ _0x49df7c(345, "%fmY"), "H5/PC绔細澶嶅埗URL骞剁矘璐达紝鎴栬€呯洿鎺ヨ緭鍏ョ函鏁板瓧姝屽崟ID鍗冲彲", _0x49df7c(776, "fQnR") ]
    },
    primaryKey: [ "id", _0x49df7c(796, "OPk0") ],
    cacheControl: _0x49df7c(765, "Row4"),
    srcUrl: _0x49df7c(522, "%b[x"),
    supportedSearchType: [ _0x49df7c(839, "@FrH"), _0x49df7c(651, "LsE%"), _0x49df7c(414, "BOH1"), _0x49df7c(441, "t7Y6"), _0x49df7c(327, "Row4") ],
    getMediaSource: getMediaSource,
    async search(_0x5ecd7e, _0x2b2a09, _0x39d51f) {
        const _0x372806 = _0x49df7c, _0x294cb9 = {
            RNbxZ: function(_0x485666, _0x836283) {
                return _0x485666 === _0x836283;
            },
            JAqHu: function(_0x20fa1f, _0x265fcd, _0x469571) {
                return _0x20fa1f(_0x265fcd, _0x469571);
            },
            vOEcQ: _0x372806(502, "qDhz"),
            iyyns: function(_0x3b6f23, _0x5016aa) {
                return _0x3b6f23 === _0x5016aa;
            },
            fDjVH: "sheet",
            ndAbt: "MFLJp",
            bPDsH: function(_0x17c7bc, _0x2117b4) {
                return _0x17c7bc === _0x2117b4;
            },
            BEQBF: _0x372806(681, "p4B8"),
            krgOH: function(_0xb6da8, _0xae7482, _0x470334) {
                return _0xb6da8(_0xae7482, _0x470334);
            }
        };
        if (_0x294cb9[_0x372806(570, "j4DT")](_0x39d51f, "music")) return await _0x294cb9["JAqHu"](searchMusic, _0x5ecd7e, _0x2b2a09);
        if (_0x39d51f === _0x294cb9[_0x372806(331, "fQnR")]) return await searchAlbum(_0x5ecd7e, _0x2b2a09);
        if (_0x294cb9["iyyns"](_0x39d51f, "artist")) return await _0x294cb9["JAqHu"](searchArtist, _0x5ecd7e, _0x2b2a09);
        if (_0x294cb9[_0x372806(752, "p4B8")](_0x39d51f, _0x294cb9[_0x372806(536, "fQnR")])) {
            if (_0x294cb9[_0x372806(653, "af5q")](_0x294cb9[_0x372806(356, "@FrH")], _0x294cb9[_0x372806(337, "%NhA")])) return await searchMusicSheet(_0x5ecd7e, _0x2b2a09); else _0x2cc0f2 = (_0x27cfe6[_0x372806(425, "Vk$@")](/https?:\/\/music\.migu\.cn\/v3\/(?:my|music)\/playlist\/([0-9]+)/) || [])[1];
        }
        if (_0x294cb9[_0x372806(557, "BOH1")](_0x39d51f, _0x294cb9["BEQBF"])) return await _0x294cb9[_0x372806(548, "8biT")](searchLyric, _0x5ecd7e, _0x2b2a09);
    },
    async getAlbumInfo(_0x2fea0f) {
        const _0x3ffdc2 = _0x49df7c, _0x29cdab = {
            ooPis: _0x3ffdc2(453, "KvQC"),
            BLXTG: "gzip, deflate, br",
            WFlFS: "application/x-www-form-urlencoded; charset=UTF-8",
            HANyf: _0x3ffdc2(826, "p4B8"),
            Pjsft: _0x3ffdc2(559, "#dlW"),
            JKGJH: _0x3ffdc2(610, "%NhA"),
            RbJnp: _0x3ffdc2(329, "(eO&"),
            tRxxb: _0x3ffdc2(352, "x&2V"),
            GlGLJ: _0x3ffdc2(450, "NICk"),
            KMFxP: "https://m.music.migu.cn/migu/remoting/cms_album_detail_tag"
        }, _0x168859 = {
            Accept: _0x29cdab[_0x3ffdc2(859, "C2D5")],
            "Accept-Encoding": _0x29cdab[_0x3ffdc2(406, "QCah")],
            "Accept-Language": _0x3ffdc2(351, "%NhA"),
            Connection: _0x3ffdc2(847, "a4%o"),
            "Content-Type": _0x29cdab[_0x3ffdc2(815, "NICk")],
            Host: _0x3ffdc2(355, "Row4"),
            Referer: _0x3ffdc2(464, "^wal") + _0x2fea0f["id"],
            "Sec-Fetch-Dest": _0x29cdab[_0x3ffdc2(786, "8h]s")],
            "Sec-Fetch-Mode": _0x29cdab[_0x3ffdc2(719, "%b[x")],
            "Sec-Fetch-Site": _0x29cdab["JKGJH"],
            "User-Agent": _0x29cdab[_0x3ffdc2(612, "LsE%")],
            "X-Requested-With": _0x29cdab[_0x3ffdc2(647, "^wal")]
        }, _0x52dd14 = (await axios[_0x3ffdc2(767, "xvZL")][_0x3ffdc2(460, "LsE%")](_0x29cdab[_0x3ffdc2(858, "KvQC")], {
            headers: _0x168859,
            params: {
                albumId: _0x2fea0f["id"],
                pageSize: 30
            }
        }))["data"] || {}, _0xe3cd2a = (await axios[_0x3ffdc2(394, "xoQM")](_0x29cdab[_0x3ffdc2(488, "OPk0")], {
            headers: _0x168859,
            params: {
                albumId: _0x2fea0f["id"]
            }
        }))[_0x3ffdc2(819, "@FrH")] || {};
        return {
            albumItem: {
                description: _0xe3cd2a[_0x3ffdc2(323, "ynyD")]
            },
            musicList: _0x52dd14[_0x3ffdc2(622, "8biT")]["results"][_0x3ffdc2(883, "af5q")](_0x2ca77b => ({
                id: _0x2ca77b[_0x3ffdc2(481, "QCah")],
                artwork: _0x2ca77b[_0x3ffdc2(551, "Row4")],
                title: _0x2ca77b[_0x3ffdc2(580, "r0Ru")],
                artist: (_0x2ca77b["singerName"] || [])["join"](", "),
                album: _0x2fea0f["title"],
                url: musicCanPlayFilter(_0x2ca77b),
                rawLrc: _0x2ca77b[_0x3ffdc2(813, "4CwE")],
                copyrightId: _0x2ca77b[_0x3ffdc2(744, "%NhA")],
                singerId: _0x2ca77b[_0x3ffdc2(459, "eAqd")]
            }))
        };
    },
    getArtistWorks: getArtistWorks,
    getLyric: getLyric,
    importMusicSheet: importMusicSheet,
    getTopLists: getTopLists,
    getTopListDetail: getTopListDetail,
    getRecommendSheetTags: getRecommendSheetTags,
    getRecommendSheetsByTag: getRecommendSheetsByTag,
    getMusicSheetInfo: getMusicSheetInfo
};

var version_ = "jsjiami.com.v7";