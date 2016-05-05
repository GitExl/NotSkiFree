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

import {Image} from 'image';


interface Character {
  x: number;
  width: number;
}


/**
 * A renderdable Font, read from an image file.
 */
export class Font {
  private _image: Image;
  private _height: number;
  private _characters: Character[] = [];
  private _scale: number;
  private _spacing: number;

  constructor(src: string, scale: number = 1.0, spacing: number = 1) {
    this._scale = Math.ceil(scale);
    this._spacing = spacing;

    let image: HTMLImageElement = document.createElement('img');
    image.addEventListener('load', function() {
      this._image = new Image(image);
      this.prepare();
      this._image.scale(scale);
    }.bind(this));
    image.src = src;
  }

  private prepare() {
    let canvas: HTMLCanvasElement = <HTMLCanvasElement>document.createElement('canvas');
    let ctx: CanvasRenderingContext2D = <CanvasRenderingContext2D>canvas.getContext('2d');
    canvas.width = this._image.width;
    canvas.height = this._image.height;
    ctx.drawImage(this._image.canvas, 0, 0);

    let data: ImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let characterIndex: number = 0;

    let character: Character = <Character>{
      x: 0,
      width: 0
    };

    // Find character widths from the font image.
    for (let x: number = 0; x < data.width; x++) {

      // Determine if this column is empty or not.
      let empty: boolean = true;
      let index: number = x * 4 + 3;
      for (let y: number = 0; y < data.height; y++) {
        if (data.data[index] !== 0) {
          empty = false;
          break;
        }

        index += data.width * 4;
      }

      // Update and add current character.
      if (empty) {
        character.width = x - character.x;
        this._characters.push(character);
        character = <Character>{
          x: x + 1,
          width: 0
        };
      }
    }

    // Add last character.
    character.width = data.width - character.x;
    this._characters.push(character);

    // Scale characters.
    for (let character of this._characters) {
      character.x *= this._scale;
      character.width *= this._scale;
    }

    // Set font height.
    this._height = (data.height - 1) * this._scale;
  }

  public draw(ctx: CanvasRenderingContext2D, text: string, x: number, y: number) {
    if (!this._characters.length) {
      return;
    }

    for (let index: number = 0; index < text.length; index++) {
      let charIndex: number = text.charCodeAt(index);
      if (charIndex === 32) {
        x += 4 * this._scale;
        continue;
      }

      let char: Character = this._characters[charIndex - 33];
      ctx.drawImage(this._image.canvas, char.x, 0, char.width, this._height, x, y, char.width, this._height);
      x += char.width + (1 * this._scale);
    }
  }

  public getTextWidth(text: string): number {
    if (!this._characters.length) {
      return;
    }

    let x = 0;
    for (let index: number = 0; index < text.length; index++) {
      let charIndex: number = text.charCodeAt(index);
      if (charIndex === 32) {
        x += this._spacing + 4 * this._scale;
        continue;
      }

      let char: Character = this._characters[charIndex - 33];
      x += char.width + (this._spacing * this._scale);
    }

    return x;
  }

  public getTextHeight(text: string): number {
    return this._height;
  }
}
