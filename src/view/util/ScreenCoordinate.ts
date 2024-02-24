class ScreenCoordinate {
	x: number
	y: number

	constructor(x: any, y: number | null) {
		if (x && x.x !== undefined && x.y !== undefined) {
			//Copy constructor
			this.x = (<ScreenCoordinate>x).x;
			this.y = (<ScreenCoordinate>x).y;
		} else {
			this.x = <number>x;
			this.y = <number>y;
		}
	}

	minus(other: ScreenCoordinate) {
		return new ScreenCoordinate(this.x - other.x, this.y - other.y);
	}

	scale(factor: number) {
		return new ScreenCoordinate(this.x * factor, this.y * factor);
	}

	interpolate(other: ScreenCoordinate, percentage: number) {
		return new ScreenCoordinate(
			this.x * (1 - percentage) + other.x * percentage,
			this.y * (1 - percentage) + other.y * percentage
		);
	}
}

export default ScreenCoordinate