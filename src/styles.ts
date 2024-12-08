// FIXME: add README.md
export const init = () => {
  const css = `
.terms_terms.terms_termsNotShifted {
  margin-top: 0 !important;
}

.terminal.xterm {
  height: 100%;
}

.term_fit.term_active {
  padding: 0 !important;
}
`.trim()

  const style = Object.assign(document.createElement('style'), {
    innerHTML: css,
  })

  console.log(style)

  document.body.append(style)
}
