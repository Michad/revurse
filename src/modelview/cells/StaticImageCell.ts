import Konva from "konva";
import { rotateAroundCenter } from "../../view/util/ViewManipulation";
import { BORDER_BUFFER, BORDER_BUFFER_X, Y_COUNT } from "../../constants/Constants";
import { Cell } from "../Cell";

export abstract class StaticImageCell extends Cell {
    protected abstract getImageUrl(): string;

    draw() {
        let self = this;

        var imageObj = new Image();
        let screnCoord = this.world.universe.gridToScreen(self.coordinate);
        let screenCalc = this.world.universe.getScreenCalculations();

        imageObj.onload = function () {
            let node = new Konva.Image({ image: imageObj });
            self.view = node;

            node.setAttrs({
                x: screnCoord.x - screenCalc.polyWidth / 2 - BORDER_BUFFER_X / 2,
                y: screnCoord.y - screenCalc.polyHeight / 2 - screenCalc.polyHeight / Y_COUNT / 2 - BORDER_BUFFER / 2,
                width: screenCalc.polyWidth + BORDER_BUFFER_X,
                height: screenCalc.polyHeight + screenCalc.polyHeight / Y_COUNT + BORDER_BUFFER,
                cornerRadius: 0,
                opacity: 0.75
            });

            if (self.model.rotation) {
                rotateAroundCenter(node, self.model.rotation);
            }

            node.listening(false);

            self.layer.add(node);

        };
        //imageObj.crossOrigin = 'Anonymous';
        imageObj.src = this.getImageUrl();
    }

}
