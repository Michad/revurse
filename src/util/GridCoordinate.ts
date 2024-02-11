class GridCoordinate {
	x: number
	y: number

	constructor(x: number, y: number | null) {
		if (y === undefined) {
			this.y = x % (<any>window).Y_COUNT;
			this.x = (x - this.y) / (<any>window).Y_COUNT;
		} else {
			this.x = x;
			this.y = <number>y;
		}
	}

	toIndex(): number {
		return this.x * (<any>window).Y_COUNT + this.y;
	}

	findNeighbor(rot: number) {
		rot = rot % 360;
		if (rot >= 330 || rot < 30) {
			if (this.y > 1)
				return new GridCoordinate(this.x, this.y - 1);
		} else if (rot < 90) {
			if (this.x < (<any>window).X_COUNT && this.y > 0)
				return new GridCoordinate(this.x + 1, this.y + (this.x % 2 ? 0 : -1));
		} else if (rot < 150) {
			if (this.x < (<any>window).X_COUNT)
				return new GridCoordinate(this.x + 1, this.y + (this.x % 2 ? 1 : 0));
		} else if (rot < 210) {
			if (this.y < (<any>window).Y_COUNT)
				return new GridCoordinate(this.x, this.y + 1);
		} else if (rot < 270) {
			if (this.x > 0 && this.x > 0)
				return new GridCoordinate(this.x - 1, this.y + (this.x % 2 ? 1 : 0));
		} else if (rot < 330) {
			if (this.x > 0 && this.y > 0)
				return new GridCoordinate(this.x - 1, this.y + (this.x % 2 ? 0 : -1));
		}
		return this;
	}
}

export default GridCoordinate