const html = require('./html');
const Config = require('./config');
const localAccelerator = require('./localAccelerator');

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
        localAccelerator.init();
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
        this.accelerator = html({ parent: this.div, html: accelerator ? localAccelerator.prettifyKey(accelerator) : '', styles: Config.AcceleratorStyle });
        if (accelerator) {
            localAccelerator.register(accelerator, e => this.click(e));
        }
    }

    createSubmenu(submenu) {
        this.arrow = html({ parent: this.div, html: submenu ? '&#9658;' : '' });
    }

    closeAll() {
        let menu = this.menu;
        localAccelerator.unregisterMenuShortcuts();
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9tZW51SXRlbS5qcyJdLCJuYW1lcyI6WyJodG1sIiwicmVxdWlyZSIsIkNvbmZpZyIsImxvY2FsQWNjZWxlcmF0b3IiLCJNZW51SXRlbSIsImNvbnN0cnVjdG9yIiwib3B0aW9ucyIsImluaXQiLCJzdHlsZXMiLCJkaXYiLCJ0eXBlIiwiY2xpY2siLCJhcHBseUNvbmZpZyIsIlNlcGFyYXRvclN0eWxlIiwiY2hlY2tlZCIsImNyZWF0ZUNoZWNrZWQiLCJ0ZXh0IiwibGFiZWwiLCJjcmVhdGVTaG9ydGN1dCIsImNyZWF0ZUFjY2VsZXJhdG9yIiwiYWNjZWxlcmF0b3IiLCJjcmVhdGVTdWJtZW51Iiwic3VibWVudSIsIk1lbnVTdHlsZSIsIlJvd1N0eWxlIiwiYWRkRXZlbnRMaXN0ZW5lciIsImUiLCJoYW5kbGVDbGljayIsIm1vdXNlZW50ZXIiLCJtb3VzZWxlYXZlIiwibWVudSIsInNob3dpbmciLCJzdHlsZSIsImJhY2tncm91bmRDb2xvciIsIlNlbGVjdGVkQmFja2dyb3VuZFN0eWxlIiwiYXBwbGljYXRpb25NZW51Iiwic3VibWVudVRpbWVvdXQiLCJzZXRUaW1lb3V0Iiwic2hvdyIsIlN1Ym1lbnVPcGVuRGVsYXkiLCJjbGVhclRpbWVvdXQiLCJiYXNlIiwiY2hlY2siLCJwYXJlbnQiLCJjdXJyZW50IiwiaW5kZXhPZiIsImkiLCJsZXR0ZXIiLCJzaG9ydGN1dFNwYW4iLCJBY2NlbGVyYXRvcktleVN0eWxlIiwiaW5uZXJIVE1MIiwibGVuZ3RoIiwic2hvd1Nob3J0Y3V0IiwidGV4dERlY29yYXRpb24iLCJoaWRlU2hvcnRjdXQiLCJwcmV0dGlmeUtleSIsIkFjY2VsZXJhdG9yU3R5bGUiLCJyZWdpc3RlciIsImFycm93IiwiY2xvc2VBbGwiLCJ1bnJlZ2lzdGVyTWVudVNob3J0Y3V0cyIsInJlbW92ZSIsImJhY2tncm91bmQiLCJzaG93QWNjZWxlcmF0b3JzIiwibW9kdWxlIiwiZXhwb3J0cyJdLCJtYXBwaW5ncyI6IkFBQUEsTUFBTUEs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QUw7QUFDSCxTQUxJLE1BT0w7QUFDSSxpQkFBS0EsUUFBTDtBQUNIOztBQUVELFlBQUksS0FBS2hELEtBQVQsRUFDQTtBQUNJLGlCQUFLQSxLQUFMLENBQVdlLENBQVgsRUFBYyxJQUFkO0FBQ0g7QUFDSjtBQXhOTDs7QUEyTkFzQyxPQUFPQyxPQUFQLEdBQWlCN0QsUUFBakIiLCJmaWxlIjoibWVudUl0ZW0uanMiLCJzb3VyY2VzQ29udGVudCI6WyJjb25zdCBodG1sID0gcmVxdWlyZSgnLi9odG1sJylcclxuY29uc3QgQ29uZmlnID0gcmVxdWlyZSgnLi9jb25maWcnKVxyXG5jb25zdCBsb2NhbEFjY2VsZXJhdG9yID0gcmVxdWlyZSgnLi9sb2NhbEFjY2VsZXJhdG9yJylcclxuXHJcbmNsYXNzIE1lbnVJdGVtXHJcbntcclxuICAgIC8qKlxyXG4gICAgICogQHBhcmFtIHtvYmplY3R9IG9wdGlvbnNcclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBbb3B0aW9ucy5sYWJlbF0gbGFiZWwgZm9yIG1lbnUgZW50cnkgbWF5IGluY2x1ZGUgYWNjZWxlcmF0b3IgYnkgcGxhY2luZyAmIGJlZm9yZSBsZXR0ZXIpXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gW29wdGlvbnMudHlwZV0gc2VwYXJhdG9yLCBjaGVja2JveCwgb3IgdW5kZWZpbmVkXHJcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gW29wdGlvbnMuc3R5bGVzXSBhZGRpdGlvbmFsIENTUyBzdHlsZXMgdG8gYXBwbHkgdG8gdGhpcyBNZW51SXRlbVxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IFtvcHRpb25zLmFjY2VsZXJhdG9yXSBzZWUgQWNjZWxlcmF0b3IgZm9yIGlucHV0cyAoZS5nLiwgY3RybCtzaGlmdCtBKVxyXG4gICAgICogQHBhcmFtIHtNZW51SXRlbX0gW29wdGlvbnMuc3VibWVudV0gYXR0YWNoZXMgYSBzdWJtZW51IChhbmQgY2hhbmdlcyB0eXBlIHRvIHN1Ym1lbnUpXHJcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtvcHRpb25zLmNoZWNrZWRdIGNoZWNrIHRoZSBjaGVja2JveFxyXG4gICAgICovXHJcbiAgICBjb25zdHJ1Y3RvcihvcHRpb25zKVxyXG4gICAge1xyXG4gICAgICAgIGxvY2FsQWNjZWxlcmF0b3IuaW5pdCgpXHJcbiAgICAgICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge31cclxuICAgICAgICB0aGlzLnN0eWxlcyA9IG9wdGlvbnMuc3R5bGVzXHJcbiAgICAgICAgdGhpcy5kaXYgPSBodG1sKClcclxuICAgICAgICB0aGlzLnR5cGUgPSBvcHRpb25zLnR5cGVcclxuICAgICAgICB0aGlzLmNsaWNrID0gb3B0aW9ucy5jbGlja1xyXG4gICAgICAgIGlmICh0aGlzLnR5cGUgPT09ICdzZXBhcmF0b3InKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5hcHBseUNvbmZpZyhDb25maWcuU2VwYXJhdG9yU3R5bGUpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2VcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMuY2hlY2tlZCA9IG9wdGlvbnMuY2hlY2tlZFxyXG4gICAgICAgICAgICB0aGlzLmNyZWF0ZUNoZWNrZWQob3B0aW9ucy5jaGVja2VkKVxyXG4gICAgICAgICAgICB0aGlzLnRleHQgPSBvcHRpb25zLmxhYmVsIHx8ICcmbmJzcDsmbmJzcDsmbmJzcDsnXHJcbiAgICAgICAgICAgIHRoaXMuY3JlYXRlU2hvcnRjdXQoKVxyXG4gICAgICAgICAgICB0aGlzLmNyZWF0ZUFjY2VsZXJhdG9yKG9wdGlvbnMuYWNjZWxlcmF0b3IpXHJcbiAgICAgICAgICAgIHRoaXMuY3JlYXRlU3VibWVudShvcHRpb25zLnN1Ym1lbnUpXHJcbiAgICAgICAgICAgIGlmIChvcHRpb25zLnN1Ym1lbnUpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuc3VibWVudSA9IG9wdGlvbnMuc3VibWVudVxyXG4gICAgICAgICAgICAgICAgdGhpcy5zdWJtZW51LmFwcGx5Q29uZmlnKENvbmZpZy5NZW51U3R5bGUpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5hcHBseUNvbmZpZyhDb25maWcuUm93U3R5bGUpXHJcbiAgICAgICAgICAgIHRoaXMuZGl2LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIChlKSA9PiB0aGlzLmhhbmRsZUNsaWNrKGUpKVxyXG4gICAgICAgICAgICB0aGlzLmRpdi5hZGRFdmVudExpc3RlbmVyKCd0b3VjaHN0YXJ0JywgKGUpID0+IHRoaXMuaGFuZGxlQ2xpY2soZSkpXHJcbiAgICAgICAgICAgIHRoaXMuZGl2LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZW50ZXInLCAoKSA9PiB0aGlzLm1vdXNlZW50ZXIoKSlcclxuICAgICAgICAgICAgdGhpcy5kaXYuYWRkRXZlbnRMaXN0ZW5lcignbW91c2VsZWF2ZScsICgpID0+IHRoaXMubW91c2VsZWF2ZSgpKVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFRoZSBjbGljayBjYWxsYmFja1xyXG4gICAgICogQGNhbGxiYWNrIE1lbnVJdGVtfkNsaWNrQ2FsbGJhY2tcclxuICAgICAqIEBwYXJhbSB7SW5wdXRFdmVudH0gZVxyXG4gICAgICovXHJcblxyXG4gICAgbW91c2VlbnRlcigpXHJcbiAgICB7XHJcbiAgICAgICAgaWYgKCF0aGlzLnN1Ym1lbnUgfHwgdGhpcy5tZW51LnNob3dpbmcgIT09IHRoaXMgKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5kaXYuc3R5bGUuYmFja2dyb3VuZENvbG9yID0gQ29uZmlnLlNlbGVjdGVkQmFja2dyb3VuZFN0eWxlXHJcbiAgICAgICAgICAgIGlmICh0aGlzLnN1Ym1lbnUgJiYgIXRoaXMubWVudS5hcHBsaWNhdGlvbk1lbnUpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuc3VibWVudVRpbWVvdXQgPSBzZXRUaW1lb3V0KCgpID0+XHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zdWJtZW51VGltZW91dCA9IG51bGxcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnN1Ym1lbnUuc2hvdyh0aGlzKVxyXG4gICAgICAgICAgICAgICAgfSwgQ29uZmlnLlN1Ym1lbnVPcGVuRGVsYXkpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgbW91c2VsZWF2ZSgpXHJcbiAgICB7XHJcbiAgICAgICAgaWYgKCF0aGlzLnN1Ym1lbnUgfHwgdGhpcy5tZW51LnNob3dpbmcgIT09IHRoaXMpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5zdWJtZW51VGltZW91dClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgY2xlYXJUaW1lb3V0KHRoaXMuc3VibWVudVRpbWVvdXQpXHJcbiAgICAgICAgICAgICAgICB0aGlzLnN1Ym1lbnVUaW1lb3V0ID0gbnVsbFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMuZGl2LnN0eWxlLmJhY2tncm91bmRDb2xvciA9ICd0cmFuc3BhcmVudCdcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgYXBwbHlDb25maWcoYmFzZSlcclxuICAgIHtcclxuICAgICAgICBjb25zdCBzdHlsZXMgPSB7fVxyXG4gICAgICAgIGZvciAobGV0IHN0eWxlIGluIGJhc2UpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBzdHlsZXNbc3R5bGVdID0gYmFzZVtzdHlsZV1cclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHRoaXMuc3R5bGVzKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgZm9yIChsZXQgc3R5bGUgaW4gdGhpcy5zdHlsZXMpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHN0eWxlc1tzdHlsZV0gPSB0aGlzLnN0eWxlc1tzdHlsZV1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBmb3IgKGxldCBzdHlsZSBpbiBzdHlsZXMpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLmRpdi5zdHlsZVtzdHlsZV0gPSBzdHlsZXNbc3R5bGVdXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGNyZWF0ZUNoZWNrZWQoY2hlY2tlZClcclxuICAgIHtcclxuICAgICAgICB0aGlzLmNoZWNrID0gaHRtbCh7IHBhcmVudDogdGhpcy5kaXYsIGh0bWw6IGNoZWNrZWQgPyAnJiMxMDAwNDsnIDogJycgfSlcclxuICAgIH1cclxuXHJcbiAgICBjcmVhdGVTaG9ydGN1dCgpXHJcbiAgICB7XHJcbiAgICAgICAgaWYgKHRoaXMudHlwZSAhPT0gJ3NlcGFyYXRvcicpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBjb25zdCB0ZXh0ID0gdGhpcy50ZXh0XHJcbiAgICAgICAgICAgIHRoaXMubGFiZWwgPSBodG1sKHsgcGFyZW50OiB0aGlzLmRpdiB9KVxyXG4gICAgICAgICAgICBsZXQgY3VycmVudCA9IGh0bWwoeyBwYXJlbnQ6IHRoaXMubGFiZWwsIHR5cGU6ICdzcGFuJyB9KVxyXG4gICAgICAgICAgICBpZiAodGV4dC5pbmRleE9mKCcmJykgIT09IC0xKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBsZXQgaSA9IDBcclxuICAgICAgICAgICAgICAgIGRvXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgbGV0dGVyID0gdGV4dFtpXVxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChsZXR0ZXIgPT09ICcmJylcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGkrK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnNob3J0Y3V0U3BhbiA9IGh0bWwoeyBwYXJlbnQ6IHRoaXMubGFiZWwsIHR5cGU6ICdzcGFuJywgaHRtbDogdGV4dFtpXSwgc3R5bGVzOiBDb25maWcuQWNjZWxlcmF0b3JLZXlTdHlsZSB9KVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjdXJyZW50ID0gaHRtbCh7IHBhcmVudDogdGhpcy5sYWJlbCwgdHlwZTogJ3NwYW4nIH0pXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGN1cnJlbnQuaW5uZXJIVE1MICs9IGxldHRlclxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBpKytcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHdoaWxlIChpIDwgdGV4dC5sZW5ndGgpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmxhYmVsLmlubmVySFRNTCA9IHRleHRcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBzaG93U2hvcnRjdXQoKVxyXG4gICAge1xyXG4gICAgICAgIGlmICh0aGlzLnNob3J0Y3V0U3BhbilcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMuc2hvcnRjdXRTcGFuLnN0eWxlLnRleHREZWNvcmF0aW9uID0gJ3VuZGVybGluZSdcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgaGlkZVNob3J0Y3V0KClcclxuICAgIHtcclxuICAgICAgICBpZiAodGhpcy5zaG9ydGN1dFNwYW4pXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLnNob3J0Y3V0U3Bhbi5zdHlsZS50ZXh0RGVjb3JhdGlvbiA9ICdub25lJ1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBjcmVhdGVBY2NlbGVyYXRvcihhY2NlbGVyYXRvcilcclxuICAgIHtcclxuICAgICAgICB0aGlzLmFjY2VsZXJhdG9yID0gaHRtbCh7IHBhcmVudDogdGhpcy5kaXYsIGh0bWw6IGFjY2VsZXJhdG9yID8gbG9jYWxBY2NlbGVyYXRvci5wcmV0dGlmeUtleShhY2NlbGVyYXRvcikgOiAnJywgc3R5bGVzOiBDb25maWcuQWNjZWxlcmF0b3JTdHlsZSB9KVxyXG4gICAgICAgIGlmIChhY2NlbGVyYXRvcilcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGxvY2FsQWNjZWxlcmF0b3IucmVnaXN0ZXIoYWNjZWxlcmF0b3IsIChlKSA9PiB0aGlzLmNsaWNrKGUpKVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBjcmVhdGVTdWJtZW51KHN1Ym1lbnUpXHJcbiAgICB7XHJcbiAgICAgICAgdGhpcy5hcnJvdyA9IGh0bWwoeyBwYXJlbnQ6IHRoaXMuZGl2LCBodG1sOiBzdWJtZW51ID8gJyYjOTY1ODsnIDogJycgfSlcclxuICAgIH1cclxuXHJcbiAgICBjbG9zZUFsbCgpXHJcbiAgICB7XHJcbiAgICAgICAgbGV0IG1lbnUgPSB0aGlzLm1lbnVcclxuICAgICAgICBsb2NhbEFjY2VsZXJhdG9yLnVucmVnaXN0ZXJNZW51U2hvcnRjdXRzKClcclxuICAgICAgICB3aGlsZSAobWVudSAmJiAhbWVudS5hcHBsaWNhdGlvbk1lbnUpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBpZiAobWVudS5zaG93aW5nKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBtZW51LnNob3dpbmcuZGl2LnN0eWxlLmJhY2tncm91bmRDb2xvciA9ICd0cmFuc3BhcmVudCdcclxuICAgICAgICAgICAgICAgIG1lbnUuc2hvd2luZyA9IG51bGxcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBtZW51LmRpdi5yZW1vdmUoKVxyXG4gICAgICAgICAgICBtZW51ID0gbWVudS5tZW51XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChtZW51LnNob3dpbmcpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBtZW51LnNob3dpbmcuZGl2LnN0eWxlLmJhY2tncm91bmQgPSAndHJhbnNwYXJlbnQnXHJcbiAgICAgICAgICAgIG1lbnUuc2hvd2luZyA9IG51bGxcclxuICAgICAgICAgICAgbWVudS5zaG93QWNjZWxlcmF0b3JzKClcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgaGFuZGxlQ2xpY2soZSlcclxuICAgIHtcclxuICAgICAgICBpZiAodGhpcy5zdWJtZW51KVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMuc3VibWVudVRpbWVvdXQpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGNsZWFyVGltZW91dCh0aGlzLnN1Ym1lbnVUaW1lb3V0KVxyXG4gICAgICAgICAgICAgICAgdGhpcy5zdWJtZW51VGltZW91dCA9IG51bGxcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLnN1Ym1lbnUuc2hvdyh0aGlzKVxyXG4gICAgICAgICAgICB0aGlzLmRpdi5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSBDb25maWcuU2VsZWN0ZWRCYWNrZ3JvdW5kU3R5bGVcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAodGhpcy50eXBlID09PSAnY2hlY2tib3gnKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5jaGVja2VkID0gIXRoaXMuY2hlY2tlZFxyXG4gICAgICAgICAgICB0aGlzLmNoZWNrLmlubmVySFRNTCA9IHRoaXMuY2hlY2tlZCA/ICcmIzEwMDA0OycgOiAnJ1xyXG4gICAgICAgICAgICB0aGlzLmNsb3NlQWxsKClcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5jbG9zZUFsbCgpXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAodGhpcy5jbGljaylcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMuY2xpY2soZSwgdGhpcylcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gTWVudUl0ZW0iXX0=