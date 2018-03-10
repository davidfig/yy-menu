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
                const split = code.toLowerCase().split('+');
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
                key = keyCode;
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9nbG9iYWxBY2NlbGVyYXRvci5qcyJdLCJuYW1lcyI6WyJHbG9iYWxBY2NlbGVyYXRvciIsImluaXQiLCJtZW51S2V5cyIsImtleXMiLCJkb2N1bWVudCIsImJvZHkiLCJhZGRFdmVudExpc3RlbmVyIiwiZSIsImtleURvd24iLCJjbGVhcktleXMiLCJyZWdpc3Rlck1lbnVTaG9ydGN1dCIsImxldHRlciIsIm1lbnVJdGVtIiwia2V5Q29kZSIsIm1lbnUiLCJhcHBsaWNhdGlvbk1lbnUiLCJwcmVwYXJlS2V5IiwiaGFuZGxlQ2xpY2siLCJzdG9wUHJvcGFnYXRpb24iLCJwcmV2ZW50RGVmYXVsdCIsInJlZ2lzdGVyTWVudVNwZWNpYWwiLCJjbG9zZUFsbCIsImVudGVyIiwibW92ZSIsInVucmVnaXN0ZXJNZW51U2hvcnRjdXRzIiwic3BsaXQiLCJpbmRleE9mIiwiY29kZSIsImtleSIsIm1vZGlmaWVycyIsInRvTG93ZXJDYXNlIiwicmVwbGFjZSIsImkiLCJsZW5ndGgiLCJtb2RpZmllciIsInB1c2giLCJzb3J0IiwiYSIsImIiLCJwYXJ0IiwicHJldHRpZnlLZXkiLCJjb2RlcyIsInRvVXBwZXJDYXNlIiwic3Vic3RyIiwicmVnaXN0ZXIiLCJjYWxsYmFjayIsImFjY2VsZXJhdG9yIiwiYWx0S2V5IiwiY3RybEtleSIsIm1ldGFLZXkiLCJzaGlmdEtleSIsInRyYW5zbGF0ZSIsIm1vZHVsZSIsImV4cG9ydHMiXSwibWFwcGluZ3MiOiJBQUFBOzs7QUFHQSxNQUFNQSxvQkFBb0I7O0FBRXRCQyxVQUFNLFlBQ047QUFDSSxZQUFJLENBQUNELGtCQUFrQkUsUUFBdkIsRUFDQTtBQUNJRiw4QkFBa0JFLFFBQWxCLEdBQTZCLEVBQTdCO0FBQ0FGLDhCQUFrQkcsSUFBbEIsR0FBeUIsRUFBekI7QUFDQUMscUJBQVNDLElBQVQsQ0FBY0MsZ0JBQWQsQ0FBK0IsU0FBL0IsRUFBMkNDLENBQUQsSUFBT1Asa0JBQWtCUSxPQUFsQixDQUEwQixJQUExQixF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RCxZQUFJNUIsRUFBRTBDLE9BQU4sRUFDQTtBQUNJcEIsc0JBQVVNLElBQVYsQ0FBZSxNQUFmO0FBQ0g7QUFDRCxZQUFJNUIsRUFBRTJDLFFBQU4sRUFDQTtBQUNJckIsc0JBQVVNLElBQVYsQ0FBZSxPQUFmO0FBQ0g7QUFDRCxZQUFJdEIsVUFBVSxFQUFkO0FBQ0EsYUFBSyxJQUFJcUIsUUFBVCxJQUFxQkwsU0FBckIsRUFDQTtBQUNJaEIsc0JBQVVxQixXQUFXLEdBQXJCO0FBQ0g7QUFDRCxZQUFJaUIsWUFBWTVDLEVBQUVvQixJQUFGLENBQU9HLFdBQVAsRUFBaEI7QUFDQXFCLG9CQUFZQSxVQUFVcEIsT0FBVixDQUFrQixPQUFsQixFQUEyQixFQUEzQixDQUFaO0FBQ0FvQixvQkFBWUEsVUFBVXBCLE9BQVYsQ0FBa0IsS0FBbEIsRUFBeUIsRUFBekIsQ0FBWjtBQUNBbEIsbUJBQVdzQyxTQUFYO0FBQ0EsWUFBSW5ELGtCQUFrQkUsUUFBbEIsQ0FBMkJXLE9BQTNCLENBQUosRUFDQTtBQUNJYiw4QkFBa0JFLFFBQWxCLENBQTJCVyxPQUEzQixFQUFvQ04sQ0FBcEMsRUFBdUMsSUFBdkM7QUFDSCxTQUhELE1BSUssSUFBSVAsa0JBQWtCRyxJQUFsQixDQUF1QlUsT0FBdkIsQ0FBSixFQUNMO0FBQ0liLDhCQUFrQkcsSUFBbEIsQ0FBdUJVLE9BQXZCLEVBQWdDTixDQUFoQyxFQUFtQyxJQUFuQztBQUNIO0FBQ0o7QUFwT3FCLENBQTFCOztBQXVPQTZDLE9BQU9DLE9BQVAsR0FBaUJyRCxpQkFBakIiLCJmaWxlIjoiZ2xvYmFsQWNjZWxlcmF0b3IuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcclxuICogSGFuZGxlcyBhbGwga2V5Ym9hcmQgaW5wdXQgZm9yIHRoZSBtZW51IGFuZCB1c2VyLXJlZ2lzdGVyZWQga2V5c1xyXG4gKi9cclxuY29uc3QgR2xvYmFsQWNjZWxlcmF0b3IgPSB7XHJcblxyXG4gICAgaW5pdDogZnVuY3Rpb24oKVxyXG4gICAge1xyXG4gICAgICAgIGlmICghR2xvYmFsQWNjZWxlcmF0b3IubWVudUtleXMpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBHbG9iYWxBY2NlbGVyYXRvci5tZW51S2V5cyA9IHt9XHJcbiAgICAgICAgICAgIEdsb2JhbEFjY2VsZXJhdG9yLmtleXMgPSB7fVxyXG4gICAgICAgICAgICBkb2N1bWVudC5ib2R5LmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCAoZSkgPT4gR2xvYmFsQWNjZWxlcmF0b3Iua2V5RG93bih0aGlzLCBlKSlcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG5cclxuICAgIC8qKlxyXG4gICAgICogY2xlYXIgYWxsIHVzZXItcmVnaXN0ZXJlZCBrZXlzXHJcbiAgICAgKi9cclxuICAgIGNsZWFyS2V5czogZnVuY3Rpb24oKVxyXG4gICAge1xyXG4gICAgICAgIEdsb2JhbEFjY2VsZXJhdG9yLmtleXMgPSB7fVxyXG4gICAgfSxcclxuXHJcbiAgICAvKipcclxuICAgICAqIFJlZ2lzdGVyIGEgc2hvcnRjdXQga2V5IGZvciB1c2UgYnkgYW4gb3BlbiBtZW51XHJcbiAgICAgKiBAcGFyYW0ge0tleUNvZGVzfSBsZXR0ZXJcclxuICAgICAqIEBwYXJhbSB7TWVudUl0ZW19IG1lbnVJdGVtXHJcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IGFwcGxpY2F0aW9uTWVudVxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqL1xyXG4gICAgcmVnaXN0ZXJNZW51U2hvcnRjdXQ6IGZ1bmN0aW9uKGxldHRlciwgbWVudUl0ZW0pXHJcbiAgICB7XHJcbiAgICAgICAgaWYgKGxldHRlcilcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGNvbnN0IGtleUNvZGUgPSAobWVudUl0ZW0ubWVudS5hcHBsaWNhdGlvbk1lbnUgPyAnYWx0KycgOiAnJykgKyBsZXR0ZXJcclxuICAgICAgICAgICAgR2xvYmFsQWNjZWxlcmF0b3IubWVudUtleXNbR2xvYmFsQWNjZWxlcmF0b3IucHJlcGFyZUtleShrZXlDb2RlKV0gPSAoZSkgPT5cclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgbWVudUl0ZW0uaGFuZGxlQ2xpY2soZSlcclxuICAgICAgICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKClcclxuICAgICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuXHJcbiAgICAvKipcclxuICAgICAqIFJlZ2lzdGVyIHNwZWNpYWwgc2hvcnRjdXQga2V5cyBmb3IgbWVudVxyXG4gICAgICogQHBhcmFtIHtNZW51SXRlbX0gbWVudUl0ZW1cclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKi9cclxuICAgIHJlZ2lzdGVyTWVudVNwZWNpYWw6IGZ1bmN0aW9uKG1lbnUpXHJcbiAgICB7XHJcbiAgICAgICAgR2xvYmFsQWNjZWxlcmF0b3IubWVudUtleXNbJ2VzY2FwZSddID0gKCkgPT4gbWVudS5jbG9zZUFsbCgpXHJcbiAgICAgICAgR2xvYmFsQWNjZWxlcmF0b3IubWVudUtleXNbJ2VudGVyJ10gPSAoZSkgPT4gbWVudS5lbnRlcihlKVxyXG4gICAgICAgIEdsb2JhbEFjY2VsZXJhdG9yLm1lbnVLZXlzWydzcGFjZSddID0gKGUpID0+IG1lbnUuZW50ZXIoZSlcclxuICAgICAgICBHbG9iYWxBY2NlbGVyYXRvci5tZW51S2V5c1snYXJyb3dyaWdodCddID0gKGUpID0+IG1lbnUubW92ZShlLCAncmlnaHQnKVxyXG4gICAgICAgIEdsb2JhbEFjY2VsZXJhdG9yLm1lbnVLZXlzWydhcnJvd2xlZnQnXSA9IChlKSA9PiBtZW51Lm1vdmUoZSwgJ2xlZnQnKVxyXG4gICAgICAgIEdsb2JhbEFjY2VsZXJhdG9yLm1lbnVLZXlzWydhcnJvd3VwJ10gPSAoZSkgPT4gbWVudS5tb3ZlKGUsICd1cCcpXHJcbiAgICAgICAgR2xvYmFsQWNjZWxlcmF0b3IubWVudUtleXNbJ2Fycm93ZG93biddID0gKGUpID0+IG1lbnUubW92ZShlLCAnZG93bicpXHJcbiAgICB9LFxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmVtb3ZlcyBtZW51IHNob3J0Y3V0c1xyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqL1xyXG4gICAgdW5yZWdpc3Rlck1lbnVTaG9ydGN1dHM6IGZ1bmN0aW9uKClcclxuICAgIHtcclxuICAgICAgICBHbG9iYWxBY2NlbGVyYXRvci5tZW51S2V5cyA9IHt9XHJcbiAgICB9LFxyXG5cclxuICAgIC8qKlxyXG4gICAgICogS2V5Y29kZXMgZGVmaW5pdGlvbi4gSW4gdGhlIGZvcm0gb2YgbW9kaWZpZXJbK21vZGlmaWVyLi4uXStrZXlcclxuICAgICAqIDxwPkZvciBleGFtcGxlOiBjdHJsK3NoaWZ0K2U8L3A+XHJcbiAgICAgKiA8cD5LZXlDb2RlcyBhcmUgY2FzZSBpbnNlbnNpdGl2ZSAoaS5lLiwgc2hpZnQrYSBpcyB0aGUgc2FtZSBhcyBTaGlmdCtBKS4gQW5kIHNwYWNlcyBhcmUgcmVtb3ZlZDwvcD5cclxuICAgICAqIDxwPllvdSBjYW4gYXNzaWduIG1vcmUgdGhhbiBvbmUga2V5IHRvIHRoZSBzYW1lIHNob3J0Y3V0IGJ5IHVzaW5nIGEgfCBiZXR3ZWVuIHRoZSBrZXlzIChlLmcuLCAnc2hpZnQrYSB8IGN0cmwrYScpPC9wPlxyXG4gICAgICogPHByZT5cclxuICAgICAqIE1vZGlmaWVyczpcclxuICAgICAqICAgIGN0cmwsIGFsdCwgc2hpZnQsIG1ldGEsIChjdHJsIGFsaWFzZXM6IGNvbW1hbmQsIGNvbnRyb2wsIGNvbW1hbmRvcmNvbnRyb2wpXHJcbiAgICAgKiA8L3ByZT5cclxuICAgICAqIDxwcmU+XHJcbiAgICAgKiBLZXlzOlxyXG4gICAgICogICAgZXNjYXBlLCAwLTksIG1pbnVzLCBlcXVhbCwgYmFja3NwYWNlLCB0YWIsIGEteiwgYmFja2V0bGVmdCwgYnJhY2tldHJpZ2h0LCBzZW1pY29sb24sIHF1b3RlLFxyXG4gICAgICogICAgYmFja3F1b3RlLCBiYWNrc2xhc2gsIGNvbW1hLCBwZXJpb2QsIHNsYXNoLCBudW1wYWRtdWx0aXBseSwgc3BhY2UsIGNhcHNsb2NrLCBmMS1mMjQsIHBhdXNlLFxyXG4gICAgICogICAgc2Nyb2xsbG9jaywgcHJpbnRzY3JlZW4sIGhvbWUsIGFycm93dXAsIGFycm93bGVmdCwgYXJyb3dyaWdodCwgYXJyb3dkb3duLCBwYWdldXAsIHBhZ2Vkb3duLFxyXG4gICAgICogICAgZW5kLCBpbnNlcnQsIGRlbGV0ZSwgZW50ZXIsIHNoaWZ0bGVmdCwgc2hpZnRyaWdodCwgY3RybGxlZnQsIGN0cmxyaWdodCwgYWx0bGVmdCwgYWx0cmlnaHQsIHNoaWZ0bGVmdCxcclxuICAgICAqICAgIHNoaWZ0cmlnaHQsIG51bWxvY2ssIG51bXBhZC4uLlxyXG4gICAgICogPC9wcmU+XHJcbiAgICAgKiBGb3IgT1Mtc3BlY2lmaWMgY29kZXMgYW5kIGEgbW9yZSBkZXRhaWxlZCBleHBsYW5hdGlvbiBzZWUge0BsaW5rIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0FQSS9LZXlib2FyZEV2ZW50L2NvZGV9LiBBbHNvIG5vdGUgdGhhdCAnRGlnaXQnIGFuZCAnS2V5JyBhcmUgcmVtb3ZlZCBmcm9tIHRoZSBjb2RlIHRvIG1ha2UgaXQgZWFzaWVyIHRvIHR5cGUuXHJcbiAgICAgKlxyXG4gICAgICogQHR5cGVkZWYge3N0cmluZ30gR2xvYmFsQWNjZWxlcmF0b3J+S2V5Q29kZXNcclxuICAgICAqL1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogdHJhbnNsYXRlIGEgdXNlci1wcm92aWRlZCBrZXljb2RlXHJcbiAgICAgKiBAcGFyYW0ge0tleUNvZGVzfSBrZXlDb2RlXHJcbiAgICAgKiBAcmV0dXJuIHtLZXlDb2Rlc30gZm9ybWF0dGVkIGFuZCBzb3J0ZWQga2V5Q29kZVxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqL1xyXG4gICAgcHJlcGFyZUtleTogZnVuY3Rpb24oa2V5Q29kZSlcclxuICAgIHtcclxuICAgICAgICBjb25zdCBrZXlzID0gW11cclxuICAgICAgICBsZXQgc3BsaXRcclxuICAgICAgICBpZiAoa2V5Q29kZS5pbmRleE9mKCd8JykgIT09IC0xKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgc3BsaXQgPSBrZXlDb2RlLnNwbGl0KCd8JylcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgc3BsaXQgPSBba2V5Q29kZV1cclxuICAgICAgICB9XHJcbiAgICAgICAgZm9yIChsZXQgY29kZSBvZiBzcGxpdClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGxldCBrZXkgPSAnJ1xyXG4gICAgICAgICAgICBsZXQgbW9kaWZpZXJzID0gW11cclxuICAgICAgICAgICAgY29kZSA9IGNvZGUudG9Mb3dlckNhc2UoKS5yZXBsYWNlKCcgJywgJycpXHJcbiAgICAgICAgICAgIGlmIChjb2RlLmluZGV4T2YoJysnKSAhPT0gLTEpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHNwbGl0ID0gY29kZS50b0xvd2VyQ2FzZSgpLnNwbGl0KCcrJylcclxuICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgc3BsaXQubGVuZ3RoIC0gMTsgaSsrKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBtb2RpZmllciA9IHNwbGl0W2ldXHJcbiAgICAgICAgICAgICAgICAgICAgbW9kaWZpZXIgPSBtb2RpZmllci5yZXBsYWNlKCdjb21tYW5kb3Jjb250cm9sJywgJ2N0cmwnKVxyXG4gICAgICAgICAgICAgICAgICAgIG1vZGlmaWVyID0gbW9kaWZpZXIucmVwbGFjZSgnY29tbWFuZCcsICdjdHJsJylcclxuICAgICAgICAgICAgICAgICAgICBtb2RpZmllciA9IG1vZGlmaWVyLnJlcGxhY2UoJ2NvbnRyb2wnLCAnY3RybCcpXHJcbiAgICAgICAgICAgICAgICAgICAgbW9kaWZpZXJzLnB1c2gobW9kaWZpZXIpXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBtb2RpZmllcnMgPSBtb2RpZmllcnMuc29ydCgoYSwgYikgPT4geyByZXR1cm4gYVswXSA+IGJbMF0gPyAxIDogYVswXSA8IGJbMF0gPyAtMSA6IDAgfSlcclxuICAgICAgICAgICAgICAgIGZvciAobGV0IHBhcnQgb2YgbW9kaWZpZXJzKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGtleSArPSBwYXJ0ICsgJysnXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBrZXkgKz0gc3BsaXRbc3BsaXQubGVuZ3RoIC0gMV1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGtleSA9IGtleUNvZGVcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBrZXlzLnB1c2goa2V5KVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4ga2V5c1xyXG4gICAgfSxcclxuXHJcbiAgICAvKipcclxuICAgICAqIE1ha2UgdGhlIEtleUNvZGUgcHJldHR5IGZvciBwcmludGluZyBvbiB0aGUgbWVudVxyXG4gICAgICogQHBhcmFtIHtLZXlDb2RlfSBrZXlDb2RlXHJcbiAgICAgKiBAcmV0dXJuIHtzdHJpbmd9XHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICBwcmV0dGlmeUtleTogZnVuY3Rpb24oa2V5Q29kZSlcclxuICAgIHtcclxuICAgICAgICBsZXQga2V5ID0gJydcclxuICAgICAgICBjb25zdCBjb2RlcyA9IEdsb2JhbEFjY2VsZXJhdG9yLnByZXBhcmVLZXkoa2V5Q29kZSlcclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGNvZGVzLmxlbmd0aDsgaSsrKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgY29uc3Qga2V5Q29kZSA9IGNvZGVzW2ldXHJcbiAgICAgICAgICAgIGlmIChrZXlDb2RlLmluZGV4T2YoJysnKSAhPT0gLTEpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHNwbGl0ID0ga2V5Q29kZS50b0xvd2VyQ2FzZSgpLnNwbGl0KCcrJylcclxuICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgc3BsaXQubGVuZ3RoIC0gMTsgaSsrKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBtb2RpZmllciA9IHNwbGl0W2ldXHJcbiAgICAgICAgICAgICAgICAgICAga2V5ICs9IG1vZGlmaWVyWzBdLnRvVXBwZXJDYXNlKCkgKyBtb2RpZmllci5zdWJzdHIoMSkgKyAnKydcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGtleSArPSBzcGxpdFtzcGxpdC5sZW5ndGggLSAxXS50b1VwcGVyQ2FzZSgpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBrZXkgPSBrZXlDb2RlLnRvVXBwZXJDYXNlKClcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoaSAhPT0gY29kZXMubGVuZ3RoIC0gMSlcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAga2V5ICs9ICcgb3IgJ1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBrZXlcclxuICAgIH0sXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiByZWdpc3RlciBhIGtleSBhcyBhIGdsb2JhbCBhY2NlbGVyYXRvclxyXG4gICAgICogQHBhcmFtIHtLZXlDb2Rlc30ga2V5Q29kZSAoZS5nLiwgQ3RybCtzaGlmdCtFKVxyXG4gICAgICogQHBhcmFtIHtmdW5jdGlvbn0gY2FsbGJhY2tcclxuICAgICAqL1xyXG4gICAgcmVnaXN0ZXI6IGZ1bmN0aW9uKGtleUNvZGUsIGNhbGxiYWNrKVxyXG4gICAge1xyXG4gICAgICAgIGNvbnN0IGtleXMgPSBHbG9iYWxBY2NlbGVyYXRvci5wcmVwYXJlS2V5KGtleUNvZGUpXHJcbiAgICAgICAgZm9yIChsZXQga2V5IG9mIGtleXMpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBHbG9iYWxBY2NlbGVyYXRvci5rZXlzW2tleV0gPSAoZSkgPT5cclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgY2FsbGJhY2soZSlcclxuICAgICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKVxyXG4gICAgICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuXHJcbiAgICBrZXlEb3duOiBmdW5jdGlvbihhY2NlbGVyYXRvciwgZSlcclxuICAgIHtcclxuICAgICAgICBjb25zdCBtb2RpZmllcnMgPSBbXVxyXG4gICAgICAgIGlmIChlLmFsdEtleSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIG1vZGlmaWVycy5wdXNoKCdhbHQnKVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoZS5jdHJsS2V5KVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgbW9kaWZpZXJzLnB1c2goJ2N0cmwnKVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoZS5tZXRhS2V5KVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgbW9kaWZpZXJzLnB1c2goJ21ldGEnKVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoZS5zaGlmdEtleSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIG1vZGlmaWVycy5wdXNoKCdzaGlmdCcpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGxldCBrZXlDb2RlID0gJydcclxuICAgICAgICBmb3IgKGxldCBtb2RpZmllciBvZiBtb2RpZmllcnMpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBrZXlDb2RlID0gbW9kaWZpZXIgKyAnKydcclxuICAgICAgICB9XHJcbiAgICAgICAgbGV0IHRyYW5zbGF0ZSA9IGUuY29kZS50b0xvd2VyQ2FzZSgpXHJcbiAgICAgICAgdHJhbnNsYXRlID0gdHJhbnNsYXRlLnJlcGxhY2UoJ2RpZ2l0JywgJycpXHJcbiAgICAgICAgdHJhbnNsYXRlID0gdHJhbnNsYXRlLnJlcGxhY2UoJ2tleScsICcnKVxyXG4gICAgICAgIGtleUNvZGUgKz0gdHJhbnNsYXRlXHJcbiAgICAgICAgaWYgKEdsb2JhbEFjY2VsZXJhdG9yLm1lbnVLZXlzW2tleUNvZGVdKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgR2xvYmFsQWNjZWxlcmF0b3IubWVudUtleXNba2V5Q29kZV0oZSwgdGhpcylcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAoR2xvYmFsQWNjZWxlcmF0b3Iua2V5c1trZXlDb2RlXSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIEdsb2JhbEFjY2VsZXJhdG9yLmtleXNba2V5Q29kZV0oZSwgdGhpcylcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gR2xvYmFsQWNjZWxlcmF0b3IiXX0=