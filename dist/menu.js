const Styles = require('./styles');
const MenuItem = require('./menuItem');
const Accelerators = require('./accelerators');
const html = require('./html');

let _accelerator, _application;

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
        this.applyStyles(Styles.MenuStyle);
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
        Menu.GlobalAccelarator.unregisterMenuShortcuts();
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
                this.div.style.left = parent.offsetLeft + parent.offsetWidth - Styles.Overlap + 'px';
                this.div.style.top = parent.offsetTop + div.offsetTop - Styles.Overlap + 'px';
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
                    checked = Styles.MinimumColumnWidth;
                }
                if (child.submenu) {
                    arrow = Styles.MinimumColumnWidth;
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

    showAccelerators() {
        for (let child of this.children) {
            child.showShortcut();
            if (child.type !== 'separator') {
                const index = child.text.indexOf('&');
                if (index !== -1) {
                    Menu.GlobalAccelarator.registerMenuShortcut(child.text[index + 1], child);
                }
            }
        }
        if (!this.applicationMenu) {
            Menu.GlobalAccelarator.registerMenuSpecial(this);
        }
    }

    hideAccelerators() {
        for (let child of this.children) {
            child.hideShortcut();
        }
    }

    closeAll() {
        if (this.showing) {
            let menu = this;
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
     * move to the next child pane
     * @param {string} direction (left or right)
     * @private
     */
    moveChild(direction) {
        const parent = this.selector.menu.menu;
        let index = parent.children.indexOf(parent.showing);
        if (direction === 'left') {
            index--;
            index = index < 0 ? parent.children.length - 1 : index;
        } else {
            index++;
            index = index === parent.children.length ? 0 : index;
        }
        parent.children[index].handleClick({});
        this.selector = null;
    }

    /**
     * move if selector exists
     * @param {MouseEvent} e
     * @param {string} direction
     * @private
     */
    moveSelector(e, direction) {
        this.selector.div.style.backgroundColor = 'transparent';
        let index = this.children.indexOf(this.selector);
        if (direction === 'down' || direction === 'up') {
            if (direction === 'down') {
                index++;
                index = index === this.children.length ? 0 : index;
            } else {
                index--;
                index = index < 0 ? this.children.length - 1 : index;
            }
            this.selector = this.children[index];
        } else {
            if (direction === 'right') {
                if (this.selector.submenu) {
                    this.selector.handleClick(e);
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
            e.preventDefault();
            return true;
        }
    }

    /**
     * move the selector in the menu
     * @param {KeyboardEvent} e
     * @param {string} direction (left, right, up, down)
     * @private
     */
    move(e, direction) {
        if (this.selector) {
            if (this.moveSelector(e, direction)) {
                return;
            }
        } else {
            if (direction === 'up') {
                this.selector = this.children[this.children.length - 1];
            } else {
                this.selector = this.children[0];
            }
        }
        this.selector.div.style.backgroundColor = Styles.SelectedBackground;
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
     * gets active application Menu
     * @return {Menu}
     */
    static getApplicationMenu() {
        return _application.menu;
    }

    /**
     * sets active application Menu (and removes any existing application menus)
     * @param {Menu} menu
     */
    static setApplicationMenu(menu) {
        if (_application) {
            _application.remove();
        }
        _application = html({ parent: document.body, styles: Styles.ApplicationContainer });
        _application.menu = menu;
        menu.applyStyles(Styles.ApplicationMenuStyle);
        for (let child of menu.children) {
            child.applyStyles(Styles.ApplicationMenuRowStyle);
            if (child.arrow) {
                child.arrow.style.display = 'none';
            }
            menu.div.appendChild(child.div);
        }
        menu.div.tabIndex = -1;
        _application.appendChild(menu.div);
        menu.applicationMenu = true;
        menu.div.addEventListener('blur', () => menu.closeAll());
        menu.showAccelerators();
    }

    /**
     * GlobalAccelerator used by menu and provides a way to register keyboard accelerators throughout the application
     * @typedef {Accelerator}
     */
    static get GlobalAccelarator() {
        if (!_accelerator) {
            _accelerator = new Accelerators({ div: document.body });
        }
        return _accelerator;
    }
}

Menu.MenuItem = MenuItem;

module.exports = Menu;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9tZW51LmpzIl0sIm5hbWVzIjpbIlN0eWxlcyIsInJlcXVpcmUiLCJNZW51SXRlbSIsIkFjY2VsZXJhdG9ycyIsImh0bWwiLCJfYWNjZWxlcmF0b3IiLCJfYXBwbGljYXRpb24iLCJNZW51IiwiY29uc3RydWN0b3IiLCJvcHRpb25zIiwiZGl2IiwiZG9jdW1lbnQiLCJjcmVhdGVFbGVtZW50Iiwic3R5bGVzIiwiY2hpbGRyZW4iLCJhcHBseVN0eWxlcyIsIk1lbnVTdHlsZSIsImFwcGVuZCIsIm1lbnVJdGVtIiwic3VibWVudSIsIm1lbnUiLCJhcHBlbmRDaGlsZCIsInR5cGUiLCJwdXNoIiwiaW5zZXJ0IiwicG9zIiwiY2hpbGROb2RlcyIsImxlbmd0aCIsImluc2VydEJlZm9yZSIsInNwbGljZSIsImhpZGUiLCJjdXJyZW50Iiwic2hvd2luZyIsInN0eWxlIiwiYmFja2dyb3VuZENvbG9yIiwicmVtb3ZlIiwibmV4dCIsInNob3ciLCJHbG9iYWxBY2NlbGFyYXRvciIsInVucmVnaXN0ZXJNZW51U2hvcnRjdXRzIiwic2hvd0FjY2VsZXJhdG9ycyIsImluZGV4T2YiLCJoaWRlQWNjZWxlcmF0b3JzIiwicGFyZW50IiwiYXBwbGljYXRpb25NZW51IiwibGVmdCIsIm9mZnNldExlZnQiLCJ0b3AiLCJvZmZzZXRUb3AiLCJvZmZzZXRIZWlnaHQiLCJvZmZzZXRXaWR0aCIsIk92ZXJsYXAiLCJhdHRhY2hlZCIsImdldEFwcGxpY2F0aW9uRGl2IiwibGFiZWwiLCJhY2NlbGVyYXRvciIsImFycm93IiwiY2hlY2tlZCIsImNoaWxkIiwiY2hlY2siLCJ3aWR0aCIsIk1pbmltdW1Db2x1bW5XaWR0aCIsImNoaWxkTGFiZWwiLCJjaGlsZEFjY2VsZXJhdG9yIiwid2luZG93IiwiaW5uZXJXaWR0aCIsImlubmVySGVpZ2h0IiwiYmFzZSIsInNob3dTaG9ydGN1dCIsImluZGV4IiwidGV4dCIsInJlZ2lzdGVyTWVudVNob3J0Y3V0IiwicmVnaXN0ZXJNZW51U3BlY2lhbCIsImhpZGVTaG9ydGN1dCIsImNsb3NlQWxsIiwiYmFja2dyb3VuZCIsIm1vdmVDaGlsZCIsImRpcmVjdGlvbiIsInNlbGVjdG9yIiwiaGFuZGxlQ2xpY2siLCJtb3ZlU2VsZWN0b3IiLCJlIiwicHJldmVudERlZmF1bHQiLCJtb3ZlIiwiU2VsZWN0ZWRCYWNrZ3JvdW5kIiwic3RvcFByb3BhZ2F0aW9uIiwiZW50ZXIiLCJpdGVtcyIsImdldEFwcGxpY2F0aW9uTWVudSIsInNldEFwcGxpY2F0aW9uTWVudSIsImJvZHkiLCJBcHBsaWNhdGlvbkNvbnRhaW5lciIsIkFwcGxpY2F0aW9uTWVudVN0eWxlIiwiQXBwbGljYXRpb25NZW51Um93U3R5bGUiLCJkaXNwbGF5IiwidGFiSW5kZXgiLCJhZGRFdmVudExpc3RlbmVyIiwibW9kdWxlIiwiZXhwb3J0cyJdLCJtYXBwaW5ncyI6IkFBQUEsTUFBTUEsU0FBV0MsUUFBUSxVQUFSLENBQWpCO0FBQ0EsTUFBTUMsV0FBV0QsUUFBUSxZQUFSLENBQWpCO0FBQ0EsTUFBTUUsZUFBZUYsUUFBUSxnQkFBUixDQUFyQjtBQUNBLE1BQU1HLE9BQU9ILFFBQVEsUUFBUixDQUFiOztBQUVBLElBQUlJLFlBQUosRUFBa0JDLFlBQWxCOztBQUVBLE1BQU1DLElBQU4sQ0FDQTtBQUNJOzs7OztBQUtBQyxnQkFBWUMsT0FBWixFQUNBO0FBQ0lBLGtCQUFVQSxXQUFXLEVBQXJCO0FBQ0EsYUFBS0MsR0FBTCxHQUFXQyxTQUFTQyxhQUFULENBQXVCLEtBQXZCLENBQVg7QUFDQSxhQUFLQyxNQUFMLEdBQWNKLFFBQVFJLE1BQXRCO0FBQ0EsYUFBS0MsUUFBTCxHQUFnQixFQUFoQjtBQUNBLGFBQUtDLFdBQUwsQ0FBaUJmLE9BQU9nQixTQUF4QjtBQUNIOztBQUVEOzs7O0FBSUFDLFdBQU9DLFFBQVAsRUFDQTtBQUNJLFlBQUlBLFNBQVNDLE9BQWIsRUFDQTtBQUNJRCxxQkFBU0MsT0FBVCxDQUFpQkMsSUFBakIsR0FBd0IsSUFBeEI7QUFDSDtBQUNERixpQkFBU0Us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QUNBO0FBQ0lBLDJCQUFlLElBQUlGLFlBQUosQ0FBaUIsRUFBRU8sS0FBS0MsU0FBUytFLElBQWhCLEVBQWpCLENBQWY7QUFDSDtBQUNELGVBQU9yRixZQUFQO0FBQ0g7QUFuYUw7O0FBc2FBRSxLQUFLTCxRQUFMLEdBQWdCQSxRQUFoQjs7QUFFQStGLE9BQU9DLE9BQVAsR0FBaUIzRixJQUFqQiIsImZpbGUiOiJtZW51LmpzIiwic291cmNlc0NvbnRlbnQiOlsiY29uc3QgU3R5bGVzID0gICByZXF1aXJlKCcuL3N0eWxlcycpXHJcbmNvbnN0IE1lbnVJdGVtID0gcmVxdWlyZSgnLi9tZW51SXRlbScpXHJcbmNvbnN0IEFjY2VsZXJhdG9ycyA9IHJlcXVpcmUoJy4vYWNjZWxlcmF0b3JzJylcclxuY29uc3QgaHRtbCA9IHJlcXVpcmUoJy4vaHRtbCcpXHJcblxyXG5sZXQgX2FjY2VsZXJhdG9yLCBfYXBwbGljYXRpb25cclxuXHJcbmNsYXNzIE1lbnVcclxue1xyXG4gICAgLyoqXHJcbiAgICAgKiBjcmVhdGVzIGEgbWVudSBiYXJcclxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBbb3B0aW9uc11cclxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBbb3B0aW9ucy5zdHlsZXNdIGFkZGl0aW9uYWwgQ1NTIHN0eWxlcyBmb3IgbWVudVxyXG4gICAgICovXHJcbiAgICBjb25zdHJ1Y3RvcihvcHRpb25zKVxyXG4gICAge1xyXG4gICAgICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9XHJcbiAgICAgICAgdGhpcy5kaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKVxyXG4gICAgICAgIHRoaXMuc3R5bGVzID0gb3B0aW9ucy5zdHlsZXNcclxuICAgICAgICB0aGlzLmNoaWxkcmVuID0gW11cclxuICAgICAgICB0aGlzLmFwcGx5U3R5bGVzKFN0eWxlcy5NZW51U3R5bGUpXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBhcHBlbmQgYSBNZW51SXRlbSB0byB0aGUgTWVudVxyXG4gICAgICogQHBhcmFtIHtNZW51SXRlbX0gbWVudUl0ZW1cclxuICAgICAqL1xyXG4gICAgYXBwZW5kKG1lbnVJdGVtKVxyXG4gICAge1xyXG4gICAgICAgIGlmIChtZW51SXRlbS5zdWJtZW51KVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgbWVudUl0ZW0uc3VibWVudS5tZW51ID0gdGhpc1xyXG4gICAgICAgIH1cclxuICAgICAgICBtZW51SXRlbS5tZW51ID0gdGhpc1xyXG4gICAgICAgIHRoaXMuZGl2LmFwcGVuZENoaWxkKG1lbnVJdGVtLmRpdilcclxuICAgICAgICBpZiAobWVudUl0ZW0udHlwZSAhPT0gJ3NlcGFyYXRvcicpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLmNoaWxkcmVuLnB1c2gobWVudUl0ZW0pXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogaW5zZXJ0cyBhIE1lbnVJdGVtIGludG8gdGhlIE1lbnVcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBwb3NcclxuICAgICAqIEBwYXJhbSB7TWVudUl0ZW19IG1lbnVJdGVtXHJcbiAgICAgKi9cclxuICAgIGluc2VydChwb3MsIG1lbnVJdGVtKVxyXG4gICAge1xyXG4gICAgICAgIGlmIChwb3MgPj0gdGhpcy5kaXYuY2hpbGROb2Rlcy5sZW5ndGgpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLmFwcGVuZChtZW51SXRlbSlcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgaWYgKG1lbnVJdGVtLnN1Ym1lbnUpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIG1lbnVJdGVtLnN1Ym1lbnUubWVudSA9IHRoaXNcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBtZW51SXRlbS5tZW51ID0gdGhpc1xyXG4gICAgICAgICAgICB0aGlzLmRpdi5pbnNlcnRCZWZvcmUobWVudUl0ZW0uZGl2LCB0aGlzLmRpdi5jaGlsZE5vZGVzW3Bvc10pXHJcbiAgICAgICAgICAgIGlmIChtZW51SXRlbS50eXBlICE9PSAnc2VwYXJhdG9yJylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jaGlsZHJlbi5zcGxpY2UocG9zLCAwLCBtZW51SXRlbSlcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBoaWRlKClcclxuICAgIHtcclxuICAgICAgICBsZXQgY3VycmVudCA9IHRoaXMubWVudS5zaG93aW5nXHJcbiAgICAgICAgd2hpbGUgKGN1cnJlbnQgJiYgY3VycmVudC5zdWJtZW51KVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgY3VycmVudC5kaXYuc3R5bGUuYmFja2dyb3VuZENvbG9yID0gJ3RyYW5zcGFyZW50J1xyXG4gICAgICAgICAgICBjdXJyZW50LnN1Ym1lbnUuZGl2LnJlbW92ZSgpXHJcbiAgICAgICAgICAgIGxldCBuZXh0ID0gY3VycmVudC5zdWJtZW51LnNob3dpbmdcclxuICAgICAgICAgICAgaWYgKG5leHQpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGN1cnJlbnQuc3VibWVudS5zaG93aW5nLmRpdi5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSAndHJhbnNwYXJlbnQnXHJcbiAgICAgICAgICAgICAgICBjdXJyZW50LnN1Ym1lbnUuc2hvd2luZyA9IG51bGxcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjdXJyZW50ID0gbmV4dFxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBzaG93KG1lbnVJdGVtKVxyXG4gICAge1xyXG4gICAgICAgIE1lbnUuR2xvYmFsQWNjZWxhcmF0b3IudW5yZWdpc3Rlck1lbnVTaG9ydGN1dHMoKVxyXG4gICAgICAgIGlmICh0aGlzLm1lbnUgJiYgdGhpcy5tZW51LnNob3dpbmcgPT09IG1lbnVJdGVtKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5oaWRlKClcclxuICAgICAgICAgICAgdGhpcy5tZW51LnNob3dpbmcgPSBudWxsXHJcbiAgICAgICAgICAgIHRoaXMuZGl2LnJlbW92ZSgpXHJcbiAgICAgICAgICAgIHRoaXMubWVudS5zaG93QWNjZWxlcmF0b3JzKClcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMubWVudSlcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMubWVudS5zaG93aW5nICYmIHRoaXMubWVudS5jaGlsZHJlbi5pbmRleE9mKG1lbnVJdGVtKSAhPT0gLTEpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5oaWRlKClcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHRoaXMubWVudS5zaG93aW5nID0gbWVudUl0ZW1cclxuICAgICAgICAgICAgICAgIHRoaXMubWVudS5oaWRlQWNjZWxlcmF0b3JzKClcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjb25zdCBkaXYgPSBtZW51SXRlbS5kaXZcclxuICAgICAgICAgICAgY29uc3QgcGFyZW50ID0gdGhpcy5tZW51LmRpdlxyXG4gICAgICAgICAgICBpZiAodGhpcy5tZW51LmFwcGxpY2F0aW9uTWVudSlcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kaXYuc3R5bGUubGVmdCA9IGRpdi5vZmZzZXRMZWZ0ICsgJ3B4J1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kaXYuc3R5bGUudG9wID0gZGl2Lm9mZnNldFRvcCArIGRpdi5vZmZzZXRIZWlnaHQgKyAncHgnXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRpdi5zdHlsZS5sZWZ0ID0gcGFyZW50Lm9mZnNldExlZnQgKyBwYXJlbnQub2Zmc2V0V2lkdGggLSBTdHlsZXMuT3ZlcmxhcCArICdweCdcclxuICAgICAgICAgICAgICAgIHRoaXMuZGl2LnN0eWxlLnRvcCA9IHBhcmVudC5vZmZzZXRUb3AgKyBkaXYub2Zmc2V0VG9wIC0gU3R5bGVzLk92ZXJsYXAgKyAncHgnXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5hdHRhY2hlZCA9IG1lbnVJdGVtXHJcbiAgICAgICAgICAgIHRoaXMuc2hvd0FjY2VsZXJhdG9ycygpXHJcbiAgICAgICAgICAgIHRoaXMuZ2V0QXBwbGljYXRpb25EaXYoKS5hcHBlbmRDaGlsZCh0aGlzLmRpdilcclxuICAgICAgICAgICAgbGV0IGxhYmVsID0gMCwgYWNjZWxlcmF0b3IgPSAwLCBhcnJvdyA9IDAsIGNoZWNrZWQgPSAwXHJcbiAgICAgICAgICAgIGZvciAobGV0IGNoaWxkIG9mIHRoaXMuY2hpbGRyZW4pXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGNoaWxkLmNoZWNrLnN0eWxlLndpZHRoID0gJ2F1dG8nXHJcbiAgICAgICAgICAgICAgICBjaGlsZC5sYWJlbC5zdHlsZS53aWR0aCA9ICdhdXRvJ1xyXG4gICAgICAgICAgICAgICAgY2hpbGQuYWNjZWxlcmF0b3Iuc3R5bGUud2lkdGggPSAnYXV0bydcclxuICAgICAgICAgICAgICAgIGNoaWxkLmFycm93LnN0eWxlLndpZHRoID0gJ2F1dG8nXHJcbiAgICAgICAgICAgICAgICBpZiAoY2hpbGQudHlwZSA9PT0gJ2NoZWNrYm94JylcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBjaGVja2VkID0gU3R5bGVzLk1pbmltdW1Db2x1bW5XaWR0aFxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKGNoaWxkLnN1Ym1lbnUpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgYXJyb3cgPSBTdHlsZXMuTWluaW11bUNvbHVtbldpZHRoXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZm9yIChsZXQgY2hpbGQgb2YgdGhpcy5jaGlsZHJlbilcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgY2hpbGRMYWJlbCA9IGNoaWxkLmxhYmVsLm9mZnNldFdpZHRoICogMlxyXG4gICAgICAgICAgICAgICAgbGFiZWwgPSBjaGlsZExhYmVsID4gbGFiZWwgPyBjaGlsZExhYmVsIDogbGFiZWxcclxuICAgICAgICAgICAgICAgIGNvbnN0IGNoaWxkQWNjZWxlcmF0b3IgPSBjaGlsZC5hY2NlbGVyYXRvci5vZmZzZXRXaWR0aFxyXG4gICAgICAgICAgICAgICAgYWNjZWxlcmF0b3IgPSBjaGlsZEFjY2VsZXJhdG9yID4gYWNjZWxlcmF0b3IgPyBjaGlsZEFjY2VsZXJhdG9yIDogYWNjZWxlcmF0b3JcclxuICAgICAgICAgICAgICAgIGlmIChjaGlsZC5zdWJtZW51KVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGFycm93ID0gY2hpbGQuYXJyb3cub2Zmc2V0V2lkdGhcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBmb3IgKGxldCBjaGlsZCBvZiB0aGlzLmNoaWxkcmVuKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBjaGlsZC5jaGVjay5zdHlsZS53aWR0aCA9IGNoZWNrZWQgKyAncHgnXHJcbiAgICAgICAgICAgICAgICBjaGlsZC5sYWJlbC5zdHlsZS53aWR0aCA9IGxhYmVsICsgJ3B4J1xyXG4gICAgICAgICAgICAgICAgY2hpbGQuYWNjZWxlcmF0b3Iuc3R5bGUud2lkdGggPSBhY2NlbGVyYXRvciArICdweCdcclxuICAgICAgICAgICAgICAgIGNoaWxkLmFycm93LnN0eWxlLndpZHRoID0gYXJyb3cgKyAncHgnXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKHRoaXMuZGl2Lm9mZnNldExlZnQgKyB0aGlzLmRpdi5vZmZzZXRXaWR0aCA+IHdpbmRvdy5pbm5lcldpZHRoKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRpdi5zdHlsZS5sZWZ0ID0gd2luZG93LmlubmVyV2lkdGggLSB0aGlzLmRpdi5vZmZzZXRXaWR0aCArICdweCdcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAodGhpcy5kaXYub2Zmc2V0VG9wICsgdGhpcy5kaXYub2Zmc2V0SGVpZ2h0ID4gd2luZG93LmlubmVySGVpZ2h0KVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRpdi5zdHlsZS50b3AgPSB3aW5kb3cuaW5uZXJIZWlnaHQgLSB0aGlzLmRpdi5vZmZzZXRIZWlnaHQgKyAncHgnXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgYXBwbHlTdHlsZXMoYmFzZSlcclxuICAgIHtcclxuICAgICAgICBjb25zdCBzdHlsZXMgPSB7fVxyXG4gICAgICAgIGZvciAobGV0IHN0eWxlIGluIGJhc2UpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBzdHlsZXNbc3R5bGVdID0gYmFzZVtzdHlsZV1cclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHRoaXMuc3R5bGVzKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgZm9yIChsZXQgc3R5bGUgaW4gdGhpcy5zdHlsZXMpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHN0eWxlc1tzdHlsZV0gPSB0aGlzLnN0eWxlc1tzdHlsZV1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBmb3IgKGxldCBzdHlsZSBpbiBzdHlsZXMpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLmRpdi5zdHlsZVtzdHlsZV0gPSBzdHlsZXNbc3R5bGVdXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHNob3dBY2NlbGVyYXRvcnMoKVxyXG4gICAge1xyXG4gICAgICAgIGZvciAobGV0IGNoaWxkIG9mIHRoaXMuY2hpbGRyZW4pXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBjaGlsZC5zaG93U2hvcnRjdXQoKVxyXG4gICAgICAgICAgICBpZiAoY2hpbGQudHlwZSAhPT0gJ3NlcGFyYXRvcicpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGluZGV4ID0gY2hpbGQudGV4dC5pbmRleE9mKCcmJylcclxuICAgICAgICAgICAgICAgIGlmIChpbmRleCAhPT0gLTEpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgTWVudS5HbG9iYWxBY2NlbGFyYXRvci5yZWdpc3Rlck1lbnVTaG9ydGN1dChjaGlsZC50ZXh0W2luZGV4ICsgMV0sIGNoaWxkKVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICghdGhpcy5hcHBsaWNhdGlvbk1lbnUpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBNZW51Lkdsb2JhbEFjY2VsYXJhdG9yLnJlZ2lzdGVyTWVudVNwZWNpYWwodGhpcylcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgaGlkZUFjY2VsZXJhdG9ycygpXHJcbiAgICB7XHJcbiAgICAgICAgZm9yIChsZXQgY2hpbGQgb2YgdGhpcy5jaGlsZHJlbilcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGNoaWxkLmhpZGVTaG9ydGN1dCgpXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGNsb3NlQWxsKClcclxuICAgIHtcclxuICAgICAgICBpZiAodGhpcy5zaG93aW5nKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgbGV0IG1lbnUgPSB0aGlzXHJcbiAgICAgICAgICAgIHdoaWxlIChtZW51LnNob3dpbmcpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIG1lbnUgPSBtZW51LnNob3dpbmcuc3VibWVudVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHdoaWxlIChtZW51ICYmICFtZW51LmFwcGxpY2F0aW9uTWVudSlcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgaWYgKG1lbnUuc2hvd2luZylcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBtZW51LnNob3dpbmcuZGl2LnN0eWxlLmJhY2tncm91bmRDb2xvciA9ICd0cmFuc3BhcmVudCdcclxuICAgICAgICAgICAgICAgICAgICBtZW51LnNob3dpbmcgPSBudWxsXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBtZW51LmRpdi5yZW1vdmUoKVxyXG4gICAgICAgICAgICAgICAgbWVudSA9IG1lbnUubWVudVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChtZW51KVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBtZW51LnNob3dpbmcuZGl2LnN0eWxlLmJhY2tncm91bmQgPSAndHJhbnNwYXJlbnQnXHJcbiAgICAgICAgICAgICAgICBtZW51LnNob3dpbmcgPSBudWxsXHJcbiAgICAgICAgICAgICAgICBtZW51LnNob3dBY2NlbGVyYXRvcnMoKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGdldEFwcGxpY2F0aW9uRGl2KClcclxuICAgIHtcclxuICAgICAgICByZXR1cm4gX2FwcGxpY2F0aW9uXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBtb3ZlIHRvIHRoZSBuZXh0IGNoaWxkIHBhbmVcclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBkaXJlY3Rpb24gKGxlZnQgb3IgcmlnaHQpXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICBtb3ZlQ2hpbGQoZGlyZWN0aW9uKVxyXG4gICAge1xyXG4gICAgICAgIGNvbnN0IHBhcmVudCA9IHRoaXMuc2VsZWN0b3IubWVudS5tZW51XHJcbiAgICAgICAgbGV0IGluZGV4ID0gcGFyZW50LmNoaWxkcmVuLmluZGV4T2YocGFyZW50LnNob3dpbmcpXHJcbiAgICAgICAgaWYgKGRpcmVjdGlvbiA9PT0gJ2xlZnQnKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgaW5kZXgtLVxyXG4gICAgICAgICAgICBpbmRleCA9IChpbmRleCA8IDApID8gcGFyZW50LmNoaWxkcmVuLmxlbmd0aCAtIDEgOiBpbmRleFxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBpbmRleCsrXHJcbiAgICAgICAgICAgIGluZGV4ID0gKGluZGV4ID09PSBwYXJlbnQuY2hpbGRyZW4ubGVuZ3RoKSA/IDAgOiBpbmRleFxyXG4gICAgICAgIH1cclxuICAgICAgICBwYXJlbnQuY2hpbGRyZW5baW5kZXhdLmhhbmRsZUNsaWNrKHt9KVxyXG4gICAgICAgIHRoaXMuc2VsZWN0b3IgPSBudWxsXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBtb3ZlIGlmIHNlbGVjdG9yIGV4aXN0c1xyXG4gICAgICogQHBhcmFtIHtNb3VzZUV2ZW50fSBlXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gZGlyZWN0aW9uXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICBtb3ZlU2VsZWN0b3IoZSwgZGlyZWN0aW9uKVxyXG4gICAge1xyXG4gICAgICAgIHRoaXMuc2VsZWN0b3IuZGl2LnN0eWxlLmJhY2tncm91bmRDb2xvciA9ICd0cmFuc3BhcmVudCdcclxuICAgICAgICBsZXQgaW5kZXggPSB0aGlzLmNoaWxkcmVuLmluZGV4T2YodGhpcy5zZWxlY3RvcilcclxuICAgICAgICBpZiAoZGlyZWN0aW9uID09PSAnZG93bicgfHwgZGlyZWN0aW9uID09PSAndXAnKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgaWYgKGRpcmVjdGlvbiA9PT0gJ2Rvd24nKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBpbmRleCsrXHJcbiAgICAgICAgICAgICAgICBpbmRleCA9IChpbmRleCA9PT0gdGhpcy5jaGlsZHJlbi5sZW5ndGgpID8gMCA6IGluZGV4XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBpbmRleC0tXHJcbiAgICAgICAgICAgICAgICBpbmRleCA9IChpbmRleCA8IDApID8gdGhpcy5jaGlsZHJlbi5sZW5ndGggLSAxIDogaW5kZXhcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLnNlbGVjdG9yID0gdGhpcy5jaGlsZHJlbltpbmRleF1cclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgaWYgKGRpcmVjdGlvbiA9PT0gJ3JpZ2h0JylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuc2VsZWN0b3Iuc3VibWVudSlcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnNlbGVjdG9yLmhhbmRsZUNsaWNrKGUpXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zZWxlY3RvciA9IG51bGxcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLm1vdmVDaGlsZChkaXJlY3Rpb24pXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSBpZiAoZGlyZWN0aW9uID09PSAnbGVmdCcpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGlmICghdGhpcy5zZWxlY3Rvci5tZW51Lm1lbnUuYXBwbGljYXRpb25NZW51KVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2VsZWN0b3IubWVudS5hdHRhY2hlZC5oYW5kbGVDbGljayhlKVxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2VsZWN0b3IubWVudS5tZW51LnNlbGVjdG9yID0gdGhpcy5zZWxlY3Rvci5tZW51LmF0dGFjaGVkXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zZWxlY3RvciA9IG51bGxcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLm1vdmVDaGlsZChkaXJlY3Rpb24pXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogbW92ZSB0aGUgc2VsZWN0b3IgaW4gdGhlIG1lbnVcclxuICAgICAqIEBwYXJhbSB7S2V5Ym9hcmRFdmVudH0gZVxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGRpcmVjdGlvbiAobGVmdCwgcmlnaHQsIHVwLCBkb3duKVxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqL1xyXG4gICAgbW92ZShlLCBkaXJlY3Rpb24pXHJcbiAgICB7XHJcbiAgICAgICAgaWYgKHRoaXMuc2VsZWN0b3IpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5tb3ZlU2VsZWN0b3IoZSwgZGlyZWN0aW9uKSlcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgaWYgKGRpcmVjdGlvbiA9PT0gJ3VwJylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zZWxlY3RvciA9IHRoaXMuY2hpbGRyZW5bdGhpcy5jaGlsZHJlbi5sZW5ndGggLSAxXVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zZWxlY3RvciA9IHRoaXMuY2hpbGRyZW5bMF1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLnNlbGVjdG9yLmRpdi5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSBTdHlsZXMuU2VsZWN0ZWRCYWNrZ3JvdW5kXHJcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXHJcbiAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogY2xpY2sgdGhlIHNlbGVjdG9yIHdpdGgga2V5Ym9hcmRcclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKi9cclxuICAgIGVudGVyKGUpXHJcbiAgICB7XHJcbiAgICAgICAgaWYgKHRoaXMuc2VsZWN0b3IpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLnNlbGVjdG9yLmhhbmRsZUNsaWNrKGUpXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogYXJyYXkgY29udGFpbmluZyB0aGUgbWVudSdzIGl0ZW1zXHJcbiAgICAgKiBAcHJvcGVydHkge01lbnVJdGVtc1tdfSBpdGVtc1xyXG4gICAgICogQHJlYWRvbmx5XHJcbiAgICAgKi9cclxuICAgIGdldCBpdGVtcygpXHJcbiAgICB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuY2hpbGRyZW5cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIGdldHMgYWN0aXZlIGFwcGxpY2F0aW9uIE1lbnVcclxuICAgICAqIEByZXR1cm4ge01lbnV9XHJcbiAgICAgKi9cclxuICAgIHN0YXRpYyBnZXRBcHBsaWNhdGlvbk1lbnUoKVxyXG4gICAge1xyXG4gICAgICAgIHJldHVybiBfYXBwbGljYXRpb24ubWVudVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogc2V0cyBhY3RpdmUgYXBwbGljYXRpb24gTWVudSAoYW5kIHJlbW92ZXMgYW55IGV4aXN0aW5nIGFwcGxpY2F0aW9uIG1lbnVzKVxyXG4gICAgICogQHBhcmFtIHtNZW51fSBtZW51XHJcbiAgICAgKi9cclxuICAgIHN0YXRpYyBzZXRBcHBsaWNhdGlvbk1lbnUobWVudSlcclxuICAgIHtcclxuICAgICAgICBpZiAoX2FwcGxpY2F0aW9uKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgX2FwcGxpY2F0aW9uLnJlbW92ZSgpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIF9hcHBsaWNhdGlvbiA9IGh0bWwoeyBwYXJlbnQ6IGRvY3VtZW50LmJvZHksIHN0eWxlczogU3R5bGVzLkFwcGxpY2F0aW9uQ29udGFpbmVyIH0pXHJcbiAgICAgICAgX2FwcGxpY2F0aW9uLm1lbnUgPSBtZW51XHJcbiAgICAgICAgbWVudS5hcHBseVN0eWxlcyhTdHlsZXMuQXBwbGljYXRpb25NZW51U3R5bGUpXHJcbiAgICAgICAgZm9yIChsZXQgY2hpbGQgb2YgbWVudS5jaGlsZHJlbilcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGNoaWxkLmFwcGx5U3R5bGVzKFN0eWxlcy5BcHBsaWNhdGlvbk1lbnVSb3dTdHlsZSlcclxuICAgICAgICAgICAgaWYgKGNoaWxkLmFycm93KVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBjaGlsZC5hcnJvdy5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgbWVudS5kaXYuYXBwZW5kQ2hpbGQoY2hpbGQuZGl2KVxyXG4gICAgICAgIH1cclxuICAgICAgICBtZW51LmRpdi50YWJJbmRleCA9IC0xXHJcbiAgICAgICAgX2FwcGxpY2F0aW9uLmFwcGVuZENoaWxkKG1lbnUuZGl2KVxyXG4gICAgICAgIG1lbnUuYXBwbGljYXRpb25NZW51ID0gdHJ1ZVxyXG4gICAgICAgIG1lbnUuZGl2LmFkZEV2ZW50TGlzdGVuZXIoJ2JsdXInLCAoKSA9PiBtZW51LmNsb3NlQWxsKCkpXHJcbiAgICAgICAgbWVudS5zaG93QWNjZWxlcmF0b3JzKClcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEdsb2JhbEFjY2VsZXJhdG9yIHVzZWQgYnkgbWVudSBhbmQgcHJvdmlkZXMgYSB3YXkgdG8gcmVnaXN0ZXIga2V5Ym9hcmQgYWNjZWxlcmF0b3JzIHRocm91Z2hvdXQgdGhlIGFwcGxpY2F0aW9uXHJcbiAgICAgKiBAdHlwZWRlZiB7QWNjZWxlcmF0b3J9XHJcbiAgICAgKi9cclxuICAgIHN0YXRpYyBnZXQgR2xvYmFsQWNjZWxhcmF0b3IoKVxyXG4gICAge1xyXG4gICAgICAgIGlmICghX2FjY2VsZXJhdG9yKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgX2FjY2VsZXJhdG9yID0gbmV3IEFjY2VsZXJhdG9ycyh7IGRpdjogZG9jdW1lbnQuYm9keSB9KVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gX2FjY2VsZXJhdG9yXHJcbiAgICB9XHJcbn1cclxuXHJcbk1lbnUuTWVudUl0ZW0gPSBNZW51SXRlbVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBNZW51Il19