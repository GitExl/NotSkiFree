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
import {Input} from '../input';

import {SystemPosition, ComponentPosition} from '../systems/position';
import {SystemRender, ComponentRender} from '../systems/render';
import {ComponentScript, ScriptHandler} from '../systems/script';
import {ComponentCollision, CollisionType, CollisionEvent} from '../systems/collision';
import {SystemAnimation, ComponentAnimation} from '../systems/animation';
import {SystemID} from '../systems/ids';


// Base movement speed.
const SKIER_SPEED: number = 2.2;

// Speed at which the pawn turns.
const SKIER_TURN_SPEED: number = 13.0;

// How much Z force is applied when a jump is performed.
const SKIER_JUMP_FORCE: number = 3.00;

// The base speed is multiplied by this each push.
const SKIER_PUSH_MULTIPLIER: number = 1.045;

// The maximum speed.
const SKIER_SPEED_MAX: number = 4.0;

// Time in seconds between successive pushes.
const SKIER_PUSH_DELAY: number = 0.75;

// The multiplier used to slow down the pawn if it has not pushed for the delay time.
const SKIER_SLOWDOWN: number = 0.94;

// The minimum height from the top at which obstacles should be hit in order for the pawn to jump off and over them.
const SKIER_OBSTACLE_JUMP_HEIGHT: number = 5;

// How much Z force is applied for a perfect obstacle jump.
const SKIER_OBSTACLE_JUMP_FORCE: number = 8;


// Score for a back or a completed forward flip
const SCORE_FLIP: number = 500;

// Score for a completed turn.
const SCORE_TURN: number = 300;

// Score for a single sideways pose.
const SCORE_POSE: number = 1000;

// Score multiplier for each unit of maximum speed.
const SCORE_MAX_SPEED: number = 50;
const SCORE_SPEED_MIN: number = 6;

// Base score for average height.
const SCORE_MAX_HEIGHT: number = 25;
const SCORE_HEIGHT_MIN: number = 9;

// Score multiplier for a perfect landing.
const SCORE_MULTIPLIER_LANDING: number = 2;

// Maximum score for hitting the exact top of an obstacle for every unit of the obstacle's height.
const SCORE_OBSTACLE_JUMP: number = 500;


// Possible states for the pawn.
enum SkierState {
  GROUND,
  AIR,
  FALL,
  CRASH
}

// Types of possible stunts.
enum StuntType {
  FLIP,
  TURN,
  POSE
}


export class ScriptHandlerSkier extends ScriptHandler {
  private _systemAnim: SystemAnimation;

  private _anim: ComponentAnimation;
  private _pos: ComponentPosition;
  private _rend: ComponentRender;

  private _angle: number = 0;
  private _state: SkierState = SkierState.GROUND;
  private _posing: boolean = false;
  private _flip: number = 0;
  private _crashedHard: boolean = false;

  private _maxVelocity: number = SKIER_SPEED;
  private _pushTimer: number = 0;

  private _stuntFlips: number = 0;
  private _stuntTurns: number = 0;
  private _stuntPoses: number = 0;
  private _maxSpeed: number = 0;
  private _maxHeight: number = 0;
  private _obstaclesHit: number = 0;

  private _score: number = 0;


  public create() {
    this._systemAnim = <SystemAnimation>this._entities.getSystem(SystemID.ANIMATION);

    this._anim = <ComponentAnimation>this._entities.getComponent(SystemID.ANIMATION, this._id);
    this._pos = <ComponentPosition>this._entities.getComponent(SystemID.POSITION, this._id);
    this._rend = <ComponentRender>this._entities.getComponent(SystemID.RENDER, this._id);

    this._entities.addEventListener(this._id, 'position:touchGround', this.touchGround.bind(this));
    this._entities.addEventListener(this._id, 'collision:source', this.collide.bind(this));
  }

  private collide(event: EntityEvent, collision: CollisionEvent) {
    if (collision.blockMovement) {
      let coll2: ComponentCollision = <ComponentCollision>this._entities.getComponent(SystemID.COLLISION, event.sourceID);
      let pos2: ComponentPosition = <ComponentPosition>this._entities.getComponent(SystemID.POSITION, event.sourceID);

      // Test if an obstacle was hit at or above the jump height point.
      // The pawn can "jump off" past this height.
      let spot: number = coll2.height - (this._pos.z - pos2.z);
      if (this._angle === 90 && this._state === SkierState.AIR && spot <= SKIER_OBSTACLE_JUMP_HEIGHT) {
        let precision: number = spot / SKIER_OBSTACLE_JUMP_HEIGHT;

        this._pos.velZ += 1.0 + (precision * SKIER_OBSTACLE_JUMP_FORCE);
        this._pos.z = pos2.z + coll2.height;

        this._obstaclesHit += 1;

        this.increaseScore(precision * SCORE_OBSTACLE_JUMP * coll2.height);

      // Hit too low, crash or fall instead.
      } else {
        if (this._pos.z <= 0) {
          this.crash(true);
        } else {
          this._state = SkierState.FALL;
        }

        this.resetScores();
      }

      // Move the pawn just past the obstacle.
      let coll: ComponentCollision = <ComponentCollision>this._entities.getComponent(SystemID.COLLISION, this._id);
      this._pos.y = pos2.y + (coll2.depth / 2) + (coll.depth / 2) + 0.1;

      // Do not block the movement that caused the collision.
      collision.blockMovement = false;
    }
  }

  private touchGround(id: EntityID) {
    switch (this._state) {
      case SkierState.AIR:

        // Test if we need to crash.
        if (this._flip > 0 || this._posing || this._angle === 270) {
          this.crash(this._pos.velZ < -4);

        // Without a crash condition skiing continues as normal.
        } else {
          this._state = SkierState.GROUND;
          this.addScore();
        }
        break;

      case SkierState.FALL:
        this.crash(true);
        break;
    }

    this.resetScores();
  }

  private resetScores() {
    this._stuntFlips = 0;
    this._stuntTurns = 0;
    this._stuntPoses = 0;
    this._maxSpeed = 0;
    this._maxHeight = 0;
    this._obstaclesHit = 0;
  }

  private addScore() {
    if (this._maxSpeed < SCORE_SPEED_MIN) {
      return;
    }
    if (this._maxHeight < SCORE_HEIGHT_MIN) {
      return;
    }

    let score: number = 0;

    score += Math.abs(this._stuntFlips) * SCORE_FLIP;
    score += Math.abs(this._stuntTurns) * SCORE_TURN;
    score += this._stuntPoses * SCORE_POSE;
    score += this._maxSpeed * SCORE_MAX_SPEED;
    score += this._maxHeight * SCORE_MAX_HEIGHT;

    score *= (this._obstaclesHit + 1) * 2;

    // Triple points for a forward landing.
    if (this._angle === 90) {
      score *= SCORE_MULTIPLIER_LANDING;
    }

    this.increaseScore(score);
  }

  private increaseScore(score: number) {
    score = Math.floor(score / 50) * 50;
    if (score === 0) {
      return;
    }

    this._score += score;

    // Create score entity.
    let id: EntityID = this._entities.createFromTemplate('score');

    let pos: ComponentPosition = <ComponentPosition>this._entities.getComponent(SystemID.POSITION, id);
    pos.x = this._pos.x;
    pos.y = this._pos.y;
    pos.z = this._pos.z;
    pos.velY = -2.0 + this._pos.velY * 0.6;

    let script: ComponentScript = <ComponentScript>this._entities.getComponent(SystemID.SCRIPT, id);
    script.data.score = score;
  }

  private crash(hard: boolean) {
    this._angle = 90;
    this._flip = 0;
    this._posing = false;
    this._crashedHard = hard;
    this._maxVelocity = SKIER_SPEED;

    // Crashing hard stops motion.
    if (hard) {
      this.addScore
      this._pos.velX = 0;
      this._pos.velY = 0;
      this.increaseScore(-1500);

    // Crashing normally only reduces Y motion.
    } else {
      this._pos.velY *= 0.15;
      this.increaseScore(-500);

    }

    this._state = SkierState.CRASH;
  }

  private stunt(type: StuntType, value: number) {
    switch (type) {
      case StuntType.FLIP: this._stuntFlips += value; break;
      case StuntType.TURN: this._stuntTurns += value; break;
      case StuntType.POSE: this._stuntPoses += value; break;
    }
  }

  public input(input: Input) {

    // See if we were launched into the air by external means.
    if (this._pos.z > 0 && this._state === SkierState.GROUND) {
      this._state = SkierState.AIR;
      this._angle = 90;
    }

    switch (this._state) {
      case SkierState.GROUND:

        // Jump.
        if (input.keysActive.jump) {
          this._angle = 90;
          this._pos.velZ += SKIER_JUMP_FORCE;
          this._state = SkierState.AIR;

        // Move down immediately.
        } else if (input.keysActive.down) {
          if (this._angle === 90 && this._pushTimer <= 0) {
            this._maxVelocity = Math.min(SKIER_SPEED_MAX, this._maxVelocity * SKIER_PUSH_MULTIPLIER);
            this._pushTimer = SKIER_PUSH_DELAY;
          }
          this._angle = 90;

        // Move up if facing sideways.
        } else if (input.keysActive.up) {
          if (this._angle === 180 || this._angle === 0) {
            this._pos.velY -= SKIER_SPEED / 12;
          }

        // Move left if facing sideways, otherwise turn left.
        } else if (input.keysActive.left) {
          if (this._angle === 180) {
            this._pos.velX -= SKIER_SPEED / 7;
          } else {
            this._angle += SKIER_TURN_SPEED;
          }

        // Move right if facing sideways, otherwise turn right.
        } else if (input.keysActive.right) {
          if (this._angle === 0) {
            this._pos.velX += SKIER_SPEED / 7;
          } else {
            this._angle -= SKIER_TURN_SPEED;
          }

        // If there was no input, round off the angle for more precise control.
        } else {
          this._angle = Math.round(this._angle / 30) * 30;

        }

        // Clamp angle to valid values for this state.
        this._angle = Math.min(180, Math.max(0, this._angle));

        break;

      case SkierState.AIR:

        // Turn left.
        if (input.keysDown.left) {
          this._angle += 90;
          this._flip = 0;
          this.stunt(StuntType.TURN, -1);

        // Turn right.
        } else if (input.keysDown.right) {
          this._angle -= 90;
          this._flip = 0;
          this.stunt(StuntType.TURN, 1);

        // Flip upwards or toggle pose if facing sideways.
        } else if (input.keysDown.up) {
          if (this._angle === 90 || this._angle === 270) {
            this._flip += 1;
            if (this._flip > 2) {
              this._flip = 0;
            }
            this.stunt(StuntType.FLIP, -1);

          } else {
            this._posing = !this._posing;

            if (this._posing) {
              this.stunt(StuntType.POSE, 1);
            }
          }

        // Flip backwards or toggle pose if facing sideways.
        } else if (input.keysDown.down) {
          if (this._angle === 90 || this._angle === 270) {
            this._flip -= 1;
            if (this._flip < 0) {
              this._flip = 2;
            }
            this.stunt(StuntType.FLIP, 1);

          } else {
            this._posing = !this._posing;

            if (this._posing) {
              this.stunt(StuntType.POSE, 1);
            }
          }
        }

        // Wrap around the current angle.
        if (this._angle < 0) {
          this._angle = 360 + this._angle;
        } else if (this._angle >= 360) {
          this._angle = this._angle - 360;
        }

        break;

      case SkierState.FALL:
        break;

      case SkierState.CRASH:
        if (input.keysDown.left || input.keysDown.right || input.keysDown.down) {
          if (this._crashedHard) {
            this._crashedHard = false;
          } else {
            this._state = SkierState.GROUND;
            if (input.keysDown.left) {
              this._angle = 180;
            } else if (input.keysDown.right) {
              this._angle = 0;
            }
          }
        }
        break;
    }
  }

  private setVelocity() {
    let angle: number = Math.round(this._angle / 30) * 30;
    let radAngle: number = angle * (Math.PI / 180);

    switch (this._state) {
      case SkierState.GROUND:

        // Move forwards.
        if (angle === 90) {
          this._pos.velY += this._maxVelocity;

        // Move at an angle.
        } else if (angle === 120 || angle === 60 || angle === 150 || angle === 30) {
          this._pos.velX += Math.cos(radAngle) * this._maxVelocity;
          this._pos.velY += Math.sin(radAngle) * this._maxVelocity;
        }

        break;
    }
  }

  private setAnimation() {
    let angle: number = Math.round(this._angle / 30) * 30;

    switch (this._state) {
      case SkierState.GROUND:

        // Facing down.
        if (angle === 90) {
          if (this._pushTimer > SKIER_PUSH_DELAY * 0.9) {
            this._systemAnim.play(this._id, 'movePush', 1.0);
          } else {
            this._systemAnim.play(this._id, 'moveDown', this._pos.velY / 16);
          }

        // Facing sideways.
        } else if (angle === 180 || angle === 0) {
          if (this._pos.velY < 0) {
            this._systemAnim.play(this._id, 'moveUp', Math.abs(this._pos.velY / 2));

          } else if (this._pos.velX !== 0) {
            this._systemAnim.play(this._id, 'moveSide', Math.abs(this._pos.velX / 5.5));

          } else {
            this._systemAnim.play(this._id, 'stand', 1.0);
          }

        // 30 degree diagonal.
        } else if (angle === 150 || angle === 30) {
          let len: number = Math.sqrt(this._pos.velX * this._pos.velX + this._pos.velY * this._pos.velY);
          this._systemAnim.play(this._id, 'moveDiag1', Math.abs(len / 15.75));

        // 60 degree diagonal.
        } else if (angle === 120 || angle === 60) {
          let len: number = Math.sqrt(this._pos.velX * this._pos.velX + this._pos.velY * this._pos.velY);
          this._systemAnim.play(this._id, 'moveDiag2', Math.abs(len / 15.75));
        }

        break;

      case SkierState.AIR:

        // Facing down or flipping.
        if (angle === 90) {
          if (this._flip === 0) {
            this._systemAnim.play(this._id, 'jump', 1.0);
          } else if (this._flip === 1) {
            this._systemAnim.play(this._id, 'flip1', 1.0);
          } else if (this._flip === 2) {
            this._systemAnim.play(this._id, 'flip2', 1.0);
          }

        // Turned to the side or posing.
        } else if (angle === 0 || angle === 180) {
          if (this._posing) {
            this._systemAnim.play(this._id, 'pose', 1.0);
          } else {
            this._systemAnim.play(this._id, 'jumpSide', 1.0);
          }

        // Facing back or flipping.
        } else if (angle === 270) {
          if (this._flip === 0) {
            this._systemAnim.play(this._id, 'jumpBack', 1.0);
          } else if (this._flip === 1) {
            this._systemAnim.play(this._id, 'flip1', 1.0);
          } else if (this._flip === 2) {
            this._systemAnim.play(this._id, 'flip2', 1.0);
          }
        }

        break;

      case SkierState.FALL:
        this._systemAnim.play(this._id, 'fall', 1.0);
        break;

      case SkierState.CRASH:
        if (this._crashedHard) {
          this._systemAnim.play(this._id, 'fallBuried', 1.0);
        } else {
          this._systemAnim.play(this._id, 'fallSit', 1.0);
        }
        break;
    }

    // Flip sprite based on angle.
    this._rend.flipX = (angle > 90);
  }

  public update(delta: number) {
    if (this._pushTimer > 0) {
      this._pushTimer -= delta;
    } else {
      this._maxVelocity = SKIER_SPEED + (this._maxVelocity - SKIER_SPEED) * SKIER_SLOWDOWN;
    }

    if (this._pos.z > 0) {
      let len: number = Math.sqrt(this._pos.velX * this._pos.velX + this._pos.velY * this._pos.velY);
      this._maxSpeed = Math.max(this._maxSpeed, len);
      this._maxHeight = Math.max(this._maxHeight, this._pos.z);
    }

    this.setVelocity();
    this.setAnimation();
  }

  public get score(): number {
    return this._score;
  }
}
