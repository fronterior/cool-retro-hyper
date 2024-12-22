# Cool Retro Hyper

<p align="center">
    <img src="https://raw.githubusercontent.com/lowfront/cool-retro-hyper/refs/heads/main/logo.png?token=GHSAT0AAAAAAC253LJZBTWLTRGEO3DI6OAOZ3ILVIA" alt="Cool Retro Hyper Logo" style="width: 100px">
</p>

A Hyper plugin inspired by [cool-retro-term](https://github.com/Swordfish90/cool-retro-term).
It uses the retro preset from the [hyper-postprocessing](https://github.com/slammayjammay/hyper-postprocessing/blob/198f4271fc97fdd7b79473cd0f4a922b5695af68/examples/effects/retro/index.js) plugin to replicate the CRT monitor effect of cool-retro-term.

## Installation

```
hyper i cool-retro-hyper
```

## Cautions

This app does not support split screen and tabbing in Hyper Terminal. If you need these features, please use a multiplexer like [tmux](https://github.com/tmux/tmux) or [zellij](https://github.com/zellij-org/zellij).

## Demo

## Configuration

Configuration values can be omitted, and can input only the necessary values to use.
The following are the default settings configurable in the plugin.

```js
// ~/.hyper.js

module.exports = {
  config: {
    ...
    coolRetroHyper: {
      crt: {
        burnInTime: 0.4,
        boom: 3, // Warning: if this value is exceeded, the screen will not be rendered: 0 ~ 6
        jitter: 0.4,
        screenCurvature: 0.1,
        noise: 0.5,
        glowingLine: 0.75,
        flickering: 0.2,
        ambientLight: 0.5,
        pixelHeight: 6.0,
        pixelization: false,
        rgbSplit: 0.25,
        rgbSplitXDistance: 0.13,
        rgbSplitYDistance: 0.08,
      },
      shaderPaths: [
        // glsl file paths
      ],
    },
    ...
  },
}
```

### shaderPaths

You can input a GLSL file to use as the background. You can provide the input either relative to the home directory or as an absolute path, as shown below.

```js
{
  shaderPaths: ['~/some.glsl']
}
```

The GLSL file is loaded through the postprocessing package, and the mainImage function has the following interface.

```glsl
void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 fragColor) {
  ...
}
```

The available uniforms are as follows.

- time
- resolution
- PI

### Shadertoy GLSL

To make the Shadertoy code easier to use, if a comment contains @shadertoy, it will load the GLSL of the Shadertoy interface.

```
// @shadertoy
```

For example, clone this repository into your home directory and configure it as follows

```js
{
  shaderPaths: ['~/cool-retro-hyper/examples/in-space.glsl']
}
```

⚠️ Note: Currently, only iTime and iResolution are supported. Other uniforms require manual code conversion.
