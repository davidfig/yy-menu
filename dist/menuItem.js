const clicked = require('clicked');
const html = require('./html');
const Styles = require('./styles');
const Accelerators = require('./accelerators');

class MenuItem {
    /**
     * @param {object} options
     * @param {ClickCallback} [options.click] callback when MenuItem is clicked
     * @param {string} [options.label] label for menu entry (may include accelerator by placing & before letter)
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
            this.applyStyles(Styles.Separator);
        } else {
            this.checked = options.checked;
            this.createChecked(options.checked);
            this.text = options.label || '&nbsp;&nbsp;&nbsp;';
            this.label = html({ parent: this.div });
            this.createAccelerator(options.accelerator);
            this.createSubmenu(options.submenu);
            if (options.submenu) {
                this.submenu = options.submenu;
                this.submenu.applyStyles(Styles.MenuStyle);
            }
            this.applyStyles(Styles.RowStyle);
            clicked(this.div, e => this.handleClick(e));
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
            this.div.style.backgroundColor = Styles.SelectedBackground;
            if (this.submenu && !this.menu.applicationMenu) {
                this.submenuTimeout = setTimeout(() => {
                    this.submenuTimeout = null;
                    this.submenu.show(this);
                }, Styles.SubmenuOpenDelay);
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

    applyStyles(base) {
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

    showShortcut() {
        if (this.type !== 'separator') {
            this.label.innerHTML = '';
            const text = this.text;
            let current = html({ parent: this.label, type: 'span' });
            if (text.indexOf('&') !== -1) {
                let i = 0;
                do {
                    const letter = text[i];
                    if (letter === '&') {
                        i++;
                        html({ parent: this.label, type: 'span', html: text[i], styles: Styles.AcceleratorKey });
                        current = html({ parent: this.label, type: 'span' });
                    } else {
                        current.innerHTML += letter;
                    }
                    i++;
                } while (i < text.length);
            } else {
                this.label.innerHTML = text;
            }
            this.shortcutAvailable = true;
        }
    }

    hideShortcut() {
        if (this.type !== 'separator') {
            const text = this.text.replace('&', '');
            this.label.innerHTML = text;
            this.shortcutAvailable = true;
        }
    }

    createAccelerator(accelerator) {
        this.accelerator = html({ parent: this.div, html: accelerator ? Accelerators.prettifyKey(accelerator) : '', styles: Styles.Accelerator });
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
            if (this.submenuTimeout) {
                clearTimeout(this.submenuTimeout);
                this.submenuTimeout = null;
            }
            this.submenu.show(this);
            this.div.style.backgroundColor = Styles.SelectedBackground;
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9tZW51SXRlbS5qcyJdLCJuYW1lcyI6WyJjbGlja2VkIiwicmVxdWlyZSIsImh0bWwiLCJTdHlsZXMiLCJBY2NlbGVyYXRvcnMiLCJNZW51SXRlbSIsImNvbnN0cnVjdG9yIiwib3B0aW9ucyIsInN0eWxlcyIsImRpdiIsInR5cGUiLCJjbGljayIsImFwcGx5U3R5bGVzIiwiU2VwYXJhdG9yIiwiY2hlY2tlZCIsImNyZWF0ZUNoZWNrZWQiLCJ0ZXh0IiwibGFiZWwiLCJwYXJlbnQiLCJjcmVhdGVBY2NlbGVyYXRvciIsImFjY2VsZXJhdG9yIiwiY3JlYXRlU3VibWVudSIsInN1Ym1lbnUiLCJNZW51U3R5bGUiLCJSb3dTdHlsZSIsImUiLCJoYW5kbGVDbGljayIsImFkZEV2ZW50TGlzdGVuZXIiLCJtb3VzZWVudGVyIiwibW91c2VsZWF2ZSIsIm1lbnUiLCJzaG93aW5nIiwic3R5bGUiLCJiYWNrZ3JvdW5kQ29sb3IiLCJTZWxlY3RlZEJhY2tncm91bmQiLCJhcHBsaWNhdGlvbk1lbnUiLCJzdWJtZW51VGltZW91dCIsInNldFRpbWVvdXQiLCJzaG93IiwiU3VibWVudU9wZW5EZWxheSIsImNsZWFyVGltZW91dCIsImJhc2UiLCJjaGVjayIsInNob3dTaG9ydGN1dCIsImlubmVySFRNTCIsImN1cnJlbnQiLCJpbmRleE9mIiwiaSIsImxldHRlciIsIkFjY2VsZXJhdG9yS2V5IiwibGVuZ3RoIiwic2hvcnRjdXRBdmFpbGFibGUiLCJoaWRlU2hvcnRjdXQiLCJyZXBsYWNlIiwicHJldHRpZnlLZXkiLCJBY2NlbGVyYXRvciIsImFycm93IiwiY2xvc2VBbGwiLCJyZW1vdmUiLCJiYWNrZ3JvdW5kIiwic2hvd0FjY2VsZXJhdG9ycyIsIm1vZHVsZSIsImV4cG9ydHMiXSwibWFwcGluZ3MiOiJBQUFBLE1BQU1BLFVBQVVDLFFBQVEsU0FBUixDQUFoQjtBQUNBLE1BQU1DLE9BQU9ELFFBQVEsUUFBUixDQUFiO0FBQ0EsTUFBTUUsU0FBU0YsUUFBUSxV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aUQsTUFBVDtBQUNBNUIsbUJBQU9BLEtBQUtBLElBQVo7QUFDSDtBQUNELFlBQUlBLElBQUosRUFDQTtBQUNJQSxpQkFBS0MsT0FBTCxDQUFhdEIsR0FBYixDQUFpQnVCLEtBQWpCLENBQXVCMkIsVUFBdkIsR0FBb0MsYUFBcEM7QUFDQTdCLGlCQUFLQyxPQUFMLEdBQWUsSUFBZjtBQUNBRCxpQkFBSzhCLGdCQUFMO0FBQ0g7QUFDSjs7QUFFRGxDLGdCQUFZRCxDQUFaLEVBQ0E7QUFDSSxZQUFJLEtBQUtILE9BQVQsRUFDQTtBQUNJLGdCQUFJLEtBQUtjLGNBQVQsRUFDQTtBQUNJSSw2QkFBYSxLQUFLSixjQUFsQjtBQUNBLHFCQUFLQSxjQUFMLEdBQXNCLElBQXRCO0FBQ0g7QUFDRCxpQkFBS2QsT0FBTCxDQUFhZ0IsSUFBYixDQUFrQixJQUFsQjtBQUNBLGlCQUFLN0IsR0FBTCxDQUFTdUIsS0FBVCxDQUFlQyxlQUFmLEdBQWlDOUIsT0FBTytCLGtCQUF4QztBQUNILFNBVEQsTUFVSyxJQUFJLEtBQUt4QixJQUFMLEtBQWMsVUFBbEIsRUFDTDtBQUNJLGlCQUFLSSxPQUFMLEdBQWUsQ0FBQyxLQUFLQSxPQUFyQjtBQUNBLGlCQUFLNEIsS0FBTCxDQUFXRSxTQUFYLEdBQXVCLEtBQUs5QixPQUFMLEdBQWUsVUFBZixHQUE0QixFQUFuRDtBQUNILFNBSkksTUFNTDtBQUNJLGlCQUFLMkMsUUFBTDtBQUNIO0FBQ0QsWUFBSSxLQUFLOUMsS0FBVCxFQUNBO0FBQ0ksaUJBQUtBLEtBQUwsQ0FBV2MsQ0FBWCxFQUFjLElBQWQ7QUFDSDtBQUNKO0FBM01MOztBQThNQW9DLE9BQU9DLE9BQVAsR0FBaUJ6RCxRQUFqQiIsImZpbGUiOiJtZW51SXRlbS5qcyIsInNvdXJjZXNDb250ZW50IjpbImNvbnN0IGNsaWNrZWQgPSByZXF1aXJlKCdjbGlja2VkJylcclxuY29uc3QgaHRtbCA9IHJlcXVpcmUoJy4vaHRtbCcpXHJcbmNvbnN0IFN0eWxlcyA9IHJlcXVpcmUoJy4vc3R5bGVzJylcclxuY29uc3QgQWNjZWxlcmF0b3JzID0gcmVxdWlyZSgnLi9hY2NlbGVyYXRvcnMnKVxyXG5cclxuY2xhc3MgTWVudUl0ZW1cclxue1xyXG4gICAgLyoqXHJcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gb3B0aW9uc1xyXG4gICAgICogQHBhcmFtIHtDbGlja0NhbGxiYWNrfSBbb3B0aW9ucy5jbGlja10gY2FsbGJhY2sgd2hlbiBNZW51SXRlbSBpcyBjbGlja2VkXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gW29wdGlvbnMubGFiZWxdIGxhYmVsIGZvciBtZW51IGVudHJ5IChtYXkgaW5jbHVkZSBhY2NlbGVyYXRvciBieSBwbGFjaW5nICYgYmVmb3JlIGxldHRlcilcclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBbb3B0aW9ucy50eXBlXSBzZXBhcmF0b3IsIGNoZWNrYm94LCBvciB1bmRlZmluZWRcclxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBbb3B0aW9ucy5zdHlsZXNdIGFkZGl0aW9uYWwgQ1NTIHN0eWxlcyB0byBhcHBseSB0byB0aGlzIE1lbnVJdGVtXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gW29wdGlvbnMuYWNjZWxlcmF0b3JdIHNlZSBBY2NlbGVyYXRvciBmb3IgaW5wdXRzIChlLmcuLCBjdHJsK3NoaWZ0K0EpXHJcbiAgICAgKiBAcGFyYW0ge01lbnVJdGVtfSBbb3B0aW9ucy5zdWJtZW51XSBhdHRhY2hlcyBhIHN1Ym1lbnUgKGFuZCBjaGFuZ2VzIHR5cGUgdG8gc3VibWVudSlcclxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW29wdGlvbnMuY2hlY2tlZF0gY2hlY2sgdGhlIGNoZWNrYm94XHJcbiAgICAgKi9cclxuICAgIGNvbnN0cnVjdG9yKG9wdGlvbnMpXHJcbiAgICB7XHJcbiAgICAgICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge31cclxuICAgICAgICB0aGlzLnN0eWxlcyA9IG9wdGlvbnMuc3R5bGVzXHJcbiAgICAgICAgdGhpcy5kaXYgPSBodG1sKClcclxuICAgICAgICB0aGlzLnR5cGUgPSBvcHRpb25zLnR5cGVcclxuICAgICAgICB0aGlzLmNsaWNrID0gb3B0aW9ucy5jbGlja1xyXG4gICAgICAgIGlmICh0aGlzLnR5cGUgPT09ICdzZXBhcmF0b3InKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5hcHBseVN0eWxlcyhTdHlsZXMuU2VwYXJhdG9yKVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLmNoZWNrZWQgPSBvcHRpb25zLmNoZWNrZWRcclxuICAgICAgICAgICAgdGhpcy5jcmVhdGVDaGVja2VkKG9wdGlvbnMuY2hlY2tlZClcclxuICAgICAgICAgICAgdGhpcy50ZXh0ID0gb3B0aW9ucy5sYWJlbCB8fCAnJm5ic3A7Jm5ic3A7Jm5ic3A7J1xyXG4gICAgICAgICAgICB0aGlzLmxhYmVsID0gaHRtbCh7IHBhcmVudDogdGhpcy5kaXYgfSlcclxuICAgICAgICAgICAgdGhpcy5jcmVhdGVBY2NlbGVyYXRvcihvcHRpb25zLmFjY2VsZXJhdG9yKVxyXG4gICAgICAgICAgICB0aGlzLmNyZWF0ZVN1Ym1lbnUob3B0aW9ucy5zdWJtZW51KVxyXG4gICAgICAgICAgICBpZiAob3B0aW9ucy5zdWJtZW51KVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnN1Ym1lbnUgPSBvcHRpb25zLnN1Ym1lbnVcclxuICAgICAgICAgICAgICAgIHRoaXMuc3VibWVudS5hcHBseVN0eWxlcyhTdHlsZXMuTWVudVN0eWxlKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMuYXBwbHlTdHlsZXMoU3R5bGVzLlJvd1N0eWxlKVxyXG4gICAgICAgICAgICBjbGlja2VkKHRoaXMuZGl2LCAoZSkgPT4gdGhpcy5oYW5kbGVDbGljayhlKSlcclxuICAgICAgICAgICAgdGhpcy5kaXYuYWRkRXZlbnRMaXN0ZW5lcignbW91c2VlbnRlcicsICgpID0+IHRoaXMubW91c2VlbnRlcigpKVxyXG4gICAgICAgICAgICB0aGlzLmRpdi5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWxlYXZlJywgKCkgPT4gdGhpcy5tb3VzZWxlYXZlKCkpXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogVGhlIGNsaWNrIGNhbGxiYWNrXHJcbiAgICAgKiBAY2FsbGJhY2sgTWVudUl0ZW1+Q2xpY2tDYWxsYmFja1xyXG4gICAgICogQHBhcmFtIHtJbnB1dEV2ZW50fSBlXHJcbiAgICAgKi9cclxuXHJcbiAgICBtb3VzZWVudGVyKClcclxuICAgIHtcclxuICAgICAgICBpZiAoIXRoaXMuc3VibWVudSB8fCB0aGlzLm1lbnUuc2hvd2luZyAhPT0gdGhpcyApXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLmRpdi5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSBTdHlsZXMuU2VsZWN0ZWRCYWNrZ3JvdW5kXHJcbiAgICAgICAgICAgIGlmICh0aGlzLnN1Ym1lbnUgJiYgIXRoaXMubWVudS5hcHBsaWNhdGlvbk1lbnUpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuc3VibWVudVRpbWVvdXQgPSBzZXRUaW1lb3V0KCgpID0+XHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zdWJtZW51VGltZW91dCA9IG51bGxcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnN1Ym1lbnUuc2hvdyh0aGlzKVxyXG4gICAgICAgICAgICAgICAgfSwgU3R5bGVzLlN1Ym1lbnVPcGVuRGVsYXkpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgbW91c2VsZWF2ZSgpXHJcbiAgICB7XHJcbiAgICAgICAgaWYgKCF0aGlzLnN1Ym1lbnUgfHwgdGhpcy5tZW51LnNob3dpbmcgIT09IHRoaXMpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5zdWJtZW51VGltZW91dClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgY2xlYXJUaW1lb3V0KHRoaXMuc3VibWVudVRpbWVvdXQpXHJcbiAgICAgICAgICAgICAgICB0aGlzLnN1Ym1lbnVUaW1lb3V0ID0gbnVsbFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMuZGl2LnN0eWxlLmJhY2tncm91bmRDb2xvciA9ICd0cmFuc3BhcmVudCdcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgYXBwbHlTdHlsZXMoYmFzZSlcclxuICAgIHtcclxuICAgICAgICBjb25zdCBzdHlsZXMgPSB7fVxyXG4gICAgICAgIGZvciAobGV0IHN0eWxlIGluIGJhc2UpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBzdHlsZXNbc3R5bGVdID0gYmFzZVtzdHlsZV1cclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHRoaXMuc3R5bGVzKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgZm9yIChsZXQgc3R5bGUgaW4gdGhpcy5zdHlsZXMpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHN0eWxlc1tzdHlsZV0gPSB0aGlzLnN0eWxlc1tzdHlsZV1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBmb3IgKGxldCBzdHlsZSBpbiBzdHlsZXMpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLmRpdi5zdHlsZVtzdHlsZV0gPSBzdHlsZXNbc3R5bGVdXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGNyZWF0ZUNoZWNrZWQoY2hlY2tlZClcclxuICAgIHtcclxuICAgICAgICB0aGlzLmNoZWNrID0gaHRtbCh7IHBhcmVudDogdGhpcy5kaXYsIGh0bWw6IGNoZWNrZWQgPyAnJiMxMDAwNDsnIDogJycgfSlcclxuICAgIH1cclxuXHJcbiAgICBzaG93U2hvcnRjdXQoKVxyXG4gICAge1xyXG4gICAgICAgIGlmICh0aGlzLnR5cGUgIT09ICdzZXBhcmF0b3InKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5sYWJlbC5pbm5lckhUTUwgPSAnJ1xyXG4gICAgICAgICAgICBjb25zdCB0ZXh0ID0gdGhpcy50ZXh0XHJcbiAgICAgICAgICAgIGxldCBjdXJyZW50ID0gaHRtbCh7IHBhcmVudDogdGhpcy5sYWJlbCwgdHlwZTogJ3NwYW4nIH0pXHJcbiAgICAgICAgICAgIGlmICh0ZXh0LmluZGV4T2YoJyYnKSAhPT0gLTEpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGxldCBpID0gMFxyXG4gICAgICAgICAgICAgICAgZG9cclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBsZXR0ZXIgPSB0ZXh0W2ldXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGxldHRlciA9PT0gJyYnKVxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaSsrXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGh0bWwoeyBwYXJlbnQ6IHRoaXMubGFiZWwsIHR5cGU6ICdzcGFuJywgaHRtbDogdGV4dFtpXSwgc3R5bGVzOiBTdHlsZXMuQWNjZWxlcmF0b3JLZXkgfSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgY3VycmVudCA9IGh0bWwoeyBwYXJlbnQ6IHRoaXMubGFiZWwsIHR5cGU6ICdzcGFuJyB9KVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjdXJyZW50LmlubmVySFRNTCArPSBsZXR0ZXJcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgaSsrXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB3aGlsZSAoaSA8IHRleHQubGVuZ3RoKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5sYWJlbC5pbm5lckhUTUwgPSB0ZXh0XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5zaG9ydGN1dEF2YWlsYWJsZSA9IHRydWVcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgaGlkZVNob3J0Y3V0KClcclxuICAgIHtcclxuICAgICAgICBpZiAodGhpcy50eXBlICE9PSAnc2VwYXJhdG9yJylcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGNvbnN0IHRleHQgPSB0aGlzLnRleHQucmVwbGFjZSgnJicsICcnKVxyXG4gICAgICAgICAgICB0aGlzLmxhYmVsLmlubmVySFRNTCA9IHRleHRcclxuICAgICAgICAgICAgdGhpcy5zaG9ydGN1dEF2YWlsYWJsZSA9IHRydWVcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgY3JlYXRlQWNjZWxlcmF0b3IoYWNjZWxlcmF0b3IpXHJcbiAgICB7XHJcbiAgICAgICAgdGhpcy5hY2NlbGVyYXRvciA9IGh0bWwoeyBwYXJlbnQ6IHRoaXMuZGl2LCBodG1sOiBhY2NlbGVyYXRvciA/IEFjY2VsZXJhdG9ycy5wcmV0dGlmeUtleShhY2NlbGVyYXRvcikgOiAgJycsIHN0eWxlczogU3R5bGVzLkFjY2VsZXJhdG9yfSlcclxuICAgIH1cclxuXHJcbiAgICBjcmVhdGVTdWJtZW51KHN1Ym1lbnUpXHJcbiAgICB7XHJcbiAgICAgICAgdGhpcy5hcnJvdyA9IGh0bWwoeyBwYXJlbnQ6IHRoaXMuZGl2LCBodG1sOiBzdWJtZW51ID8gJyYjOTY1ODsnIDogJycgfSlcclxuICAgIH1cclxuXHJcbiAgICBjbG9zZUFsbCgpXHJcbiAgICB7XHJcbiAgICAgICAgbGV0IG1lbnUgPSB0aGlzLm1lbnVcclxuICAgICAgICB3aGlsZSAobWVudSAmJiAhbWVudS5hcHBsaWNhdGlvbk1lbnUpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBpZiAobWVudS5zaG93aW5nKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBtZW51LnNob3dpbmcuZGl2LnN0eWxlLmJhY2tncm91bmRDb2xvciA9ICd0cmFuc3BhcmVudCdcclxuICAgICAgICAgICAgICAgIG1lbnUuc2hvd2luZyA9IG51bGxcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBtZW51LmRpdi5yZW1vdmUoKVxyXG4gICAgICAgICAgICBtZW51ID0gbWVudS5tZW51XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChtZW51KVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgbWVudS5zaG93aW5nLmRpdi5zdHlsZS5iYWNrZ3JvdW5kID0gJ3RyYW5zcGFyZW50J1xyXG4gICAgICAgICAgICBtZW51LnNob3dpbmcgPSBudWxsXHJcbiAgICAgICAgICAgIG1lbnUuc2hvd0FjY2VsZXJhdG9ycygpXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGhhbmRsZUNsaWNrKGUpXHJcbiAgICB7XHJcbiAgICAgICAgaWYgKHRoaXMuc3VibWVudSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLnN1Ym1lbnVUaW1lb3V0KVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBjbGVhclRpbWVvdXQodGhpcy5zdWJtZW51VGltZW91dClcclxuICAgICAgICAgICAgICAgIHRoaXMuc3VibWVudVRpbWVvdXQgPSBudWxsXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5zdWJtZW51LnNob3codGhpcylcclxuICAgICAgICAgICAgdGhpcy5kaXYuc3R5bGUuYmFja2dyb3VuZENvbG9yID0gU3R5bGVzLlNlbGVjdGVkQmFja2dyb3VuZFxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmICh0aGlzLnR5cGUgPT09ICdjaGVja2JveCcpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLmNoZWNrZWQgPSAhdGhpcy5jaGVja2VkXHJcbiAgICAgICAgICAgIHRoaXMuY2hlY2suaW5uZXJIVE1MID0gdGhpcy5jaGVja2VkID8gJyYjMTAwMDQ7JyA6ICcnXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2VcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMuY2xvc2VBbGwoKVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodGhpcy5jbGljaylcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMuY2xpY2soZSwgdGhpcylcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gTWVudUl0ZW0iXX0=