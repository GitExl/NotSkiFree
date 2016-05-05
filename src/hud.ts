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

import {Render, Shape, Coords} from 'render';
import {EntityID, Entities} from 'entities';
import {ScriptHandlerSkier} from 'scripts/skier';

import {ComponentPosition} from 'systems/position';
import {ComponentScript} from 'systems/script';
import {SystemID} from 'systems/ids';


/**
 * HUD tracking and drawing.
 */
export class HUD {
  private _entities: Entities;
  private _render: Render;

  private _targetID: EntityID;
  private _targetPos: ComponentPosition;
  private _targetScript: ComponentScript;

  private _time: number = 0;

  constructor(entities: Entities, render: Render) {
    this._entities = entities;
    this._render = render;
  }

  public setTarget(id: EntityID) {
    this._targetID = id;
    this._targetPos = <ComponentPosition>this._entities.getComponent(SystemID.POSITION, id);
    this._targetScript = <ComponentScript>this._entities.getComponent(SystemID.SCRIPT, id);
  }

  public update(delta: number) {
    if (!this._entities.getComponent(SystemID.POSITION, this._targetID)) {
      return;
    }
    this._time += delta;
  }

  public render() {
    if (!this._targetID) {
      return;
    }

    // Speed, where an average ski speed of 44.5 km\h (~12.5 m\s) is equal to a top Y velocity of 12.5 world units.
    // A velocity of 12.5 units per tick equals ~303 units per second. 12.5 / 303 = ~24.24. So meters = world unit / 24.24.
    let distance: number = Math.round(this._targetPos.y / 24.24);

    let time = this._time * 1000;
    let m: number = Math.floor(time / 60000);
    time %= 60000;
    let s: number = Math.floor(time / 1000);
    time %= 1000;
    let ms: number = Math.floor(time);

    let timeStr: string = Math.floor(m) + ':' + this.pad('00', Math.floor(s)) + '.' + this.pad('000', Math.floor(ms));

    let dx: number = this._targetPos.x - this._targetPos.lastX;
    let dy: number = this._targetPos.y - this._targetPos.lastY;
    let len = Math.sqrt(dx * dx + dy * dy);

    let speed: number = Math.round((len / 1000) * 3600);
    let handler: ScriptHandlerSkier = <ScriptHandlerSkier>this._targetScript.instance;
    let score: number = handler.score;

    this._render.drawRectFilled(Coords.SCREEN, 0, 0, 0, this._render.width, 11, 'rgba(255, 255, 255, 0.75)');
    this._render.drawText(Coords.SCREEN, 'SCORE ' + score, 'default', 1, 1, 0);
    this._render.drawText(Coords.SCREEN, 'DISTANCE ' + distance + ' m', 'default', 100, 1, 0);
    this._render.drawText(Coords.SCREEN, 'TIME ' + timeStr, 'default', 225, 1, 0);
    this._render.drawText(Coords.SCREEN, 'SPEED ' + speed + ' km\\h', 'default', 350, 1, 0);
  }

  private pad(pad, str) {
    return (pad + str).slice(-pad.length);
  }
}
