/**
 * Handles all keyboard input for the menu and user-registered keys
 */
const LocalAccelerator = {

    init: function () {
        if (!LocalAccelerator.menuKeys) {
            LocalAccelerator.menuKeys = {};
            LocalAccelerator.keys = {};
            document.body.addEventListener('keydown', e => LocalAccelerator.keydown(LocalAccelerator, e));
            document.body.addEventListener('keyup', e => LocalAccelerator.keyup(LocalAccelerator, e));
        }
    },

    /**
     * clear all user-registered keys
     */
    clearKeys: function () {
        LocalAccelerator.keys = {};
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
            LocalAccelerator.menuKeys[LocalAccelerator.prepareKey(keyCode)] = e => {
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
        LocalAccelerator.menuKeys['escape'] = () => menu.closeAll();
        LocalAccelerator.menuKeys['enter'] = e => menu.enter(e);
        LocalAccelerator.menuKeys['space'] = e => menu.enter(e);
        LocalAccelerator.menuKeys['arrowright'] = e => menu.move(e, 'right');
        LocalAccelerator.menuKeys['arrowleft'] = e => menu.move(e, 'left');
        LocalAccelerator.menuKeys['arrowup'] = e => menu.move(e, 'up');
        LocalAccelerator.menuKeys['arrowdown'] = e => menu.move(e, 'down');
    },

    /**
     * special key registration for alt
     * @param {function} pressed
     * @param {function} released
     * @private
     */
    registerAlt: function (pressed, released) {
        LocalAccelerator.alt = { pressed, released };
    },

    /**
     * Removes menu shortcuts
     * @private
     */
    unregisterMenuShortcuts: function () {
        LocalAccelerator.menuKeys = {};
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
     * @typedef {string} LocalAccelerator~KeyCodes
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
        keyCode += '';
        if (keyCode.length > 1 && keyCode.indexOf('|') !== -1) {
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
        const codes = LocalAccelerator.prepareKey(keyCode);
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
        const keys = LocalAccelerator.prepareKey(keyCode);
        for (let key of keys) {
            LocalAccelerator.keys[key] = e => {
                callback(e);
                e.preventDefault();
                e.stopPropagation();
            };
        }
    },

    keyup: function (accelerator, e) {
        if (LocalAccelerator.alt && (e.code === 'AltLeft' || e.code === 'AltRight')) {
            LocalAccelerator.alt.released();
            LocalAccelerator.alt.isPressed = false;
        }
    },

    keydown: function (accelerator, e) {
        if (LocalAccelerator.alt && !LocalAccelerator.alt.isPressed && (e.code === 'AltLeft' || e.code === 'AltRight')) {
            LocalAccelerator.alt.pressed();
            LocalAccelerator.alt.isPressed = true;
            e.preventDefault();
        }
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
            keyCode += modifier + '+';
        }
        let translate = e.code.toLowerCase();
        translate = translate.replace('digit', '');
        translate = translate.replace('key', '');
        keyCode += translate;
        if (LocalAccelerator.menuKeys[keyCode]) {
            LocalAccelerator.menuKeys[keyCode](e, LocalAccelerator);
        } else if (LocalAccelerator.keys[keyCode]) {
            LocalAccelerator.keys[keyCode](e, LocalAccelerator);
        }
    }
};

module.exports = LocalAccelerator;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9sb2NhbEFjY2VsZXJhdG9yLmpzIl0sIm5hbWVzIjpbIkxvY2FsQWNjZWxlcmF0b3IiLCJpbml0IiwibWVudUtleXMiLCJrZXlzIiwiZG9jdW1lbnQiLCJib2R5IiwiYWRkRXZlbnRMaXN0ZW5lciIsImUiLCJrZXlkb3duIiwia2V5dXAiLCJjbGVhcktleXMiLCJyZWdpc3Rlck1lbnVTaG9ydGN1dCIsImxldHRlciIsIm1lbnVJdGVtIiwia2V5Q29kZSIsIm1lbnUiLCJhcHBsaWNhdGlvbk1lbnUiLCJwcmVwYXJlS2V5IiwiaGFuZGxlQ2xpY2siLCJzdG9wUHJvcGFnYXRpb24iLCJwcmV2ZW50RGVmYXVsdCIsInJlZ2lzdGVyTWVudVNwZWNpYWwiLCJjbG9zZUFsbCIsImVudGVyIiwibW92ZSIsInJlZ2lzdGVyQWx0IiwicHJlc3NlZCIsInJlbGVhc2VkIiwiYWx0IiwidW5yZWdpc3Rlck1lbnVTaG9ydGN1dHMiLCJzcGxpdCIsImxlbmd0aCIsImluZGV4T2YiLCJjb2RlIiwia2V5IiwibW9kaWZpZXJzIiwidG9Mb3dlckNhc2UiLCJyZXBsYWNlIiwiaSIsIm1vZGlmaWVyIiwicHVzaCIsInNvcnQiLCJhIiwiYiIsInBhcnQiLCJwcmV0dGlmeUtleSIsImNvZGVzIiwidG9VcHBlckNhc2UiLCJzdWJzdHIiLCJyZWdpc3RlciIsImNhbGxiYWNrIiwiYWNjZWxlcmF0b3IiLCJpc1ByZXNzZWQiLCJhbHRLZXkiLCJjdHJsS2V5IiwibWV0YUtleSIsInNoaWZ0S2V5IiwidHJhbnNsYXRlIiwibW9kdWxlIiwiZXhwb3J0cyJdLCJtYXBwaW5ncyI6IkFBQUE7OztBQUdBLE1BQU1BLG1CQUFtQjs7QUFFckJDLFVBQU0sWUFDTjtBQUNJLFlBQUksQ0FBQ0QsaUJBQWlCRSxRQUF0QixFQUNBO0FBQ0lGLDZCQUFpQkUsUUFBakIsR0FBNEIsRUFBNUI7QUFDQUYsNkJBQWlCRyxJQUFqQixHQUF3QixFQUF4QjtBQUNBQyxxQkFBU0MsSUFBVCxDQUFjQyxnQkFB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RWlELFFBQU4sRUFDQTtBQUNJckIsc0JBQVVLLElBQVYsQ0FBZSxPQUFmO0FBQ0g7QUFDRCxZQUFJMUIsVUFBVSxFQUFkO0FBQ0EsYUFBSyxJQUFJeUIsUUFBVCxJQUFxQkosU0FBckIsRUFDQTtBQUNJckIsdUJBQVd5QixXQUFXLEdBQXRCO0FBQ0g7QUFDRCxZQUFJa0IsWUFBWWxELEVBQUUwQixJQUFGLENBQU9HLFdBQVAsRUFBaEI7QUFDQXFCLG9CQUFZQSxVQUFVcEIsT0FBVixDQUFrQixPQUFsQixFQUEyQixFQUEzQixDQUFaO0FBQ0FvQixvQkFBWUEsVUFBVXBCLE9BQVYsQ0FBa0IsS0FBbEIsRUFBeUIsRUFBekIsQ0FBWjtBQUNBdkIsbUJBQVcyQyxTQUFYO0FBQ0EsWUFBSXpELGlCQUFpQkUsUUFBakIsQ0FBMEJZLE9BQTFCLENBQUosRUFDQTtBQUNJZCw2QkFBaUJFLFFBQWpCLENBQTBCWSxPQUExQixFQUFtQ1AsQ0FBbkMsRUFBc0NQLGdCQUF0QztBQUNILFNBSEQsTUFJSyxJQUFJQSxpQkFBaUJHLElBQWpCLENBQXNCVyxPQUF0QixDQUFKLEVBQ0w7QUFDSWQsNkJBQWlCRyxJQUFqQixDQUFzQlcsT0FBdEIsRUFBK0JQLENBQS9CLEVBQWtDUCxnQkFBbEM7QUFDSDtBQUNKO0FBaFFvQixDQUF6Qjs7QUFtUUEwRCxPQUFPQyxPQUFQLEdBQWlCM0QsZ0JBQWpCIiwiZmlsZSI6ImxvY2FsQWNjZWxlcmF0b3IuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcclxuICogSGFuZGxlcyBhbGwga2V5Ym9hcmQgaW5wdXQgZm9yIHRoZSBtZW51IGFuZCB1c2VyLXJlZ2lzdGVyZWQga2V5c1xyXG4gKi9cclxuY29uc3QgTG9jYWxBY2NlbGVyYXRvciA9IHtcclxuXHJcbiAgICBpbml0OiBmdW5jdGlvbigpXHJcbiAgICB7XHJcbiAgICAgICAgaWYgKCFMb2NhbEFjY2VsZXJhdG9yLm1lbnVLZXlzKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgTG9jYWxBY2NlbGVyYXRvci5tZW51S2V5cyA9IHt9XHJcbiAgICAgICAgICAgIExvY2FsQWNjZWxlcmF0b3Iua2V5cyA9IHt9XHJcbiAgICAgICAgICAgIGRvY3VtZW50LmJvZHkuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIChlKSA9PiBMb2NhbEFjY2VsZXJhdG9yLmtleWRvd24oTG9jYWxBY2NlbGVyYXRvciwgZSkpXHJcbiAgICAgICAgICAgIGRvY3VtZW50LmJvZHkuYWRkRXZlbnRMaXN0ZW5lcigna2V5dXAnLCAoZSkgPT4gTG9jYWxBY2NlbGVyYXRvci5rZXl1cChMb2NhbEFjY2VsZXJhdG9yLCBlKSlcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG5cclxuICAgIC8qKlxyXG4gICAgICogY2xlYXIgYWxsIHVzZXItcmVnaXN0ZXJlZCBrZXlzXHJcbiAgICAgKi9cclxuICAgIGNsZWFyS2V5czogZnVuY3Rpb24oKVxyXG4gICAge1xyXG4gICAgICAgIExvY2FsQWNjZWxlcmF0b3Iua2V5cyA9IHt9XHJcbiAgICB9LFxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmVnaXN0ZXIgYSBzaG9ydGN1dCBrZXkgZm9yIHVzZSBieSBhbiBvcGVuIG1lbnVcclxuICAgICAqIEBwYXJhbSB7S2V5Q29kZXN9IGxldHRlclxyXG4gICAgICogQHBhcmFtIHtNZW51SXRlbX0gbWVudUl0ZW1cclxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gYXBwbGljYXRpb25NZW51XHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICByZWdpc3Rlck1lbnVTaG9ydGN1dDogZnVuY3Rpb24obGV0dGVyLCBtZW51SXRlbSlcclxuICAgIHtcclxuICAgICAgICBpZiAobGV0dGVyKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgY29uc3Qga2V5Q29kZSA9IChtZW51SXRlbS5tZW51LmFwcGxpY2F0aW9uTWVudSA/ICdhbHQrJyA6ICcnKSArIGxldHRlclxyXG4gICAgICAgICAgICBMb2NhbEFjY2VsZXJhdG9yLm1lbnVLZXlzW0xvY2FsQWNjZWxlcmF0b3IucHJlcGFyZUtleShrZXlDb2RlKV0gPSAoZSkgPT5cclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgbWVudUl0ZW0uaGFuZGxlQ2xpY2soZSlcclxuICAgICAgICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKClcclxuICAgICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuXHJcbiAgICAvKipcclxuICAgICAqIFJlZ2lzdGVyIHNwZWNpYWwgc2hvcnRjdXQga2V5cyBmb3IgbWVudVxyXG4gICAgICogQHBhcmFtIHtNZW51SXRlbX0gbWVudUl0ZW1cclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKi9cclxuICAgIHJlZ2lzdGVyTWVudVNwZWNpYWw6IGZ1bmN0aW9uKG1lbnUpXHJcbiAgICB7XHJcbiAgICAgICAgTG9jYWxBY2NlbGVyYXRvci5tZW51S2V5c1snZXNjYXBlJ10gPSAoKSA9PiBtZW51LmNsb3NlQWxsKClcclxuICAgICAgICBMb2NhbEFjY2VsZXJhdG9yLm1lbnVLZXlzWydlbnRlciddID0gKGUpID0+IG1lbnUuZW50ZXIoZSlcclxuICAgICAgICBMb2NhbEFjY2VsZXJhdG9yLm1lbnVLZXlzWydzcGFjZSddID0gKGUpID0+IG1lbnUuZW50ZXIoZSlcclxuICAgICAgICBMb2NhbEFjY2VsZXJhdG9yLm1lbnVLZXlzWydhcnJvd3JpZ2h0J10gPSAoZSkgPT4gbWVudS5tb3ZlKGUsICdyaWdodCcpXHJcbiAgICAgICAgTG9jYWxBY2NlbGVyYXRvci5tZW51S2V5c1snYXJyb3dsZWZ0J10gPSAoZSkgPT4gbWVudS5tb3ZlKGUsICdsZWZ0JylcclxuICAgICAgICBMb2NhbEFjY2VsZXJhdG9yLm1lbnVLZXlzWydhcnJvd3VwJ10gPSAoZSkgPT4gbWVudS5tb3ZlKGUsICd1cCcpXHJcbiAgICAgICAgTG9jYWxBY2NlbGVyYXRvci5tZW51S2V5c1snYXJyb3dkb3duJ10gPSAoZSkgPT4gbWVudS5tb3ZlKGUsICdkb3duJylcclxuICAgIH0sXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBzcGVjaWFsIGtleSByZWdpc3RyYXRpb24gZm9yIGFsdFxyXG4gICAgICogQHBhcmFtIHtmdW5jdGlvbn0gcHJlc3NlZFxyXG4gICAgICogQHBhcmFtIHtmdW5jdGlvbn0gcmVsZWFzZWRcclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKi9cclxuICAgIHJlZ2lzdGVyQWx0OiBmdW5jdGlvbiAocHJlc3NlZCwgcmVsZWFzZWQpXHJcbiAgICB7XHJcbiAgICAgICAgTG9jYWxBY2NlbGVyYXRvci5hbHQgPSB7IHByZXNzZWQsIHJlbGVhc2VkIH1cclxuICAgIH0sXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZW1vdmVzIG1lbnUgc2hvcnRjdXRzXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICB1bnJlZ2lzdGVyTWVudVNob3J0Y3V0czogZnVuY3Rpb24oKVxyXG4gICAge1xyXG4gICAgICAgIExvY2FsQWNjZWxlcmF0b3IubWVudUtleXMgPSB7fVxyXG4gICAgfSxcclxuXHJcbiAgICAvKipcclxuICAgICAqIEtleWNvZGVzIGRlZmluaXRpb24uIEluIHRoZSBmb3JtIG9mIG1vZGlmaWVyWyttb2RpZmllci4uLl0ra2V5XHJcbiAgICAgKiA8cD5Gb3IgZXhhbXBsZTogY3RybCtzaGlmdCtlPC9wPlxyXG4gICAgICogPHA+S2V5Q29kZXMgYXJlIGNhc2UgaW5zZW5zaXRpdmUgKGkuZS4sIHNoaWZ0K2EgaXMgdGhlIHNhbWUgYXMgU2hpZnQrQSkuIEFuZCBzcGFjZXMgYXJlIHJlbW92ZWQ8L3A+XHJcbiAgICAgKiA8cD5Zb3UgY2FuIGFzc2lnbiBtb3JlIHRoYW4gb25lIGtleSB0byB0aGUgc2FtZSBzaG9ydGN1dCBieSB1c2luZyBhIHwgYmV0d2VlbiB0aGUga2V5cyAoZS5nLiwgJ3NoaWZ0K2EgfCBjdHJsK2EnKTwvcD5cclxuICAgICAqIDxwcmU+XHJcbiAgICAgKiBNb2RpZmllcnM6XHJcbiAgICAgKiAgICBjdHJsLCBhbHQsIHNoaWZ0LCBtZXRhLCAoY3RybCBhbGlhc2VzOiBjb21tYW5kLCBjb250cm9sLCBjb21tYW5kb3Jjb250cm9sKVxyXG4gICAgICogPC9wcmU+XHJcbiAgICAgKiA8cHJlPlxyXG4gICAgICogS2V5czpcclxuICAgICAqICAgIGVzY2FwZSwgMC05LCBtaW51cywgZXF1YWwsIGJhY2tzcGFjZSwgdGFiLCBhLXosIGJhY2tldGxlZnQsIGJyYWNrZXRyaWdodCwgc2VtaWNvbG9uLCBxdW90ZSxcclxuICAgICAqICAgIGJhY2txdW90ZSwgYmFja3NsYXNoLCBjb21tYSwgcGVyaW9kLCBzbGFzaCwgbnVtcGFkbXVsdGlwbHksIHNwYWNlLCBjYXBzbG9jaywgZjEtZjI0LCBwYXVzZSxcclxuICAgICAqICAgIHNjcm9sbGxvY2ssIHByaW50c2NyZWVuLCBob21lLCBhcnJvd3VwLCBhcnJvd2xlZnQsIGFycm93cmlnaHQsIGFycm93ZG93biwgcGFnZXVwLCBwYWdlZG93bixcclxuICAgICAqICAgIGVuZCwgaW5zZXJ0LCBkZWxldGUsIGVudGVyLCBzaGlmdGxlZnQsIHNoaWZ0cmlnaHQsIGN0cmxsZWZ0LCBjdHJscmlnaHQsIGFsdGxlZnQsIGFsdHJpZ2h0LCBzaGlmdGxlZnQsXHJcbiAgICAgKiAgICBzaGlmdHJpZ2h0LCBudW1sb2NrLCBudW1wYWQuLi5cclxuICAgICAqIDwvcHJlPlxyXG4gICAgICogRm9yIE9TLXNwZWNpZmljIGNvZGVzIGFuZCBhIG1vcmUgZGV0YWlsZWQgZXhwbGFuYXRpb24gc2VlIHtAbGluayBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9BUEkvS2V5Ym9hcmRFdmVudC9jb2RlfS4gQWxzbyBub3RlIHRoYXQgJ0RpZ2l0JyBhbmQgJ0tleScgYXJlIHJlbW92ZWQgZnJvbSB0aGUgY29kZSB0byBtYWtlIGl0IGVhc2llciB0byB0eXBlLlxyXG4gICAgICpcclxuICAgICAqIEB0eXBlZGVmIHtzdHJpbmd9IExvY2FsQWNjZWxlcmF0b3J+S2V5Q29kZXNcclxuICAgICAqL1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogdHJhbnNsYXRlIGEgdXNlci1wcm92aWRlZCBrZXljb2RlXHJcbiAgICAgKiBAcGFyYW0ge0tleUNvZGVzfSBrZXlDb2RlXHJcbiAgICAgKiBAcmV0dXJuIHtLZXlDb2Rlc30gZm9ybWF0dGVkIGFuZCBzb3J0ZWQga2V5Q29kZVxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqL1xyXG4gICAgcHJlcGFyZUtleTogZnVuY3Rpb24oa2V5Q29kZSlcclxuICAgIHtcclxuICAgICAgICBjb25zdCBrZXlzID0gW11cclxuICAgICAgICBsZXQgc3BsaXRcclxuICAgICAgICBrZXlDb2RlICs9ICcnXHJcbiAgICAgICAgaWYgKGtleUNvZGUubGVuZ3RoID4gMSAmJiBrZXlDb2RlLmluZGV4T2YoJ3wnKSAhPT0gLTEpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBzcGxpdCA9IGtleUNvZGUuc3BsaXQoJ3wnKVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBzcGxpdCA9IFtrZXlDb2RlXVxyXG4gICAgICAgIH1cclxuICAgICAgICBmb3IgKGxldCBjb2RlIG9mIHNwbGl0KVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgbGV0IGtleSA9ICcnXHJcbiAgICAgICAgICAgIGxldCBtb2RpZmllcnMgPSBbXVxyXG4gICAgICAgICAgICBjb2RlID0gY29kZS50b0xvd2VyQ2FzZSgpLnJlcGxhY2UoJyAnLCAnJylcclxuICAgICAgICAgICAgaWYgKGNvZGUuaW5kZXhPZignKycpICE9PSAtMSlcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgY29uc3Qgc3BsaXQgPSBjb2RlLnNwbGl0KCcrJylcclxuICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgc3BsaXQubGVuZ3RoIC0gMTsgaSsrKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBtb2RpZmllciA9IHNwbGl0W2ldXHJcbiAgICAgICAgICAgICAgICAgICAgbW9kaWZpZXIgPSBtb2RpZmllci5yZXBsYWNlKCdjb21tYW5kb3Jjb250cm9sJywgJ2N0cmwnKVxyXG4gICAgICAgICAgICAgICAgICAgIG1vZGlmaWVyID0gbW9kaWZpZXIucmVwbGFjZSgnY29tbWFuZCcsICdjdHJsJylcclxuICAgICAgICAgICAgICAgICAgICBtb2RpZmllciA9IG1vZGlmaWVyLnJlcGxhY2UoJ2NvbnRyb2wnLCAnY3RybCcpXHJcbiAgICAgICAgICAgICAgICAgICAgbW9kaWZpZXJzLnB1c2gobW9kaWZpZXIpXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBtb2RpZmllcnMgPSBtb2RpZmllcnMuc29ydCgoYSwgYikgPT4geyByZXR1cm4gYVswXSA+IGJbMF0gPyAxIDogYVswXSA8IGJbMF0gPyAtMSA6IDAgfSlcclxuICAgICAgICAgICAgICAgIGZvciAobGV0IHBhcnQgb2YgbW9kaWZpZXJzKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGtleSArPSBwYXJ0ICsgJysnXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBrZXkgKz0gc3BsaXRbc3BsaXQubGVuZ3RoIC0gMV1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGtleSA9IGNvZGVcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBrZXlzLnB1c2goa2V5KVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4ga2V5c1xyXG4gICAgfSxcclxuXHJcbiAgICAvKipcclxuICAgICAqIE1ha2UgdGhlIEtleUNvZGUgcHJldHR5IGZvciBwcmludGluZyBvbiB0aGUgbWVudVxyXG4gICAgICogQHBhcmFtIHtLZXlDb2RlfSBrZXlDb2RlXHJcbiAgICAgKiBAcmV0dXJuIHtzdHJpbmd9XHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICBwcmV0dGlmeUtleTogZnVuY3Rpb24oa2V5Q29kZSlcclxuICAgIHtcclxuICAgICAgICBsZXQga2V5ID0gJydcclxuICAgICAgICBjb25zdCBjb2RlcyA9IExvY2FsQWNjZWxlcmF0b3IucHJlcGFyZUtleShrZXlDb2RlKVxyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY29kZXMubGVuZ3RoOyBpKyspXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBjb25zdCBrZXlDb2RlID0gY29kZXNbaV1cclxuICAgICAgICAgICAgaWYgKGtleUNvZGUuaW5kZXhPZignKycpICE9PSAtMSlcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgY29uc3Qgc3BsaXQgPSBrZXlDb2RlLnRvTG93ZXJDYXNlKCkuc3BsaXQoJysnKVxyXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBzcGxpdC5sZW5ndGggLSAxOyBpKyspXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IG1vZGlmaWVyID0gc3BsaXRbaV1cclxuICAgICAgICAgICAgICAgICAgICBrZXkgKz0gbW9kaWZpZXJbMF0udG9VcHBlckNhc2UoKSArIG1vZGlmaWVyLnN1YnN0cigxKSArICcrJ1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAga2V5ICs9IHNwbGl0W3NwbGl0Lmxlbmd0aCAtIDFdLnRvVXBwZXJDYXNlKClcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGtleSA9IGtleUNvZGUudG9VcHBlckNhc2UoKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChpICE9PSBjb2Rlcy5sZW5ndGggLSAxKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBrZXkgKz0gJyBvciAnXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGtleVxyXG4gICAgfSxcclxuXHJcbiAgICAvKipcclxuICAgICAqIHJlZ2lzdGVyIGEga2V5IGFzIGEgZ2xvYmFsIGFjY2VsZXJhdG9yXHJcbiAgICAgKiBAcGFyYW0ge0tleUNvZGVzfSBrZXlDb2RlIChlLmcuLCBDdHJsK3NoaWZ0K0UpXHJcbiAgICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSBjYWxsYmFja1xyXG4gICAgICovXHJcbiAgICByZWdpc3RlcjogZnVuY3Rpb24oa2V5Q29kZSwgY2FsbGJhY2spXHJcbiAgICB7XHJcbiAgICAgICAgY29uc3Qga2V5cyA9IExvY2FsQWNjZWxlcmF0b3IucHJlcGFyZUtleShrZXlDb2RlKVxyXG4gICAgICAgIGZvciAobGV0IGtleSBvZiBrZXlzKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgTG9jYWxBY2NlbGVyYXRvci5rZXlzW2tleV0gPSAoZSkgPT5cclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgY2FsbGJhY2soZSlcclxuICAgICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKVxyXG4gICAgICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuXHJcbiAgICBrZXl1cDogZnVuY3Rpb24gKGFjY2VsZXJhdG9yLCBlKVxyXG4gICAge1xyXG4gICAgICAgIGlmIChMb2NhbEFjY2VsZXJhdG9yLmFsdCAmJiAoZS5jb2RlID09PSAnQWx0TGVmdCcgfHwgZS5jb2RlID09PSAnQWx0UmlnaHQnKSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIExvY2FsQWNjZWxlcmF0b3IuYWx0LnJlbGVhc2VkKClcclxuICAgICAgICAgICAgTG9jYWxBY2NlbGVyYXRvci5hbHQuaXNQcmVzc2VkID0gZmFsc2VcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG5cclxuICAgIGtleWRvd246IGZ1bmN0aW9uKGFjY2VsZXJhdG9yLCBlKVxyXG4gICAge1xyXG4gICAgICAgIGlmIChMb2NhbEFjY2VsZXJhdG9yLmFsdCAmJiAhTG9jYWxBY2NlbGVyYXRvci5hbHQuaXNQcmVzc2VkICYmIChlLmNvZGUgPT09ICdBbHRMZWZ0JyB8fCBlLmNvZGUgPT09ICdBbHRSaWdodCcpKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgTG9jYWxBY2NlbGVyYXRvci5hbHQucHJlc3NlZCgpXHJcbiAgICAgICAgICAgIExvY2FsQWNjZWxlcmF0b3IuYWx0LmlzUHJlc3NlZCA9IHRydWVcclxuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IG1vZGlmaWVycyA9IFtdXHJcbiAgICAgICAgaWYgKGUuYWx0S2V5KVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgbW9kaWZpZXJzLnB1c2goJ2FsdCcpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChlLmN0cmxLZXkpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBtb2RpZmllcnMucHVzaCgnY3RybCcpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChlLm1ldGFLZXkpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBtb2RpZmllcnMucHVzaCgnbWV0YScpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChlLnNoaWZ0S2V5KVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgbW9kaWZpZXJzLnB1c2goJ3NoaWZ0JylcclxuICAgICAgICB9XHJcbiAgICAgICAgbGV0IGtleUNvZGUgPSAnJ1xyXG4gICAgICAgIGZvciAobGV0IG1vZGlmaWVyIG9mIG1vZGlmaWVycylcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGtleUNvZGUgKz0gbW9kaWZpZXIgKyAnKydcclxuICAgICAgICB9XHJcbiAgICAgICAgbGV0IHRyYW5zbGF0ZSA9IGUuY29kZS50b0xvd2VyQ2FzZSgpXHJcbiAgICAgICAgdHJhbnNsYXRlID0gdHJhbnNsYXRlLnJlcGxhY2UoJ2RpZ2l0JywgJycpXHJcbiAgICAgICAgdHJhbnNsYXRlID0gdHJhbnNsYXRlLnJlcGxhY2UoJ2tleScsICcnKVxyXG4gICAgICAgIGtleUNvZGUgKz0gdHJhbnNsYXRlXHJcbiAgICAgICAgaWYgKExvY2FsQWNjZWxlcmF0b3IubWVudUtleXNba2V5Q29kZV0pXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBMb2NhbEFjY2VsZXJhdG9yLm1lbnVLZXlzW2tleUNvZGVdKGUsIExvY2FsQWNjZWxlcmF0b3IpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKExvY2FsQWNjZWxlcmF0b3Iua2V5c1trZXlDb2RlXSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIExvY2FsQWNjZWxlcmF0b3Iua2V5c1trZXlDb2RlXShlLCBMb2NhbEFjY2VsZXJhdG9yKVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBMb2NhbEFjY2VsZXJhdG9yIl19