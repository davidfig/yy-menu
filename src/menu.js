const Styles =   require('./styles')
const MenuItem = require('./menuItem')
const Accelerators = require('./accelerators')
const html = require('./html')

let _accelerator, _application

class Menu
{
    /**
     * creates a menu bar
     * @param {object} [options]
     * @param {object} [options.styles] additional CSS styles for menu
     */
    constructor(options)
    {
        options = options || {}
        this.div = document.createElement('div')
        this.styles = options.styles
        this.children = []
        this.applyStyles(Styles.MenuStyle)
    }

    /**
     * append a MenuItem to the Menu
     * @param {MenuItem} menuItem
     */
    append(menuItem)
    {
        if (menuItem.submenu)
        {
            menuItem.submenu.menu = this
        }
        menuItem.menu = this
        this.div.appendChild(menuItem.div)
        if (menuItem.type !== 'separator')
        {
            this.children.push(menuItem)
        }
    }

    /**
     * inserts a MenuItem into the Menu
     * @param {number} pos
     * @param {MenuItem} menuItem
     */
    insert(pos, menuItem)
    {
        if (pos >= this.div.childNodes.length)
        {
            this.append(menuItem)
        }
        else
        {
            if (menuItem.submenu)
            {
                menuItem.submenu.menu = this
            }
            menuItem.menu = this
            this.div.insertBefore(menuItem.div, this.div.childNodes[pos])
            if (menuItem.type !== 'separator')
            {
                this.children.splice(pos, 0, menuItem)
            }
        }
    }

    hide()
    {
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
    }

    show(menuItem)
    {
        Menu.GlobalAccelarator.unregisterMenuShortcuts()
        if (this.menu && this.menu.showing === menuItem)
        {
            this.hide()
            this.menu.showing = null
            this.div.remove()
            this.menu.showAccelerators()
        }
        else
        {
            if (this.menu)
            {
                if (this.menu.showing && this.menu.children.indexOf(menuItem) !== -1)
                {
                    this.hide()
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
            this.showAccelerators()
            this.getApplicationDiv().appendChild(this.div)
            let label = 0, accelerator = 0, arrow = 0, checked = 0
            for (let child of this.children)
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
            for (let child of this.children)
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
            for (let child of this.children)
            {
                child.check.style.width = checked + 'px'
                child.label.style.width = label + 'px'
                child.accelerator.style.width = accelerator + 'px'
                child.arrow.style.width = arrow + 'px'
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
            if (child.type !== 'separator')
            {
                const index = child.text.indexOf('&')
                if (index !== -1)
                {
                    Menu.GlobalAccelarator.registerMenuShortcut(child.text[index + 1], child)
                }
            }
        }
        if (!this.applicationMenu)
        {
            Menu.GlobalAccelarator.registerMenuSpecial(this)
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
        return _application
    }

    /**
     * move to the next child pane
     * @param {string} direction (left or right)
     * @private
     */
    moveChild(direction)
    {
        const parent = this.selector.menu.menu
        let index = parent.children.indexOf(parent.showing)
        if (direction === 'left')
        {
            index--
            index = (index < 0) ? parent.children.length - 1 : index
        }
        else
        {
            index++
            index = (index === parent.children.length) ? 0 : index
        }
        parent.children[index].handleClick({})
        this.selector = null
    }

    /**
     * move if selector exists
     * @param {MouseEvent} e
     * @param {string} direction
     * @private
     */
    moveSelector(e, direction)
    {
        this.selector.div.style.backgroundColor = 'transparent'
        let index = this.children.indexOf(this.selector)
        if (direction === 'down' || direction === 'up')
        {
            if (direction === 'down')
            {
                index++
                index = (index === this.children.length) ? 0 : index
            }
            else
            {
                index--
                index = (index < 0) ? this.children.length - 1 : index
            }
            this.selector = this.children[index]
        }
        else
        {
            if (direction === 'right')
            {
                if (this.selector.submenu)
                {
                    this.selector.handleClick(e)
                    this.selector = null
                }
                else
                {
                    this.moveChild(direction)
                }
            }
            else if (direction === 'left')
            {
                if (!this.selector.menu.menu.applicationMenu)
                {
                    this.selector.menu.attached.handleClick(e)
                    this.selector.menu.menu.selector = this.selector.menu.attached
                    this.selector = null
                }
                else
                {
                    this.moveChild(direction)
                }
            }
            e.preventDefault()
            return true
        }
    }

    /**
     * move the selector in the menu
     * @param {KeyboardEvent} e
     * @param {string} direction (left, right, up, down)
     * @private
     */
    move(e, direction)
    {
        if (this.selector)
        {
            if (this.moveSelector(e, direction))
            {
                return
            }
        }
        else
        {
            if (direction === 'up')
            {
                this.selector = this.children[this.children.length - 1]
            }
            else
            {
                this.selector = this.children[0]
            }
        }
        this.selector.div.style.backgroundColor = Styles.SelectedBackground
        e.preventDefault()
        e.stopPropagation()
    }

    /**
     * click the selector with keyboard
     * @private
     */
    enter(e)
    {
        if (this.selector)
        {
            this.selector.handleClick(e)
        }
    }

    /**
     * array containing the menu's items
     * @property {MenuItems[]} items
     * @readonly
     */
    get items()
    {
        return this.children
    }

    /**
     * gets active application Menu
     * @return {Menu}
     */
    static getApplicationMenu()
    {
        return _application.menu
    }

    /**
     * sets active application Menu (and removes any existing application menus)
     * @param {Menu} menu
     */
    static setApplicationMenu(menu)
    {
        if (_application)
        {
            _application.remove()
        }
        _application = html({ parent: document.body, styles: Styles.ApplicationContainer })
        _application.menu = menu
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
        _application.appendChild(menu.div)
        menu.applicationMenu = true
        menu.div.addEventListener('blur', () => menu.closeAll())
        menu.showAccelerators()
    }

    /**
     * GlobalAccelerator used by menu and provides a way to register keyboard accelerators throughout the application
     * @typedef {Accelerator}
     */
    static get GlobalAccelarator()
    {
        if (!_accelerator)
        {
            _accelerator = new Accelerators({ div: document.body })
        }
        return _accelerator
    }
}

Menu.MenuItem = MenuItem

module.exports = Menu