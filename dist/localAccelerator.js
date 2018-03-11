/**
 * Handles all keyboard input for the menu and user-registered keys
 */
const localAccelerator = {

    init: function () {
        if (!localAccelerator.menuKeys) {
            localAccelerator.menuKeys = {};
            localAccelerator.keys = {};
            document.body.addEventListener('keydown', e => localAccelerator.keyDown(this, e));
        }
    },

    /**
     * clear all user-registered keys
     */
    clearKeys: function () {
        localAccelerator.keys = {};
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
            localAccelerator.menuKeys[localAccelerator.prepareKey(keyCode)] = e => {
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
        localAccelerator.menuKeys['escape'] = () => menu.closeAll();
        localAccelerator.menuKeys['enter'] = e => menu.enter(e);
        localAccelerator.menuKeys['space'] = e => menu.enter(e);
        localAccelerator.menuKeys['arrowright'] = e => menu.move(e, 'right');
        localAccelerator.menuKeys['arrowleft'] = e => menu.move(e, 'left');
        localAccelerator.menuKeys['arrowup'] = e => menu.move(e, 'up');
        localAccelerator.menuKeys['arrowdown'] = e => menu.move(e, 'down');
    },

    /**
     * Removes menu shortcuts
     * @private
     */
    unregisterMenuShortcuts: function () {
        localAccelerator.menuKeys = {};
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
     * @typedef {string} localAccelerator~KeyCodes
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
        const codes = localAccelerator.prepareKey(keyCode);
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
        const keys = localAccelerator.prepareKey(keyCode);
        for (let key of keys) {
            localAccelerator.keys[key] = e => {
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
        if (localAccelerator.menuKeys[keyCode]) {
            localAccelerator.menuKeys[keyCode](e, this);
        } else if (localAccelerator.keys[keyCode]) {
            localAccelerator.keys[keyCode](e, this);
        }
    }
};

module.exports = localAccelerator;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9sb2NhbEFjY2VsZXJhdG9yLmpzIl0sIm5hbWVzIjpbImxvY2FsQWNjZWxlcmF0b3IiLCJpbml0IiwibWVudUtleXMiLCJrZXlzIiwiZG9jdW1lbnQiLCJib2R5IiwiYWRkRXZlbnRMaXN0ZW5lciIsImUiLCJrZXlEb3duIiwiY2xlYXJLZXlzIiwicmVnaXN0ZXJNZW51U2hvcnRjdXQiLCJsZXR0ZXIiLCJtZW51SXRlbSIsImtleUNvZGUiLCJtZW51IiwiYXBwbGljYXRpb25NZW51IiwicHJlcGFyZUtleSIsImhhbmRsZUNsaWNrIiwic3RvcFByb3BhZ2F0aW9uIiwicHJldmVudERlZmF1bHQiLCJyZWdpc3Rlck1lbnVTcGVjaWFsIiwiY2xvc2VBbGwiLCJlbnRlciIsIm1vdmUiLCJ1bnJlZ2lzdGVyTWVudVNob3J0Y3V0cyIsInNwbGl0IiwiaW5kZXhPZiIsImNvZGUiLCJrZXkiLCJtb2RpZmllcnMiLCJ0b0xvd2VyQ2FzZSIsInJlcGxhY2UiLCJpIiwibGVuZ3RoIiwibW9kaWZpZXIiLCJwdXNoIiwic29ydCIsImEiLCJiIiwicGFydCIsInByZXR0aWZ5S2V5IiwiY29kZXMiLCJ0b1VwcGVyQ2FzZSIsInN1YnN0ciIsInJlZ2lzdGVyIiwiY2FsbGJhY2siLCJhY2NlbGVyYXRvciIsImFsdEtleSIsImN0cmxLZXkiLCJtZXRhS2V5Iiwic2hpZnRLZXkiLCJ0cmFuc2xhdGUiLCJtb2R1bGUiLCJleHBvcnRzIl0sIm1hcHBpbmdzIjoiQUFBQTs7O0FBR0EsTUFBTUEsbUJBQW1COztBQUVyQkMsVUFBTSxZQUNOO0FBQ0ksWUFBSSxDQUFDRCxpQkFBaUJFLFFBQXRCLEVBQ0E7QUFDSUYsNkJBQWlCRSxRQUFqQixHQUE0QixFQUE1QjtBQUNBRiw2QkFBaUJHLElBQWpCLEdBQXdCLEVBQXhCO0FBQ0FDLHFCQUFTQyxJQUFULENBQWNDLGdCQUFkLENBQStCLFNBQS9CLEVBQTJDQyxDQUFELElBQU9QLGlCQUFpQlEsT0FBakIsQ0FBeUIsSUFBekIsRUFB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T0FBTixFQUNBO0FBQ0lwQixzQkFBVU0sSUFBVixDQUFlLE1BQWY7QUFDSDtBQUNELFlBQUk1QixFQUFFMkMsUUFBTixFQUNBO0FBQ0lyQixzQkFBVU0sSUFBVixDQUFlLE9BQWY7QUFDSDtBQUNELFlBQUl0QixVQUFVLEVBQWQ7QUFDQSxhQUFLLElBQUlxQixRQUFULElBQXFCTCxTQUFyQixFQUNBO0FBQ0loQixzQkFBVXFCLFdBQVcsR0FBckI7QUFDSDtBQUNELFlBQUlpQixZQUFZNUMsRUFBRW9CLElBQUYsQ0FBT0csV0FBUCxFQUFoQjtBQUNBcUIsb0JBQVlBLFVBQVVwQixPQUFWLENBQWtCLE9BQWxCLEVBQTJCLEVBQTNCLENBQVo7QUFDQW9CLG9CQUFZQSxVQUFVcEIsT0FBVixDQUFrQixLQUFsQixFQUF5QixFQUF6QixDQUFaO0FBQ0FsQixtQkFBV3NDLFNBQVg7QUFDQSxZQUFJbkQsaUJBQWlCRSxRQUFqQixDQUEwQlcsT0FBMUIsQ0FBSixFQUNBO0FBQ0liLDZCQUFpQkUsUUFBakIsQ0FBMEJXLE9BQTFCLEVBQW1DTixDQUFuQyxFQUFzQyxJQUF0QztBQUNILFNBSEQsTUFJSyxJQUFJUCxpQkFBaUJHLElBQWpCLENBQXNCVSxPQUF0QixDQUFKLEVBQ0w7QUFDSWIsNkJBQWlCRyxJQUFqQixDQUFzQlUsT0FBdEIsRUFBK0JOLENBQS9CLEVBQWtDLElBQWxDO0FBQ0g7QUFDSjtBQXBPb0IsQ0FBekI7O0FBdU9BNkMsT0FBT0MsT0FBUCxHQUFpQnJELGdCQUFqQiIsImZpbGUiOiJsb2NhbEFjY2VsZXJhdG9yLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXHJcbiAqIEhhbmRsZXMgYWxsIGtleWJvYXJkIGlucHV0IGZvciB0aGUgbWVudSBhbmQgdXNlci1yZWdpc3RlcmVkIGtleXNcclxuICovXHJcbmNvbnN0IGxvY2FsQWNjZWxlcmF0b3IgPSB7XHJcblxyXG4gICAgaW5pdDogZnVuY3Rpb24oKVxyXG4gICAge1xyXG4gICAgICAgIGlmICghbG9jYWxBY2NlbGVyYXRvci5tZW51S2V5cylcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGxvY2FsQWNjZWxlcmF0b3IubWVudUtleXMgPSB7fVxyXG4gICAgICAgICAgICBsb2NhbEFjY2VsZXJhdG9yLmtleXMgPSB7fVxyXG4gICAgICAgICAgICBkb2N1bWVudC5ib2R5LmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCAoZSkgPT4gbG9jYWxBY2NlbGVyYXRvci5rZXlEb3duKHRoaXMsIGUpKVxyXG4gICAgICAgIH1cclxuICAgIH0sXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBjbGVhciBhbGwgdXNlci1yZWdpc3RlcmVkIGtleXNcclxuICAgICAqL1xyXG4gICAgY2xlYXJLZXlzOiBmdW5jdGlvbigpXHJcbiAgICB7XHJcbiAgICAgICAgbG9jYWxBY2NlbGVyYXRvci5rZXlzID0ge31cclxuICAgIH0sXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZWdpc3RlciBhIHNob3J0Y3V0IGtleSBmb3IgdXNlIGJ5IGFuIG9wZW4gbWVudVxyXG4gICAgICogQHBhcmFtIHtLZXlDb2Rlc30gbGV0dGVyXHJcbiAgICAgKiBAcGFyYW0ge01lbnVJdGVtfSBtZW51SXRlbVxyXG4gICAgICogQHBhcmFtIHtib29sZWFufSBhcHBsaWNhdGlvbk1lbnVcclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKi9cclxuICAgIHJlZ2lzdGVyTWVudVNob3J0Y3V0OiBmdW5jdGlvbihsZXR0ZXIsIG1lbnVJdGVtKVxyXG4gICAge1xyXG4gICAgICAgIGlmIChsZXR0ZXIpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBjb25zdCBrZXlDb2RlID0gKG1lbnVJdGVtLm1lbnUuYXBwbGljYXRpb25NZW51ID8gJ2FsdCsnIDogJycpICsgbGV0dGVyXHJcbiAgICAgICAgICAgIGxvY2FsQWNjZWxlcmF0b3IubWVudUtleXNbbG9jYWxBY2NlbGVyYXRvci5wcmVwYXJlS2V5KGtleUNvZGUpXSA9IChlKSA9PlxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBtZW51SXRlbS5oYW5kbGVDbGljayhlKVxyXG4gICAgICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKVxyXG4gICAgICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9LFxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmVnaXN0ZXIgc3BlY2lhbCBzaG9ydGN1dCBrZXlzIGZvciBtZW51XHJcbiAgICAgKiBAcGFyYW0ge01lbnVJdGVtfSBtZW51SXRlbVxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqL1xyXG4gICAgcmVnaXN0ZXJNZW51U3BlY2lhbDogZnVuY3Rpb24obWVudSlcclxuICAgIHtcclxuICAgICAgICBsb2NhbEFjY2VsZXJhdG9yLm1lbnVLZXlzWydlc2NhcGUnXSA9ICgpID0+IG1lbnUuY2xvc2VBbGwoKVxyXG4gICAgICAgIGxvY2FsQWNjZWxlcmF0b3IubWVudUtleXNbJ2VudGVyJ10gPSAoZSkgPT4gbWVudS5lbnRlcihlKVxyXG4gICAgICAgIGxvY2FsQWNjZWxlcmF0b3IubWVudUtleXNbJ3NwYWNlJ10gPSAoZSkgPT4gbWVudS5lbnRlcihlKVxyXG4gICAgICAgIGxvY2FsQWNjZWxlcmF0b3IubWVudUtleXNbJ2Fycm93cmlnaHQnXSA9IChlKSA9PiBtZW51Lm1vdmUoZSwgJ3JpZ2h0JylcclxuICAgICAgICBsb2NhbEFjY2VsZXJhdG9yLm1lbnVLZXlzWydhcnJvd2xlZnQnXSA9IChlKSA9PiBtZW51Lm1vdmUoZSwgJ2xlZnQnKVxyXG4gICAgICAgIGxvY2FsQWNjZWxlcmF0b3IubWVudUtleXNbJ2Fycm93dXAnXSA9IChlKSA9PiBtZW51Lm1vdmUoZSwgJ3VwJylcclxuICAgICAgICBsb2NhbEFjY2VsZXJhdG9yLm1lbnVLZXlzWydhcnJvd2Rvd24nXSA9IChlKSA9PiBtZW51Lm1vdmUoZSwgJ2Rvd24nKVxyXG4gICAgfSxcclxuXHJcbiAgICAvKipcclxuICAgICAqIFJlbW92ZXMgbWVudSBzaG9ydGN1dHNcclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKi9cclxuICAgIHVucmVnaXN0ZXJNZW51U2hvcnRjdXRzOiBmdW5jdGlvbigpXHJcbiAgICB7XHJcbiAgICAgICAgbG9jYWxBY2NlbGVyYXRvci5tZW51S2V5cyA9IHt9XHJcbiAgICB9LFxyXG5cclxuICAgIC8qKlxyXG4gICAgICogS2V5Y29kZXMgZGVmaW5pdGlvbi4gSW4gdGhlIGZvcm0gb2YgbW9kaWZpZXJbK21vZGlmaWVyLi4uXStrZXlcclxuICAgICAqIDxwPkZvciBleGFtcGxlOiBjdHJsK3NoaWZ0K2U8L3A+XHJcbiAgICAgKiA8cD5LZXlDb2RlcyBhcmUgY2FzZSBpbnNlbnNpdGl2ZSAoaS5lLiwgc2hpZnQrYSBpcyB0aGUgc2FtZSBhcyBTaGlmdCtBKS4gQW5kIHNwYWNlcyBhcmUgcmVtb3ZlZDwvcD5cclxuICAgICAqIDxwPllvdSBjYW4gYXNzaWduIG1vcmUgdGhhbiBvbmUga2V5IHRvIHRoZSBzYW1lIHNob3J0Y3V0IGJ5IHVzaW5nIGEgfCBiZXR3ZWVuIHRoZSBrZXlzIChlLmcuLCAnc2hpZnQrYSB8IGN0cmwrYScpPC9wPlxyXG4gICAgICogPHByZT5cclxuICAgICAqIE1vZGlmaWVyczpcclxuICAgICAqICAgIGN0cmwsIGFsdCwgc2hpZnQsIG1ldGEsIChjdHJsIGFsaWFzZXM6IGNvbW1hbmQsIGNvbnRyb2wsIGNvbW1hbmRvcmNvbnRyb2wpXHJcbiAgICAgKiA8L3ByZT5cclxuICAgICAqIDxwcmU+XHJcbiAgICAgKiBLZXlzOlxyXG4gICAgICogICAgZXNjYXBlLCAwLTksIG1pbnVzLCBlcXVhbCwgYmFja3NwYWNlLCB0YWIsIGEteiwgYmFja2V0bGVmdCwgYnJhY2tldHJpZ2h0LCBzZW1pY29sb24sIHF1b3RlLFxyXG4gICAgICogICAgYmFja3F1b3RlLCBiYWNrc2xhc2gsIGNvbW1hLCBwZXJpb2QsIHNsYXNoLCBudW1wYWRtdWx0aXBseSwgc3BhY2UsIGNhcHNsb2NrLCBmMS1mMjQsIHBhdXNlLFxyXG4gICAgICogICAgc2Nyb2xsbG9jaywgcHJpbnRzY3JlZW4sIGhvbWUsIGFycm93dXAsIGFycm93bGVmdCwgYXJyb3dyaWdodCwgYXJyb3dkb3duLCBwYWdldXAsIHBhZ2Vkb3duLFxyXG4gICAgICogICAgZW5kLCBpbnNlcnQsIGRlbGV0ZSwgZW50ZXIsIHNoaWZ0bGVmdCwgc2hpZnRyaWdodCwgY3RybGxlZnQsIGN0cmxyaWdodCwgYWx0bGVmdCwgYWx0cmlnaHQsIHNoaWZ0bGVmdCxcclxuICAgICAqICAgIHNoaWZ0cmlnaHQsIG51bWxvY2ssIG51bXBhZC4uLlxyXG4gICAgICogPC9wcmU+XHJcbiAgICAgKiBGb3IgT1Mtc3BlY2lmaWMgY29kZXMgYW5kIGEgbW9yZSBkZXRhaWxlZCBleHBsYW5hdGlvbiBzZWUge0BsaW5rIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0FQSS9LZXlib2FyZEV2ZW50L2NvZGV9LiBBbHNvIG5vdGUgdGhhdCAnRGlnaXQnIGFuZCAnS2V5JyBhcmUgcmVtb3ZlZCBmcm9tIHRoZSBjb2RlIHRvIG1ha2UgaXQgZWFzaWVyIHRvIHR5cGUuXHJcbiAgICAgKlxyXG4gICAgICogQHR5cGVkZWYge3N0cmluZ30gbG9jYWxBY2NlbGVyYXRvcn5LZXlDb2Rlc1xyXG4gICAgICovXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiB0cmFuc2xhdGUgYSB1c2VyLXByb3ZpZGVkIGtleWNvZGVcclxuICAgICAqIEBwYXJhbSB7S2V5Q29kZXN9IGtleUNvZGVcclxuICAgICAqIEByZXR1cm4ge0tleUNvZGVzfSBmb3JtYXR0ZWQgYW5kIHNvcnRlZCBrZXlDb2RlXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICBwcmVwYXJlS2V5OiBmdW5jdGlvbihrZXlDb2RlKVxyXG4gICAge1xyXG4gICAgICAgIGNvbnN0IGtleXMgPSBbXVxyXG4gICAgICAgIGxldCBzcGxpdFxyXG4gICAgICAgIGlmIChrZXlDb2RlLmluZGV4T2YoJ3wnKSAhPT0gLTEpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBzcGxpdCA9IGtleUNvZGUuc3BsaXQoJ3wnKVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBzcGxpdCA9IFtrZXlDb2RlXVxyXG4gICAgICAgIH1cclxuICAgICAgICBmb3IgKGxldCBjb2RlIG9mIHNwbGl0KVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgbGV0IGtleSA9ICcnXHJcbiAgICAgICAgICAgIGxldCBtb2RpZmllcnMgPSBbXVxyXG4gICAgICAgICAgICBjb2RlID0gY29kZS50b0xvd2VyQ2FzZSgpLnJlcGxhY2UoJyAnLCAnJylcclxuICAgICAgICAgICAgaWYgKGNvZGUuaW5kZXhPZignKycpICE9PSAtMSlcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgY29uc3Qgc3BsaXQgPSBjb2RlLnNwbGl0KCcrJylcclxuICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgc3BsaXQubGVuZ3RoIC0gMTsgaSsrKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBtb2RpZmllciA9IHNwbGl0W2ldXHJcbiAgICAgICAgICAgICAgICAgICAgbW9kaWZpZXIgPSBtb2RpZmllci5yZXBsYWNlKCdjb21tYW5kb3Jjb250cm9sJywgJ2N0cmwnKVxyXG4gICAgICAgICAgICAgICAgICAgIG1vZGlmaWVyID0gbW9kaWZpZXIucmVwbGFjZSgnY29tbWFuZCcsICdjdHJsJylcclxuICAgICAgICAgICAgICAgICAgICBtb2RpZmllciA9IG1vZGlmaWVyLnJlcGxhY2UoJ2NvbnRyb2wnLCAnY3RybCcpXHJcbiAgICAgICAgICAgICAgICAgICAgbW9kaWZpZXJzLnB1c2gobW9kaWZpZXIpXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBtb2RpZmllcnMgPSBtb2RpZmllcnMuc29ydCgoYSwgYikgPT4geyByZXR1cm4gYVswXSA+IGJbMF0gPyAxIDogYVswXSA8IGJbMF0gPyAtMSA6IDAgfSlcclxuICAgICAgICAgICAgICAgIGZvciAobGV0IHBhcnQgb2YgbW9kaWZpZXJzKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGtleSArPSBwYXJ0ICsgJysnXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBrZXkgKz0gc3BsaXRbc3BsaXQubGVuZ3RoIC0gMV1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGtleSA9IGNvZGVcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBrZXlzLnB1c2goa2V5KVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4ga2V5c1xyXG4gICAgfSxcclxuXHJcbiAgICAvKipcclxuICAgICAqIE1ha2UgdGhlIEtleUNvZGUgcHJldHR5IGZvciBwcmludGluZyBvbiB0aGUgbWVudVxyXG4gICAgICogQHBhcmFtIHtLZXlDb2RlfSBrZXlDb2RlXHJcbiAgICAgKiBAcmV0dXJuIHtzdHJpbmd9XHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICBwcmV0dGlmeUtleTogZnVuY3Rpb24oa2V5Q29kZSlcclxuICAgIHtcclxuICAgICAgICBsZXQga2V5ID0gJydcclxuICAgICAgICBjb25zdCBjb2RlcyA9IGxvY2FsQWNjZWxlcmF0b3IucHJlcGFyZUtleShrZXlDb2RlKVxyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY29kZXMubGVuZ3RoOyBpKyspXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBjb25zdCBrZXlDb2RlID0gY29kZXNbaV1cclxuICAgICAgICAgICAgaWYgKGtleUNvZGUuaW5kZXhPZignKycpICE9PSAtMSlcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgY29uc3Qgc3BsaXQgPSBrZXlDb2RlLnRvTG93ZXJDYXNlKCkuc3BsaXQoJysnKVxyXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBzcGxpdC5sZW5ndGggLSAxOyBpKyspXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IG1vZGlmaWVyID0gc3BsaXRbaV1cclxuICAgICAgICAgICAgICAgICAgICBrZXkgKz0gbW9kaWZpZXJbMF0udG9VcHBlckNhc2UoKSArIG1vZGlmaWVyLnN1YnN0cigxKSArICcrJ1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAga2V5ICs9IHNwbGl0W3NwbGl0Lmxlbmd0aCAtIDFdLnRvVXBwZXJDYXNlKClcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGtleSA9IGtleUNvZGUudG9VcHBlckNhc2UoKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChpICE9PSBjb2Rlcy5sZW5ndGggLSAxKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBrZXkgKz0gJyBvciAnXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGtleVxyXG4gICAgfSxcclxuXHJcbiAgICAvKipcclxuICAgICAqIHJlZ2lzdGVyIGEga2V5IGFzIGEgZ2xvYmFsIGFjY2VsZXJhdG9yXHJcbiAgICAgKiBAcGFyYW0ge0tleUNvZGVzfSBrZXlDb2RlIChlLmcuLCBDdHJsK3NoaWZ0K0UpXHJcbiAgICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSBjYWxsYmFja1xyXG4gICAgICovXHJcbiAgICByZWdpc3RlcjogZnVuY3Rpb24oa2V5Q29kZSwgY2FsbGJhY2spXHJcbiAgICB7XHJcbiAgICAgICAgY29uc3Qga2V5cyA9IGxvY2FsQWNjZWxlcmF0b3IucHJlcGFyZUtleShrZXlDb2RlKVxyXG4gICAgICAgIGZvciAobGV0IGtleSBvZiBrZXlzKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgbG9jYWxBY2NlbGVyYXRvci5rZXlzW2tleV0gPSAoZSkgPT5cclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgY2FsbGJhY2soZSlcclxuICAgICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKVxyXG4gICAgICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuXHJcbiAgICBrZXlEb3duOiBmdW5jdGlvbihhY2NlbGVyYXRvciwgZSlcclxuICAgIHtcclxuICAgICAgICBjb25zdCBtb2RpZmllcnMgPSBbXVxyXG4gICAgICAgIGlmIChlLmFsdEtleSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIG1vZGlmaWVycy5wdXNoKCdhbHQnKVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoZS5jdHJsS2V5KVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgbW9kaWZpZXJzLnB1c2goJ2N0cmwnKVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoZS5tZXRhS2V5KVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgbW9kaWZpZXJzLnB1c2goJ21ldGEnKVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoZS5zaGlmdEtleSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIG1vZGlmaWVycy5wdXNoKCdzaGlmdCcpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGxldCBrZXlDb2RlID0gJydcclxuICAgICAgICBmb3IgKGxldCBtb2RpZmllciBvZiBtb2RpZmllcnMpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBrZXlDb2RlID0gbW9kaWZpZXIgKyAnKydcclxuICAgICAgICB9XHJcbiAgICAgICAgbGV0IHRyYW5zbGF0ZSA9IGUuY29kZS50b0xvd2VyQ2FzZSgpXHJcbiAgICAgICAgdHJhbnNsYXRlID0gdHJhbnNsYXRlLnJlcGxhY2UoJ2RpZ2l0JywgJycpXHJcbiAgICAgICAgdHJhbnNsYXRlID0gdHJhbnNsYXRlLnJlcGxhY2UoJ2tleScsICcnKVxyXG4gICAgICAgIGtleUNvZGUgKz0gdHJhbnNsYXRlXHJcbiAgICAgICAgaWYgKGxvY2FsQWNjZWxlcmF0b3IubWVudUtleXNba2V5Q29kZV0pXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBsb2NhbEFjY2VsZXJhdG9yLm1lbnVLZXlzW2tleUNvZGVdKGUsIHRoaXMpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKGxvY2FsQWNjZWxlcmF0b3Iua2V5c1trZXlDb2RlXSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGxvY2FsQWNjZWxlcmF0b3Iua2V5c1trZXlDb2RlXShlLCB0aGlzKVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBsb2NhbEFjY2VsZXJhdG9yIl19