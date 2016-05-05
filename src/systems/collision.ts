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

import {Render, Shape, Coords} from '../render';
import {Input} from '../input';
import {Camera} from '../camera';

import {EntityID, Entities} from '../entities';

import {SystemID} from '../systems/ids';
import {System, Component} from '../systems/system';
import {SystemPosition, ComponentPosition} from '../systems/position';


export enum CollisionType {
  OBSTACLE = 0x01,
  EFFECT   = 0x02,
  NPC      = 0x04
}


export interface ComponentCollision extends Component {
  width: number;
  height: number;
  depth: number;
  type: CollisionType;
  with: CollisionType;
  blocks: boolean;
}

interface BBox {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface CollisionEvent {
  blockMovement: boolean;
}

interface TypeMaskMap { [s: string]: number; };


const DEBUG: boolean = false;

// Minimum distance between objects to consider them for collision.
const MIN_DISTANCE: number = 112;


/**
 * Collision with other entities.
 */
export class SystemCollision extends System {
  private _typeMasks: TypeMaskMap = {};

  constructor(entities: Entities) {
    super(entities);
  }

  public init(): Component {
    return <ComponentCollision>{
      width: 16,
      height: 16,
      depth: 1,
      type: 0x0,
      with: 0x0,
      blocks: false
    };
  }

  public render(render: Render, camera: Camera, lerp: number) {
    if (!DEBUG) {
      return;
    }

    for (let id in this._components) {
      let coll: ComponentCollision = <ComponentCollision>this._components[id];
      let pos: ComponentPosition = <ComponentPosition>this._entities.getComponent(SystemID.POSITION, id);
      render.drawRectOutline(Coords.WORLD, pos.lerpX - coll.width / 2, pos.lerpY - coll.height, pos.lerpZ, coll.width, coll.height, 'red');
    }
  }

  public update(delta: number) {
    let bb: BBox = {
      x1: 0,
      y1: 0,
      x2: 0,
      y2: 0
    };

    for (let id in this._components) {
      let coll: ComponentCollision = <ComponentCollision>this._components[id];
      if (!coll.with) {
        continue;
      }

      let pos: ComponentPosition = <ComponentPosition>this._entities.getComponent(SystemID.POSITION, id);
      let diffX1: number = pos.x - pos.lastX;
      let diffY1: number = pos.y - pos.lastY;

      for (let id2 in this._components) {
        if (id === id2) {
          continue;
        }

        // Ignore the current component if it's collision is not filtered for.
        let coll2: ComponentCollision = <ComponentCollision>this._components[id2];
        if (!(coll.with & coll2.type)) {
          continue;
        }

        // Reject collisions not in range.
        let pos2: ComponentPosition = <ComponentPosition>this._entities.getComponent(SystemID.POSITION, id2);
        if (Math.abs(pos2.x - pos.x) > MIN_DISTANCE || Math.abs(pos2.y - pos.y) > MIN_DISTANCE) {
          continue;
        }

        // Create a target collision box enlarged by half the size of the source collison box (Minkowski ddifference).
        bb.x1 = pos2.x - coll2.width / 2 - coll.width / 2;
        bb.y1 = pos2.y - coll2.depth / 2 - coll.depth / 2;
        bb.x2 = pos2.x + coll2.width / 2 + coll.width / 2;
        bb.y2 = pos2.y + coll2.depth / 2 + coll.depth / 2;

        // Subtract this entity's movement vector from the first entity's. This way we can test for intersections
        // between two moving entities.
        let diffX2: number = pos.lastX + (diffX1 - (pos2.x - pos2.lastX));
        let diffY2: number = pos.lastY + (diffY1 - (pos2.y - pos2.lastY));

        // Find the earliest intersection of the position velocity vector with the target collision box edges.
        let t: number;
        t =             this.rayIntersection(pos.lastX, pos.lastY, diffX2, diffY2, bb.x1, bb.y1, bb.x2, bb.y1);
        t = Math.min(t, this.rayIntersection(pos.lastX, pos.lastY, diffX2, diffY2, bb.x2, bb.y1, bb.x2, bb.y2));
        t = Math.min(t, this.rayIntersection(pos.lastX, pos.lastY, diffX2, diffY2, bb.x1, bb.y2, bb.x2, bb.y2));
        t = Math.min(t, this.rayIntersection(pos.lastX, pos.lastY, diffX2, diffY2, bb.x1, bb.y1, bb.x1, bb.y2));

        if (t === Number.POSITIVE_INFINITY) {
          continue;
        }

        // Also test the z coordinate based in the intersection time. For it to be 100% accurate it should be part of
        // the ray intersection tests, but this is good enough and much faster.
        let z: number = pos.lastZ + (pos.z - pos.lastZ) * t;
        if (z < pos2.z || z >= pos2.z + coll2.height) {
          continue;
        }

        // Trigger collision events.
        let event: CollisionEvent = <CollisionEvent>{
          blockMovement: coll2.blocks
        };
        this._entities.triggerEvent(id, id2, 'collision:source', event);
        this._entities.triggerEvent(id2, id, 'collision:target', event);

        // The other entity blocks this one's movement, so move it back to before the first intersection time.
        if (event.blockMovement) {
          pos.x = pos.x + diffX1 * t;
          pos.y = pos.y + diffY1 * t;
          pos.z = pos.z + (pos.z - pos.lastZ) * t;

          diffX1 = pos.x - pos.lastX;
          diffY1 = pos.y - pos.lastY;
        }
      }
    }
  }

  /**
   * 2D Ray intersection test.
   */
  private rayIntersection(x11: number, y11: number, x12: number, y12: number, x21: number, y21: number, x22: number, y22: number): number {
    let xr: number = x12 - x11;
    let yr: number = y12 - y11;

    let xs: number = x22 - x21;
    let ys: number = y22 - y21;

    let denominator: number = xr * ys - yr * xs;
    if (denominator === 0) {
      return Number.POSITIVE_INFINITY;
    }

    let numerator: number = (x21 - x11) * yr - (y21 - y11) * xr;
    let u: number = numerator / denominator;
    let t: number = ((x21 - x11) * ys - (y21 - y11) * xs) / denominator;

    if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
      return t;
    }

    return Number.POSITIVE_INFINITY;
  }

  public get name(): string {
    return 'collision';
  }

  public get id(): SystemID {
    return SystemID.COLLISION;
  }
}
