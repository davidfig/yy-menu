/**
 * Handles all keyboard input for the menu and user-registered keys
 */
const GlobalAccelerator = {

    init: function () {
        if (!GlobalAccelerator.menuKeys) {
            GlobalAccelerator.menuKeys = {};
            GlobalAccelerator.keys = {};
            document.body.addEventListener('keydown', e => GlobalAccelerator.keyDown(this, e));
        }
    },

    /**
     * clear all user-registered keys
     */
    clearKeys: function () {
        GlobalAccelerator.keys = {};
    },

    /**
     * Register a shortcut key for use by an open menu
     * @param {KeyCodes} letter
     * @param {MenuItem} menuItem
     * @param {boolean} applicationMenu
     * @private
     */
    registerMenuShortcut: function (letter, menuItem) {
        if (letter) {
            const keyCode = (menuItem.menu.applicationMenu ? 'alt+' : '') + letter;
            GlobalAccelerator.menuKeys[GlobalAccelerator.prepareKey(keyCode)] = e => {
                menuItem.handleClick(e);
                e.stopPropagation();
                e.preventDefault();
            };
        }
    },

    /**
     * Register special shortcut keys for menu
     * @param {MenuItem} menuItem
     * @private
     */
    registerMenuSpecial: function (menu) {
        GlobalAccelerator.menuKeys['escape'] = () => menu.closeAll();
        GlobalAccelerator.menuKeys['enter'] = e => menu.enter(e);
        GlobalAccelerator.menuKeys['space'] = e => menu.enter(e);
        GlobalAccelerator.menuKeys['arrowright'] = e => menu.move(e, 'right');
        GlobalAccelerator.menuKeys['arrowleft'] = e => menu.move(e, 'left');
        GlobalAccelerator.menuKeys['arrowup'] = e => menu.move(e, 'up');
        GlobalAccelerator.menuKeys['arrowdown'] = e => menu.move(e, 'down');
    },

    /**
     * Removes menu shortcuts
     * @private
     */
    unregisterMenuShortcuts: function () {
        GlobalAccelerator.menuKeys = {};
    },

    /**
     * Keycodes definition. In the form of modifier[+modifier...]+key
     * <p>For example: ctrl+shift+e</p>
     * <p>KeyCodes are case insensitive (i.e., shift+a is the same as Shift+A). And spaces are removed</p>
     * <p>You can assign more than one key to the same shortcut by using a | between the keys (e.g., 'shift+a | ctrl+a')</p>
     * <pre>
     * Modifiers:
     *    ctrl, alt, shift, meta, (ctrl aliases: command, control, commandorcontrol)
     * </pre>
     * <pre>
     * Keys:
     *    escape, 0-9, minus, equal, backspace, tab, a-z, backetleft, bracketright, semicolon, quote,
     *    backquote, backslash, comma, period, slash, numpadmultiply, space, capslock, f1-f24, pause,
     *    scrolllock, printscreen, home, arrowup, arrowleft, arrowright, arrowdown, pageup, pagedown,
     *    end, insert, delete, enter, shiftleft, shiftright, ctrlleft, ctrlright, altleft, altright, shiftleft,
     *    shiftright, numlock, numpad...
     * </pre>
     * For OS-specific codes and a more detailed explanation see {@link https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/code}. Also note that 'Digit' and 'Key' are removed from the code to make it easier to type.
     *
     * @typedef {string} GlobalAccelerator~KeyCodes
     */

    /**
     * translate a user-provided keycode
     * @param {KeyCodes} keyCode
     * @return {KeyCodes} formatted and sorted keyCode
     * @private
     */
    prepareKey: function (keyCode) {
        const keys = [];
        let split;
        if (keyCode.indexOf('|') !== -1) {
            split = keyCode.split('|');
        } else {
            split = [keyCode];
        }
        for (let code of split) {
            let key = '';
            let modifiers = [];
            code = code.toLowerCase().replace(' ', '');
            if (code.indexOf('+') !== -1) {
                const split = code.split('+');
                for (let i = 0; i < split.length - 1; i++) {
                    let modifier = split[i];
                    modifier = modifier.replace('commandorcontrol', 'ctrl');
                    modifier = modifier.replace('command', 'ctrl');
                    modifier = modifier.replace('control', 'ctrl');
                    modifiers.push(modifier);
                }
                modifiers = modifiers.sort((a, b) => {
                    return a[0] > b[0] ? 1 : a[0] < b[0] ? -1 : 0;
                });
                for (let part of modifiers) {
                    key += part + '+';
                }
                key += split[split.length - 1];
            } else {
                key = code;
            }
            keys.push(key);
        }
        return keys;
    },

    /**
     * Make the KeyCode pretty for printing on the menu
     * @param {KeyCode} keyCode
     * @return {string}
     * @private
     */
    prettifyKey: function (keyCode) {
        let key = '';
        const codes = GlobalAccelerator.prepareKey(keyCode);
        for (let i = 0; i < codes.length; i++) {
            const keyCode = codes[i];
            if (keyCode.indexOf('+') !== -1) {
                const split = keyCode.toLowerCase().split('+');
                for (let i = 0; i < split.length - 1; i++) {
                    let modifier = split[i];
                    key += modifier[0].toUpperCase() + modifier.substr(1) + '+';
                }
                key += split[split.length - 1].toUpperCase();
            } else {
                key = keyCode.toUpperCase();
            }
            if (i !== codes.length - 1) {
                key += ' or ';
            }
        }
        return key;
    },

    /**
     * register a key as a global accelerator
     * @param {KeyCodes} keyCode (e.g., Ctrl+shift+E)
     * @param {function} callback
     */
    register: function (keyCode, callback) {
        const keys = GlobalAccelerator.prepareKey(keyCode);
        for (let key of keys) {
            GlobalAccelerator.keys[key] = e => {
                callback(e);
                e.preventDefault();
                e.stopPropagation();
            };
        }
    },

    keyDown: function (accelerator, e) {
        const modifiers = [];
        if (e.altKey) {
            modifiers.push('alt');
        }
        if (e.ctrlKey) {
            modifiers.push('ctrl');
        }
        if (e.metaKey) {
            modifiers.push('meta');
        }
        if (e.shiftKey) {
            modifiers.push('shift');
        }
        let keyCode = '';
        for (let modifier of modifiers) {
            keyCode = modifier + '+';
        }
        let translate = e.code.toLowerCase();
        translate = translate.replace('digit', '');
        translate = translate.replace('key', '');
        keyCode += translate;
        if (GlobalAccelerator.menuKeys[keyCode]) {
            GlobalAccelerator.menuKeys[keyCode](e, this);
        } else if (GlobalAccelerator.keys[keyCode]) {
            GlobalAccelerator.keys[keyCode](e, this);
        }
    }
};

module.exports = GlobalAccelerator;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9nbG9iYWxBY2NlbGVyYXRvci5qcyJdLCJuYW1lcyI6WyJHbG9iYWxBY2NlbGVyYXRvciIsImluaXQiLCJtZW51S2V5cyIsImtleXMiLCJkb2N1bWVudCIsImJvZHkiLCJhZGRFdmVudExpc3RlbmVyIiwiZSIsImtleURvd24iLCJjbGVhcktleXMiLCJyZWdpc3Rlck1lbnVTaG9ydGN1dCIsImxldHRlciIsIm1lbnVJdGVtIiwia2V5Q29kZSIsIm1lbnUiLCJhcHBsaWNhdGlvbk1lbnUiLCJwcmVwYXJlS2V5IiwiaGFuZGxlQ2xpY2siLCJzdG9wUHJvcGFnYXRpb24iLCJwcmV2ZW50RGVmYXVsdCIsInJlZ2lzdGVyTWVudVNwZWNpYWwiLCJjbG9zZUFsbCIsImVudGVyIiwibW92ZSIsInVucmVnaXN0ZXJNZW51U2hvcnRjdXRzIiwic3BsaXQiLCJpbmRleE9mIiwiY29kZSIsImtleSIsIm1vZGlmaWVycyIsInRvTG93ZXJDYXNlIiwicmVwbGFjZSIsImkiLCJsZW5ndGgiLCJtb2RpZmllciIsInB1c2giLCJzb3J0IiwiYSIsImIiLCJwYXJ0IiwicHJldHRpZnlLZXkiLCJjb2RlcyIsInRvVXBwZXJDYXNlIiwic3Vic3RyIiwicmVnaXN0ZXIiLCJjYWxsYmFjayIsImFjY2VsZXJhdG9yIiwiYWx0S2V5IiwiY3RybEtleSIsIm1ldGFLZXkiLCJzaGlmdEtleSIsInRyYW5zbGF0ZSIsIm1vZHVsZSIsImV4cG9ydHMiXSwibWFwcGluZ3MiOiJBQUFBOzs7QUFHQSxNQUFNQSxvQkFBb0I7O0FBRXRCQyxVQUFNLFlBQ047QUFDSSxZQUFJLENBQUNELGtCQUFrQkUsUUFBdkIsRUFDQTtBQUNJRiw4QkFBa0JFLFFBQWxCLEdBQTZCLEVBQTdCO0FBQ0FGLDhCQUFrQkcsSUFBbEIsR0FBeUIsRUFBekI7QUFDQUMscUJBQVNDLElBQVQsQ0FBY0MsZ0JBQWQsQ0FBK0IsU0FBL0IsRUFBMkNDLENBQUQsSUFBT1Asa0JBQWtCUSxPQUFsQixDQUEwQixJQUExQixF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QyxPQUFOLEVBQ0E7QUFDSXBCLHNCQUFVTSxJQUFWLENBQWUsTUFBZjtBQUNIO0FBQ0QsWUFBSTVCLEVBQUUyQyxRQUFOLEVBQ0E7QUFDSXJCLHNCQUFVTSxJQUFWLENBQWUsT0FBZjtBQUNIO0FBQ0QsWUFBSXRCLFVBQVUsRUFBZDtBQUNBLGFBQUssSUFBSXFCLFFBQVQsSUFBcUJMLFNBQXJCLEVBQ0E7QUFDSWhCLHNCQUFVcUIsV0FBVyxHQUFyQjtBQUNIO0FBQ0QsWUFBSWlCLFlBQVk1QyxFQUFFb0IsSUFBRixDQUFPRyxXQUFQLEVBQWhCO0FBQ0FxQixvQkFBWUEsVUFBVXBCLE9BQVYsQ0FBa0IsT0FBbEIsRUFBMkIsRUFBM0IsQ0FBWjtBQUNBb0Isb0JBQVlBLFVBQVVwQixPQUFWLENBQWtCLEtBQWxCLEVBQXlCLEVBQXpCLENBQVo7QUFDQWxCLG1CQUFXc0MsU0FBWDtBQUNBLFlBQUluRCxrQkFBa0JFLFFBQWxCLENBQTJCVyxPQUEzQixDQUFKLEVBQ0E7QUFDSWIsOEJBQWtCRSxRQUFsQixDQUEyQlcsT0FBM0IsRUFBb0NOLENBQXBDLEVBQXVDLElBQXZDO0FBQ0gsU0FIRCxNQUlLLElBQUlQLGtCQUFrQkcsSUFBbEIsQ0FBdUJVLE9BQXZCLENBQUosRUFDTDtBQUNJYiw4QkFBa0JHLElBQWxCLENBQXVCVSxPQUF2QixFQUFnQ04sQ0FBaEMsRUFBbUMsSUFBbkM7QUFDSDtBQUNKO0FBcE9xQixDQUExQjs7QUF1T0E2QyxPQUFPQyxPQUFQLEdBQWlCckQsaUJBQWpCIiwiZmlsZSI6Imdsb2JhbEFjY2VsZXJhdG9yLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXHJcbiAqIEhhbmRsZXMgYWxsIGtleWJvYXJkIGlucHV0IGZvciB0aGUgbWVudSBhbmQgdXNlci1yZWdpc3RlcmVkIGtleXNcclxuICovXHJcbmNvbnN0IEdsb2JhbEFjY2VsZXJhdG9yID0ge1xyXG5cclxuICAgIGluaXQ6IGZ1bmN0aW9uKClcclxuICAgIHtcclxuICAgICAgICBpZiAoIUdsb2JhbEFjY2VsZXJhdG9yLm1lbnVLZXlzKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgR2xvYmFsQWNjZWxlcmF0b3IubWVudUtleXMgPSB7fVxyXG4gICAgICAgICAgICBHbG9iYWxBY2NlbGVyYXRvci5rZXlzID0ge31cclxuICAgICAgICAgICAgZG9jdW1lbnQuYm9keS5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgKGUpID0+IEdsb2JhbEFjY2VsZXJhdG9yLmtleURvd24odGhpcywgZSkpXHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuXHJcbiAgICAvKipcclxuICAgICAqIGNsZWFyIGFsbCB1c2VyLXJlZ2lzdGVyZWQga2V5c1xyXG4gICAgICovXHJcbiAgICBjbGVhcktleXM6IGZ1bmN0aW9uKClcclxuICAgIHtcclxuICAgICAgICBHbG9iYWxBY2NlbGVyYXRvci5rZXlzID0ge31cclxuICAgIH0sXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZWdpc3RlciBhIHNob3J0Y3V0IGtleSBmb3IgdXNlIGJ5IGFuIG9wZW4gbWVudVxyXG4gICAgICogQHBhcmFtIHtLZXlDb2Rlc30gbGV0dGVyXHJcbiAgICAgKiBAcGFyYW0ge01lbnVJdGVtfSBtZW51SXRlbVxyXG4gICAgICogQHBhcmFtIHtib29sZWFufSBhcHBsaWNhdGlvbk1lbnVcclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKi9cclxuICAgIHJlZ2lzdGVyTWVudVNob3J0Y3V0OiBmdW5jdGlvbihsZXR0ZXIsIG1lbnVJdGVtKVxyXG4gICAge1xyXG4gICAgICAgIGlmIChsZXR0ZXIpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBjb25zdCBrZXlDb2RlID0gKG1lbnVJdGVtLm1lbnUuYXBwbGljYXRpb25NZW51ID8gJ2FsdCsnIDogJycpICsgbGV0dGVyXHJcbiAgICAgICAgICAgIEdsb2JhbEFjY2VsZXJhdG9yLm1lbnVLZXlzW0dsb2JhbEFjY2VsZXJhdG9yLnByZXBhcmVLZXkoa2V5Q29kZSldID0gKGUpID0+XHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIG1lbnVJdGVtLmhhbmRsZUNsaWNrKGUpXHJcbiAgICAgICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpXHJcbiAgICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KClcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH0sXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZWdpc3RlciBzcGVjaWFsIHNob3J0Y3V0IGtleXMgZm9yIG1lbnVcclxuICAgICAqIEBwYXJhbSB7TWVudUl0ZW19IG1lbnVJdGVtXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICByZWdpc3Rlck1lbnVTcGVjaWFsOiBmdW5jdGlvbihtZW51KVxyXG4gICAge1xyXG4gICAgICAgIEdsb2JhbEFjY2VsZXJhdG9yLm1lbnVLZXlzWydlc2NhcGUnXSA9ICgpID0+IG1lbnUuY2xvc2VBbGwoKVxyXG4gICAgICAgIEdsb2JhbEFjY2VsZXJhdG9yLm1lbnVLZXlzWydlbnRlciddID0gKGUpID0+IG1lbnUuZW50ZXIoZSlcclxuICAgICAgICBHbG9iYWxBY2NlbGVyYXRvci5tZW51S2V5c1snc3BhY2UnXSA9IChlKSA9PiBtZW51LmVudGVyKGUpXHJcbiAgICAgICAgR2xvYmFsQWNjZWxlcmF0b3IubWVudUtleXNbJ2Fycm93cmlnaHQnXSA9IChlKSA9PiBtZW51Lm1vdmUoZSwgJ3JpZ2h0JylcclxuICAgICAgICBHbG9iYWxBY2NlbGVyYXRvci5tZW51S2V5c1snYXJyb3dsZWZ0J10gPSAoZSkgPT4gbWVudS5tb3ZlKGUsICdsZWZ0JylcclxuICAgICAgICBHbG9iYWxBY2NlbGVyYXRvci5tZW51S2V5c1snYXJyb3d1cCddID0gKGUpID0+IG1lbnUubW92ZShlLCAndXAnKVxyXG4gICAgICAgIEdsb2JhbEFjY2VsZXJhdG9yLm1lbnVLZXlzWydhcnJvd2Rvd24nXSA9IChlKSA9PiBtZW51Lm1vdmUoZSwgJ2Rvd24nKVxyXG4gICAgfSxcclxuXHJcbiAgICAvKipcclxuICAgICAqIFJlbW92ZXMgbWVudSBzaG9ydGN1dHNcclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKi9cclxuICAgIHVucmVnaXN0ZXJNZW51U2hvcnRjdXRzOiBmdW5jdGlvbigpXHJcbiAgICB7XHJcbiAgICAgICAgR2xvYmFsQWNjZWxlcmF0b3IubWVudUtleXMgPSB7fVxyXG4gICAgfSxcclxuXHJcbiAgICAvKipcclxuICAgICAqIEtleWNvZGVzIGRlZmluaXRpb24uIEluIHRoZSBmb3JtIG9mIG1vZGlmaWVyWyttb2RpZmllci4uLl0ra2V5XHJcbiAgICAgKiA8cD5Gb3IgZXhhbXBsZTogY3RybCtzaGlmdCtlPC9wPlxyXG4gICAgICogPHA+S2V5Q29kZXMgYXJlIGNhc2UgaW5zZW5zaXRpdmUgKGkuZS4sIHNoaWZ0K2EgaXMgdGhlIHNhbWUgYXMgU2hpZnQrQSkuIEFuZCBzcGFjZXMgYXJlIHJlbW92ZWQ8L3A+XHJcbiAgICAgKiA8cD5Zb3UgY2FuIGFzc2lnbiBtb3JlIHRoYW4gb25lIGtleSB0byB0aGUgc2FtZSBzaG9ydGN1dCBieSB1c2luZyBhIHwgYmV0d2VlbiB0aGUga2V5cyAoZS5nLiwgJ3NoaWZ0K2EgfCBjdHJsK2EnKTwvcD5cclxuICAgICAqIDxwcmU+XHJcbiAgICAgKiBNb2RpZmllcnM6XHJcbiAgICAgKiAgICBjdHJsLCBhbHQsIHNoaWZ0LCBtZXRhLCAoY3RybCBhbGlhc2VzOiBjb21tYW5kLCBjb250cm9sLCBjb21tYW5kb3Jjb250cm9sKVxyXG4gICAgICogPC9wcmU+XHJcbiAgICAgKiA8cHJlPlxyXG4gICAgICogS2V5czpcclxuICAgICAqICAgIGVzY2FwZSwgMC05LCBtaW51cywgZXF1YWwsIGJhY2tzcGFjZSwgdGFiLCBhLXosIGJhY2tldGxlZnQsIGJyYWNrZXRyaWdodCwgc2VtaWNvbG9uLCBxdW90ZSxcclxuICAgICAqICAgIGJhY2txdW90ZSwgYmFja3NsYXNoLCBjb21tYSwgcGVyaW9kLCBzbGFzaCwgbnVtcGFkbXVsdGlwbHksIHNwYWNlLCBjYXBzbG9jaywgZjEtZjI0LCBwYXVzZSxcclxuICAgICAqICAgIHNjcm9sbGxvY2ssIHByaW50c2NyZWVuLCBob21lLCBhcnJvd3VwLCBhcnJvd2xlZnQsIGFycm93cmlnaHQsIGFycm93ZG93biwgcGFnZXVwLCBwYWdlZG93bixcclxuICAgICAqICAgIGVuZCwgaW5zZXJ0LCBkZWxldGUsIGVudGVyLCBzaGlmdGxlZnQsIHNoaWZ0cmlnaHQsIGN0cmxsZWZ0LCBjdHJscmlnaHQsIGFsdGxlZnQsIGFsdHJpZ2h0LCBzaGlmdGxlZnQsXHJcbiAgICAgKiAgICBzaGlmdHJpZ2h0LCBudW1sb2NrLCBudW1wYWQuLi5cclxuICAgICAqIDwvcHJlPlxyXG4gICAgICogRm9yIE9TLXNwZWNpZmljIGNvZGVzIGFuZCBhIG1vcmUgZGV0YWlsZWQgZXhwbGFuYXRpb24gc2VlIHtAbGluayBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9BUEkvS2V5Ym9hcmRFdmVudC9jb2RlfS4gQWxzbyBub3RlIHRoYXQgJ0RpZ2l0JyBhbmQgJ0tleScgYXJlIHJlbW92ZWQgZnJvbSB0aGUgY29kZSB0byBtYWtlIGl0IGVhc2llciB0byB0eXBlLlxyXG4gICAgICpcclxuICAgICAqIEB0eXBlZGVmIHtzdHJpbmd9IEdsb2JhbEFjY2VsZXJhdG9yfktleUNvZGVzXHJcbiAgICAgKi9cclxuXHJcbiAgICAvKipcclxuICAgICAqIHRyYW5zbGF0ZSBhIHVzZXItcHJvdmlkZWQga2V5Y29kZVxyXG4gICAgICogQHBhcmFtIHtLZXlDb2Rlc30ga2V5Q29kZVxyXG4gICAgICogQHJldHVybiB7S2V5Q29kZXN9IGZvcm1hdHRlZCBhbmQgc29ydGVkIGtleUNvZGVcclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKi9cclxuICAgIHByZXBhcmVLZXk6IGZ1bmN0aW9uKGtleUNvZGUpXHJcbiAgICB7XHJcbiAgICAgICAgY29uc3Qga2V5cyA9IFtdXHJcbiAgICAgICAgbGV0IHNwbGl0XHJcbiAgICAgICAgaWYgKGtleUNvZGUuaW5kZXhPZignfCcpICE9PSAtMSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHNwbGl0ID0ga2V5Q29kZS5zcGxpdCgnfCcpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2VcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHNwbGl0ID0gW2tleUNvZGVdXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGZvciAobGV0IGNvZGUgb2Ygc3BsaXQpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBsZXQga2V5ID0gJydcclxuICAgICAgICAgICAgbGV0IG1vZGlmaWVycyA9IFtdXHJcbiAgICAgICAgICAgIGNvZGUgPSBjb2RlLnRvTG93ZXJDYXNlKCkucmVwbGFjZSgnICcsICcnKVxyXG4gICAgICAgICAgICBpZiAoY29kZS5pbmRleE9mKCcrJykgIT09IC0xKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBzcGxpdCA9IGNvZGUuc3BsaXQoJysnKVxyXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBzcGxpdC5sZW5ndGggLSAxOyBpKyspXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IG1vZGlmaWVyID0gc3BsaXRbaV1cclxuICAgICAgICAgICAgICAgICAgICBtb2RpZmllciA9IG1vZGlmaWVyLnJlcGxhY2UoJ2NvbW1hbmRvcmNvbnRyb2wnLCAnY3RybCcpXHJcbiAgICAgICAgICAgICAgICAgICAgbW9kaWZpZXIgPSBtb2RpZmllci5yZXBsYWNlKCdjb21tYW5kJywgJ2N0cmwnKVxyXG4gICAgICAgICAgICAgICAgICAgIG1vZGlmaWVyID0gbW9kaWZpZXIucmVwbGFjZSgnY29udHJvbCcsICdjdHJsJylcclxuICAgICAgICAgICAgICAgICAgICBtb2RpZmllcnMucHVzaChtb2RpZmllcilcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIG1vZGlmaWVycyA9IG1vZGlmaWVycy5zb3J0KChhLCBiKSA9PiB7IHJldHVybiBhWzBdID4gYlswXSA/IDEgOiBhWzBdIDwgYlswXSA/IC0xIDogMCB9KVxyXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgcGFydCBvZiBtb2RpZmllcnMpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAga2V5ICs9IHBhcnQgKyAnKydcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGtleSArPSBzcGxpdFtzcGxpdC5sZW5ndGggLSAxXVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAga2V5ID0gY29kZVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGtleXMucHVzaChrZXkpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBrZXlzXHJcbiAgICB9LFxyXG5cclxuICAgIC8qKlxyXG4gICAgICogTWFrZSB0aGUgS2V5Q29kZSBwcmV0dHkgZm9yIHByaW50aW5nIG9uIHRoZSBtZW51XHJcbiAgICAgKiBAcGFyYW0ge0tleUNvZGV9IGtleUNvZGVcclxuICAgICAqIEByZXR1cm4ge3N0cmluZ31cclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKi9cclxuICAgIHByZXR0aWZ5S2V5OiBmdW5jdGlvbihrZXlDb2RlKVxyXG4gICAge1xyXG4gICAgICAgIGxldCBrZXkgPSAnJ1xyXG4gICAgICAgIGNvbnN0IGNvZGVzID0gR2xvYmFsQWNjZWxlcmF0b3IucHJlcGFyZUtleShrZXlDb2RlKVxyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY29kZXMubGVuZ3RoOyBpKyspXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBjb25zdCBrZXlDb2RlID0gY29kZXNbaV1cclxuICAgICAgICAgICAgaWYgKGtleUNvZGUuaW5kZXhPZignKycpICE9PSAtMSlcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgY29uc3Qgc3BsaXQgPSBrZXlDb2RlLnRvTG93ZXJDYXNlKCkuc3BsaXQoJysnKVxyXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBzcGxpdC5sZW5ndGggLSAxOyBpKyspXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IG1vZGlmaWVyID0gc3BsaXRbaV1cclxuICAgICAgICAgICAgICAgICAgICBrZXkgKz0gbW9kaWZpZXJbMF0udG9VcHBlckNhc2UoKSArIG1vZGlmaWVyLnN1YnN0cigxKSArICcrJ1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAga2V5ICs9IHNwbGl0W3NwbGl0Lmxlbmd0aCAtIDFdLnRvVXBwZXJDYXNlKClcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGtleSA9IGtleUNvZGUudG9VcHBlckNhc2UoKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChpICE9PSBjb2Rlcy5sZW5ndGggLSAxKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBrZXkgKz0gJyBvciAnXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGtleVxyXG4gICAgfSxcclxuXHJcbiAgICAvKipcclxuICAgICAqIHJlZ2lzdGVyIGEga2V5IGFzIGEgZ2xvYmFsIGFjY2VsZXJhdG9yXHJcbiAgICAgKiBAcGFyYW0ge0tleUNvZGVzfSBrZXlDb2RlIChlLmcuLCBDdHJsK3NoaWZ0K0UpXHJcbiAgICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSBjYWxsYmFja1xyXG4gICAgICovXHJcbiAgICByZWdpc3RlcjogZnVuY3Rpb24oa2V5Q29kZSwgY2FsbGJhY2spXHJcbiAgICB7XHJcbiAgICAgICAgY29uc3Qga2V5cyA9IEdsb2JhbEFjY2VsZXJhdG9yLnByZXBhcmVLZXkoa2V5Q29kZSlcclxuICAgICAgICBmb3IgKGxldCBrZXkgb2Yga2V5cylcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIEdsb2JhbEFjY2VsZXJhdG9yLmtleXNba2V5XSA9IChlKSA9PlxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBjYWxsYmFjayhlKVxyXG4gICAgICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXHJcbiAgICAgICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9LFxyXG5cclxuICAgIGtleURvd246IGZ1bmN0aW9uKGFjY2VsZXJhdG9yLCBlKVxyXG4gICAge1xyXG4gICAgICAgIGNvbnN0IG1vZGlmaWVycyA9IFtdXHJcbiAgICAgICAgaWYgKGUuYWx0S2V5KVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgbW9kaWZpZXJzLnB1c2goJ2FsdCcpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChlLmN0cmxLZXkpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBtb2RpZmllcnMucHVzaCgnY3RybCcpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChlLm1ldGFLZXkpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBtb2RpZmllcnMucHVzaCgnbWV0YScpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChlLnNoaWZ0S2V5KVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgbW9kaWZpZXJzLnB1c2goJ3NoaWZ0JylcclxuICAgICAgICB9XHJcbiAgICAgICAgbGV0IGtleUNvZGUgPSAnJ1xyXG4gICAgICAgIGZvciAobGV0IG1vZGlmaWVyIG9mIG1vZGlmaWVycylcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGtleUNvZGUgPSBtb2RpZmllciArICcrJ1xyXG4gICAgICAgIH1cclxuICAgICAgICBsZXQgdHJhbnNsYXRlID0gZS5jb2RlLnRvTG93ZXJDYXNlKClcclxuICAgICAgICB0cmFuc2xhdGUgPSB0cmFuc2xhdGUucmVwbGFjZSgnZGlnaXQnLCAnJylcclxuICAgICAgICB0cmFuc2xhdGUgPSB0cmFuc2xhdGUucmVwbGFjZSgna2V5JywgJycpXHJcbiAgICAgICAga2V5Q29kZSArPSB0cmFuc2xhdGVcclxuICAgICAgICBpZiAoR2xvYmFsQWNjZWxlcmF0b3IubWVudUtleXNba2V5Q29kZV0pXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBHbG9iYWxBY2NlbGVyYXRvci5tZW51S2V5c1trZXlDb2RlXShlLCB0aGlzKVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmIChHbG9iYWxBY2NlbGVyYXRvci5rZXlzW2tleUNvZGVdKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgR2xvYmFsQWNjZWxlcmF0b3Iua2V5c1trZXlDb2RlXShlLCB0aGlzKVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBHbG9iYWxBY2NlbGVyYXRvciJdfQ==