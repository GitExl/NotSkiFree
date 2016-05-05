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

import {EntityID, Entities} from '../entities';

import * as Dog from '../scripts/dog';

export enum NPCLocation {
  LEFT,
  RIGHT,
  TOP,
  BOTTOM
}

export interface CreateFunc { (id: EntityID, entities: Entities) }

export interface NPC {
  template: string;
  chance: number;
  location: NPCLocation;
  create?: CreateFunc;
}

// NPC spawning data.
export const NPCS: NPC[] = [
  {
    template: 'dog',
    chance: 0.006,
    location: NPCLocation.BOTTOM
  },
  {
    template: 'dog',
    chance: 0.006,
    location: NPCLocation.BOTTOM,
    create: Dog.createNPCRight
  },
  {
    template: 'dog',
    chance: 0.001,
    location: NPCLocation.LEFT
  },
  {
    template: 'dog',
    chance: 0.001,
    location: NPCLocation.RIGHT,
    create: Dog.createNPCRight
  },
  {
    template: 'newbie',
    chance: 0.02,
    location: NPCLocation.BOTTOM
  },
  {
    template: 'movingtree',
    chance: 0.014,
    location: NPCLocation.BOTTOM
  },
  {
    template: 'snowboarder',
    chance: 0.0042,
    location: NPCLocation.TOP
  }
];
