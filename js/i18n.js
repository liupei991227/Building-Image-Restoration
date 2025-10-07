// 修改为从 Flask 服务器获取语言文件
const loadLanguage = async (lang) => {
    try {
        const response = await fetch(`/lang/${lang}.json`); // Flask 路由路径
        if (!response.ok) {
            throw new Error(`Failed to load language file: ${lang}`);
        }
        const strings = await response.json();
        for (const key in strings) {
            const element = document.getElementById(key);
            if (element) {
                element.textContent = strings[key];
            }
        }
    } catch (error) {
        console.error("Error loading language file:", error);
    }
};

// 初始化语言
document.getElementById("languageSelector").addEventListener("change", (e) => {
    const lang = e.target.value;
    loadLanguage(lang);
});

// 默认加载英文语言
loadLanguage("en");
