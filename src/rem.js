(function resizeFontsize() {
  (function (win, doc) {
    // 修改全局默认 fontsize
    const baseSize = 16;
    function change() {
      const scale = document.documentElement.clientWidth / 375;
      // eslint-disable-next-line
      doc.documentElement.style.fontSize = `${baseSize * Math.min(scale, 2)}px`;
    }
    change();
    win.addEventListener('resize', () => {
      change();
    }, false);
  }(window, document));
}());
