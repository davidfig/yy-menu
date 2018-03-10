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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9tZW51SXRlbS5qcyJdLCJuYW1lcyI6WyJodG1sIiwicmVxdWlyZSIsIkNvbmZpZyIsIkdsb2JhbEFjY2VsZXJhdG9yIiwiTWVudUl0ZW0iLCJjb25zdHJ1Y3RvciIsIm9wdGlvbnMiLCJpbml0Iiwic3R5bGVzIiwiZGl2IiwidHlwZSIsImNsaWNrIiwiYXBwbHlDb25maWciLCJTZXBhcmF0b3JTdHlsZSIsImNoZWNrZWQiLCJjcmVhdGVDaGVja2VkIiwidGV4dCIsImxhYmVsIiwiY3JlYXRlU2hvcnRjdXQiLCJjcmVhdGVBY2NlbGVyYXRvciIsImFjY2VsZXJhdG9yIiwiY3JlYXRlU3VibWVudSIsInN1Ym1lbnUiLCJNZW51U3R5bGUiLCJSb3dTdHlsZSIsImFkZEV2ZW50TGlzdGVuZXIiLCJlIiwiaGFuZGxlQ2xpY2siLCJtb3VzZWVudGVyIiwibW91c2VsZWF2ZSIsIm1lbnUiLCJzaG93aW5nIiwic3R5bGUiLCJiYWNrZ3JvdW5kQ29sb3IiLCJTZWxlY3RlZEJhY2tncm91bmRTdHlsZSIsImFwcGxpY2F0aW9uTWVudSIsInN1Ym1lbnVUaW1lb3V0Iiwic2V0VGltZW91dCIsInNob3ciLCJTdWJtZW51T3BlbkRlbGF5IiwiY2xlYXJUaW1lb3V0IiwiYmFzZSIsImNoZWNrIiwicGFyZW50IiwiY3VycmVudCIsImluZGV4T2YiLCJpIiwibGV0dGVyIiwic2hvcnRjdXRTcGFuIiwiQWNjZWxlcmF0b3JLZXlTdHlsZSIsImlubmVySFRNTCIsImxlbmd0aCIsInNob3dTaG9ydGN1dCIsInRleHREZWNvcmF0aW9uIiwiaGlkZVNob3J0Y3V0IiwicHJldHRpZnlLZXkiLCJBY2NlbGVyYXRvclN0eWxlIiwicmVnaXN0ZXIiLCJhcnJvdyIsImNsb3NlQWxsIiwicmVtb3ZlIiwiYmFja2dyb3VuZCIsInNob3dBY2NlbGVyYXRvcnMiLCJtb2R1bGUiLCJleHBvcnRzIl0sIm1hcHBpbmdzIjoiQUFBQSxNQUFNQSxPQUFPQyxRQUFRLFFBQVIsQ0FBYjtBQUNB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QTtBQUNJLGlCQUFLQSxLQUFMLENBQVdlLENBQVgsRUFBYyxJQUFkO0FBQ0g7QUFDSjtBQXZOTDs7QUEwTkFxQyxPQUFPQyxPQUFQLEdBQWlCNUQsUUFBakIiLCJmaWxlIjoibWVudUl0ZW0uanMiLCJzb3VyY2VzQ29udGVudCI6WyJjb25zdCBodG1sID0gcmVxdWlyZSgnLi9odG1sJylcclxuY29uc3QgQ29uZmlnID0gcmVxdWlyZSgnLi9jb25maWcnKVxyXG5jb25zdCBHbG9iYWxBY2NlbGVyYXRvciA9IHJlcXVpcmUoJy4vZ2xvYmFsQWNjZWxlcmF0b3InKVxyXG5cclxuY2xhc3MgTWVudUl0ZW1cclxue1xyXG4gICAgLyoqXHJcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gb3B0aW9uc1xyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IFtvcHRpb25zLmxhYmVsXSBsYWJlbCBmb3IgbWVudSBlbnRyeSBtYXkgaW5jbHVkZSBhY2NlbGVyYXRvciBieSBwbGFjaW5nICYgYmVmb3JlIGxldHRlcilcclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBbb3B0aW9ucy50eXBlXSBzZXBhcmF0b3IsIGNoZWNrYm94LCBvciB1bmRlZmluZWRcclxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBbb3B0aW9ucy5zdHlsZXNdIGFkZGl0aW9uYWwgQ1NTIHN0eWxlcyB0byBhcHBseSB0byB0aGlzIE1lbnVJdGVtXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gW29wdGlvbnMuYWNjZWxlcmF0b3JdIHNlZSBBY2NlbGVyYXRvciBmb3IgaW5wdXRzIChlLmcuLCBjdHJsK3NoaWZ0K0EpXHJcbiAgICAgKiBAcGFyYW0ge01lbnVJdGVtfSBbb3B0aW9ucy5zdWJtZW51XSBhdHRhY2hlcyBhIHN1Ym1lbnUgKGFuZCBjaGFuZ2VzIHR5cGUgdG8gc3VibWVudSlcclxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW29wdGlvbnMuY2hlY2tlZF0gY2hlY2sgdGhlIGNoZWNrYm94XHJcbiAgICAgKi9cclxuICAgIGNvbnN0cnVjdG9yKG9wdGlvbnMpXHJcbiAgICB7XHJcbiAgICAgICAgR2xvYmFsQWNjZWxlcmF0b3IuaW5pdCgpXHJcbiAgICAgICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge31cclxuICAgICAgICB0aGlzLnN0eWxlcyA9IG9wdGlvbnMuc3R5bGVzXHJcbiAgICAgICAgdGhpcy5kaXYgPSBodG1sKClcclxuICAgICAgICB0aGlzLnR5cGUgPSBvcHRpb25zLnR5cGVcclxuICAgICAgICB0aGlzLmNsaWNrID0gb3B0aW9ucy5jbGlja1xyXG4gICAgICAgIGlmICh0aGlzLnR5cGUgPT09ICdzZXBhcmF0b3InKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5hcHBseUNvbmZpZyhDb25maWcuU2VwYXJhdG9yU3R5bGUpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2VcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMuY2hlY2tlZCA9IG9wdGlvbnMuY2hlY2tlZFxyXG4gICAgICAgICAgICB0aGlzLmNyZWF0ZUNoZWNrZWQob3B0aW9ucy5jaGVja2VkKVxyXG4gICAgICAgICAgICB0aGlzLnRleHQgPSBvcHRpb25zLmxhYmVsIHx8ICcmbmJzcDsmbmJzcDsmbmJzcDsnXHJcbiAgICAgICAgICAgIHRoaXMuY3JlYXRlU2hvcnRjdXQoKVxyXG4gICAgICAgICAgICB0aGlzLmNyZWF0ZUFjY2VsZXJhdG9yKG9wdGlvbnMuYWNjZWxlcmF0b3IpXHJcbiAgICAgICAgICAgIHRoaXMuY3JlYXRlU3VibWVudShvcHRpb25zLnN1Ym1lbnUpXHJcbiAgICAgICAgICAgIGlmIChvcHRpb25zLnN1Ym1lbnUpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuc3VibWVudSA9IG9wdGlvbnMuc3VibWVudVxyXG4gICAgICAgICAgICAgICAgdGhpcy5zdWJtZW51LmFwcGx5Q29uZmlnKENvbmZpZy5NZW51U3R5bGUpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5hcHBseUNvbmZpZyhDb25maWcuUm93U3R5bGUpXHJcbiAgICAgICAgICAgIHRoaXMuZGl2LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIChlKSA9PiB0aGlzLmhhbmRsZUNsaWNrKGUpKVxyXG4gICAgICAgICAgICB0aGlzLmRpdi5hZGRFdmVudExpc3RlbmVyKCd0b3VjaHN0YXJ0JywgKGUpID0+IHRoaXMuaGFuZGxlQ2xpY2soZSkpXHJcbiAgICAgICAgICAgIHRoaXMuZGl2LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZW50ZXInLCAoKSA9PiB0aGlzLm1vdXNlZW50ZXIoKSlcclxuICAgICAgICAgICAgdGhpcy5kaXYuYWRkRXZlbnRMaXN0ZW5lcignbW91c2VsZWF2ZScsICgpID0+IHRoaXMubW91c2VsZWF2ZSgpKVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFRoZSBjbGljayBjYWxsYmFja1xyXG4gICAgICogQGNhbGxiYWNrIE1lbnVJdGVtfkNsaWNrQ2FsbGJhY2tcclxuICAgICAqIEBwYXJhbSB7SW5wdXRFdmVudH0gZVxyXG4gICAgICovXHJcblxyXG4gICAgbW91c2VlbnRlcigpXHJcbiAgICB7XHJcbiAgICAgICAgaWYgKCF0aGlzLnN1Ym1lbnUgfHwgdGhpcy5tZW51LnNob3dpbmcgIT09IHRoaXMgKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5kaXYuc3R5bGUuYmFja2dyb3VuZENvbG9yID0gQ29uZmlnLlNlbGVjdGVkQmFja2dyb3VuZFN0eWxlXHJcbiAgICAgICAgICAgIGlmICh0aGlzLnN1Ym1lbnUgJiYgIXRoaXMubWVudS5hcHBsaWNhdGlvbk1lbnUpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuc3VibWVudVRpbWVvdXQgPSBzZXRUaW1lb3V0KCgpID0+XHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zdWJtZW51VGltZW91dCA9IG51bGxcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnN1Ym1lbnUuc2hvdyh0aGlzKVxyXG4gICAgICAgICAgICAgICAgfSwgQ29uZmlnLlN1Ym1lbnVPcGVuRGVsYXkpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgbW91c2VsZWF2ZSgpXHJcbiAgICB7XHJcbiAgICAgICAgaWYgKCF0aGlzLnN1Ym1lbnUgfHwgdGhpcy5tZW51LnNob3dpbmcgIT09IHRoaXMpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5zdWJtZW51VGltZW91dClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgY2xlYXJUaW1lb3V0KHRoaXMuc3VibWVudVRpbWVvdXQpXHJcbiAgICAgICAgICAgICAgICB0aGlzLnN1Ym1lbnVUaW1lb3V0ID0gbnVsbFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMuZGl2LnN0eWxlLmJhY2tncm91bmRDb2xvciA9ICd0cmFuc3BhcmVudCdcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgYXBwbHlDb25maWcoYmFzZSlcclxuICAgIHtcclxuICAgICAgICBjb25zdCBzdHlsZXMgPSB7fVxyXG4gICAgICAgIGZvciAobGV0IHN0eWxlIGluIGJhc2UpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBzdHlsZXNbc3R5bGVdID0gYmFzZVtzdHlsZV1cclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHRoaXMuc3R5bGVzKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgZm9yIChsZXQgc3R5bGUgaW4gdGhpcy5zdHlsZXMpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHN0eWxlc1tzdHlsZV0gPSB0aGlzLnN0eWxlc1tzdHlsZV1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBmb3IgKGxldCBzdHlsZSBpbiBzdHlsZXMpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLmRpdi5zdHlsZVtzdHlsZV0gPSBzdHlsZXNbc3R5bGVdXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGNyZWF0ZUNoZWNrZWQoY2hlY2tlZClcclxuICAgIHtcclxuICAgICAgICB0aGlzLmNoZWNrID0gaHRtbCh7IHBhcmVudDogdGhpcy5kaXYsIGh0bWw6IGNoZWNrZWQgPyAnJiMxMDAwNDsnIDogJycgfSlcclxuICAgIH1cclxuXHJcbiAgICBjcmVhdGVTaG9ydGN1dCgpXHJcbiAgICB7XHJcbiAgICAgICAgaWYgKHRoaXMudHlwZSAhPT0gJ3NlcGFyYXRvcicpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBjb25zdCB0ZXh0ID0gdGhpcy50ZXh0XHJcbiAgICAgICAgICAgIHRoaXMubGFiZWwgPSBodG1sKHsgcGFyZW50OiB0aGlzLmRpdiB9KVxyXG4gICAgICAgICAgICBsZXQgY3VycmVudCA9IGh0bWwoeyBwYXJlbnQ6IHRoaXMubGFiZWwsIHR5cGU6ICdzcGFuJyB9KVxyXG4gICAgICAgICAgICBpZiAodGV4dC5pbmRleE9mKCcmJykgIT09IC0xKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBsZXQgaSA9IDBcclxuICAgICAgICAgICAgICAgIGRvXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgbGV0dGVyID0gdGV4dFtpXVxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChsZXR0ZXIgPT09ICcmJylcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGkrK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnNob3J0Y3V0U3BhbiA9IGh0bWwoeyBwYXJlbnQ6IHRoaXMubGFiZWwsIHR5cGU6ICdzcGFuJywgaHRtbDogdGV4dFtpXSwgc3R5bGVzOiBDb25maWcuQWNjZWxlcmF0b3JLZXlTdHlsZSB9KVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjdXJyZW50ID0gaHRtbCh7IHBhcmVudDogdGhpcy5sYWJlbCwgdHlwZTogJ3NwYW4nIH0pXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGN1cnJlbnQuaW5uZXJIVE1MICs9IGxldHRlclxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBpKytcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHdoaWxlIChpIDwgdGV4dC5sZW5ndGgpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmxhYmVsLmlubmVySFRNTCA9IHRleHRcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBzaG93U2hvcnRjdXQoKVxyXG4gICAge1xyXG4gICAgICAgIGlmICh0aGlzLnNob3J0Y3V0U3BhbilcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMuc2hvcnRjdXRTcGFuLnN0eWxlLnRleHREZWNvcmF0aW9uID0gJ3VuZGVybGluZSdcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgaGlkZVNob3J0Y3V0KClcclxuICAgIHtcclxuICAgICAgICBpZiAodGhpcy5zaG9ydGN1dFNwYW4pXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLnNob3J0Y3V0U3Bhbi5zdHlsZS50ZXh0RGVjb3JhdGlvbiA9ICdub25lJ1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBjcmVhdGVBY2NlbGVyYXRvcihhY2NlbGVyYXRvcilcclxuICAgIHtcclxuICAgICAgICB0aGlzLmFjY2VsZXJhdG9yID0gaHRtbCh7IHBhcmVudDogdGhpcy5kaXYsIGh0bWw6IGFjY2VsZXJhdG9yID8gR2xvYmFsQWNjZWxlcmF0b3IucHJldHRpZnlLZXkoYWNjZWxlcmF0b3IpIDogJycsIHN0eWxlczogQ29uZmlnLkFjY2VsZXJhdG9yU3R5bGUgfSlcclxuICAgICAgICBpZiAoYWNjZWxlcmF0b3IpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBHbG9iYWxBY2NlbGVyYXRvci5yZWdpc3RlcihhY2NlbGVyYXRvciwgKCkgPT4gdGhpcy5oYW5kbGVDbGljaygpKVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBjcmVhdGVTdWJtZW51KHN1Ym1lbnUpXHJcbiAgICB7XHJcbiAgICAgICAgdGhpcy5hcnJvdyA9IGh0bWwoeyBwYXJlbnQ6IHRoaXMuZGl2LCBodG1sOiBzdWJtZW51ID8gJyYjOTY1ODsnIDogJycgfSlcclxuICAgIH1cclxuXHJcbiAgICBjbG9zZUFsbCgpXHJcbiAgICB7XHJcbiAgICAgICAgbGV0IG1lbnUgPSB0aGlzLm1lbnVcclxuICAgICAgICB3aGlsZSAobWVudSAmJiAhbWVudS5hcHBsaWNhdGlvbk1lbnUpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBpZiAobWVudS5zaG93aW5nKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBtZW51LnNob3dpbmcuZGl2LnN0eWxlLmJhY2tncm91bmRDb2xvciA9ICd0cmFuc3BhcmVudCdcclxuICAgICAgICAgICAgICAgIG1lbnUuc2hvd2luZyA9IG51bGxcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBtZW51LmRpdi5yZW1vdmUoKVxyXG4gICAgICAgICAgICBtZW51ID0gbWVudS5tZW51XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChtZW51LnNob3dpbmcpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBtZW51LnNob3dpbmcuZGl2LnN0eWxlLmJhY2tncm91bmQgPSAndHJhbnNwYXJlbnQnXHJcbiAgICAgICAgICAgIG1lbnUuc2hvd2luZyA9IG51bGxcclxuICAgICAgICAgICAgbWVudS5zaG93QWNjZWxlcmF0b3JzKClcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgaGFuZGxlQ2xpY2soZSlcclxuICAgIHtcclxuICAgICAgICBpZiAodGhpcy5zdWJtZW51KVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMuc3VibWVudVRpbWVvdXQpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGNsZWFyVGltZW91dCh0aGlzLnN1Ym1lbnVUaW1lb3V0KVxyXG4gICAgICAgICAgICAgICAgdGhpcy5zdWJtZW51VGltZW91dCA9IG51bGxcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLnN1Ym1lbnUuc2hvdyh0aGlzKVxyXG4gICAgICAgICAgICB0aGlzLmRpdi5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSBDb25maWcuU2VsZWN0ZWRCYWNrZ3JvdW5kU3R5bGVcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAodGhpcy50eXBlID09PSAnY2hlY2tib3gnKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5jaGVja2VkID0gIXRoaXMuY2hlY2tlZFxyXG4gICAgICAgICAgICB0aGlzLmNoZWNrLmlubmVySFRNTCA9IHRoaXMuY2hlY2tlZCA/ICcmIzEwMDA0OycgOiAnJ1xyXG4gICAgICAgICAgICB0aGlzLmNsb3NlQWxsKClcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5jbG9zZUFsbCgpXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAodGhpcy5jbGljaylcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMuY2xpY2soZSwgdGhpcylcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gTWVudUl0ZW0iXX0=