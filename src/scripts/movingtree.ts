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


enum MovingTreeState {
  WAITING,
  MOVING
}


export function create(id: EntityID, entities: Entities) {
  let script: ComponentScript = <ComponentScript>entities.getComponent(SystemID.SCRIPT, id);
  script.data = {
    wait: 1,
    state: MovingTreeState.WAITING,
    direction: -1
  };
}

export function update(id: EntityID, entities: Entities, delta: number) {
  let script: ComponentScript = <ComponentScript>entities.getComponent(SystemID.SCRIPT, id);
  let pos: ComponentPosition = <ComponentPosition>entities.getComponent(SystemID.POSITION, id);
  let rend: ComponentRender = <ComponentRender>entities.getComponent(SystemID.RENDER, id);

  // Move a bit from time to time.
  script.data.wait -= delta;
  if (script.data.wait <= 0) {
    switch (script.data.state) {
      case MovingTreeState.WAITING:
        script.data.state = MovingTreeState.MOVING;
        script.data.wait = 0.5;
        script.data.direction = Math.random() < 0.5 ? -1 : 1;
        break;

      case MovingTreeState.MOVING:
        pos.velX = 2.25 * script.data.direction;
        rend.frame = 'move';

        if (Math.random() < 0.2) {
          script.data.state = MovingTreeState.WAITING;
          script.data.wait = 2.0 + Math.random() * 2.0;
        } else {
          script.data.state = MovingTreeState.MOVING;
          script.data.wait = 0.16;
        }

        break;
    }
  } else {
    rend.frame = 'default';
  }
}
