class Accelerators {
    /**
     * Handles all keyboard input for the menu and user-registered keys registered through Menu.GlobalAccelerator
     * @param {object} options
     * @param {HTMLElement} [options.div] used for global accelerators (usually attached to document.body)
     * @param {Menu} [options.menu] Menu to attach accelerators
     */
    constructor(options) {
        this.menuKeys = {};
        this.keys = {};
        if (options.div) {
            options.div.addEventListener('keydown', e => this.keyDown(this, e));
        } else {
            options.menu.div.addEventListener('keydown', e => this.keyDown(this, e));
        }
    }

    /**
     * Register a shortcut key for use by an open menu
     * @param {KeyCodes} letter
     * @param {MenuItem} menuItem
     * @param {boolean} applicationMenu
     * @private
     */
    registerMenuShortcut(letter, menuItem) {
        if (letter) {
            const keyCode = (menuItem.menu.applicationMenu ? 'alt+' : '') + letter;
            this.menuKeys[Accelerators.prepareKey(keyCode)] = e => {
                menuItem.handleClick(e);
                e.stopPropagation();
                e.preventDefault();
            };
        }
    }

    /**
     * Register special shortcut keys for menu
     * @param {MenuItem} menuItem
     * @private
     */
    registerMenuSpecial(menu) {
        this.menuKeys['escape'] = () => menu.getApplicationMenu().closeAll();
        this.menuKeys['enter'] = e => menu.enter(e);
        this.menuKeys['space'] = e => menu.enter(e);
        this.menuKeys['arrowright'] = e => menu.move(e, 'right');
        this.menuKeys['arrowleft'] = e => menu.move(e, 'left');
        this.menuKeys['arrowup'] = e => menu.move(e, 'up');
        this.menuKeys['arrowdown'] = e => menu.move(e, 'down');
    }

    /**
     * Removes menu shortcuts
     * @private
     */
    unregisterMenuShortcuts() {
        this.menuKeys = {};
    }

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
     * @typedef {string} Accelerators~KeyCodes
     */

    /**
     * translate a user-provided keycode
     * @param {KeyCodes} keyCode
     * @return {KeyCodes} formatted and sorted keyCode
     * @private
     */
    static prepareKey(keyCode) {
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
    }

    /**
     * Make the KeyCode pretty for printing on the menu
     * @param {KeyCode} keyCode
     * @return {string}
     * @private
     */
    static prettifyKey(keyCode) {
        keyCode = Accelerators.prepareKey(keyCode);
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
    }

    /**
     * register a key as a global accelerator
     * @param {KeyCodes} keyCode (e.g., Ctrl+shift+E)
     * @param {function} callback
     */
    register(keyCode, callback) {
        this.keys[Accelerators.prepareKey(keyCode)] = callback;
    }

    keyDown(accelerator, e) {
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
        if (this.menuKeys[keyCode]) {
            this.menuKeys[keyCode](e, this);
        } else if (this.keys[keyCode]) {
            this.keys[keyCode](e, this);
        }
    }
}

module.exports = Accelerators;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9hY2NlbGVyYXRvcnMuanMiXSwibmFtZXMiOlsiQWNjZWxlcmF0b3JzIiwiY29uc3RydWN0b3IiLCJvcHRpb25zIiwibWVudUtleXMiLCJrZXlzIiwiZGl2IiwiYWRkRXZlbnRMaXN0ZW5lciIsImUiLCJrZXlEb3duIiwibWVudSIsInJlZ2lzdGVyTWVudVNob3J0Y3V0IiwibGV0dGVyIiwibWVudUl0ZW0iLCJrZXlDb2RlIiwiYXBwbGljYXRpb25NZW51IiwicHJlcGFyZUtleSIsImhhbmRsZUNsaWNrIiwic3RvcFByb3BhZ2F0aW9uIiwicHJldmVudERlZmF1bHQiLCJyZWdpc3Rlck1lbnVTcGVjaWFsIiwiZ2V0QXBwbGljYXRpb25NZW51IiwiY2xvc2VBbGwiLCJlbnRlciIsIm1vdmUiLCJ1bnJlZ2lzdGVyTWVudVNob3J0Y3V0cyIsIm1vZGlmaWVycyIsImtleSIsInRvTG93ZXJDYXNlIiwiaW5kZXhPZiIsInNwbGl0IiwiaSIsImxlbmd0aCIsIm1vZGlmaWVyIiwicmVwbGFjZSIsInB1c2giLCJzb3J0IiwiYSIsImIiLCJwYXJ0IiwicHJldHRpZnlLZXkiLCJ0b1VwcGVyQ2FzZSIsInN1YnN0ciIsInJlZ2lzdGVyIiwiY2FsbGJhY2siLCJhY2NlbGVyYXRvciIsImFsdEtleSIsImN0cmxLZXkiLCJtZXRhS2V5Iiwic2hpZnRLZXkiLCJ0cmFuc2xhdGUiLCJjb2RlIiwibW9kdWxlIiwiZXhwb3J0cyJdLCJtYXBwaW5ncyI6IkFBQUEsTUFBTUEsWUFBTixDQUNBO0FBQ0k7Ozs7OztBQU1BQyxnQkFBWUMsT0FBWixFQUNBO0FBQ0ksYUFBS0MsUUFBTCxHQUFnQixFQUFoQjtBQUNBLGFBQUtDLElBQUwsR0FBWSxFQUFaO0FBQ0EsWUFBSUYsUUFBUUcsR0FBWixFQUNBO0FBQ0lILG9CQUFRRyxHQUFSLENBQVlDLGdCQUFaLENBQTZCLFNBQTdCLEVBQXlDQyxDQUFELElBQU8sS0FBS0MsT0FBTCxDQUFhLElBQWIsRUFBbUJELENBQW5CLENBQS9D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bntcclxuICAgIC8qKlxyXG4gICAgICogSGFuZGxlcyBhbGwga2V5Ym9hcmQgaW5wdXQgZm9yIHRoZSBtZW51IGFuZCB1c2VyLXJlZ2lzdGVyZWQga2V5cyByZWdpc3RlcmVkIHRocm91Z2ggTWVudS5HbG9iYWxBY2NlbGVyYXRvclxyXG4gICAgICogQHBhcmFtIHtvYmplY3R9IG9wdGlvbnNcclxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IFtvcHRpb25zLmRpdl0gdXNlZCBmb3IgZ2xvYmFsIGFjY2VsZXJhdG9ycyAodXN1YWxseSBhdHRhY2hlZCB0byBkb2N1bWVudC5ib2R5KVxyXG4gICAgICogQHBhcmFtIHtNZW51fSBbb3B0aW9ucy5tZW51XSBNZW51IHRvIGF0dGFjaCBhY2NlbGVyYXRvcnNcclxuICAgICAqL1xyXG4gICAgY29uc3RydWN0b3Iob3B0aW9ucylcclxuICAgIHtcclxuICAgICAgICB0aGlzLm1lbnVLZXlzID0ge31cclxuICAgICAgICB0aGlzLmtleXMgPSB7fVxyXG4gICAgICAgIGlmIChvcHRpb25zLmRpdilcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIG9wdGlvbnMuZGl2LmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCAoZSkgPT4gdGhpcy5rZXlEb3duKHRoaXMsIGUpKVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBvcHRpb25zLm1lbnUuZGl2LmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCAoZSkgPT4gdGhpcy5rZXlEb3duKHRoaXMsIGUpKVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFJlZ2lzdGVyIGEgc2hvcnRjdXQga2V5IGZvciB1c2UgYnkgYW4gb3BlbiBtZW51XHJcbiAgICAgKiBAcGFyYW0ge0tleUNvZGVzfSBsZXR0ZXJcclxuICAgICAqIEBwYXJhbSB7TWVudUl0ZW19IG1lbnVJdGVtXHJcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IGFwcGxpY2F0aW9uTWVudVxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqL1xyXG4gICAgcmVnaXN0ZXJNZW51U2hvcnRjdXQobGV0dGVyLCBtZW51SXRlbSlcclxuICAgIHtcclxuICAgICAgICBpZiAobGV0dGVyKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgY29uc3Qga2V5Q29kZSA9IChtZW51SXRlbS5tZW51LmFwcGxpY2F0aW9uTWVudSA/ICdhbHQrJyA6ICcnKSArIGxldHRlclxyXG4gICAgICAgICAgICB0aGlzLm1lbnVLZXlzW0FjY2VsZXJhdG9ycy5wcmVwYXJlS2V5KGtleUNvZGUpXSA9IChlKSA9PlxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBtZW51SXRlbS5oYW5kbGVDbGljayhlKVxyXG4gICAgICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKVxyXG4gICAgICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZWdpc3RlciBzcGVjaWFsIHNob3J0Y3V0IGtleXMgZm9yIG1lbnVcclxuICAgICAqIEBwYXJhbSB7TWVudUl0ZW19IG1lbnVJdGVtXHJcbiAgICAgKiBAcHJpdmF0ZVxyXG4gICAgICovXHJcbiAgICByZWdpc3Rlck1lbnVTcGVjaWFsKG1lbnUpXHJcbiAgICB7XHJcbiAgICAgICAgdGhpcy5tZW51S2V5c1snZXNjYXBlJ10gPSAoKSA9PiBtZW51LmdldEFwcGxpY2F0aW9uTWVudSgpLmNsb3NlQWxsKClcclxuICAgICAgICB0aGlzLm1lbnVLZXlzWydlbnRlciddID0gKGUpID0+IG1lbnUuZW50ZXIoZSlcclxuICAgICAgICB0aGlzLm1lbnVLZXlzWydzcGFjZSddID0gKGUpID0+IG1lbnUuZW50ZXIoZSlcclxuICAgICAgICB0aGlzLm1lbnVLZXlzWydhcnJvd3JpZ2h0J10gPSAoZSkgPT4gbWVudS5tb3ZlKGUsICdyaWdodCcpXHJcbiAgICAgICAgdGhpcy5tZW51S2V5c1snYXJyb3dsZWZ0J10gPSAoZSkgPT4gbWVudS5tb3ZlKGUsICdsZWZ0JylcclxuICAgICAgICB0aGlzLm1lbnVLZXlzWydhcnJvd3VwJ10gPSAoZSkgPT4gbWVudS5tb3ZlKGUsICd1cCcpXHJcbiAgICAgICAgdGhpcy5tZW51S2V5c1snYXJyb3dkb3duJ10gPSAoZSkgPT4gbWVudS5tb3ZlKGUsICdkb3duJylcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFJlbW92ZXMgbWVudSBzaG9ydGN1dHNcclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKi9cclxuICAgIHVucmVnaXN0ZXJNZW51U2hvcnRjdXRzKClcclxuICAgIHtcclxuICAgICAgICB0aGlzLm1lbnVLZXlzID0ge31cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEtleWNvZGVzIGRlZmluaXRpb24uIEluIHRoZSBmb3JtIG9mIG1vZGlmaWVyWyttb2RpZmllci4uLl0ra2V5XHJcbiAgICAgKiA8cD5Gb3IgZXhhbXBsZTogY3RybCtzaGlmdCtlPC9wPlxyXG4gICAgICogPHA+S2V5Q29kZXMgYXJlIGNhc2UgaW5zZW5zaXRpdmUgKGkuZS4sIHNoaWZ0K2EgaXMgdGhlIHNhbWUgYXMgU2hpZnQrQSk8L3A+XHJcbiAgICAgKiA8cHJlPlxyXG4gICAgICogTW9kaWZpZXJzOlxyXG4gICAgICogICAgY3RybCwgYWx0LCBzaGlmdCwgbWV0YSwgKGN0cmwgYWxpYXNlczogY29tbWFuZCwgY29udHJvbCwgY29tbWFuZG9yY29udHJvbClcclxuICAgICAqIDwvcHJlPlxyXG4gICAgICogPHByZT5cclxuICAgICAqIEtleXM6XHJcbiAgICAgKiAgICBlc2NhcGUsIDAtOSwgbWludXMsIGVxdWFsLCBiYWNrc3BhY2UsIHRhYiwgYS16LCBiYWNrZXRsZWZ0LCBicmFja2V0cmlnaHQsIHNlbWljb2xvbiwgcXVvdGUsXHJcbiAgICAgKiAgICBiYWNrcXVvdGUsIGJhY2tzbGFzaCwgY29tbWEsIHBlcmlvZCwgc2xhc2gsIG51bXBhZG11bHRpcGx5LCBzcGFjZSwgY2Fwc2xvY2ssIGYxLWYyNCwgcGF1c2UsXHJcbiAgICAgKiAgICBzY3JvbGxsb2NrLCBwcmludHNjcmVlbiwgaG9tZSwgYXJyb3d1cCwgYXJyb3dsZWZ0LCBhcnJvd3JpZ2h0LCBhcnJvd2Rvd24sIHBhZ2V1cCwgcGFnZWRvd24sXHJcbiAgICAgKiAgICBlbmQsIGluc2VydCwgZGVsZXRlLCBlbnRlciwgc2hpZnRsZWZ0LCBzaGlmdHJpZ2h0LCBjdHJsbGVmdCwgY3RybHJpZ2h0LCBhbHRsZWZ0LCBhbHRyaWdodCwgc2hpZnRsZWZ0LFxyXG4gICAgICogICAgc2hpZnRyaWdodCwgbnVtbG9jaywgbnVtcGFkLi4uXHJcbiAgICAgKiA8L3ByZT5cclxuICAgICAqIEZvciBPUy1zcGVjaWZpYyBjb2RlcyBhbmQgYSBtb3JlIGRldGFpbGVkIGV4cGxhbmF0aW9uIHNlZSB7QGxpbmsgaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvQVBJL0tleWJvYXJkRXZlbnQvY29kZX0uIEFsc28gbm90ZSB0aGF0ICdEaWdpdCcgYW5kICdLZXknIGFyZSByZW1vdmVkIGZyb20gdGhlIGNvZGUgdG8gbWFrZSBpdCBlYXNpZXIgdG8gdHlwZS5cclxuICAgICAqXHJcbiAgICAgKiBAdHlwZWRlZiB7c3RyaW5nfSBBY2NlbGVyYXRvcnN+S2V5Q29kZXNcclxuICAgICAqL1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogdHJhbnNsYXRlIGEgdXNlci1wcm92aWRlZCBrZXljb2RlXHJcbiAgICAgKiBAcGFyYW0ge0tleUNvZGVzfSBrZXlDb2RlXHJcbiAgICAgKiBAcmV0dXJuIHtLZXlDb2Rlc30gZm9ybWF0dGVkIGFuZCBzb3J0ZWQga2V5Q29kZVxyXG4gICAgICogQHByaXZhdGVcclxuICAgICAqL1xyXG4gICAgc3RhdGljIHByZXBhcmVLZXkoa2V5Q29kZSlcclxuICAgIHtcclxuICAgICAgICBsZXQgbW9kaWZpZXJzID0gW11cclxuICAgICAgICBsZXQga2V5ID0gJydcclxuICAgICAgICBrZXlDb2RlID0ga2V5Q29kZS50b0xvd2VyQ2FzZSgpXHJcbiAgICAgICAgaWYgKGtleUNvZGUuaW5kZXhPZignKycpICE9PSAtMSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGNvbnN0IHNwbGl0ID0ga2V5Q29kZS50b0xvd2VyQ2FzZSgpLnNwbGl0KCcrJylcclxuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBzcGxpdC5sZW5ndGggLSAxOyBpKyspXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGxldCBtb2RpZmllciA9IHNwbGl0W2ldXHJcbiAgICAgICAgICAgICAgICBtb2RpZmllciA9IG1vZGlmaWVyLnJlcGxhY2UoJ2NvbW1hbmRvcmNvbnRyb2wnLCAnY3RybCcpXHJcbiAgICAgICAgICAgICAgICBtb2RpZmllciA9IG1vZGlmaWVyLnJlcGxhY2UoJ2NvbW1hbmQnLCAnY3RybCcpXHJcbiAgICAgICAgICAgICAgICBtb2RpZmllciA9IG1vZGlmaWVyLnJlcGxhY2UoJ2NvbnRyb2wnLCAnY3RybCcpXHJcbiAgICAgICAgICAgICAgICBtb2RpZmllcnMucHVzaChtb2RpZmllcilcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBtb2RpZmllcnMgPSBtb2RpZmllcnMuc29ydCgoYSwgYikgPT4geyByZXR1cm4gYVswXSA+IGJbMF0gPyAxIDogYVswXSA8IGJbMF0gPyAtMSA6IDAgfSlcclxuICAgICAgICAgICAgZm9yIChsZXQgcGFydCBvZiBtb2RpZmllcnMpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGtleSArPSBwYXJ0ICsgJysnXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAga2V5ICs9IHNwbGl0W3NwbGl0Lmxlbmd0aCAtIDFdXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2VcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGtleSA9IGtleUNvZGVcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGtleVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogTWFrZSB0aGUgS2V5Q29kZSBwcmV0dHkgZm9yIHByaW50aW5nIG9uIHRoZSBtZW51XHJcbiAgICAgKiBAcGFyYW0ge0tleUNvZGV9IGtleUNvZGVcclxuICAgICAqIEByZXR1cm4ge3N0cmluZ31cclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKi9cclxuICAgIHN0YXRpYyBwcmV0dGlmeUtleShrZXlDb2RlKVxyXG4gICAge1xyXG4gICAgICAgIGtleUNvZGUgPSBBY2NlbGVyYXRvcnMucHJlcGFyZUtleShrZXlDb2RlKVxyXG4gICAgICAgIGxldCBrZXkgPSAnJ1xyXG4gICAgICAgIGlmIChrZXlDb2RlLmluZGV4T2YoJysnKSAhPT0gLTEpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBjb25zdCBzcGxpdCA9IGtleUNvZGUudG9Mb3dlckNhc2UoKS5zcGxpdCgnKycpXHJcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgc3BsaXQubGVuZ3RoIC0gMTsgaSsrKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBsZXQgbW9kaWZpZXIgPSBzcGxpdFtpXVxyXG4gICAgICAgICAgICAgICAga2V5ICs9IG1vZGlmaWVyWzBdLnRvVXBwZXJDYXNlKCkgKyBtb2RpZmllci5zdWJzdHIoMSkgKyAnKydcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBrZXkgKz0gc3BsaXRbc3BsaXQubGVuZ3RoIC0gMV0udG9VcHBlckNhc2UoKVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBrZXkgPSBrZXlDb2RlLnRvVXBwZXJDYXNlKClcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGtleVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogcmVnaXN0ZXIgYSBrZXkgYXMgYSBnbG9iYWwgYWNjZWxlcmF0b3JcclxuICAgICAqIEBwYXJhbSB7S2V5Q29kZXN9IGtleUNvZGUgKGUuZy4sIEN0cmwrc2hpZnQrRSlcclxuICAgICAqIEBwYXJhbSB7ZnVuY3Rpb259IGNhbGxiYWNrXHJcbiAgICAgKi9cclxuICAgIHJlZ2lzdGVyKGtleUNvZGUsIGNhbGxiYWNrKVxyXG4gICAge1xyXG4gICAgICAgIHRoaXMua2V5c1tBY2NlbGVyYXRvcnMucHJlcGFyZUtleShrZXlDb2RlKV0gPSBjYWxsYmFja1xyXG4gICAgfVxyXG5cclxuICAgIGtleURvd24oYWNjZWxlcmF0b3IsIGUpXHJcbiAgICB7XHJcbiAgICAgICAgY29uc3QgbW9kaWZpZXJzID0gW11cclxuICAgICAgICBpZiAoZS5hbHRLZXkpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBtb2RpZmllcnMucHVzaCgnYWx0JylcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGUuY3RybEtleSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIG1vZGlmaWVycy5wdXNoKCdjdHJsJylcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGUubWV0YUtleSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIG1vZGlmaWVycy5wdXNoKCdtZXRhJylcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGUuc2hpZnRLZXkpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBtb2RpZmllcnMucHVzaCgnc2hpZnQnKVxyXG4gICAgICAgIH1cclxuICAgICAgICBsZXQga2V5Q29kZSA9ICcnXHJcbiAgICAgICAgZm9yIChsZXQgbW9kaWZpZXIgb2YgbW9kaWZpZXJzKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAga2V5Q29kZSA9IG1vZGlmaWVyICsgJysnXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGxldCB0cmFuc2xhdGUgPSBlLmNvZGUudG9Mb3dlckNhc2UoKVxyXG4gICAgICAgIHRyYW5zbGF0ZSA9IHRyYW5zbGF0ZS5yZXBsYWNlKCdkaWdpdCcsICcnKVxyXG4gICAgICAgIHRyYW5zbGF0ZSA9IHRyYW5zbGF0ZS5yZXBsYWNlKCdrZXknLCAnJylcclxuICAgICAgICBrZXlDb2RlICs9IHRyYW5zbGF0ZVxyXG4gICAgICAgIGlmICh0aGlzLm1lbnVLZXlzW2tleUNvZGVdKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5tZW51S2V5c1trZXlDb2RlXShlLCB0aGlzKVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmICh0aGlzLmtleXNba2V5Q29kZV0pXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLmtleXNba2V5Q29kZV0oZSwgdGhpcylcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gQWNjZWxlcmF0b3JzIl19