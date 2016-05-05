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
import {ComponentPrune} from '../systems/prune';
import {SystemAnimation} from '../systems/animation';
import {ComponentRender} from '../systems/render';
import {SystemID} from '../systems/ids';


export function create(id: EntityID, entities: Entities) {
  let script: ComponentScript = <ComponentScript>entities.getComponent(SystemID.SCRIPT, id);
  script.data = {
    waitTime: 0,
    flipX: false,
    collidedID: undefined
  };

  let render: ComponentRender = <ComponentRender>entities.getComponent(SystemID.RENDER, id);
  render.flipX = script.data.flipX;

  let anim: SystemAnimation = <SystemAnimation>entities.getSystem(SystemID.ANIMATION);
  anim.start(id);

  entities.addEventListener(id, 'collision:source', collide);
}

export function update(id: EntityID, entities: Entities, delta: number) {
  let script: ComponentScript = <ComponentScript>entities.getComponent(SystemID.SCRIPT, id);
  let pos: ComponentPosition = <ComponentPosition>entities.getComponent(SystemID.POSITION, id);

  // We got hit, so wait patiently a while.
  if (script.data.waitTime) {
    script.data.waitTime -= delta;

    if (script.data.waitTime <= 0) {
      let anim: SystemAnimation = <SystemAnimation>entities.getSystem(SystemID.ANIMATION);
      anim.play(id, 'walk', 1.0);
      script.data.waitTime = 0;

      // We are done waiting, maybe we were a bit too excited to meet someone?
      if (Math.random() < 0.15) {
        let newID: EntityID = entities.createFromTemplate('pee');

        let newPos: ComponentPosition = <ComponentPosition>entities.getComponent(SystemID.POSITION, newID);
        newPos.x = pos.x;
        newPos.y = pos.y - 4;

        let newPrune: ComponentPrune = <ComponentPrune>entities.getComponent(SystemID.PRUNE, newID);
        newPrune.distanceFromID = script.data.collidedID;
      }
    }

  } else {
    pos.velX = script.data.flipX ? -2.1 : 2.1;
    pos.velY += (Math.random() * 1) - 0.5;

  }
}

function collide(event: EntityEvent) {
  let anim: SystemAnimation = <SystemAnimation>event.entities.getSystem(SystemID.ANIMATION);
  let script: ComponentScript = <ComponentScript>event.entities.getComponent(SystemID.SCRIPT, event.targetID);
  let pos: ComponentPosition = <ComponentPosition>event.entities.getComponent(SystemID.POSITION, event.targetID);

  // Upon hitting another entity, we sit and greet them for a bit.
  script.data.waitTime = 2 + Math.random() * 2;
  script.data.collidedID = event.sourceID;

  anim.play(event.targetID, 'sit', 1.0);
  pos.velX = 0;
  pos.velY = 0;
}

export function createNPCRight(id: EntityID, entities: Entities) {
  let script: ComponentScript = <ComponentScript>entities.getComponent(SystemID.SCRIPT, id);
  script.data.flipX = true;

  let render: ComponentRender = <ComponentRender>entities.getComponent(SystemID.RENDER, id);
  render.flipX = true;
}
