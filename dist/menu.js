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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9tZW51LmpzIl0sIm5hbWVzIjpbIkNvbmZpZyIsInJlcXVpcmUiLCJNZW51SXRlbSIsIkxvY2FsQWNjZWxlcmF0b3IiLCJodG1sIiwiX2FwcGxpY2F0aW9uIiwiTWVudSIsImNvbnN0cnVjdG9yIiwib3B0aW9ucyIsImRpdiIsImRvY3VtZW50IiwiY3JlYXRlRWxlbWVudCIsInN0eWxlcyIsImNoaWxkcmVuIiwiYXBwbHlDb25maWciLCJNZW51U3R5bGUiLCJ0YWJJbmRleCIsImFwcGVuZCIsIm1lbnVJdGVtIiwic3VibWVudSIsIm1lbnUiLCJhcHBlbmRDaGlsZCIsInR5cGUiLCJwdXNoIiwiaW5zZXJ0IiwicG9zIiwiY2hpbGROb2RlcyIsImxlbmd0aCIsImluc2VydEJlZm9yZSIsInNwbGljZSIsImhpZGUiLCJjdXJyZW50Iiwic2hvd2luZyIsInN0eWxlIiwiYmFja2dyb3VuZENvbG9yIiwicmVtb3ZlIiwibmV4dCIsInNob3ciLCJ1bnJlZ2lzdGVyTWVudVNob3J0Y3V0cyIsInNob3dBY2NlbGVyYXRvcnMiLCJpbmRleE9mIiwiaGlkZUFjY2VsZXJhdG9ycyIsInBhcmVudCIsImFwcGxpY2F0aW9uTWVudSIsImxlZnQiLCJvZmZzZXRMZWZ0IiwidG9wIiwib2Zmc2V0VG9wIiwib2Zmc2V0SGVpZ2h0Iiwib2Zmc2V0V2lkdGgiLCJPdmVybGFwIiwiYXR0YWNoZWQiLCJnZXRBcHBsaWNhdGlvbkRpdiIsImxhYmVsIiwiYWNjZWxlcmF0b3IiLCJhcnJvdyIsImNoZWNrZWQiLCJjaGlsZCIsImNoZWNrIiwid2lkdGgiLCJNaW5pbXVtQ29sdW1uV2lkdGgiLCJjaGlsZExhYmVsIiwiY2hpbGRBY2NlbGVyYXRvciIsIndpbmRvdyIsImlubmVyV2lkdGgiLCJpbm5lckhlaWdodCIsImJhc2UiLCJzaG93U2hvcnRjdXQiLCJpbmRleCIsInRleHQiLCJyZWdpc3Rlck1lbnVTaG9ydGN1dCIsInJlZ2lzdGVyTWVudVNwZWNpYWwiLCJoaWRlU2hvcnRjdXQiLCJjbG9zZUFsbCIsImFwcGxpY2F0aW9uIiwiYmFja2dyb3VuZCIsIm1vdmVDaGlsZCIsImRpcmVjdGlvbiIsInNlbGVjdG9yIiwiaGFuZGxlQ2xpY2siLCJob3Jpem9udGFsU2VsZWN0b3IiLCJlIiwiU2VsZWN0ZWRCYWNrZ3JvdW5kU3R5bGUiLCJzdG9wUHJvcGFnYXRpb24iLCJwcmV2ZW50RGVmYXVsdCIsIm1vdmUiLCJlbnRlciIsIml0ZW1zIiwic2hvd0FwcGxpY2F0aW9uQWNjZWxlcmF0b3JzIiwicmVnaXN0ZXJBbHQiLCJzZXRBcHBsaWNhdGlvbk1lbnUiLCJpbml0IiwiYm9keSIsIkFwcGxpY2F0aW9uQ29udGFpbmVyU3R5bGUiLCJBcHBsaWNhdGlvbk1lbnVTdHlsZSIsIkFwcGxpY2F0aW9uTWVudVJvd1N0eWxlIiwiZGlzcGxheSIsImFkZEV2ZW50TGlzdGVuZXIiLCJibHVyIiwibW9kdWxlIiwiZXhwb3J0cyJdLCJtYXBwaW5ncyI6IkFBQUEsTUFBTUEsU0FBV0MsUUFBUSxVQUFSLENBQWpCO0FBQ0EsTUFBTUMsV0FBV0QsUUFBUSxZQUFSLENBQWpCO0FBQ0EsTUFBTUUsbUJBQW1CRixRQUFRLG9CQUFSLENBQXpCO0FBQ0EsTUFBTUcsT0FBT0gsUUFBUSxRQUFSLENBQWI7O0FBRUEsSUFBSUksWUFBSjs7QUFFQSxNQUFNQyxJQUFOLENBQ0E7QUFDSTs7Ozs7QUFLQUMsZ0JBQVlDLE9BQVosRUFDQTtBQUNJQSxrQkFBVUEsV0FBVyxFQUFyQjtBQUNBLGFBQUtDLEdBQUwsR0FBV0MsU0FBU0MsYUFBVCxDQUF1QixLQUF2QixDQUFYO0FBQ0EsYUFBS0MsTUFBTCxHQUFjSixRQUFRSSxNQUF0QjtBQUNBLGFBQUtDLFFBQUwsR0FBZ0IsRUFBaEI7QUFDQSxhQUFLQyxXQUFMLENBQWlCZCxPQUFPZSxTQUF4QjtBQUNBLGFBQUtOLEdBQUwsQ0FBU08sUUFBVCxHQUFvQixDQUFDLENBQXJCO0FBQ0g7O0FBRUQ7Ozs7QUFJQUMsV0FBT0MsUUFBUCxFQUNBO0FBQ0ksWUFBSUEsU0FBU0MsT0FB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O0FBQ0ksZ0JBQUk3RSxLQUFLWSxPQUFULEVBQ0E7QUFDSVoscUJBQUtxRCxRQUFMO0FBQ0g7QUFDSixTQU5EO0FBT0FyRCxhQUFLb0UsMkJBQUw7QUFDSDs7QUFFRDs7OztBQUlBLGVBQVdyRixnQkFBWCxHQUNBO0FBQ0ksZUFBT0EsZ0JBQVA7QUFDSDs7QUFFRDs7OztBQUlBLGVBQVdILE1BQVgsR0FDQTtBQUNJLGVBQU9BLE1BQVA7QUFDSDs7QUFFRDs7OztBQUlBLGVBQVdFLFFBQVgsR0FDQTtBQUNJLGVBQU9BLFFBQVA7QUFDSDtBQTNkTDs7QUE4ZEFpRyxPQUFPQyxPQUFQLEdBQWlCOUYsSUFBakIiLCJmaWxlIjoibWVudS5qcyIsInNvdXJjZXNDb250ZW50IjpbImNvbnN0IENvbmZpZyA9ICAgcmVxdWlyZSgnLi9jb25maWcnKVxyXG5jb25zdCBNZW51SXRlbSA9IHJlcXVpcmUoJy4vbWVudUl0ZW0nKVxyXG5jb25zdCBMb2NhbEFjY2VsZXJhdG9yID0gcmVxdWlyZSgnLi9sb2NhbEFjY2VsZXJhdG9yJylcclxuY29uc3QgaHRtbCA9IHJlcXVpcmUoJy4vaHRtbCcpXHJcblxyXG5sZXQgX2FwcGxpY2F0aW9uXHJcblxyXG5jbGFzcyBNZW51XHJcbntcclxuICAgIC8qKlxyXG4gICAgICogY3JlYXRlcyBhIG1lbnUgYmFyXHJcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gW29wdGlvbnNdXHJcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gW29wdGlvbnMuc3R5bGVzXSBhZGRpdGlvbmFsIENTUyBzdHlsZXMgZm9yIG1lbnVcclxuICAgICAqL1xyXG4gICAgY29uc3RydWN0b3Iob3B0aW9ucylcclxuICAgIHtcclxuICAgICAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fVxyXG4gICAgICAgIHRoaXMuZGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JylcclxuICAgICAgICB0aGlzLnN0eWxlcyA9IG9wdGlvbnMuc3R5bGVzXHJcbiAgICAgICAgdGhpcy5jaGlsZHJlbiA9IFtdXHJcbiAgICAgICAgdGhpcy5hcHBseUNvbmZpZyhDb25maWcuTWVudVN0eWxlKVxyXG4gICAgICAgIHRoaXMuZGl2LnRhYkluZGV4ID0gLTFcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIGFwcGVuZCBhIE1lbnVJdGVtIHRvIHRoZSBNZW51XHJcbiAgICAgKiBAcGFyYW0ge01lbnVJdGVtfSBtZW51SXRlbVxyXG4gICAgICovXHJcbiAgICBhcHBlbmQobWVudUl0ZW0pXHJcbiAgICB7XHJcbiAgICAgICAgaWYgKG1lbnVJdGVtLnN1Ym1lbnUpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBtZW51SXRlbS5zdWJtZW51Lm1lbnUgPSB0aGlzXHJcbiAgICAgICAgfVxyXG4gICAgICAgIG1lbnVJdGVtLm1lbnUgPSB0aGlzXHJcbiAgICAgICAgdGhpcy5kaXYuYXBwZW5kQ2hpbGQobWVudUl0ZW0uZGl2KVxyXG4gICAgICAgIGlmIChtZW51SXRlbS50eXBlICE9PSAnc2VwYXJhdG9yJylcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMuY2hpbGRyZW4ucHVzaChtZW51SXRlbSlcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBpbnNlcnRzIGEgTWVudUl0ZW0gaW50byB0aGUgTWVudVxyXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHBvc1xyXG4gICAgICogQHBhcmFtIHtNZW51SXRlbX0gbWVudUl0ZW1cclxuICAgICAqL1xyXG4gICAgaW5zZXJ0KHBvcywgbWVudUl0ZW0pXHJcbiAgICB7XHJcbiAgICAgICAgaWYgKHBvcyA+PSB0aGlzLmRpdi5jaGlsZE5vZGVzLmxlbmd0aClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMuYXBwZW5kKG1lbnVJdGVtKVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBpZiAobWVudUl0ZW0uc3VibWVudSlcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgbWVudUl0ZW0uc3VibWVudS5tZW51ID0gdGhpc1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIG1lbnVJdGVtLm1lbnUgPSB0aGlzXHJcbiAgICAgICAgICAgIHRoaXMuZGl2Lmluc2VydEJlZm9yZShtZW51SXRlbS5kaXYsIHRoaXMuZGl2LmNoaWxkTm9kZXNbcG9zXSlcclxuICAgICAgICAgICAgaWYgKG1lbnVJdGVtLnR5cGUgIT09ICdzZXBhcmF0b3InKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNoaWxkcmVuLnNwbGljZShwb3MsIDAsIG1lbnVJdGVtKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGhpZGUoKVxyXG4gICAge1xyXG4gICAgICAgIGxldCBjdXJyZW50ID0gdGhpcy5tZW51LnNob3dpbmdcclxuICAgICAgICB3aGlsZSAoY3VycmVudCAmJiBjdXJyZW50LnN1Ym1lbnUpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBjdXJyZW50LmRpdi5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSAndHJhbnNwYXJlbnQnXHJcbiAgICAgICAgICAgIGN1cnJlbnQuc3VibWVudS5kaXYucmVtb3ZlKClcclxuICAgICAgICAgICAgbGV0IG5leHQgPSBjdXJyZW50LnN1Ym1lbnUuc2hvd2luZ1xyXG4gICAgICAgICAgICBpZiAobmV4dClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgY3VycmVudC5zdWJtZW51LnNob3dpbmcuZGl2LnN0eWxlLmJhY2tncm91bmRDb2xvciA9ICd0cmFuc3BhcmVudCdcclxuICAgICAgICAgICAgICAgIGN1cnJlbnQuc3VibWVudS5zaG93aW5nID0gbnVsbFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGN1cnJlbnQgPSBuZXh0XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHNob3cobWVudUl0ZW0pXHJcbiAgICB7XHJcbiAgICAgICAgTWVudS5Mb2NhbEFjY2VsZXJhdG9yLnVucmVnaXN0ZXJNZW51U2hvcnRjdXRzKClcclxuICAgICAgICBpZiAodGhpcy5tZW51ICYmIHRoaXMubWVudS5zaG93aW5nID09PSBtZW51SXRlbSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMuaGlkZSgpXHJcbiAgICAgICAgICAgIHRoaXMubWVudS5zaG93aW5nID0gbnVsbFxyXG4gICAgICAgICAgICB0aGlzLmRpdi5yZW1vdmUoKVxyXG4gICAgICAgICAgICB0aGlzLm1lbnUuc2hvd0FjY2VsZXJhdG9ycygpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2VcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLm1lbnUpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLm1lbnUuc2hvd2luZyAmJiB0aGlzLm1lbnUuY2hpbGRyZW4uaW5kZXhPZihtZW51SXRlbSkgIT09IC0xKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaGlkZSgpXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB0aGlzLm1lbnUuc2hvd2luZyA9IG1lbnVJdGVtXHJcbiAgICAgICAgICAgICAgICB0aGlzLm1lbnUuaGlkZUFjY2VsZXJhdG9ycygpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY29uc3QgZGl2ID0gbWVudUl0ZW0uZGl2XHJcbiAgICAgICAgICAgIGNvbnN0IHBhcmVudCA9IHRoaXMubWVudS5kaXZcclxuICAgICAgICAgICAgaWYgKHRoaXMubWVudS5hcHBsaWNhdGlvbk1lbnUpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGl2LnN0eWxlLmxlZnQgPSBkaXYub2Zmc2V0TGVmdCArICdweCdcclxuICAgICAgICAgICAgICAgIHRoaXMuZGl2LnN0eWxlLnRvcCA9IGRpdi5vZmZzZXRUb3AgKyBkaXYub2Zmc2V0SGVpZ2h0ICsgJ3B4J1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kaXYuc3R5bGUubGVmdCA9IHBhcmVudC5vZmZzZXRMZWZ0ICsgcGFyZW50Lm9mZnNldFdpZHRoIC0gQ29uZmlnLk92ZXJsYXAgKyAncHgnXHJcbiAgICAgICAgICAgICAgICB0aGlzLmRpdi5zdHlsZS50b3AgPSBwYXJlbnQub2Zmc2V0VG9wICsgZGl2Lm9mZnNldFRvcCAtIENvbmZpZy5PdmVybGFwICsgJ3B4J1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMuYXR0YWNoZWQgPSBtZW51SXRlbVxyXG4gICAgICAgICAgICB0aGlzLnNob3dBY2NlbGVyYXRvcnMoKVxyXG4gICAgICAgICAgICB0aGlzLmdldEFwcGxpY2F0aW9uRGl2KCkuYXBwZW5kQ2hpbGQodGhpcy5kaXYpXHJcbiAgICAgICAgICAgIGxldCBsYWJlbCA9IDAsIGFjY2VsZXJhdG9yID0gMCwgYXJyb3cgPSAwLCBjaGVja2VkID0gMFxyXG4gICAgICAgICAgICBmb3IgKGxldCBjaGlsZCBvZiB0aGlzLmNoaWxkcmVuKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBjaGlsZC5jaGVjay5zdHlsZS53aWR0aCA9ICdhdXRvJ1xyXG4gICAgICAgICAgICAgICAgY2hpbGQubGFiZWwuc3R5bGUud2lkdGggPSAnYXV0bydcclxuICAgICAgICAgICAgICAgIGNoaWxkLmFjY2VsZXJhdG9yLnN0eWxlLndpZHRoID0gJ2F1dG8nXHJcbiAgICAgICAgICAgICAgICBjaGlsZC5hcnJvdy5zdHlsZS53aWR0aCA9ICdhdXRvJ1xyXG4gICAgICAgICAgICAgICAgaWYgKGNoaWxkLnR5cGUgPT09ICdjaGVja2JveCcpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgY2hlY2tlZCA9IENvbmZpZy5NaW5pbXVtQ29sdW1uV2lkdGhcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmIChjaGlsZC5zdWJtZW51KVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGFycm93ID0gQ29uZmlnLk1pbmltdW1Db2x1bW5XaWR0aFxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGZvciAobGV0IGNoaWxkIG9mIHRoaXMuY2hpbGRyZW4pXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGNoaWxkTGFiZWwgPSBjaGlsZC5sYWJlbC5vZmZzZXRXaWR0aCAqIDJcclxuICAgICAgICAgICAgICAgIGxhYmVsID0gY2hpbGRMYWJlbCA+IGxhYmVsID8gY2hpbGRMYWJlbCA6IGxhYmVsXHJcbiAgICAgICAgICAgICAgICBjb25zdCBjaGlsZEFjY2VsZXJhdG9yID0gY2hpbGQuYWNjZWxlcmF0b3Iub2Zmc2V0V2lkdGhcclxuICAgICAgICAgICAgICAgIGFjY2VsZXJhdG9yID0gY2hpbGRBY2NlbGVyYXRvciA+IGFjY2VsZXJhdG9yID8gY2hpbGRBY2NlbGVyYXRvciA6IGFjY2VsZXJhdG9yXHJcbiAgICAgICAgICAgICAgICBpZiAoY2hpbGQuc3VibWVudSlcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBhcnJvdyA9IGNoaWxkLmFycm93Lm9mZnNldFdpZHRoXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZm9yIChsZXQgY2hpbGQgb2YgdGhpcy5jaGlsZHJlbilcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgY2hpbGQuY2hlY2suc3R5bGUud2lkdGggPSBjaGVja2VkICsgJ3B4J1xyXG4gICAgICAgICAgICAgICAgY2hpbGQubGFiZWwuc3R5bGUud2lkdGggPSBsYWJlbCArICdweCdcclxuICAgICAgICAgICAgICAgIGNoaWxkLmFjY2VsZXJhdG9yLnN0eWxlLndpZHRoID0gYWNjZWxlcmF0b3IgKyAncHgnXHJcbiAgICAgICAgICAgICAgICBjaGlsZC5hcnJvdy5zdHlsZS53aWR0aCA9IGFycm93ICsgJ3B4J1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmRpdi5vZmZzZXRMZWZ0ICsgdGhpcy5kaXYub2Zmc2V0V2lkdGggPiB3aW5kb3cuaW5uZXJXaWR0aClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kaXYuc3R5bGUubGVmdCA9IHdpbmRvdy5pbm5lcldpZHRoIC0gdGhpcy5kaXYub2Zmc2V0V2lkdGggKyAncHgnXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKHRoaXMuZGl2Lm9mZnNldFRvcCArIHRoaXMuZGl2Lm9mZnNldEhlaWdodCA+IHdpbmRvdy5pbm5lckhlaWdodClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kaXYuc3R5bGUudG9wID0gd2luZG93LmlubmVySGVpZ2h0IC0gdGhpcy5kaXYub2Zmc2V0SGVpZ2h0ICsgJ3B4J1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGFwcGx5Q29uZmlnKGJhc2UpXHJcbiAgICB7XHJcbiAgICAgICAgY29uc3Qgc3R5bGVzID0ge31cclxuICAgICAgICBmb3IgKGxldCBzdHlsZSBpbiBiYXNlKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgc3R5bGVzW3N0eWxlXSA9IGJhc2Vbc3R5bGVdXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0aGlzLnN0eWxlcylcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGZvciAobGV0IHN0eWxlIGluIHRoaXMuc3R5bGVzKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBzdHlsZXNbc3R5bGVdID0gdGhpcy5zdHlsZXNbc3R5bGVdXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgZm9yIChsZXQgc3R5bGUgaW4gc3R5bGVzKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5kaXYuc3R5bGVbc3R5bGVdID0gc3R5bGVzW3N0eWxlXVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBzaG93QWNjZWxlcmF0b3JzKClcclxuICAgIHtcclxuICAgICAgICBmb3IgKGxldCBjaGlsZCBvZiB0aGlzLmNoaWxkcmVuKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgY2hpbGQuc2hvd1Nob3J0Y3V0KClcclxuICAgICAgICAgICAgaWYgKGNoaWxkLnR5cGUgIT09ICdzZXBhcmF0b3InKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBpbmRleCA9IGNoaWxkLnRleHQuaW5kZXhPZignJicpXHJcbiAgICAgICAgICAgICAgICBpZiAoaW5kZXggIT09IC0xKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIE1lbnUuTG9jYWxBY2NlbGVyYXRvci5yZWdpc3Rlck1lbnVTaG9ydGN1dChjaGlsZC50ZXh0W2luZGV4ICsgMV0sIGNoaWxkKVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICghdGhpcy5hcHBsaWNhdGlvbk1lbnUpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBNZW51LkxvY2FsQWNjZWxlcmF0b3IucmVnaXN0ZXJNZW51U3BlY2lhbCh0aGlzKVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBoaWRlQWNjZWxlcmF0b3JzKClcclxuICAgIHtcclxuICAgICAgICBmb3IgKGxldCBjaGlsZCBvZiB0aGlzLmNoaWxkcmVuKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgY2hpbGQuaGlkZVNob3J0Y3V0KClcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgY2xvc2VBbGwoKVxyXG4gICAge1xyXG4gICAgICAgIE1lbnUuTG9jYWxBY2NlbGVyYXRvci51bnJlZ2lzdGVyTWVudVNob3J0Y3V0cygpXHJcbiAgICAgICAgbGV0IGFwcGxpY2F0aW9uID0gX2FwcGxpY2F0aW9uLm1lbnVcclxuICAgICAgICBpZiAoYXBwbGljYXRpb24uc2hvd2luZylcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGxldCBtZW51ID0gYXBwbGljYXRpb25cclxuICAgICAgICAgICAgd2hpbGUgKG1lbnUuc2hvd2luZylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgbWVudSA9IG1lbnUuc2hvd2luZy5zdWJtZW51XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgd2hpbGUgKG1lbnUgJiYgIW1lbnUuYXBwbGljYXRpb25NZW51KVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBpZiAobWVudS5zaG93aW5nKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIG1lbnUuc2hvd2luZy5kaXYuc3R5bGUuYmFja2dyb3VuZENvbG9yID0gJ3RyYW5zcGFyZW50J1xyXG4gICAgICAgICAgICAgICAgICAgIG1lbnUuc2hvd2luZyA9IG51bGxcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIG1lbnUuZGl2LnJlbW92ZSgpXHJcbiAgICAgICAgICAgICAgICBtZW51ID0gbWVudS5tZW51XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKG1lbnUpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIG1lbnUuc2hvd2luZy5kaXYuc3R5bGUuYmFja2dyb3VuZCA9ICd0cmFuc3BhcmVudCdcclxuICAgICAgICAgICAgICAgIG1lbnUuc2hvd2luZyA9IG51bGxcclxuICAgICAgICAgICAgICAgIG1lbnUuaGlkZUFjY2VsZXJhdG9ycygpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0QXBwbGljYXRpb25EaXYoKVxyXG4gICAge1xyXG4gICAgICAgIHJldHVybiBfYXBwbGljYXRpb25cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIG1vdmUgc2VsZWN0b3IgdG8gdGhlIG5leHQgY2hpbGQgcGFuZVxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGRpcmVjdGlvbiAobGVmdCBvciByaWdodClcclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKi9cclxuICAgIG1vdmVDaGlsZChkaXJlY3Rpb24pXHJcbiAgICB7XHJcbiAgICAgICAgbGV0IGluZGV4XHJcbiAgICAgICAgaWYgKGRpcmVjdGlvbiA9PT0gJ2xlZnQnKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgY29uc3QgcGFyZW50ID0gdGhpcy5zZWxlY3Rvci5tZW51Lm1lbnVcclxuICAgICAgICAgICAgaW5kZXggPSBwYXJlbnQuY2hpbGRyZW4uaW5kZXhPZihwYXJlbnQuc2hvd2luZylcclxuICAgICAgICAgICAgaW5kZXgtLVxyXG4gICAgICAgICAgICBpbmRleCA9IChpbmRleCA8IDApID8gcGFyZW50LmNoaWxkcmVuLmxlbmd0aCAtIDEgOiBpbmRleFxyXG4gICAgICAgICAgICBwYXJlbnQuY2hpbGRyZW5baW5kZXhdLmhhbmRsZUNsaWNrKClcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgbGV0IHBhcmVudCA9IHRoaXMuc2VsZWN0b3IubWVudS5tZW51XHJcbiAgICAgICAgICAgIGxldCBzZWxlY3RvciA9IHBhcmVudC5zaG93aW5nXHJcbiAgICAgICAgICAgIHdoaWxlICghcGFyZW50LmFwcGxpY2F0aW9uTWVudSlcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgc2VsZWN0b3IuaGFuZGxlQ2xpY2soKVxyXG4gICAgICAgICAgICAgICAgc2VsZWN0b3IuZGl2LnN0eWxlLmJhY2tncm91bmRDb2xvciA9ICd0cmFuc3BhcmVudCdcclxuICAgICAgICAgICAgICAgIHBhcmVudCA9IHBhcmVudC5tZW51XHJcbiAgICAgICAgICAgICAgICBzZWxlY3RvciA9IHBhcmVudC5zaG93aW5nXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaW5kZXggPSBwYXJlbnQuY2hpbGRyZW4uaW5kZXhPZihzZWxlY3RvcilcclxuICAgICAgICAgICAgaW5kZXgrK1xyXG4gICAgICAgICAgICBpbmRleCA9IChpbmRleCA9PT0gcGFyZW50LmNoaWxkcmVuLmxlbmd0aCkgPyAwIDogaW5kZXhcclxuICAgICAgICAgICAgcGFyZW50LmNoaWxkcmVuW2luZGV4XS5oYW5kbGVDbGljaygpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuc2VsZWN0b3IgPSBudWxsXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBtb3ZlIHNlbGVjdG9yIHJpZ2h0IGFuZCBsZWZ0XHJcbiAgICAgKiBAcGFyYW0ge01vdXNlRXZlbnR9IGVcclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBkaXJlY3Rpb25cclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKi9cclxuICAgIGhvcml6b250YWxTZWxlY3RvcihlLCBkaXJlY3Rpb24pXHJcbiAgICB7XHJcbiAgICAgICAgaWYgKGRpcmVjdGlvbiA9PT0gJ3JpZ2h0JylcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLnNlbGVjdG9yLnN1Ym1lbnUpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2VsZWN0b3IuaGFuZGxlQ2xpY2soZSlcclxuICAgICAgICAgICAgICAgIHRoaXMuc2VsZWN0b3Iuc3VibWVudS5zZWxlY3RvciA9IHRoaXMuc2VsZWN0b3Iuc3VibWVudS5jaGlsZHJlblswXVxyXG4gICAgICAgICAgICAgICAgdGhpcy5zZWxlY3Rvci5zdWJtZW51LnNlbGVjdG9yLmRpdi5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSBDb25maWcuU2VsZWN0ZWRCYWNrZ3JvdW5kU3R5bGVcclxuICAgICAgICAgICAgICAgIHRoaXMuc2VsZWN0b3IgPSBudWxsXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLm1vdmVDaGlsZChkaXJlY3Rpb24pXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAoZGlyZWN0aW9uID09PSAnbGVmdCcpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBpZiAoIXRoaXMuc2VsZWN0b3IubWVudS5tZW51LmFwcGxpY2F0aW9uTWVudSlcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zZWxlY3Rvci5tZW51LmF0dGFjaGVkLmhhbmRsZUNsaWNrKGUpXHJcbiAgICAgICAgICAgICAgICB0aGlzLnNlbGVjdG9yLm1lbnUubWVudS5zZWxlY3RvciA9IHRoaXMuc2VsZWN0b3IubWVudS5hdHRhY2hlZFxyXG4gICAgICAgICAgICAgICAgdGhpcy5zZWxlY3RvciA9IG51bGxcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHRoaXMubW92ZUNoaWxkKGRpcmVjdGlvbilcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpXHJcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBtb3ZlIHRoZSBzZWxlY3RvciBpbiB0aGUgbWVudVxyXG4gICAgICogQHBhcmFtIHtLZXlib2FyZEV2ZW50fSBlXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gZGlyZWN0aW9uIChsZWZ0LCByaWdodCwgdXAsIGRvd24pXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICBtb3ZlKGUsIGRpcmVjdGlvbilcclxuICAgIHtcclxuICAgICAgICBpZiAodGhpcy5zZWxlY3RvcilcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMuc2VsZWN0b3IuZGl2LnN0eWxlLmJhY2tncm91bmRDb2xvciA9ICd0cmFuc3BhcmVudCdcclxuICAgICAgICAgICAgbGV0IGluZGV4ID0gdGhpcy5jaGlsZHJlbi5pbmRleE9mKHRoaXMuc2VsZWN0b3IpXHJcbiAgICAgICAgICAgIGlmIChkaXJlY3Rpb24gPT09ICdkb3duJylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgaW5kZXgrK1xyXG4gICAgICAgICAgICAgICAgaW5kZXggPSAoaW5kZXggPT09IHRoaXMuY2hpbGRyZW4ubGVuZ3RoKSA/IDAgOiBpbmRleFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2UgaWYgKGRpcmVjdGlvbiA9PT0gJ3VwJylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgaW5kZXgtLVxyXG4gICAgICAgICAgICAgICAgaW5kZXggPSAoaW5kZXggPCAwKSA/IHRoaXMuY2hpbGRyZW4ubGVuZ3RoIC0gMSA6IGluZGV4XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5ob3Jpem9udGFsU2VsZWN0b3IoZSwgZGlyZWN0aW9uKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMuc2VsZWN0b3IgPSB0aGlzLmNoaWxkcmVuW2luZGV4XVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBpZiAoZGlyZWN0aW9uID09PSAndXAnKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNlbGVjdG9yID0gdGhpcy5jaGlsZHJlblt0aGlzLmNoaWxkcmVuLmxlbmd0aCAtIDFdXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNlbGVjdG9yID0gdGhpcy5jaGlsZHJlblswXVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuc2VsZWN0b3IuZGl2LnN0eWxlLmJhY2tncm91bmRDb2xvciA9IENvbmZpZy5TZWxlY3RlZEJhY2tncm91bmRTdHlsZVxyXG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKVxyXG4gICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKClcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIGNsaWNrIHRoZSBzZWxlY3RvciB3aXRoIGtleWJvYXJkXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICBlbnRlcihlKVxyXG4gICAge1xyXG4gICAgICAgIGlmICh0aGlzLnNlbGVjdG9yKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5zZWxlY3Rvci5oYW5kbGVDbGljayhlKVxyXG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KClcclxuICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIGFycmF5IGNvbnRhaW5pbmcgdGhlIG1lbnUncyBpdGVtc1xyXG4gICAgICogQHByb3BlcnR5IHtNZW51SXRlbXNbXX0gaXRlbXNcclxuICAgICAqIEByZWFkb25seVxyXG4gICAgICovXHJcbiAgICBnZXQgaXRlbXMoKVxyXG4gICAge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmNoaWxkcmVuXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBzaG93IGFwcGxpY2F0aW9uIG1lbnUgYWNjZWxlcmF0b3JzIHdoZW4gYWx0IGlzIHByZXNzZWRcclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKi9cclxuICAgIHNob3dBcHBsaWNhdGlvbkFjY2VsZXJhdG9ycygpXHJcbiAgICB7XHJcbiAgICAgICAgdGhpcy5oaWRlQWNjZWxlcmF0b3JzKClcclxuICAgICAgICBMb2NhbEFjY2VsZXJhdG9yLnJlZ2lzdGVyQWx0KCgpID0+XHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBpZiAoIXRoaXMuc2hvd2luZylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zaG93QWNjZWxlcmF0b3JzKClcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sICgpID0+XHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLmhpZGVBY2NlbGVyYXRvcnMoKVxyXG4gICAgICAgIH0pXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBzZXRzIGFjdGl2ZSBhcHBsaWNhdGlvbiBNZW51IChhbmQgcmVtb3ZlcyBhbnkgZXhpc3RpbmcgYXBwbGljYXRpb24gbWVudXMpXHJcbiAgICAgKiBAcGFyYW0ge01lbnV9IG1lbnVcclxuICAgICAqL1xyXG4gICAgc3RhdGljIHNldEFwcGxpY2F0aW9uTWVudShtZW51KVxyXG4gICAge1xyXG4gICAgICAgIExvY2FsQWNjZWxlcmF0b3IuaW5pdCgpXHJcbiAgICAgICAgaWYgKF9hcHBsaWNhdGlvbilcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIF9hcHBsaWNhdGlvbi5yZW1vdmUoKVxyXG4gICAgICAgIH1cclxuICAgICAgICBfYXBwbGljYXRpb24gPSBodG1sKHsgcGFyZW50OiBkb2N1bWVudC5ib2R5LCBzdHlsZXM6IENvbmZpZy5BcHBsaWNhdGlvbkNvbnRhaW5lclN0eWxlIH0pXHJcbiAgICAgICAgX2FwcGxpY2F0aW9uLm1lbnUgPSBtZW51XHJcbiAgICAgICAgbWVudS5hcHBseUNvbmZpZyhDb25maWcuQXBwbGljYXRpb25NZW51U3R5bGUpXHJcbiAgICAgICAgZm9yIChsZXQgY2hpbGQgb2YgbWVudS5jaGlsZHJlbilcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGNoaWxkLmFwcGx5Q29uZmlnKENvbmZpZy5BcHBsaWNhdGlvbk1lbnVSb3dTdHlsZSlcclxuICAgICAgICAgICAgaWYgKGNoaWxkLmFycm93KVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBjaGlsZC5hcnJvdy5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgbWVudS5kaXYuYXBwZW5kQ2hpbGQoY2hpbGQuZGl2KVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgX2FwcGxpY2F0aW9uLmFwcGVuZENoaWxkKG1lbnUuZGl2KVxyXG4gICAgICAgIG1lbnUuYXBwbGljYXRpb25NZW51ID0gdHJ1ZVxyXG4gICAgICAgIG1lbnUuZGl2LnRhYkluZGV4ID0gLTFcclxuXHJcbiAgICAgICAgLy8gZG9uJ3QgbGV0IG1lbnUgYmFyIGZvY3VzIHVubGVzcyB3aW5kb3dzIGFyZSBvcGVuICh0aGlzIGZpeGVzIGEgZm9jdXMgYnVnKVxyXG4gICAgICAgIG1lbnUuZGl2LmFkZEV2ZW50TGlzdGVuZXIoJ2ZvY3VzJywgKCkgPT5cclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGlmICghbWVudS5zaG93aW5nKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBtZW51LmRpdi5ibHVyKClcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pXHJcblxyXG4gICAgICAgIC8vIGNsb3NlIGFsbCB3aW5kb3dzIGlmIG1lbnUgaXMgbm8gbG9uZ2VyIHRoZSBmb2N1c1xyXG4gICAgICAgIG1lbnUuZGl2LmFkZEV2ZW50TGlzdGVuZXIoJ2JsdXInLCAoKSA9PlxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgaWYgKG1lbnUuc2hvd2luZylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgbWVudS5jbG9zZUFsbCgpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KVxyXG4gICAgICAgIG1lbnUuc2hvd0FwcGxpY2F0aW9uQWNjZWxlcmF0b3JzKClcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIGxvY2FsQWNjZWxlcmF0b3IgZGVmaW5pdGlvblxyXG4gICAgICogQHR5cGUge0FjY2VsZXJhdG9yfVxyXG4gICAgICovXHJcbiAgICBzdGF0aWMgZ2V0IExvY2FsQWNjZWxlcmF0b3IoKVxyXG4gICAge1xyXG4gICAgICAgIHJldHVybiBMb2NhbEFjY2VsZXJhdG9yXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiB1c2UgdGhpcyB0byBjaGFuZ2UgdGhlIGRlZmF1bHQgQ29uZmlnIHNldHRpbmdzIGFjcm9zcyBhbGwgbWVudXNcclxuICAgICAqIEB0eXBlIHtDb25maWd9XHJcbiAgICAgKi9cclxuICAgIHN0YXRpYyBnZXQgQ29uZmlnKClcclxuICAgIHtcclxuICAgICAgICByZXR1cm4gQ29uZmlnXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBNZW51SXRlbSBkZWZpbml0aW9uXHJcbiAgICAgKiBAdHlwZSB7TWVudUl0ZW19XHJcbiAgICAgKi9cclxuICAgIHN0YXRpYyBnZXQgTWVudUl0ZW0oKVxyXG4gICAge1xyXG4gICAgICAgIHJldHVybiBNZW51SXRlbVxyXG4gICAgfVxyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IE1lbnUiXX0=