模型有 3.3M 的大小,用 draco 来压缩下,压缩后的 glb 模型只有 2.5M 了，越大的模型压缩效果越明显
```shell
npx gltf-pipeline -i ./public/Michelle.glb -o ./public/Michelle2.glb -d
```

直接加载压缩过的模型会报错,因为需要用 DRACOLoader 来解压缩

这个是 google 推出的一个工具，我们可以用 gltf-pipeline 来压缩模型，它集成了 draco，只要在转换模型的时候加一个 -d

之后压缩过的模型在 threejs 里加载的时候，需要给 GLTFLoader 设置下 DRACOLoader 的实例，这个 dracoLoader 要指定从哪里下载 decoder

decoder 可以直接用 cdn 的，也可以把 three 的 libs 下的 decoder 复制出来，设置好对应的 decoderPath 加载路径就行。

这样，我们就可以下载压缩过的模型来提升 gltf 模型的加载速度了