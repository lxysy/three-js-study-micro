可以开启 autoRotate 自动旋转，可以加上惯性 enableDamping，可以开启 rotate、zoom、pan，也可以限制 rotate 的范围 maxPolarAngle

我们经常监听 change 事件来可视化调节相机的位置和焦点，就是打印 camera.position 和 controls.target。

但是要注意 ORbitControls 默认会把焦点调回 0,0,0，调好之后要同步设置 camera.lookAt 和 controls.target.set
