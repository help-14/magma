function loadCSS() {
    for (let c = 0; c < document.styleSheets.length; c++) {
        var declaration = document.styleSheets[c].cssRules[0];
        if (declaration.selectorText === ":root") {
            var allVar = declaration.style.cssText.split(";");
            var cssRootKeys = {}
            for (var i = 0; i < allVar.length; i++) {
                var a = allVar[i].split(':');
                if (a[0] !== "")
                    cssRootKeys[a[0].trim()] = a[1].trim();
            }
            window.cssRoot = cssRootKeys;
            return;
        }
    }
}
loadCSS();