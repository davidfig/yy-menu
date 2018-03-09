const Styles =   require('./styles')
const MenuItem = require('./menuItem')
const Accelerators = require('./accelerators')
const html = require('./html')

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

    hide()
    {
        this.menu.showAccelerators()
        let current = this.menu.showing
        while (current && current.submenu)
        {
            current.div.style.backgroundColor = 'transparent'
            current.submenu.div.remove()
            let next = current.submenu.showing
            if (next)
            {
                current.submenu.showing.div.style.backgroundColor = 'transparent'
                current.submenu.showing = null
            }
            current = next
        }
        this.menu.showing = null
        this.div.remove()
    }

    show(menuItem)
    {
        if (this.menu && this.menu.showing === menuItem)
        {
            this.hide()
        }
        else
        {
            if (this.menu)
            {
                if (this.menu.showing && this.menu.children.indexOf(menuItem) !== -1)
                {
                    let current = this.menu.showing
                    current.div.style.backgroundColor = 'transparent'
                    while (current && current.submenu)
                    {
                        current.submenu.div.remove()
                        let next = current.submenu.showing
                        if (next)
                        {
                            current.submenu.showing.div.style.backgroundColor = 'transparent'
                            current.submenu.showing = false
                        }
                        current = next
                    }
                }
                this.menu.showing = menuItem
                this.menu.hideAccelerators()
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
            this.attached = menuItem
            this.getApplicationDiv().appendChild(this.div)
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
            if (this.div.offsetLeft + this.div.offsetWidth > window.innerWidth)
            {
                this.div.style.left = window.innerWidth - this.div.offsetWidth + 'px'
            }
            if (this.div.offsetTop + this.div.offsetHeight > window.innerHeight)
            {
                this.div.style.top = window.innerHeight - this.div.offsetHeight + 'px'
            }
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

    closeAll()
    {
        if (this.showing)
        {
            let menu = this
            while (menu.showing)
            {
                menu = menu.showing.submenu
            }
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
    }

    getApplicationDiv()
    {
        let menu = this.menu
        while (menu && !menu.applicationMenu)
        {
            menu = menu.menu
        }
        return menu.application
    }

    static SetApplicationMenu(menu)
    {
        menu.application = html({ parent: document.body, styles: Styles.ApplicationContainer })
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
        menu.div.tabIndex = -1
        menu.application.appendChild(menu.div)
        menu.applicationMenu = true
        menu.div.addEventListener('blur', () => menu.closeAll())
    }
}

Menu.MenuItem = MenuItem

module.exports = Menu