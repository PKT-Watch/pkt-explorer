let page_visible = true;
document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
        page_visible = true;
    } else {
        page_visible = false;
    }
});