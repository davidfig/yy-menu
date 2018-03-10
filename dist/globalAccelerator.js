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
     * <p>KeyCodes are case insensitive (i.e., shift+a is the same as Shift+A)</p>
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
        let modifiers = [];
        let key = '';
        keyCode = keyCode.toLowerCase();
        if (keyCode.indexOf('+') !== -1) {
            const split = keyCode.toLowerCase().split('+');
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
        return key;
    },

    /**
     * Make the KeyCode pretty for printing on the menu
     * @param {KeyCode} keyCode
     * @return {string}
     * @private
     */
    prettifyKey: function (keyCode) {
        keyCode = GlobalAccelerator.prepareKey(keyCode);
        let key = '';
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
        return key;
    },

    /**
     * register a key as a global accelerator
     * @param {KeyCodes} keyCode (e.g., Ctrl+shift+E)
     * @param {function} callback
     */
    register: function (keyCode, callback) {
        GlobalAccelerator.keys[GlobalAccelerator.prepareKey(keyCode)] = e => {
            callback(e);
            e.preventDefault();
            e.stopPropagation();
        };
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9nbG9iYWxBY2NlbGVyYXRvci5qcyJdLCJuYW1lcyI6WyJHbG9iYWxBY2NlbGVyYXRvciIsImluaXQiLCJtZW51S2V5cyIsImtleXMiLCJkb2N1bWVudCIsImJvZHkiLCJhZGRFdmVudExpc3RlbmVyIiwiZSIsImtleURvd24iLCJjbGVhcktleXMiLCJyZWdpc3Rlck1lbnVTaG9ydGN1dCIsImxldHRlciIsIm1lbnVJdGVtIiwia2V5Q29kZSIsIm1lbnUiLCJhcHBsaWNhdGlvbk1lbnUiLCJwcmVwYXJlS2V5IiwiaGFuZGxlQ2xpY2siLCJzdG9wUHJvcGFnYXRpb24iLCJwcmV2ZW50RGVmYXVsdCIsInJlZ2lzdGVyTWVudVNwZWNpYWwiLCJjbG9zZUFsbCIsImVudGVyIiwibW92ZSIsInVucmVnaXN0ZXJNZW51U2hvcnRjdXRzIiwibW9kaWZpZXJzIiwia2V5IiwidG9Mb3dlckNhc2UiLCJpbmRleE9mIiwic3BsaXQiLCJpIiwibGVuZ3RoIiwibW9kaWZpZXIiLCJyZXBsYWNlIiwicHVzaCIsInNvcnQiLCJhIiwiYiIsInBhcnQiLCJwcmV0dGlmeUtleSIsInRvVXBwZXJDYXNlIiwic3Vic3RyIiwicmVnaXN0ZXIiLCJjYWxsYmFjayIsImFjY2VsZXJhdG9yIiwiYWx0S2V5IiwiY3RybEtleSIsIm1ldGFLZXkiLCJzaGlmdEtleSIsInRyYW5zbGF0ZSIsImNvZGUiLCJtb2R1bGUiLCJleHBvcnRzIl0sIm1hcHBpbmdzIjoiQUFBQTs7O0FBR0EsTUFBTUEsb0JBQW9COztBQUV0QkMsVUFBTSxZQUNOO0FBQ0ksWUFBSSxDQUFDRCxrQkFBa0JFLFFBQXZCLEVBQ0E7QUFDSUYsOEJBQWtCRSxRQUFsQixHQUE2QixFQUE3QjtBQUNBRiw4QkFBa0JHLElBQWxCLEdBQXlCLEVBQXpCO0FBQ0FDLHFCQUFTQyxJQUFULENBQWNDLGdCQUFkLENBQStCLFNBQS9CLEVBQTJDQyxDQUFELElBQU9QLGtCQUFrQlEsT0FBbEIsQ0FBMEIsSUFBMUIsRUFBZ0NELENB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Q0liLDhCQUFrQkcsSUFBbEIsQ0FBdUJVLE9BQXZCLEVBQWdDTixDQUFoQyxFQUFtQyxJQUFuQztBQUNIO0FBQ0o7QUF6TXFCLENBQTFCOztBQTRNQTRDLE9BQU9DLE9BQVAsR0FBaUJwRCxpQkFBakIiLCJmaWxlIjoiZ2xvYmFsQWNjZWxlcmF0b3IuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcclxuICogSGFuZGxlcyBhbGwga2V5Ym9hcmQgaW5wdXQgZm9yIHRoZSBtZW51IGFuZCB1c2VyLXJlZ2lzdGVyZWQga2V5c1xyXG4gKi9cclxuY29uc3QgR2xvYmFsQWNjZWxlcmF0b3IgPSB7XHJcblxyXG4gICAgaW5pdDogZnVuY3Rpb24oKVxyXG4gICAge1xyXG4gICAgICAgIGlmICghR2xvYmFsQWNjZWxlcmF0b3IubWVudUtleXMpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBHbG9iYWxBY2NlbGVyYXRvci5tZW51S2V5cyA9IHt9XHJcbiAgICAgICAgICAgIEdsb2JhbEFjY2VsZXJhdG9yLmtleXMgPSB7fVxyXG4gICAgICAgICAgICBkb2N1bWVudC5ib2R5LmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCAoZSkgPT4gR2xvYmFsQWNjZWxlcmF0b3Iua2V5RG93bih0aGlzLCBlKSlcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG5cclxuICAgIC8qKlxyXG4gICAgICogY2xlYXIgYWxsIHVzZXItcmVnaXN0ZXJlZCBrZXlzXHJcbiAgICAgKi9cclxuICAgIGNsZWFyS2V5czogZnVuY3Rpb24oKVxyXG4gICAge1xyXG4gICAgICAgIEdsb2JhbEFjY2VsZXJhdG9yLmtleXMgPSB7fVxyXG4gICAgfSxcclxuXHJcbiAgICAvKipcclxuICAgICAqIFJlZ2lzdGVyIGEgc2hvcnRjdXQga2V5IGZvciB1c2UgYnkgYW4gb3BlbiBtZW51XHJcbiAgICAgKiBAcGFyYW0ge0tleUNvZGVzfSBsZXR0ZXJcclxuICAgICAqIEBwYXJhbSB7TWVudUl0ZW19IG1lbnVJdGVtXHJcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IGFwcGxpY2F0aW9uTWVudVxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqL1xyXG4gICAgcmVnaXN0ZXJNZW51U2hvcnRjdXQ6IGZ1bmN0aW9uKGxldHRlciwgbWVudUl0ZW0pXHJcbiAgICB7XHJcbiAgICAgICAgaWYgKGxldHRlcilcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGNvbnN0IGtleUNvZGUgPSAobWVudUl0ZW0ubWVudS5hcHBsaWNhdGlvbk1lbnUgPyAnYWx0KycgOiAnJykgKyBsZXR0ZXJcclxuICAgICAgICAgICAgR2xvYmFsQWNjZWxlcmF0b3IubWVudUtleXNbR2xvYmFsQWNjZWxlcmF0b3IucHJlcGFyZUtleShrZXlDb2RlKV0gPSAoZSkgPT5cclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgbWVudUl0ZW0uaGFuZGxlQ2xpY2soZSlcclxuICAgICAgICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKClcclxuICAgICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuXHJcbiAgICAvKipcclxuICAgICAqIFJlZ2lzdGVyIHNwZWNpYWwgc2hvcnRjdXQga2V5cyBmb3IgbWVudVxyXG4gICAgICogQHBhcmFtIHtNZW51SXRlbX0gbWVudUl0ZW1cclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKi9cclxuICAgIHJlZ2lzdGVyTWVudVNwZWNpYWw6IGZ1bmN0aW9uKG1lbnUpXHJcbiAgICB7XHJcbiAgICAgICAgR2xvYmFsQWNjZWxlcmF0b3IubWVudUtleXNbJ2VzY2FwZSddID0gKCkgPT4gbWVudS5jbG9zZUFsbCgpXHJcbiAgICAgICAgR2xvYmFsQWNjZWxlcmF0b3IubWVudUtleXNbJ2VudGVyJ10gPSAoZSkgPT4gbWVudS5lbnRlcihlKVxyXG4gICAgICAgIEdsb2JhbEFjY2VsZXJhdG9yLm1lbnVLZXlzWydzcGFjZSddID0gKGUpID0+IG1lbnUuZW50ZXIoZSlcclxuICAgICAgICBHbG9iYWxBY2NlbGVyYXRvci5tZW51S2V5c1snYXJyb3dyaWdodCddID0gKGUpID0+IG1lbnUubW92ZShlLCAncmlnaHQnKVxyXG4gICAgICAgIEdsb2JhbEFjY2VsZXJhdG9yLm1lbnVLZXlzWydhcnJvd2xlZnQnXSA9IChlKSA9PiBtZW51Lm1vdmUoZSwgJ2xlZnQnKVxyXG4gICAgICAgIEdsb2JhbEFjY2VsZXJhdG9yLm1lbnVLZXlzWydhcnJvd3VwJ10gPSAoZSkgPT4gbWVudS5tb3ZlKGUsICd1cCcpXHJcbiAgICAgICAgR2xvYmFsQWNjZWxlcmF0b3IubWVudUtleXNbJ2Fycm93ZG93biddID0gKGUpID0+IG1lbnUubW92ZShlLCAnZG93bicpXHJcbiAgICB9LFxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmVtb3ZlcyBtZW51IHNob3J0Y3V0c1xyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqL1xyXG4gICAgdW5yZWdpc3Rlck1lbnVTaG9ydGN1dHM6IGZ1bmN0aW9uKClcclxuICAgIHtcclxuICAgICAgICBHbG9iYWxBY2NlbGVyYXRvci5tZW51S2V5cyA9IHt9XHJcbiAgICB9LFxyXG5cclxuICAgIC8qKlxyXG4gICAgICogS2V5Y29kZXMgZGVmaW5pdGlvbi4gSW4gdGhlIGZvcm0gb2YgbW9kaWZpZXJbK21vZGlmaWVyLi4uXStrZXlcclxuICAgICAqIDxwPkZvciBleGFtcGxlOiBjdHJsK3NoaWZ0K2U8L3A+XHJcbiAgICAgKiA8cD5LZXlDb2RlcyBhcmUgY2FzZSBpbnNlbnNpdGl2ZSAoaS5lLiwgc2hpZnQrYSBpcyB0aGUgc2FtZSBhcyBTaGlmdCtBKTwvcD5cclxuICAgICAqIDxwcmU+XHJcbiAgICAgKiBNb2RpZmllcnM6XHJcbiAgICAgKiAgICBjdHJsLCBhbHQsIHNoaWZ0LCBtZXRhLCAoY3RybCBhbGlhc2VzOiBjb21tYW5kLCBjb250cm9sLCBjb21tYW5kb3Jjb250cm9sKVxyXG4gICAgICogPC9wcmU+XHJcbiAgICAgKiA8cHJlPlxyXG4gICAgICogS2V5czpcclxuICAgICAqICAgIGVzY2FwZSwgMC05LCBtaW51cywgZXF1YWwsIGJhY2tzcGFjZSwgdGFiLCBhLXosIGJhY2tldGxlZnQsIGJyYWNrZXRyaWdodCwgc2VtaWNvbG9uLCBxdW90ZSxcclxuICAgICAqICAgIGJhY2txdW90ZSwgYmFja3NsYXNoLCBjb21tYSwgcGVyaW9kLCBzbGFzaCwgbnVtcGFkbXVsdGlwbHksIHNwYWNlLCBjYXBzbG9jaywgZjEtZjI0LCBwYXVzZSxcclxuICAgICAqICAgIHNjcm9sbGxvY2ssIHByaW50c2NyZWVuLCBob21lLCBhcnJvd3VwLCBhcnJvd2xlZnQsIGFycm93cmlnaHQsIGFycm93ZG93biwgcGFnZXVwLCBwYWdlZG93bixcclxuICAgICAqICAgIGVuZCwgaW5zZXJ0LCBkZWxldGUsIGVudGVyLCBzaGlmdGxlZnQsIHNoaWZ0cmlnaHQsIGN0cmxsZWZ0LCBjdHJscmlnaHQsIGFsdGxlZnQsIGFsdHJpZ2h0LCBzaGlmdGxlZnQsXHJcbiAgICAgKiAgICBzaGlmdHJpZ2h0LCBudW1sb2NrLCBudW1wYWQuLi5cclxuICAgICAqIDwvcHJlPlxyXG4gICAgICogRm9yIE9TLXNwZWNpZmljIGNvZGVzIGFuZCBhIG1vcmUgZGV0YWlsZWQgZXhwbGFuYXRpb24gc2VlIHtAbGluayBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9BUEkvS2V5Ym9hcmRFdmVudC9jb2RlfS4gQWxzbyBub3RlIHRoYXQgJ0RpZ2l0JyBhbmQgJ0tleScgYXJlIHJlbW92ZWQgZnJvbSB0aGUgY29kZSB0byBtYWtlIGl0IGVhc2llciB0byB0eXBlLlxyXG4gICAgICpcclxuICAgICAqIEB0eXBlZGVmIHtzdHJpbmd9IEdsb2JhbEFjY2VsZXJhdG9yfktleUNvZGVzXHJcbiAgICAgKi9cclxuXHJcbiAgICAvKipcclxuICAgICAqIHRyYW5zbGF0ZSBhIHVzZXItcHJvdmlkZWQga2V5Y29kZVxyXG4gICAgICogQHBhcmFtIHtLZXlDb2Rlc30ga2V5Q29kZVxyXG4gICAgICogQHJldHVybiB7S2V5Q29kZXN9IGZvcm1hdHRlZCBhbmQgc29ydGVkIGtleUNvZGVcclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKi9cclxuICAgIHByZXBhcmVLZXk6IGZ1bmN0aW9uKGtleUNvZGUpXHJcbiAgICB7XHJcbiAgICAgICAgbGV0IG1vZGlmaWVycyA9IFtdXHJcbiAgICAgICAgbGV0IGtleSA9ICcnXHJcbiAgICAgICAga2V5Q29kZSA9IGtleUNvZGUudG9Mb3dlckNhc2UoKVxyXG4gICAgICAgIGlmIChrZXlDb2RlLmluZGV4T2YoJysnKSAhPT0gLTEpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBjb25zdCBzcGxpdCA9IGtleUNvZGUudG9Mb3dlckNhc2UoKS5zcGxpdCgnKycpXHJcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgc3BsaXQubGVuZ3RoIC0gMTsgaSsrKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBsZXQgbW9kaWZpZXIgPSBzcGxpdFtpXVxyXG4gICAgICAgICAgICAgICAgbW9kaWZpZXIgPSBtb2RpZmllci5yZXBsYWNlKCdjb21tYW5kb3Jjb250cm9sJywgJ2N0cmwnKVxyXG4gICAgICAgICAgICAgICAgbW9kaWZpZXIgPSBtb2RpZmllci5yZXBsYWNlKCdjb21tYW5kJywgJ2N0cmwnKVxyXG4gICAgICAgICAgICAgICAgbW9kaWZpZXIgPSBtb2RpZmllci5yZXBsYWNlKCdjb250cm9sJywgJ2N0cmwnKVxyXG4gICAgICAgICAgICAgICAgbW9kaWZpZXJzLnB1c2gobW9kaWZpZXIpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgbW9kaWZpZXJzID0gbW9kaWZpZXJzLnNvcnQoKGEsIGIpID0+IHsgcmV0dXJuIGFbMF0gPiBiWzBdID8gMSA6IGFbMF0gPCBiWzBdID8gLTEgOiAwIH0pXHJcbiAgICAgICAgICAgIGZvciAobGV0IHBhcnQgb2YgbW9kaWZpZXJzKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBrZXkgKz0gcGFydCArICcrJ1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGtleSArPSBzcGxpdFtzcGxpdC5sZW5ndGggLSAxXVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBrZXkgPSBrZXlDb2RlXHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBrZXlcclxuICAgIH0sXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBNYWtlIHRoZSBLZXlDb2RlIHByZXR0eSBmb3IgcHJpbnRpbmcgb24gdGhlIG1lbnVcclxuICAgICAqIEBwYXJhbSB7S2V5Q29kZX0ga2V5Q29kZVxyXG4gICAgICogQHJldHVybiB7c3RyaW5nfVxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqL1xyXG4gICAgcHJldHRpZnlLZXk6IGZ1bmN0aW9uKGtleUNvZGUpXHJcbiAgICB7XHJcbiAgICAgICAga2V5Q29kZSA9IEdsb2JhbEFjY2VsZXJhdG9yLnByZXBhcmVLZXkoa2V5Q29kZSlcclxuICAgICAgICBsZXQga2V5ID0gJydcclxuICAgICAgICBpZiAoa2V5Q29kZS5pbmRleE9mKCcrJykgIT09IC0xKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgY29uc3Qgc3BsaXQgPSBrZXlDb2RlLnRvTG93ZXJDYXNlKCkuc3BsaXQoJysnKVxyXG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHNwbGl0Lmxlbmd0aCAtIDE7IGkrKylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgbGV0IG1vZGlmaWVyID0gc3BsaXRbaV1cclxuICAgICAgICAgICAgICAgIGtleSArPSBtb2RpZmllclswXS50b1VwcGVyQ2FzZSgpICsgbW9kaWZpZXIuc3Vic3RyKDEpICsgJysnXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAga2V5ICs9IHNwbGl0W3NwbGl0Lmxlbmd0aCAtIDFdLnRvVXBwZXJDYXNlKClcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAga2V5ID0ga2V5Q29kZS50b1VwcGVyQ2FzZSgpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBrZXlcclxuICAgIH0sXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiByZWdpc3RlciBhIGtleSBhcyBhIGdsb2JhbCBhY2NlbGVyYXRvclxyXG4gICAgICogQHBhcmFtIHtLZXlDb2Rlc30ga2V5Q29kZSAoZS5nLiwgQ3RybCtzaGlmdCtFKVxyXG4gICAgICogQHBhcmFtIHtmdW5jdGlvbn0gY2FsbGJhY2tcclxuICAgICAqL1xyXG4gICAgcmVnaXN0ZXI6IGZ1bmN0aW9uKGtleUNvZGUsIGNhbGxiYWNrKVxyXG4gICAge1xyXG4gICAgICAgIEdsb2JhbEFjY2VsZXJhdG9yLmtleXNbR2xvYmFsQWNjZWxlcmF0b3IucHJlcGFyZUtleShrZXlDb2RlKV0gPSAoZSkgPT5cclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGNhbGxiYWNrKGUpXHJcbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKVxyXG4gICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpXHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuXHJcbiAgICBrZXlEb3duOiBmdW5jdGlvbihhY2NlbGVyYXRvciwgZSlcclxuICAgIHtcclxuICAgICAgICBjb25zdCBtb2RpZmllcnMgPSBbXVxyXG4gICAgICAgIGlmIChlLmFsdEtleSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIG1vZGlmaWVycy5wdXNoKCdhbHQnKVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoZS5jdHJsS2V5KVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgbW9kaWZpZXJzLnB1c2goJ2N0cmwnKVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoZS5tZXRhS2V5KVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgbW9kaWZpZXJzLnB1c2goJ21ldGEnKVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoZS5zaGlmdEtleSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIG1vZGlmaWVycy5wdXNoKCdzaGlmdCcpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGxldCBrZXlDb2RlID0gJydcclxuICAgICAgICBmb3IgKGxldCBtb2RpZmllciBvZiBtb2RpZmllcnMpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBrZXlDb2RlID0gbW9kaWZpZXIgKyAnKydcclxuICAgICAgICB9XHJcbiAgICAgICAgbGV0IHRyYW5zbGF0ZSA9IGUuY29kZS50b0xvd2VyQ2FzZSgpXHJcbiAgICAgICAgdHJhbnNsYXRlID0gdHJhbnNsYXRlLnJlcGxhY2UoJ2RpZ2l0JywgJycpXHJcbiAgICAgICAgdHJhbnNsYXRlID0gdHJhbnNsYXRlLnJlcGxhY2UoJ2tleScsICcnKVxyXG4gICAgICAgIGtleUNvZGUgKz0gdHJhbnNsYXRlXHJcbiAgICAgICAgaWYgKEdsb2JhbEFjY2VsZXJhdG9yLm1lbnVLZXlzW2tleUNvZGVdKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgR2xvYmFsQWNjZWxlcmF0b3IubWVudUtleXNba2V5Q29kZV0oZSwgdGhpcylcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAoR2xvYmFsQWNjZWxlcmF0b3Iua2V5c1trZXlDb2RlXSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIEdsb2JhbEFjY2VsZXJhdG9yLmtleXNba2V5Q29kZV0oZSwgdGhpcylcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gR2xvYmFsQWNjZWxlcmF0b3IiXX0=