const Config = require('./config');
const MenuItem = require('./menuItem');
const localAccelerator = require('./localAccelerator');
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
        Menu.localAccelerator.unregisterMenuShortcuts();
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
                    Menu.localAccelerator.registerMenuShortcut(child.text[index + 1], child);
                }
            }
        }
        if (!this.applicationMenu) {
            Menu.localAccelerator.registerMenuSpecial(this);
        }
    }

    hideAccelerators() {
        for (let child of this.children) {
            child.hideShortcut();
        }
    }

    closeAll() {
        Menu.localAccelerator.unregisterMenuShortcuts();
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
                menu.showAccelerators();
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
     * sets active application Menu (and removes any existing application menus)
     * @param {Menu} menu
     */
    static setApplicationMenu(menu) {
        localAccelerator.init();
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
        menu.showAccelerators();
    }

    /**
     * localAccelerator definition
     * @type {Accelerator}
     */
    static get localAccelerator() {
        return localAccelerator;
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9tZW51LmpzIl0sIm5hbWVzIjpbIkNvbmZpZyIsInJlcXVpcmUiLCJNZW51SXRlbSIsImxvY2FsQWNjZWxlcmF0b3IiLCJodG1sIiwiX2FwcGxpY2F0aW9uIiwiTWVudSIsImNvbnN0cnVjdG9yIiwib3B0aW9ucyIsImRpdiIsImRvY3VtZW50IiwiY3JlYXRlRWxlbWVudCIsInN0eWxlcyIsImNoaWxkcmVuIiwiYXBwbHlDb25maWciLCJNZW51U3R5bGUiLCJ0YWJJbmRleCIsImFwcGVuZCIsIm1lbnVJdGVtIiwic3VibWVudSIsIm1lbnUiLCJhcHBlbmRDaGlsZCIsInR5cGUiLCJwdXNoIiwiaW5zZXJ0IiwicG9zIiwiY2hpbGROb2RlcyIsImxlbmd0aCIsImluc2VydEJlZm9yZSIsInNwbGljZSIsImhpZGUiLCJjdXJyZW50Iiwic2hvd2luZyIsInN0eWxlIiwiYmFja2dyb3VuZENvbG9yIiwicmVtb3ZlIiwibmV4dCIsInNob3ciLCJ1bnJlZ2lzdGVyTWVudVNob3J0Y3V0cyIsInNob3dBY2NlbGVyYXRvcnMiLCJpbmRleE9mIiwiaGlkZUFjY2VsZXJhdG9ycyIsInBhcmVudCIsImFwcGxpY2F0aW9uTWVudSIsImxlZnQiLCJvZmZzZXRMZWZ0IiwidG9wIiwib2Zmc2V0VG9wIiwib2Zmc2V0SGVpZ2h0Iiwib2Zmc2V0V2lkdGgiLCJPdmVybGFwIiwiYXR0YWNoZWQiLCJnZXRBcHBsaWNhdGlvbkRpdiIsImxhYmVsIiwiYWNjZWxlcmF0b3IiLCJhcnJvdyIsImNoZWNrZWQiLCJjaGlsZCIsImNoZWNrIiwid2lkdGgiLCJNaW5pbXVtQ29sdW1uV2lkdGgiLCJjaGlsZExhYmVsIiwiY2hpbGRBY2NlbGVyYXRvciIsIndpbmRvdyIsImlubmVyV2lkdGgiLCJpbm5lckhlaWdodCIsImJhc2UiLCJzaG93U2hvcnRjdXQiLCJpbmRleCIsInRleHQiLCJyZWdpc3Rlck1lbnVTaG9ydGN1dCIsInJlZ2lzdGVyTWVudVNwZWNpYWwiLCJoaWRlU2hvcnRjdXQiLCJjbG9zZUFsbCIsImFwcGxpY2F0aW9uIiwiYmFja2dyb3VuZCIsIm1vdmVDaGlsZCIsImRpcmVjdGlvbiIsInNlbGVjdG9yIiwiaGFuZGxlQ2xpY2siLCJob3Jpem9udGFsU2VsZWN0b3IiLCJlIiwiU2VsZWN0ZWRCYWNrZ3JvdW5kU3R5bGUiLCJzdG9wUHJvcGFnYXRpb24iLCJwcmV2ZW50RGVmYXVsdCIsIm1vdmUiLCJlbnRlciIsIml0ZW1zIiwic2V0QXBwbGljYXRpb25NZW51IiwiaW5pdCIsImJvZHkiLCJBcHBsaWNhdGlvbkNvbnRhaW5lclN0eWxlIiwiQXBwbGljYXRpb25NZW51U3R5bGUiLCJBcHBsaWNhdGlvbk1lbnVSb3dTdHlsZSIsImRpc3BsYXkiLCJhZGRFdmVudExpc3RlbmVyIiwiYmx1ciIsIm1vZHVsZSIsImV4cG9ydHMiXSwibWFwcGluZ3MiOiJBQUFBLE1BQU1BLFNBQVdDLFFBQVEsVUFBUixDQUFqQjtBQUNBLE1BQU1DLFdBQVdELFFBQVEsWUFBUixDQUFqQjtBQUNBLE1BQU1FLG1CQUFtQkYsUUFBUSxvQkFBUixDQUF6QjtBQUNBLE1BQU1HLE9BQU9ILFFBQVEsUUFBUixDQUFiOztBQUVBLElBQUlJLFlBQUo7O0FBRUEsTUFBTUMsSUFBTixDQUNBO0FBQ0k7Ozs7O0FBS0FDLGdCQUFZQyxPQUFaLEVBQ0E7QUFDSUEsa0JBQVVBLFdBQVcsRUFBckI7QUFDQSxhQUFLQyxHQUFMLEdBQVdDLFNBQVNDLGFBQVQsQ0FBdUIsS0FBdkIsQ0FBWDtBQUNBLGFBQUtDLE1BQUwsR0FBY0osUUFBUUksTUFBdEI7QUFDQSxhQUFLQyxRQUFMLEdBQWdCLEVBQWhCO0FBQ0EsYUFBS0MsV0FBTCxDQUFpQmQsT0FBT2UsU0FBeEI7QUFDQSxhQUFLTixHQUFMLENBQVNPLFFBQVQsR0FBb0IsQ0FBQyxDQUFyQjtBQUNIOztBQUVEOzs7O0FBSUFDLFdBQU9DLFFBQVAsRUFDQTtBQUNJLFlBQUlBLFNBQVNDLE9BQWIsRUFDQTtBQUNJRCxxQkFBU0MsT0FBVCxDQUFpQkMsSUFBakIsR0FBd0Is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SSxlQUFPQSxRQUFQO0FBQ0g7QUF4Y0w7O0FBMmNBK0YsT0FBT0MsT0FBUCxHQUFpQjVGLElBQWpCIiwiZmlsZSI6Im1lbnUuanMiLCJzb3VyY2VzQ29udGVudCI6WyJjb25zdCBDb25maWcgPSAgIHJlcXVpcmUoJy4vY29uZmlnJylcclxuY29uc3QgTWVudUl0ZW0gPSByZXF1aXJlKCcuL21lbnVJdGVtJylcclxuY29uc3QgbG9jYWxBY2NlbGVyYXRvciA9IHJlcXVpcmUoJy4vbG9jYWxBY2NlbGVyYXRvcicpXHJcbmNvbnN0IGh0bWwgPSByZXF1aXJlKCcuL2h0bWwnKVxyXG5cclxubGV0IF9hcHBsaWNhdGlvblxyXG5cclxuY2xhc3MgTWVudVxyXG57XHJcbiAgICAvKipcclxuICAgICAqIGNyZWF0ZXMgYSBtZW51IGJhclxyXG4gICAgICogQHBhcmFtIHtvYmplY3R9IFtvcHRpb25zXVxyXG4gICAgICogQHBhcmFtIHtvYmplY3R9IFtvcHRpb25zLnN0eWxlc10gYWRkaXRpb25hbCBDU1Mgc3R5bGVzIGZvciBtZW51XHJcbiAgICAgKi9cclxuICAgIGNvbnN0cnVjdG9yKG9wdGlvbnMpXHJcbiAgICB7XHJcbiAgICAgICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge31cclxuICAgICAgICB0aGlzLmRpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpXHJcbiAgICAgICAgdGhpcy5zdHlsZXMgPSBvcHRpb25zLnN0eWxlc1xyXG4gICAgICAgIHRoaXMuY2hpbGRyZW4gPSBbXVxyXG4gICAgICAgIHRoaXMuYXBwbHlDb25maWcoQ29uZmlnLk1lbnVTdHlsZSlcclxuICAgICAgICB0aGlzLmRpdi50YWJJbmRleCA9IC0xXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBhcHBlbmQgYSBNZW51SXRlbSB0byB0aGUgTWVudVxyXG4gICAgICogQHBhcmFtIHtNZW51SXRlbX0gbWVudUl0ZW1cclxuICAgICAqL1xyXG4gICAgYXBwZW5kKG1lbnVJdGVtKVxyXG4gICAge1xyXG4gICAgICAgIGlmIChtZW51SXRlbS5zdWJtZW51KVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgbWVudUl0ZW0uc3VibWVudS5tZW51ID0gdGhpc1xyXG4gICAgICAgIH1cclxuICAgICAgICBtZW51SXRlbS5tZW51ID0gdGhpc1xyXG4gICAgICAgIHRoaXMuZGl2LmFwcGVuZENoaWxkKG1lbnVJdGVtLmRpdilcclxuICAgICAgICBpZiAobWVudUl0ZW0udHlwZSAhPT0gJ3NlcGFyYXRvcicpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLmNoaWxkcmVuLnB1c2gobWVudUl0ZW0pXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogaW5zZXJ0cyBhIE1lbnVJdGVtIGludG8gdGhlIE1lbnVcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBwb3NcclxuICAgICAqIEBwYXJhbSB7TWVudUl0ZW19IG1lbnVJdGVtXHJcbiAgICAgKi9cclxuICAgIGluc2VydChwb3MsIG1lbnVJdGVtKVxyXG4gICAge1xyXG4gICAgICAgIGlmIChwb3MgPj0gdGhpcy5kaXYuY2hpbGROb2Rlcy5sZW5ndGgpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLmFwcGVuZChtZW51SXRlbSlcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgaWYgKG1lbnVJdGVtLnN1Ym1lbnUpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIG1lbnVJdGVtLnN1Ym1lbnUubWVudSA9IHRoaXNcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBtZW51SXRlbS5tZW51ID0gdGhpc1xyXG4gICAgICAgICAgICB0aGlzLmRpdi5pbnNlcnRCZWZvcmUobWVudUl0ZW0uZGl2LCB0aGlzLmRpdi5jaGlsZE5vZGVzW3Bvc10pXHJcbiAgICAgICAgICAgIGlmIChtZW51SXRlbS50eXBlICE9PSAnc2VwYXJhdG9yJylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jaGlsZHJlbi5zcGxpY2UocG9zLCAwLCBtZW51SXRlbSlcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBoaWRlKClcclxuICAgIHtcclxuICAgICAgICBsZXQgY3VycmVudCA9IHRoaXMubWVudS5zaG93aW5nXHJcbiAgICAgICAgd2hpbGUgKGN1cnJlbnQgJiYgY3VycmVudC5zdWJtZW51KVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgY3VycmVudC5kaXYuc3R5bGUuYmFja2dyb3VuZENvbG9yID0gJ3RyYW5zcGFyZW50J1xyXG4gICAgICAgICAgICBjdXJyZW50LnN1Ym1lbnUuZGl2LnJlbW92ZSgpXHJcbiAgICAgICAgICAgIGxldCBuZXh0ID0gY3VycmVudC5zdWJtZW51LnNob3dpbmdcclxuICAgICAgICAgICAgaWYgKG5leHQpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGN1cnJlbnQuc3VibWVudS5zaG93aW5nLmRpdi5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSAndHJhbnNwYXJlbnQnXHJcbiAgICAgICAgICAgICAgICBjdXJyZW50LnN1Ym1lbnUuc2hvd2luZyA9IG51bGxcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjdXJyZW50ID0gbmV4dFxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBzaG93KG1lbnVJdGVtKVxyXG4gICAge1xyXG4gICAgICAgIE1lbnUubG9jYWxBY2NlbGVyYXRvci51bnJlZ2lzdGVyTWVudVNob3J0Y3V0cygpXHJcbiAgICAgICAgaWYgKHRoaXMubWVudSAmJiB0aGlzLm1lbnUuc2hvd2luZyA9PT0gbWVudUl0ZW0pXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLmhpZGUoKVxyXG4gICAgICAgICAgICB0aGlzLm1lbnUuc2hvd2luZyA9IG51bGxcclxuICAgICAgICAgICAgdGhpcy5kaXYucmVtb3ZlKClcclxuICAgICAgICAgICAgdGhpcy5tZW51LnNob3dBY2NlbGVyYXRvcnMoKVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5tZW51KVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5tZW51LnNob3dpbmcgJiYgdGhpcy5tZW51LmNoaWxkcmVuLmluZGV4T2YobWVudUl0ZW0pICE9PSAtMSlcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmhpZGUoKVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgdGhpcy5tZW51LnNob3dpbmcgPSBtZW51SXRlbVxyXG4gICAgICAgICAgICAgICAgdGhpcy5tZW51LmhpZGVBY2NlbGVyYXRvcnMoKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNvbnN0IGRpdiA9IG1lbnVJdGVtLmRpdlxyXG4gICAgICAgICAgICBjb25zdCBwYXJlbnQgPSB0aGlzLm1lbnUuZGl2XHJcbiAgICAgICAgICAgIGlmICh0aGlzLm1lbnUuYXBwbGljYXRpb25NZW51KVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRpdi5zdHlsZS5sZWZ0ID0gZGl2Lm9mZnNldExlZnQgKyAncHgnXHJcbiAgICAgICAgICAgICAgICB0aGlzLmRpdi5zdHlsZS50b3AgPSBkaXYub2Zmc2V0VG9wICsgZGl2Lm9mZnNldEhlaWdodCArICdweCdcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGl2LnN0eWxlLmxlZnQgPSBwYXJlbnQub2Zmc2V0TGVmdCArIHBhcmVudC5vZmZzZXRXaWR0aCAtIENvbmZpZy5PdmVybGFwICsgJ3B4J1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kaXYuc3R5bGUudG9wID0gcGFyZW50Lm9mZnNldFRvcCArIGRpdi5vZmZzZXRUb3AgLSBDb25maWcuT3ZlcmxhcCArICdweCdcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLmF0dGFjaGVkID0gbWVudUl0ZW1cclxuICAgICAgICAgICAgdGhpcy5zaG93QWNjZWxlcmF0b3JzKClcclxuICAgICAgICAgICAgdGhpcy5nZXRBcHBsaWNhdGlvbkRpdigpLmFwcGVuZENoaWxkKHRoaXMuZGl2KVxyXG4gICAgICAgICAgICBsZXQgbGFiZWwgPSAwLCBhY2NlbGVyYXRvciA9IDAsIGFycm93ID0gMCwgY2hlY2tlZCA9IDBcclxuICAgICAgICAgICAgZm9yIChsZXQgY2hpbGQgb2YgdGhpcy5jaGlsZHJlbilcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgY2hpbGQuY2hlY2suc3R5bGUud2lkdGggPSAnYXV0bydcclxuICAgICAgICAgICAgICAgIGNoaWxkLmxhYmVsLnN0eWxlLndpZHRoID0gJ2F1dG8nXHJcbiAgICAgICAgICAgICAgICBjaGlsZC5hY2NlbGVyYXRvci5zdHlsZS53aWR0aCA9ICdhdXRvJ1xyXG4gICAgICAgICAgICAgICAgY2hpbGQuYXJyb3cuc3R5bGUud2lkdGggPSAnYXV0bydcclxuICAgICAgICAgICAgICAgIGlmIChjaGlsZC50eXBlID09PSAnY2hlY2tib3gnKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGNoZWNrZWQgPSBDb25maWcuTWluaW11bUNvbHVtbldpZHRoXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAoY2hpbGQuc3VibWVudSlcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBhcnJvdyA9IENvbmZpZy5NaW5pbXVtQ29sdW1uV2lkdGhcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBmb3IgKGxldCBjaGlsZCBvZiB0aGlzLmNoaWxkcmVuKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBjaGlsZExhYmVsID0gY2hpbGQubGFiZWwub2Zmc2V0V2lkdGggKiAyXHJcbiAgICAgICAgICAgICAgICBsYWJlbCA9IGNoaWxkTGFiZWwgPiBsYWJlbCA/IGNoaWxkTGFiZWwgOiBsYWJlbFxyXG4gICAgICAgICAgICAgICAgY29uc3QgY2hpbGRBY2NlbGVyYXRvciA9IGNoaWxkLmFjY2VsZXJhdG9yLm9mZnNldFdpZHRoXHJcbiAgICAgICAgICAgICAgICBhY2NlbGVyYXRvciA9IGNoaWxkQWNjZWxlcmF0b3IgPiBhY2NlbGVyYXRvciA/IGNoaWxkQWNjZWxlcmF0b3IgOiBhY2NlbGVyYXRvclxyXG4gICAgICAgICAgICAgICAgaWYgKGNoaWxkLnN1Ym1lbnUpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgYXJyb3cgPSBjaGlsZC5hcnJvdy5vZmZzZXRXaWR0aFxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGZvciAobGV0IGNoaWxkIG9mIHRoaXMuY2hpbGRyZW4pXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGNoaWxkLmNoZWNrLnN0eWxlLndpZHRoID0gY2hlY2tlZCArICdweCdcclxuICAgICAgICAgICAgICAgIGNoaWxkLmxhYmVsLnN0eWxlLndpZHRoID0gbGFiZWwgKyAncHgnXHJcbiAgICAgICAgICAgICAgICBjaGlsZC5hY2NlbGVyYXRvci5zdHlsZS53aWR0aCA9IGFjY2VsZXJhdG9yICsgJ3B4J1xyXG4gICAgICAgICAgICAgICAgY2hpbGQuYXJyb3cuc3R5bGUud2lkdGggPSBhcnJvdyArICdweCdcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAodGhpcy5kaXYub2Zmc2V0TGVmdCArIHRoaXMuZGl2Lm9mZnNldFdpZHRoID4gd2luZG93LmlubmVyV2lkdGgpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGl2LnN0eWxlLmxlZnQgPSB3aW5kb3cuaW5uZXJXaWR0aCAtIHRoaXMuZGl2Lm9mZnNldFdpZHRoICsgJ3B4J1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmRpdi5vZmZzZXRUb3AgKyB0aGlzLmRpdi5vZmZzZXRIZWlnaHQgPiB3aW5kb3cuaW5uZXJIZWlnaHQpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGl2LnN0eWxlLnRvcCA9IHdpbmRvdy5pbm5lckhlaWdodCAtIHRoaXMuZGl2Lm9mZnNldEhlaWdodCArICdweCdcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBhcHBseUNvbmZpZyhiYXNlKVxyXG4gICAge1xyXG4gICAgICAgIGNvbnN0IHN0eWxlcyA9IHt9XHJcbiAgICAgICAgZm9yIChsZXQgc3R5bGUgaW4gYmFzZSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHN0eWxlc1tzdHlsZV0gPSBiYXNlW3N0eWxlXVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodGhpcy5zdHlsZXMpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBmb3IgKGxldCBzdHlsZSBpbiB0aGlzLnN0eWxlcylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgc3R5bGVzW3N0eWxlXSA9IHRoaXMuc3R5bGVzW3N0eWxlXVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGZvciAobGV0IHN0eWxlIGluIHN0eWxlcylcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMuZGl2LnN0eWxlW3N0eWxlXSA9IHN0eWxlc1tzdHlsZV1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgc2hvd0FjY2VsZXJhdG9ycygpXHJcbiAgICB7XHJcbiAgICAgICAgZm9yIChsZXQgY2hpbGQgb2YgdGhpcy5jaGlsZHJlbilcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGNoaWxkLnNob3dTaG9ydGN1dCgpXHJcbiAgICAgICAgICAgIGlmIChjaGlsZC50eXBlICE9PSAnc2VwYXJhdG9yJylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgaW5kZXggPSBjaGlsZC50ZXh0LmluZGV4T2YoJyYnKVxyXG4gICAgICAgICAgICAgICAgaWYgKGluZGV4ICE9PSAtMSlcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBNZW51LmxvY2FsQWNjZWxlcmF0b3IucmVnaXN0ZXJNZW51U2hvcnRjdXQoY2hpbGQudGV4dFtpbmRleCArIDFdLCBjaGlsZClcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoIXRoaXMuYXBwbGljYXRpb25NZW51KVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgTWVudS5sb2NhbEFjY2VsZXJhdG9yLnJlZ2lzdGVyTWVudVNwZWNpYWwodGhpcylcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgaGlkZUFjY2VsZXJhdG9ycygpXHJcbiAgICB7XHJcbiAgICAgICAgZm9yIChsZXQgY2hpbGQgb2YgdGhpcy5jaGlsZHJlbilcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGNoaWxkLmhpZGVTaG9ydGN1dCgpXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGNsb3NlQWxsKClcclxuICAgIHtcclxuICAgICAgICBNZW51LmxvY2FsQWNjZWxlcmF0b3IudW5yZWdpc3Rlck1lbnVTaG9ydGN1dHMoKVxyXG4gICAgICAgIGxldCBhcHBsaWNhdGlvbiA9IF9hcHBsaWNhdGlvbi5tZW51XHJcbiAgICAgICAgaWYgKGFwcGxpY2F0aW9uLnNob3dpbmcpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBsZXQgbWVudSA9IGFwcGxpY2F0aW9uXHJcbiAgICAgICAgICAgIHdoaWxlIChtZW51LnNob3dpbmcpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIG1lbnUgPSBtZW51LnNob3dpbmcuc3VibWVudVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHdoaWxlIChtZW51ICYmICFtZW51LmFwcGxpY2F0aW9uTWVudSlcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgaWYgKG1lbnUuc2hvd2luZylcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBtZW51LnNob3dpbmcuZGl2LnN0eWxlLmJhY2tncm91bmRDb2xvciA9ICd0cmFuc3BhcmVudCdcclxuICAgICAgICAgICAgICAgICAgICBtZW51LnNob3dpbmcgPSBudWxsXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBtZW51LmRpdi5yZW1vdmUoKVxyXG4gICAgICAgICAgICAgICAgbWVudSA9IG1lbnUubWVudVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChtZW51KVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBtZW51LnNob3dpbmcuZGl2LnN0eWxlLmJhY2tncm91bmQgPSAndHJhbnNwYXJlbnQnXHJcbiAgICAgICAgICAgICAgICBtZW51LnNob3dpbmcgPSBudWxsXHJcbiAgICAgICAgICAgICAgICBtZW51LnNob3dBY2NlbGVyYXRvcnMoKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGdldEFwcGxpY2F0aW9uRGl2KClcclxuICAgIHtcclxuICAgICAgICByZXR1cm4gX2FwcGxpY2F0aW9uXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBtb3ZlIHNlbGVjdG9yIHRvIHRoZSBuZXh0IGNoaWxkIHBhbmVcclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBkaXJlY3Rpb24gKGxlZnQgb3IgcmlnaHQpXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICBtb3ZlQ2hpbGQoZGlyZWN0aW9uKVxyXG4gICAge1xyXG4gICAgICAgIGxldCBpbmRleFxyXG4gICAgICAgIGlmIChkaXJlY3Rpb24gPT09ICdsZWZ0JylcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGNvbnN0IHBhcmVudCA9IHRoaXMuc2VsZWN0b3IubWVudS5tZW51XHJcbiAgICAgICAgICAgIGluZGV4ID0gcGFyZW50LmNoaWxkcmVuLmluZGV4T2YocGFyZW50LnNob3dpbmcpXHJcbiAgICAgICAgICAgIGluZGV4LS1cclxuICAgICAgICAgICAgaW5kZXggPSAoaW5kZXggPCAwKSA/IHBhcmVudC5jaGlsZHJlbi5sZW5ndGggLSAxIDogaW5kZXhcclxuICAgICAgICAgICAgcGFyZW50LmNoaWxkcmVuW2luZGV4XS5oYW5kbGVDbGljaygpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2VcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGxldCBwYXJlbnQgPSB0aGlzLnNlbGVjdG9yLm1lbnUubWVudVxyXG4gICAgICAgICAgICBsZXQgc2VsZWN0b3IgPSBwYXJlbnQuc2hvd2luZ1xyXG4gICAgICAgICAgICB3aGlsZSAoIXBhcmVudC5hcHBsaWNhdGlvbk1lbnUpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHNlbGVjdG9yLmhhbmRsZUNsaWNrKClcclxuICAgICAgICAgICAgICAgIHNlbGVjdG9yLmRpdi5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSAndHJhbnNwYXJlbnQnXHJcbiAgICAgICAgICAgICAgICBwYXJlbnQgPSBwYXJlbnQubWVudVxyXG4gICAgICAgICAgICAgICAgc2VsZWN0b3IgPSBwYXJlbnQuc2hvd2luZ1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGluZGV4ID0gcGFyZW50LmNoaWxkcmVuLmluZGV4T2Yoc2VsZWN0b3IpXHJcbiAgICAgICAgICAgIGluZGV4KytcclxuICAgICAgICAgICAgaW5kZXggPSAoaW5kZXggPT09IHBhcmVudC5jaGlsZHJlbi5sZW5ndGgpID8gMCA6IGluZGV4XHJcbiAgICAgICAgICAgIHBhcmVudC5jaGlsZHJlbltpbmRleF0uaGFuZGxlQ2xpY2soKVxyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLnNlbGVjdG9yID0gbnVsbFxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogbW92ZSBzZWxlY3RvciByaWdodCBhbmQgbGVmdFxyXG4gICAgICogQHBhcmFtIHtNb3VzZUV2ZW50fSBlXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gZGlyZWN0aW9uXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICBob3Jpem9udGFsU2VsZWN0b3IoZSwgZGlyZWN0aW9uKVxyXG4gICAge1xyXG4gICAgICAgIGlmIChkaXJlY3Rpb24gPT09ICdyaWdodCcpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5zZWxlY3Rvci5zdWJtZW51KVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNlbGVjdG9yLmhhbmRsZUNsaWNrKGUpXHJcbiAgICAgICAgICAgICAgICB0aGlzLnNlbGVjdG9yLnN1Ym1lbnUuc2VsZWN0b3IgPSB0aGlzLnNlbGVjdG9yLnN1Ym1lbnUuY2hpbGRyZW5bMF1cclxuICAgICAgICAgICAgICAgIHRoaXMuc2VsZWN0b3Iuc3VibWVudS5zZWxlY3Rvci5kaXYuc3R5bGUuYmFja2dyb3VuZENvbG9yID0gQ29uZmlnLlNlbGVjdGVkQmFja2dyb3VuZFN0eWxlXHJcbiAgICAgICAgICAgICAgICB0aGlzLnNlbGVjdG9yID0gbnVsbFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5tb3ZlQ2hpbGQoZGlyZWN0aW9uKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKGRpcmVjdGlvbiA9PT0gJ2xlZnQnKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgaWYgKCF0aGlzLnNlbGVjdG9yLm1lbnUubWVudS5hcHBsaWNhdGlvbk1lbnUpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2VsZWN0b3IubWVudS5hdHRhY2hlZC5oYW5kbGVDbGljayhlKVxyXG4gICAgICAgICAgICAgICAgdGhpcy5zZWxlY3Rvci5tZW51Lm1lbnUuc2VsZWN0b3IgPSB0aGlzLnNlbGVjdG9yLm1lbnUuYXR0YWNoZWRcclxuICAgICAgICAgICAgICAgIHRoaXMuc2VsZWN0b3IgPSBudWxsXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLm1vdmVDaGlsZChkaXJlY3Rpb24pXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKVxyXG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogbW92ZSB0aGUgc2VsZWN0b3IgaW4gdGhlIG1lbnVcclxuICAgICAqIEBwYXJhbSB7S2V5Ym9hcmRFdmVudH0gZVxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGRpcmVjdGlvbiAobGVmdCwgcmlnaHQsIHVwLCBkb3duKVxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqL1xyXG4gICAgbW92ZShlLCBkaXJlY3Rpb24pXHJcbiAgICB7XHJcbiAgICAgICAgaWYgKHRoaXMuc2VsZWN0b3IpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLnNlbGVjdG9yLmRpdi5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSAndHJhbnNwYXJlbnQnXHJcbiAgICAgICAgICAgIGxldCBpbmRleCA9IHRoaXMuY2hpbGRyZW4uaW5kZXhPZih0aGlzLnNlbGVjdG9yKVxyXG4gICAgICAgICAgICBpZiAoZGlyZWN0aW9uID09PSAnZG93bicpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGluZGV4KytcclxuICAgICAgICAgICAgICAgIGluZGV4ID0gKGluZGV4ID09PSB0aGlzLmNoaWxkcmVuLmxlbmd0aCkgPyAwIDogaW5kZXhcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIGlmIChkaXJlY3Rpb24gPT09ICd1cCcpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGluZGV4LS1cclxuICAgICAgICAgICAgICAgIGluZGV4ID0gKGluZGV4IDwgMCkgPyB0aGlzLmNoaWxkcmVuLmxlbmd0aCAtIDEgOiBpbmRleFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuaG9yaXpvbnRhbFNlbGVjdG9yKGUsIGRpcmVjdGlvbilcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLnNlbGVjdG9yID0gdGhpcy5jaGlsZHJlbltpbmRleF1cclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgaWYgKGRpcmVjdGlvbiA9PT0gJ3VwJylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zZWxlY3RvciA9IHRoaXMuY2hpbGRyZW5bdGhpcy5jaGlsZHJlbi5sZW5ndGggLSAxXVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zZWxlY3RvciA9IHRoaXMuY2hpbGRyZW5bMF1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLnNlbGVjdG9yLmRpdi5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSBDb25maWcuU2VsZWN0ZWRCYWNrZ3JvdW5kU3R5bGVcclxuICAgICAgICBlLnByZXZlbnREZWZhdWx0KClcclxuICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBjbGljayB0aGUgc2VsZWN0b3Igd2l0aCBrZXlib2FyZFxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqL1xyXG4gICAgZW50ZXIoZSlcclxuICAgIHtcclxuICAgICAgICBpZiAodGhpcy5zZWxlY3RvcilcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMuc2VsZWN0b3IuaGFuZGxlQ2xpY2soZSlcclxuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXHJcbiAgICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKClcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBhcnJheSBjb250YWluaW5nIHRoZSBtZW51J3MgaXRlbXNcclxuICAgICAqIEBwcm9wZXJ0eSB7TWVudUl0ZW1zW119IGl0ZW1zXHJcbiAgICAgKiBAcmVhZG9ubHlcclxuICAgICAqL1xyXG4gICAgZ2V0IGl0ZW1zKClcclxuICAgIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5jaGlsZHJlblxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogc2V0cyBhY3RpdmUgYXBwbGljYXRpb24gTWVudSAoYW5kIHJlbW92ZXMgYW55IGV4aXN0aW5nIGFwcGxpY2F0aW9uIG1lbnVzKVxyXG4gICAgICogQHBhcmFtIHtNZW51fSBtZW51XHJcbiAgICAgKi9cclxuICAgIHN0YXRpYyBzZXRBcHBsaWNhdGlvbk1lbnUobWVudSlcclxuICAgIHtcclxuICAgICAgICBsb2NhbEFjY2VsZXJhdG9yLmluaXQoKVxyXG4gICAgICAgIGlmIChfYXBwbGljYXRpb24pXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBfYXBwbGljYXRpb24ucmVtb3ZlKClcclxuICAgICAgICB9XHJcbiAgICAgICAgX2FwcGxpY2F0aW9uID0gaHRtbCh7IHBhcmVudDogZG9jdW1lbnQuYm9keSwgc3R5bGVzOiBDb25maWcuQXBwbGljYXRpb25Db250YWluZXJTdHlsZSB9KVxyXG4gICAgICAgIF9hcHBsaWNhdGlvbi5tZW51ID0gbWVudVxyXG4gICAgICAgIG1lbnUuYXBwbHlDb25maWcoQ29uZmlnLkFwcGxpY2F0aW9uTWVudVN0eWxlKVxyXG4gICAgICAgIGZvciAobGV0IGNoaWxkIG9mIG1lbnUuY2hpbGRyZW4pXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBjaGlsZC5hcHBseUNvbmZpZyhDb25maWcuQXBwbGljYXRpb25NZW51Um93U3R5bGUpXHJcbiAgICAgICAgICAgIGlmIChjaGlsZC5hcnJvdylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgY2hpbGQuYXJyb3cuc3R5bGUuZGlzcGxheSA9ICdub25lJ1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIG1lbnUuZGl2LmFwcGVuZENoaWxkKGNoaWxkLmRpdilcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIF9hcHBsaWNhdGlvbi5hcHBlbmRDaGlsZChtZW51LmRpdilcclxuICAgICAgICBtZW51LmFwcGxpY2F0aW9uTWVudSA9IHRydWVcclxuICAgICAgICBtZW51LmRpdi50YWJJbmRleCA9IC0xXHJcblxyXG4gICAgICAgIC8vIGRvbid0IGxldCBtZW51IGJhciBmb2N1cyB1bmxlc3Mgd2luZG93cyBhcmUgb3BlbiAodGhpcyBmaXhlcyBhIGZvY3VzIGJ1ZylcclxuICAgICAgICBtZW51LmRpdi5hZGRFdmVudExpc3RlbmVyKCdmb2N1cycsICgpID0+XHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBpZiAoIW1lbnUuc2hvd2luZylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgbWVudS5kaXYuYmx1cigpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KVxyXG5cclxuICAgICAgICAvLyBjbG9zZSBhbGwgd2luZG93cyBpZiBtZW51IGlzIG5vIGxvbmdlciB0aGUgZm9jdXNcclxuICAgICAgICBtZW51LmRpdi5hZGRFdmVudExpc3RlbmVyKCdibHVyJywgKCkgPT5cclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGlmIChtZW51LnNob3dpbmcpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIG1lbnUuY2xvc2VBbGwoKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSlcclxuICAgICAgICBtZW51LnNob3dBY2NlbGVyYXRvcnMoKVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogbG9jYWxBY2NlbGVyYXRvciBkZWZpbml0aW9uXHJcbiAgICAgKiBAdHlwZSB7QWNjZWxlcmF0b3J9XHJcbiAgICAgKi9cclxuICAgIHN0YXRpYyBnZXQgbG9jYWxBY2NlbGVyYXRvcigpXHJcbiAgICB7XHJcbiAgICAgICAgcmV0dXJuIGxvY2FsQWNjZWxlcmF0b3JcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIHVzZSB0aGlzIHRvIGNoYW5nZSB0aGUgZGVmYXVsdCBDb25maWcgc2V0dGluZ3MgYWNyb3NzIGFsbCBtZW51c1xyXG4gICAgICogQHR5cGUge0NvbmZpZ31cclxuICAgICAqL1xyXG4gICAgc3RhdGljIGdldCBDb25maWcoKVxyXG4gICAge1xyXG4gICAgICAgIHJldHVybiBDb25maWdcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIE1lbnVJdGVtIGRlZmluaXRpb25cclxuICAgICAqIEB0eXBlIHtNZW51SXRlbX1cclxuICAgICAqL1xyXG4gICAgc3RhdGljIGdldCBNZW51SXRlbSgpXHJcbiAgICB7XHJcbiAgICAgICAgcmV0dXJuIE1lbnVJdGVtXHJcbiAgICB9XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gTWVudSJdfQ==