/*
  Copyright (c) 2016, Dennis Meuwissen
  All rights reserved.

  Redistribution and use in source and binary forms, with or without
  modification, are permitted provided that the following conditions are met:

  1. Redistributions of source code must retain the above copyright notice, this
     list of conditions and the following disclaimer.
  2. Redistributions in binary form must reproduce the above copyright notice,
     this list of conditions and the following disclaimer in the documentation
     and/or other materials provided with the distribution.

  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
  ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
  WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
  DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR
  ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
  (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
  LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
  ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
  (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
  SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

import {Font} from 'font';
import {Camera} from 'camera';
import {Image} from 'image';

import {SPRITES} from 'data/sprites';
import {SHADOWS} from 'data/shadows';
import {DECALS} from 'data/decals';


const SCALE = 2.0;


export enum Shape {
  RECT_OUTLINE,
  RECT_FILLED,
  RECT_FILLED_OUTLINE
}

export enum Coords {
  SCREEN,
  WORLD
}


interface SpriteMap { [s: string]: Sprite; }
interface SpriteFrameMap { [s: string]: SpriteFrame; }
interface FontMap { [s: string]: Font; }
interface ShadowMap { [s: string]: Shadow; }
interface DecalMap { [s: string]: Decal; }

interface DecalDrawFunc { (ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number) }

interface Shadow {
  x: number;
  y: number;
  width: number;
  height: number;
  centerX: number;
  centerY: number;
  image: Image;
}

interface Decal {
  func?: DecalDrawFunc;

  image?: Image;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  centerX?: number;
  centerY?: number;
}

interface SpriteFrame {
  centerX: number;
  centerY: number;
  image: Image;

  flipImage: Image;
  flipCenterX: number;
  flipCenterY: number;
}

interface Sprite {
  frames: SpriteFrameMap;
}

interface RenderSprite {
  coords: Coords;
  image: Image;
  x: number;
  y: number;
  sortY: number;
}

interface RenderShadow {
  coords: Coords;
  type: string;
  x: number;
  y: number;
  z: number;
}

interface RenderText {
  coords: Coords;
  x: number;
  y: number;
  text: string;
  font: Font;
  alpha: number;
  background?: string;
}

interface RenderShape {
  coords: Coords;
  shape: Shape;
  x: number;
  y: number;
  width: number;
  height: number;
  colorFill: string;
  colorStroke: string;
}

interface RenderLine {
  coords: Coords;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  width: number;
  color: string;
}

interface RenderDecal {
  coords: Coords;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  decal: string;
  alpha: number;
}


const DEBUG: boolean = false;


/**
 * 2D canvas renderer. Renderable obejcts are added every frame, then rendered in one pass.
 * Supports shadows, sprites, shapes (rectangles), lines, decal images and text.
 */
export class Render {
  private _canvas: HTMLCanvasElement;
  private _ctx: CanvasRenderingContext2D;

  private _sprites: SpriteMap = {};
  private _fonts: FontMap = {};
  private _shadows: ShadowMap = {};
  private _decals: DecalMap = {};

  private _renderShadows: RenderShadow[] = [];
  private _renderSprites: RenderSprite[] = [];
  private _renderShapes: RenderShape[] = [];
  private _renderLines: RenderLine[] = [];
  private _renderDecals: RenderDecal[] = [];
  private _renderText: RenderText[] = [];

  private _shadowsRendered: number;
  private _spritesRendered: number;
  private _shapesRendered: number;
  private _linesRendered: number;
  private _decalsRendered: number;


  constructor(canvas: Element) {
    this._canvas = <HTMLCanvasElement>canvas;
    this._ctx = this._canvas.getContext('2d');

    window.addEventListener('resize', this.resize.bind(this));
    this.resize();

    this.loadShadows();
    this.loadSprites();
    this.loadDecals();
    this.loadFonts();
  }

  private loadDecals() {
    for (let decalName in DECALS) {
      let baseDecal: any = DECALS[decalName];

      if (typeof baseDecal === 'function') {
        this._decals[decalName] = <Decal>{
          func: baseDecal
        };
      } else {
        this._decals[decalName] = <Decal>{
          x: baseDecal.frame[0],
          y: baseDecal.frame[1],
          width: baseDecal.frame[2],
          height: baseDecal.frame[3],
          centerX: baseDecal.frame[2] / 2,
          centerY: baseDecal.frame[3] / 2,
        };

        // Start loading the sprite's image.
        let imageElement: HTMLImageElement = document.createElement('img');
        imageElement.addEventListener('load', this.loadBaseDecal.bind(this, decalName, imageElement));
        imageElement.src = baseDecal.src;
      }
    }
  }

  private loadBaseDecal(decalName: string, imageElement: HTMLImageElement) {
    let decal: Decal = this._decals[decalName];

    decal.image = new Image(imageElement);
    decal.image.crop(decal.x, decal.y, decal.width, decal.height);
    decal.image.scale(SCALE);
  }

  private loadSprites() {
    for (let spriteName in SPRITES) {
      let baseSprite: any = SPRITES[spriteName];

      this._sprites[spriteName] = <Sprite>{
        frames: {}
      };

      // Start loading the sprite's image.
      let imageElement: HTMLImageElement = document.createElement('img');
      imageElement.addEventListener('load', this.loadBaseSprite.bind(this, spriteName, imageElement));
      imageElement.src = baseSprite.src;
    }
  }

  private loadShadows() {
    for (let shadowName in SHADOWS) {
      let baseShadow: any = SHADOWS[shadowName];

      this._shadows[shadowName] = <Shadow>{
        x: baseShadow.frame[0],
        y: baseShadow.frame[1],
        width: baseShadow.frame[2],
        height: baseShadow.frame[3],
        centerX: baseShadow.frame[2] / 2,
        centerY: baseShadow.frame[3] / 2
      };

      // Start loading the sprite's image.
      let imageElement: HTMLImageElement = document.createElement('img');
      imageElement.addEventListener('load', this.loadBaseShadow.bind(this, shadowName, imageElement));
      imageElement.src = baseShadow.src;
    }
  }

  private loadBaseShadow(shadowName: string, imageElement: HTMLImageElement) {
    let shadow: Shadow = this._shadows[shadowName];

    shadow.image = new Image(imageElement);
    shadow.image.crop(shadow.x, shadow.y, shadow.width, shadow.height);
    shadow.image.scale(SCALE);
  }

  private loadFonts() {
    this.loadFont('default', 'data/font-default.png', 1);
    this.loadFont('small', 'data/font-small.png', 1);
  }

  private loadBaseSprite(spriteName: string, imageElement: HTMLImageElement) {
    let baseSprite: any = SPRITES[spriteName];

    for (let frameKey in baseSprite.frames) {
      let frame: any = baseSprite.frames[frameKey];

      let image: Image = new Image(imageElement);
      image.crop(frame[0], frame[1], frame[2], frame[3]);
      image.scale(SCALE);

      let flipImage: Image = new Image(image.canvas);
      flipImage.flipX();

      let spriteFrame: SpriteFrame = {
        centerX: frame[4] - frame[0],
        centerY: frame[5] - frame[1],
        image: image,

        flipCenterX: frame[2] - (frame[4] - frame[0]),
        flipCenterY: frame[5] - frame[1],
        flipImage: flipImage
      };

      this._sprites[spriteName].frames[frameKey] = spriteFrame;
    }
  }

  public loadFont(name: string, src: string, spacing: number) {
    this._fonts[name] = new Font(src, SCALE, spacing);
  }

  public drawDecal(coords: Coords, x1: number, y1: number, x2: number, y2: number, decal: string, alpha: number = 1.0) {
    this._renderDecals.push(<RenderDecal>{
      coords: coords,
      x1: x1,
      y1: y1,
      x2: x2,
      y2: y2,
      decal: decal,
      alpha: alpha
    });
  }

  public drawText(coords: Coords, text: string, font: string, x: number, y: number, z: number, alpha: number = 1.0, background: string = undefined) {
    if (!(font in this._fonts)) {
      throw new Error(`Unknown font "{$font}".`);
    }

    this._renderText.push(<RenderText>{
      coords: coords,
      x: x,
      y: y - z,
      text: text,
      font: this._fonts[font],
      alpha: alpha,
      background: background
    });
  }

  public drawRectOutline(coords: Coords, x: number, y: number, z: number, width: number, height: number, color: string) {
    this._renderShapes.push(<RenderShape>{
      coords: coords,
      shape: Shape.RECT_OUTLINE,
      x: x,
      y: y - z,
      width: width,
      height: height,
      colorStroke: color
    });
  }

  public drawRectFilled(coords: Coords, x: number, y: number, z: number, width: number, height: number, color: string) {
    this._renderShapes.push(<RenderShape>{
      coords: coords,
      shape: Shape.RECT_FILLED,
      x: x,
      y: y - z,
      width: width,
      height: height,
      colorFill: color
    });
  }

  public drawLine(coords: Coords, x1: number, y1: number, x2: number, y2: number, width: number, color: string) {
    this._renderLines.push(<RenderLine>{
      coords: coords,
      x1: x1,
      y1: y1,
      x2: x2,
      y2: y2,
      width: width,
      color: color
    });
  }

  public drawRectFilledOutline(coords: Coords, x: number, y: number, z: number, width: number, height: number, colorFill: string, colorStroke: string) {
    this._renderShapes.push(<RenderShape>{
      coords: coords,
      shape: Shape.RECT_FILLED_OUTLINE,
      x: x,
      y: y - z,
      width: width,
      height: height,
      colorStroke: colorStroke,
      colorFill: colorFill
    });
  }

  public drawShadow(coords: Coords, type: string, x: number, y: number, z: number) {
    this._renderShadows.push(<RenderShadow>{
      coords: coords,
      type: type,
      x: x,
      y: y,
      z: z
    });
  }

  public drawSprite(coords: Coords, spriteName: string, frameName: string, x: number, y: number, z: number, flipX: boolean = false) {

    // Validate source.
    let sprite: Sprite = this._sprites[spriteName];
    if (!sprite) {
      return;
      //throw new Error(`Unknown sprite "{$spriteName}".`);
    }

    // Validate frame.
    let frame: SpriteFrame = sprite.frames[frameName];
    if (!frame) {
      return;
      //throw new Error(`Unknown frame "{$frameName}" for sprite "{$spriteName}".`);
    }

    let image: Image;
    if (flipX) {
      x = x - frame.flipCenterX;
      image = frame.flipImage;
    } else {
      x = x - frame.centerX;
      image = frame.image;
    }

    this._renderSprites.push({
      coords: coords,
      image: image,
      x: x,
      y: y - z - frame.centerY,
      sortY: y + z
    });
  }

  public getTextWidth(text: string, font: string): number {
    return this._fonts[font].getTextWidth(text);
  }

  private renderShadows(camera: Camera, lerp: number) {
    this._shadowsRendered = 0;

    for (let shadow of this._renderShadows) {
      let shadowSprite: Shadow = this._shadows[shadow.type];
      if (!shadowSprite.image) {
        continue;
      }

      let x: number = shadow.x - shadowSprite.centerX;
      let y: number = shadow.y - shadowSprite.centerY;

      if (shadow.coords === Coords.WORLD) {
        [x, y] = camera.worldToLocal(x, y);
      }

      if (!camera.contains(x, y, x + shadowSprite.image.width, y + shadowSprite.image.height)) {
        continue;
      }

      x = Math.floor(x);
      y = Math.floor(y);

      let alpha: number = Math.max(0.02, 0.0775 - (shadow.z / 1500));
      if (alpha !== this._ctx.globalAlpha) {
        this._ctx.globalAlpha = alpha;
      }
      this._ctx.drawImage(shadowSprite.image.canvas, x, y);

      this._shadowsRendered++;
    }
    this._ctx.globalAlpha = 1.0;

    this._renderShadows.length = 0;
  }

  private renderSprites(camera: Camera, lerp: number) {
    this._spritesRendered = 0;

    // Sort sprites back to front for proper depth rendering.
    this._renderSprites.sort(function(a: RenderSprite, b: RenderSprite) {
      if (a.sortY > b.sortY) {
        return 1;
      } else if (a.sortY < b.sortY) {
        return -1;
      }

      return 0;
    });

    for (let sprite of this._renderSprites) {
      let x: number = sprite.x;
      let y: number = sprite.y;
      if (sprite.coords === Coords.WORLD) {
        [x, y] = camera.worldToLocal(x, y);
      }

      if (!camera.contains(x, y, x + sprite.image.width, y + sprite.image.height)) {
        continue;
      }

      x = Math.floor(x);
      y = Math.floor(y);

      this._ctx.drawImage(sprite.image.canvas, x, y);

      this._spritesRendered++;
    }

    this._renderSprites.length = 0;
  }

  private renderShapes(camera: Camera, lerp: number) {
    this._shapesRendered = 0;
    this._ctx.lineWidth = SCALE;

    for (let shape of this._renderShapes) {
      let x: number = shape.x;
      let y: number = shape.y;
      if (shape.coords === Coords.WORLD) {
        [x, y] = camera.worldToLocal(x, y);
      }
      x = Math.floor(x);
      y = Math.floor(y);

      if (shape.shape === Shape.RECT_OUTLINE) {
        this._ctx.strokeStyle = shape.colorStroke;
        this._ctx.strokeRect(x, y, shape.width * SCALE, shape.height * SCALE);

      } else if (shape.shape === Shape.RECT_FILLED) {
        this._ctx.fillStyle = shape.colorFill;
        this._ctx.fillRect(x, y, shape.width * SCALE, shape.height * SCALE);

      } else if (shape.shape === Shape.RECT_FILLED_OUTLINE) {
        this._ctx.fillStyle = shape.colorFill;
        this._ctx.strokeStyle = shape.colorStroke;
        this._ctx.fillRect(x, y, shape.width * SCALE, shape.height * SCALE);
        this._ctx.fillRect(x, y, shape.width * SCALE, shape.height * SCALE);

      }

      this._shapesRendered++;
    }

    this._renderShapes.length = 0;
  }

  private renderLines(camera: Camera, lerp: number) {
    this._linesRendered = 0;

    for (let line of this._renderLines) {
      let x1: number = line.x1;
      let y1: number = line.y1;
      let x2: number = line.x2;
      let y2: number = line.y2;
      if (line.coords === Coords.WORLD) {
        [x1, y1] = camera.worldToLocal(x1, y1);
        [x2, y2] = camera.worldToLocal(x2, y2);
      }

      if (!camera.contains(x1, y1, x2, y2)) {
        continue;
      }

      x1 = Math.floor(x1);
      y1 = Math.floor(y1);
      x2 = Math.floor(x2);
      y2 = Math.floor(y2);

      this._ctx.lineWidth = line.width;
      this._ctx.strokeStyle = line.color;

      this._ctx.beginPath();
      this._ctx.moveTo(x1, y1);
      this._ctx.lineTo(x2, y2);
      this._ctx.stroke();

      this._linesRendered++;
    }

    this._renderLines.length = 0;
  }

  private renderText(camera: Camera, lerp: number) {
    for (let text of this._renderText) {
      let x: number = text.x;
      let y: number = text.y;
      if (text.coords === Coords.WORLD) {
        [x, y] = camera.worldToLocal(x, y);
      } else {
        x *= SCALE;
        y *= SCALE;
      }
      x = Math.floor(x);
      y = Math.floor(y);

      if (this._ctx.globalAlpha !== text.alpha) {
        this._ctx.globalAlpha = text.alpha;
      }

      if (text.background) {
        let width: number = text.font.getTextWidth(text.text);
        let height: number = text.font.getTextHeight(text.text) - 4;
        this._ctx.fillStyle = text.background;
        this._ctx.fillRect(x - SCALE * 2, y - SCALE * 2, width + SCALE * 4, height + SCALE * 4);
      }

      text.font.draw(this._ctx, text.text, x, y);
    }
    this._ctx.globalAlpha = 1.0;

    this._renderText.length = 0;
  }

  private renderDecals(camera: Camera, lerp: number) {
    this._decalsRendered = 0;

    for (let decal of this._renderDecals) {
      let decalSprite: Decal = this._decals[decal.decal];

      // Decal is a simple image.
      if (decalSprite.image) {
        let x: number = decal.x1 - decalSprite.centerX;
        let y: number = decal.y1 - decalSprite.centerY;
        if (decal.coords === Coords.WORLD) {
          [x, y] = camera.worldToLocal(x, y);
        } else {
          x *= SCALE;
          y *= SCALE;
        }

        if (!camera.contains(x, y, x + decalSprite.width, y + decalSprite.height)) {
          continue;
        }

        x = Math.floor(x);
        y = Math.floor(y);

        if (this._ctx.globalAlpha !== decal.alpha) {
          this._ctx.globalAlpha = decal.alpha;
        }
        this._ctx.drawImage(decalSprite.image.canvas, x, y);

      // Decal drawing function.
      } else if (decalSprite.func) {
        let x1: number = decal.x1;
        let y1: number = decal.y1;
        let x2: number = decal.x2;
        let y2: number = decal.y2;
        if (decal.coords === Coords.WORLD) {
          [x1, y1] = camera.worldToLocal(x1, y1);
          [x2, y2] = camera.worldToLocal(x2, y2);
        } else {
          x1 *= SCALE;
          y1 *= SCALE;
          x2 *= SCALE;
          y2 *= SCALE;
        }

        if (!camera.contains(x1, y1, x2, y2)) {
          continue;
        }

        x1 = Math.floor(x1);
        y1 = Math.floor(y1);
        x2 = Math.floor(x2);
        y2 = Math.floor(y2);

        if (this._ctx.globalAlpha !== decal.alpha) {
          this._ctx.globalAlpha = decal.alpha;
        }

        decalSprite.func(this._ctx, x1, y1, x2, y2);
      }

      this._decalsRendered++;
    }
    this._ctx.globalAlpha = 1.0;

    this._renderDecals.length = 0;
  }

  public render(camera: Camera, lerp: number) {
    this._ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);

    this.renderDecals(camera, lerp);
    this.renderShadows(camera, lerp);
    this.renderSprites(camera, lerp);
    this.renderShapes(camera, lerp);
    this.renderLines(camera, lerp);
    this.renderText(camera, lerp);

    if (DEBUG) {
      this._fonts['small'].draw(this._ctx, this._shadowsRendered + ' shadows', 2, 30);
      this._fonts['small'].draw(this._ctx, this._spritesRendered + ' sprites', 2, 46);
      this._fonts['small'].draw(this._ctx, this._shapesRendered + ' shapes', 2, 62);
      this._fonts['small'].draw(this._ctx, this._linesRendered + ' lines', 2, 78);
      this._fonts['small'].draw(this._ctx, this._decalsRendered + ' decals', 2, 94);
    }
  }

  private resize() {
    this._canvas.width = window.innerWidth;
    this._canvas.height = window.innerHeight;
  }

  public get width(): number {
    return this._canvas.width;
  }

  public get height(): number {
    return this._canvas.height;
  }

  public get scale(): number {
    return SCALE;
  }
}
