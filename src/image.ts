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

/**
 * Basic image manipulation.
 *
 * Construct an instance with an HTMLImageElement or HTMLCanvasElement and apply effects to it.
 * Image.canvas holds the resulting image.
 */
export class Image {

  // The canvas for the image result.
  private _canvas: HTMLCanvasElement;
  private _ctx: CanvasRenderingContext2D;

  // An ImageData object containing the raw pixel data for this image.
  private _source: ImageData;

  constructor(image: HTMLImageElement | HTMLCanvasElement) {

    // Create a canvas for image manipulation.
    this._canvas = document.createElement('canvas');
    this._canvas.width = image.width;
    this._canvas.height = image.height;

    // Blit the source image onto our own canvas.
    this._ctx = this._canvas.getContext('2d');
    this._ctx.drawImage(image, 0, 0);

    // Retrieve the initial raw pixel data.
    this._source = this._ctx.getImageData(0, 0, this._ctx.canvas.width, this._ctx.canvas.height);
  }

  /**
   * Flips this image on it's X axis.
   */
  public flipX() {
    let dest: ImageData = this._ctx.createImageData(this._source.width, this._source.height);

    for (let y: number = 0; y < this._source.height; y++) {
      let srcIndex: number = (y * this._source.width) * 4;
      let destIndex: number = ((y * this._source.width) + this._source.width - 1) * 4;
      for (let x: number = 0; x < this._source.width; x++) {
        dest.data[destIndex + 0] = this._source.data[srcIndex + 0];
        dest.data[destIndex + 1] = this._source.data[srcIndex + 1];
        dest.data[destIndex + 2] = this._source.data[srcIndex + 2];
        dest.data[destIndex + 3] = this._source.data[srcIndex + 3];

        srcIndex += 4;
        destIndex -= 4;
      }
    }

    this._ctx.putImageData(dest, 0, 0);
    this._source = dest;
  }

  /**
   * Flips this image on it's Y axis.
   */
  public flipY() {
    let dest: ImageData = this._ctx.createImageData(this._source.width, this._source.height);

    for (let x: number = 0; x < this._source.width; x++) {
      let srcIndex: number = x * 4;
      let destIndex: number = (((this._source.height - 1) * this._source.width) + x) * 4;
      for (let y: number = 0; y < this._source.height; y++) {
        dest.data[destIndex + 0] = this._source.data[srcIndex + 0];
        dest.data[destIndex + 1] = this._source.data[srcIndex + 1];
        dest.data[destIndex + 2] = this._source.data[srcIndex + 2];
        dest.data[destIndex + 3] = this._source.data[srcIndex + 3];

        srcIndex += this._source.width * 4;
        destIndex -= this._source.width * 4;
      }
    }

    this._ctx.putImageData(dest, 0, 0);
    this._source = dest;
  }

  /**
   * Performs integer scaling for this image.
   *
   * @param {number} scale The new scale for this image.
   */
  public scale(scale: number) {
    let destWidth: number = Math.ceil(this._source.width * scale);
    let destHeight: number = Math.ceil(this._source.height * scale);
    let dest: ImageData = this._ctx.createImageData(destWidth, destHeight);

    for (let x: number = 0; x < dest.width; x++) {
      for (let y: number = 0; y < dest.height; y++) {
        let srcX = Math.floor(x / scale);
        let srcY = Math.floor(y / scale);
        dest.data[(x + y * dest.width) * 4 + 0] = this._source.data[(srcX + srcY * this._source.width) * 4 + 0];
        dest.data[(x + y * dest.width) * 4 + 1] = this._source.data[(srcX + srcY * this._source.width) * 4 + 1];
        dest.data[(x + y * dest.width) * 4 + 2] = this._source.data[(srcX + srcY * this._source.width) * 4 + 2];
        dest.data[(x + y * dest.width) * 4 + 3] = this._source.data[(srcX + srcY * this._source.width) * 4 + 3];
      }
    }

    this._ctx.canvas.width = dest.width;
    this._ctx.canvas.height = dest.height;
    this._ctx.putImageData(dest, 0, 0);
    this._source = dest;
  }

  /**
   * Crops this image to a smaller area of pixels.
   *
   * @param {number} cx     Leftmost pixel to include.
   * @param {number} cy     Top pixel to include.
   * @param {number} width  The width of the crop area.
   * @param {number} height THe height of the crop area.
   */
  public crop(cx: number, cy: number, width: number, height: number) {
    let dest: ImageData = this._ctx.createImageData(width, height);

    for (let y: number = cy; y < cy + height; y++) {
      for (let x: number = cx; x < cx + width; x++) {
        dest.data[((y - cy) * dest.width + (x - cx)) * 4 + 0] = this._source.data[(y * this._source.width + x) * 4 + 0];
        dest.data[((y - cy) * dest.width + (x - cx)) * 4 + 1] = this._source.data[(y * this._source.width + x) * 4 + 1];
        dest.data[((y - cy) * dest.width + (x - cx)) * 4 + 2] = this._source.data[(y * this._source.width + x) * 4 + 2];
        dest.data[((y - cy) * dest.width + (x - cx)) * 4 + 3] = this._source.data[(y * this._source.width + x) * 4 + 3];
      }
    }

    this._ctx.canvas.width = width;
    this._ctx.canvas.height = height;
    this._ctx.putImageData(dest, 0, 0);
    this._source = dest;
  }

  public get width(): number {
    return this._canvas.width;
  }

  public get height(): number {
    return this._canvas.height;
  }

  public get canvas(): HTMLCanvasElement {
    return this._canvas;
  }
}
