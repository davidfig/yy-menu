const clicked = require('clicked')
const html = require('./html')
const Styles = require('./styles')
const Accelerators = require('./accelerators')

class MenuItem
{
    /**
     * @param {object} options
     * @param {ClickCallback} [options.click] callback when MenuItem is clicked
     * @param {string} [options.label] label for menu entry (may include accelerator by placing & before letter)
     * @param {string} [options.type] separator, checkbox, or undefined
     * @param {object} [options.styles] additional CSS styles to apply to this MenuItem
     * @param {string} [options.accelerator] see Accelerator for inputs (e.g., ctrl+shift+A)
     * @param {MenuItem} [options.submenu] attaches a submenu (and changes type to submenu)
     * @param {boolean} [options.checked] check the checkbox
     */
    constructor(options)
    {
        options = options || {}
        this.styles = options.styles
        this.div = html()
        this.type = options.type
        this.click = options.click
        if (this.type === 'separator')
        {
            this.applyStyles(Styles.Separator)
        }
        else
        {
            this.checked = options.checked
            this.createChecked(options.checked)
            this.text = options.label || '&nbsp;&nbsp;&nbsp;'
            this.label = html({ parent: this.div })
            this.createAccelerator(options.accelerator)
            this.createSubmenu(options.submenu)
            if (options.submenu)
            {
                this.submenu = options.submenu
                this.submenu.applyStyles(Styles.MenuStyle)
            }
            this.applyStyles(Styles.RowStyle)
            clicked(this.div, (e) => this.handleClick(e))
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
            this.div.style.backgroundColor = Styles.SelectedBackground
            if (this.submenu && !this.menu.applicationMenu)
            {
                this.submenuTimeout = setTimeout(() =>
                {
                    this.submenuTimeout = null
                    this.submenu.show(this)
                }, Styles.SubmenuOpenDelay)
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

    applyStyles(base)
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

    showShortcut()
    {
        if (this.type !== 'separator')
        {
            this.label.innerHTML = ''
            const text = this.text
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
                        html({ parent: this.label, type: 'span', html: text[i], styles: Styles.AcceleratorKey })
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
            this.shortcutAvailable = true
        }
    }

    hideShortcut()
    {
        if (this.type !== 'separator')
        {
            const text = this.text.replace('&', '')
            this.label.innerHTML = text
            this.shortcutAvailable = true
        }
    }

    createAccelerator(accelerator)
    {
        this.accelerator = html({ parent: this.div, html: accelerator ? Accelerators.prettifyKey(accelerator) :  '', styles: Styles.Accelerator})
    }

    createSubmenu(submenu)
    {
        this.arrow = html({ parent: this.div, html: submenu ? '&#9658;' : '' })
    }

    closeAll()
    {
        let menu = this.menu
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
        if (menu)
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
            this.div.style.backgroundColor = Styles.SelectedBackground
        }
        else if (this.type === 'checkbox')
        {
            this.checked = !this.checked
            this.check.innerHTML = this.checked ? '&#10004;' : ''
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
}

module.exports = MenuItem