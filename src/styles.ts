export const init = () => {
  const css = `
.hyper_main {
  z-index: 1;
}

.header_header {
  opacity: 0;
}

.terms_terms.terms_termsNotShifted {
  margin-top: 0 !important;
}

.terminal.xterm {
  height: 100%;
}

.term_fit {
  padding: 0 !important;
}

.xterm-viewport {
  opacity: 0;
}

canvas.cool-retro-hyper {
  position: absolute;
  top: 0;
  left: 0;
  width: 100% !important;
  height: 100% !important;
  z-index: 1;
  cursor: text;
}
`.trim()

  const style = Object.assign(document.createElement('style'), {
    innerHTML: css,
  })

  document.head.append(style)
}
