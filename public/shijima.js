const APIURL = "/shijima/"


window.onload = function () {
    const sideBar = new Vue({
        el: '#left-panel',
        data: {
            selectedBoard: null,
            boards: [
                {
                    id: 1,
                    name: "闲聊",
                    intro: "请期待破岛的完全体，不过真的有人期待么……",
                    // },{
                    //     id : 2,
                    //     name : "测试2"
//                }, {
//                    id: 4,
//                    name: "综合版4",
//                    intro: "为什么是4呢",
                }, {
                    id: 12,
                    name: "串",
                    intro: "这里可以演巨魔，所以其他板块就不行了",
                }, {
                    id: 23,
                    name: "打捞",
                    intro: "用来转贴或者什么的，发点有趣的东西吧",
                }, {
                    id: 34,
                    name: "动画漫画"
//                }, {
//                    id: 35,
//                    name: "NSFW",
//                    intro: "Not Safe for Work"
                }, {
                    id: 45,
                    name: "贴图"
                }, {
                    id: 46,
                    name: "贴图(R18)",
                    intro: "含有露骨的描写请慎重游览",
                },{
                    id : 47,
                    name : "桃饱",
                intro: "客官请吃桃",
//                },{
//                    id : 48,
//                    name : "随缘(R18)",
//                    intro: "放置希望翻译的散图,含有露骨的描写请慎重游览",
//                },{
//                    id: 99,
//                    name: "门房"
//                },{
//                    id : 100,
//                    name : "/int/",
//intro:"lonely",
                },{
                    id : 101,
                    name : "在这理发店",
                    intro : "记得备份",
                },{
                    id : 102,
                    name : "自习室",
                    intro : "万古如长夜(注意备份),也欢迎一起发串的",
                },{
                    id : 104,
                    name : "时尚",
//                    intro : "别发轮子新闻",
                },{
                        id : 105,
                        name : "Paper Reading",
                },{
                        id : 106,
                        name : "意识形态分析",
                },
            ]
        },
        methods: {
            viewBoard(board) {
                this.selectedBoard = board.id;
                // you can also handle toggle action here manually to open and close dropdown
                console.info(this.selectedBoard)

                threadPanel.bPage = 0;
                threadPanel.bid = board.id;
                threadPanel.tid = 0;
                postPanel.bid = board.id;
                postPanel.tid = 0;
                postPanel.infotitle = board.name;
                postPanel.infotxt = board.intro;
                fetch(APIURL,
                    {
                        method: "POST",
                        mode: 'cors',
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded',
                        },
                        body: JSON.stringify({
                            m: "dir",
                            tid: 0,
                            bid: board.id,
                            page: 0,
                        })
                    })
                    .then(response => response.json())
                    .then(data => {
                        threadPanel.threads = data;
                        // 复位加载更多
                        threadPanel.lengthOfLastPage = 15;
                        postPanel.showPostContiner = true;
                        // 修改网址
                        url = new URL(window.location);
                        url.search = ""
                        url.searchParams.set('bid', board.id);
                        window.history.pushState({}, '', url);
                    }
                    );

            },
        }
    });

    const threadPanel = new Vue({
        el: '#thread-panel',
        created(){

        },
        data: {
            bid: 0,
            tid: 0,
            threadsOfBoard: [],
            threads: [],
            bPage: 0,
            tPage: 0,
            lengthOfLastPage: -1,

            pList: [
                "i.pximg.net",
                "pbs.twimg.com",
                "sinaimg.cn",
                "chkaja.com",
                "inari.site",
                "hana-sweet.top",
                "p.sda1.dev",
            ],
        },
        mounted() {
            var str = ""
            for (var i = 0; i < this.pList.length; i++) {
                str += "|"
                str += this.pList[i]
            }
            regex = new RegExp("^https://(\\w[\\w\\.]*\\.)?(" + str.substr(1) + ")/.*$");
            //
            this.directView()
            window.directViewThreadPanel = this.directView
        },
        methods: {
            directView(){
                var url = new URL(window.location);
                if (url.searchParams.get("bid") == null){
                    this.bid = 0
                    this.lengthOfLastPage = -1
                    this.threads = []
                    this.tid = 0
                    return;
                }else{
                    this.bid = parseInt(url.searchParams.get("bid"), 10)
                }
                if (url.searchParams.get("tid") == null){
                    this.tid = 0
                }else{
                    this.tid = parseInt(url.searchParams.get("tid"), 10)
                }
                if (url.searchParams.get("page") == null){
                    this.tPage = 0
                }else{
                    this.tPage = parseInt(url.searchParams.get("page"), 10)
                } ;
                fetch(APIURL,
                    {
                        method: "POST",
                        mode: 'cors',
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded',
                        },
                        body: JSON.stringify({
                            m: "dir",
                            tid: this.tid,
                            bid: this.bid,
                            page: this.tPage,
                        })
                    })
                    .then(response => response.json())
                    .then(data => {
                        // console.log("草？")
                        this.threads = data;
                        // 复位加载更多
                        this.lengthOfLastPage = 15;
                        postPanel.showPostContiner = true;
                    }
                    );
            },
            nextPage() {
                this.bPage = this.bPage + 1;
                fetch(APIURL,
                    {
                        method: "POST",
                        mode: 'cors',
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded',
                        },
                        body: JSON.stringify({
                            m: "dir",
                            tid: 0,
                            bid: this.bid,
                            page: this.bPage,
                        })
                    })
                    .then(response => response.json())
                    .then(data => {
                        this.lengthOfLastPage = data.length;
                        this.threads = this.threads.concat(data);
                    }
                    );
            },
            viewThread(threadObj, page, replyID) {
                if (this.bid == 0) { // 不响应bid为0的情况
                    return
                }
                if (replyID == 0) { // 点击No.{{replyID}} 时刻的响应
                    // todo
                } else {
                    // todo
                }
                // this.threadsOfBoard = this.threads;
                this.tid = threadObj.no;
                postPanel.tid = threadObj.no;
                fetch(APIURL,
                    {
                        method: "POST",
                        mode: 'cors',
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded',
                        },
                        body: JSON.stringify({
                            m: "dir",
                            tid: this.tid,
                            bid: this.bid,
                            page: page,
                        })
                    })
                    .then(response => response.json())
                    .then(data => {
                        this.threads = data;
                        this.tPage = page;
                        // 修改网址
                        url = new URL(window.location);
                        if (this.tid > 0) {
                            url.searchParams.set('tid', this.tid);
                        }
                        url.searchParams.set('page', this.tPage);
                        window.history.pushState({}, '', url);
                    }
                    );

            },
            viewBoard(board) {
                this.bid = board.id;
                // you can also handle toggle action here manually to open and close dropdown
                console.info(this.bid)
                fetch(APIURL,
                    {
                        method: "POST",
                        mode: 'cors',
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded',
                        },
                        body: JSON.stringify({
                            m: "dir",
                            tid: 0,
                            bid: board.id,
                            page: 0,
                        })
                    })
                    .then(response => response.json())
                    .then(data => {
                        // console.log(data); // JSON data parsed by `data.json()` call
                        // renewBoard(threadPanel, data);
                        //
                        this.threads = data;
                        this.bPage = 0;
                        this.bid = board.id;
                        postPanel.bid = board.id;
                        // 复位加载更多
                        this.lengthOfLastPage = 15;
                        postPanel.showPostContiner = true;
                        // 修改网址
                        url = new URL(window.location);
                        url.search = ""
                        url.searchParams.set('bid', board.id);
                        window.history.pushState({}, '', url);
                    }
                    );

            },
        },
        filters: {
            dateFilter: function (time) {
                if (!time) {
                    // 当时间是null或者无效格式时我们返回空
                    return ''
                } else {
                    const date = new Date(time * 1000) // 时间戳为10位需*1000，时间戳为13位的话不需乘1000
                    const dateNumFun = (num) => num < 10 ? `0${num}` : num // 使用箭头函数和三目运算以及es6字符串的简单操作。因为只有一个操作不需要{} ，目的就是数字小于10，例如9那么就加上一个0，变成09，否则就返回本身。        // 这是es6的解构赋值。
                    // console.log(date)
                    const [Y, M, D, h, m, s] = [
                        date.getFullYear(),
                        dateNumFun(date.getMonth() + 1),
                        dateNumFun(date.getDate()),
                        dateNumFun(date.getHours()),
                        dateNumFun(date.getMinutes()),
                        dateNumFun(date.getSeconds())
                    ]
                    return `${Y}-${M}-${D} ${h}:${m}:${s}` // 一定要注意是反引号，否则无效。
                }
            },
            picChecker: function (h) {
                // console.log(h)
                if (h == "") return "";
                if (!regex.test(h)) {
//                    return "/pic403.webp"; //屏蔽未认证图床
                }
                h = h.replace("i.pximg.net", "pximg.moonchan.xyz")
                h = h.replace("pbs.twimg.com", "twimg.moonchan.xyz")
                h = h.replace("ex.moonchan.xyz", "ehwv.moonchan.xyz/image")
                h = h.replace("ex.nmbyd1.top", "ehwv.moonchan.xyz/image")
                h = h.replace("ex.nmbyd2.top", "ehwv.moonchan.xyz/image")
                h = h.replace("exhentai.org", "ehwv.moonchan.xyz/image")
                h = h.replace("e-hentai.org", "ehwv.moonchan.xyz/image")
                return h
            },
            redirect: function (h) {
                console.log(h)
                h = h.replace("i.pximg.net", "pximg.moonchan.xyz")
                h = h.replace("pbs.twimg.com", "twimg.moonchan.xyz")
                h = h.replace("ex.moonchan.xyz", "ehwv.moonchan.xyz/image")
                h = h.replace("ex.nmbyd1.top", "ehwv.moonchan.xyz/image")
                h = h.replace("ex.nmbyd2.top", "ehwv.moonchan.xyz/image")
                h = h.replace("exhentai.org", "ehwv.moonchan.xyz/image")
                h = h.replace("e-hentai.org", "ehwv.moonchan.xyz/image")
                return h
            },
            txtFilter: function (t) {
                t = t.replaceAll("\n", "<br>")
                return t
            }
        }
    });

    const postPanel = new Vue({
        el: '#poster-continer',
        data: {
            showPostContiner: false,
            isDisabled: false,

            infotitle: " ",
            infotxt: " ",

            title: "",
            name: "",
            pic: "",
            id: "",
            auth: "",
            txt: "",

            bid: 0,
            tid: 0,

            tPage: 0,
            bPage: 0,
        },
        mounted(){
            this.directView()
            window.directViewPostPanel = this.directView
        },
        methods: {
            directView(){
                this.infotitle = ""
                this.infotxt = ""
                var url = new URL(window.location);
                if (url.searchParams.get("bid") == null){
                    // console.log("??????")
                    this.showPostContiner = false
                    this.bid = 0
                    // console.log(this.lengthOfLastPage)
                    // console.log(this.threads)
                    // console.log(this.tid)
                    // console.log(this.bid)
                    // console.log("*****")
                    return
                }else{
                    this.bid = parseInt(url.searchParams.get("bid"), 10)
                }
                if (url.searchParams.get("tid") == null){
                    this.tid = 0
                    return
                }else{
                    this.tid = parseInt(url.searchParams.get("tid"), 10)
                }
            },
            postThread() {
                // console.log("strat postThread")
                this.isDisabled = true;
                if (this.txt == "" && this.pic == "") {
                    this.isDisabled = false;
                    return;
                }
                var page = 0
                if (threadPanel.tid > 0) {
                    page = threadPanel.tPage
                    // console.log(threadPanel.tPage);
                    // console.log(page);
                    // console.log("----");
                    threadPanel.threads[0].list = [];
                } else{
                    threadPanel.threads = [];
                }
                var data = {
                    m: "post",
                    tid: this.tid,
                    bid: this.bid,
                    n: this.name,
                    t: this.title,
                    id: this.id,
                    auth: this.auth,
                    txt: this.txt,
                    p: this.pic,
                    page: page,
                }
                fetch("/api/", {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: JSON.stringify(data)// body data type must match "Content-Type" header
                })
                    .then(response => response.json())
                    .then(data => {
                        // this.lengthOfLastPage = data.length;
                        threadPanel.threads = data;
                        threadPanel.lengthOfLastPage = 15;
                        console.log("postThreadFlushBoard");
                        console.log(this.bid);
                        console.log(this.bPage);
                        console.log(this.threads);
                        console.log(this.lengthOfLastPage);

                        this.isDisabled = false;
                        console.log(data.length)
                        if (data.length > 0) {
                            this.txt = ""
                            this.pic = ""
                        }
                    });
            }
        }
    })

    const headerPanel = new Vue({
        el: '#header-panel',
        data: {
            id: "",
            auth: "",
            isAbled: true
        },
        mounted() {
            if (localStorage.auth == "" || localStorage.auth == null){
                                this.getID()
                        }
            if (localStorage.id && localStorage.auth) {
                this.id = localStorage.id;
                this.auth = localStorage.auth;
                postPanel.id = localStorage.id;
                postPanel.auth = localStorage.auth;
            }

        },

        methods: {
            delID() {
                localStorage.id = "";
                localStorage.auth = "";
                this.id = localStorage.id;
                this.auth = localStorage.auth;
                postPanel.id = localStorage.id;
                postPanel.auth = localStorage.auth;
            },
            getID() {
                this.isAbled = false

                fetch(APIURL + "cookie")
                    .then(response => response.json())
                    .then(data => {
                        // this.lengthOfLastPage = data.length;
                        this.id = data.id
                        this.auth = data.auth
                        localStorage.id = data.id
                        localStorage.auth = data.auth
                        postPanel.id = localStorage.id;
                        postPanel.auth = localStorage.auth;

                        this.isAbled = true
                    });
            }
        },

    })
}