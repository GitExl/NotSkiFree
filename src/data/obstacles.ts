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

export interface Obstacle {
  entity: string;
  chance: number;
  min: number;
  max: number;
  flipX?: boolean;
}

// Spawnable obstacles per map block.
export const OBSTACLES: Obstacle[] = [
  {
    entity: 'tree',
    chance: 1.0,
    min: 1,
    max: 2,
    flipX: true
  },
  {
    entity: 'largeTree',
    chance: 0.5,
    min: 1,
    max: 2,
    flipX: true
  },
  {
    entity: 'deadTree',
    chance: 0.5,
    min: 1,
    max: 1,
    flipX: true
  },
  {
    entity: 'bumpSmall1',
    chance: 0.45,
    min: 1,
    max: 2
  },
  {
    entity: 'bumpSmall2',
    chance: 0.45,
    min: 1,
    max: 2
  },
  {
    entity: 'bumpSmall3',
    chance: 0.45,
    min: 1,
    max: 2
  },
  {
    entity: 'bumpLarge1',
    chance: 0.15,
    min: 1,
    max: 1
  },
  {
    entity: 'bumpLarge2',
    chance: 0.15,
    min: 1,
    max: 1
  },
  {
    entity: 'bumpLarge3',
    chance: 0.15,
    min: 1,
    max: 1
  },
  {
    entity: 'rock',
    chance: 0.8,
    min: 0,
    max: 1,
    flipX: true
  },
  {
    entity: 'mushroom',
    chance: 0.4,
    min: 0,
    max: 1,
    flipX: true
  },
  {
    entity: 'mushroomCircle',
    chance: 0.0075,
    min: 0,
    max: 1,
    flipX: true
  },
  {
    entity: 'treeStump',
    chance: 0.85,
    min: 0,
    max: 1,
    flipX: true
  },
  {
    entity: 'rampSmall',
    chance: 0.45,
    min: 1,
    max: 1
  },
  {
    entity: 'rampLarge',
    chance: 0.35,
    min: 1,
    max: 1
  },
  {
    entity: 'snowman',
    chance: 0.1,
    min: 0,
    max: 1,
    flipX: true
  },
  {
    entity: 'log',
    chance: 0.6,
    min: 0,
    max: 1,
    flipX: true
  }
];
