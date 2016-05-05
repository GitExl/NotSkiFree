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

import * as Snowman from '../scripts/snowman';
import * as Ramp from '../scripts/ramp';
import * as DeadTree from '../scripts/deadtree';
import * as LiftPole from '../scripts/liftpole';
import * as Score from '../scripts/score';
import * as Bump from '../scripts/bump';
import * as Skier from '../scripts/skier';
import * as Dog from '../scripts/dog';
import * as Newbie from '../scripts/newbie';
import * as MovingTree from '../scripts/movingtree';
import * as Snowboarder from '../scripts/snowboarder';
import * as Yeti from '../scripts/yeti';

import {CollisionType} from '../systems/collision';


// Tempaltes for entities.
export const ENTITY_TEMPLATES: any = {
  skier: {
    position: {},
    render: {
      sprite: 'player',
      frame: 'moveSide1',
      shadow: 'person'
    },
    animation: {
      animation: 'stand'
    },
    collision: {
      width: 13,
      height: 17,
      type: CollisionType.NPC,
      with: CollisionType.OBSTACLE | CollisionType.EFFECT | CollisionType.NPC,
      depth: 4
    },
    script: {
      scriptClass: Skier.ScriptHandlerSkier
    },
    tracks: {
      decal: 'skies',
      duration: 20.0
    }
  },
  tree: {
    position: {
      static: true,
    },
    render: {
      sprite: 'tree',
      frame: 'default',
      shadow: 'tree'
    },
    collision: {
      width: 18,
      height: 26,
      type: CollisionType.OBSTACLE,
      blocks: true,
      depth: 5
    }
  },
  largeTree: {
    position: {
      static: true,
    },
    render: {
      sprite: 'largeTree',
      frame: 'default',
      shadow: 'tree'
    },
    collision: {
      width: 20,
      height: 54,
      type: CollisionType.OBSTACLE,
      blocks: true,
      depth: 6
    }
  },
  deadTree: {
    position: {
      static: true,
    },
    render: {
      sprite: 'deadTree',
      frame: 'default',
      shadow: 'tree'
    },
    animation: {
      animation: 'default',
      running: true
    },
    collision: {
      width: 14,
      height: 22,
      type: CollisionType.OBSTACLE,
      blocks: true,
      depth: 5
    },
    script: {
      create: DeadTree.create
    }
  },
  rock: {
    position: {
      static: true,
    },
    render: {
      sprite: 'rock',
      frame: 'default'
    },
    collision: {
      width: 17,
      height: 7,
      type: CollisionType.OBSTACLE,
      blocks: true,
      depth: 3
    }
  },
  bumpSmall1: {
    position: {
      static: true,
    },
    render: {
      sprite: 'bumpSmall1',
      frame: 'default'
    },
    collision: {
      width: 9,
      height: 3,
      type: CollisionType.EFFECT,
      depth: 1
    },
    script: {
      create: Bump.createSmall
    }
  },
  bumpSmall2: {
    position: {
      static: true,
    },
    render: {
      sprite: 'bumpSmall2',
      frame: 'default'
    },
    collision: {
      width: 11,
      height: 4,
      type: CollisionType.EFFECT,
      depth: 1
    },
    script: {
      create: Bump.createSmall
    }
  },
  bumpSmall3: {
    position: {
      static: true,
    },
    render: {
      sprite: 'bumpSmall3',
      frame: 'default'
    },
    collision: {
      width: 11,
      height: 4,
      type: CollisionType.EFFECT,
      depth: 1
    },
    script: {
      create: Bump.createSmall
    }
  },
  bumpLarge1: {
    position: {
      static: true,
    },
    render: {
      sprite: 'bumpLarge1',
      frame: 'default'
    },
    collision: {
      width: 17,
      height: 2,
      type: CollisionType.EFFECT,
      depth: 1
    },
    script: {
      create: Bump.createLarge
    }
  },
  bumpLarge2: {
    position: {
      static: true,
    },
    render: {
      sprite: 'bumpLarge2',
      frame: 'default'
    },
    collision: {
      width: 21,
      height: 3,
      type: CollisionType.EFFECT,
      depth: 1
    },
    script: {
      create: Bump.createLarge
    }
  },
  bumpLarge3: {
    position: {
      static: true,
    },
    render: {
      sprite: 'bumpSmall3',
      frame: 'default'
    },
    collision: {
      width: 21,
      height: 5,
      type: CollisionType.EFFECT,
      depth: 1
    },
    script: {
      create: Bump.createLarge
    }
  },
  mushroom: {
    position: {
      static: true,
    },
    render: {
      sprite: 'mushroom',
      frame: 'default'
    }
  },
  mushroomCircle: {
    position: {
      static: true,
    },
    render: {
      sprite: 'mushroomCircle',
      frame: 'default'
    }
  },
  treeStump: {
    position: {
      static: true,
    },
    render: {
      sprite: 'treeStump',
      frame: 'default'
    },
    collision: {
      width: 8,
      height: 8,
      type: CollisionType.OBSTACLE,
      blocks: true,
      depth: 4
    }
  },
  rampSmall: {
    position: {
      static: true,
    },
    render: {
      sprite: 'ramp',
      frame: 'small'
    },
    collision: {
      width: 31,
      height: 7,
      type: CollisionType.EFFECT,
      depth: 10
    },
    script: {
      create: Ramp.createSmall
    }
  },
  rampLarge: {
    position: {
      static: true,
    },
    render: {
      sprite: 'ramp',
      frame: 'large'
    },
    collision: {
      width: 31,
      height: 10,
      type: CollisionType.EFFECT,
      depth: 12
    },
    script: {
      create: Ramp.createLarge
    }
  },
  snowman: {
    position: {
      static: true,
    },
    render: {
      sprite: 'snowman',
      frame: 'default'
    },
    collision: {
      width: 13,
      height: 26,
      type: CollisionType.OBSTACLE,
      blocks: true,
      depth: 7
    },
    script: {
      create: Snowman.create
    }
  },
  log: {
    position: {
      static: true,
    },
    render: {
      sprite: 'log',
      frame: 'default'
    },
    collision: {
      width: 22,
      height: 7,
      type: CollisionType.OBSTACLE,
      blocks: true,
      depth: 4
    }
  },
  liftPole: {
    position: {
      static: true,
    },
    render: {
      sprite: 'liftPole',
      frame: 'default'
    },
    collision: {
      width: 12,
      height: 63,
      type: CollisionType.OBSTACLE,
      blocks: true,
      depth: 6
    },
    script: {
      render: LiftPole.render
    }
  },
  score: {
    position: {
      gravity: 0.0,
      friction: 0.0
    },
    script: {
      render: Score.render,
      update: Score.update,
      create: Score.create
    }
  },
  dog: {
    position: {},
    render: {
      sprite: 'dog',
      frame: 'default',
      shadow: 'dog'
    },
    animation: {
      animation: 'walk'
    },
    collision: {
      width: 13,
      height: 12,
      with: CollisionType.NPC,
      type: CollisionType.NPC,
      depth: 2
    },
    script: {
      create: Dog.create,
      update: Dog.update
    },
    prune: {
      camera: true,
      cameraBorder: 64
    }
  },
  pee: {
    position: {},
    render: {
      sprite: 'pee',
      frame: 'default'
    },
    prune: {
      time: 12,
      distance: 1000
    }
  },
  newbie: {
    position: {},
    render: {
      sprite: 'newbie',
      frame: 'ski1',
      shadow: 'person'
    },
    collision: {
      width: 13,
      height: 12,
      with: CollisionType.OBSTACLE | CollisionType.EFFECT | CollisionType.NPC,
      type: CollisionType.NPC,
      blocks: true,
      depth: 5
    },
    script: {
      create: Newbie.create,
      update: Newbie.update
    },
    prune: {
      camera: true,
      cameraBorder: 72
    },
    tracks: {
      decal: 'skies',
      duration: 12.0
    }
  },
  liftchair: {
    position: {
      gravity: 0.0,
      friction: 0.0
    },
    render: {
      sprite: 'liftchair',
      frame: 'up',
      shadow: 'liftchair'
    },
    collision: {
      width: 26,
      height: 28,
      type: CollisionType.OBSTACLE,
      blocks: true,
      depth: 7
    },
    prune: {
      camera: true,
      cameraBorder: 128
    }
  },
  movingtree: {
    position: {
      friction: 2.0
    },
    render: {
      sprite: 'movingtree',
      frame: 'default',
      shadow: 'tree'
    },
    collision: {
      width: 18,
      height: 26,
      type: CollisionType.OBSTACLE,
      blocks: true,
      depth: 5
    },
    script: {
      create: MovingTree.create,
      update: MovingTree.update
    },
    prune: {
      camera: true,
      cameraBorder: 192
    }
  },
  snowboarder: {
    position: {
      mass: 1.5
    },
    render: {
      sprite: 'snowboarder',
      frame: 'left',
      shadow: 'person'
    },
    animation: {
      animation: 'left'
    },
    collision: {
      width: 14,
      height: 20,
      type: CollisionType.NPC,
      with: CollisionType.OBSTACLE | CollisionType.EFFECT | CollisionType.NPC,
      depth: 6,
      blocks: true
    },
    script: {
      create: Snowboarder.create,
      update: Snowboarder.update
    },
    prune: {
      camera: true,
      cameraBorder: 224
    },
    tracks: {
      decal: 'snowboard',
      duration: 8.0
    }
  },
  yeti: {
    position: {},
    render: {
      sprite: 'yeti',
      frame: 'run1',
      shadow: 'person'
    },
    animation: {
      animation: 'run',
      running: true
    },
    collision: {
      width: 15,
      height: 38,
      type: CollisionType.NPC,
      with: CollisionType.NPC,
      depth: 12
    },
    script: {
      create: Yeti.create,
      update: Yeti.update
    }
  }
};
