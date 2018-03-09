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

    const canvas = window.canvas = new fabric.Canvas('c');

    function loadImage(url, imgOptions) {
        return new Promise((resolve, reject) => {
            fabric.util.loadImage(url, function(img) {
            console.dir(arguments);
            if (img) {
                resolve(new fabric.Image(img, imgOptions));
            } else {
                console.log("ERROR Reject!!");
                reject();
            }
        }, null, imgOptions && imgOptions.crossOrigin);
    });
    }

    function createRect(props) {
        return new fabric.Rect({
            fill: 'black',
            left: props.left,
            top: props.top,
            width: 20,
            height: 20,
            hasControls: false,
            originX: props.originX || "left",
            originY: props.originY || "top",
            scaleX: props.scale || 1,
            scaleY: props.scale || 1
        });
    }

    const rect1 = createRect({left: 50, top: 50, originX: "center", originY: "center", scale: 0.8});
    const rect2 = createRect({left: 100, top: 50, originX: "center", originY: "center", scale: 0.8});

    const imageUrl = 'assets/image1.png';
    loadImage(imageUrl, {left: 10, top: 30, scaleX: 1.2, scaleY: 1.2}).then((img) => {
        canvas.add(img);
        canvas.add(rect1);
        canvas.add(rect2);
        rect1.parent = img;
        rect2.parent = img;


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


        function restrictMovement(options) {
            if(this.parent == null || this.parent.getBoundingRect == null) {
                return;
            }
            const {left, top, width, height} = this.parent.getBoundingRect();
            const bottom = top + height;
            const right = left + width;

            const {x, y} = this.getCenterPoint();

            let moveOpt = {left: this.left, top: this.top};
            if(x < left) {
                moveOpt.left = left;
            }else if(x > right) {
                moveOpt.left = right;
            }

            if(y < top) {
                moveOpt.top = top;
            }else if(y > bottom) {
                moveOpt.top = bottom;
            }
            this.set(moveOpt);
        }
        rect1.on("moving", restrictMovement);
        rect2.on("moving", restrictMovement);
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
