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

import {EntityID, Entities, EntityEvent} from '../entities';

import {ComponentScript} from '../systems/script';
import {ComponentPosition} from '../systems/position';
import {ComponentRender} from '../systems/render';
import {SystemID} from '../systems/ids';


export function create(id: EntityID, entities: Entities) {
  let script: ComponentScript = <ComponentScript>entities.getComponent(SystemID.SCRIPT, id);
  script.data = {
    wait: 0,
    failed: false
  };

  entities.addEventListener(id, 'collision:source', collide);
}

export function update(id: EntityID, entities: Entities, delta: number) {
  let script: ComponentScript = <ComponentScript>entities.getComponent(SystemID.SCRIPT, id);
  let pos: ComponentPosition = <ComponentPosition>entities.getComponent(SystemID.POSITION, id);
  let rend: ComponentRender = <ComponentRender>entities.getComponent(SystemID.RENDER, id);

  // Muddle around on our skies a bit, unless we collided with something.
  if (!script.data.failed) {
    script.data.wait -= delta;
    if (script.data.wait <= 0) {
      pos.velX += (Math.random() * 3.0) - 1.5;
      pos.velY = 4;

      rend.frame = (Math.random() > 0.5) ? 'ski1' : 'ski2';

      script.data.wait = 0.35 + Math.random() * 0.6;
    }
  }
}

function collide(event: EntityEvent) {
  let script: ComponentScript = <ComponentScript>event.entities.getComponent(SystemID.SCRIPT, event.targetID);
  script.data.failed = true;

  let pos: ComponentPosition = <ComponentPosition>event.entities.getComponent(SystemID.POSITION, event.targetID);
  pos.velX = 0;
  pos.velY = 0;

  let rend: ComponentRender = <ComponentRender>event.entities.getComponent(SystemID.RENDER, event.targetID);
  rend.frame = 'failed';
}
