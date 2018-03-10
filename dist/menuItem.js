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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9tZW51SXRlbS5qcyJdLCJuYW1lcyI6WyJodG1sIiwicmVxdWlyZSIsIkNvbmZpZyIsIkFjY2VsZXJhdG9ycyIsIk1lbnVJdGVtIiwiY29uc3RydWN0b3IiLCJvcHRpb25zIiwic3R5bGVzIiwiZGl2IiwidHlwZSIsImNsaWNrIiwiYXBwbHlDb25maWciLCJTZXBhcmF0b3JTdHlsZSIsImNoZWNrZWQiLCJjcmVhdGVDaGVja2VkIiwidGV4dCIsImxhYmVsIiwiY3JlYXRlU2hvcnRjdXQiLCJjcmVhdGVBY2NlbGVyYXRvciIsImFjY2VsZXJhdG9yIiwiY3JlYXRlU3VibWVudSIsInN1Ym1lbnUiLCJNZW51U3R5bGUiLCJSb3dTdHlsZSIsImFkZEV2ZW50TGlzdGVuZXIiLCJlIiwiaGFuZGxlQ2xpY2siLCJtb3VzZWVudGVyIiwibW91c2VsZWF2ZSIsIm1lbnUiLCJzaG93aW5nIiwic3R5bGUiLCJiYWNrZ3JvdW5kQ29sb3IiLCJTZWxlY3RlZEJhY2tncm91bmRTdHlsZSIsImFwcGxpY2F0aW9uTWVudSIsInN1Ym1lbnVUaW1lb3V0Iiwic2V0VGltZW91dCIsInNob3ciLCJTdWJtZW51T3BlbkRlbGF5IiwiY2xlYXJUaW1lb3V0IiwiYmFzZSIsImNoZWNrIiwicGFyZW50IiwiY3VycmVudCIsImluZGV4T2YiLCJpIiwibGV0dGVyIiwic2hvcnRjdXRTcGFuIiwiQWNjZWxlcmF0b3JLZXlTdHlsZSIsImlubmVySFRNTCIsImxlbmd0aCIsInNob3dTaG9ydGN1dCIsInRleHREZWNvcmF0aW9uIiwiaGlkZVNob3J0Y3V0IiwicHJldHRpZnlLZXkiLCJBY2NlbGVyYXRvclN0eWxlIiwiYXJyb3ciLCJjbG9zZUFsbCIsInJlbW92ZSIsImJhY2tncm91bmQiLCJzaG93QWNjZWxlcmF0b3JzIiwibW9kdWxlIiwiZXhwb3J0cyJdLCJtYXBwaW5ncyI6IkFBQUEsTUFBTUEsT0FBT0MsUUFBUSxRQUFSLENBQWI7QUFDQSxNQUFNQyxTQUFTRCxRQUFRLFVBQVIsQ0FBZjtBQUNBLE1BQU1FLGVBQWVGLFFBQVEsZ0JBQVIsQ0FBckI7O0FBRUEsTUFBTUcsUUFBTixDQUNBO0FBQ0k7Ozs7Ozs7OztBQVNBQyxnQkFBWUMsT0FBWixFQUNBO0FBQ0lBLGtCQUFVQSxXQUFXLEVBQXJCO0FBQ0EsYUFBS0MsTUFBTCxHQUFjRCxRQUFRQyxNQUF0QjtBQUNBLGFBQUtDLEdBQUwsR0FBV1IsTUFBWDtBQUNBLGFBQUtTLElBQUwsR0FBWUgsUUFBUUcsSUFBcEI7QUFDQSxhQUFLQyxLQUFMLEdBQWFKLFFBQVFJLEtBQXJCO0FBQ0EsWUFBSSxLQUFLRCxJQUFMLEtBQWMsV0FBbEIsRUFDQTtBQUNJLGlCQUFLRSxXQUFMLENBQWlCVCxPQUFPVSxjQUF4QjtBQUNILFNBSEQsTUFLQTtBQUNJLGlCQUFLQyxPQUFMLEdBQWVQLFFBQVFPLE9BQXZCO0FBQ0EsaUJBQUtDLGFBQUwsQ0FBbUJSLFFBQVFPLE9BQTNCO0FBQ0EsaUJBQUtFLElBQUwsR0FBWVQsUUFBUVUsS0FBUixJQUFpQixvQkFBN0I7QUFDQSxpQkFBS0MsY0FBTDtBQUNBLGlCQUFLQyxpQkFBTCxDQUF1QlosUUFBUWEsV0FBL0I7QUFDQSxpQkFBS0MsYUFBTCxDQUFtQmQsUUFBUWUsT0FBM0I7QUFDQSxnQkFBSWYsUUFBUWUsT0FBWixFQUNBO0FBQ0kscUJBQUtBLE9BQUwsR0FBZWYsUUFBUWUsT0FBdkI7QUFDQSxxQkFBS0EsT0FBTCxDQUFhVixXQUFiLENBQXlCVCxPQUFPb0IsU0FBaEM7QUFDSDtBQUNELGlCQUFLWCxXQUFMLENBQWlCVCxPQUFPcUIsUUFBeEI7QUFDQSxpQkFBS2YsR0FBTCxDQUFTZ0IsZ0JBQVQsQ0FBMEIsV0FBMUIsRUFBd0NDLENBQUQsSUFBTyxLQUFLQyxXQUFMLENBQWlCRCxDQUFqQixDQUE5QztBQUNBLGlCQUFLakIsR0FBTCxDQUFTZ0IsZ0JBQVQsQ0FBMEIsWUFBMUIsRUFBeUNDLENBQUQsSUFBTyxLQUFLQyxXQUFMLENBQWlCRCxDQUFqQixDQUEvQztBQUNBLGlCQUFLakIsR0FBTCxDQUFTZ0IsZ0JBQVQsQ0FBMEIsWUFBMUIsRUFBd0MsTUFBTSxLQUFLRyxVQUFMLEVBQTlDO0FBQ0EsaUJBQUtuQixHQUFMLENBQVNnQixnQkFBVCxDQUEwQixZQUExQixFQUF3QyxNQUFNLEtBQUtJLFVBQUwsRUFBOUM7QUFDSDtBQUNKOztBQUVEOzs7Ozs7QUFNQUQsaUJBQ0E7QUFDSSxZQUFJLENBQUMsS0FBS04sT0FBTixJQUFpQixLQUFLUSxJQUFMLENBQVVDLE9BQVYsS0FBc0IsSUFBM0MsRUFDQTtBQUNJLGlCQUFLdEIsR0FBTCxDQUFTdUIsS0FBVCxDQUFlQyxlQUFmLEdBQWlDOUIsT0FBTytCLHVCQUF4QztBQUNBLGdCQUFJLEtBQUtaLE9BQUwsSUFBZ0IsQ0FBQyxLQUFLUSxJQUFMLENBQVVLLGVBQS9CLEVBQ0E7QUFDSSxxQkFBS0MsY0FBTCxHQUFzQkMsV0FBVyxNQUNqQztBQUNJLHlCQUFLRCxjQUFMLEdBQXNCLElBQXRCO0FBQ0EseUJBQUtkLE9BQUwsQ0FBYWdCLElBQWIsQ0FBa0IsSUFBbEI7QUFDSCxpQkFKcUIsRUFJbkJuQyxPQUFPb0MsZ0JBSlksQ0FBdEI7QUFLSDtBQUNKO0FBQ0o7O0FBRURWLGlCQUNBO0FBQ0ksWUFBSSxDQUFDLEtBQUtQLE9BQU4sSUFBaUIsS0FBS1EsSUFBTCxDQUFVQyxPQUFWLEtBQXNCLElBQTNDLEVBQ0E7QUFDSSxnQkFBSSxLQUFLSyxjQUFULEVBQ0E7QUFDSUksNkJBQWEsS0FBS0osY0FBbEI7QUFDQSxxQkFBS0EsY0FBTCxHQUFzQixJQUF0QjtBQUNIO0FBQ0QsaUJBQUszQixHQUFMLENBQVN1QixLQUFULENBQWVDLGVBQWYsR0FBaUMsYUFBakM7QUFDSDtBQUNKOztBQUVEckIsZ0JBQVk2QixJQUFaLEVBQ0E7QUFDSSxjQUFNakMsU0FBUyxFQUFmO0FBQ0EsYUFBSyxJQUFJd0IsS0FBVCxJQUFrQlMsSUFBbEIsRUFDQTtBQUNJakMsbUJBQU93QixLQUFQLElBQWdCUyxLQUFLVCxLQUFMLENBQWhCO0FBQ0g7QUFDRCxZQUFJLEtBQUt4QixNQUFULEVBQ0E7QUFDSSxpQkFBSyxJQUFJd0IsS0FBVCxJQUFrQixLQUFLeEIsTUFBdkIsRUFDQTtBQUNJQSx1QkFBT3dCLEtBQVAsSUFBZ0IsS0FBS3hCLE1BQUwsQ0FBWXdCLEtBQVosQ0FBaEI7QUFDSDtBQUNKO0FBQ0QsYUFBSyxJQUFJQSxLQUFULElBQWtCeEIsTUFBbEIsRUFDQTtBQUNJLGlCQUFLQyxHQUFMLENBQVN1QixLQUFULENBQWVBLEtBQWYsSUFBd0J4QixPQUFPd0IsS0FBUCxDQUF4QjtBQUNIO0FBQ0o7O0FBRURqQixrQkFBY0QsT0FBZCxFQUNBO0FBQ0ksYUFBSzRCLEtBQUwsR0FBYXpDLEtBQUssRUFBRTBDLFFBQVEsS0FBS2xDLEdBQWYsRUFBb0JSLE1BQU1hLFVBQVUsVUFBVixHQUF1QixFQUFqRCxFQUFMLENBQWI7QUFDSDs7QUFFREkscUJBQ0E7QUFDSSxZQUFJLEtBQUtSLElBQUwsS0FBYyxXQUFsQixFQUNBO0FBQ0ksa0JBQU1NLE9BQU8sS0FBS0EsSUFBbEI7QUFDQSxpQkFBS0MsS0FBTCxHQUFhaEIsS0FBSyxFQUFFMEMsUUFBUSxLQUFLbEMsR0FBZixFQUFMLENBQWI7QUFDQSxnQkFBSW1DLFVBQVUzQyxLQUFLLEVBQUUwQyxRQUFRLEtBQUsxQixLQUFmLEVBQXNCUCxNQUFNLE1BQTVCLEVBQUwsQ0FBZDtBQUNBLGdCQUFJTSxLQUFLNkIsT0FBTCxDQUFhLEdBQWIsTUFBc0IsQ0FBQyxDQUEzQixFQUNBO0FBQ0ksb0JBQUlDLElBQUksQ0FBUjtBQUNBLG1CQUNBO0FBQ0ksMEJBQU1DLFNBQVMvQixLQUFLOEIsQ0FBTCxDQUFmO0FBQ0Esd0JBQUlDLFdBQVcsR0FBZixFQUNBO0FBQ0lEO0FBQ0EsNkJBQUtFLFlBQUwsR0FBb0IvQyxLQUFLLEVBQUUwQyxRQUFRLEtBQUsxQixLQUFmLEVBQXNCUCxNQUFNLE1BQTVCLEVBQW9DVCxNQUFNZSxLQUFLOEIsQ0FBTCxDQUExQyxFQUFtRHRDLFFBQVFMLE9BQU84QyxtQkFBbEUsRUFBTCxDQUFwQjtBQUNBTCxrQ0FBVTNDLEtBQUssRUFBRTBDLFFBQVEsS0FBSzFCLEtBQWYsRUFBc0JQLE1BQU0sTUFBNUIsRUFBTCxDQUFWO0FBQ0gscUJBTEQsTUFPQTtBQUNJa0MsZ0NBQVFNLFNBQVIsSUFBcUJILE1BQXJCO0FBQ0g7QUFDREQ7QUFDSCxpQkFkRCxRQWVPQSxJQUFJOUIsS0FBS21DLE1BZmhCO0FBZ0JILGFBbkJELE1BcUJBO0FBQ0kscUJBQUtsQyxLQUFMLENBQVdpQyxTQUFYLEdBQXVCbEMsSUFBdkI7QUFDSDtBQUNKO0FBQ0o7O0FBRURvQyxtQkFDQTtBQUNJLFlBQUksS0FBS0osWUFBVCxFQUNBO0FBQ0ksaUJBQUtBLFlBQUwsQ0FBa0JoQixLQUFsQixDQUF3QnFCLGNBQXhCLEdBQXlDLFdBQXpDO0FBQ0g7QUFDSjs7QUFFREMsbUJBQ0E7QUFDSSxZQUFJLEtBQUtOLFlBQVQsRUFDQTtBQUNJLGlCQUFLQSxZQUFMLENBQWtCaEIsS0FBbEIsQ0FBd0JxQixjQUF4QixHQUF5QyxNQUF6QztBQUNIO0FBQ0o7O0FBRURsQyxzQkFBa0JDLFdBQWxCLEVBQ0E7QUFDSSxhQUFLQSxXQUFMLEdBQW1CbkIsS0FBSyxFQUFFMEMsUUFBUSxLQUFLbEMsR0FBZixFQUFvQlIsTUFBTW1CLGNBQWNoQixhQUFhbUQsV0FBYixDQUF5Qm5DLFdBQXpCLENBQWQsR0FBdUQsRUFBakYsRUFBcUZaLFFBQVFMLE9BQU9xRCxnQkFBcEcsRUFBTCxDQUFuQjtBQUNIOztBQUVEbkMsa0JBQWNDLE9BQWQsRUFDQTtBQUNJLGFBQUttQyxLQUFMLEdBQWF4RCxLQUFLLEVBQUUwQyxRQUFRLEtBQUtsQyxHQUFmLEVBQW9CUixNQUFNcUIsVUFBVSxTQUFWLEdBQXNCLEVBQWhELEVBQUwsQ0FBYjtBQUNIOztBQUVEb0MsZUFDQTtBQUNJLFlBQUk1QixPQUFPLEtBQUtBLElBQWhCO0FBQ0EsZUFBT0EsUUFBUSxDQUFDQSxLQUFLSyxlQUFyQixFQUNBO0FBQ0ksZ0JBQUlMLEtBQUtDLE9BQVQsRUFDQTtBQUNJRCxxQkFBS0MsT0FBTCxDQUFhdEIsR0FBYixDQUFpQnVCLEtBQWpCLENBQXVCQyxlQUF2QixHQUF5QyxhQUF6QztBQUNBSCxxQkFBS0MsT0FBTCxHQUFlLElBQWY7QUFDSDtBQUNERCxpQkFBS3JCLEdBQUwsQ0FBU2tELE1BQVQ7QUFDQTdCLG1CQUFPQSxLQUFLQSxJQUFaO0FBQ0g7QUFDRCxZQUFJQSxJQUFKLEVBQ0E7QUFDSUEsaUJBQUtDLE9BQUwsQ0FBYXRCLEdBQWIsQ0FBaUJ1QixLQUFqQixDQUF1QjRCLFVBQXZCLEdBQW9DLGFBQXBDO0FBQ0E5QixpQkFBS0MsT0FBTCxHQUFlLElBQWY7QUFDQUQsaUJBQUsrQixnQkFBTDtBQUNIO0FBQ0o7O0FBRURsQyxnQkFBWUQsQ0FBWixFQUNBO0FBQ0ksWUFBSSxLQUFLSixPQUFULEVBQ0E7QUFDSSxnQkFBSSxLQUFLYyxjQUFULEVBQ0E7QUFDSUksNkJBQWEsS0FBS0osY0FBbEI7QUFDQSxxQkFBS0EsY0FBTCxHQUFzQixJQUF0QjtBQUNIO0FBQ0QsaUJBQUtkLE9BQUwsQ0FBYWdCLElBQWIsQ0FBa0IsSUFBbEI7QUFDQSxpQkFBSzdCLEdBQUwsQ0FBU3VCLEtBQVQsQ0FBZUMsZUFBZixHQUFpQzlCLE9BQU8rQix1QkFBeEM7QUFDSCxTQVRELE1BVUssSUFBSSxLQUFLeEIsSUFBTCxLQUFjLFVBQWxCLEVBQ0w7QUFDSSxpQkFBS0ksT0FBTCxHQUFlLENBQUMsS0FBS0EsT0FBckI7QUFDQSxpQkFBSzRCLEtBQUwsQ0FBV1EsU0FBWCxHQUF1QixLQUFLcEMsT0FBTCxHQUFlLFVBQWYsR0FBNEIsRUFBbkQ7QUFDQSxpQkFBSzRDLFFBQUw7QUFDSCxTQUxJLE1BT0w7QUFDSSxpQkFBS0EsUUFBTDtBQUNIOztBQUVELFlBQUksS0FBSy9DLEtBQVQsRUFDQTtBQUNJLGlCQUFLQSxLQUFMLENBQVdlLENBQVgsRUFBYyxJQUFkO0FBQ0g7QUFDSjtBQWxOTDs7QUFxTkFvQyxPQUFPQyxPQUFQLEdBQWlCMUQsUUFBakIiLCJmaWxlIjoibWVudUl0ZW0uanMiLCJzb3VyY2VzQ29udGVudCI6WyJjb25zdCBodG1sID0gcmVxdWlyZSgnLi9odG1sJylcclxuY29uc3QgQ29uZmlnID0gcmVxdWlyZSgnLi9jb25maWcnKVxyXG5jb25zdCBBY2NlbGVyYXRvcnMgPSByZXF1aXJlKCcuL2FjY2VsZXJhdG9ycycpXHJcblxyXG5jbGFzcyBNZW51SXRlbVxyXG57XHJcbiAgICAvKipcclxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gW29wdGlvbnMubGFiZWxdIGxhYmVsIGZvciBtZW51IGVudHJ5IG1heSBpbmNsdWRlIGFjY2VsZXJhdG9yIGJ5IHBsYWNpbmcgJiBiZWZvcmUgbGV0dGVyKVxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IFtvcHRpb25zLnR5cGVdIHNlcGFyYXRvciwgY2hlY2tib3gsIG9yIHVuZGVmaW5lZFxyXG4gICAgICogQHBhcmFtIHtvYmplY3R9IFtvcHRpb25zLnN0eWxlc10gYWRkaXRpb25hbCBDU1Mgc3R5bGVzIHRvIGFwcGx5IHRvIHRoaXMgTWVudUl0ZW1cclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBbb3B0aW9ucy5hY2NlbGVyYXRvcl0gc2VlIEFjY2VsZXJhdG9yIGZvciBpbnB1dHMgKGUuZy4sIGN0cmwrc2hpZnQrQSlcclxuICAgICAqIEBwYXJhbSB7TWVudUl0ZW19IFtvcHRpb25zLnN1Ym1lbnVdIGF0dGFjaGVzIGEgc3VibWVudSAoYW5kIGNoYW5nZXMgdHlwZSB0byBzdWJtZW51KVxyXG4gICAgICogQHBhcmFtIHtib29sZWFufSBbb3B0aW9ucy5jaGVja2VkXSBjaGVjayB0aGUgY2hlY2tib3hcclxuICAgICAqL1xyXG4gICAgY29uc3RydWN0b3Iob3B0aW9ucylcclxuICAgIHtcclxuICAgICAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fVxyXG4gICAgICAgIHRoaXMuc3R5bGVzID0gb3B0aW9ucy5zdHlsZXNcclxuICAgICAgICB0aGlzLmRpdiA9IGh0bWwoKVxyXG4gICAgICAgIHRoaXMudHlwZSA9IG9wdGlvbnMudHlwZVxyXG4gICAgICAgIHRoaXMuY2xpY2sgPSBvcHRpb25zLmNsaWNrXHJcbiAgICAgICAgaWYgKHRoaXMudHlwZSA9PT0gJ3NlcGFyYXRvcicpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLmFwcGx5Q29uZmlnKENvbmZpZy5TZXBhcmF0b3JTdHlsZSlcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5jaGVja2VkID0gb3B0aW9ucy5jaGVja2VkXHJcbiAgICAgICAgICAgIHRoaXMuY3JlYXRlQ2hlY2tlZChvcHRpb25zLmNoZWNrZWQpXHJcbiAgICAgICAgICAgIHRoaXMudGV4dCA9IG9wdGlvbnMubGFiZWwgfHwgJyZuYnNwOyZuYnNwOyZuYnNwOydcclxuICAgICAgICAgICAgdGhpcy5jcmVhdGVTaG9ydGN1dCgpXHJcbiAgICAgICAgICAgIHRoaXMuY3JlYXRlQWNjZWxlcmF0b3Iob3B0aW9ucy5hY2NlbGVyYXRvcilcclxuICAgICAgICAgICAgdGhpcy5jcmVhdGVTdWJtZW51KG9wdGlvbnMuc3VibWVudSlcclxuICAgICAgICAgICAgaWYgKG9wdGlvbnMuc3VibWVudSlcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zdWJtZW51ID0gb3B0aW9ucy5zdWJtZW51XHJcbiAgICAgICAgICAgICAgICB0aGlzLnN1Ym1lbnUuYXBwbHlDb25maWcoQ29uZmlnLk1lbnVTdHlsZSlcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLmFwcGx5Q29uZmlnKENvbmZpZy5Sb3dTdHlsZSlcclxuICAgICAgICAgICAgdGhpcy5kaXYuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgKGUpID0+IHRoaXMuaGFuZGxlQ2xpY2soZSkpXHJcbiAgICAgICAgICAgIHRoaXMuZGl2LmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNoc3RhcnQnLCAoZSkgPT4gdGhpcy5oYW5kbGVDbGljayhlKSlcclxuICAgICAgICAgICAgdGhpcy5kaXYuYWRkRXZlbnRMaXN0ZW5lcignbW91c2VlbnRlcicsICgpID0+IHRoaXMubW91c2VlbnRlcigpKVxyXG4gICAgICAgICAgICB0aGlzLmRpdi5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWxlYXZlJywgKCkgPT4gdGhpcy5tb3VzZWxlYXZlKCkpXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogVGhlIGNsaWNrIGNhbGxiYWNrXHJcbiAgICAgKiBAY2FsbGJhY2sgTWVudUl0ZW1+Q2xpY2tDYWxsYmFja1xyXG4gICAgICogQHBhcmFtIHtJbnB1dEV2ZW50fSBlXHJcbiAgICAgKi9cclxuXHJcbiAgICBtb3VzZWVudGVyKClcclxuICAgIHtcclxuICAgICAgICBpZiAoIXRoaXMuc3VibWVudSB8fCB0aGlzLm1lbnUuc2hvd2luZyAhPT0gdGhpcyApXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLmRpdi5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSBDb25maWcuU2VsZWN0ZWRCYWNrZ3JvdW5kU3R5bGVcclxuICAgICAgICAgICAgaWYgKHRoaXMuc3VibWVudSAmJiAhdGhpcy5tZW51LmFwcGxpY2F0aW9uTWVudSlcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zdWJtZW51VGltZW91dCA9IHNldFRpbWVvdXQoKCkgPT5cclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnN1Ym1lbnVUaW1lb3V0ID0gbnVsbFxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc3VibWVudS5zaG93KHRoaXMpXHJcbiAgICAgICAgICAgICAgICB9LCBDb25maWcuU3VibWVudU9wZW5EZWxheSlcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBtb3VzZWxlYXZlKClcclxuICAgIHtcclxuICAgICAgICBpZiAoIXRoaXMuc3VibWVudSB8fCB0aGlzLm1lbnUuc2hvd2luZyAhPT0gdGhpcylcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLnN1Ym1lbnVUaW1lb3V0KVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBjbGVhclRpbWVvdXQodGhpcy5zdWJtZW51VGltZW91dClcclxuICAgICAgICAgICAgICAgIHRoaXMuc3VibWVudVRpbWVvdXQgPSBudWxsXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5kaXYuc3R5bGUuYmFja2dyb3VuZENvbG9yID0gJ3RyYW5zcGFyZW50J1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBhcHBseUNvbmZpZyhiYXNlKVxyXG4gICAge1xyXG4gICAgICAgIGNvbnN0IHN0eWxlcyA9IHt9XHJcbiAgICAgICAgZm9yIChsZXQgc3R5bGUgaW4gYmFzZSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHN0eWxlc1tzdHlsZV0gPSBiYXNlW3N0eWxlXVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodGhpcy5zdHlsZXMpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBmb3IgKGxldCBzdHlsZSBpbiB0aGlzLnN0eWxlcylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgc3R5bGVzW3N0eWxlXSA9IHRoaXMuc3R5bGVzW3N0eWxlXVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGZvciAobGV0IHN0eWxlIGluIHN0eWxlcylcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMuZGl2LnN0eWxlW3N0eWxlXSA9IHN0eWxlc1tzdHlsZV1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgY3JlYXRlQ2hlY2tlZChjaGVja2VkKVxyXG4gICAge1xyXG4gICAgICAgIHRoaXMuY2hlY2sgPSBodG1sKHsgcGFyZW50OiB0aGlzLmRpdiwgaHRtbDogY2hlY2tlZCA/ICcmIzEwMDA0OycgOiAnJyB9KVxyXG4gICAgfVxyXG5cclxuICAgIGNyZWF0ZVNob3J0Y3V0KClcclxuICAgIHtcclxuICAgICAgICBpZiAodGhpcy50eXBlICE9PSAnc2VwYXJhdG9yJylcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGNvbnN0IHRleHQgPSB0aGlzLnRleHRcclxuICAgICAgICAgICAgdGhpcy5sYWJlbCA9IGh0bWwoeyBwYXJlbnQ6IHRoaXMuZGl2IH0pXHJcbiAgICAgICAgICAgIGxldCBjdXJyZW50ID0gaHRtbCh7IHBhcmVudDogdGhpcy5sYWJlbCwgdHlwZTogJ3NwYW4nIH0pXHJcbiAgICAgICAgICAgIGlmICh0ZXh0LmluZGV4T2YoJyYnKSAhPT0gLTEpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGxldCBpID0gMFxyXG4gICAgICAgICAgICAgICAgZG9cclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBsZXR0ZXIgPSB0ZXh0W2ldXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGxldHRlciA9PT0gJyYnKVxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaSsrXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc2hvcnRjdXRTcGFuID0gaHRtbCh7IHBhcmVudDogdGhpcy5sYWJlbCwgdHlwZTogJ3NwYW4nLCBodG1sOiB0ZXh0W2ldLCBzdHlsZXM6IENvbmZpZy5BY2NlbGVyYXRvcktleVN0eWxlIH0pXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGN1cnJlbnQgPSBodG1sKHsgcGFyZW50OiB0aGlzLmxhYmVsLCB0eXBlOiAnc3BhbicgfSlcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY3VycmVudC5pbm5lckhUTUwgKz0gbGV0dGVyXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGkrK1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgd2hpbGUgKGkgPCB0ZXh0Lmxlbmd0aClcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHRoaXMubGFiZWwuaW5uZXJIVE1MID0gdGV4dFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHNob3dTaG9ydGN1dCgpXHJcbiAgICB7XHJcbiAgICAgICAgaWYgKHRoaXMuc2hvcnRjdXRTcGFuKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5zaG9ydGN1dFNwYW4uc3R5bGUudGV4dERlY29yYXRpb24gPSAndW5kZXJsaW5lJ1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBoaWRlU2hvcnRjdXQoKVxyXG4gICAge1xyXG4gICAgICAgIGlmICh0aGlzLnNob3J0Y3V0U3BhbilcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMuc2hvcnRjdXRTcGFuLnN0eWxlLnRleHREZWNvcmF0aW9uID0gJ25vbmUnXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGNyZWF0ZUFjY2VsZXJhdG9yKGFjY2VsZXJhdG9yKVxyXG4gICAge1xyXG4gICAgICAgIHRoaXMuYWNjZWxlcmF0b3IgPSBodG1sKHsgcGFyZW50OiB0aGlzLmRpdiwgaHRtbDogYWNjZWxlcmF0b3IgPyBBY2NlbGVyYXRvcnMucHJldHRpZnlLZXkoYWNjZWxlcmF0b3IpIDogICcnLCBzdHlsZXM6IENvbmZpZy5BY2NlbGVyYXRvclN0eWxlIH0pXHJcbiAgICB9XHJcblxyXG4gICAgY3JlYXRlU3VibWVudShzdWJtZW51KVxyXG4gICAge1xyXG4gICAgICAgIHRoaXMuYXJyb3cgPSBodG1sKHsgcGFyZW50OiB0aGlzLmRpdiwgaHRtbDogc3VibWVudSA/ICcmIzk2NTg7JyA6ICcnIH0pXHJcbiAgICB9XHJcblxyXG4gICAgY2xvc2VBbGwoKVxyXG4gICAge1xyXG4gICAgICAgIGxldCBtZW51ID0gdGhpcy5tZW51XHJcbiAgICAgICAgd2hpbGUgKG1lbnUgJiYgIW1lbnUuYXBwbGljYXRpb25NZW51KVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgaWYgKG1lbnUuc2hvd2luZylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgbWVudS5zaG93aW5nLmRpdi5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSAndHJhbnNwYXJlbnQnXHJcbiAgICAgICAgICAgICAgICBtZW51LnNob3dpbmcgPSBudWxsXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgbWVudS5kaXYucmVtb3ZlKClcclxuICAgICAgICAgICAgbWVudSA9IG1lbnUubWVudVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAobWVudSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIG1lbnUuc2hvd2luZy5kaXYuc3R5bGUuYmFja2dyb3VuZCA9ICd0cmFuc3BhcmVudCdcclxuICAgICAgICAgICAgbWVudS5zaG93aW5nID0gbnVsbFxyXG4gICAgICAgICAgICBtZW51LnNob3dBY2NlbGVyYXRvcnMoKVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBoYW5kbGVDbGljayhlKVxyXG4gICAge1xyXG4gICAgICAgIGlmICh0aGlzLnN1Ym1lbnUpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5zdWJtZW51VGltZW91dClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgY2xlYXJUaW1lb3V0KHRoaXMuc3VibWVudVRpbWVvdXQpXHJcbiAgICAgICAgICAgICAgICB0aGlzLnN1Ym1lbnVUaW1lb3V0ID0gbnVsbFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMuc3VibWVudS5zaG93KHRoaXMpXHJcbiAgICAgICAgICAgIHRoaXMuZGl2LnN0eWxlLmJhY2tncm91bmRDb2xvciA9IENvbmZpZy5TZWxlY3RlZEJhY2tncm91bmRTdHlsZVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmICh0aGlzLnR5cGUgPT09ICdjaGVja2JveCcpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLmNoZWNrZWQgPSAhdGhpcy5jaGVja2VkXHJcbiAgICAgICAgICAgIHRoaXMuY2hlY2suaW5uZXJIVE1MID0gdGhpcy5jaGVja2VkID8gJyYjMTAwMDQ7JyA6ICcnXHJcbiAgICAgICAgICAgIHRoaXMuY2xvc2VBbGwoKVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLmNsb3NlQWxsKClcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICh0aGlzLmNsaWNrKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5jbGljayhlLCB0aGlzKVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBNZW51SXRlbSJdfQ==