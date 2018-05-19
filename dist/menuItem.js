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
            if (this.submenu && (!this.menu.applicationMenu || this.menu.showing)) {
                this.submenuTimeout = setTimeout(() => {
                    this.submenuTimeout = null;
                    this.submenu.show(this);
                }, this.menu.applicationMenu ? 0 : Config.SubmenuOpenDelay);
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
            if (typeof e.keyCode !== 'undefined' && this.menu.applicationMenu && document.activeElement !== this.menu.div) {
                this.menu.div.focus();
            }
            e.preventDefault();
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9tZW51SXRlbS5qcyJdLCJuYW1lcyI6WyJodG1sIiwicmVxdWlyZSIsIkNvbmZpZyIsImxvY2FsQWNjZWxlcmF0b3IiLCJNZW51SXRlbSIsImNvbnN0cnVjdG9yIiwib3B0aW9ucyIsImluaXQiLCJzdHlsZXMiLCJkaXYiLCJ0eXBlIiwiY2xpY2siLCJhcHBseUNvbmZpZyIsIlNlcGFyYXRvclN0eWxlIiwiX2NoZWNrZWQiLCJjaGVja2VkIiwiY3JlYXRlQ2hlY2tlZCIsInRleHQiLCJsYWJlbCIsImNyZWF0ZVNob3J0Y3V0IiwiY3JlYXRlQWNjZWxlcmF0b3IiLCJhY2NlbGVyYXRvciIsImNyZWF0ZVN1Ym1lbnUiLCJzdWJtZW51IiwiTWVudVN0eWxlIiwiUm93U3R5bGUiLCJhZGRFdmVudExpc3RlbmVyIiwiZSIsImhhbmRsZUNsaWNrIiwibW91c2VlbnRlciIsIm1vdXNlbGVhdmUiLCJtZW51Iiwic2hvd2luZyIsInN0eWxlIiwiYmFja2dyb3VuZENvbG9yIiwiU2VsZWN0ZWRCYWNrZ3JvdW5kU3R5bGUiLCJhcHBsaWNhdGlvbk1lbnUiLCJzdWJtZW51VGltZW91dCIsInNldFRpbWVvdXQiLCJzaG93IiwiU3VibWVudU9wZW5EZWxheSIsImNsZWFyVGltZW91dCIsImJhc2UiLCJjaGVjayIsInBhcmVudCIsImN1cnJlbnQiLCJpbmRleE9mIiwiaSIsImxldHRlciIsInNob3J0Y3V0U3BhbiIsIkFjY2VsZXJhdG9yS2V5U3R5bGUiLCJpbm5lckhUTUwiLCJsZW5ndGgiLCJzaG93U2hvcnRjdXQiLCJ0ZXh0RGVjb3JhdGlvbiIsImhpZGVTaG9ydGN1dCIsInByZXR0aWZ5S2V5IiwiQWNjZWxlcmF0b3JTdHlsZSIsInJlZ2lzdGVyIiwiYXJyb3ciLCJjbG9zZUFsbCIsInVucmVnaXN0ZXJNZW51U2hvcnRjdXRzIiwicmVtb3ZlIiwiYmFja2dyb3VuZCIsImhpZGVBY2NlbGVyYXRvcnMiLCJrZXlDb2RlIiwiZG9jdW1lbnQiLCJhY3RpdmVFbGVt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T0FBT1IsRUFBRXNDLE9BQVQsS0FBcUIsV0FBckIsSUFBb0MsS0FBS2xDLElBQUwsQ0FBVUssZUFBOUMsSUFBaUU4QixTQUFTQyxhQUFULEtBQTJCLEtBQUtwQyxJQUFMLENBQVV0QixHQUExRyxFQUNBO0FBQ0kscUJBQUtzQixJQUFMLENBQVV0QixHQUFWLENBQWMyRCxLQUFkO0FBQ0g7QUFDRHpDLGNBQUUwQyxjQUFGO0FBQ0gsU0FkRCxNQWVLLElBQUksS0FBSzNELElBQUwsS0FBYyxVQUFsQixFQUNMO0FBQ0ksaUJBQUtLLE9BQUwsR0FBZSxDQUFDLEtBQUtBLE9BQXJCO0FBQ0EsaUJBQUs2QyxRQUFMO0FBQ0gsU0FKSSxNQU1MO0FBQ0ksaUJBQUtBLFFBQUw7QUFDSDs7QUFFRCxZQUFJLEtBQUtqRCxLQUFULEVBQ0E7QUFDSSxpQkFBS0EsS0FBTCxDQUFXZ0IsQ0FBWCxFQUFjLElBQWQ7QUFDSDtBQUNKOztBQUVELFFBQUlaLE9BQUosR0FDQTtBQUNJLGVBQU8sS0FBS0QsUUFBWjtBQUNIO0FBQ0QsUUFBSUMsT0FBSixDQUFZdUQsS0FBWixFQUNBO0FBQ0ksYUFBS3hELFFBQUwsR0FBZ0J3RCxLQUFoQjtBQUNBLGFBQUszQixLQUFMLENBQVdRLFNBQVgsR0FBdUIsS0FBS3JDLFFBQUwsR0FBZ0IsVUFBaEIsR0FBNkIsRUFBcEQ7QUFDSDtBQXRPTDs7QUF5T0F5RCxPQUFPQyxPQUFQLEdBQWlCcEUsUUFBakIiLCJmaWxlIjoibWVudUl0ZW0uanMiLCJzb3VyY2VzQ29udGVudCI6WyJjb25zdCBodG1sID0gcmVxdWlyZSgnLi9odG1sJylcclxuY29uc3QgQ29uZmlnID0gcmVxdWlyZSgnLi9jb25maWcnKVxyXG5jb25zdCBsb2NhbEFjY2VsZXJhdG9yID0gcmVxdWlyZSgnLi9sb2NhbEFjY2VsZXJhdG9yJylcclxuXHJcbmNsYXNzIE1lbnVJdGVtXHJcbntcclxuICAgIC8qKlxyXG4gICAgICogQHBhcmFtIHtvYmplY3R9IG9wdGlvbnNcclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBbb3B0aW9ucy5sYWJlbF0gbGFiZWwgZm9yIG1lbnUgZW50cnkgbWF5IGluY2x1ZGUgYWNjZWxlcmF0b3IgYnkgcGxhY2luZyAmIGJlZm9yZSBsZXR0ZXIpXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gW29wdGlvbnMudHlwZV0gc2VwYXJhdG9yLCBjaGVja2JveCwgb3IgdW5kZWZpbmVkXHJcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gW29wdGlvbnMuc3R5bGVzXSBhZGRpdGlvbmFsIENTUyBzdHlsZXMgdG8gYXBwbHkgdG8gdGhpcyBNZW51SXRlbVxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IFtvcHRpb25zLmFjY2VsZXJhdG9yXSBzZWUgQWNjZWxlcmF0b3IgZm9yIGlucHV0cyAoZS5nLiwgY3RybCtzaGlmdCtBKVxyXG4gICAgICogQHBhcmFtIHtNZW51SXRlbX0gW29wdGlvbnMuc3VibWVudV0gYXR0YWNoZXMgYSBzdWJtZW51IChhbmQgY2hhbmdlcyB0eXBlIHRvIHN1Ym1lbnUpXHJcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtvcHRpb25zLmNoZWNrZWRdIGNoZWNrIHRoZSBjaGVja2JveFxyXG4gICAgICovXHJcbiAgICBjb25zdHJ1Y3RvcihvcHRpb25zKVxyXG4gICAge1xyXG4gICAgICAgIGxvY2FsQWNjZWxlcmF0b3IuaW5pdCgpXHJcbiAgICAgICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge31cclxuICAgICAgICB0aGlzLnN0eWxlcyA9IG9wdGlvbnMuc3R5bGVzXHJcbiAgICAgICAgdGhpcy5kaXYgPSBodG1sKClcclxuICAgICAgICB0aGlzLnR5cGUgPSBvcHRpb25zLnR5cGVcclxuICAgICAgICB0aGlzLmNsaWNrID0gb3B0aW9ucy5jbGlja1xyXG4gICAgICAgIGlmICh0aGlzLnR5cGUgPT09ICdzZXBhcmF0b3InKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5hcHBseUNvbmZpZyhDb25maWcuU2VwYXJhdG9yU3R5bGUpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2VcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMuX2NoZWNrZWQgPSBvcHRpb25zLmNoZWNrZWRcclxuICAgICAgICAgICAgdGhpcy5jcmVhdGVDaGVja2VkKG9wdGlvbnMuY2hlY2tlZClcclxuICAgICAgICAgICAgdGhpcy50ZXh0ID0gb3B0aW9ucy5sYWJlbCB8fCAnJm5ic3A7Jm5ic3A7Jm5ic3A7J1xyXG4gICAgICAgICAgICB0aGlzLmNyZWF0ZVNob3J0Y3V0KClcclxuICAgICAgICAgICAgdGhpcy5jcmVhdGVBY2NlbGVyYXRvcihvcHRpb25zLmFjY2VsZXJhdG9yKVxyXG4gICAgICAgICAgICB0aGlzLmNyZWF0ZVN1Ym1lbnUob3B0aW9ucy5zdWJtZW51KVxyXG4gICAgICAgICAgICBpZiAob3B0aW9ucy5zdWJtZW51KVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnN1Ym1lbnUgPSBvcHRpb25zLnN1Ym1lbnVcclxuICAgICAgICAgICAgICAgIHRoaXMuc3VibWVudS5hcHBseUNvbmZpZyhDb25maWcuTWVudVN0eWxlKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMuYXBwbHlDb25maWcoQ29uZmlnLlJvd1N0eWxlKVxyXG4gICAgICAgICAgICB0aGlzLmRpdi5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCAoZSkgPT4gdGhpcy5oYW5kbGVDbGljayhlKSlcclxuICAgICAgICAgICAgdGhpcy5kaXYuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2hzdGFydCcsIChlKSA9PiB0aGlzLmhhbmRsZUNsaWNrKGUpKVxyXG4gICAgICAgICAgICB0aGlzLmRpdi5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWVudGVyJywgKCkgPT4gdGhpcy5tb3VzZWVudGVyKCkpXHJcbiAgICAgICAgICAgIHRoaXMuZGl2LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlbGVhdmUnLCAoKSA9PiB0aGlzLm1vdXNlbGVhdmUoKSlcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBUaGUgY2xpY2sgY2FsbGJhY2tcclxuICAgICAqIEBjYWxsYmFjayBNZW51SXRlbX5DbGlja0NhbGxiYWNrXHJcbiAgICAgKiBAcGFyYW0ge0lucHV0RXZlbnR9IGVcclxuICAgICAqL1xyXG5cclxuICAgIG1vdXNlZW50ZXIoKVxyXG4gICAge1xyXG4gICAgICAgIGlmICghdGhpcy5zdWJtZW51IHx8IHRoaXMubWVudS5zaG93aW5nICE9PSB0aGlzIClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMuZGl2LnN0eWxlLmJhY2tncm91bmRDb2xvciA9IENvbmZpZy5TZWxlY3RlZEJhY2tncm91bmRTdHlsZVxyXG4gICAgICAgICAgICBpZiAodGhpcy5zdWJtZW51ICYmICghdGhpcy5tZW51LmFwcGxpY2F0aW9uTWVudSB8fCB0aGlzLm1lbnUuc2hvd2luZykpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuc3VibWVudVRpbWVvdXQgPSBzZXRUaW1lb3V0KCgpID0+XHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zdWJtZW51VGltZW91dCA9IG51bGxcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnN1Ym1lbnUuc2hvdyh0aGlzKVxyXG4gICAgICAgICAgICAgICAgfSwgdGhpcy5tZW51LmFwcGxpY2F0aW9uTWVudSA/IDAgOiBDb25maWcuU3VibWVudU9wZW5EZWxheSlcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBtb3VzZWxlYXZlKClcclxuICAgIHtcclxuICAgICAgICBpZiAoIXRoaXMuc3VibWVudSB8fCB0aGlzLm1lbnUuc2hvd2luZyAhPT0gdGhpcylcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLnN1Ym1lbnVUaW1lb3V0KVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBjbGVhclRpbWVvdXQodGhpcy5zdWJtZW51VGltZW91dClcclxuICAgICAgICAgICAgICAgIHRoaXMuc3VibWVudVRpbWVvdXQgPSBudWxsXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5kaXYuc3R5bGUuYmFja2dyb3VuZENvbG9yID0gJ3RyYW5zcGFyZW50J1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBhcHBseUNvbmZpZyhiYXNlKVxyXG4gICAge1xyXG4gICAgICAgIGNvbnN0IHN0eWxlcyA9IHt9XHJcbiAgICAgICAgZm9yIChsZXQgc3R5bGUgaW4gYmFzZSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHN0eWxlc1tzdHlsZV0gPSBiYXNlW3N0eWxlXVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodGhpcy5zdHlsZXMpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBmb3IgKGxldCBzdHlsZSBpbiB0aGlzLnN0eWxlcylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgc3R5bGVzW3N0eWxlXSA9IHRoaXMuc3R5bGVzW3N0eWxlXVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGZvciAobGV0IHN0eWxlIGluIHN0eWxlcylcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMuZGl2LnN0eWxlW3N0eWxlXSA9IHN0eWxlc1tzdHlsZV1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgY3JlYXRlQ2hlY2tlZChjaGVja2VkKVxyXG4gICAge1xyXG4gICAgICAgIHRoaXMuY2hlY2sgPSBodG1sKHsgcGFyZW50OiB0aGlzLmRpdiwgaHRtbDogY2hlY2tlZCA/ICcmIzEwMDA0OycgOiAnJyB9KVxyXG4gICAgfVxyXG5cclxuICAgIGNyZWF0ZVNob3J0Y3V0KClcclxuICAgIHtcclxuICAgICAgICBpZiAodGhpcy50eXBlICE9PSAnc2VwYXJhdG9yJylcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGNvbnN0IHRleHQgPSB0aGlzLnRleHRcclxuICAgICAgICAgICAgdGhpcy5sYWJlbCA9IGh0bWwoeyBwYXJlbnQ6IHRoaXMuZGl2IH0pXHJcbiAgICAgICAgICAgIGxldCBjdXJyZW50ID0gaHRtbCh7IHBhcmVudDogdGhpcy5sYWJlbCwgdHlwZTogJ3NwYW4nIH0pXHJcbiAgICAgICAgICAgIGlmICh0ZXh0LmluZGV4T2YoJyYnKSAhPT0gLTEpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGxldCBpID0gMFxyXG4gICAgICAgICAgICAgICAgZG9cclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBsZXR0ZXIgPSB0ZXh0W2ldXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGxldHRlciA9PT0gJyYnKVxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaSsrXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc2hvcnRjdXRTcGFuID0gaHRtbCh7IHBhcmVudDogdGhpcy5sYWJlbCwgdHlwZTogJ3NwYW4nLCBodG1sOiB0ZXh0W2ldLCBzdHlsZXM6IENvbmZpZy5BY2NlbGVyYXRvcktleVN0eWxlIH0pXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGN1cnJlbnQgPSBodG1sKHsgcGFyZW50OiB0aGlzLmxhYmVsLCB0eXBlOiAnc3BhbicgfSlcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY3VycmVudC5pbm5lckhUTUwgKz0gbGV0dGVyXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGkrK1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgd2hpbGUgKGkgPCB0ZXh0Lmxlbmd0aClcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHRoaXMubGFiZWwuaW5uZXJIVE1MID0gdGV4dFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHNob3dTaG9ydGN1dCgpXHJcbiAgICB7XHJcbiAgICAgICAgaWYgKHRoaXMuc2hvcnRjdXRTcGFuKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5zaG9ydGN1dFNwYW4uc3R5bGUudGV4dERlY29yYXRpb24gPSAndW5kZXJsaW5lJ1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBoaWRlU2hvcnRjdXQoKVxyXG4gICAge1xyXG4gICAgICAgIGlmICh0aGlzLnNob3J0Y3V0U3BhbilcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMuc2hvcnRjdXRTcGFuLnN0eWxlLnRleHREZWNvcmF0aW9uID0gJ25vbmUnXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGNyZWF0ZUFjY2VsZXJhdG9yKGFjY2VsZXJhdG9yKVxyXG4gICAge1xyXG4gICAgICAgIHRoaXMuYWNjZWxlcmF0b3IgPSBodG1sKHsgcGFyZW50OiB0aGlzLmRpdiwgaHRtbDogYWNjZWxlcmF0b3IgPyBsb2NhbEFjY2VsZXJhdG9yLnByZXR0aWZ5S2V5KGFjY2VsZXJhdG9yKSA6ICcnLCBzdHlsZXM6IENvbmZpZy5BY2NlbGVyYXRvclN0eWxlIH0pXHJcbiAgICAgICAgaWYgKGFjY2VsZXJhdG9yKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgbG9jYWxBY2NlbGVyYXRvci5yZWdpc3RlcihhY2NlbGVyYXRvciwgKGUpID0+IHRoaXMuY2xpY2soZSkpXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGNyZWF0ZVN1Ym1lbnUoc3VibWVudSlcclxuICAgIHtcclxuICAgICAgICB0aGlzLmFycm93ID0gaHRtbCh7IHBhcmVudDogdGhpcy5kaXYsIGh0bWw6IHN1Ym1lbnUgPyAnJiM5NjU4OycgOiAnJyB9KVxyXG4gICAgfVxyXG5cclxuICAgIGNsb3NlQWxsKClcclxuICAgIHtcclxuICAgICAgICBsZXQgbWVudSA9IHRoaXMubWVudVxyXG4gICAgICAgIGxvY2FsQWNjZWxlcmF0b3IudW5yZWdpc3Rlck1lbnVTaG9ydGN1dHMoKVxyXG4gICAgICAgIHdoaWxlIChtZW51ICYmICFtZW51LmFwcGxpY2F0aW9uTWVudSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGlmIChtZW51LnNob3dpbmcpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIG1lbnUuc2hvd2luZy5kaXYuc3R5bGUuYmFja2dyb3VuZENvbG9yID0gJ3RyYW5zcGFyZW50J1xyXG4gICAgICAgICAgICAgICAgbWVudS5zaG93aW5nID0gbnVsbFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIG1lbnUuZGl2LnJlbW92ZSgpXHJcbiAgICAgICAgICAgIG1lbnUgPSBtZW51Lm1lbnVcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKG1lbnUuc2hvd2luZylcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIG1lbnUuc2hvd2luZy5kaXYuc3R5bGUuYmFja2dyb3VuZCA9ICd0cmFuc3BhcmVudCdcclxuICAgICAgICAgICAgbWVudS5zaG93aW5nID0gbnVsbFxyXG4gICAgICAgICAgICBtZW51LmhpZGVBY2NlbGVyYXRvcnMoKVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBoYW5kbGVDbGljayhlKVxyXG4gICAge1xyXG4gICAgICAgIGlmICh0aGlzLnN1Ym1lbnUpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5zdWJtZW51VGltZW91dClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgY2xlYXJUaW1lb3V0KHRoaXMuc3VibWVudVRpbWVvdXQpXHJcbiAgICAgICAgICAgICAgICB0aGlzLnN1Ym1lbnVUaW1lb3V0ID0gbnVsbFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMuc3VibWVudS5zaG93KHRoaXMpXHJcbiAgICAgICAgICAgIHRoaXMuZGl2LnN0eWxlLmJhY2tncm91bmRDb2xvciA9IENvbmZpZy5TZWxlY3RlZEJhY2tncm91bmRTdHlsZVxyXG4gICAgICAgICAgICBpZiAodHlwZW9mIGUua2V5Q29kZSAhPT0gJ3VuZGVmaW5lZCcgJiYgdGhpcy5tZW51LmFwcGxpY2F0aW9uTWVudSAmJiBkb2N1bWVudC5hY3RpdmVFbGVtZW50ICE9PSB0aGlzLm1lbnUuZGl2KVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLm1lbnUuZGl2LmZvY3VzKClcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KClcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAodGhpcy50eXBlID09PSAnY2hlY2tib3gnKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5jaGVja2VkID0gIXRoaXMuY2hlY2tlZFxyXG4gICAgICAgICAgICB0aGlzLmNsb3NlQWxsKClcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5jbG9zZUFsbCgpXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAodGhpcy5jbGljaylcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMuY2xpY2soZSwgdGhpcylcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0IGNoZWNrZWQoKVxyXG4gICAge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9jaGVja2VkXHJcbiAgICB9XHJcbiAgICBzZXQgY2hlY2tlZCh2YWx1ZSlcclxuICAgIHtcclxuICAgICAgICB0aGlzLl9jaGVja2VkID0gdmFsdWVcclxuICAgICAgICB0aGlzLmNoZWNrLmlubmVySFRNTCA9IHRoaXMuX2NoZWNrZWQgPyAnJiMxMDAwNDsnIDogJydcclxuICAgIH1cclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBNZW51SXRlbSJdfQ==