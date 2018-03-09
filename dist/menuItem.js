const html = require('./html');
const Styles = require('./styles');
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9tZW51SXRlbS5qcyJdLCJuYW1lcyI6WyJodG1sIiwicmVxdWlyZSIsIlN0eWxlcyIsIkFjY2VsZXJhdG9ycyIsIk1lbnVJdGVtIiwiY29uc3RydWN0b3IiLCJvcHRpb25zIiwic3R5bGVzIiwiZGl2IiwidHlwZSIsImNsaWNrIiwiYXBwbHlTdHlsZXMiLCJTZXBhcmF0b3IiLCJjaGVja2VkIiwiY3JlYXRlQ2hlY2tlZCIsInRleHQiLCJsYWJlbCIsInBhcmVudCIsImNyZWF0ZUFjY2VsZXJhdG9yIiwiYWNjZWxlcmF0b3IiLCJjcmVhdGVTdWJtZW51Iiwic3VibWVudSIsIk1lbnVTdHlsZSIsIlJvd1N0eWxlIiwiYWRkRXZlbnRMaXN0ZW5lciIsImUiLCJoYW5kbGVDbGljayIsIm1vdXNlZW50ZXIiLCJtb3VzZWxlYXZlIiwibWVudSIsInNob3dpbmciLCJzdHlsZSIsImJhY2tncm91bmRDb2xvciIsIlNlbGVjdGVkQmFja2dyb3VuZCIsImFwcGxpY2F0aW9uTWVudSIsInN1Ym1lbnVUaW1lb3V0Iiwic2V0VGltZW91dCIsInNob3ciLCJTdWJtZW51T3BlbkRlbGF5IiwiY2xlYXJUaW1lb3V0IiwiYmFzZSIsImNoZWNrIiwic2hvd1Nob3J0Y3V0IiwiaW5uZXJIVE1MIiwiY3VycmVudCIsImluZGV4T2YiLCJpIiwibGV0dGVyIiwiQWNjZWxlcmF0b3JLZXkiLCJsZW5ndGgiLCJzaG9ydGN1dEF2YWlsYWJsZSIsImhpZGVTaG9ydGN1dCIsInJlcGxhY2UiLCJwcmV0dGlmeUtleSIsIkFjY2VsZXJhdG9yIiwiYXJyb3ciLCJjbG9zZUFsbCIsInJlbW92ZSIsImJhY2tncm91bmQiLCJzaG93QWNjZWxlcmF0b3JzIiwibW9kdWxlIiwiZXhwb3J0cyJdLCJtYXBwaW5ncyI6IkFBQUEsTUFBTUEsT0FBT0MsUUFBUSxRQUFSLENBQWI7QUFDQSxNQUFNQyxTQUFTRCxRQUFRLFVBQVIsQ0FBZjtBQUNBLE1BQU1FLGVBQWVGLFFBQVEsZ0JBQVIsQ0FBckI7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QyxhQUF6QztBQUNBSCxxQkFBS0MsT0FBTCxHQUFlLElBQWY7QUFDSDtBQUNERCxpQkFBS3JCLEdBQUwsQ0FBU2lELE1BQVQ7QUFDQTVCLG1CQUFPQSxLQUFLQSxJQUFaO0FBQ0g7QUFDRCxZQUFJQSxJQUFKLEVBQ0E7QUFDSUEsaUJBQUtDLE9BQUwsQ0FBYXRCLEdBQWIsQ0FBaUJ1QixLQUFqQixDQUF1QjJCLFVBQXZCLEdBQW9DLGFBQXBDO0FBQ0E3QixpQkFBS0MsT0FBTCxHQUFlLElBQWY7QUFDQUQsaUJBQUs4QixnQkFBTDtBQUNIO0FBQ0o7O0FBRURqQyxnQkFBWUQsQ0FBWixFQUNBO0FBQ0ksWUFBSSxLQUFLSixPQUFULEVBQ0E7QUFDSSxnQkFBSSxLQUFLYyxjQUFULEVBQ0E7QUFDSUksNkJBQWEsS0FBS0osY0FBbEI7QUFDQSxxQkFBS0EsY0FBTCxHQUFzQixJQUF0QjtBQUNIO0FBQ0QsaUJBQUtkLE9BQUwsQ0FBYWdCLElBQWIsQ0FBa0IsSUFBbEI7QUFDQSxpQkFBSzdCLEdBQUwsQ0FBU3VCLEtBQVQsQ0FBZUMsZUFBZixHQUFpQzlCLE9BQU8rQixrQkFBeEM7QUFDSCxTQVRELE1BVUssSUFBSSxLQUFLeEIsSUFBTCxLQUFjLFVBQWxCLEVBQ0w7QUFDSSxpQkFBS0ksT0FBTCxHQUFlLENBQUMsS0FBS0EsT0FBckI7QUFDQSxpQkFBSzRCLEtBQUwsQ0FBV0UsU0FBWCxHQUF1QixLQUFLOUIsT0FBTCxHQUFlLFVBQWYsR0FBNEIsRUFBbkQ7QUFDSCxTQUpJLE1BTUw7QUFDSSxpQkFBSzJDLFFBQUw7QUFDSDtBQUNELFlBQUksS0FBSzlDLEtBQVQsRUFDQTtBQUNJLGlCQUFLQSxLQUFMLENBQVdlLENBQVgsRUFBYyxJQUFkO0FBQ0g7QUFDSjtBQTNNTDs7QUE4TUFtQyxPQUFPQyxPQUFQLEdBQWlCekQsUUFBakIiLCJmaWxlIjoibWVudUl0ZW0uanMiLCJzb3VyY2VzQ29udGVudCI6WyJjb25zdCBodG1sID0gcmVxdWlyZSgnLi9odG1sJylcclxuY29uc3QgU3R5bGVzID0gcmVxdWlyZSgnLi9zdHlsZXMnKVxyXG5jb25zdCBBY2NlbGVyYXRvcnMgPSByZXF1aXJlKCcuL2FjY2VsZXJhdG9ycycpXHJcblxyXG5jbGFzcyBNZW51SXRlbVxyXG57XHJcbiAgICAvKipcclxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gW29wdGlvbnMubGFiZWxdIGxhYmVsIGZvciBtZW51IGVudHJ5IG1heSBpbmNsdWRlIGFjY2VsZXJhdG9yIGJ5IHBsYWNpbmcgJiBiZWZvcmUgbGV0dGVyKVxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IFtvcHRpb25zLnR5cGVdIHNlcGFyYXRvciwgY2hlY2tib3gsIG9yIHVuZGVmaW5lZFxyXG4gICAgICogQHBhcmFtIHtvYmplY3R9IFtvcHRpb25zLnN0eWxlc10gYWRkaXRpb25hbCBDU1Mgc3R5bGVzIHRvIGFwcGx5IHRvIHRoaXMgTWVudUl0ZW1cclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBbb3B0aW9ucy5hY2NlbGVyYXRvcl0gc2VlIEFjY2VsZXJhdG9yIGZvciBpbnB1dHMgKGUuZy4sIGN0cmwrc2hpZnQrQSlcclxuICAgICAqIEBwYXJhbSB7TWVudUl0ZW19IFtvcHRpb25zLnN1Ym1lbnVdIGF0dGFjaGVzIGEgc3VibWVudSAoYW5kIGNoYW5nZXMgdHlwZSB0byBzdWJtZW51KVxyXG4gICAgICogQHBhcmFtIHtib29sZWFufSBbb3B0aW9ucy5jaGVja2VkXSBjaGVjayB0aGUgY2hlY2tib3hcclxuICAgICAqL1xyXG4gICAgY29uc3RydWN0b3Iob3B0aW9ucylcclxuICAgIHtcclxuICAgICAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fVxyXG4gICAgICAgIHRoaXMuc3R5bGVzID0gb3B0aW9ucy5zdHlsZXNcclxuICAgICAgICB0aGlzLmRpdiA9IGh0bWwoKVxyXG4gICAgICAgIHRoaXMudHlwZSA9IG9wdGlvbnMudHlwZVxyXG4gICAgICAgIHRoaXMuY2xpY2sgPSBvcHRpb25zLmNsaWNrXHJcbiAgICAgICAgaWYgKHRoaXMudHlwZSA9PT0gJ3NlcGFyYXRvcicpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLmFwcGx5U3R5bGVzKFN0eWxlcy5TZXBhcmF0b3IpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2VcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMuY2hlY2tlZCA9IG9wdGlvbnMuY2hlY2tlZFxyXG4gICAgICAgICAgICB0aGlzLmNyZWF0ZUNoZWNrZWQob3B0aW9ucy5jaGVja2VkKVxyXG4gICAgICAgICAgICB0aGlzLnRleHQgPSBvcHRpb25zLmxhYmVsIHx8ICcmbmJzcDsmbmJzcDsmbmJzcDsnXHJcbiAgICAgICAgICAgIHRoaXMubGFiZWwgPSBodG1sKHsgcGFyZW50OiB0aGlzLmRpdiB9KVxyXG4gICAgICAgICAgICB0aGlzLmNyZWF0ZUFjY2VsZXJhdG9yKG9wdGlvbnMuYWNjZWxlcmF0b3IpXHJcbiAgICAgICAgICAgIHRoaXMuY3JlYXRlU3VibWVudShvcHRpb25zLnN1Ym1lbnUpXHJcbiAgICAgICAgICAgIGlmIChvcHRpb25zLnN1Ym1lbnUpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuc3VibWVudSA9IG9wdGlvbnMuc3VibWVudVxyXG4gICAgICAgICAgICAgICAgdGhpcy5zdWJtZW51LmFwcGx5U3R5bGVzKFN0eWxlcy5NZW51U3R5bGUpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5hcHBseVN0eWxlcyhTdHlsZXMuUm93U3R5bGUpXHJcbiAgICAgICAgICAgIHRoaXMuZGl2LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIChlKSA9PiB0aGlzLmhhbmRsZUNsaWNrKGUpKVxyXG4gICAgICAgICAgICB0aGlzLmRpdi5hZGRFdmVudExpc3RlbmVyKCd0b3VjaHN0YXJ0JywgKGUpID0+IHRoaXMuaGFuZGxlQ2xpY2soZSkpXHJcbiAgICAgICAgICAgIHRoaXMuZGl2LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZW50ZXInLCAoKSA9PiB0aGlzLm1vdXNlZW50ZXIoKSlcclxuICAgICAgICAgICAgdGhpcy5kaXYuYWRkRXZlbnRMaXN0ZW5lcignbW91c2VsZWF2ZScsICgpID0+IHRoaXMubW91c2VsZWF2ZSgpKVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFRoZSBjbGljayBjYWxsYmFja1xyXG4gICAgICogQGNhbGxiYWNrIE1lbnVJdGVtfkNsaWNrQ2FsbGJhY2tcclxuICAgICAqIEBwYXJhbSB7SW5wdXRFdmVudH0gZVxyXG4gICAgICovXHJcblxyXG4gICAgbW91c2VlbnRlcigpXHJcbiAgICB7XHJcbiAgICAgICAgaWYgKCF0aGlzLnN1Ym1lbnUgfHwgdGhpcy5tZW51LnNob3dpbmcgIT09IHRoaXMgKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5kaXYuc3R5bGUuYmFja2dyb3VuZENvbG9yID0gU3R5bGVzLlNlbGVjdGVkQmFja2dyb3VuZFxyXG4gICAgICAgICAgICBpZiAodGhpcy5zdWJtZW51ICYmICF0aGlzLm1lbnUuYXBwbGljYXRpb25NZW51KVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnN1Ym1lbnVUaW1lb3V0ID0gc2V0VGltZW91dCgoKSA9PlxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc3VibWVudVRpbWVvdXQgPSBudWxsXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zdWJtZW51LnNob3codGhpcylcclxuICAgICAgICAgICAgICAgIH0sIFN0eWxlcy5TdWJtZW51T3BlbkRlbGF5KVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIG1vdXNlbGVhdmUoKVxyXG4gICAge1xyXG4gICAgICAgIGlmICghdGhpcy5zdWJtZW51IHx8IHRoaXMubWVudS5zaG93aW5nICE9PSB0aGlzKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMuc3VibWVudVRpbWVvdXQpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGNsZWFyVGltZW91dCh0aGlzLnN1Ym1lbnVUaW1lb3V0KVxyXG4gICAgICAgICAgICAgICAgdGhpcy5zdWJtZW51VGltZW91dCA9IG51bGxcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLmRpdi5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSAndHJhbnNwYXJlbnQnXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGFwcGx5U3R5bGVzKGJhc2UpXHJcbiAgICB7XHJcbiAgICAgICAgY29uc3Qgc3R5bGVzID0ge31cclxuICAgICAgICBmb3IgKGxldCBzdHlsZSBpbiBiYXNlKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgc3R5bGVzW3N0eWxlXSA9IGJhc2Vbc3R5bGVdXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0aGlzLnN0eWxlcylcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGZvciAobGV0IHN0eWxlIGluIHRoaXMuc3R5bGVzKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBzdHlsZXNbc3R5bGVdID0gdGhpcy5zdHlsZXNbc3R5bGVdXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgZm9yIChsZXQgc3R5bGUgaW4gc3R5bGVzKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5kaXYuc3R5bGVbc3R5bGVdID0gc3R5bGVzW3N0eWxlXVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBjcmVhdGVDaGVja2VkKGNoZWNrZWQpXHJcbiAgICB7XHJcbiAgICAgICAgdGhpcy5jaGVjayA9IGh0bWwoeyBwYXJlbnQ6IHRoaXMuZGl2LCBodG1sOiBjaGVja2VkID8gJyYjMTAwMDQ7JyA6ICcnIH0pXHJcbiAgICB9XHJcblxyXG4gICAgc2hvd1Nob3J0Y3V0KClcclxuICAgIHtcclxuICAgICAgICBpZiAodGhpcy50eXBlICE9PSAnc2VwYXJhdG9yJylcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMubGFiZWwuaW5uZXJIVE1MID0gJydcclxuICAgICAgICAgICAgY29uc3QgdGV4dCA9IHRoaXMudGV4dFxyXG4gICAgICAgICAgICBsZXQgY3VycmVudCA9IGh0bWwoeyBwYXJlbnQ6IHRoaXMubGFiZWwsIHR5cGU6ICdzcGFuJyB9KVxyXG4gICAgICAgICAgICBpZiAodGV4dC5pbmRleE9mKCcmJykgIT09IC0xKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBsZXQgaSA9IDBcclxuICAgICAgICAgICAgICAgIGRvXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgbGV0dGVyID0gdGV4dFtpXVxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChsZXR0ZXIgPT09ICcmJylcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGkrK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBodG1sKHsgcGFyZW50OiB0aGlzLmxhYmVsLCB0eXBlOiAnc3BhbicsIGh0bWw6IHRleHRbaV0sIHN0eWxlczogU3R5bGVzLkFjY2VsZXJhdG9yS2V5IH0pXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGN1cnJlbnQgPSBodG1sKHsgcGFyZW50OiB0aGlzLmxhYmVsLCB0eXBlOiAnc3BhbicgfSlcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY3VycmVudC5pbm5lckhUTUwgKz0gbGV0dGVyXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGkrK1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgd2hpbGUgKGkgPCB0ZXh0Lmxlbmd0aClcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHRoaXMubGFiZWwuaW5uZXJIVE1MID0gdGV4dFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMuc2hvcnRjdXRBdmFpbGFibGUgPSB0cnVlXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGhpZGVTaG9ydGN1dCgpXHJcbiAgICB7XHJcbiAgICAgICAgaWYgKHRoaXMudHlwZSAhPT0gJ3NlcGFyYXRvcicpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBjb25zdCB0ZXh0ID0gdGhpcy50ZXh0LnJlcGxhY2UoJyYnLCAnJylcclxuICAgICAgICAgICAgdGhpcy5sYWJlbC5pbm5lckhUTUwgPSB0ZXh0XHJcbiAgICAgICAgICAgIHRoaXMuc2hvcnRjdXRBdmFpbGFibGUgPSB0cnVlXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGNyZWF0ZUFjY2VsZXJhdG9yKGFjY2VsZXJhdG9yKVxyXG4gICAge1xyXG4gICAgICAgIHRoaXMuYWNjZWxlcmF0b3IgPSBodG1sKHsgcGFyZW50OiB0aGlzLmRpdiwgaHRtbDogYWNjZWxlcmF0b3IgPyBBY2NlbGVyYXRvcnMucHJldHRpZnlLZXkoYWNjZWxlcmF0b3IpIDogICcnLCBzdHlsZXM6IFN0eWxlcy5BY2NlbGVyYXRvcn0pXHJcbiAgICB9XHJcblxyXG4gICAgY3JlYXRlU3VibWVudShzdWJtZW51KVxyXG4gICAge1xyXG4gICAgICAgIHRoaXMuYXJyb3cgPSBodG1sKHsgcGFyZW50OiB0aGlzLmRpdiwgaHRtbDogc3VibWVudSA/ICcmIzk2NTg7JyA6ICcnIH0pXHJcbiAgICB9XHJcblxyXG4gICAgY2xvc2VBbGwoKVxyXG4gICAge1xyXG4gICAgICAgIGxldCBtZW51ID0gdGhpcy5tZW51XHJcbiAgICAgICAgd2hpbGUgKG1lbnUgJiYgIW1lbnUuYXBwbGljYXRpb25NZW51KVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgaWYgKG1lbnUuc2hvd2luZylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgbWVudS5zaG93aW5nLmRpdi5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSAndHJhbnNwYXJlbnQnXHJcbiAgICAgICAgICAgICAgICBtZW51LnNob3dpbmcgPSBudWxsXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgbWVudS5kaXYucmVtb3ZlKClcclxuICAgICAgICAgICAgbWVudSA9IG1lbnUubWVudVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAobWVudSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIG1lbnUuc2hvd2luZy5kaXYuc3R5bGUuYmFja2dyb3VuZCA9ICd0cmFuc3BhcmVudCdcclxuICAgICAgICAgICAgbWVudS5zaG93aW5nID0gbnVsbFxyXG4gICAgICAgICAgICBtZW51LnNob3dBY2NlbGVyYXRvcnMoKVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBoYW5kbGVDbGljayhlKVxyXG4gICAge1xyXG4gICAgICAgIGlmICh0aGlzLnN1Ym1lbnUpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5zdWJtZW51VGltZW91dClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgY2xlYXJUaW1lb3V0KHRoaXMuc3VibWVudVRpbWVvdXQpXHJcbiAgICAgICAgICAgICAgICB0aGlzLnN1Ym1lbnVUaW1lb3V0ID0gbnVsbFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMuc3VibWVudS5zaG93KHRoaXMpXHJcbiAgICAgICAgICAgIHRoaXMuZGl2LnN0eWxlLmJhY2tncm91bmRDb2xvciA9IFN0eWxlcy5TZWxlY3RlZEJhY2tncm91bmRcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAodGhpcy50eXBlID09PSAnY2hlY2tib3gnKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5jaGVja2VkID0gIXRoaXMuY2hlY2tlZFxyXG4gICAgICAgICAgICB0aGlzLmNoZWNrLmlubmVySFRNTCA9IHRoaXMuY2hlY2tlZCA/ICcmIzEwMDA0OycgOiAnJ1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLmNsb3NlQWxsKClcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHRoaXMuY2xpY2spXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLmNsaWNrKGUsIHRoaXMpXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IE1lbnVJdGVtIl19