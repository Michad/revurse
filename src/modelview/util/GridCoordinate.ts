import { X_COUNT, Y_COUNT } from "../../constants/Constants";

class GridCoordinate {
	x: number
	y: number

	constructor(x: number, y: number | null = null) {
		if (y === null) {
			this.y = x % Y_COUNT;
			this.x = (x - this.y) / Y_COUNT;
		} else {
			this.x = x;
			this.y = <number>y;
		}
	}

	equals(other: GridCoordinate): boolean {
		return this.x == other.x && this.y == other.y;
	}

	toIndex(): GridIndex {
		return this.x * Y_COUNT + this.y;
	}

	findNeighbor(rot: number) {
		rot = rot % 360;
		if (rot >= 330 || rot < 30) {
			if (this.y > 1)
				return new GridCoordinate(this.x, this.y - 1);
		} else if (rot < 90) {
			if (this.x < X_COUNT && this.y > 0)
				return new GridCoordinate(this.x + 1, this.y + (this.x % 2 ? 0 : -1));
		} else if (rot < 150) {
			if (this.x < X_COUNT)
				return new GridCoordinate(this.x + 1, this.y + (this.x % 2 ? 1 : 0));
		} else if (rot < 210) {
			if (this.y < Y_COUNT)
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

	isInner(): boolean {
		let isInner = true;

		if (this.y == 0 || this.y == 7) {
			if (this.x == 3 || this.x == 5) {
				isInner = false;
			} else if (this.y == 0) {
				isInner = false;
			} else if (this.y == 7) {
				if (this.x <= 1 || this.x >= 7) {
					isInner = false;
				}
			}
		} else if (this.x == 0 || this.x == 8) {
			if (this.y != 4) {
				isInner = false;
			}
		} else if (this.x == 1 || this.x == 7) {
			if (this.y <= 1 || this.y >= 6) {
				isInner = false;
			}
		}

		return isInner;
	}

	isEdge(): boolean {
		if ((this.x == 3 || this.x == 5) && (this.y == 0 || this.y == 7)) {
			return true;
		}
		if ((this.x == 0 || this.x == 8) && (this.y == 3 || this.y == 5)) {
			return true;
		}
		if ((this.x == 1 || this.x == 7) && (this.y == 1 || this.y == 6)) {
			return true;
		}

		return false;
	}
}

export default GridCoordinate