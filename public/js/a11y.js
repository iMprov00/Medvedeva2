/**
 * Версия для слабовидящих (ГОСТ Р 52872-2019)
 * Сохраняет настройки в localStorage и применяет классы к html/body.
 */
(function () {
    'use strict';

    var STORAGE_KEY = 'a11y';
    var DEFAULTS = { font: 0, contrast: '', images: false };

    function getSettings() {
        try {
            var raw = localStorage.getItem(STORAGE_KEY);
            if (raw) {
                var s = JSON.parse(raw);
                return {
                    font: typeof s.font === 'number' && s.font >= 0 && s.font <= 3 ? s.font : DEFAULTS.font,
                    contrast: ['', 'bw', 'wb', 'by'].indexOf(s.contrast) >= 0 ? s.contrast : DEFAULTS.contrast,
                    images: !!s.images
                };
            }
        } catch (e) {}
        return Object.assign({}, DEFAULTS);
    }

    function saveSettings(s) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
        } catch (e) {}
    }

    function applySettings(s) {
        var html = document.documentElement;
        var body = document.body;
        if (!body) return;

        [ 'a11y-font-1', 'a11y-font-2', 'a11y-font-3' ].forEach(function (c) { html.classList.remove(c); });
        if (s.font >= 1 && s.font <= 3) {
            html.classList.add('a11y-font-' + s.font);
        }

        [ 'a11y-contrast-bw', 'a11y-contrast-wb', 'a11y-contrast-by' ].forEach(function (c) { body.classList.remove(c); });
        if (s.contrast) {
            body.classList.add('a11y-contrast-' + s.contrast);
        }

        if (s.images) {
            body.classList.add('a11y-hide-images');
        } else {
            body.classList.remove('a11y-hide-images');
        }
    }

    function updatePanelUI(settings) {
        var fontOptions = document.querySelectorAll('[data-a11y-font]');
        fontOptions.forEach(function (el) {
            var val = parseInt(el.getAttribute('data-a11y-font'), 10);
            if (val === settings.font) {
                el.classList.add('active');
                el.setAttribute('aria-pressed', 'true');
            } else {
                el.classList.remove('active');
                el.setAttribute('aria-pressed', 'false');
            }
        });

        var contrastOptions = document.querySelectorAll('[data-a11y-contrast]');
        contrastOptions.forEach(function (el) {
            var val = el.getAttribute('data-a11y-contrast') || '';
            if (val === settings.contrast) {
                el.classList.add('active');
                el.setAttribute('aria-pressed', 'true');
            } else {
                el.classList.remove('active');
                el.setAttribute('aria-pressed', 'false');
            }
        });

        var imagesCheck = document.getElementById('a11y-hide-images');
        if (imagesCheck) {
            imagesCheck.checked = settings.images;
        }
    }

    function init() {
        var settings = getSettings();
        applySettings(settings);

        var toggleBtn = document.getElementById('a11y-toggle-btn');
        var panel = document.getElementById('a11y-panel');
        var closeBtn = document.getElementById('a11y-close-btn');
        var resetBtn = document.getElementById('a11y-reset-btn');
        var footerLink = document.getElementById('a11y-footer-link');

        if (!panel || !toggleBtn) return;

        updatePanelUI(settings);

        function openPanel() {
            panel.classList.add('a11y-panel-open');
            panel.setAttribute('aria-hidden', 'false');
            toggleBtn.setAttribute('aria-expanded', 'true');
            closeBtn.focus();
        }

        function closePanel() {
            panel.classList.remove('a11y-panel-open');
            panel.setAttribute('aria-hidden', 'true');
            toggleBtn.setAttribute('aria-expanded', 'false');
            toggleBtn.focus();
        }

        toggleBtn.addEventListener('click', function () {
            if (panel.classList.contains('a11y-panel-open')) {
                closePanel();
            } else {
                openPanel();
            }
        });

        if (closeBtn) {
            closeBtn.addEventListener('click', closePanel);
        }

        if (footerLink) {
            footerLink.addEventListener('click', function (e) {
                e.preventDefault();
                openPanel();
            });
        }

        document.querySelectorAll('[data-a11y-font]').forEach(function (btn) {
            btn.addEventListener('click', function () {
                var val = parseInt(btn.getAttribute('data-a11y-font'), 10);
                settings.font = val;
                saveSettings(settings);
                applySettings(settings);
                updatePanelUI(settings);
            });
        });

        document.querySelectorAll('[data-a11y-contrast]').forEach(function (btn) {
            btn.addEventListener('click', function () {
                var val = btn.getAttribute('data-a11y-contrast') || '';
                settings.contrast = val;
                saveSettings(settings);
                applySettings(settings);
                updatePanelUI(settings);
            });
        });

        var imagesCheck = document.getElementById('a11y-hide-images');
        if (imagesCheck) {
            imagesCheck.addEventListener('change', function () {
                settings.images = imagesCheck.checked;
                saveSettings(settings);
                applySettings(settings);
            });
        }

        if (resetBtn) {
            resetBtn.addEventListener('click', function () {
                settings = Object.assign({}, DEFAULTS);
                saveSettings(settings);
                applySettings(settings);
                updatePanelUI(settings);
                closePanel();
            });
        }

        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && panel.classList.contains('a11y-panel-open')) {
                closePanel();
            }
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
