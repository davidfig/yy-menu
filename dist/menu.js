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
                selector = parent.showing;
                selector.handleClick();
                selector.div.style.backgroundColor = 'transparent';
                parent = parent.menu;
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9tZW51LmpzIl0sIm5hbWVzIjpbIkNvbmZpZyIsInJlcXVpcmUiLCJNZW51SXRlbSIsIkdsb2JhbEFjY2VsZXJhdG9yIiwiaHRtbCIsIl9hcHBsaWNhdGlvbiIsIk1lbnUiLCJjb25zdHJ1Y3RvciIsIm9wdGlvbnMiLCJkaXYiLCJkb2N1bWVudCIsImNyZWF0ZUVsZW1lbnQiLCJzdHlsZXMiLCJjaGlsZHJlbiIsImFwcGx5Q29uZmlnIiwiTWVudVN0eWxlIiwidGFiSW5kZXgiLCJhcHBlbmQiLCJtZW51SXRlbSIsInN1Ym1lbnUiLCJtZW51IiwiYXBwZW5kQ2hpbGQiLCJ0eXBlIiwicHVzaCIsImluc2VydCIsInBvcyIsImNoaWxkTm9kZXMiLCJsZW5ndGgiLCJpbnNlcnRCZWZvcmUiLCJzcGxpY2UiLCJoaWRlIiwiY3VycmVudCIsInNob3dpbmciLCJzdHlsZSIsImJhY2tncm91bmRDb2xvciIsInJlbW92ZSIsIm5leHQiLCJzaG93IiwidW5yZWdpc3Rlck1lbnVTaG9ydGN1dHMiLCJzaG93QWNjZWxlcmF0b3JzIiwiaW5kZXhPZiIsImhpZGVBY2NlbGVyYXRvcnMiLCJwYXJlbnQiLCJhcHBsaWNhdGlvbk1lbnUiLCJsZWZ0Iiwib2Zmc2V0TGVmdCIsInRvcCIsIm9mZnNldFRvcCIsIm9mZnNldEhlaWdodCIsIm9mZnNldFdpZHRoIiwiT3ZlcmxhcCIsImF0dGFjaGVkIiwiZ2V0QXBwbGljYXRpb25EaXYiLCJsYWJlbCIsImFjY2VsZXJhdG9yIiwiYXJyb3ciLCJjaGVja2VkIiwiY2hpbGQiLCJjaGVjayIsIndpZHRoIiwiTWluaW11bUNvbHVtbldpZHRoIiwiY2hpbGRMYWJlbCIsImNoaWxkQWNjZWxlcmF0b3IiLCJ3aW5kb3ciLCJpbm5lcldpZHRoIiwiaW5uZXJIZWlnaHQiLCJiYXNlIiwic2hvd1Nob3J0Y3V0IiwiaW5kZXgiLCJ0ZXh0IiwicmVnaXN0ZXJNZW51U2hvcnRjdXQiLCJyZWdpc3Rlck1lbnVTcGVjaWFsIiwiaGlkZVNob3J0Y3V0IiwiY2xvc2VBbGwiLCJhcHBsaWNhdGlvbiIsImJhY2tncm91bmQiLCJtb3ZlQ2hpbGQiLCJkaXJlY3Rpb24iLCJzZWxlY3RvciIsImhhbmRsZUNsaWNrIiwiaG9yaXpvbnRhbFNlbGVjdG9yIiwiZSIsIlNlbGVjdGVkQmFja2dyb3VuZFN0eWxlIiwic3RvcFByb3BhZ2F0aW9uIiwicHJldmVudERlZmF1bHQiLCJtb3ZlIiwiZW50ZXIiLCJpdGVtcyIsInNldEFwcGxpY2F0aW9uTWVudSIsImluaXQiLCJib2R5IiwiQXBwbGljYXRpb25Db250YWluZXJTdHlsZSIsIkFwcGxpY2F0aW9uTWVudVN0eWxlIiwiQXBwbGljYXRpb25NZW51Um93U3R5bGUiLCJkaXNwbGF5IiwiYWRkRXZlbnRMaXN0ZW5lciIsImJsdXIiLCJtb2R1bGUiLCJleHBvcnRzIl0sIm1hcHBpbmdzIjoiQUFBQSxNQUFNQSxTQUFXQyxRQUFRLFVBQVIsQ0FBakI7QUFDQSxNQUFNQyxXQUFXRCxRQUFRLFlBQVIsQ0FBakI7QUFDQSxNQUFNRSxvQkFBb0JGLFFBQVEscUJBQVIsQ0FBMUI7QUFDQSxNQUFNRyxPQUFPSCxRQUFRLFFBQVIsQ0FBYjs7QUFFQSxJQUFJSSxZQUFKOztBQUVBLE1BQU1DLElBQU4sQ0FDQTtBQUNJOzs7OztBQUtBQyxnQkFBWUMsT0FBWixFQUNBO0FBQ0lBLGtCQUFVQSxXQUFXLEVBQXJCO0FBQ0EsYUFBS0MsR0FBTCxHQUFXQyxTQUFTQyxhQUFULENBQXVCLEtBQXZCLENBQVg7QUFDQSxhQUFLQyxNQUFMLEdBQWNKLFFBQVFJLE1BQXRCO0FBQ0EsYUFBS0MsUUFBTCxHQUFnQixFQUFoQjtBQUNBLGFBQUtDLFdBQUwsQ0FBaUJkLE9BQU9lLFNBQXhCO0FBQ0EsYUFBS04sR0FBTCxDQUFTTyxRQUFULEdBQW9CLENBQUMsQ0FBckI7QUFDSDs7QUFFRDs7OztBQUlBQyxXQUFPQyxRQUFQLEVBQ0E7QUFDSSxZQUFJQSxTQUFTQyxPQUFiLEVBQ0E7QUFDSUQscUJBQVNDLE9BQVQsQ0FBaUJDLElBQWpCLEdBQXdC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QUFPQyxPQUFQLEdBQWlCNUYsSUFBakIiLCJmaWxlIjoibWVudS5qcyIsInNvdXJjZXNDb250ZW50IjpbImNvbnN0IENvbmZpZyA9ICAgcmVxdWlyZSgnLi9jb25maWcnKVxyXG5jb25zdCBNZW51SXRlbSA9IHJlcXVpcmUoJy4vbWVudUl0ZW0nKVxyXG5jb25zdCBHbG9iYWxBY2NlbGVyYXRvciA9IHJlcXVpcmUoJy4vZ2xvYmFsQWNjZWxlcmF0b3InKVxyXG5jb25zdCBodG1sID0gcmVxdWlyZSgnLi9odG1sJylcclxuXHJcbmxldCBfYXBwbGljYXRpb25cclxuXHJcbmNsYXNzIE1lbnVcclxue1xyXG4gICAgLyoqXHJcbiAgICAgKiBjcmVhdGVzIGEgbWVudSBiYXJcclxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBbb3B0aW9uc11cclxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBbb3B0aW9ucy5zdHlsZXNdIGFkZGl0aW9uYWwgQ1NTIHN0eWxlcyBmb3IgbWVudVxyXG4gICAgICovXHJcbiAgICBjb25zdHJ1Y3RvcihvcHRpb25zKVxyXG4gICAge1xyXG4gICAgICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9XHJcbiAgICAgICAgdGhpcy5kaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKVxyXG4gICAgICAgIHRoaXMuc3R5bGVzID0gb3B0aW9ucy5zdHlsZXNcclxuICAgICAgICB0aGlzLmNoaWxkcmVuID0gW11cclxuICAgICAgICB0aGlzLmFwcGx5Q29uZmlnKENvbmZpZy5NZW51U3R5bGUpXHJcbiAgICAgICAgdGhpcy5kaXYudGFiSW5kZXggPSAtMVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogYXBwZW5kIGEgTWVudUl0ZW0gdG8gdGhlIE1lbnVcclxuICAgICAqIEBwYXJhbSB7TWVudUl0ZW19IG1lbnVJdGVtXHJcbiAgICAgKi9cclxuICAgIGFwcGVuZChtZW51SXRlbSlcclxuICAgIHtcclxuICAgICAgICBpZiAobWVudUl0ZW0uc3VibWVudSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIG1lbnVJdGVtLnN1Ym1lbnUubWVudSA9IHRoaXNcclxuICAgICAgICB9XHJcbiAgICAgICAgbWVudUl0ZW0ubWVudSA9IHRoaXNcclxuICAgICAgICB0aGlzLmRpdi5hcHBlbmRDaGlsZChtZW51SXRlbS5kaXYpXHJcbiAgICAgICAgaWYgKG1lbnVJdGVtLnR5cGUgIT09ICdzZXBhcmF0b3InKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5jaGlsZHJlbi5wdXNoKG1lbnVJdGVtKVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIGluc2VydHMgYSBNZW51SXRlbSBpbnRvIHRoZSBNZW51XHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gcG9zXHJcbiAgICAgKiBAcGFyYW0ge01lbnVJdGVtfSBtZW51SXRlbVxyXG4gICAgICovXHJcbiAgICBpbnNlcnQocG9zLCBtZW51SXRlbSlcclxuICAgIHtcclxuICAgICAgICBpZiAocG9zID49IHRoaXMuZGl2LmNoaWxkTm9kZXMubGVuZ3RoKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5hcHBlbmQobWVudUl0ZW0pXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2VcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGlmIChtZW51SXRlbS5zdWJtZW51KVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBtZW51SXRlbS5zdWJtZW51Lm1lbnUgPSB0aGlzXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgbWVudUl0ZW0ubWVudSA9IHRoaXNcclxuICAgICAgICAgICAgdGhpcy5kaXYuaW5zZXJ0QmVmb3JlKG1lbnVJdGVtLmRpdiwgdGhpcy5kaXYuY2hpbGROb2Rlc1twb3NdKVxyXG4gICAgICAgICAgICBpZiAobWVudUl0ZW0udHlwZSAhPT0gJ3NlcGFyYXRvcicpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuY2hpbGRyZW4uc3BsaWNlKHBvcywgMCwgbWVudUl0ZW0pXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgaGlkZSgpXHJcbiAgICB7XHJcbiAgICAgICAgbGV0IGN1cnJlbnQgPSB0aGlzLm1lbnUuc2hvd2luZ1xyXG4gICAgICAgIHdoaWxlIChjdXJyZW50ICYmIGN1cnJlbnQuc3VibWVudSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGN1cnJlbnQuZGl2LnN0eWxlLmJhY2tncm91bmRDb2xvciA9ICd0cmFuc3BhcmVudCdcclxuICAgICAgICAgICAgY3VycmVudC5zdWJtZW51LmRpdi5yZW1vdmUoKVxyXG4gICAgICAgICAgICBsZXQgbmV4dCA9IGN1cnJlbnQuc3VibWVudS5zaG93aW5nXHJcbiAgICAgICAgICAgIGlmIChuZXh0KVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBjdXJyZW50LnN1Ym1lbnUuc2hvd2luZy5kaXYuc3R5bGUuYmFja2dyb3VuZENvbG9yID0gJ3RyYW5zcGFyZW50J1xyXG4gICAgICAgICAgICAgICAgY3VycmVudC5zdWJtZW51LnNob3dpbmcgPSBudWxsXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY3VycmVudCA9IG5leHRcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgc2hvdyhtZW51SXRlbSlcclxuICAgIHtcclxuICAgICAgICBNZW51Lkdsb2JhbEFjY2VsZXJhdG9yLnVucmVnaXN0ZXJNZW51U2hvcnRjdXRzKClcclxuICAgICAgICBpZiAodGhpcy5tZW51ICYmIHRoaXMubWVudS5zaG93aW5nID09PSBtZW51SXRlbSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMuaGlkZSgpXHJcbiAgICAgICAgICAgIHRoaXMubWVudS5zaG93aW5nID0gbnVsbFxyXG4gICAgICAgICAgICB0aGlzLmRpdi5yZW1vdmUoKVxyXG4gICAgICAgICAgICB0aGlzLm1lbnUuc2hvd0FjY2VsZXJhdG9ycygpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2VcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLm1lbnUpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLm1lbnUuc2hvd2luZyAmJiB0aGlzLm1lbnUuY2hpbGRyZW4uaW5kZXhPZihtZW51SXRlbSkgIT09IC0xKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaGlkZSgpXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB0aGlzLm1lbnUuc2hvd2luZyA9IG1lbnVJdGVtXHJcbiAgICAgICAgICAgICAgICB0aGlzLm1lbnUuaGlkZUFjY2VsZXJhdG9ycygpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY29uc3QgZGl2ID0gbWVudUl0ZW0uZGl2XHJcbiAgICAgICAgICAgIGNvbnN0IHBhcmVudCA9IHRoaXMubWVudS5kaXZcclxuICAgICAgICAgICAgaWYgKHRoaXMubWVudS5hcHBsaWNhdGlvbk1lbnUpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGl2LnN0eWxlLmxlZnQgPSBkaXYub2Zmc2V0TGVmdCArICdweCdcclxuICAgICAgICAgICAgICAgIHRoaXMuZGl2LnN0eWxlLnRvcCA9IGRpdi5vZmZzZXRUb3AgKyBkaXYub2Zmc2V0SGVpZ2h0ICsgJ3B4J1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kaXYuc3R5bGUubGVmdCA9IHBhcmVudC5vZmZzZXRMZWZ0ICsgcGFyZW50Lm9mZnNldFdpZHRoIC0gQ29uZmlnLk92ZXJsYXAgKyAncHgnXHJcbiAgICAgICAgICAgICAgICB0aGlzLmRpdi5zdHlsZS50b3AgPSBwYXJlbnQub2Zmc2V0VG9wICsgZGl2Lm9mZnNldFRvcCAtIENvbmZpZy5PdmVybGFwICsgJ3B4J1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMuYXR0YWNoZWQgPSBtZW51SXRlbVxyXG4gICAgICAgICAgICB0aGlzLnNob3dBY2NlbGVyYXRvcnMoKVxyXG4gICAgICAgICAgICB0aGlzLmdldEFwcGxpY2F0aW9uRGl2KCkuYXBwZW5kQ2hpbGQodGhpcy5kaXYpXHJcbiAgICAgICAgICAgIGxldCBsYWJlbCA9IDAsIGFjY2VsZXJhdG9yID0gMCwgYXJyb3cgPSAwLCBjaGVja2VkID0gMFxyXG4gICAgICAgICAgICBmb3IgKGxldCBjaGlsZCBvZiB0aGlzLmNoaWxkcmVuKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBjaGlsZC5jaGVjay5zdHlsZS53aWR0aCA9ICdhdXRvJ1xyXG4gICAgICAgICAgICAgICAgY2hpbGQubGFiZWwuc3R5bGUud2lkdGggPSAnYXV0bydcclxuICAgICAgICAgICAgICAgIGNoaWxkLmFjY2VsZXJhdG9yLnN0eWxlLndpZHRoID0gJ2F1dG8nXHJcbiAgICAgICAgICAgICAgICBjaGlsZC5hcnJvdy5zdHlsZS53aWR0aCA9ICdhdXRvJ1xyXG4gICAgICAgICAgICAgICAgaWYgKGNoaWxkLnR5cGUgPT09ICdjaGVja2JveCcpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgY2hlY2tlZCA9IENvbmZpZy5NaW5pbXVtQ29sdW1uV2lkdGhcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmIChjaGlsZC5zdWJtZW51KVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGFycm93ID0gQ29uZmlnLk1pbmltdW1Db2x1bW5XaWR0aFxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGZvciAobGV0IGNoaWxkIG9mIHRoaXMuY2hpbGRyZW4pXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGNoaWxkTGFiZWwgPSBjaGlsZC5sYWJlbC5vZmZzZXRXaWR0aCAqIDJcclxuICAgICAgICAgICAgICAgIGxhYmVsID0gY2hpbGRMYWJlbCA+IGxhYmVsID8gY2hpbGRMYWJlbCA6IGxhYmVsXHJcbiAgICAgICAgICAgICAgICBjb25zdCBjaGlsZEFjY2VsZXJhdG9yID0gY2hpbGQuYWNjZWxlcmF0b3Iub2Zmc2V0V2lkdGhcclxuICAgICAgICAgICAgICAgIGFjY2VsZXJhdG9yID0gY2hpbGRBY2NlbGVyYXRvciA+IGFjY2VsZXJhdG9yID8gY2hpbGRBY2NlbGVyYXRvciA6IGFjY2VsZXJhdG9yXHJcbiAgICAgICAgICAgICAgICBpZiAoY2hpbGQuc3VibWVudSlcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBhcnJvdyA9IGNoaWxkLmFycm93Lm9mZnNldFdpZHRoXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZm9yIChsZXQgY2hpbGQgb2YgdGhpcy5jaGlsZHJlbilcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgY2hpbGQuY2hlY2suc3R5bGUud2lkdGggPSBjaGVja2VkICsgJ3B4J1xyXG4gICAgICAgICAgICAgICAgY2hpbGQubGFiZWwuc3R5bGUud2lkdGggPSBsYWJlbCArICdweCdcclxuICAgICAgICAgICAgICAgIGNoaWxkLmFjY2VsZXJhdG9yLnN0eWxlLndpZHRoID0gYWNjZWxlcmF0b3IgKyAncHgnXHJcbiAgICAgICAgICAgICAgICBjaGlsZC5hcnJvdy5zdHlsZS53aWR0aCA9IGFycm93ICsgJ3B4J1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmRpdi5vZmZzZXRMZWZ0ICsgdGhpcy5kaXYub2Zmc2V0V2lkdGggPiB3aW5kb3cuaW5uZXJXaWR0aClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kaXYuc3R5bGUubGVmdCA9IHdpbmRvdy5pbm5lcldpZHRoIC0gdGhpcy5kaXYub2Zmc2V0V2lkdGggKyAncHgnXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKHRoaXMuZGl2Lm9mZnNldFRvcCArIHRoaXMuZGl2Lm9mZnNldEhlaWdodCA+IHdpbmRvdy5pbm5lckhlaWdodClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kaXYuc3R5bGUudG9wID0gd2luZG93LmlubmVySGVpZ2h0IC0gdGhpcy5kaXYub2Zmc2V0SGVpZ2h0ICsgJ3B4J1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGFwcGx5Q29uZmlnKGJhc2UpXHJcbiAgICB7XHJcbiAgICAgICAgY29uc3Qgc3R5bGVzID0ge31cclxuICAgICAgICBmb3IgKGxldCBzdHlsZSBpbiBiYXNlKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgc3R5bGVzW3N0eWxlXSA9IGJhc2Vbc3R5bGVdXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0aGlzLnN0eWxlcylcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGZvciAobGV0IHN0eWxlIGluIHRoaXMuc3R5bGVzKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBzdHlsZXNbc3R5bGVdID0gdGhpcy5zdHlsZXNbc3R5bGVdXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgZm9yIChsZXQgc3R5bGUgaW4gc3R5bGVzKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5kaXYuc3R5bGVbc3R5bGVdID0gc3R5bGVzW3N0eWxlXVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBzaG93QWNjZWxlcmF0b3JzKClcclxuICAgIHtcclxuICAgICAgICBmb3IgKGxldCBjaGlsZCBvZiB0aGlzLmNoaWxkcmVuKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgY2hpbGQuc2hvd1Nob3J0Y3V0KClcclxuICAgICAgICAgICAgaWYgKGNoaWxkLnR5cGUgIT09ICdzZXBhcmF0b3InKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBpbmRleCA9IGNoaWxkLnRleHQuaW5kZXhPZignJicpXHJcbiAgICAgICAgICAgICAgICBpZiAoaW5kZXggIT09IC0xKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIE1lbnUuR2xvYmFsQWNjZWxlcmF0b3IucmVnaXN0ZXJNZW51U2hvcnRjdXQoY2hpbGQudGV4dFtpbmRleCArIDFdLCBjaGlsZClcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoIXRoaXMuYXBwbGljYXRpb25NZW51KVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgTWVudS5HbG9iYWxBY2NlbGVyYXRvci5yZWdpc3Rlck1lbnVTcGVjaWFsKHRoaXMpXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGhpZGVBY2NlbGVyYXRvcnMoKVxyXG4gICAge1xyXG4gICAgICAgIGZvciAobGV0IGNoaWxkIG9mIHRoaXMuY2hpbGRyZW4pXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBjaGlsZC5oaWRlU2hvcnRjdXQoKVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBjbG9zZUFsbCgpXHJcbiAgICB7XHJcbiAgICAgICAgbGV0IGFwcGxpY2F0aW9uID0gX2FwcGxpY2F0aW9uLm1lbnVcclxuICAgICAgICBpZiAoYXBwbGljYXRpb24uc2hvd2luZylcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGxldCBtZW51ID0gYXBwbGljYXRpb25cclxuICAgICAgICAgICAgd2hpbGUgKG1lbnUuc2hvd2luZylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgbWVudSA9IG1lbnUuc2hvd2luZy5zdWJtZW51XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgd2hpbGUgKG1lbnUgJiYgIW1lbnUuYXBwbGljYXRpb25NZW51KVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBpZiAobWVudS5zaG93aW5nKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIG1lbnUuc2hvd2luZy5kaXYuc3R5bGUuYmFja2dyb3VuZENvbG9yID0gJ3RyYW5zcGFyZW50J1xyXG4gICAgICAgICAgICAgICAgICAgIG1lbnUuc2hvd2luZyA9IG51bGxcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIG1lbnUuZGl2LnJlbW92ZSgpXHJcbiAgICAgICAgICAgICAgICBtZW51ID0gbWVudS5tZW51XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKG1lbnUpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIG1lbnUuc2hvd2luZy5kaXYuc3R5bGUuYmFja2dyb3VuZCA9ICd0cmFuc3BhcmVudCdcclxuICAgICAgICAgICAgICAgIG1lbnUuc2hvd2luZyA9IG51bGxcclxuICAgICAgICAgICAgICAgIG1lbnUuc2hvd0FjY2VsZXJhdG9ycygpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0QXBwbGljYXRpb25EaXYoKVxyXG4gICAge1xyXG4gICAgICAgIHJldHVybiBfYXBwbGljYXRpb25cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIG1vdmUgc2VsZWN0b3IgdG8gdGhlIG5leHQgY2hpbGQgcGFuZVxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGRpcmVjdGlvbiAobGVmdCBvciByaWdodClcclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKi9cclxuICAgIG1vdmVDaGlsZChkaXJlY3Rpb24pXHJcbiAgICB7XHJcbiAgICAgICAgbGV0IGluZGV4XHJcbiAgICAgICAgaWYgKGRpcmVjdGlvbiA9PT0gJ2xlZnQnKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgY29uc3QgcGFyZW50ID0gdGhpcy5zZWxlY3Rvci5tZW51Lm1lbnVcclxuICAgICAgICAgICAgaW5kZXggPSBwYXJlbnQuY2hpbGRyZW4uaW5kZXhPZihwYXJlbnQuc2hvd2luZylcclxuICAgICAgICAgICAgaW5kZXgtLVxyXG4gICAgICAgICAgICBpbmRleCA9IChpbmRleCA8IDApID8gcGFyZW50LmNoaWxkcmVuLmxlbmd0aCAtIDEgOiBpbmRleFxyXG4gICAgICAgICAgICBwYXJlbnQuY2hpbGRyZW5baW5kZXhdLmhhbmRsZUNsaWNrKClcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgbGV0IHBhcmVudCA9IHRoaXMuc2VsZWN0b3IubWVudS5tZW51XHJcbiAgICAgICAgICAgIGxldCBzZWxlY3RvciA9IHBhcmVudC5zaG93aW5nXHJcbiAgICAgICAgICAgIHdoaWxlICghcGFyZW50LmFwcGxpY2F0aW9uTWVudSlcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgc2VsZWN0b3IgPSBwYXJlbnQuc2hvd2luZ1xyXG4gICAgICAgICAgICAgICAgc2VsZWN0b3IuaGFuZGxlQ2xpY2soKVxyXG4gICAgICAgICAgICAgICAgc2VsZWN0b3IuZGl2LnN0eWxlLmJhY2tncm91bmRDb2xvciA9ICd0cmFuc3BhcmVudCdcclxuICAgICAgICAgICAgICAgIHBhcmVudCA9IHBhcmVudC5tZW51XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaW5kZXggPSBwYXJlbnQuY2hpbGRyZW4uaW5kZXhPZihzZWxlY3RvcilcclxuICAgICAgICAgICAgaW5kZXgrK1xyXG4gICAgICAgICAgICBpbmRleCA9IChpbmRleCA9PT0gcGFyZW50LmNoaWxkcmVuLmxlbmd0aCkgPyAwIDogaW5kZXhcclxuICAgICAgICAgICAgcGFyZW50LmNoaWxkcmVuW2luZGV4XS5oYW5kbGVDbGljaygpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuc2VsZWN0b3IgPSBudWxsXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBtb3ZlIHNlbGVjdG9yIHJpZ2h0IGFuZCBsZWZ0XHJcbiAgICAgKiBAcGFyYW0ge01vdXNlRXZlbnR9IGVcclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBkaXJlY3Rpb25cclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKi9cclxuICAgIGhvcml6b250YWxTZWxlY3RvcihlLCBkaXJlY3Rpb24pXHJcbiAgICB7XHJcbiAgICAgICAgaWYgKGRpcmVjdGlvbiA9PT0gJ3JpZ2h0JylcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLnNlbGVjdG9yLnN1Ym1lbnUpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2VsZWN0b3IuaGFuZGxlQ2xpY2soZSlcclxuICAgICAgICAgICAgICAgIHRoaXMuc2VsZWN0b3Iuc3VibWVudS5zZWxlY3RvciA9IHRoaXMuc2VsZWN0b3Iuc3VibWVudS5jaGlsZHJlblswXVxyXG4gICAgICAgICAgICAgICAgdGhpcy5zZWxlY3Rvci5zdWJtZW51LnNlbGVjdG9yLmRpdi5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSBDb25maWcuU2VsZWN0ZWRCYWNrZ3JvdW5kU3R5bGVcclxuICAgICAgICAgICAgICAgIHRoaXMuc2VsZWN0b3IgPSBudWxsXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLm1vdmVDaGlsZChkaXJlY3Rpb24pXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAoZGlyZWN0aW9uID09PSAnbGVmdCcpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBpZiAoIXRoaXMuc2VsZWN0b3IubWVudS5tZW51LmFwcGxpY2F0aW9uTWVudSlcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zZWxlY3Rvci5tZW51LmF0dGFjaGVkLmhhbmRsZUNsaWNrKGUpXHJcbiAgICAgICAgICAgICAgICB0aGlzLnNlbGVjdG9yLm1lbnUubWVudS5zZWxlY3RvciA9IHRoaXMuc2VsZWN0b3IubWVudS5hdHRhY2hlZFxyXG4gICAgICAgICAgICAgICAgdGhpcy5zZWxlY3RvciA9IG51bGxcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHRoaXMubW92ZUNoaWxkKGRpcmVjdGlvbilcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpXHJcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBtb3ZlIHRoZSBzZWxlY3RvciBpbiB0aGUgbWVudVxyXG4gICAgICogQHBhcmFtIHtLZXlib2FyZEV2ZW50fSBlXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gZGlyZWN0aW9uIChsZWZ0LCByaWdodCwgdXAsIGRvd24pXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICBtb3ZlKGUsIGRpcmVjdGlvbilcclxuICAgIHtcclxuICAgICAgICBpZiAodGhpcy5zZWxlY3RvcilcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMuc2VsZWN0b3IuZGl2LnN0eWxlLmJhY2tncm91bmRDb2xvciA9ICd0cmFuc3BhcmVudCdcclxuICAgICAgICAgICAgbGV0IGluZGV4ID0gdGhpcy5jaGlsZHJlbi5pbmRleE9mKHRoaXMuc2VsZWN0b3IpXHJcbiAgICAgICAgICAgIGlmIChkaXJlY3Rpb24gPT09ICdkb3duJylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgaW5kZXgrK1xyXG4gICAgICAgICAgICAgICAgaW5kZXggPSAoaW5kZXggPT09IHRoaXMuY2hpbGRyZW4ubGVuZ3RoKSA/IDAgOiBpbmRleFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2UgaWYgKGRpcmVjdGlvbiA9PT0gJ3VwJylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgaW5kZXgtLVxyXG4gICAgICAgICAgICAgICAgaW5kZXggPSAoaW5kZXggPCAwKSA/IHRoaXMuY2hpbGRyZW4ubGVuZ3RoIC0gMSA6IGluZGV4XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5ob3Jpem9udGFsU2VsZWN0b3IoZSwgZGlyZWN0aW9uKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMuc2VsZWN0b3IgPSB0aGlzLmNoaWxkcmVuW2luZGV4XVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBpZiAoZGlyZWN0aW9uID09PSAndXAnKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNlbGVjdG9yID0gdGhpcy5jaGlsZHJlblt0aGlzLmNoaWxkcmVuLmxlbmd0aCAtIDFdXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNlbGVjdG9yID0gdGhpcy5jaGlsZHJlblswXVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuc2VsZWN0b3IuZGl2LnN0eWxlLmJhY2tncm91bmRDb2xvciA9IENvbmZpZy5TZWxlY3RlZEJhY2tncm91bmRTdHlsZVxyXG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKVxyXG4gICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKClcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIGNsaWNrIHRoZSBzZWxlY3RvciB3aXRoIGtleWJvYXJkXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICBlbnRlcihlKVxyXG4gICAge1xyXG4gICAgICAgIGlmICh0aGlzLnNlbGVjdG9yKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5zZWxlY3Rvci5oYW5kbGVDbGljayhlKVxyXG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KClcclxuICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIGFycmF5IGNvbnRhaW5pbmcgdGhlIG1lbnUncyBpdGVtc1xyXG4gICAgICogQHByb3BlcnR5IHtNZW51SXRlbXNbXX0gaXRlbXNcclxuICAgICAqIEByZWFkb25seVxyXG4gICAgICovXHJcbiAgICBnZXQgaXRlbXMoKVxyXG4gICAge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmNoaWxkcmVuXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBzZXRzIGFjdGl2ZSBhcHBsaWNhdGlvbiBNZW51IChhbmQgcmVtb3ZlcyBhbnkgZXhpc3RpbmcgYXBwbGljYXRpb24gbWVudXMpXHJcbiAgICAgKiBAcGFyYW0ge01lbnV9IG1lbnVcclxuICAgICAqL1xyXG4gICAgc3RhdGljIHNldEFwcGxpY2F0aW9uTWVudShtZW51KVxyXG4gICAge1xyXG4gICAgICAgIEdsb2JhbEFjY2VsZXJhdG9yLmluaXQoKVxyXG4gICAgICAgIGlmIChfYXBwbGljYXRpb24pXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBfYXBwbGljYXRpb24ucmVtb3ZlKClcclxuICAgICAgICB9XHJcbiAgICAgICAgX2FwcGxpY2F0aW9uID0gaHRtbCh7IHBhcmVudDogZG9jdW1lbnQuYm9keSwgc3R5bGVzOiBDb25maWcuQXBwbGljYXRpb25Db250YWluZXJTdHlsZSB9KVxyXG4gICAgICAgIF9hcHBsaWNhdGlvbi5tZW51ID0gbWVudVxyXG4gICAgICAgIG1lbnUuYXBwbHlDb25maWcoQ29uZmlnLkFwcGxpY2F0aW9uTWVudVN0eWxlKVxyXG4gICAgICAgIGZvciAobGV0IGNoaWxkIG9mIG1lbnUuY2hpbGRyZW4pXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBjaGlsZC5hcHBseUNvbmZpZyhDb25maWcuQXBwbGljYXRpb25NZW51Um93U3R5bGUpXHJcbiAgICAgICAgICAgIGlmIChjaGlsZC5hcnJvdylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgY2hpbGQuYXJyb3cuc3R5bGUuZGlzcGxheSA9ICdub25lJ1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIG1lbnUuZGl2LmFwcGVuZENoaWxkKGNoaWxkLmRpdilcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIF9hcHBsaWNhdGlvbi5hcHBlbmRDaGlsZChtZW51LmRpdilcclxuICAgICAgICBtZW51LmFwcGxpY2F0aW9uTWVudSA9IHRydWVcclxuICAgICAgICBtZW51LmRpdi50YWJJbmRleCA9IC0xXHJcblxyXG4gICAgICAgIC8vIGRvbid0IGxldCBtZW51IGJhciBmb2N1cyB1bmxlc3Mgd2luZG93cyBhcmUgb3BlbiAodGhpcyBmaXhlcyBhIGZvY3VzIGJ1ZylcclxuICAgICAgICBtZW51LmRpdi5hZGRFdmVudExpc3RlbmVyKCdmb2N1cycsICgpID0+XHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBpZiAoIW1lbnUuc2hvd2luZylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgbWVudS5kaXYuYmx1cigpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KVxyXG5cclxuICAgICAgICAvLyBjbG9zZSBhbGwgd2luZG93cyBpZiBtZW51IGlzIG5vIGxvbmdlciB0aGUgZm9jdXNcclxuICAgICAgICBtZW51LmRpdi5hZGRFdmVudExpc3RlbmVyKCdibHVyJywgKCkgPT5cclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGlmIChtZW51LnNob3dpbmcpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIG1lbnUuY2xvc2VBbGwoKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSlcclxuICAgICAgICBtZW51LnNob3dBY2NlbGVyYXRvcnMoKVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogR2xvYmFsQWNjZWxlcmF0b3IgZGVmaW5pdGlvblxyXG4gICAgICogQHR5cGUge0FjY2VsZXJhdG9yfVxyXG4gICAgICovXHJcbiAgICBzdGF0aWMgZ2V0IEdsb2JhbEFjY2VsZXJhdG9yKClcclxuICAgIHtcclxuICAgICAgICByZXR1cm4gR2xvYmFsQWNjZWxlcmF0b3JcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIHVzZSB0aGlzIHRvIGNoYW5nZSB0aGUgZGVmYXVsdCBDb25maWcgc2V0dGluZ3MgYWNyb3NzIGFsbCBtZW51c1xyXG4gICAgICogQHR5cGUge0NvbmZpZ31cclxuICAgICAqL1xyXG4gICAgc3RhdGljIGdldCBDb25maWcoKVxyXG4gICAge1xyXG4gICAgICAgIHJldHVybiBDb25maWdcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIE1lbnVJdGVtIGRlZmluaXRpb25cclxuICAgICAqIEB0eXBlIHtNZW51SXRlbX1cclxuICAgICAqL1xyXG4gICAgc3RhdGljIGdldCBNZW51SXRlbSgpXHJcbiAgICB7XHJcbiAgICAgICAgcmV0dXJuIE1lbnVJdGVtXHJcbiAgICB9XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gTWVudSJdfQ==