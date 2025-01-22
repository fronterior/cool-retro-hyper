if (globalThis.document) {
  const link = Object.assign(document.createElement('link'), {
    rel: 'stylesheet',
    href: `${__dirname}/index.css`,
  })

  document.head.append(link)
}

export * from './decorateHyper'
export * from './decorateMenu'
