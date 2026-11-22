/* =========================================================
   友站清單
   在這裡新增 / 修改友站，網頁會自動產生卡片。

   每個友站的欄位：
     name        網站名稱（必填）
     url         網址（必填，http:// 或 https://，.onion 也可以）
     description 介紹文字
     avatar      頭像圖片網址（沒有就顯示名稱第一個字）
     banner      橫幅圖片網址（沒有就顯示純色橫幅）
     background  卡片背景圖片網址（會自動調淡，避免擋到文字）
     button      按鈕文字（預設「前往」）

   圖片可以放在 friends/ 資料夾用相對路徑，
   也可以直接用對方網站的完整圖片網址。
   ========================================================= */
window.FRIEND_SITES = [
    {
        name: "範例友站",
        url: "https://example.com/",
        description: "這是一個範例卡片，換成你朋友的網站資料就可以了。",
        avatar: "friends/example-avatar.svg",
        banner: "friends/example-banner.svg",
        background: "friends/example-bg.svg",
        button: "前往"
    },
    {
        name: "沒有圖片的友站",
        url: "https://example.org/",
        description: "沒有填圖片時，會自動用名稱第一個字當頭像、用主題色當橫幅。"
    }

    /* 新增範本（複製這段，記得前一個項目後面要加逗號）：
    ,{
        name: "",
        url: "",
        description: "",
        avatar: "",
        banner: "",
        background: ""
    }
    */
];
