/**
 * Handles all keyboard input for the menu and user-registered keys
 */
const LocalAccelerator = {

    init: function () {
        if (!LocalAccelerator.menuKeys) {
            LocalAccelerator.menuKeys = {};
            LocalAccelerator.keys = {};
            document.body.addEventListener('keydown', e => LocalAccelerator.keyDown(LocalAccelerator, e));
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9sb2NhbEFjY2VsZXJhdG9yLmpzIl0sIm5hbWVzIjpbIkxvY2FsQWNjZWxlcmF0b3IiLCJpbml0IiwibWVudUtleXMiLCJrZXlzIiwiZG9jdW1lbnQiLCJib2R5IiwiYWRkRXZlbnRMaXN0ZW5lciIsImUiLCJrZXlEb3duIiwiY2xlYXJLZXlzIiwicmVnaXN0ZXJNZW51U2hvcnRjdXQiLCJsZXR0ZXIiLCJtZW51SXRlbSIsImtleUNvZGUiLCJtZW51IiwiYXBwbGljYXRpb25NZW51IiwicHJlcGFyZUtleSIsImhhbmRsZUNsaWNrIiwic3RvcFByb3BhZ2F0aW9uIiwicHJldmVudERlZmF1bHQiLCJyZWdpc3Rlck1lbnVTcGVjaWFsIiwiY2xvc2VBbGwiLCJlbnRlciIsIm1vdmUiLCJ1bnJlZ2lzdGVyTWVudVNob3J0Y3V0cyIsInNwbGl0IiwibGVuZ3RoIiwiaW5kZXhPZiIsImNvZGUiLCJrZXkiLCJtb2RpZmllcnMiLCJ0b0xvd2VyQ2FzZSIsInJlcGxhY2UiLCJpIiwibW9kaWZpZXIiLCJwdXNoIiwic29ydCIsImEiLCJiIiwicGFydCIsInByZXR0aWZ5S2V5IiwiY29kZXMiLCJ0b1VwcGVyQ2FzZSIsInN1YnN0ciIsInJlZ2lzdGVyIiwiY2FsbGJhY2siLCJhY2NlbGVyYXRvciIsImFsdEtleSIsImN0cmxLZXkiLCJtZXRhS2V5Iiwic2hpZnRLZXkiLCJ0cmFuc2xhdGUiLCJtb2R1bGUiLCJleHBvcnRzIl0sIm1hcHBpbmdzIjoiQUFBQTs7O0FBR0EsTUFBTUEsbUJBQW1COztBQUVyQkMsVUFBTSxZQUNOO0FBQ0ksWUFBSSxDQUFDRCxpQkFBaUJFLFFBQXRCLEVBQ0E7QUFDSUYsNkJBQWlCRSxRQUFqQixHQUE0QixFQUE1QjtBQUNBRiw2QkFBaUJHLElBQWpCLEdBQXdCLEVBQXhCO0FBQ0FDLHFCQUFTQyxJQUFULENBQWNDLGdCQUFkLENBQStCLFNBQS9CLEVBQTJDQyxDQUFELElBQU9QLGlCQUFpQlEsT0FBakIsQ0FBeUJSLGdCQUF6QixF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QUNJbEIsc0JBQVVLLElBQVYsQ0FBZSxNQUFmO0FBQ0g7QUFDRCxZQUFJNUIsRUFBRTBDLE9BQU4sRUFDQTtBQUNJbkIsc0JBQVVLLElBQVYsQ0FBZSxNQUFmO0FBQ0g7QUFDRCxZQUFJNUIsRUFBRTJDLFFBQU4sRUFDQTtBQUNJcEIsc0JBQVVLLElBQVYsQ0FBZSxPQUFmO0FBQ0g7QUFDRCxZQUFJdEIsVUFBVSxFQUFkO0FBQ0EsYUFBSyxJQUFJcUIsUUFBVCxJQUFxQkosU0FBckIsRUFDQTtBQUNJakIsdUJBQVdxQixXQUFXLEdBQXRCO0FBQ0g7QUFDRCxZQUFJaUIsWUFBWTVDLEVBQUVxQixJQUFGLENBQU9HLFdBQVAsRUFBaEI7QUFDQW9CLG9CQUFZQSxVQUFVbkIsT0FBVixDQUFrQixPQUFsQixFQUEyQixFQUEzQixDQUFaO0FBQ0FtQixvQkFBWUEsVUFBVW5CLE9BQVYsQ0FBa0IsS0FBbEIsRUFBeUIsRUFBekIsQ0FBWjtBQUNBbkIsbUJBQVdzQyxTQUFYO0FBQ0EsWUFBSW5ELGlCQUFpQkUsUUFBakIsQ0FBMEJXLE9BQTFCLENBQUosRUFDQTtBQUNJYiw2QkFBaUJFLFFBQWpCLENBQTBCVyxPQUExQixFQUFtQ04sQ0FBbkMsRUFBc0NQLGdCQUF0QztBQUNILFNBSEQsTUFJSyxJQUFJQSxpQkFBaUJHLElBQWpCLENBQXNCVSxPQUF0QixDQUFKLEVBQ0w7QUFDSWIsNkJBQWlCRyxJQUFqQixDQUFzQlUsT0FBdEIsRUFBK0JOLENBQS9CLEVBQWtDUCxnQkFBbEM7QUFDSDtBQUNKO0FBck9vQixDQUF6Qjs7QUF3T0FvRCxPQUFPQyxPQUFQLEdBQWlCckQsZ0JBQWpCIiwiZmlsZSI6ImxvY2FsQWNjZWxlcmF0b3IuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcclxuICogSGFuZGxlcyBhbGwga2V5Ym9hcmQgaW5wdXQgZm9yIHRoZSBtZW51IGFuZCB1c2VyLXJlZ2lzdGVyZWQga2V5c1xyXG4gKi9cclxuY29uc3QgTG9jYWxBY2NlbGVyYXRvciA9IHtcclxuXHJcbiAgICBpbml0OiBmdW5jdGlvbigpXHJcbiAgICB7XHJcbiAgICAgICAgaWYgKCFMb2NhbEFjY2VsZXJhdG9yLm1lbnVLZXlzKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgTG9jYWxBY2NlbGVyYXRvci5tZW51S2V5cyA9IHt9XHJcbiAgICAgICAgICAgIExvY2FsQWNjZWxlcmF0b3Iua2V5cyA9IHt9XHJcbiAgICAgICAgICAgIGRvY3VtZW50LmJvZHkuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIChlKSA9PiBMb2NhbEFjY2VsZXJhdG9yLmtleURvd24oTG9jYWxBY2NlbGVyYXRvciwgZSkpXHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuXHJcbiAgICAvKipcclxuICAgICAqIGNsZWFyIGFsbCB1c2VyLXJlZ2lzdGVyZWQga2V5c1xyXG4gICAgICovXHJcbiAgICBjbGVhcktleXM6IGZ1bmN0aW9uKClcclxuICAgIHtcclxuICAgICAgICBMb2NhbEFjY2VsZXJhdG9yLmtleXMgPSB7fVxyXG4gICAgfSxcclxuXHJcbiAgICAvKipcclxuICAgICAqIFJlZ2lzdGVyIGEgc2hvcnRjdXQga2V5IGZvciB1c2UgYnkgYW4gb3BlbiBtZW51XHJcbiAgICAgKiBAcGFyYW0ge0tleUNvZGVzfSBsZXR0ZXJcclxuICAgICAqIEBwYXJhbSB7TWVudUl0ZW19IG1lbnVJdGVtXHJcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IGFwcGxpY2F0aW9uTWVudVxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqL1xyXG4gICAgcmVnaXN0ZXJNZW51U2hvcnRjdXQ6IGZ1bmN0aW9uKGxldHRlciwgbWVudUl0ZW0pXHJcbiAgICB7XHJcbiAgICAgICAgaWYgKGxldHRlcilcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGNvbnN0IGtleUNvZGUgPSAobWVudUl0ZW0ubWVudS5hcHBsaWNhdGlvbk1lbnUgPyAnYWx0KycgOiAnJykgKyBsZXR0ZXJcclxuICAgICAgICAgICAgTG9jYWxBY2NlbGVyYXRvci5tZW51S2V5c1tMb2NhbEFjY2VsZXJhdG9yLnByZXBhcmVLZXkoa2V5Q29kZSldID0gKGUpID0+XHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIG1lbnVJdGVtLmhhbmRsZUNsaWNrKGUpXHJcbiAgICAgICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpXHJcbiAgICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KClcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH0sXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZWdpc3RlciBzcGVjaWFsIHNob3J0Y3V0IGtleXMgZm9yIG1lbnVcclxuICAgICAqIEBwYXJhbSB7TWVudUl0ZW19IG1lbnVJdGVtXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICByZWdpc3Rlck1lbnVTcGVjaWFsOiBmdW5jdGlvbihtZW51KVxyXG4gICAge1xyXG4gICAgICAgIExvY2FsQWNjZWxlcmF0b3IubWVudUtleXNbJ2VzY2FwZSddID0gKCkgPT4gbWVudS5jbG9zZUFsbCgpXHJcbiAgICAgICAgTG9jYWxBY2NlbGVyYXRvci5tZW51S2V5c1snZW50ZXInXSA9IChlKSA9PiBtZW51LmVudGVyKGUpXHJcbiAgICAgICAgTG9jYWxBY2NlbGVyYXRvci5tZW51S2V5c1snc3BhY2UnXSA9IChlKSA9PiBtZW51LmVudGVyKGUpXHJcbiAgICAgICAgTG9jYWxBY2NlbGVyYXRvci5tZW51S2V5c1snYXJyb3dyaWdodCddID0gKGUpID0+IG1lbnUubW92ZShlLCAncmlnaHQnKVxyXG4gICAgICAgIExvY2FsQWNjZWxlcmF0b3IubWVudUtleXNbJ2Fycm93bGVmdCddID0gKGUpID0+IG1lbnUubW92ZShlLCAnbGVmdCcpXHJcbiAgICAgICAgTG9jYWxBY2NlbGVyYXRvci5tZW51S2V5c1snYXJyb3d1cCddID0gKGUpID0+IG1lbnUubW92ZShlLCAndXAnKVxyXG4gICAgICAgIExvY2FsQWNjZWxlcmF0b3IubWVudUtleXNbJ2Fycm93ZG93biddID0gKGUpID0+IG1lbnUubW92ZShlLCAnZG93bicpXHJcbiAgICB9LFxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmVtb3ZlcyBtZW51IHNob3J0Y3V0c1xyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqL1xyXG4gICAgdW5yZWdpc3Rlck1lbnVTaG9ydGN1dHM6IGZ1bmN0aW9uKClcclxuICAgIHtcclxuICAgICAgICBMb2NhbEFjY2VsZXJhdG9yLm1lbnVLZXlzID0ge31cclxuICAgIH0sXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBLZXljb2RlcyBkZWZpbml0aW9uLiBJbiB0aGUgZm9ybSBvZiBtb2RpZmllclsrbW9kaWZpZXIuLi5dK2tleVxyXG4gICAgICogPHA+Rm9yIGV4YW1wbGU6IGN0cmwrc2hpZnQrZTwvcD5cclxuICAgICAqIDxwPktleUNvZGVzIGFyZSBjYXNlIGluc2Vuc2l0aXZlIChpLmUuLCBzaGlmdCthIGlzIHRoZSBzYW1lIGFzIFNoaWZ0K0EpLiBBbmQgc3BhY2VzIGFyZSByZW1vdmVkPC9wPlxyXG4gICAgICogPHA+WW91IGNhbiBhc3NpZ24gbW9yZSB0aGFuIG9uZSBrZXkgdG8gdGhlIHNhbWUgc2hvcnRjdXQgYnkgdXNpbmcgYSB8IGJldHdlZW4gdGhlIGtleXMgKGUuZy4sICdzaGlmdCthIHwgY3RybCthJyk8L3A+XHJcbiAgICAgKiA8cHJlPlxyXG4gICAgICogTW9kaWZpZXJzOlxyXG4gICAgICogICAgY3RybCwgYWx0LCBzaGlmdCwgbWV0YSwgKGN0cmwgYWxpYXNlczogY29tbWFuZCwgY29udHJvbCwgY29tbWFuZG9yY29udHJvbClcclxuICAgICAqIDwvcHJlPlxyXG4gICAgICogPHByZT5cclxuICAgICAqIEtleXM6XHJcbiAgICAgKiAgICBlc2NhcGUsIDAtOSwgbWludXMsIGVxdWFsLCBiYWNrc3BhY2UsIHRhYiwgYS16LCBiYWNrZXRsZWZ0LCBicmFja2V0cmlnaHQsIHNlbWljb2xvbiwgcXVvdGUsXHJcbiAgICAgKiAgICBiYWNrcXVvdGUsIGJhY2tzbGFzaCwgY29tbWEsIHBlcmlvZCwgc2xhc2gsIG51bXBhZG11bHRpcGx5LCBzcGFjZSwgY2Fwc2xvY2ssIGYxLWYyNCwgcGF1c2UsXHJcbiAgICAgKiAgICBzY3JvbGxsb2NrLCBwcmludHNjcmVlbiwgaG9tZSwgYXJyb3d1cCwgYXJyb3dsZWZ0LCBhcnJvd3JpZ2h0LCBhcnJvd2Rvd24sIHBhZ2V1cCwgcGFnZWRvd24sXHJcbiAgICAgKiAgICBlbmQsIGluc2VydCwgZGVsZXRlLCBlbnRlciwgc2hpZnRsZWZ0LCBzaGlmdHJpZ2h0LCBjdHJsbGVmdCwgY3RybHJpZ2h0LCBhbHRsZWZ0LCBhbHRyaWdodCwgc2hpZnRsZWZ0LFxyXG4gICAgICogICAgc2hpZnRyaWdodCwgbnVtbG9jaywgbnVtcGFkLi4uXHJcbiAgICAgKiA8L3ByZT5cclxuICAgICAqIEZvciBPUy1zcGVjaWZpYyBjb2RlcyBhbmQgYSBtb3JlIGRldGFpbGVkIGV4cGxhbmF0aW9uIHNlZSB7QGxpbmsgaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvQVBJL0tleWJvYXJkRXZlbnQvY29kZX0uIEFsc28gbm90ZSB0aGF0ICdEaWdpdCcgYW5kICdLZXknIGFyZSByZW1vdmVkIGZyb20gdGhlIGNvZGUgdG8gbWFrZSBpdCBlYXNpZXIgdG8gdHlwZS5cclxuICAgICAqXHJcbiAgICAgKiBAdHlwZWRlZiB7c3RyaW5nfSBMb2NhbEFjY2VsZXJhdG9yfktleUNvZGVzXHJcbiAgICAgKi9cclxuXHJcbiAgICAvKipcclxuICAgICAqIHRyYW5zbGF0ZSBhIHVzZXItcHJvdmlkZWQga2V5Y29kZVxyXG4gICAgICogQHBhcmFtIHtLZXlDb2Rlc30ga2V5Q29kZVxyXG4gICAgICogQHJldHVybiB7S2V5Q29kZXN9IGZvcm1hdHRlZCBhbmQgc29ydGVkIGtleUNvZGVcclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKi9cclxuICAgIHByZXBhcmVLZXk6IGZ1bmN0aW9uKGtleUNvZGUpXHJcbiAgICB7XHJcbiAgICAgICAgY29uc3Qga2V5cyA9IFtdXHJcbiAgICAgICAgbGV0IHNwbGl0XHJcbiAgICAgICAga2V5Q29kZSArPSAnJ1xyXG4gICAgICAgIGlmIChrZXlDb2RlLmxlbmd0aCA+IDEgJiYga2V5Q29kZS5pbmRleE9mKCd8JykgIT09IC0xKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgc3BsaXQgPSBrZXlDb2RlLnNwbGl0KCd8JylcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgc3BsaXQgPSBba2V5Q29kZV1cclxuICAgICAgICB9XHJcbiAgICAgICAgZm9yIChsZXQgY29kZSBvZiBzcGxpdClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGxldCBrZXkgPSAnJ1xyXG4gICAgICAgICAgICBsZXQgbW9kaWZpZXJzID0gW11cclxuICAgICAgICAgICAgY29kZSA9IGNvZGUudG9Mb3dlckNhc2UoKS5yZXBsYWNlKCcgJywgJycpXHJcbiAgICAgICAgICAgIGlmIChjb2RlLmluZGV4T2YoJysnKSAhPT0gLTEpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHNwbGl0ID0gY29kZS5zcGxpdCgnKycpXHJcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHNwbGl0Lmxlbmd0aCAtIDE7IGkrKylcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgbW9kaWZpZXIgPSBzcGxpdFtpXVxyXG4gICAgICAgICAgICAgICAgICAgIG1vZGlmaWVyID0gbW9kaWZpZXIucmVwbGFjZSgnY29tbWFuZG9yY29udHJvbCcsICdjdHJsJylcclxuICAgICAgICAgICAgICAgICAgICBtb2RpZmllciA9IG1vZGlmaWVyLnJlcGxhY2UoJ2NvbW1hbmQnLCAnY3RybCcpXHJcbiAgICAgICAgICAgICAgICAgICAgbW9kaWZpZXIgPSBtb2RpZmllci5yZXBsYWNlKCdjb250cm9sJywgJ2N0cmwnKVxyXG4gICAgICAgICAgICAgICAgICAgIG1vZGlmaWVycy5wdXNoKG1vZGlmaWVyKVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgbW9kaWZpZXJzID0gbW9kaWZpZXJzLnNvcnQoKGEsIGIpID0+IHsgcmV0dXJuIGFbMF0gPiBiWzBdID8gMSA6IGFbMF0gPCBiWzBdID8gLTEgOiAwIH0pXHJcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBwYXJ0IG9mIG1vZGlmaWVycylcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBrZXkgKz0gcGFydCArICcrJ1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAga2V5ICs9IHNwbGl0W3NwbGl0Lmxlbmd0aCAtIDFdXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBrZXkgPSBjb2RlXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAga2V5cy5wdXNoKGtleSlcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGtleXNcclxuICAgIH0sXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBNYWtlIHRoZSBLZXlDb2RlIHByZXR0eSBmb3IgcHJpbnRpbmcgb24gdGhlIG1lbnVcclxuICAgICAqIEBwYXJhbSB7S2V5Q29kZX0ga2V5Q29kZVxyXG4gICAgICogQHJldHVybiB7c3RyaW5nfVxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqL1xyXG4gICAgcHJldHRpZnlLZXk6IGZ1bmN0aW9uKGtleUNvZGUpXHJcbiAgICB7XHJcbiAgICAgICAgbGV0IGtleSA9ICcnXHJcbiAgICAgICAgY29uc3QgY29kZXMgPSBMb2NhbEFjY2VsZXJhdG9yLnByZXBhcmVLZXkoa2V5Q29kZSlcclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGNvZGVzLmxlbmd0aDsgaSsrKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgY29uc3Qga2V5Q29kZSA9IGNvZGVzW2ldXHJcbiAgICAgICAgICAgIGlmIChrZXlDb2RlLmluZGV4T2YoJysnKSAhPT0gLTEpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHNwbGl0ID0ga2V5Q29kZS50b0xvd2VyQ2FzZSgpLnNwbGl0KCcrJylcclxuICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgc3BsaXQubGVuZ3RoIC0gMTsgaSsrKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBtb2RpZmllciA9IHNwbGl0W2ldXHJcbiAgICAgICAgICAgICAgICAgICAga2V5ICs9IG1vZGlmaWVyWzBdLnRvVXBwZXJDYXNlKCkgKyBtb2RpZmllci5zdWJzdHIoMSkgKyAnKydcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGtleSArPSBzcGxpdFtzcGxpdC5sZW5ndGggLSAxXS50b1VwcGVyQ2FzZSgpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBrZXkgPSBrZXlDb2RlLnRvVXBwZXJDYXNlKClcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoaSAhPT0gY29kZXMubGVuZ3RoIC0gMSlcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAga2V5ICs9ICcgb3IgJ1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBrZXlcclxuICAgIH0sXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiByZWdpc3RlciBhIGtleSBhcyBhIGdsb2JhbCBhY2NlbGVyYXRvclxyXG4gICAgICogQHBhcmFtIHtLZXlDb2Rlc30ga2V5Q29kZSAoZS5nLiwgQ3RybCtzaGlmdCtFKVxyXG4gICAgICogQHBhcmFtIHtmdW5jdGlvbn0gY2FsbGJhY2tcclxuICAgICAqL1xyXG4gICAgcmVnaXN0ZXI6IGZ1bmN0aW9uKGtleUNvZGUsIGNhbGxiYWNrKVxyXG4gICAge1xyXG4gICAgICAgIGNvbnN0IGtleXMgPSBMb2NhbEFjY2VsZXJhdG9yLnByZXBhcmVLZXkoa2V5Q29kZSlcclxuICAgICAgICBmb3IgKGxldCBrZXkgb2Yga2V5cylcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIExvY2FsQWNjZWxlcmF0b3Iua2V5c1trZXldID0gKGUpID0+XHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGNhbGxiYWNrKGUpXHJcbiAgICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KClcclxuICAgICAgICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKClcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH0sXHJcblxyXG4gICAga2V5RG93bjogZnVuY3Rpb24oYWNjZWxlcmF0b3IsIGUpXHJcbiAgICB7XHJcbiAgICAgICAgY29uc3QgbW9kaWZpZXJzID0gW11cclxuICAgICAgICBpZiAoZS5hbHRLZXkpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBtb2RpZmllcnMucHVzaCgnYWx0JylcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGUuY3RybEtleSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIG1vZGlmaWVycy5wdXNoKCdjdHJsJylcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGUubWV0YUtleSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIG1vZGlmaWVycy5wdXNoKCdtZXRhJylcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGUuc2hpZnRLZXkpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBtb2RpZmllcnMucHVzaCgnc2hpZnQnKVxyXG4gICAgICAgIH1cclxuICAgICAgICBsZXQga2V5Q29kZSA9ICcnXHJcbiAgICAgICAgZm9yIChsZXQgbW9kaWZpZXIgb2YgbW9kaWZpZXJzKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAga2V5Q29kZSArPSBtb2RpZmllciArICcrJ1xyXG4gICAgICAgIH1cclxuICAgICAgICBsZXQgdHJhbnNsYXRlID0gZS5jb2RlLnRvTG93ZXJDYXNlKClcclxuICAgICAgICB0cmFuc2xhdGUgPSB0cmFuc2xhdGUucmVwbGFjZSgnZGlnaXQnLCAnJylcclxuICAgICAgICB0cmFuc2xhdGUgPSB0cmFuc2xhdGUucmVwbGFjZSgna2V5JywgJycpXHJcbiAgICAgICAga2V5Q29kZSArPSB0cmFuc2xhdGVcclxuICAgICAgICBpZiAoTG9jYWxBY2NlbGVyYXRvci5tZW51S2V5c1trZXlDb2RlXSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIExvY2FsQWNjZWxlcmF0b3IubWVudUtleXNba2V5Q29kZV0oZSwgTG9jYWxBY2NlbGVyYXRvcilcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAoTG9jYWxBY2NlbGVyYXRvci5rZXlzW2tleUNvZGVdKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgTG9jYWxBY2NlbGVyYXRvci5rZXlzW2tleUNvZGVdKGUsIExvY2FsQWNjZWxlcmF0b3IpXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IExvY2FsQWNjZWxlcmF0b3IiXX0=