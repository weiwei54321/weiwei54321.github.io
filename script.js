/* co2_tw 個人網站腳本
   功能：明暗主題切換、手機選單、打字效果、進場動畫、數字計數、
         導覽高亮、複製按鈕、回到頂部
   沒有 JS 時網站仍可正常瀏覽（主題跟隨系統）。 */
(function () {
    "use strict";

    var root = document.documentElement;
    var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    /* ---------- 小工具 ---------- */
    function $(sel, ctx) { return (ctx || document).querySelector(sel); }
    function $all(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }

    function storageGet(key) {
        try { return localStorage.getItem(key); } catch (e) { return null; }
    }
    function storageSet(key, value) {
        try {
            if (value === null) localStorage.removeItem(key);
            else localStorage.setItem(key, value);
        } catch (e) { /* 隱私模式等情況下忽略 */ }
    }

    var toastEl = $(".toast");
    var toastTimer;
    function toast(msg) {
        if (!toastEl) return;
        toastEl.textContent = msg;
        toastEl.classList.add("show");
        clearTimeout(toastTimer);
        toastTimer = setTimeout(function () { toastEl.classList.remove("show"); }, 1800);
    }

    /* ---------- 1. 明暗主題切換（系統 → 亮色 → 暗色） ---------- */
    var THEMES = ["system", "light", "dark"];
    var THEME_META = {
        system: { label: "系統" },
        light:  { label: "亮色" },
        dark:   { label: "暗色" }
    };
    var themeBtn = $(".theme-toggle");

    function currentTheme() {
        var t = storageGet("theme");
        return t === "light" || t === "dark" ? t : "system";
    }

    function applyTheme(theme) {
        if (theme === "system") root.removeAttribute("data-theme");
        else root.setAttribute("data-theme", theme);

        if (themeBtn) {
            var meta = THEME_META[theme];
            themeBtn.setAttribute("data-mode", theme);
            $(".theme-label", themeBtn).textContent = meta.label;
            themeBtn.setAttribute("aria-label", "切換明暗主題，目前：" + meta.label);
        }
    }

    applyTheme(currentTheme());

    if (themeBtn) {
        themeBtn.addEventListener("click", function () {
            var next = THEMES[(THEMES.indexOf(currentTheme()) + 1) % THEMES.length];
            storageSet("theme", next === "system" ? null : next);
            applyTheme(next);
            toast("主題：" + THEME_META[next].label);
        });
    }

    /* ---------- 2. 手機選單 ---------- */
    var menuBtn = $(".menu-toggle");
    var navLinks = $(".nav-links");

    function closeMenu() {
        if (!menuBtn) return;
        menuBtn.setAttribute("aria-expanded", "false");
        menuBtn.setAttribute("aria-label", "開啟選單");
        navLinks.classList.remove("open");
    }

    if (menuBtn && navLinks) {
        menuBtn.addEventListener("click", function () {
            var open = menuBtn.getAttribute("aria-expanded") !== "true";
            menuBtn.setAttribute("aria-expanded", String(open));
            menuBtn.setAttribute("aria-label", open ? "關閉選單" : "開啟選單");
            navLinks.classList.toggle("open", open);
        });
        $all("a", navLinks).forEach(function (a) { a.addEventListener("click", closeMenu); });
        document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeMenu(); });
    }

    /* ---------- 3. 打字效果 ---------- */
    var typingEl = $(".typing-text");
    var phrases = [
        "> 正在呼吸中...",
        "> 玩玩 AI",
        "> 找找漏洞",
        "> 歡迎來到我的小站"
    ];

    if (typingEl) {
        if (reduceMotion) {
            typingEl.textContent = phrases[phrases.length - 1];
        } else {
            var pi = 0, ci = 0, deleting = false;
            (function tick() {
                var word = phrases[pi];
                ci += deleting ? -1 : 1;
                typingEl.textContent = word.slice(0, ci);

                var delay = deleting ? 40 : 90;
                if (!deleting && ci === word.length) { deleting = true; delay = 1600; }
                else if (deleting && ci === 0) { deleting = false; pi = (pi + 1) % phrases.length; delay = 400; }
                setTimeout(tick, delay);
            })();
        }
    }

    /* ---------- 4. 數字計數 ---------- */
    function countUp(el) {
        var target = parseInt(el.getAttribute("data-count"), 10) || 0;
        if (reduceMotion) { el.textContent = target; return; }
        var start = null, duration = 1200;
        function step(ts) {
            if (!start) start = ts;
            var p = Math.min((ts - start) / duration, 1);
            var eased = 1 - Math.pow(1 - p, 3);
            el.textContent = Math.round(target * eased);
            if (p < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
    }

    /* ---------- 5. 進場動畫 ---------- */
    var reveals = $all(".reveal");

    function reveal(el) {
        if (el.classList.contains("visible")) return;
        el.classList.add("visible");
        $all("[data-count]", el).forEach(countUp);
    }

    if ("IntersectionObserver" in window && !reduceMotion) {
        var io = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    reveal(entry.target);
                    io.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12 });
        reveals.forEach(function (el) { io.observe(el); });
    } else {
        reveals.forEach(reveal);
    }

    /* ---------- 6. 導覽列高亮目前區塊 ---------- */
    var navMap = {};
    $all(".nav-links a").forEach(function (a) {
        navMap[a.getAttribute("href").slice(1)] = a;
    });

    if ("IntersectionObserver" in window) {
        var spy = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;
                var link = navMap[entry.target.id];
                if (!link) return;
                $all(".nav-links a.active").forEach(function (a) { a.classList.remove("active"); });
                link.classList.add("active");
            });
        }, { rootMargin: "-45% 0px -50% 0px" });
        Object.keys(navMap).forEach(function (id) {
            var sec = document.getElementById(id);
            if (sec) spy.observe(sec);
        });
    }

    /* ---------- 7. 複製按鈕 ---------- */
    function fallbackCopy(text) {
        var ta = document.createElement("textarea");
        ta.value = text;
        ta.setAttribute("readonly", "");
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        var ok = false;
        try { ok = document.execCommand("copy"); } catch (e) {}
        document.body.removeChild(ta);
        return ok;
    }

    $all(".copy-btn").forEach(function (btn) {
        btn.addEventListener("click", function () {
            var text = btn.getAttribute("data-copy");
            var done = function () {
                var old = btn.textContent;
                btn.textContent = "已複製";
                toast("已複製到剪貼簿");
                setTimeout(function () { btn.textContent = old; }, 1500);
            };
            if (navigator.clipboard && window.isSecureContext) {
                navigator.clipboard.writeText(text).then(done, function () {
                    if (fallbackCopy(text)) done(); else toast("複製失敗，請手動複製");
                });
            } else if (fallbackCopy(text)) {
                done();
            } else {
                toast("複製失敗，請手動複製");
            }
        });
    });

    /* ---------- 8. 回到頂部 ---------- */
    var toTop = $(".to-top");
    if (toTop) {
        var onScroll = function () { toTop.classList.toggle("show", window.scrollY > 400); };
        window.addEventListener("scroll", onScroll, { passive: true });
        onScroll();
        toTop.addEventListener("click", function () {
            window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
        });
    }

    /* ---------- 9. 友站卡片（資料來自 somewebsite.js） ---------- */
    // 只允許 http(s) 網址或站內相對路徑，避免 javascript: 之類的連結
    function safeUrl(value, allowRelative) {
        if (typeof value !== "string" || !value.trim()) return null;
        try {
            var u = new URL(value.trim(), location.href);
            if (u.protocol !== "http:" && u.protocol !== "https:") return null;
            if (!allowRelative && !/^https?:\/\//i.test(value.trim())) return null;
            return u.href;
        } catch (e) {
            return null;
        }
    }

    function el(tag, className, text) {
        var node = document.createElement(tag);
        if (className) node.className = className;
        if (text != null) node.textContent = text;
        return node;
    }

    function makeImg(src, className, alt, onFail) {
        var img = el("img", className);
        img.src = src;
        img.alt = alt;
        img.loading = "lazy";
        img.decoding = "async";
        img.referrerPolicy = "no-referrer";
        img.addEventListener("error", onFail);
        return img;
    }

    function initialAvatar(name) {
        var span = el("span", "friend-avatar friend-avatar-text", Array.from(name)[0] || "?");
        span.setAttribute("aria-hidden", "true");
        return span;
    }

    function renderFriends() {
        var list = document.getElementById("friend-list");
        var empty = $(".friend-empty");
        if (!list) return;

        var sites = Array.isArray(window.FRIEND_SITES) ? window.FRIEND_SITES : [];
        var count = 0;

        sites.forEach(function (site) {
            if (!site || typeof site.name !== "string" || !site.name.trim()) return;
            var href = safeUrl(site.url, false);
            if (!href) return;
            var name = site.name.trim();

            var card = el("article", "friend-card");

            // 背景
            var bg = safeUrl(site.background, true);
            if (bg) {
                var bgLayer = el("div", "friend-bg");
                bgLayer.style.backgroundImage = 'url("' + bg.replace(/["\\]/g, "\\$&") + '")';
                bgLayer.setAttribute("aria-hidden", "true");
                card.appendChild(bgLayer);
                card.classList.add("has-bg");
            }

            // 橫幅
            var bannerBox = el("div", "friend-banner");
            var banner = safeUrl(site.banner, true);
            if (banner) {
                bannerBox.appendChild(makeImg(banner, "", "", function () { this.remove(); }));
            }
            card.appendChild(bannerBox);

            // 頭像
            var avatar = safeUrl(site.avatar, true);
            if (avatar) {
                card.appendChild(makeImg(avatar, "friend-avatar", name + " 的頭像", function () {
                    this.replaceWith(initialAvatar(name));
                }));
            } else {
                card.appendChild(initialAvatar(name));
            }

            // 內容
            var body = el("div", "friend-body");
            body.appendChild(el("h3", "friend-name", name));
            if (typeof site.description === "string" && site.description.trim()) {
                body.appendChild(el("p", "friend-desc", site.description.trim()));
            }

            // 前往按鈕
            var go = el("a", "btn friend-go", (typeof site.button === "string" && site.button.trim()) || "前往");
            go.href = href;
            go.target = "_blank";
            go.rel = "noopener noreferrer";
            go.setAttribute("aria-label", "前往 " + name);
            body.appendChild(go);

            card.appendChild(body);
            list.appendChild(card);
            count++;
        });

        if (empty) empty.hidden = count > 0;
    }

    renderFriends();

    /* ---------- 10. 自動更新年份 ---------- */
    var yearEl = document.getElementById("year");
    if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
