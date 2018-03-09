class Accelerators
{
    /**
     * Handles all keyboard input for the menu and user-registered keys registered through Menu.GlobalAccelerator
     * @param {object} options
     * @param {HTMLElement} [options.div] used for global accelerators (usually attached to document.body)
     * @param {Menu} [options.menu] Menu to attach accelerators
     */
    constructor(options)
    {
        this.menuKeys = {}
        this.keys = {}
        if (options.div)
        {
            options.div.addEventListener('keydown', (e) => this.keyDown(this, e))
        }
        else
        {
            options.menu.div.addEventListener('keydown', (e) => this.keyDown(this, e))
        }
    }

    /**
     * Register a shortcut key for use by an open menu
     * @param {KeyCodes} letter
     * @param {MenuItem} menuItem
     * @param {boolean} applicationMenu
     * @private
     */
    registerMenuShortcut(letter, menuItem)
    {
        if (letter)
        {
            const keyCode = (menuItem.menu.applicationMenu ? 'alt+' : '') + letter
            this.menuKeys[Accelerators.prepareKey(keyCode)] = (e) =>
            {
                menuItem.handleClick(e)
                e.stopPropagation()
                e.preventDefault()
            }
        }
    }

    /**
     * Register special shortcut keys for menu
     * @param {MenuItem} menuItem
     * @private
     */
    registerMenuSpecial(menu)
    {
        this.menuKeys['escape'] = () => menu.getApplicationMenu().closeAll()
        this.menuKeys['enter'] = (e) => menu.enter(e)
        this.menuKeys['arrowright'] = (e) => menu.move(e, 'right')
        this.menuKeys['arrowleft'] = (e) => menu.move(e, 'left')
        this.menuKeys['arrowup'] = (e) => menu.move(e, 'up')
        this.menuKeys['arrowdown'] = (e) => menu.move(e, 'down')
    }

    /**
     * Removes menu shortcuts
     * @private
     */
    unregisterMenuShortcuts()
    {
        this.menuKeys = {}
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
    static prepareKey(keyCode)
    {
        let modifiers = []
        let key = ''
        keyCode = keyCode.toLowerCase()
        if (keyCode.indexOf('+') !== -1)
        {
            const split = keyCode.toLowerCase().split('+')
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
            key = keyCode
        }
        return key
    }

    /**
     * Make the KeyCode pretty for printing on the menu
     * @param {KeyCode} keyCode
     * @return {string}
     * @private
     */
    static prettifyKey(keyCode)
    {
        keyCode = Accelerators.prepareKey(keyCode)
        let key = ''
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
        return key
    }

    /**
     * register a key as a global accelerator
     * @param {KeyCodes} keyCode (e.g., Ctrl+shift+E)
     * @param {function} callback
     */
    register(keyCode, callback)
    {
        this.keys[Accelerators.prepareKey(keyCode)] = callback
    }

    keyDown(accelerator, e)
    {
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
            keyCode = modifier + '+'
        }
        let translate = e.code.toLowerCase()
        translate = translate.replace('digit', '')
        translate = translate.replace('key', '')
        keyCode += translate
        if (this.menuKeys[keyCode])
        {
            this.menuKeys[keyCode](e, this)
        }
        else if (this.keys[keyCode])
        {
            this.keys[keyCode](e, this)
        }
    }
}

module.exports = Accelerators