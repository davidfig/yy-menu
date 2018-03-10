const Config = require('./config');
const MenuItem = require('./menuItem');
const GlobalAccelerator = require('./globalAccelerator');
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
        Menu.GlobalAccelerator.unregisterMenuShortcuts();
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
                    Menu.GlobalAccelerator.registerMenuShortcut(child.text[index + 1], child);
                }
            }
        }
        if (!this.applicationMenu) {
            Menu.GlobalAccelerator.registerMenuSpecial(this);
        }
    }

    hideAccelerators() {
        for (let child of this.children) {
            child.hideShortcut();
        }
    }

    closeAll() {
        Menu.GlobalAccelerator.unregisterMenuShortcuts();
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
        GlobalAccelerator.init();
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
     * GlobalAccelerator definition
     * @type {Accelerator}
     */
    static get GlobalAccelerator() {
        return GlobalAccelerator;
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9tZW51LmpzIl0sIm5hbWVzIjpbIkNvbmZpZyIsInJlcXVpcmUiLCJNZW51SXRlbSIsIkdsb2JhbEFjY2VsZXJhdG9yIiwiaHRtbCIsIl9hcHBsaWNhdGlvbiIsIk1lbnUiLCJjb25zdHJ1Y3RvciIsIm9wdGlvbnMiLCJkaXYiLCJkb2N1bWVudCIsImNyZWF0ZUVsZW1lbnQiLCJzdHlsZXMiLCJjaGlsZHJlbiIsImFwcGx5Q29uZmlnIiwiTWVudVN0eWxlIiwidGFiSW5kZXgiLCJhcHBlbmQiLCJtZW51SXRlbSIsInN1Ym1lbnUiLCJtZW51IiwiYXBwZW5kQ2hpbGQiLCJ0eXBlIiwicHVzaCIsImluc2VydCIsInBvcyIsImNoaWxkTm9kZXMiLCJsZW5ndGgiLCJpbnNlcnRCZWZvcmUiLCJzcGxpY2UiLCJoaWRlIiwiY3VycmVudCIsInNob3dpbmciLCJzdHlsZSIsImJhY2tncm91bmRDb2xvciIsInJlbW92ZSIsIm5leHQiLCJzaG93IiwidW5yZWdpc3Rlck1lbnVTaG9ydGN1dHMiLCJzaG93QWNjZWxlcmF0b3JzIiwiaW5kZXhPZiIsImhpZGVBY2NlbGVyYXRvcnMiLCJwYXJlbnQiLCJhcHBsaWNhdGlvbk1lbnUiLCJsZWZ0Iiwib2Zmc2V0TGVmdCIsInRvcCIsIm9mZnNldFRvcCIsIm9mZnNldEhlaWdodCIsIm9mZnNldFdpZHRoIiwiT3ZlcmxhcCIsImF0dGFjaGVkIiwiZ2V0QXBwbGljYXRpb25EaXYiLCJsYWJlbCIsImFjY2VsZXJhdG9yIiwiYXJyb3ciLCJjaGVja2VkIiwiY2hpbGQiLCJjaGVjayIsIndpZHRoIiwiTWluaW11bUNvbHVtbldpZHRoIiwiY2hpbGRMYWJlbCIsImNoaWxkQWNjZWxlcmF0b3IiLCJ3aW5kb3ciLCJpbm5lcldpZHRoIiwiaW5uZXJIZWlnaHQiLCJiYXNlIiwic2hvd1Nob3J0Y3V0IiwiaW5kZXgiLCJ0ZXh0IiwicmVnaXN0ZXJNZW51U2hvcnRjdXQiLCJyZWdpc3Rlck1lbnVTcGVjaWFsIiwiaGlkZVNob3J0Y3V0IiwiY2xvc2VBbGwiLCJhcHBsaWNhdGlvbiIsImJhY2tncm91bmQiLCJtb3ZlQ2hpbGQiLCJkaXJlY3Rpb24iLCJzZWxlY3RvciIsImhhbmRsZUNsaWNrIiwiaG9yaXpvbnRhbFNlbGVjdG9yIiwiZSIsIlNlbGVjdGVkQmFja2dyb3VuZFN0eWxlIiwic3RvcFByb3BhZ2F0aW9uIiwicHJldmVudERlZmF1bHQiLCJtb3ZlIiwiZW50ZXIiLCJpdGVtcyIsInNldEFwcGxpY2F0aW9uTWVudSIsImluaXQiLCJib2R5IiwiQXBwbGljYXRpb25Db250YWluZXJTdHlsZSIsIkFwcGxpY2F0aW9uTWVudVN0eWxlIiwiQXBwbGljYXRpb25NZW51Um93U3R5bGUiLCJkaXNwbGF5IiwiYWRkRXZlbnRMaXN0ZW5lciIsImJsdXIiLCJtb2R1bGUiLCJleHBvcnRzIl0sIm1hcHBpbmdzIjoiQUFBQSxNQUFNQSxTQUFXQyxRQUFRLFVBQVIsQ0FBakI7QUFDQSxNQUFNQyxXQUFXRCxRQUFRLFlBQVIsQ0FBakI7QUFDQSxNQUFNRSxvQkFBb0JGLFFBQVEscUJBQVIsQ0FBMUI7QUFDQSxNQUFNRyxPQUFPSCxRQUFRLFFBQVIsQ0FBYjs7QUFFQSxJQUFJSSxZQUFKOztBQUVBLE1BQU1DLElBQU4sQ0FDQTtBQUNJOzs7OztBQUtBQyxnQkFBWUMsT0FBWixFQUNBO0FBQ0lBLGtCQUFVQSxXQUFXLEVBQXJCO0FBQ0EsYUFBS0MsR0FBTCxHQUFXQyxTQUFTQyxhQUFULENBQXVCLEtBQXZCLENBQVg7QUFDQSxhQUFLQyxNQUFMLEdBQWNKLFFBQVFJLE1BQXRCO0FBQ0EsYUFBS0MsUUFBTCxHQUFnQixFQUFoQjtBQUNBLGFBQUtDLFdBQUwsQ0FBaUJkLE9BQU9lLFNBQXhCO0FBQ0EsYUFBS04sR0FBTCxDQUFTTyxRQUFULEdBQW9CLENBQUMsQ0FBckI7QUFDSDs7QUFFRDs7OztBQUlBQyxXQUFPQyxRQUFQLEVBQ0E7QUFDSSxZQUFJQSxTQUFTQyxPQUFiLEVBQ0E7QUFDSUQscUJBQVNDLE9BQVQsQ0FBaUJDLElBQWpCLEdBQXdC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Q0ksZUFBT0EsUUFBUDtBQUNIO0FBeGNMOztBQTJjQStGLE9BQU9DLE9BQVAsR0FBaUI1RixJQUFqQiIsImZpbGUiOiJtZW51LmpzIiwic291cmNlc0NvbnRlbnQiOlsiY29uc3QgQ29uZmlnID0gICByZXF1aXJlKCcuL2NvbmZpZycpXHJcbmNvbnN0IE1lbnVJdGVtID0gcmVxdWlyZSgnLi9tZW51SXRlbScpXHJcbmNvbnN0IEdsb2JhbEFjY2VsZXJhdG9yID0gcmVxdWlyZSgnLi9nbG9iYWxBY2NlbGVyYXRvcicpXHJcbmNvbnN0IGh0bWwgPSByZXF1aXJlKCcuL2h0bWwnKVxyXG5cclxubGV0IF9hcHBsaWNhdGlvblxyXG5cclxuY2xhc3MgTWVudVxyXG57XHJcbiAgICAvKipcclxuICAgICAqIGNyZWF0ZXMgYSBtZW51IGJhclxyXG4gICAgICogQHBhcmFtIHtvYmplY3R9IFtvcHRpb25zXVxyXG4gICAgICogQHBhcmFtIHtvYmplY3R9IFtvcHRpb25zLnN0eWxlc10gYWRkaXRpb25hbCBDU1Mgc3R5bGVzIGZvciBtZW51XHJcbiAgICAgKi9cclxuICAgIGNvbnN0cnVjdG9yKG9wdGlvbnMpXHJcbiAgICB7XHJcbiAgICAgICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge31cclxuICAgICAgICB0aGlzLmRpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpXHJcbiAgICAgICAgdGhpcy5zdHlsZXMgPSBvcHRpb25zLnN0eWxlc1xyXG4gICAgICAgIHRoaXMuY2hpbGRyZW4gPSBbXVxyXG4gICAgICAgIHRoaXMuYXBwbHlDb25maWcoQ29uZmlnLk1lbnVTdHlsZSlcclxuICAgICAgICB0aGlzLmRpdi50YWJJbmRleCA9IC0xXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBhcHBlbmQgYSBNZW51SXRlbSB0byB0aGUgTWVudVxyXG4gICAgICogQHBhcmFtIHtNZW51SXRlbX0gbWVudUl0ZW1cclxuICAgICAqL1xyXG4gICAgYXBwZW5kKG1lbnVJdGVtKVxyXG4gICAge1xyXG4gICAgICAgIGlmIChtZW51SXRlbS5zdWJtZW51KVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgbWVudUl0ZW0uc3VibWVudS5tZW51ID0gdGhpc1xyXG4gICAgICAgIH1cclxuICAgICAgICBtZW51SXRlbS5tZW51ID0gdGhpc1xyXG4gICAgICAgIHRoaXMuZGl2LmFwcGVuZENoaWxkKG1lbnVJdGVtLmRpdilcclxuICAgICAgICBpZiAobWVudUl0ZW0udHlwZSAhPT0gJ3NlcGFyYXRvcicpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLmNoaWxkcmVuLnB1c2gobWVudUl0ZW0pXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogaW5zZXJ0cyBhIE1lbnVJdGVtIGludG8gdGhlIE1lbnVcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBwb3NcclxuICAgICAqIEBwYXJhbSB7TWVudUl0ZW19IG1lbnVJdGVtXHJcbiAgICAgKi9cclxuICAgIGluc2VydChwb3MsIG1lbnVJdGVtKVxyXG4gICAge1xyXG4gICAgICAgIGlmIChwb3MgPj0gdGhpcy5kaXYuY2hpbGROb2Rlcy5sZW5ndGgpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLmFwcGVuZChtZW51SXRlbSlcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgaWYgKG1lbnVJdGVtLnN1Ym1lbnUpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIG1lbnVJdGVtLnN1Ym1lbnUubWVudSA9IHRoaXNcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBtZW51SXRlbS5tZW51ID0gdGhpc1xyXG4gICAgICAgICAgICB0aGlzLmRpdi5pbnNlcnRCZWZvcmUobWVudUl0ZW0uZGl2LCB0aGlzLmRpdi5jaGlsZE5vZGVzW3Bvc10pXHJcbiAgICAgICAgICAgIGlmIChtZW51SXRlbS50eXBlICE9PSAnc2VwYXJhdG9yJylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jaGlsZHJlbi5zcGxpY2UocG9zLCAwLCBtZW51SXRlbSlcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBoaWRlKClcclxuICAgIHtcclxuICAgICAgICBsZXQgY3VycmVudCA9IHRoaXMubWVudS5zaG93aW5nXHJcbiAgICAgICAgd2hpbGUgKGN1cnJlbnQgJiYgY3VycmVudC5zdWJtZW51KVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgY3VycmVudC5kaXYuc3R5bGUuYmFja2dyb3VuZENvbG9yID0gJ3RyYW5zcGFyZW50J1xyXG4gICAgICAgICAgICBjdXJyZW50LnN1Ym1lbnUuZGl2LnJlbW92ZSgpXHJcbiAgICAgICAgICAgIGxldCBuZXh0ID0gY3VycmVudC5zdWJtZW51LnNob3dpbmdcclxuICAgICAgICAgICAgaWYgKG5leHQpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGN1cnJlbnQuc3VibWVudS5zaG93aW5nLmRpdi5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSAndHJhbnNwYXJlbnQnXHJcbiAgICAgICAgICAgICAgICBjdXJyZW50LnN1Ym1lbnUuc2hvd2luZyA9IG51bGxcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjdXJyZW50ID0gbmV4dFxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBzaG93KG1lbnVJdGVtKVxyXG4gICAge1xyXG4gICAgICAgIE1lbnUuR2xvYmFsQWNjZWxlcmF0b3IudW5yZWdpc3Rlck1lbnVTaG9ydGN1dHMoKVxyXG4gICAgICAgIGlmICh0aGlzLm1lbnUgJiYgdGhpcy5tZW51LnNob3dpbmcgPT09IG1lbnVJdGVtKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5oaWRlKClcclxuICAgICAgICAgICAgdGhpcy5tZW51LnNob3dpbmcgPSBudWxsXHJcbiAgICAgICAgICAgIHRoaXMuZGl2LnJlbW92ZSgpXHJcbiAgICAgICAgICAgIHRoaXMubWVudS5zaG93QWNjZWxlcmF0b3JzKClcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMubWVudSlcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMubWVudS5zaG93aW5nICYmIHRoaXMubWVudS5jaGlsZHJlbi5pbmRleE9mKG1lbnVJdGVtKSAhPT0gLTEpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5oaWRlKClcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHRoaXMubWVudS5zaG93aW5nID0gbWVudUl0ZW1cclxuICAgICAgICAgICAgICAgIHRoaXMubWVudS5oaWRlQWNjZWxlcmF0b3JzKClcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjb25zdCBkaXYgPSBtZW51SXRlbS5kaXZcclxuICAgICAgICAgICAgY29uc3QgcGFyZW50ID0gdGhpcy5tZW51LmRpdlxyXG4gICAgICAgICAgICBpZiAodGhpcy5tZW51LmFwcGxpY2F0aW9uTWVudSlcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kaXYuc3R5bGUubGVmdCA9IGRpdi5vZmZzZXRMZWZ0ICsgJ3B4J1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kaXYuc3R5bGUudG9wID0gZGl2Lm9mZnNldFRvcCArIGRpdi5vZmZzZXRIZWlnaHQgKyAncHgnXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRpdi5zdHlsZS5sZWZ0ID0gcGFyZW50Lm9mZnNldExlZnQgKyBwYXJlbnQub2Zmc2V0V2lkdGggLSBDb25maWcuT3ZlcmxhcCArICdweCdcclxuICAgICAgICAgICAgICAgIHRoaXMuZGl2LnN0eWxlLnRvcCA9IHBhcmVudC5vZmZzZXRUb3AgKyBkaXYub2Zmc2V0VG9wIC0gQ29uZmlnLk92ZXJsYXAgKyAncHgnXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5hdHRhY2hlZCA9IG1lbnVJdGVtXHJcbiAgICAgICAgICAgIHRoaXMuc2hvd0FjY2VsZXJhdG9ycygpXHJcbiAgICAgICAgICAgIHRoaXMuZ2V0QXBwbGljYXRpb25EaXYoKS5hcHBlbmRDaGlsZCh0aGlzLmRpdilcclxuICAgICAgICAgICAgbGV0IGxhYmVsID0gMCwgYWNjZWxlcmF0b3IgPSAwLCBhcnJvdyA9IDAsIGNoZWNrZWQgPSAwXHJcbiAgICAgICAgICAgIGZvciAobGV0IGNoaWxkIG9mIHRoaXMuY2hpbGRyZW4pXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGNoaWxkLmNoZWNrLnN0eWxlLndpZHRoID0gJ2F1dG8nXHJcbiAgICAgICAgICAgICAgICBjaGlsZC5sYWJlbC5zdHlsZS53aWR0aCA9ICdhdXRvJ1xyXG4gICAgICAgICAgICAgICAgY2hpbGQuYWNjZWxlcmF0b3Iuc3R5bGUud2lkdGggPSAnYXV0bydcclxuICAgICAgICAgICAgICAgIGNoaWxkLmFycm93LnN0eWxlLndpZHRoID0gJ2F1dG8nXHJcbiAgICAgICAgICAgICAgICBpZiAoY2hpbGQudHlwZSA9PT0gJ2NoZWNrYm94JylcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBjaGVja2VkID0gQ29uZmlnLk1pbmltdW1Db2x1bW5XaWR0aFxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKGNoaWxkLnN1Ym1lbnUpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgYXJyb3cgPSBDb25maWcuTWluaW11bUNvbHVtbldpZHRoXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZm9yIChsZXQgY2hpbGQgb2YgdGhpcy5jaGlsZHJlbilcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgY2hpbGRMYWJlbCA9IGNoaWxkLmxhYmVsLm9mZnNldFdpZHRoICogMlxyXG4gICAgICAgICAgICAgICAgbGFiZWwgPSBjaGlsZExhYmVsID4gbGFiZWwgPyBjaGlsZExhYmVsIDogbGFiZWxcclxuICAgICAgICAgICAgICAgIGNvbnN0IGNoaWxkQWNjZWxlcmF0b3IgPSBjaGlsZC5hY2NlbGVyYXRvci5vZmZzZXRXaWR0aFxyXG4gICAgICAgICAgICAgICAgYWNjZWxlcmF0b3IgPSBjaGlsZEFjY2VsZXJhdG9yID4gYWNjZWxlcmF0b3IgPyBjaGlsZEFjY2VsZXJhdG9yIDogYWNjZWxlcmF0b3JcclxuICAgICAgICAgICAgICAgIGlmIChjaGlsZC5zdWJtZW51KVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGFycm93ID0gY2hpbGQuYXJyb3cub2Zmc2V0V2lkdGhcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBmb3IgKGxldCBjaGlsZCBvZiB0aGlzLmNoaWxkcmVuKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBjaGlsZC5jaGVjay5zdHlsZS53aWR0aCA9IGNoZWNrZWQgKyAncHgnXHJcbiAgICAgICAgICAgICAgICBjaGlsZC5sYWJlbC5zdHlsZS53aWR0aCA9IGxhYmVsICsgJ3B4J1xyXG4gICAgICAgICAgICAgICAgY2hpbGQuYWNjZWxlcmF0b3Iuc3R5bGUud2lkdGggPSBhY2NlbGVyYXRvciArICdweCdcclxuICAgICAgICAgICAgICAgIGNoaWxkLmFycm93LnN0eWxlLndpZHRoID0gYXJyb3cgKyAncHgnXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKHRoaXMuZGl2Lm9mZnNldExlZnQgKyB0aGlzLmRpdi5vZmZzZXRXaWR0aCA+IHdpbmRvdy5pbm5lcldpZHRoKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRpdi5zdHlsZS5sZWZ0ID0gd2luZG93LmlubmVyV2lkdGggLSB0aGlzLmRpdi5vZmZzZXRXaWR0aCArICdweCdcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAodGhpcy5kaXYub2Zmc2V0VG9wICsgdGhpcy5kaXYub2Zmc2V0SGVpZ2h0ID4gd2luZG93LmlubmVySGVpZ2h0KVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRpdi5zdHlsZS50b3AgPSB3aW5kb3cuaW5uZXJIZWlnaHQgLSB0aGlzLmRpdi5vZmZzZXRIZWlnaHQgKyAncHgnXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgYXBwbHlDb25maWcoYmFzZSlcclxuICAgIHtcclxuICAgICAgICBjb25zdCBzdHlsZXMgPSB7fVxyXG4gICAgICAgIGZvciAobGV0IHN0eWxlIGluIGJhc2UpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBzdHlsZXNbc3R5bGVdID0gYmFzZVtzdHlsZV1cclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHRoaXMuc3R5bGVzKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgZm9yIChsZXQgc3R5bGUgaW4gdGhpcy5zdHlsZXMpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHN0eWxlc1tzdHlsZV0gPSB0aGlzLnN0eWxlc1tzdHlsZV1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBmb3IgKGxldCBzdHlsZSBpbiBzdHlsZXMpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLmRpdi5zdHlsZVtzdHlsZV0gPSBzdHlsZXNbc3R5bGVdXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHNob3dBY2NlbGVyYXRvcnMoKVxyXG4gICAge1xyXG4gICAgICAgIGZvciAobGV0IGNoaWxkIG9mIHRoaXMuY2hpbGRyZW4pXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBjaGlsZC5zaG93U2hvcnRjdXQoKVxyXG4gICAgICAgICAgICBpZiAoY2hpbGQudHlwZSAhPT0gJ3NlcGFyYXRvcicpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGluZGV4ID0gY2hpbGQudGV4dC5pbmRleE9mKCcmJylcclxuICAgICAgICAgICAgICAgIGlmIChpbmRleCAhPT0gLTEpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgTWVudS5HbG9iYWxBY2NlbGVyYXRvci5yZWdpc3Rlck1lbnVTaG9ydGN1dChjaGlsZC50ZXh0W2luZGV4ICsgMV0sIGNoaWxkKVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICghdGhpcy5hcHBsaWNhdGlvbk1lbnUpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBNZW51Lkdsb2JhbEFjY2VsZXJhdG9yLnJlZ2lzdGVyTWVudVNwZWNpYWwodGhpcylcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgaGlkZUFjY2VsZXJhdG9ycygpXHJcbiAgICB7XHJcbiAgICAgICAgZm9yIChsZXQgY2hpbGQgb2YgdGhpcy5jaGlsZHJlbilcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGNoaWxkLmhpZGVTaG9ydGN1dCgpXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGNsb3NlQWxsKClcclxuICAgIHtcclxuICAgICAgICBNZW51Lkdsb2JhbEFjY2VsZXJhdG9yLnVucmVnaXN0ZXJNZW51U2hvcnRjdXRzKClcclxuICAgICAgICBsZXQgYXBwbGljYXRpb24gPSBfYXBwbGljYXRpb24ubWVudVxyXG4gICAgICAgIGlmIChhcHBsaWNhdGlvbi5zaG93aW5nKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgbGV0IG1lbnUgPSBhcHBsaWNhdGlvblxyXG4gICAgICAgICAgICB3aGlsZSAobWVudS5zaG93aW5nKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBtZW51ID0gbWVudS5zaG93aW5nLnN1Ym1lbnVcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB3aGlsZSAobWVudSAmJiAhbWVudS5hcHBsaWNhdGlvbk1lbnUpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGlmIChtZW51LnNob3dpbmcpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgbWVudS5zaG93aW5nLmRpdi5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSAndHJhbnNwYXJlbnQnXHJcbiAgICAgICAgICAgICAgICAgICAgbWVudS5zaG93aW5nID0gbnVsbFxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgbWVudS5kaXYucmVtb3ZlKClcclxuICAgICAgICAgICAgICAgIG1lbnUgPSBtZW51Lm1lbnVcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAobWVudSlcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgbWVudS5zaG93aW5nLmRpdi5zdHlsZS5iYWNrZ3JvdW5kID0gJ3RyYW5zcGFyZW50J1xyXG4gICAgICAgICAgICAgICAgbWVudS5zaG93aW5nID0gbnVsbFxyXG4gICAgICAgICAgICAgICAgbWVudS5zaG93QWNjZWxlcmF0b3JzKClcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBnZXRBcHBsaWNhdGlvbkRpdigpXHJcbiAgICB7XHJcbiAgICAgICAgcmV0dXJuIF9hcHBsaWNhdGlvblxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogbW92ZSBzZWxlY3RvciB0byB0aGUgbmV4dCBjaGlsZCBwYW5lXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gZGlyZWN0aW9uIChsZWZ0IG9yIHJpZ2h0KVxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqL1xyXG4gICAgbW92ZUNoaWxkKGRpcmVjdGlvbilcclxuICAgIHtcclxuICAgICAgICBsZXQgaW5kZXhcclxuICAgICAgICBpZiAoZGlyZWN0aW9uID09PSAnbGVmdCcpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBjb25zdCBwYXJlbnQgPSB0aGlzLnNlbGVjdG9yLm1lbnUubWVudVxyXG4gICAgICAgICAgICBpbmRleCA9IHBhcmVudC5jaGlsZHJlbi5pbmRleE9mKHBhcmVudC5zaG93aW5nKVxyXG4gICAgICAgICAgICBpbmRleC0tXHJcbiAgICAgICAgICAgIGluZGV4ID0gKGluZGV4IDwgMCkgPyBwYXJlbnQuY2hpbGRyZW4ubGVuZ3RoIC0gMSA6IGluZGV4XHJcbiAgICAgICAgICAgIHBhcmVudC5jaGlsZHJlbltpbmRleF0uaGFuZGxlQ2xpY2soKVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBsZXQgcGFyZW50ID0gdGhpcy5zZWxlY3Rvci5tZW51Lm1lbnVcclxuICAgICAgICAgICAgbGV0IHNlbGVjdG9yID0gcGFyZW50LnNob3dpbmdcclxuICAgICAgICAgICAgd2hpbGUgKCFwYXJlbnQuYXBwbGljYXRpb25NZW51KVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBzZWxlY3Rvci5oYW5kbGVDbGljaygpXHJcbiAgICAgICAgICAgICAgICBzZWxlY3Rvci5kaXYuc3R5bGUuYmFja2dyb3VuZENvbG9yID0gJ3RyYW5zcGFyZW50J1xyXG4gICAgICAgICAgICAgICAgcGFyZW50ID0gcGFyZW50Lm1lbnVcclxuICAgICAgICAgICAgICAgIHNlbGVjdG9yID0gcGFyZW50LnNob3dpbmdcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpbmRleCA9IHBhcmVudC5jaGlsZHJlbi5pbmRleE9mKHNlbGVjdG9yKVxyXG4gICAgICAgICAgICBpbmRleCsrXHJcbiAgICAgICAgICAgIGluZGV4ID0gKGluZGV4ID09PSBwYXJlbnQuY2hpbGRyZW4ubGVuZ3RoKSA/IDAgOiBpbmRleFxyXG4gICAgICAgICAgICBwYXJlbnQuY2hpbGRyZW5baW5kZXhdLmhhbmRsZUNsaWNrKClcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5zZWxlY3RvciA9IG51bGxcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIG1vdmUgc2VsZWN0b3IgcmlnaHQgYW5kIGxlZnRcclxuICAgICAqIEBwYXJhbSB7TW91c2VFdmVudH0gZVxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGRpcmVjdGlvblxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqL1xyXG4gICAgaG9yaXpvbnRhbFNlbGVjdG9yKGUsIGRpcmVjdGlvbilcclxuICAgIHtcclxuICAgICAgICBpZiAoZGlyZWN0aW9uID09PSAncmlnaHQnKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMuc2VsZWN0b3Iuc3VibWVudSlcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zZWxlY3Rvci5oYW5kbGVDbGljayhlKVxyXG4gICAgICAgICAgICAgICAgdGhpcy5zZWxlY3Rvci5zdWJtZW51LnNlbGVjdG9yID0gdGhpcy5zZWxlY3Rvci5zdWJtZW51LmNoaWxkcmVuWzBdXHJcbiAgICAgICAgICAgICAgICB0aGlzLnNlbGVjdG9yLnN1Ym1lbnUuc2VsZWN0b3IuZGl2LnN0eWxlLmJhY2tncm91bmRDb2xvciA9IENvbmZpZy5TZWxlY3RlZEJhY2tncm91bmRTdHlsZVxyXG4gICAgICAgICAgICAgICAgdGhpcy5zZWxlY3RvciA9IG51bGxcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHRoaXMubW92ZUNoaWxkKGRpcmVjdGlvbilcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmIChkaXJlY3Rpb24gPT09ICdsZWZ0JylcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGlmICghdGhpcy5zZWxlY3Rvci5tZW51Lm1lbnUuYXBwbGljYXRpb25NZW51KVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNlbGVjdG9yLm1lbnUuYXR0YWNoZWQuaGFuZGxlQ2xpY2soZSlcclxuICAgICAgICAgICAgICAgIHRoaXMuc2VsZWN0b3IubWVudS5tZW51LnNlbGVjdG9yID0gdGhpcy5zZWxlY3Rvci5tZW51LmF0dGFjaGVkXHJcbiAgICAgICAgICAgICAgICB0aGlzLnNlbGVjdG9yID0gbnVsbFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5tb3ZlQ2hpbGQoZGlyZWN0aW9uKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKClcclxuICAgICAgICBlLnByZXZlbnREZWZhdWx0KClcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIG1vdmUgdGhlIHNlbGVjdG9yIGluIHRoZSBtZW51XHJcbiAgICAgKiBAcGFyYW0ge0tleWJvYXJkRXZlbnR9IGVcclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBkaXJlY3Rpb24gKGxlZnQsIHJpZ2h0LCB1cCwgZG93bilcclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKi9cclxuICAgIG1vdmUoZSwgZGlyZWN0aW9uKVxyXG4gICAge1xyXG4gICAgICAgIGlmICh0aGlzLnNlbGVjdG9yKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5zZWxlY3Rvci5kaXYuc3R5bGUuYmFja2dyb3VuZENvbG9yID0gJ3RyYW5zcGFyZW50J1xyXG4gICAgICAgICAgICBsZXQgaW5kZXggPSB0aGlzLmNoaWxkcmVuLmluZGV4T2YodGhpcy5zZWxlY3RvcilcclxuICAgICAgICAgICAgaWYgKGRpcmVjdGlvbiA9PT0gJ2Rvd24nKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBpbmRleCsrXHJcbiAgICAgICAgICAgICAgICBpbmRleCA9IChpbmRleCA9PT0gdGhpcy5jaGlsZHJlbi5sZW5ndGgpID8gMCA6IGluZGV4XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSBpZiAoZGlyZWN0aW9uID09PSAndXAnKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBpbmRleC0tXHJcbiAgICAgICAgICAgICAgICBpbmRleCA9IChpbmRleCA8IDApID8gdGhpcy5jaGlsZHJlbi5sZW5ndGggLSAxIDogaW5kZXhcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmhvcml6b250YWxTZWxlY3RvcihlLCBkaXJlY3Rpb24pXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5zZWxlY3RvciA9IHRoaXMuY2hpbGRyZW5baW5kZXhdXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2VcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGlmIChkaXJlY3Rpb24gPT09ICd1cCcpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2VsZWN0b3IgPSB0aGlzLmNoaWxkcmVuW3RoaXMuY2hpbGRyZW4ubGVuZ3RoIC0gMV1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2VsZWN0b3IgPSB0aGlzLmNoaWxkcmVuWzBdXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5zZWxlY3Rvci5kaXYuc3R5bGUuYmFja2dyb3VuZENvbG9yID0gQ29uZmlnLlNlbGVjdGVkQmFja2dyb3VuZFN0eWxlXHJcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXHJcbiAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogY2xpY2sgdGhlIHNlbGVjdG9yIHdpdGgga2V5Ym9hcmRcclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKi9cclxuICAgIGVudGVyKGUpXHJcbiAgICB7XHJcbiAgICAgICAgaWYgKHRoaXMuc2VsZWN0b3IpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLnNlbGVjdG9yLmhhbmRsZUNsaWNrKGUpXHJcbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKVxyXG4gICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogYXJyYXkgY29udGFpbmluZyB0aGUgbWVudSdzIGl0ZW1zXHJcbiAgICAgKiBAcHJvcGVydHkge01lbnVJdGVtc1tdfSBpdGVtc1xyXG4gICAgICogQHJlYWRvbmx5XHJcbiAgICAgKi9cclxuICAgIGdldCBpdGVtcygpXHJcbiAgICB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuY2hpbGRyZW5cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIHNldHMgYWN0aXZlIGFwcGxpY2F0aW9uIE1lbnUgKGFuZCByZW1vdmVzIGFueSBleGlzdGluZyBhcHBsaWNhdGlvbiBtZW51cylcclxuICAgICAqIEBwYXJhbSB7TWVudX0gbWVudVxyXG4gICAgICovXHJcbiAgICBzdGF0aWMgc2V0QXBwbGljYXRpb25NZW51KG1lbnUpXHJcbiAgICB7XHJcbiAgICAgICAgR2xvYmFsQWNjZWxlcmF0b3IuaW5pdCgpXHJcbiAgICAgICAgaWYgKF9hcHBsaWNhdGlvbilcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIF9hcHBsaWNhdGlvbi5yZW1vdmUoKVxyXG4gICAgICAgIH1cclxuICAgICAgICBfYXBwbGljYXRpb24gPSBodG1sKHsgcGFyZW50OiBkb2N1bWVudC5ib2R5LCBzdHlsZXM6IENvbmZpZy5BcHBsaWNhdGlvbkNvbnRhaW5lclN0eWxlIH0pXHJcbiAgICAgICAgX2FwcGxpY2F0aW9uLm1lbnUgPSBtZW51XHJcbiAgICAgICAgbWVudS5hcHBseUNvbmZpZyhDb25maWcuQXBwbGljYXRpb25NZW51U3R5bGUpXHJcbiAgICAgICAgZm9yIChsZXQgY2hpbGQgb2YgbWVudS5jaGlsZHJlbilcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGNoaWxkLmFwcGx5Q29uZmlnKENvbmZpZy5BcHBsaWNhdGlvbk1lbnVSb3dTdHlsZSlcclxuICAgICAgICAgICAgaWYgKGNoaWxkLmFycm93KVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBjaGlsZC5hcnJvdy5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgbWVudS5kaXYuYXBwZW5kQ2hpbGQoY2hpbGQuZGl2KVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgX2FwcGxpY2F0aW9uLmFwcGVuZENoaWxkKG1lbnUuZGl2KVxyXG4gICAgICAgIG1lbnUuYXBwbGljYXRpb25NZW51ID0gdHJ1ZVxyXG4gICAgICAgIG1lbnUuZGl2LnRhYkluZGV4ID0gLTFcclxuXHJcbiAgICAgICAgLy8gZG9uJ3QgbGV0IG1lbnUgYmFyIGZvY3VzIHVubGVzcyB3aW5kb3dzIGFyZSBvcGVuICh0aGlzIGZpeGVzIGEgZm9jdXMgYnVnKVxyXG4gICAgICAgIG1lbnUuZGl2LmFkZEV2ZW50TGlzdGVuZXIoJ2ZvY3VzJywgKCkgPT5cclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGlmICghbWVudS5zaG93aW5nKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBtZW51LmRpdi5ibHVyKClcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pXHJcblxyXG4gICAgICAgIC8vIGNsb3NlIGFsbCB3aW5kb3dzIGlmIG1lbnUgaXMgbm8gbG9uZ2VyIHRoZSBmb2N1c1xyXG4gICAgICAgIG1lbnUuZGl2LmFkZEV2ZW50TGlzdGVuZXIoJ2JsdXInLCAoKSA9PlxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgaWYgKG1lbnUuc2hvd2luZylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgbWVudS5jbG9zZUFsbCgpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KVxyXG4gICAgICAgIG1lbnUuc2hvd0FjY2VsZXJhdG9ycygpXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBHbG9iYWxBY2NlbGVyYXRvciBkZWZpbml0aW9uXHJcbiAgICAgKiBAdHlwZSB7QWNjZWxlcmF0b3J9XHJcbiAgICAgKi9cclxuICAgIHN0YXRpYyBnZXQgR2xvYmFsQWNjZWxlcmF0b3IoKVxyXG4gICAge1xyXG4gICAgICAgIHJldHVybiBHbG9iYWxBY2NlbGVyYXRvclxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogdXNlIHRoaXMgdG8gY2hhbmdlIHRoZSBkZWZhdWx0IENvbmZpZyBzZXR0aW5ncyBhY3Jvc3MgYWxsIG1lbnVzXHJcbiAgICAgKiBAdHlwZSB7Q29uZmlnfVxyXG4gICAgICovXHJcbiAgICBzdGF0aWMgZ2V0IENvbmZpZygpXHJcbiAgICB7XHJcbiAgICAgICAgcmV0dXJuIENvbmZpZ1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogTWVudUl0ZW0gZGVmaW5pdGlvblxyXG4gICAgICogQHR5cGUge01lbnVJdGVtfVxyXG4gICAgICovXHJcbiAgICBzdGF0aWMgZ2V0IE1lbnVJdGVtKClcclxuICAgIHtcclxuICAgICAgICByZXR1cm4gTWVudUl0ZW1cclxuICAgIH1cclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBNZW51Il19