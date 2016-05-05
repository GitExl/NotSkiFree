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
import {ComponentCollision, CollisionEvent} from '../systems/collision';
import {SystemAnimation} from '../systems/animation';
import {SystemID} from '../systems/ids';


enum SnowboarderState {
  WAITING,
  FLIPPING
}


export function create(id: EntityID, entities: Entities) {
  let script: ComponentScript = <ComponentScript>entities.getComponent(SystemID.SCRIPT, id);
  script.data = {
    wait: 0,
    state: SnowboarderState.WAITING,
    direction: 1
  };

  entities.addEventListener(id, 'collision:source', collide);
}

function collide(event: EntityEvent, collision: CollisionEvent) {
  if (collision.blockMovement) {
    let pos: ComponentPosition = <ComponentPosition>event.entities.getComponent(SystemID.POSITION, event.targetID);
    let anim: SystemAnimation = <SystemAnimation>event.entities.getSystem(SystemID.ANIMATION);
    let script: ComponentScript = <ComponentScript>event.entities.getComponent(SystemID.SCRIPT, event.targetID);

    // Colliding with anything means we jump in the air to avoid further collision and to look cool.
    pos.velX *= 0.5;
    pos.velY *= 0.5;
    pos.velZ += 3.5;
    anim.play(event.targetID, 'flip', 1.0);
    script.data.wait = 0.300;
    script.data.state = SnowboarderState.FLIPPING;
  }

  collision.blockMovement = false;
}

export function update(id: EntityID, entities: Entities, delta: number) {
  let script: ComponentScript = <ComponentScript>entities.getComponent(SystemID.SCRIPT, id);
  let pos: ComponentPosition = <ComponentPosition>entities.getComponent(SystemID.POSITION, id);
  let anim: SystemAnimation = <SystemAnimation>entities.getSystem(SystemID.ANIMATION);

  if (pos.z <= 0) {
    pos.velY += 4.5;
    pos.velX += script.data.direction * 3.25;
  }

  // SNowbaord around from left to right randomly.
  script.data.wait -= delta;
  if (script.data.wait <= 0) {
    switch (script.data.state) {
      case SnowboarderState.WAITING:
        script.data.state = SnowboarderState.WAITING;
        script.data.wait = 0.3 + Math.random() * 1.2;
        script.data.direction = script.data.direction < 0 ? 1 : -1;

        if (script.data.direction < 0) {
          anim.play(id, 'right', 1.0);
        } else {
          anim.play(id, 'left', 1.0);
        }

        break;

      case SnowboarderState.FLIPPING:
        script.data.state = SnowboarderState.WAITING;
        break;
    }
  }
}
