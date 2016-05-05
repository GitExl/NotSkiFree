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

import {Camera} from 'camera';
import {EntityID, Entities} from 'entities';

import {OBSTACLES} from 'data/obstacles';
import {NPCS, NPCLocation} from 'data/npcs';

import {SystemPosition, ComponentPosition} from 'systems/position';
import {SystemRender, ComponentRender} from 'systems/render';
import {SystemID} from 'systems/ids';


const BLOCK_SIZE: number = 384;

const NPC_BORDER: number = 40;
const NPC_MIN_DISTANCE: number = 32;

const LIFTPOLE_X: number = -192;
const LIFTCHAIR_SPEED: number = 3;


interface Block {
  x: number;
  y: number;
  entities: EntityID[];
}


/**
 * Generates entities on the current map.
 *
 * Obstacles are placed when a new block part of the map becomes visible. Blocks that are no
 * longer visible are emptied out and removed.
 *
 * NPCs are generated when the player moves.
 */
export class MapGenerator {
  private _camera: Camera;
  private _entities: Entities;

  private _lastX: number;
  private _lastY: number;

  private _blocks: Block[] = [];

  private _chairY: number = 0;

  constructor(camera: Camera, entities: Entities) {
    this._camera = camera;
    this._entities = entities;

    this._lastX = this._camera.x;
    this._lastY = this._camera.y;
  }

  public update(delta: number) {
    let startX: number = Math.floor(this._camera.x / BLOCK_SIZE);
    let startY: number = Math.floor(this._camera.y / BLOCK_SIZE);
    let endX: number = Math.ceil((this._camera.x + this._camera.width) / BLOCK_SIZE);
    let endY: number = Math.ceil((this._camera.y + this._camera.height) / BLOCK_SIZE);

    // Prune blocks that are out of range.
    for (let index in this._blocks) {
      let block: Block = this._blocks[index];
      if (block.x >= endX || block.y >= endY || block.x < startX || block.y < startY) {
        this.deleteBlockEntities(block);
        delete this._blocks[index];
      }
    }

    // Create new blocks.
    for (let y: number = startY; y < endY; y++) {
      for (let x: number = startX; x < endX; x++) {

         let found = false;
         for (let index in this._blocks) {
           if (this._blocks[index].x == x && this._blocks[index].y == y) {
             found = true;
           }
         }

         if (!found) {
           this._blocks.push({
             x: x,
             y: y,
             entities: this.generateBlockEntities(x * BLOCK_SIZE, y * BLOCK_SIZE)
           });
         }

      }
    }

    this.generateNPCs();

    this._chairY += delta * LIFTCHAIR_SPEED;
    this._chairY += delta * (this._camera.y - this._camera.lastY);
    if (Math.abs(this._chairY) >= 32) {
      this.generateLiftChairs(this._camera.y - 56);
      this.generateLiftChairs(this._camera.y + this._camera.scaledHeight + 64);
      this._chairY = 0;
    }
  }

  private generateNPCs() {
    let dx: number = this._camera.x - this._lastX;
    let dy: number = this._camera.y - this._lastY;

    for (let npc of NPCS) {

      // Skip NPCs that are generated on edges that have not moved recently.
      if (dx < 0 && npc.location === NPCLocation.RIGHT) {
        continue;
      } else if (dx > 0 && npc.location === NPCLocation.LEFT) {
        continue;
      }
      if (npc.location === NPCLocation.BOTTOM && Math.abs(dy) < NPC_MIN_DISTANCE) {
        continue;
      }

      if (Math.random() > npc.chance) {
        continue;
      }

      let id: EntityID = this._entities.createFromTemplate(npc.template);
      let pos: ComponentPosition = <ComponentPosition>this._entities.getComponent(SystemID.POSITION, id);

      // Place entity where desired.
      if (npc.location === NPCLocation.LEFT) {
        pos.x = this._camera.x - NPC_BORDER;
        pos.y = this._camera.y + Math.random() * this._camera.scaledHeight;
      } else if (npc.location === NPCLocation.RIGHT) {
        pos.x = this._camera.x + this._camera.scaledWidth + NPC_BORDER;
        pos.y = this._camera.y + Math.random() * this._camera.scaledHeight;
      } else if (npc.location === NPCLocation.TOP) {
        pos.x = this._camera.x + Math.random() * this._camera.scaledWidth;
        pos.y = this._camera.y - NPC_BORDER;
      } else if (npc.location === NPCLocation.BOTTOM) {
        pos.x = this._camera.x + Math.random() * this._camera.scaledWidth;
        pos.y = this._camera.y + this._camera.scaledHeight +  NPC_BORDER;
      } else {
        throw new Error(`Unhandled NPC spawn location type "{$npc.location}".`);
      }

      pos.x = Math.floor(pos.x);
      pos.y = Math.floor(pos.y);

      if (npc.create) {
        npc.create(id, this._entities);
      }
    }

    if (Math.abs(dy) >= NPC_MIN_DISTANCE) {
      this._lastX = this._camera.x;
      this._lastY = this._camera.y;
    }
  }

  private deleteBlockEntities(block: Block) {
    for (let index in block.entities) {
      this._entities.removeEntity(block.entities[index]);
    }
  }

  private generateBlockEntities(x: number, y: number): EntityID[] {
    let id: EntityID;
    let pos: ComponentPosition;
    let rend: ComponentRender;

    let systemPosition: SystemPosition = <SystemPosition>this._entities.getSystem(SystemID.POSITION);
    let systemRender: SystemRender = <SystemRender>this._entities.getSystem(SystemID.RENDER);

    // Generate obstacle entities.
    let ids: EntityID[] = [];
    for (let obstacle of OBSTACLES) {
      if (Math.random() > obstacle.chance) {
        continue;
      }

      let amount: number = obstacle.min + Math.floor(Math.random() * (obstacle.max - obstacle.min + 1));
      for (let i: number = 0; i < amount; i++) {
        id = this._entities.createFromTemplate(obstacle.entity);

        pos = <ComponentPosition>systemPosition.get(id);
        pos.x = Math.floor(x + Math.random() * BLOCK_SIZE);
        pos.y = Math.floor(y + Math.random() * BLOCK_SIZE);

        if (obstacle.flipX) {
          rend = <ComponentRender>systemRender.get(id);
          rend.flipX = (Math.random() < 0.5);
        }

        ids.push(id);
      }
    }

    // Skilift poles.
    if (LIFTPOLE_X >= x && LIFTPOLE_X < x + BLOCK_SIZE) {
      for (let cy = y; cy < y + BLOCK_SIZE; cy += BLOCK_SIZE / 2) {
        id = this._entities.createFromTemplate('liftPole');

        pos = <ComponentPosition>systemPosition.get(id);
        pos.x = LIFTPOLE_X;
        pos.y = cy;

        ids.push(id);
      }
    }

    return ids;
  }

  private generateLiftChairs(y: number) {
    let newID: EntityID = this._entities.createFromTemplate('liftchair');
    let newPos: ComponentPosition = <ComponentPosition>this._entities.getComponent(SystemID.POSITION, newID);
    let newRend: ComponentRender = <ComponentRender>this._entities.getComponent(SystemID.RENDER, newID);

    // Left chair.
    newPos.x = LIFTPOLE_X - 21;
    newPos.y = y;
    newPos.z = 32;
    newPos.velY = LIFTCHAIR_SPEED;
    newRend.frame = 'down';

    newID = this._entities.createFromTemplate('liftchair');
    newPos = <ComponentPosition>this._entities.getComponent(SystemID.POSITION, newID);
    newRend = <ComponentRender>this._entities.getComponent(SystemID.RENDER, newID);

    // Right chair.
    newPos.x = LIFTPOLE_X + 21;
    newPos.y = y;
    newPos.z = 32;
    newPos.velY = -LIFTCHAIR_SPEED;

    let chance: number = Math.random();
    if (chance < 0.01) {
      newRend.frame = 'up-yeti';
    } else if (chance < 0.35) {
      newRend.frame = 'up';
    } else {
      newRend.frame = 'up-occupied';
    }
  }
}
