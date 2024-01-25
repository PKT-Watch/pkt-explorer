(function (THEME) {
    const themeSwitcherEl = document.querySelector('#theme-switcher');
    const themeSwitcherInputs = themeSwitcherEl.querySelectorAll('input');
    const THEMES = ['light', 'dark', 'system'];
    let selected_theme = UTILS.getCookie('theme') || THEMES[0];
    let prefers_dark_mode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

    THEME.switchTheme = (theme) => {
        if (!THEMES.includes(theme)) return;

        document.querySelector('html').dataset.theme = theme;

        UTILS.setCookie('theme', theme, 365);
        selected_theme = theme;

        const event = new CustomEvent("themeChanged", { detail: selected_theme });
        themeSwitcherEl.dispatchEvent(event);
    }

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => {
        prefers_dark_mode = event.matches;
    });

    THEME.getChartColor = () => {
        const lightColor = 'rgb(60, 173, 239)';
        const darkColor = 'rgb(60, 173, 239)';
        if (selected_theme === THEMES[1]) {
            // Dark theme
            return darkColor;
        } else if (selected_theme === THEMES[2] && prefers_dark_mode) {
            // System theme + dark mode
            return darkColor;
        }

        return lightColor;
    }

    THEME.getChartLabelColor = () => {
        const lightColor = '#666';
        const darkColor = '#d7d9dd';
        if (selected_theme === THEMES[1]) {
            // Dark theme
            return darkColor;
        } else if (selected_theme === THEMES[2] && prefers_dark_mode) {
            // System theme + dark mode
            return darkColor;
        }

        return lightColor;
    }

    THEME.getSelectedTheme = () => {
        return selected_theme;
    }

    THEME.getQRColors = () => {
        const colors = {
            foreground: '#fff',
            background: '#000000'
        }
        if (selected_theme === THEMES[1]) {
            // Dark theme
            colors.foreground = '#1f2b38';
            colors.background = 'rgb(60, 173, 239)';
        } else if (selected_theme === THEMES[2] && prefers_dark_mode) {
            // System theme + dark mode
            colors.foreground = '#1f2b38';
            colors.background = 'rgb(60, 173, 239)';
        }

        return colors;
    }

    themeSwitcherInputs.forEach(input => {
        input.addEventListener('change', e => {
            if (e.target.checked) {
                THEME.switchTheme(e.target.value);
            }
        });
    });

    init = () => {
        const theme = THEME.getSelectedTheme();
        themeSwitcherInputs.forEach(input => {
            input.checked = input.value === theme;
            input.addEventListener('change', e => {
                if (e.target.checked) {
                    THEME.switchTheme(e.target.value);
                }
            });
        });
    }

    // Handle swipe back navigation on iOS
    // This will run on page load and back navigation.
    window.onpageshow = () => {
        setTimeout(() => {
            init();
        }, 0);
        
    }
    
}(window.THEME = window.THEME || {}));