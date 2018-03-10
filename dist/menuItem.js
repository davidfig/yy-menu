const html = require('./html');
const Config = require('./config');
const Accelerators = require('./accelerators');

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
        this.accelerator = html({ parent: this.div, html: accelerator ? Accelerators.prettifyKey(accelerator) : '', styles: Config.AcceleratorStyle });
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
        if (menu) {
            menu.showing.div.style.background = 'transparent';
            menu.showing = null;
            menu.showAccelerators();
        }
    }

    handleClick(e) {
        if (this.submenu) {
            // let menu = this.menu
            // while (!menu.applicationMenu)
            // {
            //     menu = menu.menu
            // }
            // menu.skip = true
            // menu.div.focus()
            // menu.skip = false
            if (this.submenuTimeout) {
                clearTimeout(this.submenuTimeout);
                this.submenuTimeout = null;
            }
            this.submenu.show(this);
            this.div.style.backgroundColor = Config.SelectedBackgroundStyle;
        } else if (this.type === 'checkbox') {
            this.checked = !this.checked;
            this.check.innerHTML = this.checked ? '&#10004;' : '';
        } else {
            this.closeAll();
        }

        if (this.click) {
            this.click(e, this);
        }
    }
}

module.exports = MenuItem;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9tZW51SXRlbS5qcyJdLCJuYW1lcyI6WyJodG1sIiwicmVxdWlyZSIsIkNvbmZpZyIsIkFjY2VsZXJhdG9ycyIsIk1lbnVJdGVtIiwiY29uc3RydWN0b3IiLCJvcHRpb25zIiwic3R5bGVzIiwiZGl2IiwidHlwZSIsImNsaWNrIiwiYXBwbHlDb25maWciLCJTZXBhcmF0b3JTdHlsZSIsImNoZWNrZWQiLCJjcmVhdGVDaGVja2VkIiwidGV4dCIsImxhYmVsIiwiY3JlYXRlU2hvcnRjdXQiLCJjcmVhdGVBY2NlbGVyYXRvciIsImFjY2VsZXJhdG9yIiwiY3JlYXRlU3VibWVudSIsInN1Ym1lbnUiLCJNZW51U3R5bGUiLCJSb3dTdHlsZSIsImFkZEV2ZW50TGlzdGVuZXIiLCJlIiwiaGFuZGxlQ2xpY2siLCJtb3VzZWVudGVyIiwibW91c2VsZWF2ZSIsIm1lbnUiLCJzaG93aW5nIiwic3R5bGUiLCJiYWNrZ3JvdW5kQ29sb3IiLCJTZWxlY3RlZEJhY2tncm91bmRTdHlsZSIsImFwcGxpY2F0aW9uTWVudSIsInN1Ym1lbnVUaW1lb3V0Iiwic2V0VGltZW91dCIsInNob3ciLCJTdWJtZW51T3BlbkRlbGF5IiwiY2xlYXJUaW1lb3V0IiwiYmFzZSIsImNoZWNrIiwicGFyZW50IiwiY3VycmVudCIsImluZGV4T2YiLCJpIiwibGV0dGVyIiwic2hvcnRjdXRTcGFuIiwiQWNjZWxlcmF0b3JLZXlTdHlsZSIsImlubmVySFRNTCIsImxlbmd0aCIsInNob3dTaG9ydGN1dCIsInRleHREZWNvcmF0aW9uIiwiaGlkZVNob3J0Y3V0IiwicHJldHRpZnlLZXkiLCJBY2NlbGVyYXRvclN0eWxlIiwiYXJyb3ciLCJjbG9zZUFsbCIsInJlbW92ZSIsImJhY2tncm91bmQiLCJzaG93QWNjZWxlcmF0b3JzIiwibW9kdWxlIiwiZXhwb3J0cyJdLCJtYXBwaW5ncyI6IkFBQUEsTUFBTUEsT0FBT0MsUUFBUSxRQUFSLENBQWI7QUFDQSxNQUFNQyxTQUFTRCxRQUFRLFVBQVIs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bnQiOlsiY29uc3QgaHRtbCA9IHJlcXVpcmUoJy4vaHRtbCcpXHJcbmNvbnN0IENvbmZpZyA9IHJlcXVpcmUoJy4vY29uZmlnJylcclxuY29uc3QgQWNjZWxlcmF0b3JzID0gcmVxdWlyZSgnLi9hY2NlbGVyYXRvcnMnKVxyXG5cclxuY2xhc3MgTWVudUl0ZW1cclxue1xyXG4gICAgLyoqXHJcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gb3B0aW9uc1xyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IFtvcHRpb25zLmxhYmVsXSBsYWJlbCBmb3IgbWVudSBlbnRyeSBtYXkgaW5jbHVkZSBhY2NlbGVyYXRvciBieSBwbGFjaW5nICYgYmVmb3JlIGxldHRlcilcclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBbb3B0aW9ucy50eXBlXSBzZXBhcmF0b3IsIGNoZWNrYm94LCBvciB1bmRlZmluZWRcclxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBbb3B0aW9ucy5zdHlsZXNdIGFkZGl0aW9uYWwgQ1NTIHN0eWxlcyB0byBhcHBseSB0byB0aGlzIE1lbnVJdGVtXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gW29wdGlvbnMuYWNjZWxlcmF0b3JdIHNlZSBBY2NlbGVyYXRvciBmb3IgaW5wdXRzIChlLmcuLCBjdHJsK3NoaWZ0K0EpXHJcbiAgICAgKiBAcGFyYW0ge01lbnVJdGVtfSBbb3B0aW9ucy5zdWJtZW51XSBhdHRhY2hlcyBhIHN1Ym1lbnUgKGFuZCBjaGFuZ2VzIHR5cGUgdG8gc3VibWVudSlcclxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW29wdGlvbnMuY2hlY2tlZF0gY2hlY2sgdGhlIGNoZWNrYm94XHJcbiAgICAgKi9cclxuICAgIGNvbnN0cnVjdG9yKG9wdGlvbnMpXHJcbiAgICB7XHJcbiAgICAgICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge31cclxuICAgICAgICB0aGlzLnN0eWxlcyA9IG9wdGlvbnMuc3R5bGVzXHJcbiAgICAgICAgdGhpcy5kaXYgPSBodG1sKClcclxuICAgICAgICB0aGlzLnR5cGUgPSBvcHRpb25zLnR5cGVcclxuICAgICAgICB0aGlzLmNsaWNrID0gb3B0aW9ucy5jbGlja1xyXG4gICAgICAgIGlmICh0aGlzLnR5cGUgPT09ICdzZXBhcmF0b3InKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5hcHBseUNvbmZpZyhDb25maWcuU2VwYXJhdG9yU3R5bGUpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2VcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMuY2hlY2tlZCA9IG9wdGlvbnMuY2hlY2tlZFxyXG4gICAgICAgICAgICB0aGlzLmNyZWF0ZUNoZWNrZWQob3B0aW9ucy5jaGVja2VkKVxyXG4gICAgICAgICAgICB0aGlzLnRleHQgPSBvcHRpb25zLmxhYmVsIHx8ICcmbmJzcDsmbmJzcDsmbmJzcDsnXHJcbiAgICAgICAgICAgIHRoaXMuY3JlYXRlU2hvcnRjdXQoKVxyXG4gICAgICAgICAgICB0aGlzLmNyZWF0ZUFjY2VsZXJhdG9yKG9wdGlvbnMuYWNjZWxlcmF0b3IpXHJcbiAgICAgICAgICAgIHRoaXMuY3JlYXRlU3VibWVudShvcHRpb25zLnN1Ym1lbnUpXHJcbiAgICAgICAgICAgIGlmIChvcHRpb25zLnN1Ym1lbnUpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuc3VibWVudSA9IG9wdGlvbnMuc3VibWVudVxyXG4gICAgICAgICAgICAgICAgdGhpcy5zdWJtZW51LmFwcGx5Q29uZmlnKENvbmZpZy5NZW51U3R5bGUpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5hcHBseUNvbmZpZyhDb25maWcuUm93U3R5bGUpXHJcbiAgICAgICAgICAgIHRoaXMuZGl2LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIChlKSA9PiB0aGlzLmhhbmRsZUNsaWNrKGUpKVxyXG4gICAgICAgICAgICB0aGlzLmRpdi5hZGRFdmVudExpc3RlbmVyKCd0b3VjaHN0YXJ0JywgKGUpID0+IHRoaXMuaGFuZGxlQ2xpY2soZSkpXHJcbiAgICAgICAgICAgIHRoaXMuZGl2LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZW50ZXInLCAoKSA9PiB0aGlzLm1vdXNlZW50ZXIoKSlcclxuICAgICAgICAgICAgdGhpcy5kaXYuYWRkRXZlbnRMaXN0ZW5lcignbW91c2VsZWF2ZScsICgpID0+IHRoaXMubW91c2VsZWF2ZSgpKVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFRoZSBjbGljayBjYWxsYmFja1xyXG4gICAgICogQGNhbGxiYWNrIE1lbnVJdGVtfkNsaWNrQ2FsbGJhY2tcclxuICAgICAqIEBwYXJhbSB7SW5wdXRFdmVudH0gZVxyXG4gICAgICovXHJcblxyXG4gICAgbW91c2VlbnRlcigpXHJcbiAgICB7XHJcbiAgICAgICAgaWYgKCF0aGlzLnN1Ym1lbnUgfHwgdGhpcy5tZW51LnNob3dpbmcgIT09IHRoaXMgKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5kaXYuc3R5bGUuYmFja2dyb3VuZENvbG9yID0gQ29uZmlnLlNlbGVjdGVkQmFja2dyb3VuZFN0eWxlXHJcbiAgICAgICAgICAgIGlmICh0aGlzLnN1Ym1lbnUgJiYgIXRoaXMubWVudS5hcHBsaWNhdGlvbk1lbnUpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuc3VibWVudVRpbWVvdXQgPSBzZXRUaW1lb3V0KCgpID0+XHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zdWJtZW51VGltZW91dCA9IG51bGxcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnN1Ym1lbnUuc2hvdyh0aGlzKVxyXG4gICAgICAgICAgICAgICAgfSwgQ29uZmlnLlN1Ym1lbnVPcGVuRGVsYXkpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgbW91c2VsZWF2ZSgpXHJcbiAgICB7XHJcbiAgICAgICAgaWYgKCF0aGlzLnN1Ym1lbnUgfHwgdGhpcy5tZW51LnNob3dpbmcgIT09IHRoaXMpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5zdWJtZW51VGltZW91dClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgY2xlYXJUaW1lb3V0KHRoaXMuc3VibWVudVRpbWVvdXQpXHJcbiAgICAgICAgICAgICAgICB0aGlzLnN1Ym1lbnVUaW1lb3V0ID0gbnVsbFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMuZGl2LnN0eWxlLmJhY2tncm91bmRDb2xvciA9ICd0cmFuc3BhcmVudCdcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgYXBwbHlDb25maWcoYmFzZSlcclxuICAgIHtcclxuICAgICAgICBjb25zdCBzdHlsZXMgPSB7fVxyXG4gICAgICAgIGZvciAobGV0IHN0eWxlIGluIGJhc2UpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBzdHlsZXNbc3R5bGVdID0gYmFzZVtzdHlsZV1cclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHRoaXMuc3R5bGVzKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgZm9yIChsZXQgc3R5bGUgaW4gdGhpcy5zdHlsZXMpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHN0eWxlc1tzdHlsZV0gPSB0aGlzLnN0eWxlc1tzdHlsZV1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBmb3IgKGxldCBzdHlsZSBpbiBzdHlsZXMpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLmRpdi5zdHlsZVtzdHlsZV0gPSBzdHlsZXNbc3R5bGVdXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGNyZWF0ZUNoZWNrZWQoY2hlY2tlZClcclxuICAgIHtcclxuICAgICAgICB0aGlzLmNoZWNrID0gaHRtbCh7IHBhcmVudDogdGhpcy5kaXYsIGh0bWw6IGNoZWNrZWQgPyAnJiMxMDAwNDsnIDogJycgfSlcclxuICAgIH1cclxuXHJcbiAgICBjcmVhdGVTaG9ydGN1dCgpXHJcbiAgICB7XHJcbiAgICAgICAgaWYgKHRoaXMudHlwZSAhPT0gJ3NlcGFyYXRvcicpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBjb25zdCB0ZXh0ID0gdGhpcy50ZXh0XHJcbiAgICAgICAgICAgIHRoaXMubGFiZWwgPSBodG1sKHsgcGFyZW50OiB0aGlzLmRpdiB9KVxyXG4gICAgICAgICAgICBsZXQgY3VycmVudCA9IGh0bWwoeyBwYXJlbnQ6IHRoaXMubGFiZWwsIHR5cGU6ICdzcGFuJyB9KVxyXG4gICAgICAgICAgICBpZiAodGV4dC5pbmRleE9mKCcmJykgIT09IC0xKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBsZXQgaSA9IDBcclxuICAgICAgICAgICAgICAgIGRvXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgbGV0dGVyID0gdGV4dFtpXVxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChsZXR0ZXIgPT09ICcmJylcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGkrK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnNob3J0Y3V0U3BhbiA9IGh0bWwoeyBwYXJlbnQ6IHRoaXMubGFiZWwsIHR5cGU6ICdzcGFuJywgaHRtbDogdGV4dFtpXSwgc3R5bGVzOiBDb25maWcuQWNjZWxlcmF0b3JLZXlTdHlsZSB9KVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjdXJyZW50ID0gaHRtbCh7IHBhcmVudDogdGhpcy5sYWJlbCwgdHlwZTogJ3NwYW4nIH0pXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGN1cnJlbnQuaW5uZXJIVE1MICs9IGxldHRlclxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBpKytcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHdoaWxlIChpIDwgdGV4dC5sZW5ndGgpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmxhYmVsLmlubmVySFRNTCA9IHRleHRcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBzaG93U2hvcnRjdXQoKVxyXG4gICAge1xyXG4gICAgICAgIGlmICh0aGlzLnNob3J0Y3V0U3BhbilcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMuc2hvcnRjdXRTcGFuLnN0eWxlLnRleHREZWNvcmF0aW9uID0gJ3VuZGVybGluZSdcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgaGlkZVNob3J0Y3V0KClcclxuICAgIHtcclxuICAgICAgICBpZiAodGhpcy5zaG9ydGN1dFNwYW4pXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLnNob3J0Y3V0U3Bhbi5zdHlsZS50ZXh0RGVjb3JhdGlvbiA9ICdub25lJ1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBjcmVhdGVBY2NlbGVyYXRvcihhY2NlbGVyYXRvcilcclxuICAgIHtcclxuICAgICAgICB0aGlzLmFjY2VsZXJhdG9yID0gaHRtbCh7IHBhcmVudDogdGhpcy5kaXYsIGh0bWw6IGFjY2VsZXJhdG9yID8gQWNjZWxlcmF0b3JzLnByZXR0aWZ5S2V5KGFjY2VsZXJhdG9yKSA6ICAnJywgc3R5bGVzOiBDb25maWcuQWNjZWxlcmF0b3JTdHlsZSB9KVxyXG4gICAgfVxyXG5cclxuICAgIGNyZWF0ZVN1Ym1lbnUoc3VibWVudSlcclxuICAgIHtcclxuICAgICAgICB0aGlzLmFycm93ID0gaHRtbCh7IHBhcmVudDogdGhpcy5kaXYsIGh0bWw6IHN1Ym1lbnUgPyAnJiM5NjU4OycgOiAnJyB9KVxyXG4gICAgfVxyXG5cclxuICAgIGNsb3NlQWxsKClcclxuICAgIHtcclxuICAgICAgICBsZXQgbWVudSA9IHRoaXMubWVudVxyXG4gICAgICAgIHdoaWxlIChtZW51ICYmICFtZW51LmFwcGxpY2F0aW9uTWVudSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGlmIChtZW51LnNob3dpbmcpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIG1lbnUuc2hvd2luZy5kaXYuc3R5bGUuYmFja2dyb3VuZENvbG9yID0gJ3RyYW5zcGFyZW50J1xyXG4gICAgICAgICAgICAgICAgbWVudS5zaG93aW5nID0gbnVsbFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIG1lbnUuZGl2LnJlbW92ZSgpXHJcbiAgICAgICAgICAgIG1lbnUgPSBtZW51Lm1lbnVcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKG1lbnUpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBtZW51LnNob3dpbmcuZGl2LnN0eWxlLmJhY2tncm91bmQgPSAndHJhbnNwYXJlbnQnXHJcbiAgICAgICAgICAgIG1lbnUuc2hvd2luZyA9IG51bGxcclxuICAgICAgICAgICAgbWVudS5zaG93QWNjZWxlcmF0b3JzKClcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgaGFuZGxlQ2xpY2soZSlcclxuICAgIHtcclxuICAgICAgICBpZiAodGhpcy5zdWJtZW51KVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgLy8gbGV0IG1lbnUgPSB0aGlzLm1lbnVcclxuICAgICAgICAgICAgLy8gd2hpbGUgKCFtZW51LmFwcGxpY2F0aW9uTWVudSlcclxuICAgICAgICAgICAgLy8ge1xyXG4gICAgICAgICAgICAvLyAgICAgbWVudSA9IG1lbnUubWVudVxyXG4gICAgICAgICAgICAvLyB9XHJcbiAgICAgICAgICAgIC8vIG1lbnUuc2tpcCA9IHRydWVcclxuICAgICAgICAgICAgLy8gbWVudS5kaXYuZm9jdXMoKVxyXG4gICAgICAgICAgICAvLyBtZW51LnNraXAgPSBmYWxzZVxyXG4gICAgICAgICAgICBpZiAodGhpcy5zdWJtZW51VGltZW91dClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgY2xlYXJUaW1lb3V0KHRoaXMuc3VibWVudVRpbWVvdXQpXHJcbiAgICAgICAgICAgICAgICB0aGlzLnN1Ym1lbnVUaW1lb3V0ID0gbnVsbFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMuc3VibWVudS5zaG93KHRoaXMpXHJcbiAgICAgICAgICAgIHRoaXMuZGl2LnN0eWxlLmJhY2tncm91bmRDb2xvciA9IENvbmZpZy5TZWxlY3RlZEJhY2tncm91bmRTdHlsZVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmICh0aGlzLnR5cGUgPT09ICdjaGVja2JveCcpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLmNoZWNrZWQgPSAhdGhpcy5jaGVja2VkXHJcbiAgICAgICAgICAgIHRoaXMuY2hlY2suaW5uZXJIVE1MID0gdGhpcy5jaGVja2VkID8gJyYjMTAwMDQ7JyA6ICcnXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2VcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMuY2xvc2VBbGwoKVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHRoaXMuY2xpY2spXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLmNsaWNrKGUsIHRoaXMpXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IE1lbnVJdGVtIl19