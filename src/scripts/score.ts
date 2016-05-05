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

import {EntityID, Entities} from '../entities';
import {Render, Coords} from '../render';

import {ComponentPosition} from '../systems/position';
import {ComponentScript} from '../systems/script';
import {SystemID} from '../systems/ids';


const AGE_MAX: number = 1.5;


export function create(id: EntityID, entities: Entities) {
  let script: ComponentScript = <ComponentScript>entities.getComponent(SystemID.SCRIPT, id);
  script.data = {
    score: 0,
    age: 0
  };
}

export function update(id: EntityID, entities: Entities, delta: number) {
  let script: ComponentScript = <ComponentScript>entities.getComponent(SystemID.SCRIPT, id);
  script.data.age += delta;
  if (script.data.age >= AGE_MAX) {
    entities.removeEntity(id);
  }
}

export function render(id: EntityID, entities: Entities, render: Render, lerp: number) {
  let pos: ComponentPosition = <ComponentPosition>entities.getComponent(SystemID.POSITION, id);
  let script: ComponentScript = <ComponentScript>entities.getComponent(SystemID.SCRIPT, id);

  let score: string = script.data.score.toString();
  let width: number = render.getTextWidth(score, 'small');
  let alpha: number = 1.0 - (script.data.age / AGE_MAX);

  render.drawText(Coords.WORLD, score, 'small', pos.lerpX - width / 4, pos.lerpY, pos.lerpZ, alpha, '#fff');
}
