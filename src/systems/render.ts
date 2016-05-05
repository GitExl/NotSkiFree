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

import {Render, Coords} from '../render';
import {Camera} from '../camera';
import {EntityID, Entities} from '../entities';

import {System, Component} from '../systems/system';
import {SystemPosition, ComponentPosition} from '../systems/position';
import {SystemID} from '../systems/ids';


export interface ComponentRender extends Component {
  sprite: string;
  frame: string;
  flipX: boolean;
  shadow?: string;
}


/**
 * Renders entity sprites.
 */
export class SystemRender extends System {

  public init(): Component {
    return <ComponentRender>{
      sprite: 'player',
      frame: 'moveDown',
      flipX: false
    };
  }

  public render(render: Render, camera: Camera, lerp: number) {
    for (let id in this._components) {
      let rend: ComponentRender = <ComponentRender>this._components[id];
      let pos: ComponentPosition = <ComponentPosition>this._entities.getComponent(SystemID.POSITION, id);

      let x: number = pos.lerpX;
      let y: number = pos.lerpY;
      let z: number = pos.lerpZ;

      if (rend.shadow) {
        render.drawShadow(Coords.WORLD, rend.shadow, x, y, z);
      }
      render.drawSprite(Coords.WORLD, rend.sprite, rend.frame, x, y, z, rend.flipX);
    }
  }

  public get name(): string {
    return 'render';
  }

  public get id(): SystemID {
    return SystemID.RENDER;
  }
}
