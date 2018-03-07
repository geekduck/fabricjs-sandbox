window.onload = () => {
  const canvas = new fabric.Canvas('c');

  function createImageObject(url) {
    return new Promise((resolve, reject) => {
      fabric.Image.fromURL(url, function(img) {
        console.dir(arguments);
        if (img) {
          img.set({
            left: 10,
            top: 30
          });
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
      console.dir(e);
      canvas.discardActiveObject();
      // canvas.discardActiveObject();

      const target = e.selected;
      const objects = [img, rect1, rect2];

      const group = new fabric.Group(objects);
      objects.forEach(object => canvas.remove(object));
      canvas.add(group);
      canvas.setActiveObject(group);
      // canvas.setActiveGroup(group);
      // canvas.requestRenderAll();
      canvas.renderAll();

      // e.e.preventDefault();
    });
  }).catch((error) => console.log("error"));
};
