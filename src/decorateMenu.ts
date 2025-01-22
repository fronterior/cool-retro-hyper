import type { BrowserWindow, MenuItem } from 'electron'

export function decorateMenu(menu: MenuItem[]) {
  return menu.map((menuItem) => {
    if (menuItem.label !== 'View') {
      return menuItem
    }

    const menuItems = {
      ...menuItem,
      submenu: [
        ...(menuItem.submenu ?? []),
        { type: 'separator' },
        {
          label: 'CRH Configuration',
          type: 'normal',
          click(_, focusedWindow: BrowserWindow) {
            // The `focusedWindow` is assigned only when an Electron.BrowserWindow is focused.
            // Note: If the DevTools is focused, the `emit` will not be triggered.
            focusedWindow?.rpc.emit('crh:open-configuration')
          },
        },
      ],
    }

    return menuItems
  })
}
