# Cool Retro Hyper

<p align="center" style="margin: 64px 0;">
  <br><br><br>
  <img src="https://github.com/user-attachments/assets/dff75bc7-1457-47e4-82d7-865549c910a4" alt="Cool Retro Hyper Logo" style="width: 100px">
  <br><br><br><br>
</p>

A [Hyper](https://hyper.is) plugin inspired by [cool-retro-term](https://github.com/Swordfish90/cool-retro-term).
It uses the retro preset from the [hyper-postprocessing](https://github.com/slammayjammay/hyper-postprocessing/blob/198f4271fc97fdd7b79473cd0f4a922b5695af68/examples/effects/retro/index.js) plugin to replicate the CRT monitor effect of cool-retro-term.

![Cool Retro Hyper Screenshot](https://github.com/user-attachments/assets/e1f3a39e-99c1-4559-adb7-878e08529e09)
_screenshot with mrange's [Neonwave Sunset](https://www.shadertoy.com/view/7dtcRj) set as the background._

_It is currently available on macOS and Windows. It has not been tested on Linux yet._

## Installation

```
hyper i cool-retro-hyper
```

After installing the plugin using the above command, add the following to .hyper.js.

```js
// ~/.hyper.js

module.exports = {
  ...

  plugins: [
    'cool-retro-hyper'
  ],

  ...
}
```

⚡️ Sadly, I'm not sure if the development of Hyper Terminal is still ongoing, but [Hyper 4.0.0-canary.5](https://github.com/vercel/hyper/releases/tag/v4.0.0-canary.5) is quite usable. Compared to the current stable version 3.4.1, it has significantly improved rendering performance, and I haven't noticed any issues with parts of the screen being cut off. If you plan to use this plugin, I strongly recommend using version 4.0.0-canary.5.

## ⚠️ Cautions

- This app does not support split screen and tabbing in Hyper Terminal. If you need these features, please use a multiplexer like [tmux](https://github.com/tmux/tmux) or [zellij](https://github.com/zellij-org/zellij).
- 👀 Some properties of this plugin may not be easy on the eyes. Adjust the settings to avoid eye strain!

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
        bloom: 2, // Warning: if this value is exceeded, the screen will not be rendered: 0 ~ 5
        burnInTime: 0.4,
        jitter: 0.8,
        screenCurvature: 0.1,
        noise: 0.4,
        glowingLine: 0.75,
        flickering: 0.2,
        ambientLight: 0.5,
        pixelHeight: 6.0,
        pixelization: false,
        rgbSplit: 0.25,
        rgbSplitXDistance: 0.13,
        rgbSplitYDistance: 0.08,
        bazelSize: 0.12,
        frameColor: '#191919',
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

The GLSL file is loaded through the [postprocessing](https://www.npmjs.com/package/postprocessing) package, and the mainImage function has the following interface.

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

## Demo

### Configuration

<video controls src="https://github.com/user-attachments/assets/b8e39003-fe42-4345-8cef-427fe390c243" alt="cool-retro-hyper options">
  <a href="https://github.com/user-attachments/assets/b8e39003-fe42-4345-8cef-427fe390c243" target="_blank">
    <img src="https://github.com/user-attachments/assets/b86a91eb-b816-4d8b-910c-f82d8b9e55f4" alt="cool-retro-hyper options">
  </a>
</video>

### GLSL background

#### New File

<video controls src="https://github.com/user-attachments/assets/28d69bd6-03ea-4a0d-b609-0d477b78387e" alt="cool-retro-hyper glsl examples">
  <a href="https://github.com/user-attachments/assets/28d69bd6-03ea-4a0d-b609-0d477b78387e" target="_blank">
    <img src="https://github.com/user-attachments/assets/b656d8a7-2af7-4b5b-be40-8a62a19a8619" alt="cool-retro-hyper glsl examples">
  </a>
</video>

#### Example Files

<video controls src="https://github.com/user-attachments/assets/271c3156-8ce9-491b-a6f9-6fccfea20bab" alt="cool-retro-hyper glsl examples">
  <a href="https://github.com/user-attachments/assets/271c3156-8ce9-491b-a6f9-6fccfea20bab" target="_blank">
    <img src="https://github.com/user-attachments/assets/f64754ce-6f84-4ec5-8a66-ef28599b74dc" alt="cool-retro-hyper glsl examples">
    </a>
</video>

- [in space](https://www.shadertoy.com/view/sldGDf)
- [Neonwave Sunset](https://www.shadertoy.com/view/7dtcRj)

### [ASCII PATROL](https://ascii-patrol.com)

<video controls src="https://github.com/user-attachments/assets/19fd6ad0-0743-40bc-9799-4381728754f0" alt="cool-retro-hyper ascii-patrol">
  <a href="https://github.com/user-attachments/assets/19fd6ad0-0743-40bc-9799-4381728754f0" target="_blank">
    <img src="https://github.com/user-attachments/assets/6c8699f4-9802-4e06-ab56-7a15103112b9" alt="cool-retro-hyper ascii-patrol">
  </a>
</video>

### [nSnake](https://github.com/alexdantas/nSnake)

<video controls src="https://github.com/user-attachments/assets/c3fcdb3c-7edf-4c58-a3c0-1f77df7a89f6" alt="cool-retro-hyper nsnake">
  <a href="https://github.com/user-attachments/assets/c3fcdb3c-7edf-4c58-a3c0-1f77df7a89f6" target="_blank">
    <img src="https://github.com/user-attachments/assets/254e2616-7ed0-460a-b488-1e5f3dd8cb36" alt="cool-retro-hyper nsnake">
  </a>
</video>
