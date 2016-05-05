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

import {Input} from '../input';
import {Render} from '../render';
import {EntityID} from '../entities';
import {Camera} from '../camera';

import {System, Component} from '../systems/system';
import {ComponentPosition} from '../systems/position';
import {SystemID} from '../systems/ids';


export interface ComponentPrune extends Component {
  time: number;
  distance: number;
  distanceFromID: EntityID;
  camera: boolean;
  cameraBorder: number;
}


/**
 * Prunes an entity based on certain conditions.
 */
export class SystemPrune extends System {
  public init(): Component {
    return <ComponentPrune>{
      time: 0,
      distance: 0,
      distanceFromID: undefined,
      camera: false,
      cameraBorder: 48
    };
  }

  public render(render: Render, camera: Camera, lerp: number) {

    // Determine of the entity is no longer rendered, and prune if needed.
    for (let id in this._components) {
      let prune: ComponentPrune = <ComponentPrune>this._components[id];
      let pos: ComponentPosition = <ComponentPosition>this._entities.getComponent(SystemID.POSITION, id);
      if (pos.x + prune.cameraBorder < camera.x ||
          pos.y + prune.cameraBorder < camera.y ||
          pos.x - prune.cameraBorder >= camera.x + camera.scaledWidth ||
          pos.y - prune.cameraBorder >= camera.y + camera.scaledHeight) {
        this._entities.removeEntity(id);
        continue;
      }
    }
  }

  public update(delta: number) {
    for (let id in this._components) {
      let prune: ComponentPrune = <ComponentPrune>this._components[id];

      // Prune after a certain amount of time has passed.
      if (prune.time) {
        prune.time -= delta;
        if (prune.time <= 0) {
          this._entities.removeEntity(id);
          continue;
        }
      }

      // Prune if the entity is a set amount of distance from another entity.
      if (prune.distance && prune.distanceFromID) {
        let pos2: ComponentPosition = <ComponentPosition>this._entities.getComponent(SystemID.POSITION, prune.distanceFromID);
        if (!pos2) {
          this._entities.removeEntity(id);
          continue;
        }

        let pos1: ComponentPosition = <ComponentPosition>this._entities.getComponent(SystemID.POSITION, id);
        if (Math.abs(pos2.x - pos1.x) >= prune.distance || Math.abs(pos2.y - pos1.y) >= prune.distance) {
          this._entities.removeEntity(id);
          continue;
        }
      }
    }
  }

  public get name(): string {
    return 'prune';
  }

  public get id(): SystemID {
    return SystemID.PRUNE;
  }
}
