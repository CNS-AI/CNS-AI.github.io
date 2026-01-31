// 非侵入性前端修复脚本：仅增强行为，不修改页面文本/结构
(function () {
  document.addEventListener('DOMContentLoaded', function () {
    // 找到可能的授权/模态面板
    var authPanel = document.querySelector('.auth-panel');
    function openAuth() {
      if (!authPanel) return;
      authPanel.classList.add('show');
      authPanel.setAttribute('aria-hidden', 'false');
      // 聚焦第一个可输入元素以增强可访问性（不改变内容）
      var focusable = authPanel.querySelector('input,button,textarea,[tabindex]:not([tabindex="-1"])');
      if (focusable) try { focusable.focus(); } catch (e) {}
    }
    function closeAuth() {
      if (!authPanel) return;
      authPanel.classList.remove('show');
      authPanel.setAttribute('aria-hidden', 'true');
    }

    // 事件代理：处理页面上带 data-action 的元素（非入侵性）
    document.addEventListener('click', function (ev) {
      var el = ev.target.closest && ev.target.closest('[data-action]');
      if (!el) return;
      var action = (el.getAttribute('data-action') || '').trim();
      if (!action) return;
      try {
        if (action === 'open-auth') { openAuth(); }
        else if (action === 'close-auth') { closeAuth(); }
        // 仅注册 open/close 行为；不做任何 edit/replace 操作以避免改动页面内容
      } catch (err) {
        // 不要阻塞页面：捕获并记录到控制台
        console.error('data-action handler error:', err);
      }
    }, false);

    // 点击模态遮罩区域关闭（如果页面存在 .auth-panel）
    if (authPanel) {
      authPanel.addEventListener('click', function (ev) {
        if (ev.target === authPanel) {
          closeAuth();
        }
      }, false);
    }

    // 按键：Esc 关闭模态（非入侵）
    document.addEventListener('keydown', function (ev) {
      if (ev.key === 'Escape' || ev.key === 'Esc') {
        // 仅关闭有显示状态的面板
        if (authPanel && authPanel.classList.contains('show')) {
          closeAuth();
        }
      }
    }, false);

    // 导航按钮小补强：为 .nav-btn 添加平滑滚动与 active 类（不修改文本）
    try {
      var navBtns = document.querySelectorAll('.nav-btn');
      if (navBtns && navBtns.length) {
        navBtns.forEach(function (btn) {
          btn.addEventListener('click', function (ev) {
            // 管理 active 状态（只在 DOM 中切换类）
            navBtns.forEach(function (b) { b.classList.remove('active'); });
            btn.classList.add('active');

            // 支持 data-target="#id" 或 href="#id"
            var target = btn.getAttribute('data-target') || btn.getAttribute('href');
            if (target && target.charAt(0) === '#') {
              var el = document.querySelector(target);
              if (el) {
                try { el.scrollIntoView({ behavior: 'smooth', block: 'start' }); } catch (e) { el.scrollIntoView(true); }
                // 阻止默认链接跳转（若 href 存在）
                ev.preventDefault && ev.preventDefault();
              }
            }
          }, false);
        });
      }
    } catch (err) { /* 安全降级：不破坏页面 */ }

    // 显式导出到 window（便于调试或备选调用），但不覆盖已有同名函数
    if (!window._cns_ai_behaviors) {
      window._cns_ai_behaviors = {
        openAuth: openAuth,
        closeAuth: closeAuth
      };
    }
  });
})();