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
import {ComponentCollision, CollisionEvent} from '../systems/collision';
import {SystemAnimation} from '../systems/animation';
import {SystemID} from '../systems/ids';


enum YetiState {
  CHASING,
  DONE
}


export function create(id: EntityID, entities: Entities) {
  let script: ComponentScript = <ComponentScript>entities.getComponent(SystemID.SCRIPT, id);
  script.data = {
    state: YetiState.CHASING,
    targetID: undefined,
    delay: 0
  };

  entities.addEventListener(id, 'collision:source', collide);
  entities.addEventListener(id, 'animation:eatdone', eatDone);
  entities.addEventListener(id, 'animation:pickdone', pickDone);
  entities.addEventListener(id, 'animation:jump', jump);
}

function eatDone(event: EntityEvent) {
  let anim: SystemAnimation = <SystemAnimation>event.entities.getSystem(SystemID.ANIMATION);
  anim.play(event.targetID, 'pick', 1.0);
}

function pickDone(event: EntityEvent) {
  let anim: SystemAnimation = <SystemAnimation>event.entities.getSystem(SystemID.ANIMATION);
  anim.play(event.targetID, 'jump', 0.85);
}

function jump(event: EntityEvent) {
  let pos: ComponentPosition = <ComponentPosition>event.entities.getComponent(SystemID.POSITION, event.targetID);
  pos.velZ = 4;

  let anim: SystemAnimation = <SystemAnimation>event.entities.getSystem(SystemID.ANIMATION);
  anim.set(event.targetID, 'jump', 0.20 + Math.random() * 0.8);
}

function collide(event: EntityEvent, collision: CollisionEvent) {
  let script: ComponentScript = <ComponentScript>event.entities.getComponent(SystemID.SCRIPT, event.targetID);
  if (event.sourceID !== script.data.targetID) {
    return;
  }

  // We eat anything we collide with. Yum!
  script.data.state = YetiState.DONE;

  let anim: SystemAnimation = <SystemAnimation>event.entities.getSystem(SystemID.ANIMATION);
  anim.play(event.targetID, 'eat', 1.0);

  let pos: ComponentPosition = <ComponentPosition>event.entities.getComponent(SystemID.POSITION, event.targetID);
  event.entities.removeEventListener(event.targetID, 'collision:source', collide);
  event.entities.removeEntity(event.sourceID);

  pos.velX = pos.velY = 0;
}

export function update(id: EntityID, entities: Entities, delta: number) {
  let script: ComponentScript = <ComponentScript>entities.getComponent(SystemID.SCRIPT, id);
  if (!script.data.targetID) {
    return;
  }

  let pos: ComponentPosition = <ComponentPosition>entities.getComponent(SystemID.POSITION, id);
  let pos2: ComponentPosition = <ComponentPosition>entities.getComponent(SystemID.POSITION, script.data.targetID);

  let rend: ComponentRender = <ComponentRender>entities.getComponent(SystemID.RENDER, id);
  let anim: SystemAnimation = <SystemAnimation>entities.getSystem(SystemID.ANIMATION);

  // Viciously chase the target entity.
  switch (script.data.state) {
    case YetiState.CHASING:
      let dx: number = (pos2.x - pos.x) < 0 ? -1 : 1;
      let dy: number = (pos2.y - pos.y) < 0 ? -1 : 1;
      pos.velX += dx * 3;
      pos.velY += dy * 6;
      anim.play(id, 'run', 1.0);
      rend.flipX = (pos.velX < 0);
      break;
  }
}
