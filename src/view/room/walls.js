import { tileHeight, tileHeightHalf, tileWidthHalf } from "./shared.js";

export class WallBase extends PIXI.Graphics
{

	constructor(floorThickness, wallThickness, top)
	{
		super();

		this.interactive = true;

		this.doorHeight = 85;
		this.floorThickness = floorThickness;
		this.wallHeight = 115 + (top * tileHeight);
		this.wallThickness = wallThickness;
	}

}

export class WallColumn extends WallBase
{

	constructor(floorThickness, wallThickness, top, doorMode)
	{
		super(floorThickness, wallThickness, top);

		let hole = doorMode ? (this.doorHeight + this.floorThickness) : 0;

		if (!doorMode)
		{
			this.beginFill(0x9697A1);
			this.moveTo(tileWidthHalf, tileHeightHalf + this.floorThickness);
			this.lineTo(tileWidthHalf + this.wallThickness, tileHeightHalf + this.floorThickness - (this.wallThickness / 2));
			this.lineTo(tileWidthHalf + this.wallThickness, tileHeightHalf - (this.wallThickness / 2) - this.wallHeight);
			this.lineTo(tileWidthHalf, tileHeightHalf - this.wallHeight);
			this.lineTo(tileWidthHalf, tileHeightHalf + this.floorThickness);
			this.endFill();
		}

		this.beginFill(0xB5B9C9);
		this.moveTo(tileWidthHalf, tileHeightHalf + this.floorThickness - hole);
		this.lineTo(tileWidthHalf, tileHeightHalf - this.wallHeight);
		this.lineTo(0, tileHeightHalf - this.wallHeight - tileHeightHalf);
		this.lineTo(0, this.floorThickness - hole);
		this.lineTo(tileWidthHalf, tileHeightHalf + this.floorThickness - hole);
		this.endFill();

		this.beginFill(0x71727B);
		this.moveTo(tileWidthHalf, tileHeightHalf - this.wallHeight);
		this.lineTo(0, tileHeightHalf - this.wallHeight - tileHeightHalf);
		this.lineTo(this.wallThickness, tileHeightHalf - this.wallHeight - tileHeightHalf - (this.wallThickness / 2));
		this.lineTo(tileWidthHalf + this.wallThickness, tileHeightHalf - this.wallHeight - (this.wallThickness / 2));
		this.lineTo(tileWidthHalf, tileHeightHalf - this.wallHeight);
		this.endFill();
	}

}

export class WallCorner extends WallBase
{

	constructor(floorThickness, wallThickness, top)
	{
		super(floorThickness, wallThickness, top);

		this.beginFill(0x71727B);
		this.moveTo(0, -this.wallHeight);
		this.lineTo(this.wallThickness, -this.wallHeight - (this.wallThickness / 2));
		this.lineTo(0, -this.wallHeight - this.wallThickness);
		this.lineTo(-this.wallThickness, -this.wallHeight - (this.wallThickness / 2));
		this.lineTo(0, -this.wallHeight);
		this.endFill();
	}

}

export class WallRow extends WallBase
{

	constructor(floorThickness, wallThickness, top, doorMode)
	{
		super(floorThickness, wallThickness, top);

		let hole = doorMode ? (this.doorHeight + this.floorThickness) : 0;

		if (!doorMode)
		{
			this.beginFill(0xBABECE);
			this.moveTo(-tileWidthHalf, tileHeightHalf + this.floorThickness);
			this.lineTo(-tileWidthHalf, tileHeightHalf - this.wallHeight);
			this.lineTo(-tileWidthHalf - this.wallThickness, tileHeightHalf - this.wallHeight - (this.wallThickness / 2));
			this.lineTo(-tileWidthHalf - this.wallThickness, tileHeightHalf + this.floorThickness - (this.wallThickness / 2));
			this.lineTo(-tileWidthHalf, tileHeightHalf + this.floorThickness);
			this.endFill();
		}

		this.beginFill(0x92939D);
		this.moveTo(-tileWidthHalf, tileHeightHalf + this.floorThickness - hole);
		this.lineTo(-tileWidthHalf, tileHeightHalf - this.wallHeight);
		this.lineTo(0, tileHeightHalf - this.wallHeight - tileHeightHalf);
		this.lineTo(0, this.floorThickness - hole);
		this.lineTo(-tileWidthHalf, tileHeightHalf + this.floorThickness - hole);
		this.endFill();

		this.beginFill(0x71727B);
		this.moveTo(-tileWidthHalf, tileHeightHalf - this.wallHeight);
		this.lineTo(0, tileHeightHalf - this.wallHeight - tileHeightHalf);
		this.lineTo(-this.wallThickness, tileHeightHalf - this.wallHeight - tileHeightHalf - (this.wallThickness / 2));
		this.lineTo(-tileWidthHalf - this.wallThickness, tileHeightHalf - this.wallHeight - (this.wallThickness / 2));
		this.lineTo(-tileWidthHalf, tileHeightHalf - this.wallHeight);
		this.endFill();
	}

}
