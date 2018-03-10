const Config = require('./config');
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
     * GlobalAccelerator used by menu and provides a way to register keyboard accelerators throughout the application
     * @typedef {Accelerator}
     */
    static get GlobalAccelerator() {
        if (!_accelerator) {
            _accelerator = new Accelerators({ div: document.body });
        }
        return _accelerator;
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9tZW51LmpzIl0sIm5hbWVzIjpbIkNvbmZpZyIsInJlcXVpcmUiLCJNZW51SXRlbSIsIkFjY2VsZXJhdG9ycyIsImh0bWwiLCJfYWNjZWxlcmF0b3IiLCJfYXBwbGljYXRpb24iLCJNZW51IiwiY29uc3RydWN0b3IiLCJvcHRpb25zIiwiZGl2IiwiZG9jdW1lbnQiLCJjcmVhdGVFbGVtZW50Iiwic3R5bGVzIiwiY2hpbGRyZW4iLCJhcHBseUNvbmZpZyIsIk1lbnVTdHlsZSIsInRhYkluZGV4IiwiYXBwZW5kIiwibWVudUl0ZW0iLCJzdWJtZW51IiwibWVudSIsImFwcGVuZENoaWxkIiwidHlwZSIsInB1c2giLCJpbnNlcnQiLCJwb3MiLCJjaGlsZE5vZGVzIiwibGVuZ3RoIiwiaW5zZXJ0QmVmb3JlIiwic3BsaWNlIiwiaGlkZSIsImN1cnJlbnQiLCJzaG93aW5nIiwic3R5bGUiLCJiYWNrZ3JvdW5kQ29sb3IiLCJyZW1vdmUiLCJuZXh0Iiwic2hvdyIsIkdsb2JhbEFjY2VsZXJhdG9yIiwidW5yZWdpc3Rlck1lbnVTaG9ydGN1dHMiLCJzaG93QWNjZWxlcmF0b3JzIiwiaW5kZXhPZiIsImhpZGVBY2NlbGVyYXRvcnMiLCJwYXJlbnQiLCJhcHBsaWNhdGlvbk1lbnUiLCJsZWZ0Iiwib2Zmc2V0TGVmdCIsInRvcCIsIm9mZnNldFRvcCIsIm9mZnNldEhlaWdodCIsIm9mZnNldFdpZHRoIiwiT3ZlcmxhcCIsImF0dGFjaGVkIiwiZ2V0QXBwbGljYXRpb25EaXYiLCJsYWJlbCIsImFjY2VsZXJhdG9yIiwiYXJyb3ciLCJjaGVja2VkIiwiY2hpbGQiLCJjaGVjayIsIndpZHRoIiwiTWluaW11bUNvbHVtbldpZHRoIiwiY2hpbGRMYWJlbCIsImNoaWxkQWNjZWxlcmF0b3IiLCJ3aW5kb3ciLCJpbm5lcldpZHRoIiwiaW5uZXJIZWlnaHQiLCJiYXNlIiwic2hvd1Nob3J0Y3V0IiwiaW5kZXgiLCJ0ZXh0IiwicmVnaXN0ZXJNZW51U2hvcnRjdXQiLCJyZWdpc3Rlck1lbnVTcGVjaWFsIiwiaGlkZVNob3J0Y3V0IiwiY2xvc2VBbGwiLCJiYWNrZ3JvdW5kIiwibW92ZUNoaWxkIiwiZGlyZWN0aW9uIiwic2VsZWN0b3IiLCJoYW5kbGVDbGljayIsImhvcml6b250YWxTZWxlY3RvciIsImUiLCJTZWxlY3RlZEJhY2tncm91bmRTdHlsZSIsInN0b3BQcm9wYWdhdGlvbiIsInByZXZlbnREZWZhdWx0IiwibW92ZSIsImVudGVyIiwiaXRlbXMiLCJnZXRBcHBsaWNhdGlvbk1lbnUiLCJzZXRBcHBsaWNhdGlvbk1lbnUiLCJib2R5IiwiQXBwbGljYXRpb25Db250YWluZXJTdHlsZSIsIkFwcGxpY2F0aW9uTWVudVN0eWxlIiwiQXBwbGljYXRpb25NZW51Um93U3R5bGUiLCJkaXNwbGF5IiwiYWRkRXZlbnRMaXN0ZW5lciIsImJsdXIiLCJtb2R1bGUiLCJleHBvcnRzIl0sIm1hcHBpbmdzIjoiQUFBQSxNQUFNQSxTQUFXQyxRQUFRLFVBQVIsQ0FBakI7QUFDQSxNQUFNQyxXQUFXRCxRQUFRLFlBQVIsQ0FBakI7QUFDQSxNQUFNRSxlQUFlRixRQUFRLGdCQUFSLENBQXJCO0FBQ0EsTUFBTUcsT0FBT0gsUUFBUSxRQUFSLENBQWI7O0FBRUEsSUFBSUksWUFBSixFQUFrQkMsWUFBbEI7O0FBRUEsTUFBTUMsSUFBTixDQUNBO0FBQ0k7Ozs7O0FBS0FDLGdCQUFZQyxPQUFaLEVBQ0E7QUFDSUEsa0JBQVVBLFdBQVcsRUFBckI7QUFDQSxhQUFLQyxHQUFMLEdBQVdDLFNBQVNDLGFBQVQsQ0FBdUIsS0FBdkIsQ0FBWDtBQUNBLGFBQUtDLE1BQUwsR0FBY0osUUFBUUksTUFBdEI7QUFDQSxhQUFLQyxRQUFMLEdBQWdCLEVBQWhCO0FBQ0EsYUFBS0MsV0FBTCxDQUFpQmYsT0FBT2dCLFNBQXhCO0FBQ0EsYUFBS04sR0FBTCxDQUFTTyxRQUFULEdBQW9CLENBQUMsQ0FBckI7QUFDSDs7QUFFRDs7OztBQUlBQyxXQUFPQyxRQUFQLEVBQ0E7QUFDSSxZQUFJQSxTQUFTQyxPQUFi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SDtBQUNELGVBQU90RixZQUFQO0FBQ0g7O0FBRUQ7Ozs7QUFJQSxlQUFXTCxNQUFYLEdBQ0E7QUFDSSxlQUFPQSxNQUFQO0FBQ0g7O0FBRUQ7Ozs7QUFJQSxlQUFXRSxRQUFYLEdBQ0E7QUFDSSxlQUFPQSxRQUFQO0FBQ0g7QUFsZEw7O0FBcWRBZ0csT0FBT0MsT0FBUCxHQUFpQjVGLElBQWpCIiwiZmlsZSI6Im1lbnUuanMiLCJzb3VyY2VzQ29udGVudCI6WyJjb25zdCBDb25maWcgPSAgIHJlcXVpcmUoJy4vY29uZmlnJylcclxuY29uc3QgTWVudUl0ZW0gPSByZXF1aXJlKCcuL21lbnVJdGVtJylcclxuY29uc3QgQWNjZWxlcmF0b3JzID0gcmVxdWlyZSgnLi9hY2NlbGVyYXRvcnMnKVxyXG5jb25zdCBodG1sID0gcmVxdWlyZSgnLi9odG1sJylcclxuXHJcbmxldCBfYWNjZWxlcmF0b3IsIF9hcHBsaWNhdGlvblxyXG5cclxuY2xhc3MgTWVudVxyXG57XHJcbiAgICAvKipcclxuICAgICAqIGNyZWF0ZXMgYSBtZW51IGJhclxyXG4gICAgICogQHBhcmFtIHtvYmplY3R9IFtvcHRpb25zXVxyXG4gICAgICogQHBhcmFtIHtvYmplY3R9IFtvcHRpb25zLnN0eWxlc10gYWRkaXRpb25hbCBDU1Mgc3R5bGVzIGZvciBtZW51XHJcbiAgICAgKi9cclxuICAgIGNvbnN0cnVjdG9yKG9wdGlvbnMpXHJcbiAgICB7XHJcbiAgICAgICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge31cclxuICAgICAgICB0aGlzLmRpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpXHJcbiAgICAgICAgdGhpcy5zdHlsZXMgPSBvcHRpb25zLnN0eWxlc1xyXG4gICAgICAgIHRoaXMuY2hpbGRyZW4gPSBbXVxyXG4gICAgICAgIHRoaXMuYXBwbHlDb25maWcoQ29uZmlnLk1lbnVTdHlsZSlcclxuICAgICAgICB0aGlzLmRpdi50YWJJbmRleCA9IC0xXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBhcHBlbmQgYSBNZW51SXRlbSB0byB0aGUgTWVudVxyXG4gICAgICogQHBhcmFtIHtNZW51SXRlbX0gbWVudUl0ZW1cclxuICAgICAqL1xyXG4gICAgYXBwZW5kKG1lbnVJdGVtKVxyXG4gICAge1xyXG4gICAgICAgIGlmIChtZW51SXRlbS5zdWJtZW51KVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgbWVudUl0ZW0uc3VibWVudS5tZW51ID0gdGhpc1xyXG4gICAgICAgIH1cclxuICAgICAgICBtZW51SXRlbS5tZW51ID0gdGhpc1xyXG4gICAgICAgIHRoaXMuZGl2LmFwcGVuZENoaWxkKG1lbnVJdGVtLmRpdilcclxuICAgICAgICBpZiAobWVudUl0ZW0udHlwZSAhPT0gJ3NlcGFyYXRvcicpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLmNoaWxkcmVuLnB1c2gobWVudUl0ZW0pXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogaW5zZXJ0cyBhIE1lbnVJdGVtIGludG8gdGhlIE1lbnVcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBwb3NcclxuICAgICAqIEBwYXJhbSB7TWVudUl0ZW19IG1lbnVJdGVtXHJcbiAgICAgKi9cclxuICAgIGluc2VydChwb3MsIG1lbnVJdGVtKVxyXG4gICAge1xyXG4gICAgICAgIGlmIChwb3MgPj0gdGhpcy5kaXYuY2hpbGROb2Rlcy5sZW5ndGgpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLmFwcGVuZChtZW51SXRlbSlcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgaWYgKG1lbnVJdGVtLnN1Ym1lbnUpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIG1lbnVJdGVtLnN1Ym1lbnUubWVudSA9IHRoaXNcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBtZW51SXRlbS5tZW51ID0gdGhpc1xyXG4gICAgICAgICAgICB0aGlzLmRpdi5pbnNlcnRCZWZvcmUobWVudUl0ZW0uZGl2LCB0aGlzLmRpdi5jaGlsZE5vZGVzW3Bvc10pXHJcbiAgICAgICAgICAgIGlmIChtZW51SXRlbS50eXBlICE9PSAnc2VwYXJhdG9yJylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jaGlsZHJlbi5zcGxpY2UocG9zLCAwLCBtZW51SXRlbSlcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBoaWRlKClcclxuICAgIHtcclxuICAgICAgICBsZXQgY3VycmVudCA9IHRoaXMubWVudS5zaG93aW5nXHJcbiAgICAgICAgd2hpbGUgKGN1cnJlbnQgJiYgY3VycmVudC5zdWJtZW51KVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgY3VycmVudC5kaXYuc3R5bGUuYmFja2dyb3VuZENvbG9yID0gJ3RyYW5zcGFyZW50J1xyXG4gICAgICAgICAgICBjdXJyZW50LnN1Ym1lbnUuZGl2LnJlbW92ZSgpXHJcbiAgICAgICAgICAgIGxldCBuZXh0ID0gY3VycmVudC5zdWJtZW51LnNob3dpbmdcclxuICAgICAgICAgICAgaWYgKG5leHQpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGN1cnJlbnQuc3VibWVudS5zaG93aW5nLmRpdi5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSAndHJhbnNwYXJlbnQnXHJcbiAgICAgICAgICAgICAgICBjdXJyZW50LnN1Ym1lbnUuc2hvd2luZyA9IG51bGxcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjdXJyZW50ID0gbmV4dFxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBzaG93KG1lbnVJdGVtKVxyXG4gICAge1xyXG4gICAgICAgIE1lbnUuR2xvYmFsQWNjZWxlcmF0b3IudW5yZWdpc3Rlck1lbnVTaG9ydGN1dHMoKVxyXG4gICAgICAgIGlmICh0aGlzLm1lbnUgJiYgdGhpcy5tZW51LnNob3dpbmcgPT09IG1lbnVJdGVtKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5oaWRlKClcclxuICAgICAgICAgICAgdGhpcy5tZW51LnNob3dpbmcgPSBudWxsXHJcbiAgICAgICAgICAgIHRoaXMuZGl2LnJlbW92ZSgpXHJcbiAgICAgICAgICAgIHRoaXMubWVudS5zaG93QWNjZWxlcmF0b3JzKClcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMubWVudSlcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMubWVudS5zaG93aW5nICYmIHRoaXMubWVudS5jaGlsZHJlbi5pbmRleE9mKG1lbnVJdGVtKSAhPT0gLTEpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5oaWRlKClcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHRoaXMubWVudS5zaG93aW5nID0gbWVudUl0ZW1cclxuICAgICAgICAgICAgICAgIHRoaXMubWVudS5oaWRlQWNjZWxlcmF0b3JzKClcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjb25zdCBkaXYgPSBtZW51SXRlbS5kaXZcclxuICAgICAgICAgICAgY29uc3QgcGFyZW50ID0gdGhpcy5tZW51LmRpdlxyXG4gICAgICAgICAgICBpZiAodGhpcy5tZW51LmFwcGxpY2F0aW9uTWVudSlcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kaXYuc3R5bGUubGVmdCA9IGRpdi5vZmZzZXRMZWZ0ICsgJ3B4J1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kaXYuc3R5bGUudG9wID0gZGl2Lm9mZnNldFRvcCArIGRpdi5vZmZzZXRIZWlnaHQgKyAncHgnXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRpdi5zdHlsZS5sZWZ0ID0gcGFyZW50Lm9mZnNldExlZnQgKyBwYXJlbnQub2Zmc2V0V2lkdGggLSBDb25maWcuT3ZlcmxhcCArICdweCdcclxuICAgICAgICAgICAgICAgIHRoaXMuZGl2LnN0eWxlLnRvcCA9IHBhcmVudC5vZmZzZXRUb3AgKyBkaXYub2Zmc2V0VG9wIC0gQ29uZmlnLk92ZXJsYXAgKyAncHgnXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5hdHRhY2hlZCA9IG1lbnVJdGVtXHJcbiAgICAgICAgICAgIHRoaXMuc2hvd0FjY2VsZXJhdG9ycygpXHJcbiAgICAgICAgICAgIHRoaXMuZ2V0QXBwbGljYXRpb25EaXYoKS5hcHBlbmRDaGlsZCh0aGlzLmRpdilcclxuICAgICAgICAgICAgbGV0IGxhYmVsID0gMCwgYWNjZWxlcmF0b3IgPSAwLCBhcnJvdyA9IDAsIGNoZWNrZWQgPSAwXHJcbiAgICAgICAgICAgIGZvciAobGV0IGNoaWxkIG9mIHRoaXMuY2hpbGRyZW4pXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGNoaWxkLmNoZWNrLnN0eWxlLndpZHRoID0gJ2F1dG8nXHJcbiAgICAgICAgICAgICAgICBjaGlsZC5sYWJlbC5zdHlsZS53aWR0aCA9ICdhdXRvJ1xyXG4gICAgICAgICAgICAgICAgY2hpbGQuYWNjZWxlcmF0b3Iuc3R5bGUud2lkdGggPSAnYXV0bydcclxuICAgICAgICAgICAgICAgIGNoaWxkLmFycm93LnN0eWxlLndpZHRoID0gJ2F1dG8nXHJcbiAgICAgICAgICAgICAgICBpZiAoY2hpbGQudHlwZSA9PT0gJ2NoZWNrYm94JylcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBjaGVja2VkID0gQ29uZmlnLk1pbmltdW1Db2x1bW5XaWR0aFxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKGNoaWxkLnN1Ym1lbnUpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgYXJyb3cgPSBDb25maWcuTWluaW11bUNvbHVtbldpZHRoXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZm9yIChsZXQgY2hpbGQgb2YgdGhpcy5jaGlsZHJlbilcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgY2hpbGRMYWJlbCA9IGNoaWxkLmxhYmVsLm9mZnNldFdpZHRoICogMlxyXG4gICAgICAgICAgICAgICAgbGFiZWwgPSBjaGlsZExhYmVsID4gbGFiZWwgPyBjaGlsZExhYmVsIDogbGFiZWxcclxuICAgICAgICAgICAgICAgIGNvbnN0IGNoaWxkQWNjZWxlcmF0b3IgPSBjaGlsZC5hY2NlbGVyYXRvci5vZmZzZXRXaWR0aFxyXG4gICAgICAgICAgICAgICAgYWNjZWxlcmF0b3IgPSBjaGlsZEFjY2VsZXJhdG9yID4gYWNjZWxlcmF0b3IgPyBjaGlsZEFjY2VsZXJhdG9yIDogYWNjZWxlcmF0b3JcclxuICAgICAgICAgICAgICAgIGlmIChjaGlsZC5zdWJtZW51KVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGFycm93ID0gY2hpbGQuYXJyb3cub2Zmc2V0V2lkdGhcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBmb3IgKGxldCBjaGlsZCBvZiB0aGlzLmNoaWxkcmVuKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBjaGlsZC5jaGVjay5zdHlsZS53aWR0aCA9IGNoZWNrZWQgKyAncHgnXHJcbiAgICAgICAgICAgICAgICBjaGlsZC5sYWJlbC5zdHlsZS53aWR0aCA9IGxhYmVsICsgJ3B4J1xyXG4gICAgICAgICAgICAgICAgY2hpbGQuYWNjZWxlcmF0b3Iuc3R5bGUud2lkdGggPSBhY2NlbGVyYXRvciArICdweCdcclxuICAgICAgICAgICAgICAgIGNoaWxkLmFycm93LnN0eWxlLndpZHRoID0gYXJyb3cgKyAncHgnXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKHRoaXMuZGl2Lm9mZnNldExlZnQgKyB0aGlzLmRpdi5vZmZzZXRXaWR0aCA+IHdpbmRvdy5pbm5lcldpZHRoKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRpdi5zdHlsZS5sZWZ0ID0gd2luZG93LmlubmVyV2lkdGggLSB0aGlzLmRpdi5vZmZzZXRXaWR0aCArICdweCdcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAodGhpcy5kaXYub2Zmc2V0VG9wICsgdGhpcy5kaXYub2Zmc2V0SGVpZ2h0ID4gd2luZG93LmlubmVySGVpZ2h0KVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRpdi5zdHlsZS50b3AgPSB3aW5kb3cuaW5uZXJIZWlnaHQgLSB0aGlzLmRpdi5vZmZzZXRIZWlnaHQgKyAncHgnXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgYXBwbHlDb25maWcoYmFzZSlcclxuICAgIHtcclxuICAgICAgICBjb25zdCBzdHlsZXMgPSB7fVxyXG4gICAgICAgIGZvciAobGV0IHN0eWxlIGluIGJhc2UpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBzdHlsZXNbc3R5bGVdID0gYmFzZVtzdHlsZV1cclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHRoaXMuc3R5bGVzKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgZm9yIChsZXQgc3R5bGUgaW4gdGhpcy5zdHlsZXMpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHN0eWxlc1tzdHlsZV0gPSB0aGlzLnN0eWxlc1tzdHlsZV1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBmb3IgKGxldCBzdHlsZSBpbiBzdHlsZXMpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLmRpdi5zdHlsZVtzdHlsZV0gPSBzdHlsZXNbc3R5bGVdXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHNob3dBY2NlbGVyYXRvcnMoKVxyXG4gICAge1xyXG4gICAgICAgIGZvciAobGV0IGNoaWxkIG9mIHRoaXMuY2hpbGRyZW4pXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBjaGlsZC5zaG93U2hvcnRjdXQoKVxyXG4gICAgICAgICAgICBpZiAoY2hpbGQudHlwZSAhPT0gJ3NlcGFyYXRvcicpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGluZGV4ID0gY2hpbGQudGV4dC5pbmRleE9mKCcmJylcclxuICAgICAgICAgICAgICAgIGlmIChpbmRleCAhPT0gLTEpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgTWVudS5HbG9iYWxBY2NlbGVyYXRvci5yZWdpc3Rlck1lbnVTaG9ydGN1dChjaGlsZC50ZXh0W2luZGV4ICsgMV0sIGNoaWxkKVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICghdGhpcy5hcHBsaWNhdGlvbk1lbnUpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBNZW51Lkdsb2JhbEFjY2VsZXJhdG9yLnJlZ2lzdGVyTWVudVNwZWNpYWwodGhpcylcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgaGlkZUFjY2VsZXJhdG9ycygpXHJcbiAgICB7XHJcbiAgICAgICAgZm9yIChsZXQgY2hpbGQgb2YgdGhpcy5jaGlsZHJlbilcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGNoaWxkLmhpZGVTaG9ydGN1dCgpXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGNsb3NlQWxsKClcclxuICAgIHtcclxuICAgICAgICBpZiAodGhpcy5zaG93aW5nKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgbGV0IG1lbnUgPSB0aGlzXHJcbiAgICAgICAgICAgIHdoaWxlIChtZW51LnNob3dpbmcpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIG1lbnUgPSBtZW51LnNob3dpbmcuc3VibWVudVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHdoaWxlIChtZW51ICYmICFtZW51LmFwcGxpY2F0aW9uTWVudSlcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgaWYgKG1lbnUuc2hvd2luZylcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBtZW51LnNob3dpbmcuZGl2LnN0eWxlLmJhY2tncm91bmRDb2xvciA9ICd0cmFuc3BhcmVudCdcclxuICAgICAgICAgICAgICAgICAgICBtZW51LnNob3dpbmcgPSBudWxsXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBtZW51LmRpdi5yZW1vdmUoKVxyXG4gICAgICAgICAgICAgICAgbWVudSA9IG1lbnUubWVudVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChtZW51KVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBtZW51LnNob3dpbmcuZGl2LnN0eWxlLmJhY2tncm91bmQgPSAndHJhbnNwYXJlbnQnXHJcbiAgICAgICAgICAgICAgICBtZW51LnNob3dpbmcgPSBudWxsXHJcbiAgICAgICAgICAgICAgICBtZW51LnNob3dBY2NlbGVyYXRvcnMoKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGdldEFwcGxpY2F0aW9uRGl2KClcclxuICAgIHtcclxuICAgICAgICByZXR1cm4gX2FwcGxpY2F0aW9uXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBtb3ZlIHNlbGVjdG9yIHRvIHRoZSBuZXh0IGNoaWxkIHBhbmVcclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBkaXJlY3Rpb24gKGxlZnQgb3IgcmlnaHQpXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICBtb3ZlQ2hpbGQoZGlyZWN0aW9uKVxyXG4gICAge1xyXG4gICAgICAgIGxldCBpbmRleFxyXG4gICAgICAgIGlmIChkaXJlY3Rpb24gPT09ICdsZWZ0JylcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGNvbnN0IHBhcmVudCA9IHRoaXMuc2VsZWN0b3IubWVudS5tZW51XHJcbiAgICAgICAgICAgIGluZGV4ID0gcGFyZW50LmNoaWxkcmVuLmluZGV4T2YocGFyZW50LnNob3dpbmcpXHJcbiAgICAgICAgICAgIGluZGV4LS1cclxuICAgICAgICAgICAgaW5kZXggPSAoaW5kZXggPCAwKSA/IHBhcmVudC5jaGlsZHJlbi5sZW5ndGggLSAxIDogaW5kZXhcclxuICAgICAgICAgICAgcGFyZW50LmNoaWxkcmVuW2luZGV4XS5oYW5kbGVDbGljaygpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2VcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGxldCBwYXJlbnQgPSB0aGlzLnNlbGVjdG9yLm1lbnUubWVudVxyXG4gICAgICAgICAgICBsZXQgc2VsZWN0b3IgPSBwYXJlbnQuc2hvd2luZ1xyXG4gICAgICAgICAgICB3aGlsZSAoIXBhcmVudC5hcHBsaWNhdGlvbk1lbnUpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHNlbGVjdG9yID0gcGFyZW50LnNob3dpbmdcclxuICAgICAgICAgICAgICAgIHNlbGVjdG9yLmhhbmRsZUNsaWNrKClcclxuICAgICAgICAgICAgICAgIHNlbGVjdG9yLmRpdi5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSAndHJhbnNwYXJlbnQnXHJcbiAgICAgICAgICAgICAgICBwYXJlbnQgPSBwYXJlbnQubWVudVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGluZGV4ID0gcGFyZW50LmNoaWxkcmVuLmluZGV4T2Yoc2VsZWN0b3IpXHJcbiAgICAgICAgICAgIGluZGV4KytcclxuICAgICAgICAgICAgaW5kZXggPSAoaW5kZXggPT09IHBhcmVudC5jaGlsZHJlbi5sZW5ndGgpID8gMCA6IGluZGV4XHJcbiAgICAgICAgICAgIHBhcmVudC5jaGlsZHJlbltpbmRleF0uaGFuZGxlQ2xpY2soKVxyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLnNlbGVjdG9yID0gbnVsbFxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogbW92ZSBzZWxlY3RvciByaWdodCBhbmQgbGVmdFxyXG4gICAgICogQHBhcmFtIHtNb3VzZUV2ZW50fSBlXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gZGlyZWN0aW9uXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICBob3Jpem9udGFsU2VsZWN0b3IoZSwgZGlyZWN0aW9uKVxyXG4gICAge1xyXG4gICAgICAgIGlmIChkaXJlY3Rpb24gPT09ICdyaWdodCcpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5zZWxlY3Rvci5zdWJtZW51KVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNlbGVjdG9yLmhhbmRsZUNsaWNrKGUpXHJcbiAgICAgICAgICAgICAgICB0aGlzLnNlbGVjdG9yLnN1Ym1lbnUuc2VsZWN0b3IgPSB0aGlzLnNlbGVjdG9yLnN1Ym1lbnUuY2hpbGRyZW5bMF1cclxuICAgICAgICAgICAgICAgIHRoaXMuc2VsZWN0b3Iuc3VibWVudS5zZWxlY3Rvci5kaXYuc3R5bGUuYmFja2dyb3VuZENvbG9yID0gQ29uZmlnLlNlbGVjdGVkQmFja2dyb3VuZFN0eWxlXHJcbiAgICAgICAgICAgICAgICB0aGlzLnNlbGVjdG9yID0gbnVsbFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5tb3ZlQ2hpbGQoZGlyZWN0aW9uKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKGRpcmVjdGlvbiA9PT0gJ2xlZnQnKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgaWYgKCF0aGlzLnNlbGVjdG9yLm1lbnUubWVudS5hcHBsaWNhdGlvbk1lbnUpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2VsZWN0b3IubWVudS5hdHRhY2hlZC5oYW5kbGVDbGljayhlKVxyXG4gICAgICAgICAgICAgICAgdGhpcy5zZWxlY3Rvci5tZW51Lm1lbnUuc2VsZWN0b3IgPSB0aGlzLnNlbGVjdG9yLm1lbnUuYXR0YWNoZWRcclxuICAgICAgICAgICAgICAgIHRoaXMuc2VsZWN0b3IgPSBudWxsXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLm1vdmVDaGlsZChkaXJlY3Rpb24pXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKVxyXG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogbW92ZSB0aGUgc2VsZWN0b3IgaW4gdGhlIG1lbnVcclxuICAgICAqIEBwYXJhbSB7S2V5Ym9hcmRFdmVudH0gZVxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGRpcmVjdGlvbiAobGVmdCwgcmlnaHQsIHVwLCBkb3duKVxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqL1xyXG4gICAgbW92ZShlLCBkaXJlY3Rpb24pXHJcbiAgICB7XHJcbiAgICAgICAgaWYgKHRoaXMuc2VsZWN0b3IpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLnNlbGVjdG9yLmRpdi5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSAndHJhbnNwYXJlbnQnXHJcbiAgICAgICAgICAgIGxldCBpbmRleCA9IHRoaXMuY2hpbGRyZW4uaW5kZXhPZih0aGlzLnNlbGVjdG9yKVxyXG4gICAgICAgICAgICBpZiAoZGlyZWN0aW9uID09PSAnZG93bicpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGluZGV4KytcclxuICAgICAgICAgICAgICAgIGluZGV4ID0gKGluZGV4ID09PSB0aGlzLmNoaWxkcmVuLmxlbmd0aCkgPyAwIDogaW5kZXhcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIGlmIChkaXJlY3Rpb24gPT09ICd1cCcpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGluZGV4LS1cclxuICAgICAgICAgICAgICAgIGluZGV4ID0gKGluZGV4IDwgMCkgPyB0aGlzLmNoaWxkcmVuLmxlbmd0aCAtIDEgOiBpbmRleFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuaG9yaXpvbnRhbFNlbGVjdG9yKGUsIGRpcmVjdGlvbilcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLnNlbGVjdG9yID0gdGhpcy5jaGlsZHJlbltpbmRleF1cclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgaWYgKGRpcmVjdGlvbiA9PT0gJ3VwJylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zZWxlY3RvciA9IHRoaXMuY2hpbGRyZW5bdGhpcy5jaGlsZHJlbi5sZW5ndGggLSAxXVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zZWxlY3RvciA9IHRoaXMuY2hpbGRyZW5bMF1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLnNlbGVjdG9yLmRpdi5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSBDb25maWcuU2VsZWN0ZWRCYWNrZ3JvdW5kU3R5bGVcclxuICAgICAgICBlLnByZXZlbnREZWZhdWx0KClcclxuICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBjbGljayB0aGUgc2VsZWN0b3Igd2l0aCBrZXlib2FyZFxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqL1xyXG4gICAgZW50ZXIoZSlcclxuICAgIHtcclxuICAgICAgICBpZiAodGhpcy5zZWxlY3RvcilcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMuc2VsZWN0b3IuaGFuZGxlQ2xpY2soZSlcclxuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXHJcbiAgICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKClcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBhcnJheSBjb250YWluaW5nIHRoZSBtZW51J3MgaXRlbXNcclxuICAgICAqIEBwcm9wZXJ0eSB7TWVudUl0ZW1zW119IGl0ZW1zXHJcbiAgICAgKiBAcmVhZG9ubHlcclxuICAgICAqL1xyXG4gICAgZ2V0IGl0ZW1zKClcclxuICAgIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5jaGlsZHJlblxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogZ2V0cyBhY3RpdmUgYXBwbGljYXRpb24gTWVudVxyXG4gICAgICogQHJldHVybiB7TWVudX1cclxuICAgICAqL1xyXG4gICAgc3RhdGljIGdldEFwcGxpY2F0aW9uTWVudSgpXHJcbiAgICB7XHJcbiAgICAgICAgcmV0dXJuIF9hcHBsaWNhdGlvbi5tZW51XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBzZXRzIGFjdGl2ZSBhcHBsaWNhdGlvbiBNZW51IChhbmQgcmVtb3ZlcyBhbnkgZXhpc3RpbmcgYXBwbGljYXRpb24gbWVudXMpXHJcbiAgICAgKiBAcGFyYW0ge01lbnV9IG1lbnVcclxuICAgICAqL1xyXG4gICAgc3RhdGljIHNldEFwcGxpY2F0aW9uTWVudShtZW51KVxyXG4gICAge1xyXG4gICAgICAgIGlmIChfYXBwbGljYXRpb24pXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBfYXBwbGljYXRpb24ucmVtb3ZlKClcclxuICAgICAgICB9XHJcbiAgICAgICAgX2FwcGxpY2F0aW9uID0gaHRtbCh7IHBhcmVudDogZG9jdW1lbnQuYm9keSwgc3R5bGVzOiBDb25maWcuQXBwbGljYXRpb25Db250YWluZXJTdHlsZSB9KVxyXG4gICAgICAgIF9hcHBsaWNhdGlvbi5tZW51ID0gbWVudVxyXG4gICAgICAgIG1lbnUuYXBwbHlDb25maWcoQ29uZmlnLkFwcGxpY2F0aW9uTWVudVN0eWxlKVxyXG4gICAgICAgIGZvciAobGV0IGNoaWxkIG9mIG1lbnUuY2hpbGRyZW4pXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBjaGlsZC5hcHBseUNvbmZpZyhDb25maWcuQXBwbGljYXRpb25NZW51Um93U3R5bGUpXHJcbiAgICAgICAgICAgIGlmIChjaGlsZC5hcnJvdylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgY2hpbGQuYXJyb3cuc3R5bGUuZGlzcGxheSA9ICdub25lJ1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIG1lbnUuZGl2LmFwcGVuZENoaWxkKGNoaWxkLmRpdilcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIF9hcHBsaWNhdGlvbi5hcHBlbmRDaGlsZChtZW51LmRpdilcclxuICAgICAgICBtZW51LmFwcGxpY2F0aW9uTWVudSA9IHRydWVcclxuICAgICAgICBtZW51LmRpdi50YWJJbmRleCA9IC0xXHJcblxyXG4gICAgICAgIC8vIGRvbid0IGxldCBtZW51IGJhciBmb2N1cyB1bmxlc3Mgd2luZG93cyBhcmUgb3BlbiAodGhpcyBmaXhlcyBhIGZvY3VzIGJ1ZylcclxuICAgICAgICBtZW51LmRpdi5hZGRFdmVudExpc3RlbmVyKCdmb2N1cycsICgpID0+XHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBpZiAoIW1lbnUuc2hvd2luZylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgbWVudS5kaXYuYmx1cigpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KVxyXG5cclxuICAgICAgICAvLyBjbG9zZSBhbGwgd2luZG93cyBpZiBtZW51IGlzIG5vIGxvbmdlciB0aGUgZm9jdXNcclxuICAgICAgICBtZW51LmRpdi5hZGRFdmVudExpc3RlbmVyKCdibHVyJywgKCkgPT5cclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGlmIChtZW51LnNob3dpbmcpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIG1lbnUuY2xvc2VBbGwoKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSlcclxuICAgICAgICBtZW51LnNob3dBY2NlbGVyYXRvcnMoKVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogR2xvYmFsQWNjZWxlcmF0b3IgdXNlZCBieSBtZW51IGFuZCBwcm92aWRlcyBhIHdheSB0byByZWdpc3RlciBrZXlib2FyZCBhY2NlbGVyYXRvcnMgdGhyb3VnaG91dCB0aGUgYXBwbGljYXRpb25cclxuICAgICAqIEB0eXBlZGVmIHtBY2NlbGVyYXRvcn1cclxuICAgICAqL1xyXG4gICAgc3RhdGljIGdldCBHbG9iYWxBY2NlbGVyYXRvcigpXHJcbiAgICB7XHJcbiAgICAgICAgaWYgKCFfYWNjZWxlcmF0b3IpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBfYWNjZWxlcmF0b3IgPSBuZXcgQWNjZWxlcmF0b3JzKHsgZGl2OiBkb2N1bWVudC5ib2R5IH0pXHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBfYWNjZWxlcmF0b3JcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIHVzZSB0aGlzIHRvIGNoYW5nZSB0aGUgZGVmYXVsdCBDb25maWcgc2V0dGluZ3MgYWNyb3NzIGFsbCBtZW51c1xyXG4gICAgICogQHR5cGUge0NvbmZpZ31cclxuICAgICAqL1xyXG4gICAgc3RhdGljIGdldCBDb25maWcoKVxyXG4gICAge1xyXG4gICAgICAgIHJldHVybiBDb25maWdcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIE1lbnVJdGVtIGRlZmluaXRpb25cclxuICAgICAqIEB0eXBlIHtNZW51SXRlbX1cclxuICAgICAqL1xyXG4gICAgc3RhdGljIGdldCBNZW51SXRlbSgpXHJcbiAgICB7XHJcbiAgICAgICAgcmV0dXJuIE1lbnVJdGVtXHJcbiAgICB9XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gTWVudSJdfQ==