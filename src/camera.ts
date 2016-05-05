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

// The speed at which the camera moves towards it's focus point.
const CAMERA_SPEED_X: number = 1.75;
const CAMERA_SPEED_Y: number = 3.25;


/**
 * A camera used for easy conversion between camera-local and world coordinates.
 */
export class Camera {

  // Current coordinates.
  private _x: number = 0;
  private _y: number = 0;

  // Previous tick coordinates.
  private _lastX: number;
  private _lastY: number;

  // Interpolated coordinates for rendering.
  private _lerpX: number;
  private _lerpY: number;

  // Target coordinates.
  private _targetX: number;
  private _targetY: number;

  // Size of this camera.
  private _width: number;
  private _height: number;

  // Size of this camera after applying it's scale factor.
  private _scaledWidth: number;
  private _scaledHeight: number;

  // Scale of this camera.
  private _scale: number;

  /**
   * Default constructor.
   *
   * @param {number} scale  The scale of the camera object, for size and position scaling.
   * @param {number} width  The width of the new camera object.
   * @param {number} height The height of the new camera object.
   */
  constructor(scale: number, width: number, height: number) {
    this._scale = scale;
    this.setSize(width, height);
  }

  /**
   * Updates this camera's position.
   *
   * @param {number} delta The time that ahs passed since the last update.
   */
  public update(delta: number) {
    this._lastX = this._x;
    this._lastY = this._y;

    if (this._targetX && this._targetY) {
      this._x += (this._targetX - this._x) / CAMERA_SPEED_X;
      this._y += (this._targetY - this._y) / CAMERA_SPEED_Y;
    }
  }

  /**
   * Interpolates this camera's position since the last update.
   *
   * @param {number} lerp Interpolation value between 0.0 and 1.0.
   */
  public lerp(lerp: number) {
    this._lerpX = this._lastX + (this._x - this._lastX) * lerp;
    this._lerpY = this._lastY + (this._y - this._lastY) * lerp;
  }

  /**
   * Sets the target coordinates that this camera will move towards.
   *
   * @param {number} x The x coordinate to target.
   * @param {number} y The y coordinate to target.
   */
  public setTarget(x: number, y: number) {
    this._targetX = x - this._scaledWidth / 2;
    this._targetY = y - this._scaledHeight / 2;
  }

  /**
   * Converts world coordinates to camera-local coordinates.
   *
   * @param  {number}   x The X coordinate to convert.
   * @param  {number}   y The Y coordinate to convert.
   *
   * @return {number[]}   An array with the converted x and y components.
   */
  public worldToLocal(x: number, y: number): number[] {
    return [
      (x - this._lerpX) * this._scale,
      (y - this._lerpY) * this._scale
    ];
  }

  /**
   * Converts camera-local coordinates to world coordinates.
   *
   * @param  {number}   x The X coordinate to convert.
   * @param  {number}   y The Y coordinate to convert.
   *
   * @return {number[]}   An array with the converted x and y components.
   */
  public localToWorld(x: number, y: number): number[] {
    return [
      (x + this._lerpX) / this._scale,
      (y + this._lerpY) / this._scale
    ];
  }

  /**
   * Centers this camera to a set of coordinates.
   *
   * @param {number} x The X coordinate to center on.
   * @param {number} y The Y coordinate to center on.
   */
  public centerOn(x: number, y: number) {
    this._x = x - this._scaledWidth / 2;
    this._y = y - this._scaledHeight / 2;
  }

  /**
   * Sets a new size for this camera.
   *
   * @param {number} width  New width of the camera.
   * @param {number} height New height of the camera.
   */
  public setSize(width: number, height: number) {

    // Width and height are rounded up to the next even number to prevent
    // later floating point rounding from causing jitter.
    this._width = width + (2 - width % 2);
    this._height = height + (2 - height % 2);

    this._scaledWidth = this._width / this._scale;
    this._scaledHeight = this._height / this._scale;
  }

  /**
   * Returns true if the given screen space rectangle is inside this camera.

   * @param  {number}  x1 Rectangle X1.
   * @param  {number}  y1 Rectangle Y1.
   * @param  {number}  x2 Rectangle X2.
   * @param  {number}  y2 Rectangle Y2.
   *
   * @return {boolean}    True if the rectangle intersects with this camera.
   */
  public contains(x1: number, y1: number, x2: number, y2: number): boolean {
    return !(x1 > this._width || 0 > x2 || y1 > this._height || 0 > y2);
  }

  /**
   * Returns the current x coordinate.
   */
  public get x(): number {
    return this._x;
  }

  /**
   * Returns the current y coordinate.
   */
  public get y(): number {
    return this._y;
  }

  /**
   * Returns the previous x coordinate.
   */
  public get lastX(): number {
    return this._lastX;
  }

  /**
   * Returns the previous y coordinate.
   */
  public get lastY(): number {
    return this._lastY;
  }

  /**
   * Returns the interpolated x coordinate.
   */
  public get lerpX(): number {
    return this._lerpX;
  }

  /**
   * Returns the interpolated y coordinate.
   */
  public get lerpY(): number {
    return this._lerpY;
  }

  /**
   * Returns the current width.
   */
  public get width(): number {
    return this._width;
  }

  /**
   * Returns the current height.
   */
  public get height(): number {
    return this._height;
  }

  /**
   * Returns the current width to scale.
   */
  public get scaledWidth(): number {
    return this._scaledWidth;
  }

  /**
   * Returns the current height to scale.
   */
  public get scaledHeight(): number {
    return this._scaledHeight;
  }
}
