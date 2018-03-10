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
            GlobalAccelerator.register(accelerator, e => this.click(e));
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9tZW51SXRlbS5qcyJdLCJuYW1lcyI6WyJodG1sIiwicmVxdWlyZSIsIkNvbmZpZyIsIkdsb2JhbEFjY2VsZXJhdG9yIiwiTWVudUl0ZW0iLCJjb25zdHJ1Y3RvciIsIm9wdGlvbnMiLCJpbml0Iiwic3R5bGVzIiwiZGl2IiwidHlwZSIsImNsaWNrIiwiYXBwbHlDb25maWciLCJTZXBhcmF0b3JTdHlsZSIsImNoZWNrZWQiLCJjcmVhdGVDaGVja2VkIiwidGV4dCIsImxhYmVsIiwiY3JlYXRlU2hvcnRjdXQiLCJjcmVhdGVBY2NlbGVyYXRvciIsImFjY2VsZXJhdG9yIiwiY3JlYXRlU3VibWVudSIsInN1Ym1lbnUiLCJNZW51U3R5bGUiLCJSb3dTdHlsZSIsImFkZEV2ZW50TGlzdGVuZXIiLCJlIiwiaGFuZGxlQ2xpY2siLCJtb3VzZWVudGVyIiwibW91c2VsZWF2ZSIsIm1lbnUiLCJzaG93aW5nIiwic3R5bGUiLCJiYWNrZ3JvdW5kQ29sb3IiLCJTZWxlY3RlZEJhY2tncm91bmRTdHlsZSIsImFwcGxpY2F0aW9uTWVudSIsInN1Ym1lbnVUaW1lb3V0Iiwic2V0VGltZW91dCIsInNob3ciLCJTdWJtZW51T3BlbkRlbGF5IiwiY2xlYXJUaW1lb3V0IiwiYmFzZSIsImNoZWNrIiwicGFyZW50IiwiY3VycmVudCIsImluZGV4T2YiLCJpIiwibGV0dGVyIiwic2hvcnRjdXRTcGFuIiwiQWNjZWxlcmF0b3JLZXlTdHlsZSIsImlubmVySFRNTCIsImxlbmd0aCIsInNob3dTaG9ydGN1dCIsInRleHREZWNvcmF0aW9uIiwiaGlkZVNob3J0Y3V0IiwicHJldHRpZnlLZXkiLCJBY2NlbGVyYXRvclN0eWxlIiwicmVnaXN0ZXIiLCJhcnJvdyIsImNsb3NlQWxsIiwidW5yZWdpc3Rlck1lbnVTaG9ydGN1dHMiLCJyZW1vdmUiLCJiYWNrZ3JvdW5kIiwic2hvd0FjY2VsZXJhdG9ycyIsIm1vZHVsZSIsImV4cG9ydHMiXSwibWFwcGluZ3MiOiJBQUFBLE1BQU1B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QUFMO0FBQ0gsU0FMSSxNQU9MO0FBQ0ksaUJBQUtBLFFBQUw7QUFDSDs7QUFFRCxZQUFJLEtBQUtoRCxLQUFULEVBQ0E7QUFDSSxpQkFBS0EsS0FBTCxDQUFXZSxDQUFYLEVBQWMsSUFBZDtBQUNIO0FBQ0o7QUF4Tkw7O0FBMk5Bc0MsT0FBT0MsT0FBUCxHQUFpQjdELFFBQWpCIiwiZmlsZSI6Im1lbnVJdGVtLmpzIiwic291cmNlc0NvbnRlbnQiOlsiY29uc3QgaHRtbCA9IHJlcXVpcmUoJy4vaHRtbCcpXHJcbmNvbnN0IENvbmZpZyA9IHJlcXVpcmUoJy4vY29uZmlnJylcclxuY29uc3QgR2xvYmFsQWNjZWxlcmF0b3IgPSByZXF1aXJlKCcuL2dsb2JhbEFjY2VsZXJhdG9yJylcclxuXHJcbmNsYXNzIE1lbnVJdGVtXHJcbntcclxuICAgIC8qKlxyXG4gICAgICogQHBhcmFtIHtvYmplY3R9IG9wdGlvbnNcclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBbb3B0aW9ucy5sYWJlbF0gbGFiZWwgZm9yIG1lbnUgZW50cnkgbWF5IGluY2x1ZGUgYWNjZWxlcmF0b3IgYnkgcGxhY2luZyAmIGJlZm9yZSBsZXR0ZXIpXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gW29wdGlvbnMudHlwZV0gc2VwYXJhdG9yLCBjaGVja2JveCwgb3IgdW5kZWZpbmVkXHJcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gW29wdGlvbnMuc3R5bGVzXSBhZGRpdGlvbmFsIENTUyBzdHlsZXMgdG8gYXBwbHkgdG8gdGhpcyBNZW51SXRlbVxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IFtvcHRpb25zLmFjY2VsZXJhdG9yXSBzZWUgQWNjZWxlcmF0b3IgZm9yIGlucHV0cyAoZS5nLiwgY3RybCtzaGlmdCtBKVxyXG4gICAgICogQHBhcmFtIHtNZW51SXRlbX0gW29wdGlvbnMuc3VibWVudV0gYXR0YWNoZXMgYSBzdWJtZW51IChhbmQgY2hhbmdlcyB0eXBlIHRvIHN1Ym1lbnUpXHJcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtvcHRpb25zLmNoZWNrZWRdIGNoZWNrIHRoZSBjaGVja2JveFxyXG4gICAgICovXHJcbiAgICBjb25zdHJ1Y3RvcihvcHRpb25zKVxyXG4gICAge1xyXG4gICAgICAgIEdsb2JhbEFjY2VsZXJhdG9yLmluaXQoKVxyXG4gICAgICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9XHJcbiAgICAgICAgdGhpcy5zdHlsZXMgPSBvcHRpb25zLnN0eWxlc1xyXG4gICAgICAgIHRoaXMuZGl2ID0gaHRtbCgpXHJcbiAgICAgICAgdGhpcy50eXBlID0gb3B0aW9ucy50eXBlXHJcbiAgICAgICAgdGhpcy5jbGljayA9IG9wdGlvbnMuY2xpY2tcclxuICAgICAgICBpZiAodGhpcy50eXBlID09PSAnc2VwYXJhdG9yJylcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMuYXBwbHlDb25maWcoQ29uZmlnLlNlcGFyYXRvclN0eWxlKVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLmNoZWNrZWQgPSBvcHRpb25zLmNoZWNrZWRcclxuICAgICAgICAgICAgdGhpcy5jcmVhdGVDaGVja2VkKG9wdGlvbnMuY2hlY2tlZClcclxuICAgICAgICAgICAgdGhpcy50ZXh0ID0gb3B0aW9ucy5sYWJlbCB8fCAnJm5ic3A7Jm5ic3A7Jm5ic3A7J1xyXG4gICAgICAgICAgICB0aGlzLmNyZWF0ZVNob3J0Y3V0KClcclxuICAgICAgICAgICAgdGhpcy5jcmVhdGVBY2NlbGVyYXRvcihvcHRpb25zLmFjY2VsZXJhdG9yKVxyXG4gICAgICAgICAgICB0aGlzLmNyZWF0ZVN1Ym1lbnUob3B0aW9ucy5zdWJtZW51KVxyXG4gICAgICAgICAgICBpZiAob3B0aW9ucy5zdWJtZW51KVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnN1Ym1lbnUgPSBvcHRpb25zLnN1Ym1lbnVcclxuICAgICAgICAgICAgICAgIHRoaXMuc3VibWVudS5hcHBseUNvbmZpZyhDb25maWcuTWVudVN0eWxlKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMuYXBwbHlDb25maWcoQ29uZmlnLlJvd1N0eWxlKVxyXG4gICAgICAgICAgICB0aGlzLmRpdi5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCAoZSkgPT4gdGhpcy5oYW5kbGVDbGljayhlKSlcclxuICAgICAgICAgICAgdGhpcy5kaXYuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2hzdGFydCcsIChlKSA9PiB0aGlzLmhhbmRsZUNsaWNrKGUpKVxyXG4gICAgICAgICAgICB0aGlzLmRpdi5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWVudGVyJywgKCkgPT4gdGhpcy5tb3VzZWVudGVyKCkpXHJcbiAgICAgICAgICAgIHRoaXMuZGl2LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlbGVhdmUnLCAoKSA9PiB0aGlzLm1vdXNlbGVhdmUoKSlcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBUaGUgY2xpY2sgY2FsbGJhY2tcclxuICAgICAqIEBjYWxsYmFjayBNZW51SXRlbX5DbGlja0NhbGxiYWNrXHJcbiAgICAgKiBAcGFyYW0ge0lucHV0RXZlbnR9IGVcclxuICAgICAqL1xyXG5cclxuICAgIG1vdXNlZW50ZXIoKVxyXG4gICAge1xyXG4gICAgICAgIGlmICghdGhpcy5zdWJtZW51IHx8IHRoaXMubWVudS5zaG93aW5nICE9PSB0aGlzIClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMuZGl2LnN0eWxlLmJhY2tncm91bmRDb2xvciA9IENvbmZpZy5TZWxlY3RlZEJhY2tncm91bmRTdHlsZVxyXG4gICAgICAgICAgICBpZiAodGhpcy5zdWJtZW51ICYmICF0aGlzLm1lbnUuYXBwbGljYXRpb25NZW51KVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnN1Ym1lbnVUaW1lb3V0ID0gc2V0VGltZW91dCgoKSA9PlxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc3VibWVudVRpbWVvdXQgPSBudWxsXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zdWJtZW51LnNob3codGhpcylcclxuICAgICAgICAgICAgICAgIH0sIENvbmZpZy5TdWJtZW51T3BlbkRlbGF5KVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIG1vdXNlbGVhdmUoKVxyXG4gICAge1xyXG4gICAgICAgIGlmICghdGhpcy5zdWJtZW51IHx8IHRoaXMubWVudS5zaG93aW5nICE9PSB0aGlzKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMuc3VibWVudVRpbWVvdXQpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGNsZWFyVGltZW91dCh0aGlzLnN1Ym1lbnVUaW1lb3V0KVxyXG4gICAgICAgICAgICAgICAgdGhpcy5zdWJtZW51VGltZW91dCA9IG51bGxcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLmRpdi5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSAndHJhbnNwYXJlbnQnXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGFwcGx5Q29uZmlnKGJhc2UpXHJcbiAgICB7XHJcbiAgICAgICAgY29uc3Qgc3R5bGVzID0ge31cclxuICAgICAgICBmb3IgKGxldCBzdHlsZSBpbiBiYXNlKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgc3R5bGVzW3N0eWxlXSA9IGJhc2Vbc3R5bGVdXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0aGlzLnN0eWxlcylcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGZvciAobGV0IHN0eWxlIGluIHRoaXMuc3R5bGVzKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBzdHlsZXNbc3R5bGVdID0gdGhpcy5zdHlsZXNbc3R5bGVdXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgZm9yIChsZXQgc3R5bGUgaW4gc3R5bGVzKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5kaXYuc3R5bGVbc3R5bGVdID0gc3R5bGVzW3N0eWxlXVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBjcmVhdGVDaGVja2VkKGNoZWNrZWQpXHJcbiAgICB7XHJcbiAgICAgICAgdGhpcy5jaGVjayA9IGh0bWwoeyBwYXJlbnQ6IHRoaXMuZGl2LCBodG1sOiBjaGVja2VkID8gJyYjMTAwMDQ7JyA6ICcnIH0pXHJcbiAgICB9XHJcblxyXG4gICAgY3JlYXRlU2hvcnRjdXQoKVxyXG4gICAge1xyXG4gICAgICAgIGlmICh0aGlzLnR5cGUgIT09ICdzZXBhcmF0b3InKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgY29uc3QgdGV4dCA9IHRoaXMudGV4dFxyXG4gICAgICAgICAgICB0aGlzLmxhYmVsID0gaHRtbCh7IHBhcmVudDogdGhpcy5kaXYgfSlcclxuICAgICAgICAgICAgbGV0IGN1cnJlbnQgPSBodG1sKHsgcGFyZW50OiB0aGlzLmxhYmVsLCB0eXBlOiAnc3BhbicgfSlcclxuICAgICAgICAgICAgaWYgKHRleHQuaW5kZXhPZignJicpICE9PSAtMSlcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgbGV0IGkgPSAwXHJcbiAgICAgICAgICAgICAgICBkb1xyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGxldHRlciA9IHRleHRbaV1cclxuICAgICAgICAgICAgICAgICAgICBpZiAobGV0dGVyID09PSAnJicpXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpKytcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5zaG9ydGN1dFNwYW4gPSBodG1sKHsgcGFyZW50OiB0aGlzLmxhYmVsLCB0eXBlOiAnc3BhbicsIGh0bWw6IHRleHRbaV0sIHN0eWxlczogQ29uZmlnLkFjY2VsZXJhdG9yS2V5U3R5bGUgfSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgY3VycmVudCA9IGh0bWwoeyBwYXJlbnQ6IHRoaXMubGFiZWwsIHR5cGU6ICdzcGFuJyB9KVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjdXJyZW50LmlubmVySFRNTCArPSBsZXR0ZXJcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgaSsrXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB3aGlsZSAoaSA8IHRleHQubGVuZ3RoKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5sYWJlbC5pbm5lckhUTUwgPSB0ZXh0XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgc2hvd1Nob3J0Y3V0KClcclxuICAgIHtcclxuICAgICAgICBpZiAodGhpcy5zaG9ydGN1dFNwYW4pXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLnNob3J0Y3V0U3Bhbi5zdHlsZS50ZXh0RGVjb3JhdGlvbiA9ICd1bmRlcmxpbmUnXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGhpZGVTaG9ydGN1dCgpXHJcbiAgICB7XHJcbiAgICAgICAgaWYgKHRoaXMuc2hvcnRjdXRTcGFuKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5zaG9ydGN1dFNwYW4uc3R5bGUudGV4dERlY29yYXRpb24gPSAnbm9uZSdcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgY3JlYXRlQWNjZWxlcmF0b3IoYWNjZWxlcmF0b3IpXHJcbiAgICB7XHJcbiAgICAgICAgdGhpcy5hY2NlbGVyYXRvciA9IGh0bWwoeyBwYXJlbnQ6IHRoaXMuZGl2LCBodG1sOiBhY2NlbGVyYXRvciA/IEdsb2JhbEFjY2VsZXJhdG9yLnByZXR0aWZ5S2V5KGFjY2VsZXJhdG9yKSA6ICcnLCBzdHlsZXM6IENvbmZpZy5BY2NlbGVyYXRvclN0eWxlIH0pXHJcbiAgICAgICAgaWYgKGFjY2VsZXJhdG9yKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgR2xvYmFsQWNjZWxlcmF0b3IucmVnaXN0ZXIoYWNjZWxlcmF0b3IsIChlKSA9PiB0aGlzLmNsaWNrKGUpKVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBjcmVhdGVTdWJtZW51KHN1Ym1lbnUpXHJcbiAgICB7XHJcbiAgICAgICAgdGhpcy5hcnJvdyA9IGh0bWwoeyBwYXJlbnQ6IHRoaXMuZGl2LCBodG1sOiBzdWJtZW51ID8gJyYjOTY1ODsnIDogJycgfSlcclxuICAgIH1cclxuXHJcbiAgICBjbG9zZUFsbCgpXHJcbiAgICB7XHJcbiAgICAgICAgbGV0IG1lbnUgPSB0aGlzLm1lbnVcclxuICAgICAgICBHbG9iYWxBY2NlbGVyYXRvci51bnJlZ2lzdGVyTWVudVNob3J0Y3V0cygpXHJcbiAgICAgICAgd2hpbGUgKG1lbnUgJiYgIW1lbnUuYXBwbGljYXRpb25NZW51KVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgaWYgKG1lbnUuc2hvd2luZylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgbWVudS5zaG93aW5nLmRpdi5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSAndHJhbnNwYXJlbnQnXHJcbiAgICAgICAgICAgICAgICBtZW51LnNob3dpbmcgPSBudWxsXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgbWVudS5kaXYucmVtb3ZlKClcclxuICAgICAgICAgICAgbWVudSA9IG1lbnUubWVudVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAobWVudS5zaG93aW5nKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgbWVudS5zaG93aW5nLmRpdi5zdHlsZS5iYWNrZ3JvdW5kID0gJ3RyYW5zcGFyZW50J1xyXG4gICAgICAgICAgICBtZW51LnNob3dpbmcgPSBudWxsXHJcbiAgICAgICAgICAgIG1lbnUuc2hvd0FjY2VsZXJhdG9ycygpXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGhhbmRsZUNsaWNrKGUpXHJcbiAgICB7XHJcbiAgICAgICAgaWYgKHRoaXMuc3VibWVudSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLnN1Ym1lbnVUaW1lb3V0KVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBjbGVhclRpbWVvdXQodGhpcy5zdWJtZW51VGltZW91dClcclxuICAgICAgICAgICAgICAgIHRoaXMuc3VibWVudVRpbWVvdXQgPSBudWxsXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5zdWJtZW51LnNob3codGhpcylcclxuICAgICAgICAgICAgdGhpcy5kaXYuc3R5bGUuYmFja2dyb3VuZENvbG9yID0gQ29uZmlnLlNlbGVjdGVkQmFja2dyb3VuZFN0eWxlXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKHRoaXMudHlwZSA9PT0gJ2NoZWNrYm94JylcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMuY2hlY2tlZCA9ICF0aGlzLmNoZWNrZWRcclxuICAgICAgICAgICAgdGhpcy5jaGVjay5pbm5lckhUTUwgPSB0aGlzLmNoZWNrZWQgPyAnJiMxMDAwNDsnIDogJydcclxuICAgICAgICAgICAgdGhpcy5jbG9zZUFsbCgpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2VcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMuY2xvc2VBbGwoKVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHRoaXMuY2xpY2spXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLmNsaWNrKGUsIHRoaXMpXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IE1lbnVJdGVtIl19