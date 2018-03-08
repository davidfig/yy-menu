const clicked = require('clicked')
const html = require('./html')
const Styles = require('./styles')

class MenuItem
{
    /**
     * @param {object} options
     * @param {function} [options.click]
     * @param {string} [options.label]
     * @param {string} [options.type]
     * @param {object} [options.styles] additional CSS styles to apply to this MenuItem
     * @param {string} [options.accelerator] see https://electronjs.org/docs/api/accelerator
     * @param {MenuItem} [options.submenu] attach a submenu
     * @param {boolean} [options.checked]
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
            this.createChecked(options.checked)
            this.text = options.label || '&nbsp;&nbsp;&nbsp;'
            this.createShortcut(this.text)
            this.createAccelerator(options.accelerator)
            this.createSubmenu(options.submenu)
            if (options.submenu)
            {
                this.submenu = options.submenu
                this.submenu.applyStyles(Styles.MenuStyle)
            }
            this.applyStyles(Styles.RowStyle)
            clicked(this.div, (e) => this.handleClick(e))
            this.div.addEventListener('mouseenter', () =>
            {
                if (!this.submenu || !this.submenu.showing)
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
            })
            this.div.addEventListener('mouseleave', () =>
            {
                if (!this.submenu || !this.submenu.showing)
                {
                    if (this.submenuTimeout)
                    {
                        clearTimeout(this.submenuInterval)
                        this.submenuTimeout = null
                    }
                    this.div.style.backgroundColor = 'transparent'
                }
            })
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

    createShortcut()
    {
        this.label = html({ parent: this.div })
        this.showShortcut()
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
                        html({ parent: this.label, type: 'span', html: text[i], styles: { textDecoration: 'underline' } })
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

    hideShortcut()
    {
        if (this.type !== 'separator')
        {
            const text = this.text.replace('&', '')
            this.label.innerHTML = text
        }
    }

    createAccelerator(accelerator)
    {
        this.accelerator = html({ parent: this.div, html: accelerator ? accelerator :  '', styles: Styles.Accelerator})
    }

    createSubmenu(submenu)
    {
        this.arrow = html({ parent: this.div, html: submenu ? '&#9658;' : '' })
    }

    handleClick(e)
    {
        if (this.submenu)
        {
            this.submenu.show(this)
            this.div.style.backgroundColor = this.submenu.showing ? Styles.SelectedBackground : 'transparent'
        }
        if (this.click)
        {
            this.click(e, this)
        }
    }
}

module.exports = MenuItem