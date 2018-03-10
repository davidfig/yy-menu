const html = require('./html');
const Config = require('./config');
const GlobalAccelerator = require('./globalAccelerator');

class MenuItem {
    /**
     * @param {object} options
     * @param {string} [options.label] label for menu entry may include accelerator by placing & before letter)
     * @param {string} [options.type] separator, checkbox, or undefined
     * @param {object} [options.styles] additional CSS styles to apply to this MenuItem
     * @param {string} [options.accelerator] see Accelerator for inputs (e.g., ctrl+shift+A)
     * @param {MenuItem} [options.submenu] attaches a submenu (and changes type to submenu)
     * @param {boolean} [options.checked] check the checkbox
     */
    constructor(options) {
        GlobalAccelerator.init();
        options = options || {};
        this.styles = options.styles;
        this.div = html();
        this.type = options.type;
        this.click = options.click;
        if (this.type === 'separator') {
            this.applyConfig(Config.SeparatorStyle);
        } else {
            this.checked = options.checked;
            this.createChecked(options.checked);
            this.text = options.label || '&nbsp;&nbsp;&nbsp;';
            this.createShortcut();
            this.createAccelerator(options.accelerator);
            this.createSubmenu(options.submenu);
            if (options.submenu) {
                this.submenu = options.submenu;
                this.submenu.applyConfig(Config.MenuStyle);
            }
            this.applyConfig(Config.RowStyle);
            this.div.addEventListener('mousedown', e => this.handleClick(e));
            this.div.addEventListener('touchstart', e => this.handleClick(e));
            this.div.addEventListener('mouseenter', () => this.mouseenter());
            this.div.addEventListener('mouseleave', () => this.mouseleave());
        }
    }

    /**
     * The click callback
     * @callback MenuItem~ClickCallback
     * @param {InputEvent} e
     */

    mouseenter() {
        if (!this.submenu || this.menu.showing !== this) {
            this.div.style.backgroundColor = Config.SelectedBackgroundStyle;
            if (this.submenu && !this.menu.applicationMenu) {
                this.submenuTimeout = setTimeout(() => {
                    this.submenuTimeout = null;
                    this.submenu.show(this);
                }, Config.SubmenuOpenDelay);
            }
        }
    }

    mouseleave() {
        if (!this.submenu || this.menu.showing !== this) {
            if (this.submenuTimeout) {
                clearTimeout(this.submenuTimeout);
                this.submenuTimeout = null;
            }
            this.div.style.backgroundColor = 'transparent';
        }
    }

    applyConfig(base) {
        const styles = {};
        for (let style in base) {
            styles[style] = base[style];
        }
        if (this.styles) {
            for (let style in this.styles) {
                styles[style] = this.styles[style];
            }
        }
        for (let style in styles) {
            this.div.style[style] = styles[style];
        }
    }

    createChecked(checked) {
        this.check = html({ parent: this.div, html: checked ? '&#10004;' : '' });
    }

    createShortcut() {
        if (this.type !== 'separator') {
            const text = this.text;
            this.label = html({ parent: this.div });
            let current = html({ parent: this.label, type: 'span' });
            if (text.indexOf('&') !== -1) {
                let i = 0;
                do {
                    const letter = text[i];
                    if (letter === '&') {
                        i++;
                        this.shortcutSpan = html({ parent: this.label, type: 'span', html: text[i], styles: Config.AcceleratorKeyStyle });
                        current = html({ parent: this.label, type: 'span' });
                    } else {
                        current.innerHTML += letter;
                    }
                    i++;
                } while (i < text.length);
            } else {
                this.label.innerHTML = text;
            }
        }
    }

    showShortcut() {
        if (this.shortcutSpan) {
            this.shortcutSpan.style.textDecoration = 'underline';
        }
    }

    hideShortcut() {
        if (this.shortcutSpan) {
            this.shortcutSpan.style.textDecoration = 'none';
        }
    }

    createAccelerator(accelerator) {
        this.accelerator = html({ parent: this.div, html: accelerator ? GlobalAccelerator.prettifyKey(accelerator) : '', styles: Config.AcceleratorStyle });
        if (accelerator) {
            GlobalAccelerator.register(accelerator, () => this.handleClick());
        }
    }

    createSubmenu(submenu) {
        this.arrow = html({ parent: this.div, html: submenu ? '&#9658;' : '' });
    }

    closeAll() {
        let menu = this.menu;
        GlobalAccelerator.unregisterMenuShortcuts();
        while (menu && !menu.applicationMenu) {
            if (menu.showing) {
                menu.showing.div.style.backgroundColor = 'transparent';
                menu.showing = null;
            }
            menu.div.remove();
            menu = menu.menu;
        }
        if (menu.showing) {
            menu.showing.div.style.background = 'transparent';
            menu.showing = null;
            menu.showAccelerators();
        }
    }

    handleClick(e) {
        if (this.submenu) {
            if (this.submenuTimeout) {
                clearTimeout(this.submenuTimeout);
                this.submenuTimeout = null;
            }
            this.submenu.show(this);
            this.div.style.backgroundColor = Config.SelectedBackgroundStyle;
        } else if (this.type === 'checkbox') {
            this.checked = !this.checked;
            this.check.innerHTML = this.checked ? '&#10004;' : '';
            this.closeAll();
        } else {
            this.closeAll();
        }

        if (this.click) {
            this.click(e, this);
        }
    }
}

module.exports = MenuItem;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9tZW51SXRlbS5qcyJdLCJuYW1lcyI6WyJodG1sIiwicmVxdWlyZSIsIkNvbmZpZyIsIkdsb2JhbEFjY2VsZXJhdG9yIiwiTWVudUl0ZW0iLCJjb25zdHJ1Y3RvciIsIm9wdGlvbnMiLCJpbml0Iiwic3R5bGVzIiwiZGl2IiwidHlwZSIsImNsaWNrIiwiYXBwbHlDb25maWciLCJTZXBhcmF0b3JTdHlsZSIsImNoZWNrZWQiLCJjcmVhdGVDaGVja2VkIiwidGV4dCIsImxhYmVsIiwiY3JlYXRlU2hvcnRjdXQiLCJjcmVhdGVBY2NlbGVyYXRvciIsImFjY2VsZXJhdG9yIiwiY3JlYXRlU3VibWVudSIsInN1Ym1lbnUiLCJNZW51U3R5bGUiLCJSb3dTdHlsZSIsImFkZEV2ZW50TGlzdGVuZXIiLCJlIiwiaGFuZGxlQ2xpY2siLCJtb3VzZWVudGVyIiwibW91c2VsZWF2ZSIsIm1lbnUiLCJzaG93aW5nIiwic3R5bGUiLCJiYWNrZ3JvdW5kQ29sb3IiLCJTZWxlY3RlZEJhY2tncm91bmRTdHlsZSIsImFwcGxpY2F0aW9uTWVudSIsInN1Ym1lbnVUaW1lb3V0Iiwic2V0VGltZW91dCIsInNob3ciLCJTdWJtZW51T3BlbkRlbGF5IiwiY2xlYXJUaW1lb3V0IiwiYmFzZSIsImNoZWNrIiwicGFyZW50IiwiY3VycmVudCIsImluZGV4T2YiLCJpIiwibGV0dGVyIiwic2hvcnRjdXRTcGFuIiwiQWNjZWxlcmF0b3JLZXlTdHlsZSIsImlubmVySFRNTCIsImxlbmd0aCIsInNob3dTaG9ydGN1dCIsInRleHREZWNvcmF0aW9uIiwiaGlkZVNob3J0Y3V0IiwicHJldHRpZnlLZXkiLCJBY2NlbGVyYXRvclN0eWxlIiwicmVnaXN0ZXIiLCJhcnJvdyIsImNsb3NlQWxsIiwidW5yZWdpc3Rlck1lbnVTaG9ydGN1dHMiLCJyZW1vdmUiLCJiYWNrZ3JvdW5kIiwic2hvd0FjY2VsZXJhdG9ycyIsIm1vZHVsZSIsImV4cG9ydHMiXSwibWFwcGluZ3MiOiJBQUFBLE1BQU1B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TDtBQUNJLGlCQUFLQSxRQUFMO0FBQ0g7O0FBRUQsWUFBSSxLQUFLaEQsS0FBVCxFQUNBO0FBQ0ksaUJBQUtBLEtBQUwsQ0FBV2UsQ0FBWCxFQUFjLElBQWQ7QUFDSDtBQUNKO0FBeE5MOztBQTJOQXNDLE9BQU9DLE9BQVAsR0FBaUI3RCxRQUFqQiIsImZpbGUiOiJtZW51SXRlbS5qcyIsInNvdXJjZXNDb250ZW50IjpbImNvbnN0IGh0bWwgPSByZXF1aXJlKCcuL2h0bWwnKVxyXG5jb25zdCBDb25maWcgPSByZXF1aXJlKCcuL2NvbmZpZycpXHJcbmNvbnN0IEdsb2JhbEFjY2VsZXJhdG9yID0gcmVxdWlyZSgnLi9nbG9iYWxBY2NlbGVyYXRvcicpXHJcblxyXG5jbGFzcyBNZW51SXRlbVxyXG57XHJcbiAgICAvKipcclxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gW29wdGlvbnMubGFiZWxdIGxhYmVsIGZvciBtZW51IGVudHJ5IG1heSBpbmNsdWRlIGFjY2VsZXJhdG9yIGJ5IHBsYWNpbmcgJiBiZWZvcmUgbGV0dGVyKVxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IFtvcHRpb25zLnR5cGVdIHNlcGFyYXRvciwgY2hlY2tib3gsIG9yIHVuZGVmaW5lZFxyXG4gICAgICogQHBhcmFtIHtvYmplY3R9IFtvcHRpb25zLnN0eWxlc10gYWRkaXRpb25hbCBDU1Mgc3R5bGVzIHRvIGFwcGx5IHRvIHRoaXMgTWVudUl0ZW1cclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBbb3B0aW9ucy5hY2NlbGVyYXRvcl0gc2VlIEFjY2VsZXJhdG9yIGZvciBpbnB1dHMgKGUuZy4sIGN0cmwrc2hpZnQrQSlcclxuICAgICAqIEBwYXJhbSB7TWVudUl0ZW19IFtvcHRpb25zLnN1Ym1lbnVdIGF0dGFjaGVzIGEgc3VibWVudSAoYW5kIGNoYW5nZXMgdHlwZSB0byBzdWJtZW51KVxyXG4gICAgICogQHBhcmFtIHtib29sZWFufSBbb3B0aW9ucy5jaGVja2VkXSBjaGVjayB0aGUgY2hlY2tib3hcclxuICAgICAqL1xyXG4gICAgY29uc3RydWN0b3Iob3B0aW9ucylcclxuICAgIHtcclxuICAgICAgICBHbG9iYWxBY2NlbGVyYXRvci5pbml0KClcclxuICAgICAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fVxyXG4gICAgICAgIHRoaXMuc3R5bGVzID0gb3B0aW9ucy5zdHlsZXNcclxuICAgICAgICB0aGlzLmRpdiA9IGh0bWwoKVxyXG4gICAgICAgIHRoaXMudHlwZSA9IG9wdGlvbnMudHlwZVxyXG4gICAgICAgIHRoaXMuY2xpY2sgPSBvcHRpb25zLmNsaWNrXHJcbiAgICAgICAgaWYgKHRoaXMudHlwZSA9PT0gJ3NlcGFyYXRvcicpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLmFwcGx5Q29uZmlnKENvbmZpZy5TZXBhcmF0b3JTdHlsZSlcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5jaGVja2VkID0gb3B0aW9ucy5jaGVja2VkXHJcbiAgICAgICAgICAgIHRoaXMuY3JlYXRlQ2hlY2tlZChvcHRpb25zLmNoZWNrZWQpXHJcbiAgICAgICAgICAgIHRoaXMudGV4dCA9IG9wdGlvbnMubGFiZWwgfHwgJyZuYnNwOyZuYnNwOyZuYnNwOydcclxuICAgICAgICAgICAgdGhpcy5jcmVhdGVTaG9ydGN1dCgpXHJcbiAgICAgICAgICAgIHRoaXMuY3JlYXRlQWNjZWxlcmF0b3Iob3B0aW9ucy5hY2NlbGVyYXRvcilcclxuICAgICAgICAgICAgdGhpcy5jcmVhdGVTdWJtZW51KG9wdGlvbnMuc3VibWVudSlcclxuICAgICAgICAgICAgaWYgKG9wdGlvbnMuc3VibWVudSlcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zdWJtZW51ID0gb3B0aW9ucy5zdWJtZW51XHJcbiAgICAgICAgICAgICAgICB0aGlzLnN1Ym1lbnUuYXBwbHlDb25maWcoQ29uZmlnLk1lbnVTdHlsZSlcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLmFwcGx5Q29uZmlnKENvbmZpZy5Sb3dTdHlsZSlcclxuICAgICAgICAgICAgdGhpcy5kaXYuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgKGUpID0+IHRoaXMuaGFuZGxlQ2xpY2soZSkpXHJcbiAgICAgICAgICAgIHRoaXMuZGl2LmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNoc3RhcnQnLCAoZSkgPT4gdGhpcy5oYW5kbGVDbGljayhlKSlcclxuICAgICAgICAgICAgdGhpcy5kaXYuYWRkRXZlbnRMaXN0ZW5lcignbW91c2VlbnRlcicsICgpID0+IHRoaXMubW91c2VlbnRlcigpKVxyXG4gICAgICAgICAgICB0aGlzLmRpdi5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWxlYXZlJywgKCkgPT4gdGhpcy5tb3VzZWxlYXZlKCkpXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogVGhlIGNsaWNrIGNhbGxiYWNrXHJcbiAgICAgKiBAY2FsbGJhY2sgTWVudUl0ZW1+Q2xpY2tDYWxsYmFja1xyXG4gICAgICogQHBhcmFtIHtJbnB1dEV2ZW50fSBlXHJcbiAgICAgKi9cclxuXHJcbiAgICBtb3VzZWVudGVyKClcclxuICAgIHtcclxuICAgICAgICBpZiAoIXRoaXMuc3VibWVudSB8fCB0aGlzLm1lbnUuc2hvd2luZyAhPT0gdGhpcyApXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLmRpdi5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSBDb25maWcuU2VsZWN0ZWRCYWNrZ3JvdW5kU3R5bGVcclxuICAgICAgICAgICAgaWYgKHRoaXMuc3VibWVudSAmJiAhdGhpcy5tZW51LmFwcGxpY2F0aW9uTWVudSlcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zdWJtZW51VGltZW91dCA9IHNldFRpbWVvdXQoKCkgPT5cclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnN1Ym1lbnVUaW1lb3V0ID0gbnVsbFxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc3VibWVudS5zaG93KHRoaXMpXHJcbiAgICAgICAgICAgICAgICB9LCBDb25maWcuU3VibWVudU9wZW5EZWxheSlcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBtb3VzZWxlYXZlKClcclxuICAgIHtcclxuICAgICAgICBpZiAoIXRoaXMuc3VibWVudSB8fCB0aGlzLm1lbnUuc2hvd2luZyAhPT0gdGhpcylcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLnN1Ym1lbnVUaW1lb3V0KVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBjbGVhclRpbWVvdXQodGhpcy5zdWJtZW51VGltZW91dClcclxuICAgICAgICAgICAgICAgIHRoaXMuc3VibWVudVRpbWVvdXQgPSBudWxsXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5kaXYuc3R5bGUuYmFja2dyb3VuZENvbG9yID0gJ3RyYW5zcGFyZW50J1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBhcHBseUNvbmZpZyhiYXNlKVxyXG4gICAge1xyXG4gICAgICAgIGNvbnN0IHN0eWxlcyA9IHt9XHJcbiAgICAgICAgZm9yIChsZXQgc3R5bGUgaW4gYmFzZSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHN0eWxlc1tzdHlsZV0gPSBiYXNlW3N0eWxlXVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodGhpcy5zdHlsZXMpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBmb3IgKGxldCBzdHlsZSBpbiB0aGlzLnN0eWxlcylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgc3R5bGVzW3N0eWxlXSA9IHRoaXMuc3R5bGVzW3N0eWxlXVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGZvciAobGV0IHN0eWxlIGluIHN0eWxlcylcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMuZGl2LnN0eWxlW3N0eWxlXSA9IHN0eWxlc1tzdHlsZV1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgY3JlYXRlQ2hlY2tlZChjaGVja2VkKVxyXG4gICAge1xyXG4gICAgICAgIHRoaXMuY2hlY2sgPSBodG1sKHsgcGFyZW50OiB0aGlzLmRpdiwgaHRtbDogY2hlY2tlZCA/ICcmIzEwMDA0OycgOiAnJyB9KVxyXG4gICAgfVxyXG5cclxuICAgIGNyZWF0ZVNob3J0Y3V0KClcclxuICAgIHtcclxuICAgICAgICBpZiAodGhpcy50eXBlICE9PSAnc2VwYXJhdG9yJylcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGNvbnN0IHRleHQgPSB0aGlzLnRleHRcclxuICAgICAgICAgICAgdGhpcy5sYWJlbCA9IGh0bWwoeyBwYXJlbnQ6IHRoaXMuZGl2IH0pXHJcbiAgICAgICAgICAgIGxldCBjdXJyZW50ID0gaHRtbCh7IHBhcmVudDogdGhpcy5sYWJlbCwgdHlwZTogJ3NwYW4nIH0pXHJcbiAgICAgICAgICAgIGlmICh0ZXh0LmluZGV4T2YoJyYnKSAhPT0gLTEpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGxldCBpID0gMFxyXG4gICAgICAgICAgICAgICAgZG9cclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBsZXR0ZXIgPSB0ZXh0W2ldXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGxldHRlciA9PT0gJyYnKVxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaSsrXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc2hvcnRjdXRTcGFuID0gaHRtbCh7IHBhcmVudDogdGhpcy5sYWJlbCwgdHlwZTogJ3NwYW4nLCBodG1sOiB0ZXh0W2ldLCBzdHlsZXM6IENvbmZpZy5BY2NlbGVyYXRvcktleVN0eWxlIH0pXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGN1cnJlbnQgPSBodG1sKHsgcGFyZW50OiB0aGlzLmxhYmVsLCB0eXBlOiAnc3BhbicgfSlcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY3VycmVudC5pbm5lckhUTUwgKz0gbGV0dGVyXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGkrK1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgd2hpbGUgKGkgPCB0ZXh0Lmxlbmd0aClcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHRoaXMubGFiZWwuaW5uZXJIVE1MID0gdGV4dFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHNob3dTaG9ydGN1dCgpXHJcbiAgICB7XHJcbiAgICAgICAgaWYgKHRoaXMuc2hvcnRjdXRTcGFuKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5zaG9ydGN1dFNwYW4uc3R5bGUudGV4dERlY29yYXRpb24gPSAndW5kZXJsaW5lJ1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBoaWRlU2hvcnRjdXQoKVxyXG4gICAge1xyXG4gICAgICAgIGlmICh0aGlzLnNob3J0Y3V0U3BhbilcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMuc2hvcnRjdXRTcGFuLnN0eWxlLnRleHREZWNvcmF0aW9uID0gJ25vbmUnXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGNyZWF0ZUFjY2VsZXJhdG9yKGFjY2VsZXJhdG9yKVxyXG4gICAge1xyXG4gICAgICAgIHRoaXMuYWNjZWxlcmF0b3IgPSBodG1sKHsgcGFyZW50OiB0aGlzLmRpdiwgaHRtbDogYWNjZWxlcmF0b3IgPyBHbG9iYWxBY2NlbGVyYXRvci5wcmV0dGlmeUtleShhY2NlbGVyYXRvcikgOiAnJywgc3R5bGVzOiBDb25maWcuQWNjZWxlcmF0b3JTdHlsZSB9KVxyXG4gICAgICAgIGlmIChhY2NlbGVyYXRvcilcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIEdsb2JhbEFjY2VsZXJhdG9yLnJlZ2lzdGVyKGFjY2VsZXJhdG9yLCAoKSA9PiB0aGlzLmhhbmRsZUNsaWNrKCkpXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGNyZWF0ZVN1Ym1lbnUoc3VibWVudSlcclxuICAgIHtcclxuICAgICAgICB0aGlzLmFycm93ID0gaHRtbCh7IHBhcmVudDogdGhpcy5kaXYsIGh0bWw6IHN1Ym1lbnUgPyAnJiM5NjU4OycgOiAnJyB9KVxyXG4gICAgfVxyXG5cclxuICAgIGNsb3NlQWxsKClcclxuICAgIHtcclxuICAgICAgICBsZXQgbWVudSA9IHRoaXMubWVudVxyXG4gICAgICAgIEdsb2JhbEFjY2VsZXJhdG9yLnVucmVnaXN0ZXJNZW51U2hvcnRjdXRzKClcclxuICAgICAgICB3aGlsZSAobWVudSAmJiAhbWVudS5hcHBsaWNhdGlvbk1lbnUpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBpZiAobWVudS5zaG93aW5nKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBtZW51LnNob3dpbmcuZGl2LnN0eWxlLmJhY2tncm91bmRDb2xvciA9ICd0cmFuc3BhcmVudCdcclxuICAgICAgICAgICAgICAgIG1lbnUuc2hvd2luZyA9IG51bGxcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBtZW51LmRpdi5yZW1vdmUoKVxyXG4gICAgICAgICAgICBtZW51ID0gbWVudS5tZW51XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChtZW51LnNob3dpbmcpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBtZW51LnNob3dpbmcuZGl2LnN0eWxlLmJhY2tncm91bmQgPSAndHJhbnNwYXJlbnQnXHJcbiAgICAgICAgICAgIG1lbnUuc2hvd2luZyA9IG51bGxcclxuICAgICAgICAgICAgbWVudS5zaG93QWNjZWxlcmF0b3JzKClcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgaGFuZGxlQ2xpY2soZSlcclxuICAgIHtcclxuICAgICAgICBpZiAodGhpcy5zdWJtZW51KVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMuc3VibWVudVRpbWVvdXQpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGNsZWFyVGltZW91dCh0aGlzLnN1Ym1lbnVUaW1lb3V0KVxyXG4gICAgICAgICAgICAgICAgdGhpcy5zdWJtZW51VGltZW91dCA9IG51bGxcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLnN1Ym1lbnUuc2hvdyh0aGlzKVxyXG4gICAgICAgICAgICB0aGlzLmRpdi5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSBDb25maWcuU2VsZWN0ZWRCYWNrZ3JvdW5kU3R5bGVcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAodGhpcy50eXBlID09PSAnY2hlY2tib3gnKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5jaGVja2VkID0gIXRoaXMuY2hlY2tlZFxyXG4gICAgICAgICAgICB0aGlzLmNoZWNrLmlubmVySFRNTCA9IHRoaXMuY2hlY2tlZCA/ICcmIzEwMDA0OycgOiAnJ1xyXG4gICAgICAgICAgICB0aGlzLmNsb3NlQWxsKClcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5jbG9zZUFsbCgpXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAodGhpcy5jbGljaylcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMuY2xpY2soZSwgdGhpcylcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gTWVudUl0ZW0iXX0=