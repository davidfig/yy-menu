const html = require('./html')
const Config = require('./config')
const localAccelerator = require('./localAccelerator')

class MenuItem
{
    /**
     * @param {object} options
     * @param {string} [options.label] label for menu entry may include accelerator by placing & before letter)
     * @param {string} [options.type] separator, checkbox, or undefined
     * @param {object} [options.styles] additional CSS styles to apply to this MenuItem
     * @param {string} [options.accelerator] see Accelerator for inputs (e.g., ctrl+shift+A)
     * @param {MenuItem} [options.submenu] attaches a submenu (and changes type to submenu)
     * @param {boolean} [options.checked] check the checkbox
     */
    constructor(options)
    {
        localAccelerator.init()
        options = options || {}
        this.styles = options.styles
        this.div = html()
        this.type = options.type
        this.click = options.click
        if (this.type === 'separator')
        {
            this.applyConfig(Config.SeparatorStyle)
        }
        else
        {
            this._checked = options.checked
            this.createChecked(options.checked)
            this.text = options.label || '&nbsp;&nbsp;&nbsp;'
            this.createShortcut()
            this.createAccelerator(options.accelerator)
            this.createSubmenu(options.submenu)
            if (options.submenu)
            {
                this.submenu = options.submenu
                this.submenu.applyConfig(Config.MenuStyle)
            }
            this.applyConfig(Config.RowStyle)
            this.div.addEventListener('mousedown', (e) => this.handleClick(e))
            this.div.addEventListener('touchstart', (e) => this.handleClick(e))
            this.div.addEventListener('mouseenter', () => this.mouseenter())
            this.div.addEventListener('mouseleave', () => this.mouseleave())
        }
    }

    /**
     * The click callback
     * @callback MenuItem~ClickCallback
     * @param {InputEvent} e
     */

    mouseenter()
    {
        if (!this.submenu || this.menu.showing !== this )
        {
            this.div.style.backgroundColor = Config.SelectedBackgroundStyle
            if (this.submenu && !this.menu.applicationMenu)
            {
                this.submenuTimeout = setTimeout(() =>
                {
                    this.submenuTimeout = null
                    this.submenu.show(this)
                }, Config.SubmenuOpenDelay)
            }
        }
    }

    mouseleave()
    {
        if (!this.submenu || this.menu.showing !== this)
        {
            if (this.submenuTimeout)
            {
                clearTimeout(this.submenuTimeout)
                this.submenuTimeout = null
            }
            this.div.style.backgroundColor = 'transparent'
        }
    }

    applyConfig(base)
    {
        const styles = {}
        for (let style in base)
        {
            styles[style] = base[style]
        }
        if (this.styles)
        {
            for (let style in this.styles)
            {
                styles[style] = this.styles[style]
            }
        }
        for (let style in styles)
        {
            this.div.style[style] = styles[style]
        }
    }

    createChecked(checked)
    {
        this.check = html({ parent: this.div, html: checked ? '&#10004;' : '' })
    }

    createShortcut()
    {
        if (this.type !== 'separator')
        {
            const text = this.text
            this.label = html({ parent: this.div })
            let current = html({ parent: this.label, type: 'span' })
            if (text.indexOf('&') !== -1)
            {
                let i = 0
                do
                {
                    const letter = text[i]
                    if (letter === '&')
                    {
                        i++
                        this.shortcutSpan = html({ parent: this.label, type: 'span', html: text[i], styles: Config.AcceleratorKeyStyle })
                        current = html({ parent: this.label, type: 'span' })
                    }
                    else
                    {
                        current.innerHTML += letter
                    }
                    i++
                }
                while (i < text.length)
            }
            else
            {
                this.label.innerHTML = text
            }
        }
    }

    showShortcut()
    {
        if (this.shortcutSpan)
        {
            this.shortcutSpan.style.textDecoration = 'underline'
        }
    }

    hideShortcut()
    {
        if (this.shortcutSpan)
        {
            this.shortcutSpan.style.textDecoration = 'none'
        }
    }

    createAccelerator(accelerator)
    {
        this.accelerator = html({ parent: this.div, html: accelerator ? localAccelerator.prettifyKey(accelerator) : '', styles: Config.AcceleratorStyle })
        if (accelerator)
        {
            localAccelerator.register(accelerator, (e) => this.click(e))
        }
    }

    createSubmenu(submenu)
    {
        this.arrow = html({ parent: this.div, html: submenu ? '&#9658;' : '' })
    }

    closeAll()
    {
        let menu = this.menu
        localAccelerator.unregisterMenuShortcuts()
        while (menu && !menu.applicationMenu)
        {
            if (menu.showing)
            {
                menu.showing.div.style.backgroundColor = 'transparent'
                menu.showing = null
            }
            menu.div.remove()
            menu = menu.menu
        }
        if (menu.showing)
        {
            menu.showing.div.style.background = 'transparent'
            menu.showing = null
            menu.showAccelerators()
        }
    }

    handleClick(e)
    {
        if (this.submenu)
        {
            if (this.submenuTimeout)
            {
                clearTimeout(this.submenuTimeout)
                this.submenuTimeout = null
            }
            this.submenu.show(this)
            this.div.style.backgroundColor = Config.SelectedBackgroundStyle
        }
        else if (this.type === 'checkbox')
        {
            this.checked = !this.checked
            this.closeAll()
        }
        else
        {
            this.closeAll()
        }

        if (this.click)
        {
            this.click(e, this)
        }
    }

    get checked()
    {
        return this._checked
    }
    set checked(value)
    {
        this._checked = value
        this.check.innerHTML = this._checked ? '&#10004;' : ''
    }
}

module.exports = MenuItem