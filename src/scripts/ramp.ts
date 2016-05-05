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

import {CollisionEvent} from '../systems/collision';
import {ComponentPosition} from '../systems/position';
import {SystemID} from '../systems/ids';


export function createSmall(id: EntityID, entities: Entities) {
  entities.addEventListener(id, 'collision:target', collideSmall);
}

export function createLarge(id: EntityID, entities: Entities) {
  entities.addEventListener(id, 'collision:target', collideLarge);
}

function collideSmall(event: EntityEvent, collision: CollisionEvent) {
  let pos: ComponentPosition = <ComponentPosition>event.entities.getComponent(SystemID.POSITION, event.targetID);
  let pos2: ComponentPosition = <ComponentPosition>event.entities.getComponent(SystemID.POSITION, event.sourceID);

  if (pos.z !== pos2.z) {
    collision.blockMovement = true;
    return;
  }

  let len: number = Math.sqrt(pos2.velX * pos2.velX + pos2.velY * pos2.velY);
  pos2.velZ = Math.min(10, 0.8 * len);
}

function collideLarge(event: EntityEvent, collision: CollisionEvent) {
  let pos: ComponentPosition = <ComponentPosition>event.entities.getComponent(SystemID.POSITION, event.targetID);
  let pos2: ComponentPosition = <ComponentPosition>event.entities.getComponent(SystemID.POSITION, event.sourceID);

  if (pos.z !== pos2.z) {
    collision.blockMovement = true;
    return;
  }

  let len: number = Math.sqrt(pos2.velX * pos2.velX + pos2.velY * pos2.velY);
  pos2.velZ = Math.min(14, 1.3 * len);
}
