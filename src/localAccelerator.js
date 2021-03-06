/**
 * Handles all keyboard input for the menu and user-registered keys
 */
const LocalAccelerator = {

    init: function()
    {
        if (!LocalAccelerator.menuKeys)
        {
            LocalAccelerator.menuKeys = {}
            LocalAccelerator.keys = {}
            document.body.addEventListener('keydown', (e) => LocalAccelerator.keydown(LocalAccelerator, e))
            document.body.addEventListener('keyup', (e) => LocalAccelerator.keyup(LocalAccelerator, e))
        }
    },

    /**
     * clear all user-registered keys
     */
    clearKeys: function()
    {
        LocalAccelerator.keys = {}
    },

    /**
     * Register a shortcut key for use by an open menu
     * @param {KeyCodes} letter
     * @param {MenuItem} menuItem
     * @param {boolean} applicationMenu
     * @private
     */
    registerMenuShortcut: function(letter, menuItem)
    {
        if (letter)
        {
            const keyCode = (menuItem.menu.applicationMenu ? 'alt+' : '') + letter
            LocalAccelerator.menuKeys[LocalAccelerator.prepareKey(keyCode)] = (e) =>
            {
                menuItem.handleClick(e)
                e.stopPropagation()
                e.preventDefault()
            }
        }
    },

    /**
     * Register special shortcut keys for menu
     * @param {MenuItem} menuItem
     * @private
     */
    registerMenuSpecial: function(menu)
    {
        LocalAccelerator.menuKeys['escape'] = () => menu.closeAll()
        LocalAccelerator.menuKeys['enter'] = (e) => menu.enter(e)
        LocalAccelerator.menuKeys['space'] = (e) => menu.enter(e)
        LocalAccelerator.menuKeys['arrowright'] = (e) => menu.move(e, 'right')
        LocalAccelerator.menuKeys['arrowleft'] = (e) => menu.move(e, 'left')
        LocalAccelerator.menuKeys['arrowup'] = (e) => menu.move(e, 'up')
        LocalAccelerator.menuKeys['arrowdown'] = (e) => menu.move(e, 'down')
    },

    /**
     * special key registration for alt
     * @param {function} pressed
     * @param {function} released
     * @private
     */
    registerAlt: function (pressed, released)
    {
        LocalAccelerator.alt = { pressed, released }
    },

    /**
     * Removes menu shortcuts
     * @private
     */
    unregisterMenuShortcuts: function()
    {
        LocalAccelerator.menuKeys = {}
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
    prepareKey: function(keyCode)
    {
        const keys = []
        let split
        keyCode += ''
        if (keyCode.length > 1 && keyCode.indexOf('|') !== -1)
        {
            split = keyCode.split('|')
        }
        else
        {
            split = [keyCode]
        }
        for (let code of split)
        {
            let key = ''
            let modifiers = []
            code = code.toLowerCase().replace(' ', '')
            if (code.indexOf('+') !== -1)
            {
                const split = code.split('+')
                for (let i = 0; i < split.length - 1; i++)
                {
                    let modifier = split[i]
                    modifier = modifier.replace('commandorcontrol', 'ctrl')
                    modifier = modifier.replace('command', 'ctrl')
                    modifier = modifier.replace('control', 'ctrl')
                    modifiers.push(modifier)
                }
                modifiers = modifiers.sort((a, b) => { return a[0] > b[0] ? 1 : a[0] < b[0] ? -1 : 0 })
                for (let part of modifiers)
                {
                    key += part + '+'
                }
                key += split[split.length - 1]
            }
            else
            {
                key = code
            }
            keys.push(key)
        }
        return keys
    },

    /**
     * Make the KeyCode pretty for printing on the menu
     * @param {KeyCode} keyCode
     * @return {string}
     * @private
     */
    prettifyKey: function(keyCode)
    {
        let key = ''
        const codes = LocalAccelerator.prepareKey(keyCode)
        for (let i = 0; i < codes.length; i++)
        {
            const keyCode = codes[i]
            if (keyCode.indexOf('+') !== -1)
            {
                const split = keyCode.toLowerCase().split('+')
                for (let i = 0; i < split.length - 1; i++)
                {
                    let modifier = split[i]
                    key += modifier[0].toUpperCase() + modifier.substr(1) + '+'
                }
                key += split[split.length - 1].toUpperCase()
            }
            else
            {
                key = keyCode.toUpperCase()
            }
            if (i !== codes.length - 1)
            {
                key += ' or '
            }
        }
        return key
    },

    /**
     * register a key as a global accelerator
     * @param {KeyCodes} keyCode (e.g., Ctrl+shift+E)
     * @param {function} callback
     */
    register: function(keyCode, callback)
    {
        const keys = LocalAccelerator.prepareKey(keyCode)
        for (let key of keys)
        {
            LocalAccelerator.keys[key] = (e) =>
            {
                callback(e)
                e.preventDefault()
                e.stopPropagation()
            }
        }
    },

    keyup: function (accelerator, e)
    {
        if (LocalAccelerator.alt && (e.code === 'AltLeft' || e.code === 'AltRight'))
        {
            LocalAccelerator.alt.released()
            LocalAccelerator.alt.isPressed = false
        }
    },

    keydown: function(accelerator, e)
    {
        if (LocalAccelerator.alt && !LocalAccelerator.alt.isPressed && (e.code === 'AltLeft' || e.code === 'AltRight'))
        {
            LocalAccelerator.alt.pressed()
            LocalAccelerator.alt.isPressed = true
            e.preventDefault()
        }
        const modifiers = []
        if (e.altKey)
        {
            modifiers.push('alt')
        }
        if (e.ctrlKey)
        {
            modifiers.push('ctrl')
        }
        if (e.metaKey)
        {
            modifiers.push('meta')
        }
        if (e.shiftKey)
        {
            modifiers.push('shift')
        }
        let keyCode = ''
        for (let modifier of modifiers)
        {
            keyCode += modifier + '+'
        }
        let translate = e.code.toLowerCase()
        translate = translate.replace('digit', '')
        translate = translate.replace('key', '')
        keyCode += translate
        if (LocalAccelerator.menuKeys[keyCode])
        {
            LocalAccelerator.menuKeys[keyCode](e, LocalAccelerator)
        }
        else if (LocalAccelerator.keys[keyCode])
        {
            LocalAccelerator.keys[keyCode](e, LocalAccelerator)
        }
    }
}

module.exports = LocalAccelerator