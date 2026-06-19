透视投影相机是近大远小效果，而正投影相机是远近一样大。

正投影相机确实用的比较少，但在设置平行光阴影的时候会用到。

6 种灯光里只有点光源、聚光灯、平行光可以产生阴影，需要在 renderer 开启阴影 shadowMap.enabled，在灯光处开启阴影 castShadow，在产生阴影的物体设置阴影 castShadow，在接收阴影的物体设置 receiveShadow。
