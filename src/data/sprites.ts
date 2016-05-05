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

// Sprite and animation data.
export const SPRITES: any = {
  player: {
    src: 'data/skifree-sprites.png',
    frames: {
      'moveSide1':      [2,   180, 23, 26, 13,    204],
      'moveSideDiag11': [27,  178, 22, 28, 38,    202],
      'moveSideDiag21': [51,  175, 16, 31, 57,    197],
      'moveDown1':      [69,  174, 15, 32, 76.5,  199],
      'jump':           [86,  174, 32, 32, 99,    201],
      'flip1':          [120, 174, 29, 32, 134,   205],
      'flip2':          [151, 182, 31, 24, 166,   205],
      'jumpSide':       [184, 175, 28, 31, 197,   205],
      'jumpBack':       [214, 172, 28, 34, 227,   205],
      'fallBuried':     [244, 182, 31, 24, 258,   196],
      'fallSit':        [277, 183, 31, 23, 292,   203],
      'moveSide2':      [310, 180, 23, 26, 321,   204],
      'moveUp':         [335, 180, 23, 26, 346,   203],
      'fall':           [360, 181, 32, 25, 376,   205],
      'pose':           [394, 175, 25, 31, 405,   205],
      'moveDown2':      [421, 174, 15, 32, 428.5, 199],
      'moveSideDiag12': [438, 178, 22, 28, 449,   202],
      'moveSideDiag22': [462, 175, 16, 31, 468,   197],
      'movePush':       [480, 174, 17, 32, 487.5, 199],
      'stare':          [499, 179, 23, 27, 510,   203]
    },
    animations: {
      'moveDown':     [0.060, 'moveDown1', 'moveDown2'],
      'moveDiag1':    [0.060, 'moveSideDiag11', 'moveSideDiag12'],
      'moveDiag2':    [0.060, 'moveSideDiag21', 'moveSideDiag22'],
      'jump':         [0.000, 'jump'],
      'jumpSide':     [0.000, 'jumpSide'],
      'fall':         [0.000, 'fall'],
      'pose':         [0.000, 'pose'],
      'flip1':        [0.000, 'flip1'],
      'flip2':        [0.000, 'flip2'],
      'jumpBack':     [0.000, 'jumpBack'],
      'fallBuried':   [0.000, 'fallBuried'],
      'fallSit':      [0.000, 'fallSit'],
      'moveUp':       [0.200, 'moveUp', 'moveSide2'],
      'moveSide':     [0.150, 'moveSide2', 'moveSide1'],
      'stand':        [0.000, 'moveSide1'],
      'movePush':     [0.000, 'movePush'],
      'stare':        [0.000, 'stare']
    }
  },
  tree: {
    src: 'data/skifree-sprites.png',
    frames: {
      'default': [134, 99, 28, 32, 148, 130],
      'move1':   [164, 99, 28, 32, 177, 130],
      'move2':   [194, 99, 26, 32, 207, 130]
    },
    animations: {
      'default': [1.000, 'move2', 'move1']
    }
  },
  largeTree: {
    src: 'data/skifree-sprites.png',
    frames: {
      'default': [100, 67, 32, 64, 116, 130]
    }
  },
  deadTree: {
    src: 'data/skifree-sprites.png',
    frames: {
      'default': [4,  104, 22, 27, 15, 130],
      'burn1':   [28, 104, 22, 27, 39, 130],
      'burn2':   [52, 104, 22, 27, 63, 130],
      'burn3':   [76, 104, 22, 27, 87, 130]
    },
    animations: {
      'default': [0.000, 'default'],
      'burn':    [0.040, 'burn1', 'burn2', 'burn3']
    }
  },
  rock: {
    src: 'data/skifree-sprites.png',
    frames: {
      'default': [244, 120, 21, 11, 254, 130]
    }
  },
  bumpSmall1: {
    src: 'data/skifree-sprites.png',
    frames: {
      'default': [301, 115, 13, 3, 307, 116]
    }
  },
  bumpSmall2: {
    src: 'data/skifree-sprites.png',
    frames: {
      'default': [301, 120, 13, 4, 307, 122]
    }
  },
  bumpSmall3: {
    src: 'data/skifree-sprites.png',
    frames: {
      'default': [301, 126, 13, 5, 307, 129]
    }
  },
  bumpLarge1: {
    src: 'data/skifree-sprites.png',
    frames: {
      'default': [316, 114, 23, 3, 327, 115]
    }
  },
  bumpLarge2: {
    src: 'data/skifree-sprites.png',
    frames: {
      'default': [316, 119, 23, 4, 327, 121]
    }
  },
  bumpLarge3: {
    src: 'data/skifree-sprites.png',
    frames: {
      'default': [316, 125, 23, 6, 327, 129]
    }
  },
  mushroom: {
    src: 'data/skifree-sprites.png',
    frames: {
      'default': [235, 124, 5, 7, 238, 130]
    }
  },
  treeStump: {
    src: 'data/skifree-sprites.png',
    frames: {
      'default': [222, 121, 10, 10, 227, 130]
    }
  },
  ramp: {
    src: 'data/skifree-sprites.png',
    frames: {
      'small': [266, 121, 33, 10, 283, 124],
      'large': [266, 101, 33, 18, 283, 106]
    }
  },
  mushroomCircle: {
    src: 'data/skifree-sprites.png',
    frames: {
      'default': [341, 105, 33, 26, 357, 118]
    }
  },
  snowman: {
    src: 'data/skifree-sprites.png',
    frames: {
      'default': [376, 105, 16, 26, 384, 130],
      'smashed': [394, 116, 22, 15, 403, 130]
    }
  },
  log: {
    src: 'data/skifree-sprites.png',
    frames: {
      'default': [222, 110, 24, 9, 233, 118]
    }
  },
  liftPole: {
    src: 'data/skifree-sprites.png',
    frames: {
      'default': [142, 2, 40, 65, 162, 64]
    }
  },
  dog: {
    src: 'data/skifree-sprites.png',
    frames: {
      'walk1': [2,  253, 20, 15, 9,  268],
      'walk2': [24, 253, 21, 15, 33, 268],
      'sit1':  [47, 254, 14, 14, 53, 268],
      'sit2':  [63, 254, 16, 14, 71, 268]
    },
    animations: {
      'walk': [0.100, 'walk1', 'walk2'],
      'sit':  [0.050, 'sit1', 'sit2']
    }
  },
  pee: {
    src: 'data/skifree-sprites.png',
    frames: {
      'default': [81, 263, 16, 5, 88, 260]
    }
  },
  newbie: {
    src: 'data/skifree-sprites.png',
    frames: {
      'ski1':   [2,  271, 22, 28, 12, 291],
      'ski2':   [26, 271, 21, 28, 38, 291],
      'failed': [49, 275, 24, 24, 61, 293]
    }
  },
  liftchair: {
    src: 'data/skifree-sprites.png',
    frames: {
      'down':        [30,  35, 26, 30, 43,  64],
      'up-occupied': [58,  33, 26, 32, 71,  60],
      'up':          [86,  37, 26, 28, 99,  64],
      'up-yeti':     [114, 28, 26, 37, 127, 56]
    }
  },
  movingtree: {
    src: 'data/skifree-sprites.png',
    frames: {
      'default': [194, 99, 26, 32, 207, 130],
      'move':    [164, 99, 28, 32, 178, 130]
    }
  },
  snowboarder: {
    src: 'data/skifree-sprites.png',
    frames: {
      'left':  [2,   304, 20, 29, 13,  323],
      'right': [24,  303, 26, 30, 37,  324],
      'flip1': [52,  302, 25, 31, 71,  319],
      'flip2': [79,  301, 32, 32, 94,  307],
      'flip3': [113, 304, 30, 29, 121, 320]
    },
    animations: {
      'left':  [0.000, 'left'],
      'right': [0.000, 'right'],
      'flip':  [0.100, 'flip1', 'flip2', 'flip3']
    }
  },
  yeti: {
    src: 'data/skifree-sprites.png',
    frames: {
      'jump1': [2,   211, 32, 40, 15,  250],
      'jump2': [36,  209, 28, 42, 48,  249],
      'run1':  [66,  208, 25, 43, 74,  248],
      'run2':  [93,  213, 30, 38, 105, 250],
      'eat1':  [125, 210, 33, 41, 138, 250],
      'eat2':  [159, 210, 29, 41, 169, 250],
      'eat3':  [190, 210, 29, 41, 200, 250],
      'eat4':  [221, 210, 23, 41, 231, 250],
      'pick1': [246, 214, 26, 37, 256, 250],
      'pick2': [274, 214, 26, 37, 285, 250]
    },
    animations: {
      'jump': [0.400, 'jump1:jump', 'jump2'],
      'run':  [0.120, 'run1', 'run2'],
      'eat':  [0.280, 'eat1', 'eat2', 'eat3', 'eat4:eatdone'],
      'pick': [0.140, 'pick1', 'pick2', 'pick1', 'pick2', 'pick1', 'pick2:pickdone']
    }
  }
};
