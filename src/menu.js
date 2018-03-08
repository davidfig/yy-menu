const Styles =   require('./styles')
const MenuItem = require('./menuItem')
const Accelerators = require('./accelerators')

class Menu
{
    /**
     * creates a menu bar
     * @param {object} [options]
     * @param {object} [options.styles] additional styles for menu
     */
    constructor(options)
    {
        options = options || {}
        this.div = document.createElement('div')
        this.styles = options.styles
        this.children = []
        this.applyStyles(Styles.MenuStyle)
    }

    append(menuItem)
    {
        if (menuItem.submenu)
        {
            menuItem.submenu.menu = this
        }
        menuItem.menu = this
        this.div.appendChild(menuItem.div)
        this.children.push(menuItem)
    }

    show(menuItem)
    {
        if (this.showing)
        {
            if (this.menu)
            {
                this.menu.showAccelerators()
                if (this.menu.showing && this.menu.children.indexOf(menuItem) !== -1)
                {
                    let current = this.menu.showing
                    if (current.menu.applicationMenu)
                    {
                        current.div.style.backgroundColor = 'transparent'
                    }
                    while (current && current.submenu)
                    {
                        current.submenu.div.remove()
                        let next = current.submenu.showing
                        current.submenu.showing = false
                        current = next
                    }
                }
            }
            this.div.remove()
            this.showing = false
        }
        else
        {
            if (this.menu)
            {
                if (this.menu.showing && this.menu.children.indexOf(menuItem) !== -1)
                {
                    let current = this.menu.showing
                    if (current.menu.applicationMenu)
                    {
                        current.div.style.backgroundColor = 'transparent'
                    }
                    while (current && current.submenu)
                    {
                        current.submenu.div.remove()
                        let next = current.submenu.showing
                        current.submenu.showing = false
                        current = next
                    }
                }
                this.menu.hideAccelerators()
                this.menu.showing = menuItem
            }
            const div = menuItem.div
            const parent = this.menu.div
            if (this.menu.applicationMenu)
            {
                this.div.style.left = div.offsetLeft + 'px'
                this.div.style.top = div.offsetTop + div.offsetHeight + 'px'
            }
            else
            {
                this.div.style.left = parent.offsetLeft + parent.offsetWidth - Styles.Overlap + 'px'
                this.div.style.top = parent.offsetTop + div.offsetTop - Styles.Overlap + 'px'
            }
            document.body.appendChild(this.div)
            let label = 0, accelerator = 0, arrow = 0, checked = 0
            for (let child of this.children)
            {
                if (child.type !== 'separator')
                {
                    child.check.style.width = 'auto'
                    child.label.style.width = 'auto'
                    child.accelerator.style.width = 'auto'
                    child.arrow.style.width = 'auto'
                    if (child.type === 'checkbox')
                    {
                        checked = Styles.MinimumColumnWidth
                    }
                    if (child.submenu)
                    {
                        arrow = Styles.MinimumColumnWidth
                    }
                }
            }
            for (let child of this.children)
            {
                if (child.type !== 'separator')
                {
                    const childLabel = child.label.offsetWidth * 2
                    label = childLabel > label ? childLabel : label
                    const childAccelerator = child.accelerator.offsetWidth
                    accelerator = childAccelerator > accelerator ? childAccelerator : accelerator
                    if (child.submenu)
                    {
                        arrow = child.arrow.offsetWidth
                    }
                }
            }
            for (let child of this.children)
            {
                if (child.type !== 'separator')
                {
                    child.check.style.width = checked + 'px'
                    child.label.style.width = label + 'px'
                    child.accelerator.style.width = accelerator + 'px'
                    child.arrow.style.width = arrow + 'px'
                }
            }
        }
    }

    hide()
    {
        if (!this.applicationMenu)
        {
            this.showing = false
            this.div.remove()
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

    showAccelerators()
    {
        for (let child of this.children)
        {
            child.showShortcut()
        }
    }

    hideAccelerators()
    {
        for (let child of this.children)
        {
            child.hideShortcut()
        }
    }

    static SetApplicationMenu(menu)
    {
        menu.applyStyles(Styles.ApplicationMenuStyle)
        for (let child of menu.children)
        {
            child.applyStyles(Styles.ApplicationMenuRowStyle)
            if (child.arrow)
            {
                child.arrow.style.display = 'none'
            }
            menu.div.appendChild(child.div)
        }
        document.body.appendChild(menu.div)
        menu.applicationMenu = true
    }
}

Menu.MenuItem = MenuItem

module.exports = Menu