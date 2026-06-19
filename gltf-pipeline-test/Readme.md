如果我们想把这个 glb 模型转为 gltf + bin 呢？

可以用 gltf-pipeline 的命令行工具。

```shell
npx gltf-pipeline -i Michelle.glb -o Michelle.gltf
```

如果是想把资源单独摘出来 加个 -s,会生成一个 model 文件夹，拆分成贴图、bin 和 gltf

```shell
npx gltf-pipeline -i Michelle.glb -o ./model/Michelle2.gltf -s
```

如果是反过来，gltf 转 glb

```shell
npx gltf-pipeline -i ./model/Michelle2.gltf -o ./Michelle2.glb
```
