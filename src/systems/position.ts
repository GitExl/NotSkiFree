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

import {System, Component} from '../systems/system';
import {SystemID} from '../systems/ids';
import {Input} from '../input';
import {Render} from '../render';
import {Camera} from '../camera';


const FRICTION: number = 0.825;
const GRAVITY: number = 0.84;
const VELOCITY_MIN: number = 0.075;


export interface ComponentPosition extends Component {
  x: number;
  y: number;
  z: number;

  lastX: number;
  lastY: number;
  lastZ: number;

  lerpX: number;
  lerpY: number;
  lerpZ: number;

  velX: number;
  velY: number;
  velZ: number;

  static: boolean;
  gravity: number;
  friction: number;
  mass: number;
}


/**
 * Position updating and basic movement physics.
 */
export class SystemPosition extends System {

  public init(): Component {
    return <ComponentPosition>{
      x: 0,
      y: 0,
      z: 0,

      velX: 0,
      velY: 0,
      velZ: 0,

      static: false,
      gravity: 1.0,
      friction: 1.0,
      mass: 1.0
    };
  }

  public render(render: Render, camera: Camera, lerp: number) {

    // Interpolate entity positions for inbetween ticks.
    for (let id in this._components) {
      let pos: ComponentPosition = <ComponentPosition>this._components[id];
      if (pos.static) {
        pos.lerpX = pos.x;
        pos.lerpY = pos.y;
        pos.lerpZ = pos.z;
      } else {
        pos.lerpX = pos.lastX + (pos.x - pos.lastX) * lerp;
        pos.lerpY = pos.lastY + (pos.y - pos.lastY) * lerp;
        pos.lerpZ = pos.lastZ + (pos.z - pos.lastZ) * lerp;
      }
    }
  }

  public update(delta: number) {

    // Apply an anemic version of Euler integration.
    for (let id in this._components) {
      let pos: ComponentPosition = <ComponentPosition>this._components[id];

      pos.lastX = pos.x;
      pos.lastY = pos.y;
      pos.lastZ = pos.z;

      if (pos.static) {
        continue;
      }

      let ground: boolean = (pos.z <= 0);

      // Add velocity.
      pos.x += pos.velX * (1 / pos.mass);
      pos.y += pos.velY * (1 / pos.mass);
      pos.z += pos.velZ * (1 / pos.mass);

      if ((pos.z <= 0) && !ground) {
        this._entities.triggerEvent(id, id, 'position:touchGround');
      }

      // Stay on ground level.
      if (pos.z <= 0) {
        pos.z = 0;
        pos.velZ = 0;

        pos.velX *= FRICTION + (1 - FRICTION) * (1 - pos.friction);
        pos.velY *= FRICTION + (1 - FRICTION) * (1 - pos.friction);
      } else {
        pos.velZ -= GRAVITY * pos.gravity * pos.mass;
      }

      if (Math.abs(pos.velX) < VELOCITY_MIN) {
        pos.velX = 0;
      }
      if (Math.abs(pos.velY) < VELOCITY_MIN) {
        pos.velY = 0;
      }
      if (Math.abs(pos.velZ) < VELOCITY_MIN) {
        pos.velZ = 0;
      }
    }
  }

  public get name(): string {
    return 'position';
  }

  public get id(): SystemID {
    return SystemID.POSITION;
  }
}
