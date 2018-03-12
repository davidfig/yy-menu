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
            menu.hideAccelerators();
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
            if (this.menu.applicationMenu && document.activeElement !== this.div) {
                this.menu.div.focus();
            }
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9tZW51SXRlbS5qcyJdLCJuYW1lcyI6WyJodG1sIiwicmVxdWlyZSIsIkNvbmZpZyIsImxvY2FsQWNjZWxlcmF0b3IiLCJNZW51SXRlbSIsImNvbnN0cnVjdG9yIiwib3B0aW9ucyIsImluaXQiLCJzdHlsZXMiLCJkaXYiLCJ0eXBlIiwiY2xpY2siLCJhcHBseUNvbmZpZyIsIlNlcGFyYXRvclN0eWxlIiwiX2NoZWNrZWQiLCJjaGVja2VkIiwiY3JlYXRlQ2hlY2tlZCIsInRleHQiLCJsYWJlbCIsImNyZWF0ZVNob3J0Y3V0IiwiY3JlYXRlQWNjZWxlcmF0b3IiLCJhY2NlbGVyYXRvciIsImNyZWF0ZVN1Ym1lbnUiLCJzdWJtZW51IiwiTWVudVN0eWxlIiwiUm93U3R5bGUiLCJhZGRFdmVudExpc3RlbmVyIiwiZSIsImhhbmRsZUNsaWNrIiwibW91c2VlbnRlciIsIm1vdXNlbGVhdmUiLCJtZW51Iiwic2hvd2luZyIsInN0eWxlIiwiYmFja2dyb3VuZENvbG9yIiwiU2VsZWN0ZWRCYWNrZ3JvdW5kU3R5bGUiLCJhcHBsaWNhdGlvbk1lbnUiLCJzdWJtZW51VGltZW91dCIsInNldFRpbWVvdXQiLCJzaG93IiwiU3VibWVudU9wZW5EZWxheSIsImNsZWFyVGltZW91dCIsImJhc2UiLCJjaGVjayIsInBhcmVudCIsImN1cnJlbnQiLCJpbmRleE9mIiwiaSIsImxldHRlciIsInNob3J0Y3V0U3BhbiIsIkFjY2VsZXJhdG9yS2V5U3R5bGUiLCJpbm5lckhUTUwiLCJsZW5ndGgiLCJzaG93U2hvcnRjdXQiLCJ0ZXh0RGVjb3JhdGlvbiIsImhpZGVTaG9ydGN1dCIsInByZXR0aWZ5S2V5IiwiQWNjZWxlcmF0b3JTdHlsZSIsInJlZ2lzdGVyIiwiYXJyb3ciLCJjbG9zZUFsbCIsInVucmVnaXN0ZXJNZW51U2hvcnRjdXRzIiwicmVtb3ZlIiwiYmFja2dyb3VuZCIsImhpZGVBY2NlbGVyYXRvcnMiLCJkb2N1bWVudCIsImFjdGl2ZUVsZW1lbnQiLCJmb2N1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LEtBQWQ7QUFDSDtBQUNKLFNBYkQsTUFjSyxJQUFJLEtBQUt6RCxJQUFMLEtBQWMsVUFBbEIsRUFDTDtBQUNJLGlCQUFLSyxPQUFMLEdBQWUsQ0FBQyxLQUFLQSxPQUFyQjtBQUNBLGlCQUFLNkMsUUFBTDtBQUNILFNBSkksTUFNTDtBQUNJLGlCQUFLQSxRQUFMO0FBQ0g7O0FBRUQsWUFBSSxLQUFLakQsS0FBVCxFQUNBO0FBQ0ksaUJBQUtBLEtBQUwsQ0FBV2dCLENBQVgsRUFBYyxJQUFkO0FBQ0g7QUFDSjs7QUFFRCxRQUFJWixPQUFKLEdBQ0E7QUFDSSxlQUFPLEtBQUtELFFBQVo7QUFDSDtBQUNELFFBQUlDLE9BQUosQ0FBWXFELEtBQVosRUFDQTtBQUNJLGFBQUt0RCxRQUFMLEdBQWdCc0QsS0FBaEI7QUFDQSxhQUFLekIsS0FBTCxDQUFXUSxTQUFYLEdBQXVCLEtBQUtyQyxRQUFMLEdBQWdCLFVBQWhCLEdBQTZCLEVBQXBEO0FBQ0g7QUFyT0w7O0FBd09BdUQsT0FBT0MsT0FBUCxHQUFpQmxFLFFBQWpCIiwiZmlsZSI6Im1lbnVJdGVtLmpzIiwic291cmNlc0NvbnRlbnQiOlsiY29uc3QgaHRtbCA9IHJlcXVpcmUoJy4vaHRtbCcpXHJcbmNvbnN0IENvbmZpZyA9IHJlcXVpcmUoJy4vY29uZmlnJylcclxuY29uc3QgbG9jYWxBY2NlbGVyYXRvciA9IHJlcXVpcmUoJy4vbG9jYWxBY2NlbGVyYXRvcicpXHJcblxyXG5jbGFzcyBNZW51SXRlbVxyXG57XHJcbiAgICAvKipcclxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gW29wdGlvbnMubGFiZWxdIGxhYmVsIGZvciBtZW51IGVudHJ5IG1heSBpbmNsdWRlIGFjY2VsZXJhdG9yIGJ5IHBsYWNpbmcgJiBiZWZvcmUgbGV0dGVyKVxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IFtvcHRpb25zLnR5cGVdIHNlcGFyYXRvciwgY2hlY2tib3gsIG9yIHVuZGVmaW5lZFxyXG4gICAgICogQHBhcmFtIHtvYmplY3R9IFtvcHRpb25zLnN0eWxlc10gYWRkaXRpb25hbCBDU1Mgc3R5bGVzIHRvIGFwcGx5IHRvIHRoaXMgTWVudUl0ZW1cclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBbb3B0aW9ucy5hY2NlbGVyYXRvcl0gc2VlIEFjY2VsZXJhdG9yIGZvciBpbnB1dHMgKGUuZy4sIGN0cmwrc2hpZnQrQSlcclxuICAgICAqIEBwYXJhbSB7TWVudUl0ZW19IFtvcHRpb25zLnN1Ym1lbnVdIGF0dGFjaGVzIGEgc3VibWVudSAoYW5kIGNoYW5nZXMgdHlwZSB0byBzdWJtZW51KVxyXG4gICAgICogQHBhcmFtIHtib29sZWFufSBbb3B0aW9ucy5jaGVja2VkXSBjaGVjayB0aGUgY2hlY2tib3hcclxuICAgICAqL1xyXG4gICAgY29uc3RydWN0b3Iob3B0aW9ucylcclxuICAgIHtcclxuICAgICAgICBsb2NhbEFjY2VsZXJhdG9yLmluaXQoKVxyXG4gICAgICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9XHJcbiAgICAgICAgdGhpcy5zdHlsZXMgPSBvcHRpb25zLnN0eWxlc1xyXG4gICAgICAgIHRoaXMuZGl2ID0gaHRtbCgpXHJcbiAgICAgICAgdGhpcy50eXBlID0gb3B0aW9ucy50eXBlXHJcbiAgICAgICAgdGhpcy5jbGljayA9IG9wdGlvbnMuY2xpY2tcclxuICAgICAgICBpZiAodGhpcy50eXBlID09PSAnc2VwYXJhdG9yJylcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMuYXBwbHlDb25maWcoQ29uZmlnLlNlcGFyYXRvclN0eWxlKVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLl9jaGVja2VkID0gb3B0aW9ucy5jaGVja2VkXHJcbiAgICAgICAgICAgIHRoaXMuY3JlYXRlQ2hlY2tlZChvcHRpb25zLmNoZWNrZWQpXHJcbiAgICAgICAgICAgIHRoaXMudGV4dCA9IG9wdGlvbnMubGFiZWwgfHwgJyZuYnNwOyZuYnNwOyZuYnNwOydcclxuICAgICAgICAgICAgdGhpcy5jcmVhdGVTaG9ydGN1dCgpXHJcbiAgICAgICAgICAgIHRoaXMuY3JlYXRlQWNjZWxlcmF0b3Iob3B0aW9ucy5hY2NlbGVyYXRvcilcclxuICAgICAgICAgICAgdGhpcy5jcmVhdGVTdWJtZW51KG9wdGlvbnMuc3VibWVudSlcclxuICAgICAgICAgICAgaWYgKG9wdGlvbnMuc3VibWVudSlcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zdWJtZW51ID0gb3B0aW9ucy5zdWJtZW51XHJcbiAgICAgICAgICAgICAgICB0aGlzLnN1Ym1lbnUuYXBwbHlDb25maWcoQ29uZmlnLk1lbnVTdHlsZSlcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLmFwcGx5Q29uZmlnKENvbmZpZy5Sb3dTdHlsZSlcclxuICAgICAgICAgICAgdGhpcy5kaXYuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgKGUpID0+IHRoaXMuaGFuZGxlQ2xpY2soZSkpXHJcbiAgICAgICAgICAgIHRoaXMuZGl2LmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNoc3RhcnQnLCAoZSkgPT4gdGhpcy5oYW5kbGVDbGljayhlKSlcclxuICAgICAgICAgICAgdGhpcy5kaXYuYWRkRXZlbnRMaXN0ZW5lcignbW91c2VlbnRlcicsICgpID0+IHRoaXMubW91c2VlbnRlcigpKVxyXG4gICAgICAgICAgICB0aGlzLmRpdi5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWxlYXZlJywgKCkgPT4gdGhpcy5tb3VzZWxlYXZlKCkpXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogVGhlIGNsaWNrIGNhbGxiYWNrXHJcbiAgICAgKiBAY2FsbGJhY2sgTWVudUl0ZW1+Q2xpY2tDYWxsYmFja1xyXG4gICAgICogQHBhcmFtIHtJbnB1dEV2ZW50fSBlXHJcbiAgICAgKi9cclxuXHJcbiAgICBtb3VzZWVudGVyKClcclxuICAgIHtcclxuICAgICAgICBpZiAoIXRoaXMuc3VibWVudSB8fCB0aGlzLm1lbnUuc2hvd2luZyAhPT0gdGhpcyApXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLmRpdi5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSBDb25maWcuU2VsZWN0ZWRCYWNrZ3JvdW5kU3R5bGVcclxuICAgICAgICAgICAgaWYgKHRoaXMuc3VibWVudSAmJiAhdGhpcy5tZW51LmFwcGxpY2F0aW9uTWVudSlcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zdWJtZW51VGltZW91dCA9IHNldFRpbWVvdXQoKCkgPT5cclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnN1Ym1lbnVUaW1lb3V0ID0gbnVsbFxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc3VibWVudS5zaG93KHRoaXMpXHJcbiAgICAgICAgICAgICAgICB9LCBDb25maWcuU3VibWVudU9wZW5EZWxheSlcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBtb3VzZWxlYXZlKClcclxuICAgIHtcclxuICAgICAgICBpZiAoIXRoaXMuc3VibWVudSB8fCB0aGlzLm1lbnUuc2hvd2luZyAhPT0gdGhpcylcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLnN1Ym1lbnVUaW1lb3V0KVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBjbGVhclRpbWVvdXQodGhpcy5zdWJtZW51VGltZW91dClcclxuICAgICAgICAgICAgICAgIHRoaXMuc3VibWVudVRpbWVvdXQgPSBudWxsXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5kaXYuc3R5bGUuYmFja2dyb3VuZENvbG9yID0gJ3RyYW5zcGFyZW50J1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBhcHBseUNvbmZpZyhiYXNlKVxyXG4gICAge1xyXG4gICAgICAgIGNvbnN0IHN0eWxlcyA9IHt9XHJcbiAgICAgICAgZm9yIChsZXQgc3R5bGUgaW4gYmFzZSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHN0eWxlc1tzdHlsZV0gPSBiYXNlW3N0eWxlXVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodGhpcy5zdHlsZXMpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBmb3IgKGxldCBzdHlsZSBpbiB0aGlzLnN0eWxlcylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgc3R5bGVzW3N0eWxlXSA9IHRoaXMuc3R5bGVzW3N0eWxlXVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGZvciAobGV0IHN0eWxlIGluIHN0eWxlcylcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMuZGl2LnN0eWxlW3N0eWxlXSA9IHN0eWxlc1tzdHlsZV1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgY3JlYXRlQ2hlY2tlZChjaGVja2VkKVxyXG4gICAge1xyXG4gICAgICAgIHRoaXMuY2hlY2sgPSBodG1sKHsgcGFyZW50OiB0aGlzLmRpdiwgaHRtbDogY2hlY2tlZCA/ICcmIzEwMDA0OycgOiAnJyB9KVxyXG4gICAgfVxyXG5cclxuICAgIGNyZWF0ZVNob3J0Y3V0KClcclxuICAgIHtcclxuICAgICAgICBpZiAodGhpcy50eXBlICE9PSAnc2VwYXJhdG9yJylcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGNvbnN0IHRleHQgPSB0aGlzLnRleHRcclxuICAgICAgICAgICAgdGhpcy5sYWJlbCA9IGh0bWwoeyBwYXJlbnQ6IHRoaXMuZGl2IH0pXHJcbiAgICAgICAgICAgIGxldCBjdXJyZW50ID0gaHRtbCh7IHBhcmVudDogdGhpcy5sYWJlbCwgdHlwZTogJ3NwYW4nIH0pXHJcbiAgICAgICAgICAgIGlmICh0ZXh0LmluZGV4T2YoJyYnKSAhPT0gLTEpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGxldCBpID0gMFxyXG4gICAgICAgICAgICAgICAgZG9cclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBsZXR0ZXIgPSB0ZXh0W2ldXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGxldHRlciA9PT0gJyYnKVxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaSsrXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc2hvcnRjdXRTcGFuID0gaHRtbCh7IHBhcmVudDogdGhpcy5sYWJlbCwgdHlwZTogJ3NwYW4nLCBodG1sOiB0ZXh0W2ldLCBzdHlsZXM6IENvbmZpZy5BY2NlbGVyYXRvcktleVN0eWxlIH0pXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGN1cnJlbnQgPSBodG1sKHsgcGFyZW50OiB0aGlzLmxhYmVsLCB0eXBlOiAnc3BhbicgfSlcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY3VycmVudC5pbm5lckhUTUwgKz0gbGV0dGVyXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGkrK1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgd2hpbGUgKGkgPCB0ZXh0Lmxlbmd0aClcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHRoaXMubGFiZWwuaW5uZXJIVE1MID0gdGV4dFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHNob3dTaG9ydGN1dCgpXHJcbiAgICB7XHJcbiAgICAgICAgaWYgKHRoaXMuc2hvcnRjdXRTcGFuKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5zaG9ydGN1dFNwYW4uc3R5bGUudGV4dERlY29yYXRpb24gPSAndW5kZXJsaW5lJ1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBoaWRlU2hvcnRjdXQoKVxyXG4gICAge1xyXG4gICAgICAgIGlmICh0aGlzLnNob3J0Y3V0U3BhbilcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMuc2hvcnRjdXRTcGFuLnN0eWxlLnRleHREZWNvcmF0aW9uID0gJ25vbmUnXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGNyZWF0ZUFjY2VsZXJhdG9yKGFjY2VsZXJhdG9yKVxyXG4gICAge1xyXG4gICAgICAgIHRoaXMuYWNjZWxlcmF0b3IgPSBodG1sKHsgcGFyZW50OiB0aGlzLmRpdiwgaHRtbDogYWNjZWxlcmF0b3IgPyBsb2NhbEFjY2VsZXJhdG9yLnByZXR0aWZ5S2V5KGFjY2VsZXJhdG9yKSA6ICcnLCBzdHlsZXM6IENvbmZpZy5BY2NlbGVyYXRvclN0eWxlIH0pXHJcbiAgICAgICAgaWYgKGFjY2VsZXJhdG9yKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgbG9jYWxBY2NlbGVyYXRvci5yZWdpc3RlcihhY2NlbGVyYXRvciwgKGUpID0+IHRoaXMuY2xpY2soZSkpXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGNyZWF0ZVN1Ym1lbnUoc3VibWVudSlcclxuICAgIHtcclxuICAgICAgICB0aGlzLmFycm93ID0gaHRtbCh7IHBhcmVudDogdGhpcy5kaXYsIGh0bWw6IHN1Ym1lbnUgPyAnJiM5NjU4OycgOiAnJyB9KVxyXG4gICAgfVxyXG5cclxuICAgIGNsb3NlQWxsKClcclxuICAgIHtcclxuICAgICAgICBsZXQgbWVudSA9IHRoaXMubWVudVxyXG4gICAgICAgIGxvY2FsQWNjZWxlcmF0b3IudW5yZWdpc3Rlck1lbnVTaG9ydGN1dHMoKVxyXG4gICAgICAgIHdoaWxlIChtZW51ICYmICFtZW51LmFwcGxpY2F0aW9uTWVudSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGlmIChtZW51LnNob3dpbmcpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIG1lbnUuc2hvd2luZy5kaXYuc3R5bGUuYmFja2dyb3VuZENvbG9yID0gJ3RyYW5zcGFyZW50J1xyXG4gICAgICAgICAgICAgICAgbWVudS5zaG93aW5nID0gbnVsbFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIG1lbnUuZGl2LnJlbW92ZSgpXHJcbiAgICAgICAgICAgIG1lbnUgPSBtZW51Lm1lbnVcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKG1lbnUuc2hvd2luZylcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIG1lbnUuc2hvd2luZy5kaXYuc3R5bGUuYmFja2dyb3VuZCA9ICd0cmFuc3BhcmVudCdcclxuICAgICAgICAgICAgbWVudS5zaG93aW5nID0gbnVsbFxyXG4gICAgICAgICAgICBtZW51LmhpZGVBY2NlbGVyYXRvcnMoKVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBoYW5kbGVDbGljayhlKVxyXG4gICAge1xyXG4gICAgICAgIGlmICh0aGlzLnN1Ym1lbnUpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5zdWJtZW51VGltZW91dClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgY2xlYXJUaW1lb3V0KHRoaXMuc3VibWVudVRpbWVvdXQpXHJcbiAgICAgICAgICAgICAgICB0aGlzLnN1Ym1lbnVUaW1lb3V0ID0gbnVsbFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMuc3VibWVudS5zaG93KHRoaXMpXHJcbiAgICAgICAgICAgIHRoaXMuZGl2LnN0eWxlLmJhY2tncm91bmRDb2xvciA9IENvbmZpZy5TZWxlY3RlZEJhY2tncm91bmRTdHlsZVxyXG4gICAgICAgICAgICBpZiAodGhpcy5tZW51LmFwcGxpY2F0aW9uTWVudSAmJiBkb2N1bWVudC5hY3RpdmVFbGVtZW50ICE9PSB0aGlzLmRpdilcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5tZW51LmRpdi5mb2N1cygpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAodGhpcy50eXBlID09PSAnY2hlY2tib3gnKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5jaGVja2VkID0gIXRoaXMuY2hlY2tlZFxyXG4gICAgICAgICAgICB0aGlzLmNsb3NlQWxsKClcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5jbG9zZUFsbCgpXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAodGhpcy5jbGljaylcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMuY2xpY2soZSwgdGhpcylcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0IGNoZWNrZWQoKVxyXG4gICAge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9jaGVja2VkXHJcbiAgICB9XHJcbiAgICBzZXQgY2hlY2tlZCh2YWx1ZSlcclxuICAgIHtcclxuICAgICAgICB0aGlzLl9jaGVja2VkID0gdmFsdWVcclxuICAgICAgICB0aGlzLmNoZWNrLmlubmVySFRNTCA9IHRoaXMuX2NoZWNrZWQgPyAnJiMxMDAwNDsnIDogJydcclxuICAgIH1cclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBNZW51SXRlbSJdfQ==