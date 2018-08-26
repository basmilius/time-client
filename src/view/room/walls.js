import { tileHeight, tileHeightHalf, tileWidthHalf } from "./shared.js";

export class WallBase extends PIXI.Graphics
{

	constructor(floorThickness, wallThickness, top)
	{
		super();

		this.interactive = false;
		this.interactiveChildren = false;

		this.cacheAsBitmap = false;
		this.doorHeight = 85;
		this.floorThickness = floorThickness;
		this.wallHeight = 115 + (top * tileHeight);
		this.wallThickness = wallThickness;
	}

	render()
	{
		this.clear();
	}

}

export class WallColumn extends WallBase
{

	constructor(floorThickness, wallThickness, top, isDoor, isEnding, isCorner, sceneryConfig)
	{
		super(floorThickness, wallThickness, top);

		this.isCorner = isCorner;
		this.isDoor = isDoor;
		this.isEnding = isEnding;
		this.sceneryConfig = sceneryConfig;
		this.render();
	}

	render()
	{
		super.render();

		let hole = this.isDoor ? (this.doorHeight + this.floorThickness) : 0;

		if (!this.isDoor && !this.isCorner)
		{
			this.beginFill(0x9697A1);
			this.moveTo(tileWidthHalf, tileHeightHalf + (this.isEnding ? this.floorThickness : 0));
			this.lineTo(tileWidthHalf + this.wallThickness, tileHeightHalf + (this.isEnding ? this.floorThickness : 0) - (this.wallThickness / 2));
			this.lineTo(tileWidthHalf + this.wallThickness, tileHeightHalf - (this.wallThickness / 2) - this.wallHeight);
			this.lineTo(tileWidthHalf, tileHeightHalf - this.wallHeight);
			this.lineTo(tileWidthHalf, tileHeightHalf + (this.isEnding ? this.floorThickness : 0));
			this.endFill();
		}

		if (this.sceneryConfig !== undefined)
		{
			const sprite = new PIXI.extras.TilingSprite(this.sceneryConfig.getWallTexture());
			sprite.x = 0;
			sprite.y = -this.wallHeight;
			sprite.height = this.wallHeight - hole;
			sprite.width = tileWidthHalf;
			sprite.skew.y = -5.82;
			sprite.scale.x = 1.13;

			const filter = new PIXI.filters.AdjustmentFilter({
				brightness: 1.1
			});

			sprite.filters = [filter];

			this.addChild(sprite);
		}
		else
		{
			this.beginFill(0xB5B9C9);
			this.moveTo(tileWidthHalf, tileHeightHalf + hole);
			this.lineTo(tileWidthHalf, tileHeightHalf - this.wallHeight);
			this.lineTo(0, tileHeightHalf - this.wallHeight - tileHeightHalf);
			this.lineTo(0, hole);
			this.lineTo(tileWidthHalf, tileHeightHalf + hole);
			this.endFill();
		}

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

		this.render();
	}

	render()
	{
		super.render();

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

	constructor(floorThickness, wallThickness, top, isDoor, isEnding, isCorner, sceneryConfig)
	{
		super(floorThickness, wallThickness, top);

		this.isCorner = isCorner;
		this.isDoor = isDoor;
		this.isEnding = isEnding;
		this.sceneryConfig = sceneryConfig;

		this.render();
	}

	render()
	{
		super.render();

		let hole = this.isDoor ? (this.doorHeight + this.floorThickness) : 0;

		if (!this.isDoor && !this.isCorner)
		{
			this.beginFill(0xBABECE);
			this.moveTo(-tileWidthHalf, tileHeightHalf + (this.isEnding ? this.floorThickness : 0));
			this.lineTo(-tileWidthHalf, tileHeightHalf - this.wallHeight);
			this.lineTo(-tileWidthHalf - this.wallThickness, tileHeightHalf - this.wallHeight - (this.wallThickness / 2));
			this.lineTo(-tileWidthHalf - this.wallThickness, tileHeightHalf + (this.isEnding ? this.floorThickness : 0) - (this.wallThickness / 2));
			this.lineTo(-tileWidthHalf, tileHeightHalf + (this.isEnding ? this.floorThickness : 0));
			this.endFill();
		}

		if (this.sceneryConfig !== undefined)
		{
			const sprite = new PIXI.extras.TilingSprite(this.sceneryConfig.getWallTexture());
			sprite.x = -tileWidthHalf;
			sprite.y = -(this.wallHeight - tileHeightHalf);
			sprite.height = this.wallHeight - hole;
			sprite.width = tileWidthHalf;
			sprite.skew.y = 5.82;
			sprite.scale.x = 1.13;

			this.addChild(sprite);
		}
		else
		{
			this.beginFill(0x92939D);
			this.moveTo(-tileWidthHalf, tileHeightHalf - hole);
			this.lineTo(-tileWidthHalf, tileHeightHalf - this.wallHeight);
			this.lineTo(0, tileHeightHalf - this.wallHeight - tileHeightHalf);
			this.lineTo(0, -hole);
			this.lineTo(-tileWidthHalf, tileHeightHalf - hole);
			this.endFill();
		}

		this.beginFill(0x71727B);
		this.moveTo(-tileWidthHalf, tileHeightHalf - this.wallHeight);
		this.lineTo(0, tileHeightHalf - this.wallHeight - tileHeightHalf);
		this.lineTo(-this.wallThickness, tileHeightHalf - this.wallHeight - tileHeightHalf - (this.wallThickness / 2));
		this.lineTo(-tileWidthHalf - this.wallThickness, tileHeightHalf - this.wallHeight - (this.wallThickness / 2));
		this.lineTo(-tileWidthHalf, tileHeightHalf - this.wallHeight);
		this.endFill();
	}

}
