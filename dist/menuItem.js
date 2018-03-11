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
            this._checked = options.checked;
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
            this.closeAll();
        } else {
            this.closeAll();
        }

        if (this.click) {
            this.click(e, this);
        }
    }

    get checked() {
        return this._checked;
    }
    set checked(value) {
        this._checked = value;
        this.check.innerHTML = this._checked ? '&#10004;' : '';
    }
}

module.exports = MenuItem;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9tZW51SXRlbS5qcyJdLCJuYW1lcyI6WyJodG1sIiwicmVxdWlyZSIsIkNvbmZpZyIsImxvY2FsQWNjZWxlcmF0b3IiLCJNZW51SXRlbSIsImNvbnN0cnVjdG9yIiwib3B0aW9ucyIsImluaXQiLCJzdHlsZXMiLCJkaXYiLCJ0eXBlIiwiY2xpY2siLCJhcHBseUNvbmZpZyIsIlNlcGFyYXRvclN0eWxlIiwiX2NoZWNrZWQiLCJjaGVja2VkIiwiY3JlYXRlQ2hlY2tlZCIsInRleHQiLCJsYWJlbCIsImNyZWF0ZVNob3J0Y3V0IiwiY3JlYXRlQWNjZWxlcmF0b3IiLCJhY2NlbGVyYXRvciIsImNyZWF0ZVN1Ym1lbnUiLCJzdWJtZW51IiwiTWVudVN0eWxlIiwiUm93U3R5bGUiLCJhZGRFdmVudExpc3RlbmVyIiwiZSIsImhhbmRsZUNsaWNrIiwibW91c2VlbnRlciIsIm1vdXNlbGVhdmUiLCJtZW51Iiwic2hvd2luZyIsInN0eWxlIiwiYmFja2dyb3VuZENvbG9yIiwiU2VsZWN0ZWRCYWNrZ3JvdW5kU3R5bGUiLCJhcHBsaWNhdGlvbk1lbnUiLCJzdWJtZW51VGltZW91dCIsInNldFRpbWVvdXQiLCJzaG93IiwiU3VibWVudU9wZW5EZWxheSIsImNsZWFyVGltZW91dCIsImJhc2UiLCJjaGVjayIsInBhcmVudCIsImN1cnJlbnQiLCJpbmRleE9mIiwiaSIsImxldHRlciIsInNob3J0Y3V0U3BhbiIsIkFjY2VsZXJhdG9yS2V5U3R5bGUiLCJpbm5lckhUTUwiLCJsZW5ndGgiLCJzaG93U2hvcnRjdXQiLCJ0ZXh0RGVjb3JhdGlvbiIsImhpZGVTaG9ydGN1dCIsInByZXR0aWZ5S2V5IiwiQWNjZWxlcmF0b3JTdHlsZSIsInJlZ2lzdGVyIiwiYXJyb3ciLCJjbG9zZUFsbCIsInVucmVnaXN0ZXJNZW51U2hvcnRjdXRzIiwicmVtb3ZlIiwiYmFja2dyb3VuZCIsInNob3dBY2NlbGVyYXRvcnMiLCJ2YWx1ZSIsIm1vZHVsZSIsImV4cG9ydHMiXSwibWFw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LFlBQUksS0FBS2pELEtBQVQsRUFDQTtBQUNJLGlCQUFLQSxLQUFMLENBQVdnQixDQUFYLEVBQWMsSUFBZDtBQUNIO0FBQ0o7O0FBRUQsUUFBSVosT0FBSixHQUNBO0FBQ0ksZUFBTyxLQUFLRCxRQUFaO0FBQ0g7QUFDRCxRQUFJQyxPQUFKLENBQVlrRCxLQUFaLEVBQ0E7QUFDSSxhQUFLbkQsUUFBTCxHQUFnQm1ELEtBQWhCO0FBQ0EsYUFBS3RCLEtBQUwsQ0FBV1EsU0FBWCxHQUF1QixLQUFLckMsUUFBTCxHQUFnQixVQUFoQixHQUE2QixFQUFwRDtBQUNIO0FBak9MOztBQW9PQW9ELE9BQU9DLE9BQVAsR0FBaUIvRCxRQUFqQiIsImZpbGUiOiJtZW51SXRlbS5qcyIsInNvdXJjZXNDb250ZW50IjpbImNvbnN0IGh0bWwgPSByZXF1aXJlKCcuL2h0bWwnKVxyXG5jb25zdCBDb25maWcgPSByZXF1aXJlKCcuL2NvbmZpZycpXHJcbmNvbnN0IGxvY2FsQWNjZWxlcmF0b3IgPSByZXF1aXJlKCcuL2xvY2FsQWNjZWxlcmF0b3InKVxyXG5cclxuY2xhc3MgTWVudUl0ZW1cclxue1xyXG4gICAgLyoqXHJcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gb3B0aW9uc1xyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IFtvcHRpb25zLmxhYmVsXSBsYWJlbCBmb3IgbWVudSBlbnRyeSBtYXkgaW5jbHVkZSBhY2NlbGVyYXRvciBieSBwbGFjaW5nICYgYmVmb3JlIGxldHRlcilcclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBbb3B0aW9ucy50eXBlXSBzZXBhcmF0b3IsIGNoZWNrYm94LCBvciB1bmRlZmluZWRcclxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBbb3B0aW9ucy5zdHlsZXNdIGFkZGl0aW9uYWwgQ1NTIHN0eWxlcyB0byBhcHBseSB0byB0aGlzIE1lbnVJdGVtXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gW29wdGlvbnMuYWNjZWxlcmF0b3JdIHNlZSBBY2NlbGVyYXRvciBmb3IgaW5wdXRzIChlLmcuLCBjdHJsK3NoaWZ0K0EpXHJcbiAgICAgKiBAcGFyYW0ge01lbnVJdGVtfSBbb3B0aW9ucy5zdWJtZW51XSBhdHRhY2hlcyBhIHN1Ym1lbnUgKGFuZCBjaGFuZ2VzIHR5cGUgdG8gc3VibWVudSlcclxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW29wdGlvbnMuY2hlY2tlZF0gY2hlY2sgdGhlIGNoZWNrYm94XHJcbiAgICAgKi9cclxuICAgIGNvbnN0cnVjdG9yKG9wdGlvbnMpXHJcbiAgICB7XHJcbiAgICAgICAgbG9jYWxBY2NlbGVyYXRvci5pbml0KClcclxuICAgICAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fVxyXG4gICAgICAgIHRoaXMuc3R5bGVzID0gb3B0aW9ucy5zdHlsZXNcclxuICAgICAgICB0aGlzLmRpdiA9IGh0bWwoKVxyXG4gICAgICAgIHRoaXMudHlwZSA9IG9wdGlvbnMudHlwZVxyXG4gICAgICAgIHRoaXMuY2xpY2sgPSBvcHRpb25zLmNsaWNrXHJcbiAgICAgICAgaWYgKHRoaXMudHlwZSA9PT0gJ3NlcGFyYXRvcicpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLmFwcGx5Q29uZmlnKENvbmZpZy5TZXBhcmF0b3JTdHlsZSlcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5fY2hlY2tlZCA9IG9wdGlvbnMuY2hlY2tlZFxyXG4gICAgICAgICAgICB0aGlzLmNyZWF0ZUNoZWNrZWQob3B0aW9ucy5jaGVja2VkKVxyXG4gICAgICAgICAgICB0aGlzLnRleHQgPSBvcHRpb25zLmxhYmVsIHx8ICcmbmJzcDsmbmJzcDsmbmJzcDsnXHJcbiAgICAgICAgICAgIHRoaXMuY3JlYXRlU2hvcnRjdXQoKVxyXG4gICAgICAgICAgICB0aGlzLmNyZWF0ZUFjY2VsZXJhdG9yKG9wdGlvbnMuYWNjZWxlcmF0b3IpXHJcbiAgICAgICAgICAgIHRoaXMuY3JlYXRlU3VibWVudShvcHRpb25zLnN1Ym1lbnUpXHJcbiAgICAgICAgICAgIGlmIChvcHRpb25zLnN1Ym1lbnUpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuc3VibWVudSA9IG9wdGlvbnMuc3VibWVudVxyXG4gICAgICAgICAgICAgICAgdGhpcy5zdWJtZW51LmFwcGx5Q29uZmlnKENvbmZpZy5NZW51U3R5bGUpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5hcHBseUNvbmZpZyhDb25maWcuUm93U3R5bGUpXHJcbiAgICAgICAgICAgIHRoaXMuZGl2LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIChlKSA9PiB0aGlzLmhhbmRsZUNsaWNrKGUpKVxyXG4gICAgICAgICAgICB0aGlzLmRpdi5hZGRFdmVudExpc3RlbmVyKCd0b3VjaHN0YXJ0JywgKGUpID0+IHRoaXMuaGFuZGxlQ2xpY2soZSkpXHJcbiAgICAgICAgICAgIHRoaXMuZGl2LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZW50ZXInLCAoKSA9PiB0aGlzLm1vdXNlZW50ZXIoKSlcclxuICAgICAgICAgICAgdGhpcy5kaXYuYWRkRXZlbnRMaXN0ZW5lcignbW91c2VsZWF2ZScsICgpID0+IHRoaXMubW91c2VsZWF2ZSgpKVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFRoZSBjbGljayBjYWxsYmFja1xyXG4gICAgICogQGNhbGxiYWNrIE1lbnVJdGVtfkNsaWNrQ2FsbGJhY2tcclxuICAgICAqIEBwYXJhbSB7SW5wdXRFdmVudH0gZVxyXG4gICAgICovXHJcblxyXG4gICAgbW91c2VlbnRlcigpXHJcbiAgICB7XHJcbiAgICAgICAgaWYgKCF0aGlzLnN1Ym1lbnUgfHwgdGhpcy5tZW51LnNob3dpbmcgIT09IHRoaXMgKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5kaXYuc3R5bGUuYmFja2dyb3VuZENvbG9yID0gQ29uZmlnLlNlbGVjdGVkQmFja2dyb3VuZFN0eWxlXHJcbiAgICAgICAgICAgIGlmICh0aGlzLnN1Ym1lbnUgJiYgIXRoaXMubWVudS5hcHBsaWNhdGlvbk1lbnUpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuc3VibWVudVRpbWVvdXQgPSBzZXRUaW1lb3V0KCgpID0+XHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zdWJtZW51VGltZW91dCA9IG51bGxcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnN1Ym1lbnUuc2hvdyh0aGlzKVxyXG4gICAgICAgICAgICAgICAgfSwgQ29uZmlnLlN1Ym1lbnVPcGVuRGVsYXkpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgbW91c2VsZWF2ZSgpXHJcbiAgICB7XHJcbiAgICAgICAgaWYgKCF0aGlzLnN1Ym1lbnUgfHwgdGhpcy5tZW51LnNob3dpbmcgIT09IHRoaXMpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5zdWJtZW51VGltZW91dClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgY2xlYXJUaW1lb3V0KHRoaXMuc3VibWVudVRpbWVvdXQpXHJcbiAgICAgICAgICAgICAgICB0aGlzLnN1Ym1lbnVUaW1lb3V0ID0gbnVsbFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMuZGl2LnN0eWxlLmJhY2tncm91bmRDb2xvciA9ICd0cmFuc3BhcmVudCdcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgYXBwbHlDb25maWcoYmFzZSlcclxuICAgIHtcclxuICAgICAgICBjb25zdCBzdHlsZXMgPSB7fVxyXG4gICAgICAgIGZvciAobGV0IHN0eWxlIGluIGJhc2UpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBzdHlsZXNbc3R5bGVdID0gYmFzZVtzdHlsZV1cclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHRoaXMuc3R5bGVzKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgZm9yIChsZXQgc3R5bGUgaW4gdGhpcy5zdHlsZXMpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHN0eWxlc1tzdHlsZV0gPSB0aGlzLnN0eWxlc1tzdHlsZV1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBmb3IgKGxldCBzdHlsZSBpbiBzdHlsZXMpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLmRpdi5zdHlsZVtzdHlsZV0gPSBzdHlsZXNbc3R5bGVdXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGNyZWF0ZUNoZWNrZWQoY2hlY2tlZClcclxuICAgIHtcclxuICAgICAgICB0aGlzLmNoZWNrID0gaHRtbCh7IHBhcmVudDogdGhpcy5kaXYsIGh0bWw6IGNoZWNrZWQgPyAnJiMxMDAwNDsnIDogJycgfSlcclxuICAgIH1cclxuXHJcbiAgICBjcmVhdGVTaG9ydGN1dCgpXHJcbiAgICB7XHJcbiAgICAgICAgaWYgKHRoaXMudHlwZSAhPT0gJ3NlcGFyYXRvcicpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBjb25zdCB0ZXh0ID0gdGhpcy50ZXh0XHJcbiAgICAgICAgICAgIHRoaXMubGFiZWwgPSBodG1sKHsgcGFyZW50OiB0aGlzLmRpdiB9KVxyXG4gICAgICAgICAgICBsZXQgY3VycmVudCA9IGh0bWwoeyBwYXJlbnQ6IHRoaXMubGFiZWwsIHR5cGU6ICdzcGFuJyB9KVxyXG4gICAgICAgICAgICBpZiAodGV4dC5pbmRleE9mKCcmJykgIT09IC0xKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBsZXQgaSA9IDBcclxuICAgICAgICAgICAgICAgIGRvXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgbGV0dGVyID0gdGV4dFtpXVxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChsZXR0ZXIgPT09ICcmJylcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGkrK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnNob3J0Y3V0U3BhbiA9IGh0bWwoeyBwYXJlbnQ6IHRoaXMubGFiZWwsIHR5cGU6ICdzcGFuJywgaHRtbDogdGV4dFtpXSwgc3R5bGVzOiBDb25maWcuQWNjZWxlcmF0b3JLZXlTdHlsZSB9KVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjdXJyZW50ID0gaHRtbCh7IHBhcmVudDogdGhpcy5sYWJlbCwgdHlwZTogJ3NwYW4nIH0pXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGN1cnJlbnQuaW5uZXJIVE1MICs9IGxldHRlclxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBpKytcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHdoaWxlIChpIDwgdGV4dC5sZW5ndGgpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmxhYmVsLmlubmVySFRNTCA9IHRleHRcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBzaG93U2hvcnRjdXQoKVxyXG4gICAge1xyXG4gICAgICAgIGlmICh0aGlzLnNob3J0Y3V0U3BhbilcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMuc2hvcnRjdXRTcGFuLnN0eWxlLnRleHREZWNvcmF0aW9uID0gJ3VuZGVybGluZSdcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgaGlkZVNob3J0Y3V0KClcclxuICAgIHtcclxuICAgICAgICBpZiAodGhpcy5zaG9ydGN1dFNwYW4pXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLnNob3J0Y3V0U3Bhbi5zdHlsZS50ZXh0RGVjb3JhdGlvbiA9ICdub25lJ1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBjcmVhdGVBY2NlbGVyYXRvcihhY2NlbGVyYXRvcilcclxuICAgIHtcclxuICAgICAgICB0aGlzLmFjY2VsZXJhdG9yID0gaHRtbCh7IHBhcmVudDogdGhpcy5kaXYsIGh0bWw6IGFjY2VsZXJhdG9yID8gbG9jYWxBY2NlbGVyYXRvci5wcmV0dGlmeUtleShhY2NlbGVyYXRvcikgOiAnJywgc3R5bGVzOiBDb25maWcuQWNjZWxlcmF0b3JTdHlsZSB9KVxyXG4gICAgICAgIGlmIChhY2NlbGVyYXRvcilcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGxvY2FsQWNjZWxlcmF0b3IucmVnaXN0ZXIoYWNjZWxlcmF0b3IsIChlKSA9PiB0aGlzLmNsaWNrKGUpKVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBjcmVhdGVTdWJtZW51KHN1Ym1lbnUpXHJcbiAgICB7XHJcbiAgICAgICAgdGhpcy5hcnJvdyA9IGh0bWwoeyBwYXJlbnQ6IHRoaXMuZGl2LCBodG1sOiBzdWJtZW51ID8gJyYjOTY1ODsnIDogJycgfSlcclxuICAgIH1cclxuXHJcbiAgICBjbG9zZUFsbCgpXHJcbiAgICB7XHJcbiAgICAgICAgbGV0IG1lbnUgPSB0aGlzLm1lbnVcclxuICAgICAgICBsb2NhbEFjY2VsZXJhdG9yLnVucmVnaXN0ZXJNZW51U2hvcnRjdXRzKClcclxuICAgICAgICB3aGlsZSAobWVudSAmJiAhbWVudS5hcHBsaWNhdGlvbk1lbnUpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBpZiAobWVudS5zaG93aW5nKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBtZW51LnNob3dpbmcuZGl2LnN0eWxlLmJhY2tncm91bmRDb2xvciA9ICd0cmFuc3BhcmVudCdcclxuICAgICAgICAgICAgICAgIG1lbnUuc2hvd2luZyA9IG51bGxcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBtZW51LmRpdi5yZW1vdmUoKVxyXG4gICAgICAgICAgICBtZW51ID0gbWVudS5tZW51XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChtZW51LnNob3dpbmcpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBtZW51LnNob3dpbmcuZGl2LnN0eWxlLmJhY2tncm91bmQgPSAndHJhbnNwYXJlbnQnXHJcbiAgICAgICAgICAgIG1lbnUuc2hvd2luZyA9IG51bGxcclxuICAgICAgICAgICAgbWVudS5zaG93QWNjZWxlcmF0b3JzKClcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgaGFuZGxlQ2xpY2soZSlcclxuICAgIHtcclxuICAgICAgICBpZiAodGhpcy5zdWJtZW51KVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMuc3VibWVudVRpbWVvdXQpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGNsZWFyVGltZW91dCh0aGlzLnN1Ym1lbnVUaW1lb3V0KVxyXG4gICAgICAgICAgICAgICAgdGhpcy5zdWJtZW51VGltZW91dCA9IG51bGxcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLnN1Ym1lbnUuc2hvdyh0aGlzKVxyXG4gICAgICAgICAgICB0aGlzLmRpdi5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSBDb25maWcuU2VsZWN0ZWRCYWNrZ3JvdW5kU3R5bGVcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAodGhpcy50eXBlID09PSAnY2hlY2tib3gnKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5jaGVja2VkID0gIXRoaXMuY2hlY2tlZFxyXG4gICAgICAgICAgICB0aGlzLmNsb3NlQWxsKClcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5jbG9zZUFsbCgpXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAodGhpcy5jbGljaylcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMuY2xpY2soZSwgdGhpcylcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0IGNoZWNrZWQoKVxyXG4gICAge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9jaGVja2VkXHJcbiAgICB9XHJcbiAgICBzZXQgY2hlY2tlZCh2YWx1ZSlcclxuICAgIHtcclxuICAgICAgICB0aGlzLl9jaGVja2VkID0gdmFsdWVcclxuICAgICAgICB0aGlzLmNoZWNrLmlubmVySFRNTCA9IHRoaXMuX2NoZWNrZWQgPyAnJiMxMDAwNDsnIDogJydcclxuICAgIH1cclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBNZW51SXRlbSJdfQ==