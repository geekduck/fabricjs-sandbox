window.onload = () => {

    function monkeyPatch() {
        if (fabric.Canvas.prototype._original_discardActiveObject == null) {
            fabric.Canvas.prototype._original_discardActiveObject = fabric.Canvas.prototype._discardActiveObject;
            fabric.Canvas.prototype._discardActiveObject = function() {
                this._currentTransform = null; // このプロパティが残っているとグループ上のrectをクリックした後にマウスを動かしても反応しないため消す
                return fabric.Canvas.prototype._original_discardActiveObject.apply(this, arguments);
            };
        }
    }
    monkeyPatch();

    const canvas = new fabric.Canvas('c');

    function createImageObject(url) {
        return new Promise((resolve, reject) => {
            fabric.Image.fromURL(url, function(img) {
            console.dir(arguments);
                if (img) {
                    img.set({left: 10, top: 30});
                    resolve(img);
                } else {
                    reject();
                }
            });
        });
    }

    function createRect(props) {
        return new fabric.Rect({
            fill: 'black',
            left: props.x,
            top: props.y,
            width: 20,
            height: 20,
            hasControls: false
        });
    }

    const rect1 = createRect({x: 50, y: 50});
    const rect2 = createRect({x: 100, y: 50});

    const imageUrl = 'assets/image1.png';
    createImageObject(imageUrl).then((img) => {
        canvas.add(img);
    canvas.add(rect1);
    canvas.add(rect2);

    img.on("selected", (e) => {
        canvas.discardActiveObject();
    const objects = [img, rect1, rect2];
    const group = new fabric.Group(objects, {subTargetCheck: true});
    objects.forEach(object => canvas.remove(object));
    canvas.add(group);
    canvas.__onMouseDown(e.e);

    group.on('deselected', () => {
        destroyGroup(group);
});

    group.on('mousedown', (options) => {
        if (options.subTargets.filter((object) => object.get("type") === "image").length === 0) {
        console.log("Image以外をクリック");
        const target = options.subTargets.filter((object) => object.get("type") !== "image")[0];
        if (target == null) {
            // コントロールとかスケールをクリックしたとき
            return;
        }
        destroyGroup(options.target);
        canvas.setActiveObject(target);
        canvas.__onMouseDown(options.e);
    } else {
        console.log("Imageをクリック");
    }
});
});
}).catch((error) => console.log("error"));

    function destroyGroup(group) {
        if (group == null)
            return;

        const canvas = group.canvas;
        group.off();
        group.getObjects().forEach((object) => canvas.add(object));
        group.destroy();
        canvas.remove(group);
    }
};
