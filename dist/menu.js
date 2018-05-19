const Config = require('./config');
const MenuItem = require('./menuItem');
const LocalAccelerator = require('./localAccelerator');
const html = require('./html');

let _application;

class Menu {
    /**
     * creates a menu bar
     * @param {object} [options]
     * @param {object} [options.styles] additional CSS styles for menu
     */
    constructor(options) {
        options = options || {};
        this.div = document.createElement('div');
        this.styles = options.styles;
        this.children = [];
        this.applyConfig(Config.MenuStyle);
        this.div.tabIndex = -1;
    }

    /**
     * append a MenuItem to the Menu
     * @param {MenuItem} menuItem
     */
    append(menuItem) {
        if (menuItem.submenu) {
            menuItem.submenu.menu = this;
        }
        menuItem.menu = this;
        this.div.appendChild(menuItem.div);
        if (menuItem.type !== 'separator') {
            this.children.push(menuItem);
        }
    }

    /**
     * inserts a MenuItem into the Menu
     * @param {number} pos
     * @param {MenuItem} menuItem
     */
    insert(pos, menuItem) {
        if (pos >= this.div.childNodes.length) {
            this.append(menuItem);
        } else {
            if (menuItem.submenu) {
                menuItem.submenu.menu = this;
            }
            menuItem.menu = this;
            this.div.insertBefore(menuItem.div, this.div.childNodes[pos]);
            if (menuItem.type !== 'separator') {
                this.children.splice(pos, 0, menuItem);
            }
        }
    }

    hide() {
        let current = this.menu.showing;
        while (current && current.submenu) {
            current.div.style.backgroundColor = 'transparent';
            current.submenu.div.remove();
            let next = current.submenu.showing;
            if (next) {
                current.submenu.showing.div.style.backgroundColor = 'transparent';
                current.submenu.showing = null;
            }
            current = next;
        }
    }

    show(menuItem) {
        Menu.LocalAccelerator.unregisterMenuShortcuts();
        if (this.menu && this.menu.showing === menuItem) {
            this.hide();
            this.menu.showing = null;
            this.div.remove();
            this.menu.showAccelerators();
        } else {
            if (this.menu) {
                if (this.menu.showing && this.menu.children.indexOf(menuItem) !== -1) {
                    this.hide();
                }
                this.menu.showing = menuItem;
                this.menu.hideAccelerators();
            }
            const div = menuItem.div;
            const parent = this.menu.div;
            if (this.menu.applicationMenu) {
                this.div.style.left = div.offsetLeft + 'px';
                this.div.style.top = div.offsetTop + div.offsetHeight + 'px';
            } else {
                this.div.style.left = parent.offsetLeft + parent.offsetWidth - Config.Overlap + 'px';
                this.div.style.top = parent.offsetTop + div.offsetTop - Config.Overlap + 'px';
            }
            this.attached = menuItem;
            this.showAccelerators();
            this.getApplicationDiv().appendChild(this.div);
            let label = 0,
                accelerator = 0,
                arrow = 0,
                checked = 0;
            for (let child of this.children) {
                child.check.style.width = 'auto';
                child.label.style.width = 'auto';
                child.accelerator.style.width = 'auto';
                child.arrow.style.width = 'auto';
                if (child.type === 'checkbox') {
                    checked = Config.MinimumColumnWidth;
                }
                if (child.submenu) {
                    arrow = Config.MinimumColumnWidth;
                }
            }
            for (let child of this.children) {
                const childLabel = child.label.offsetWidth * 2;
                label = childLabel > label ? childLabel : label;
                const childAccelerator = child.accelerator.offsetWidth;
                accelerator = childAccelerator > accelerator ? childAccelerator : accelerator;
                if (child.submenu) {
                    arrow = child.arrow.offsetWidth;
                }
            }
            for (let child of this.children) {
                child.check.style.width = checked + 'px';
                child.label.style.width = label + 'px';
                child.accelerator.style.width = accelerator + 'px';
                child.arrow.style.width = arrow + 'px';
            }
            if (this.div.offsetLeft + this.div.offsetWidth > window.innerWidth) {
                this.div.style.left = window.innerWidth - this.div.offsetWidth + 'px';
            }
            if (this.div.offsetTop + this.div.offsetHeight > window.innerHeight) {
                this.div.style.top = window.innerHeight - this.div.offsetHeight + 'px';
            }
            _application.menu.div.focus();
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

    showAccelerators() {
        for (let child of this.children) {
            child.showShortcut();
            if (child.type !== 'separator') {
                const index = child.text.indexOf('&');
                if (index !== -1) {
                    Menu.LocalAccelerator.registerMenuShortcut(child.text[index + 1], child);
                }
            }
        }
        if (!this.applicationMenu) {
            Menu.LocalAccelerator.registerMenuSpecial(this);
        }
    }

    hideAccelerators() {
        for (let child of this.children) {
            child.hideShortcut();
        }
    }

    closeAll() {
        Menu.LocalAccelerator.unregisterMenuShortcuts();
        let application = _application.menu;
        if (application.showing) {
            let menu = application;
            while (menu.showing) {
                menu = menu.showing.submenu;
            }
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
                menu.hideAccelerators();
            }
        }
    }

    getApplicationDiv() {
        return _application;
    }

    /**
     * move selector to the next child pane
     * @param {string} direction (left or right)
     * @private
     */
    moveChild(direction) {
        let index;
        if (direction === 'left') {
            const parent = this.selector.menu.menu;
            index = parent.children.indexOf(parent.showing);
            index--;
            index = index < 0 ? parent.children.length - 1 : index;
            parent.children[index].handleClick();
        } else {
            let parent = this.selector.menu.menu;
            let selector = parent.showing;
            while (!parent.applicationMenu) {
                selector.handleClick();
                selector.div.style.backgroundColor = 'transparent';
                parent = parent.menu;
                selector = parent.showing;
            }
            index = parent.children.indexOf(selector);
            index++;
            index = index === parent.children.length ? 0 : index;
            parent.children[index].handleClick();
        }
        this.selector = null;
    }

    /**
     * move selector right and left
     * @param {MouseEvent} e
     * @param {string} direction
     * @private
     */
    horizontalSelector(e, direction) {
        if (direction === 'right') {
            if (this.selector.submenu) {
                this.selector.handleClick(e);
                this.selector.submenu.selector = this.selector.submenu.children[0];
                this.selector.submenu.selector.div.style.backgroundColor = Config.SelectedBackgroundStyle;
                this.selector = null;
            } else {
                this.moveChild(direction);
            }
        } else if (direction === 'left') {
            if (!this.selector.menu.menu.applicationMenu) {
                this.selector.menu.attached.handleClick(e);
                this.selector.menu.menu.selector = this.selector.menu.attached;
                this.selector = null;
            } else {
                this.moveChild(direction);
            }
        }
        e.stopPropagation();
        e.preventDefault();
    }

    /**
     * move the selector in the menu
     * @param {KeyboardEvent} e
     * @param {string} direction (left, right, up, down)
     * @private
     */
    move(e, direction) {
        if (this.selector) {
            this.selector.div.style.backgroundColor = 'transparent';
            let index = this.children.indexOf(this.selector);
            if (direction === 'down') {
                index++;
                index = index === this.children.length ? 0 : index;
            } else if (direction === 'up') {
                index--;
                index = index < 0 ? this.children.length - 1 : index;
            } else {
                return this.horizontalSelector(e, direction);
            }
            this.selector = this.children[index];
        } else {
            if (direction === 'up') {
                this.selector = this.children[this.children.length - 1];
            } else {
                this.selector = this.children[0];
            }
        }
        this.selector.div.style.backgroundColor = Config.SelectedBackgroundStyle;
        e.preventDefault();
        e.stopPropagation();
    }

    /**
     * click the selector with keyboard
     * @private
     */
    enter(e) {
        if (this.selector) {
            this.selector.handleClick(e);
            e.preventDefault();
            e.stopPropagation();
        }
    }

    /**
     * array containing the menu's items
     * @property {MenuItems[]} items
     * @readonly
     */
    get items() {
        return this.children;
    }

    /**
     * show application menu accelerators when alt is pressed
     * @private
     */
    showApplicationAccelerators() {
        this.hideAccelerators();
        LocalAccelerator.registerAlt(() => {
            if (!this.showing) {
                this.showAccelerators();
            }
        }, () => {
            this.hideAccelerators();
        });
    }

    /**
     * sets active application Menu (and removes any existing application menus)
     * @param {Menu} menu
     */
    static setApplicationMenu(menu) {
        LocalAccelerator.init();
        if (_application) {
            _application.remove();
        }
        _application = html({ parent: document.body, styles: Config.ApplicationContainerStyle });
        _application.menu = menu;
        menu.applyConfig(Config.ApplicationMenuStyle);
        for (let child of menu.children) {
            child.applyConfig(Config.ApplicationMenuRowStyle);
            if (child.arrow) {
                child.arrow.style.display = 'none';
            }
            menu.div.appendChild(child.div);
        }

        _application.appendChild(menu.div);
        menu.applicationMenu = true;
        menu.div.tabIndex = -1;

        // don't let menu bar focus unless windows are open (this fixes a focus bug)
        menu.div.addEventListener('focus', () => {
            if (!menu.showing) {
                menu.div.blur();
            }
        });

        // close all windows if menu is no longer the focus
        menu.div.addEventListener('blur', () => {
            if (menu.showing) {
                menu.closeAll();
            }
        });
        menu.showApplicationAccelerators();
    }

    /**
     * localAccelerator definition
     * @type {Accelerator}
     */
    static get LocalAccelerator() {
        return LocalAccelerator;
    }

    /**
     * use this to change the default Config settings across all menus
     * @type {Config}
     */
    static get Config() {
        return Config;
    }

    /**
     * MenuItem definition
     * @type {MenuItem}
     */
    static get MenuItem() {
        return MenuItem;
    }
}

module.exports = Menu;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9tZW51LmpzIl0sIm5hbWVzIjpbIkNvbmZpZyIsInJlcXVpcmUiLCJNZW51SXRlbSIsIkxvY2FsQWNjZWxlcmF0b3IiLCJodG1sIiwiX2FwcGxpY2F0aW9uIiwiTWVudSIsImNvbnN0cnVjdG9yIiwib3B0aW9ucyIsImRpdiIsImRvY3VtZW50IiwiY3JlYXRlRWxlbWVudCIsInN0eWxlcyIsImNoaWxkcmVuIiwiYXBwbHlDb25maWciLCJNZW51U3R5bGUiLCJ0YWJJbmRleCIsImFwcGVuZCIsIm1lbnVJdGVtIiwic3VibWVudSIsIm1lbnUiLCJhcHBlbmRDaGlsZCIsInR5cGUiLCJwdXNoIiwiaW5zZXJ0IiwicG9zIiwiY2hpbGROb2RlcyIsImxlbmd0aCIsImluc2VydEJlZm9yZSIsInNwbGljZSIsImhpZGUiLCJjdXJyZW50Iiwic2hvd2luZyIsInN0eWxlIiwiYmFja2dyb3VuZENvbG9yIiwicmVtb3ZlIiwibmV4dCIsInNob3ciLCJ1bnJlZ2lzdGVyTWVudVNob3J0Y3V0cyIsInNob3dBY2NlbGVyYXRvcnMiLCJpbmRleE9mIiwiaGlkZUFjY2VsZXJhdG9ycyIsInBhcmVudCIsImFwcGxpY2F0aW9uTWVudSIsImxlZnQiLCJvZmZzZXRMZWZ0IiwidG9wIiwib2Zmc2V0VG9wIiwib2Zmc2V0SGVpZ2h0Iiwib2Zmc2V0V2lkdGgiLCJPdmVybGFwIiwiYXR0YWNoZWQiLCJnZXRBcHBsaWNhdGlvbkRpdiIsImxhYmVsIiwiYWNjZWxlcmF0b3IiLCJhcnJvdyIsImNoZWNrZWQiLCJjaGlsZCIsImNoZWNrIiwid2lkdGgiLCJNaW5pbXVtQ29sdW1uV2lkdGgiLCJjaGlsZExhYmVsIiwiY2hpbGRBY2NlbGVyYXRvciIsIndpbmRvdyIsImlubmVyV2lkdGgiLCJpbm5lckhlaWdodCIsImZvY3VzIiwiYmFzZSIsInNob3dTaG9ydGN1dCIsImluZGV4IiwidGV4dCIsInJlZ2lzdGVyTWVudVNob3J0Y3V0IiwicmVnaXN0ZXJNZW51U3BlY2lhbCIsImhpZGVTaG9ydGN1dCIsImNsb3NlQWxsIiwiYXBwbGljYXRpb24iLCJiYWNrZ3JvdW5kIiwibW92ZUNoaWxkIiwiZGlyZWN0aW9uIiwic2VsZWN0b3IiLCJoYW5kbGVDbGljayIsImhvcml6b250YWxTZWxlY3RvciIsImUiLCJTZWxlY3RlZEJhY2tncm91bmRTdHlsZSIsInN0b3BQcm9wYWdhdGlvbiIsInByZXZlbnREZWZhdWx0IiwibW92ZSIsImVudGVyIiwiaXRlbXMiLCJzaG93QXBwbGljYXRpb25BY2NlbGVyYXRvcnMiLCJyZWdpc3RlckFsdCIsInNldEFwcGxpY2F0aW9uTWVudSIsImluaXQiLCJib2R5IiwiQXBwbGljYXRpb25Db250YWluZXJTdHlsZSIsIkFwcGxpY2F0aW9uTWVudVN0eWxlIiwiQXBwbGljYXRpb25NZW51Um93U3R5bGUiLCJkaXNwbGF5IiwiYWRkRXZlbnRMaXN0ZW5lciIsImJsdXIiLCJtb2R1bGUiLCJleHBvcnRzIl0sIm1hcHBpbmdzIjoiQUFBQSxNQUFNQSxTQUFXQyxRQUFRLFVBQVIsQ0FBakI7QUFDQSxNQUFNQyxXQUFXRCxRQUFRLFlBQVIsQ0FBakI7QUFDQSxNQUFNRSxtQkFBbUJGLFFBQVEsb0JBQVIsQ0FBekI7QUFDQSxNQUFNRyxPQUFPSCxRQUFRLFFBQVIsQ0FBYjs7QUFFQSxJQUFJSSxZQUFKOztBQUVBLE1BQU1DLElBQU4sQ0FDQTtBQUNJOzs7OztBQUtBQyxnQkFBWUMsT0FBWixFQUNBO0FBQ0lBLGtCQUFVQSxXQUFXLEVBQXJCO0FBQ0EsYUFBS0MsR0FBTCxHQUFXQyxTQUFTQyxhQUFULENBQXVCLEtBQXZCLENBQVg7QUFDQSxhQUFLQyxNQUFMLEdBQWNKLFFBQVFJLE1BQXRCO0FBQ0EsYUFBS0MsUUFBTCxHQUFnQixFQUFoQjtBQUNBLGFBQUtDLFdBQUwsQ0FBaUJkLE9BQU9lLFNBQXhCO0FBQ0EsYUFBS04sR0FBTCxDQUFTTyxRQUFULEdBQW9CLENBQUMsQ0FBckI7QUFDSDs7QUFFRDs7OztBQUlBQyxXQUFPQyxRQUFQLEVBQ0E7QUFDSSxZQUFJQSxT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O0FBQ0EvRSxhQUFLWCxHQUFMLENBQVN5RixnQkFBVCxDQUEwQixNQUExQixFQUFrQyxNQUNsQztBQUNJLGdCQUFJOUUsS0FBS1ksT0FBVCxFQUNBO0FBQ0laLHFCQUFLc0QsUUFBTDtBQUNIO0FBQ0osU0FORDtBQU9BdEQsYUFBS3FFLDJCQUFMO0FBQ0g7O0FBRUQ7Ozs7QUFJQSxlQUFXdEYsZ0JBQVgsR0FDQTtBQUNJLGVBQU9BLGdCQUFQO0FBQ0g7O0FBRUQ7Ozs7QUFJQSxlQUFXSCxNQUFYLEdBQ0E7QUFDSSxlQUFPQSxNQUFQO0FBQ0g7O0FBRUQ7Ozs7QUFJQSxlQUFXRSxRQUFYLEdBQ0E7QUFDSSxlQUFPQSxRQUFQO0FBQ0g7QUE1ZEw7O0FBK2RBa0csT0FBT0MsT0FBUCxHQUFpQi9GLElBQWpCIiwiZmlsZSI6Im1lbnUuanMiLCJzb3VyY2VzQ29udGVudCI6WyJjb25zdCBDb25maWcgPSAgIHJlcXVpcmUoJy4vY29uZmlnJylcclxuY29uc3QgTWVudUl0ZW0gPSByZXF1aXJlKCcuL21lbnVJdGVtJylcclxuY29uc3QgTG9jYWxBY2NlbGVyYXRvciA9IHJlcXVpcmUoJy4vbG9jYWxBY2NlbGVyYXRvcicpXHJcbmNvbnN0IGh0bWwgPSByZXF1aXJlKCcuL2h0bWwnKVxyXG5cclxubGV0IF9hcHBsaWNhdGlvblxyXG5cclxuY2xhc3MgTWVudVxyXG57XHJcbiAgICAvKipcclxuICAgICAqIGNyZWF0ZXMgYSBtZW51IGJhclxyXG4gICAgICogQHBhcmFtIHtvYmplY3R9IFtvcHRpb25zXVxyXG4gICAgICogQHBhcmFtIHtvYmplY3R9IFtvcHRpb25zLnN0eWxlc10gYWRkaXRpb25hbCBDU1Mgc3R5bGVzIGZvciBtZW51XHJcbiAgICAgKi9cclxuICAgIGNvbnN0cnVjdG9yKG9wdGlvbnMpXHJcbiAgICB7XHJcbiAgICAgICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge31cclxuICAgICAgICB0aGlzLmRpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpXHJcbiAgICAgICAgdGhpcy5zdHlsZXMgPSBvcHRpb25zLnN0eWxlc1xyXG4gICAgICAgIHRoaXMuY2hpbGRyZW4gPSBbXVxyXG4gICAgICAgIHRoaXMuYXBwbHlDb25maWcoQ29uZmlnLk1lbnVTdHlsZSlcclxuICAgICAgICB0aGlzLmRpdi50YWJJbmRleCA9IC0xXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBhcHBlbmQgYSBNZW51SXRlbSB0byB0aGUgTWVudVxyXG4gICAgICogQHBhcmFtIHtNZW51SXRlbX0gbWVudUl0ZW1cclxuICAgICAqL1xyXG4gICAgYXBwZW5kKG1lbnVJdGVtKVxyXG4gICAge1xyXG4gICAgICAgIGlmIChtZW51SXRlbS5zdWJtZW51KVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgbWVudUl0ZW0uc3VibWVudS5tZW51ID0gdGhpc1xyXG4gICAgICAgIH1cclxuICAgICAgICBtZW51SXRlbS5tZW51ID0gdGhpc1xyXG4gICAgICAgIHRoaXMuZGl2LmFwcGVuZENoaWxkKG1lbnVJdGVtLmRpdilcclxuICAgICAgICBpZiAobWVudUl0ZW0udHlwZSAhPT0gJ3NlcGFyYXRvcicpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLmNoaWxkcmVuLnB1c2gobWVudUl0ZW0pXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogaW5zZXJ0cyBhIE1lbnVJdGVtIGludG8gdGhlIE1lbnVcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBwb3NcclxuICAgICAqIEBwYXJhbSB7TWVudUl0ZW19IG1lbnVJdGVtXHJcbiAgICAgKi9cclxuICAgIGluc2VydChwb3MsIG1lbnVJdGVtKVxyXG4gICAge1xyXG4gICAgICAgIGlmIChwb3MgPj0gdGhpcy5kaXYuY2hpbGROb2Rlcy5sZW5ndGgpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLmFwcGVuZChtZW51SXRlbSlcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgaWYgKG1lbnVJdGVtLnN1Ym1lbnUpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIG1lbnVJdGVtLnN1Ym1lbnUubWVudSA9IHRoaXNcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBtZW51SXRlbS5tZW51ID0gdGhpc1xyXG4gICAgICAgICAgICB0aGlzLmRpdi5pbnNlcnRCZWZvcmUobWVudUl0ZW0uZGl2LCB0aGlzLmRpdi5jaGlsZE5vZGVzW3Bvc10pXHJcbiAgICAgICAgICAgIGlmIChtZW51SXRlbS50eXBlICE9PSAnc2VwYXJhdG9yJylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jaGlsZHJlbi5zcGxpY2UocG9zLCAwLCBtZW51SXRlbSlcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBoaWRlKClcclxuICAgIHtcclxuICAgICAgICBsZXQgY3VycmVudCA9IHRoaXMubWVudS5zaG93aW5nXHJcbiAgICAgICAgd2hpbGUgKGN1cnJlbnQgJiYgY3VycmVudC5zdWJtZW51KVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgY3VycmVudC5kaXYuc3R5bGUuYmFja2dyb3VuZENvbG9yID0gJ3RyYW5zcGFyZW50J1xyXG4gICAgICAgICAgICBjdXJyZW50LnN1Ym1lbnUuZGl2LnJlbW92ZSgpXHJcbiAgICAgICAgICAgIGxldCBuZXh0ID0gY3VycmVudC5zdWJtZW51LnNob3dpbmdcclxuICAgICAgICAgICAgaWYgKG5leHQpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGN1cnJlbnQuc3VibWVudS5zaG93aW5nLmRpdi5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSAndHJhbnNwYXJlbnQnXHJcbiAgICAgICAgICAgICAgICBjdXJyZW50LnN1Ym1lbnUuc2hvd2luZyA9IG51bGxcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjdXJyZW50ID0gbmV4dFxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBzaG93KG1lbnVJdGVtKVxyXG4gICAge1xyXG4gICAgICAgIE1lbnUuTG9jYWxBY2NlbGVyYXRvci51bnJlZ2lzdGVyTWVudVNob3J0Y3V0cygpXHJcbiAgICAgICAgaWYgKHRoaXMubWVudSAmJiB0aGlzLm1lbnUuc2hvd2luZyA9PT0gbWVudUl0ZW0pXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLmhpZGUoKVxyXG4gICAgICAgICAgICB0aGlzLm1lbnUuc2hvd2luZyA9IG51bGxcclxuICAgICAgICAgICAgdGhpcy5kaXYucmVtb3ZlKClcclxuICAgICAgICAgICAgdGhpcy5tZW51LnNob3dBY2NlbGVyYXRvcnMoKVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5tZW51KVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5tZW51LnNob3dpbmcgJiYgdGhpcy5tZW51LmNoaWxkcmVuLmluZGV4T2YobWVudUl0ZW0pICE9PSAtMSlcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmhpZGUoKVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgdGhpcy5tZW51LnNob3dpbmcgPSBtZW51SXRlbVxyXG4gICAgICAgICAgICAgICAgdGhpcy5tZW51LmhpZGVBY2NlbGVyYXRvcnMoKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNvbnN0IGRpdiA9IG1lbnVJdGVtLmRpdlxyXG4gICAgICAgICAgICBjb25zdCBwYXJlbnQgPSB0aGlzLm1lbnUuZGl2XHJcbiAgICAgICAgICAgIGlmICh0aGlzLm1lbnUuYXBwbGljYXRpb25NZW51KVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRpdi5zdHlsZS5sZWZ0ID0gZGl2Lm9mZnNldExlZnQgKyAncHgnXHJcbiAgICAgICAgICAgICAgICB0aGlzLmRpdi5zdHlsZS50b3AgPSBkaXYub2Zmc2V0VG9wICsgZGl2Lm9mZnNldEhlaWdodCArICdweCdcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGl2LnN0eWxlLmxlZnQgPSBwYXJlbnQub2Zmc2V0TGVmdCArIHBhcmVudC5vZmZzZXRXaWR0aCAtIENvbmZpZy5PdmVybGFwICsgJ3B4J1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kaXYuc3R5bGUudG9wID0gcGFyZW50Lm9mZnNldFRvcCArIGRpdi5vZmZzZXRUb3AgLSBDb25maWcuT3ZlcmxhcCArICdweCdcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLmF0dGFjaGVkID0gbWVudUl0ZW1cclxuICAgICAgICAgICAgdGhpcy5zaG93QWNjZWxlcmF0b3JzKClcclxuICAgICAgICAgICAgdGhpcy5nZXRBcHBsaWNhdGlvbkRpdigpLmFwcGVuZENoaWxkKHRoaXMuZGl2KVxyXG4gICAgICAgICAgICBsZXQgbGFiZWwgPSAwLCBhY2NlbGVyYXRvciA9IDAsIGFycm93ID0gMCwgY2hlY2tlZCA9IDBcclxuICAgICAgICAgICAgZm9yIChsZXQgY2hpbGQgb2YgdGhpcy5jaGlsZHJlbilcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgY2hpbGQuY2hlY2suc3R5bGUud2lkdGggPSAnYXV0bydcclxuICAgICAgICAgICAgICAgIGNoaWxkLmxhYmVsLnN0eWxlLndpZHRoID0gJ2F1dG8nXHJcbiAgICAgICAgICAgICAgICBjaGlsZC5hY2NlbGVyYXRvci5zdHlsZS53aWR0aCA9ICdhdXRvJ1xyXG4gICAgICAgICAgICAgICAgY2hpbGQuYXJyb3cuc3R5bGUud2lkdGggPSAnYXV0bydcclxuICAgICAgICAgICAgICAgIGlmIChjaGlsZC50eXBlID09PSAnY2hlY2tib3gnKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGNoZWNrZWQgPSBDb25maWcuTWluaW11bUNvbHVtbldpZHRoXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAoY2hpbGQuc3VibWVudSlcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBhcnJvdyA9IENvbmZpZy5NaW5pbXVtQ29sdW1uV2lkdGhcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBmb3IgKGxldCBjaGlsZCBvZiB0aGlzLmNoaWxkcmVuKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBjaGlsZExhYmVsID0gY2hpbGQubGFiZWwub2Zmc2V0V2lkdGggKiAyXHJcbiAgICAgICAgICAgICAgICBsYWJlbCA9IGNoaWxkTGFiZWwgPiBsYWJlbCA/IGNoaWxkTGFiZWwgOiBsYWJlbFxyXG4gICAgICAgICAgICAgICAgY29uc3QgY2hpbGRBY2NlbGVyYXRvciA9IGNoaWxkLmFjY2VsZXJhdG9yLm9mZnNldFdpZHRoXHJcbiAgICAgICAgICAgICAgICBhY2NlbGVyYXRvciA9IGNoaWxkQWNjZWxlcmF0b3IgPiBhY2NlbGVyYXRvciA/IGNoaWxkQWNjZWxlcmF0b3IgOiBhY2NlbGVyYXRvclxyXG4gICAgICAgICAgICAgICAgaWYgKGNoaWxkLnN1Ym1lbnUpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgYXJyb3cgPSBjaGlsZC5hcnJvdy5vZmZzZXRXaWR0aFxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGZvciAobGV0IGNoaWxkIG9mIHRoaXMuY2hpbGRyZW4pXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGNoaWxkLmNoZWNrLnN0eWxlLndpZHRoID0gY2hlY2tlZCArICdweCdcclxuICAgICAgICAgICAgICAgIGNoaWxkLmxhYmVsLnN0eWxlLndpZHRoID0gbGFiZWwgKyAncHgnXHJcbiAgICAgICAgICAgICAgICBjaGlsZC5hY2NlbGVyYXRvci5zdHlsZS53aWR0aCA9IGFjY2VsZXJhdG9yICsgJ3B4J1xyXG4gICAgICAgICAgICAgICAgY2hpbGQuYXJyb3cuc3R5bGUud2lkdGggPSBhcnJvdyArICdweCdcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAodGhpcy5kaXYub2Zmc2V0TGVmdCArIHRoaXMuZGl2Lm9mZnNldFdpZHRoID4gd2luZG93LmlubmVyV2lkdGgpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGl2LnN0eWxlLmxlZnQgPSB3aW5kb3cuaW5uZXJXaWR0aCAtIHRoaXMuZGl2Lm9mZnNldFdpZHRoICsgJ3B4J1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmRpdi5vZmZzZXRUb3AgKyB0aGlzLmRpdi5vZmZzZXRIZWlnaHQgPiB3aW5kb3cuaW5uZXJIZWlnaHQpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGl2LnN0eWxlLnRvcCA9IHdpbmRvdy5pbm5lckhlaWdodCAtIHRoaXMuZGl2Lm9mZnNldEhlaWdodCArICdweCdcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBfYXBwbGljYXRpb24ubWVudS5kaXYuZm9jdXMoKVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBhcHBseUNvbmZpZyhiYXNlKVxyXG4gICAge1xyXG4gICAgICAgIGNvbnN0IHN0eWxlcyA9IHt9XHJcbiAgICAgICAgZm9yIChsZXQgc3R5bGUgaW4gYmFzZSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHN0eWxlc1tzdHlsZV0gPSBiYXNlW3N0eWxlXVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodGhpcy5zdHlsZXMpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBmb3IgKGxldCBzdHlsZSBpbiB0aGlzLnN0eWxlcylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgc3R5bGVzW3N0eWxlXSA9IHRoaXMuc3R5bGVzW3N0eWxlXVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGZvciAobGV0IHN0eWxlIGluIHN0eWxlcylcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMuZGl2LnN0eWxlW3N0eWxlXSA9IHN0eWxlc1tzdHlsZV1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgc2hvd0FjY2VsZXJhdG9ycygpXHJcbiAgICB7XHJcbiAgICAgICAgZm9yIChsZXQgY2hpbGQgb2YgdGhpcy5jaGlsZHJlbilcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGNoaWxkLnNob3dTaG9ydGN1dCgpXHJcbiAgICAgICAgICAgIGlmIChjaGlsZC50eXBlICE9PSAnc2VwYXJhdG9yJylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgaW5kZXggPSBjaGlsZC50ZXh0LmluZGV4T2YoJyYnKVxyXG4gICAgICAgICAgICAgICAgaWYgKGluZGV4ICE9PSAtMSlcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBNZW51LkxvY2FsQWNjZWxlcmF0b3IucmVnaXN0ZXJNZW51U2hvcnRjdXQoY2hpbGQudGV4dFtpbmRleCArIDFdLCBjaGlsZClcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoIXRoaXMuYXBwbGljYXRpb25NZW51KVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgTWVudS5Mb2NhbEFjY2VsZXJhdG9yLnJlZ2lzdGVyTWVudVNwZWNpYWwodGhpcylcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgaGlkZUFjY2VsZXJhdG9ycygpXHJcbiAgICB7XHJcbiAgICAgICAgZm9yIChsZXQgY2hpbGQgb2YgdGhpcy5jaGlsZHJlbilcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGNoaWxkLmhpZGVTaG9ydGN1dCgpXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGNsb3NlQWxsKClcclxuICAgIHtcclxuICAgICAgICBNZW51LkxvY2FsQWNjZWxlcmF0b3IudW5yZWdpc3Rlck1lbnVTaG9ydGN1dHMoKVxyXG4gICAgICAgIGxldCBhcHBsaWNhdGlvbiA9IF9hcHBsaWNhdGlvbi5tZW51XHJcbiAgICAgICAgaWYgKGFwcGxpY2F0aW9uLnNob3dpbmcpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBsZXQgbWVudSA9IGFwcGxpY2F0aW9uXHJcbiAgICAgICAgICAgIHdoaWxlIChtZW51LnNob3dpbmcpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIG1lbnUgPSBtZW51LnNob3dpbmcuc3VibWVudVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHdoaWxlIChtZW51ICYmICFtZW51LmFwcGxpY2F0aW9uTWVudSlcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgaWYgKG1lbnUuc2hvd2luZylcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBtZW51LnNob3dpbmcuZGl2LnN0eWxlLmJhY2tncm91bmRDb2xvciA9ICd0cmFuc3BhcmVudCdcclxuICAgICAgICAgICAgICAgICAgICBtZW51LnNob3dpbmcgPSBudWxsXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBtZW51LmRpdi5yZW1vdmUoKVxyXG4gICAgICAgICAgICAgICAgbWVudSA9IG1lbnUubWVudVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChtZW51KVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBtZW51LnNob3dpbmcuZGl2LnN0eWxlLmJhY2tncm91bmQgPSAndHJhbnNwYXJlbnQnXHJcbiAgICAgICAgICAgICAgICBtZW51LnNob3dpbmcgPSBudWxsXHJcbiAgICAgICAgICAgICAgICBtZW51LmhpZGVBY2NlbGVyYXRvcnMoKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGdldEFwcGxpY2F0aW9uRGl2KClcclxuICAgIHtcclxuICAgICAgICByZXR1cm4gX2FwcGxpY2F0aW9uXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBtb3ZlIHNlbGVjdG9yIHRvIHRoZSBuZXh0IGNoaWxkIHBhbmVcclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBkaXJlY3Rpb24gKGxlZnQgb3IgcmlnaHQpXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICBtb3ZlQ2hpbGQoZGlyZWN0aW9uKVxyXG4gICAge1xyXG4gICAgICAgIGxldCBpbmRleFxyXG4gICAgICAgIGlmIChkaXJlY3Rpb24gPT09ICdsZWZ0JylcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGNvbnN0IHBhcmVudCA9IHRoaXMuc2VsZWN0b3IubWVudS5tZW51XHJcbiAgICAgICAgICAgIGluZGV4ID0gcGFyZW50LmNoaWxkcmVuLmluZGV4T2YocGFyZW50LnNob3dpbmcpXHJcbiAgICAgICAgICAgIGluZGV4LS1cclxuICAgICAgICAgICAgaW5kZXggPSAoaW5kZXggPCAwKSA/IHBhcmVudC5jaGlsZHJlbi5sZW5ndGggLSAxIDogaW5kZXhcclxuICAgICAgICAgICAgcGFyZW50LmNoaWxkcmVuW2luZGV4XS5oYW5kbGVDbGljaygpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2VcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGxldCBwYXJlbnQgPSB0aGlzLnNlbGVjdG9yLm1lbnUubWVudVxyXG4gICAgICAgICAgICBsZXQgc2VsZWN0b3IgPSBwYXJlbnQuc2hvd2luZ1xyXG4gICAgICAgICAgICB3aGlsZSAoIXBhcmVudC5hcHBsaWNhdGlvbk1lbnUpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHNlbGVjdG9yLmhhbmRsZUNsaWNrKClcclxuICAgICAgICAgICAgICAgIHNlbGVjdG9yLmRpdi5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSAndHJhbnNwYXJlbnQnXHJcbiAgICAgICAgICAgICAgICBwYXJlbnQgPSBwYXJlbnQubWVudVxyXG4gICAgICAgICAgICAgICAgc2VsZWN0b3IgPSBwYXJlbnQuc2hvd2luZ1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGluZGV4ID0gcGFyZW50LmNoaWxkcmVuLmluZGV4T2Yoc2VsZWN0b3IpXHJcbiAgICAgICAgICAgIGluZGV4KytcclxuICAgICAgICAgICAgaW5kZXggPSAoaW5kZXggPT09IHBhcmVudC5jaGlsZHJlbi5sZW5ndGgpID8gMCA6IGluZGV4XHJcbiAgICAgICAgICAgIHBhcmVudC5jaGlsZHJlbltpbmRleF0uaGFuZGxlQ2xpY2soKVxyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLnNlbGVjdG9yID0gbnVsbFxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogbW92ZSBzZWxlY3RvciByaWdodCBhbmQgbGVmdFxyXG4gICAgICogQHBhcmFtIHtNb3VzZUV2ZW50fSBlXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gZGlyZWN0aW9uXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICBob3Jpem9udGFsU2VsZWN0b3IoZSwgZGlyZWN0aW9uKVxyXG4gICAge1xyXG4gICAgICAgIGlmIChkaXJlY3Rpb24gPT09ICdyaWdodCcpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5zZWxlY3Rvci5zdWJtZW51KVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNlbGVjdG9yLmhhbmRsZUNsaWNrKGUpXHJcbiAgICAgICAgICAgICAgICB0aGlzLnNlbGVjdG9yLnN1Ym1lbnUuc2VsZWN0b3IgPSB0aGlzLnNlbGVjdG9yLnN1Ym1lbnUuY2hpbGRyZW5bMF1cclxuICAgICAgICAgICAgICAgIHRoaXMuc2VsZWN0b3Iuc3VibWVudS5zZWxlY3Rvci5kaXYuc3R5bGUuYmFja2dyb3VuZENvbG9yID0gQ29uZmlnLlNlbGVjdGVkQmFja2dyb3VuZFN0eWxlXHJcbiAgICAgICAgICAgICAgICB0aGlzLnNlbGVjdG9yID0gbnVsbFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5tb3ZlQ2hpbGQoZGlyZWN0aW9uKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKGRpcmVjdGlvbiA9PT0gJ2xlZnQnKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgaWYgKCF0aGlzLnNlbGVjdG9yLm1lbnUubWVudS5hcHBsaWNhdGlvbk1lbnUpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2VsZWN0b3IubWVudS5hdHRhY2hlZC5oYW5kbGVDbGljayhlKVxyXG4gICAgICAgICAgICAgICAgdGhpcy5zZWxlY3Rvci5tZW51Lm1lbnUuc2VsZWN0b3IgPSB0aGlzLnNlbGVjdG9yLm1lbnUuYXR0YWNoZWRcclxuICAgICAgICAgICAgICAgIHRoaXMuc2VsZWN0b3IgPSBudWxsXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLm1vdmVDaGlsZChkaXJlY3Rpb24pXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKVxyXG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogbW92ZSB0aGUgc2VsZWN0b3IgaW4gdGhlIG1lbnVcclxuICAgICAqIEBwYXJhbSB7S2V5Ym9hcmRFdmVudH0gZVxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGRpcmVjdGlvbiAobGVmdCwgcmlnaHQsIHVwLCBkb3duKVxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqL1xyXG4gICAgbW92ZShlLCBkaXJlY3Rpb24pXHJcbiAgICB7XHJcbiAgICAgICAgaWYgKHRoaXMuc2VsZWN0b3IpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLnNlbGVjdG9yLmRpdi5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSAndHJhbnNwYXJlbnQnXHJcbiAgICAgICAgICAgIGxldCBpbmRleCA9IHRoaXMuY2hpbGRyZW4uaW5kZXhPZih0aGlzLnNlbGVjdG9yKVxyXG4gICAgICAgICAgICBpZiAoZGlyZWN0aW9uID09PSAnZG93bicpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGluZGV4KytcclxuICAgICAgICAgICAgICAgIGluZGV4ID0gKGluZGV4ID09PSB0aGlzLmNoaWxkcmVuLmxlbmd0aCkgPyAwIDogaW5kZXhcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIGlmIChkaXJlY3Rpb24gPT09ICd1cCcpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGluZGV4LS1cclxuICAgICAgICAgICAgICAgIGluZGV4ID0gKGluZGV4IDwgMCkgPyB0aGlzLmNoaWxkcmVuLmxlbmd0aCAtIDEgOiBpbmRleFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuaG9yaXpvbnRhbFNlbGVjdG9yKGUsIGRpcmVjdGlvbilcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLnNlbGVjdG9yID0gdGhpcy5jaGlsZHJlbltpbmRleF1cclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgaWYgKGRpcmVjdGlvbiA9PT0gJ3VwJylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zZWxlY3RvciA9IHRoaXMuY2hpbGRyZW5bdGhpcy5jaGlsZHJlbi5sZW5ndGggLSAxXVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zZWxlY3RvciA9IHRoaXMuY2hpbGRyZW5bMF1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLnNlbGVjdG9yLmRpdi5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSBDb25maWcuU2VsZWN0ZWRCYWNrZ3JvdW5kU3R5bGVcclxuICAgICAgICBlLnByZXZlbnREZWZhdWx0KClcclxuICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBjbGljayB0aGUgc2VsZWN0b3Igd2l0aCBrZXlib2FyZFxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqL1xyXG4gICAgZW50ZXIoZSlcclxuICAgIHtcclxuICAgICAgICBpZiAodGhpcy5zZWxlY3RvcilcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMuc2VsZWN0b3IuaGFuZGxlQ2xpY2soZSlcclxuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXHJcbiAgICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKClcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBhcnJheSBjb250YWluaW5nIHRoZSBtZW51J3MgaXRlbXNcclxuICAgICAqIEBwcm9wZXJ0eSB7TWVudUl0ZW1zW119IGl0ZW1zXHJcbiAgICAgKiBAcmVhZG9ubHlcclxuICAgICAqL1xyXG4gICAgZ2V0IGl0ZW1zKClcclxuICAgIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5jaGlsZHJlblxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogc2hvdyBhcHBsaWNhdGlvbiBtZW51IGFjY2VsZXJhdG9ycyB3aGVuIGFsdCBpcyBwcmVzc2VkXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICBzaG93QXBwbGljYXRpb25BY2NlbGVyYXRvcnMoKVxyXG4gICAge1xyXG4gICAgICAgIHRoaXMuaGlkZUFjY2VsZXJhdG9ycygpXHJcbiAgICAgICAgTG9jYWxBY2NlbGVyYXRvci5yZWdpc3RlckFsdCgoKSA9PlxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgaWYgKCF0aGlzLnNob3dpbmcpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2hvd0FjY2VsZXJhdG9ycygpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LCAoKSA9PlxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5oaWRlQWNjZWxlcmF0b3JzKClcclxuICAgICAgICB9KVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogc2V0cyBhY3RpdmUgYXBwbGljYXRpb24gTWVudSAoYW5kIHJlbW92ZXMgYW55IGV4aXN0aW5nIGFwcGxpY2F0aW9uIG1lbnVzKVxyXG4gICAgICogQHBhcmFtIHtNZW51fSBtZW51XHJcbiAgICAgKi9cclxuICAgIHN0YXRpYyBzZXRBcHBsaWNhdGlvbk1lbnUobWVudSlcclxuICAgIHtcclxuICAgICAgICBMb2NhbEFjY2VsZXJhdG9yLmluaXQoKVxyXG4gICAgICAgIGlmIChfYXBwbGljYXRpb24pXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBfYXBwbGljYXRpb24ucmVtb3ZlKClcclxuICAgICAgICB9XHJcbiAgICAgICAgX2FwcGxpY2F0aW9uID0gaHRtbCh7IHBhcmVudDogZG9jdW1lbnQuYm9keSwgc3R5bGVzOiBDb25maWcuQXBwbGljYXRpb25Db250YWluZXJTdHlsZSB9KVxyXG4gICAgICAgIF9hcHBsaWNhdGlvbi5tZW51ID0gbWVudVxyXG4gICAgICAgIG1lbnUuYXBwbHlDb25maWcoQ29uZmlnLkFwcGxpY2F0aW9uTWVudVN0eWxlKVxyXG4gICAgICAgIGZvciAobGV0IGNoaWxkIG9mIG1lbnUuY2hpbGRyZW4pXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBjaGlsZC5hcHBseUNvbmZpZyhDb25maWcuQXBwbGljYXRpb25NZW51Um93U3R5bGUpXHJcbiAgICAgICAgICAgIGlmIChjaGlsZC5hcnJvdylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgY2hpbGQuYXJyb3cuc3R5bGUuZGlzcGxheSA9ICdub25lJ1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIG1lbnUuZGl2LmFwcGVuZENoaWxkKGNoaWxkLmRpdilcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIF9hcHBsaWNhdGlvbi5hcHBlbmRDaGlsZChtZW51LmRpdilcclxuICAgICAgICBtZW51LmFwcGxpY2F0aW9uTWVudSA9IHRydWVcclxuICAgICAgICBtZW51LmRpdi50YWJJbmRleCA9IC0xXHJcblxyXG4gICAgICAgIC8vIGRvbid0IGxldCBtZW51IGJhciBmb2N1cyB1bmxlc3Mgd2luZG93cyBhcmUgb3BlbiAodGhpcyBmaXhlcyBhIGZvY3VzIGJ1ZylcclxuICAgICAgICBtZW51LmRpdi5hZGRFdmVudExpc3RlbmVyKCdmb2N1cycsICgpID0+XHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBpZiAoIW1lbnUuc2hvd2luZylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgbWVudS5kaXYuYmx1cigpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KVxyXG5cclxuICAgICAgICAvLyBjbG9zZSBhbGwgd2luZG93cyBpZiBtZW51IGlzIG5vIGxvbmdlciB0aGUgZm9jdXNcclxuICAgICAgICBtZW51LmRpdi5hZGRFdmVudExpc3RlbmVyKCdibHVyJywgKCkgPT5cclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGlmIChtZW51LnNob3dpbmcpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIG1lbnUuY2xvc2VBbGwoKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSlcclxuICAgICAgICBtZW51LnNob3dBcHBsaWNhdGlvbkFjY2VsZXJhdG9ycygpXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBsb2NhbEFjY2VsZXJhdG9yIGRlZmluaXRpb25cclxuICAgICAqIEB0eXBlIHtBY2NlbGVyYXRvcn1cclxuICAgICAqL1xyXG4gICAgc3RhdGljIGdldCBMb2NhbEFjY2VsZXJhdG9yKClcclxuICAgIHtcclxuICAgICAgICByZXR1cm4gTG9jYWxBY2NlbGVyYXRvclxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogdXNlIHRoaXMgdG8gY2hhbmdlIHRoZSBkZWZhdWx0IENvbmZpZyBzZXR0aW5ncyBhY3Jvc3MgYWxsIG1lbnVzXHJcbiAgICAgKiBAdHlwZSB7Q29uZmlnfVxyXG4gICAgICovXHJcbiAgICBzdGF0aWMgZ2V0IENvbmZpZygpXHJcbiAgICB7XHJcbiAgICAgICAgcmV0dXJuIENvbmZpZ1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogTWVudUl0ZW0gZGVmaW5pdGlvblxyXG4gICAgICogQHR5cGUge01lbnVJdGVtfVxyXG4gICAgICovXHJcbiAgICBzdGF0aWMgZ2V0IE1lbnVJdGVtKClcclxuICAgIHtcclxuICAgICAgICByZXR1cm4gTWVudUl0ZW1cclxuICAgIH1cclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBNZW51Il19