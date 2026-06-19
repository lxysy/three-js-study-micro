# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

这节我们实现了保存 canvas 为图片、视频的功能。

当我们设计好 T 恤之后，希望把设计保存下来，这时候就希望能生成图片、视频。

我们用 canvas.toBlob 就可以把 canvas 转为 blob，然后用 URL.createObjectURL 把 blob 作为 a 标签的 src，触发下载。

视频用 MediaRecorder 录制，用 gsap 缓动动画把衣服转一圈，把这个过程录制成 webm 的视频。

当有这类需求的时候，就可以把 3D 场景通过图片、视频保存下来。
