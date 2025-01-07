import { Terminal } from 'https://cdn.jsdelivr.net/npm/@xterm/xterm@5.5.0/+esm'
import { WebglAddon } from 'https://cdn.jsdelivr.net/npm/@xterm/addon-webgl@0.18.0/+esm'

var term = new Terminal()
term.open(document.getElementById('terminal'))
term.loadAddon(new WebglAddon())
term.write('\x1B[1;3;31mCRH\x1B[0m $ ')
