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

import {Render} from '../render';
import {EntityID, Entities} from '../entities';
import {Input} from '../input';

import {SystemID} from '../systems/ids';
import {System, Component} from '../systems/system';
import {SystemRender, ComponentRender} from '../systems/render';

import {SPRITES} from 'data/sprites';


interface SpriteAnimationMap { [s: string]: SpriteAnimation; }
interface AnimationMap { [s: string]: Animation; }

export interface ComponentAnimation extends Component {
  animation: string;
  frameIndex: number;
  nextFrameTime: number;
  time: number;
  running: boolean;
  speed: number;
}

interface SpriteAnimation {
  animations: AnimationMap;
}

interface Animation {
  frameTime: number;
  frames: Frame[];
}

interface Frame {
  spriteFrame: string;
  event: string;
  duration: number;
}


/**
 * Frame based animation.
 */
export class SystemAnimation extends System {
  private _render: Render;
  private _animations: SpriteAnimationMap = {};

  constructor(entities: Entities) {
    super(entities);
    this.loadAnimations();
  }

  /**
   * Load animations from basic animation data.
   */
  private loadAnimations() {
    for (let spriteName in SPRITES) {
      let sprite: any = SPRITES[spriteName];
      this._animations[spriteName] = {
        animations: {}
      };

      for (let animName in sprite.animations) {
        let baseAnim: any = sprite.animations[animName];

        let anim: Animation = {
          frameTime: baseAnim[0],
          frames: []
        };

        for (let frameKey of baseAnim.slice(1)) {
          let index: number = frameKey.indexOf(':');

          let event: string;
          let spriteFrame: string;
          if (index !== -1) {
            event = frameKey.substr(index + 1);
            spriteFrame = frameKey.substr(0, index);
          } else {
            spriteFrame = frameKey;
          }

          anim.frames.push(<Frame>{
            spriteFrame: spriteFrame,
            event: event,
            duration: anim.frameTime
          });
        }

        this._animations[spriteName].animations[animName] = anim;
      }
    }
  }

  public init(): Component {
    return <ComponentAnimation>{
      animation: undefined,
      frameIndex: 0,
      nextFrameTime: 0,
      time: 0,
      running: false,
      speed: 1.0
    };
  }

  public finalize(id: string) {
    let anim: ComponentAnimation = <ComponentAnimation>this._components[id];
    this.setAnimation(id, anim.animation, anim.speed, true);
  }

  public update(delta: number) {
    let rend: ComponentRender;
    let anim: ComponentAnimation;
    let spriteAnim: Animation;
    let frame: Frame;

    for (let id in this._components) {
      anim = <ComponentAnimation>this._components[id];

      if (!anim.running || !anim.nextFrameTime) {
        continue;
      }

      anim.time += delta * anim.speed;

      // Wait until enough time has passed.
      while (anim.time >= anim.nextFrameTime) {
        rend = <ComponentRender>this._entities.getComponent(SystemID.RENDER, id);
        spriteAnim = this._animations[rend.sprite].animations[anim.animation];

        // Advance to the next frame.
        anim.frameIndex++;
        if (anim.frameIndex >= spriteAnim.frames.length) {
          anim.frameIndex = 0;
        }

        // Set the current frame's sprite and trigger it's event if any.
        frame = spriteAnim.frames[anim.frameIndex];
        this.setFrame(id, anim, rend, frame);

        anim.time -= spriteAnim.frameTime;
      }
    }
  }

  private setFrame(id: EntityID, anim: ComponentAnimation, rend: ComponentRender, frame: Frame) {
    rend.frame = frame.spriteFrame;
    anim.nextFrameTime = frame.duration;

    if (frame.event) {
      this._entities.triggerEvent(id, id, 'animation:' + frame.event);
    }
  }

  /**
   * Start an entity's current animation.
   */
  public start(id: EntityID) {
    let anim: ComponentAnimation = <ComponentAnimation>this._components[id];
    anim.running = true;
  }

  /**
   * Stop an entity's current animation.
   */
  public stop(id: EntityID) {
    let anim: ComponentAnimation = <ComponentAnimation>this._components[id];
    anim.running = false;
  }

  /**
   * Actually set an entity's animation. Use setAnimation to avoid resetting an already playing animation.
   */
  public set(id: EntityID, name: string, speed: number) {
    this.setAnimation(id, name, speed);
  }

  /**
   * Start playing a new animation on an entity.
   */
  public play(id: EntityID, name: string, speed: number) {
    let anim: ComponentAnimation = this.setAnimation(id, name, speed);
    if (anim) {
      anim.running = true;
    }
  }

  /**
   * Sets a new animation for an entity.
   */
  private setAnimation(id: EntityID, name: string, speed: number, force: boolean = false): ComponentAnimation {
    let anim: ComponentAnimation = <ComponentAnimation>this._components[id];
    anim.speed = speed;

    if (!force && anim.animation === name) {
      return undefined;
    }

    let rend: ComponentRender = <ComponentRender>this._entities.getComponent(SystemID.RENDER, id);
    if (!(name in this._animations[rend.sprite].animations)) {
      throw Error(`Unknown animation "{$name}" for sprite "{$rend.sprite}".`);
    }
    let spriteAnim: Animation = this._animations[rend.sprite].animations[name];

    anim.animation = name;
    anim.frameIndex = 0;
    anim.time = 0;

    this.setFrame(id, anim, rend, spriteAnim.frames[0]);

    return anim;
  }

  public get name(): string {
    return 'animation';
  }

  public get id(): SystemID {
    return SystemID.ANIMATION;
  }
}
