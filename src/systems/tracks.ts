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
import {ComponentPosition} from '../systems/position';
import {SystemID} from '../systems/ids';
import {Input} from '../input';
import {Render, Coords} from '../render';
import {Camera} from '../camera';
import {Entities, EntityID} from '../entities';


interface Track {
  decal: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  time: number;
}

export interface ComponentTracks extends Component {
  decal: string;
  duration: number;
  parts: Track[];
}


const MAX_SIMPLIFY_ANGLE: number = 2.5 / (180 / Math.PI);


/**
 * Makes an entity leaves tracks behind in the form of decals.
 */
export class SystemTracks extends System {
  private _time: number = 0.0;
  private _orphans: ComponentTracks[] = [];

  public init(): Component {
    return <ComponentTracks>{
      decal: 'skies',
      duration: 10,
      parts: []
    };
  }

  public remove(id: EntityID) {

    // Orphan the entity's tracks so that we can continue drawing it until it is empty.
    let track: ComponentTracks = <ComponentTracks>this._components[id];
    if (track) {
      this._orphans.push(track);
    }

    super.remove(id);
  }

  public render(render: Render, camera: Camera, lerp: number) {

    // Draw orphaned tracks.
    for (let track of this._orphans) {
      for (let part of track.parts) {
        let alpha: number = 1.0 - ((this._time - part.time) / track.duration);
        render.drawDecal(Coords.WORLD, part.x1, part.y1, part.x2, part.y2, part.decal, alpha);
      }
    }

    // Draw tracks that have entities attached.
    for (let id in this._components) {
      let track: ComponentTracks = <ComponentTracks>this._components[id];
      for (let part of track.parts) {
        let alpha: number = 1.0 - ((this._time - part.time) / track.duration);
        render.drawDecal(Coords.WORLD, part.x1, part.y1, part.x2, part.y2, part.decal, alpha);
      }
    }
  }

  public update(delta: number) {
    let track: ComponentTracks;
    let pos: ComponentPosition;
    let lastTrack: Track;
    let lastAngle: number;
    let angle: number;

    this._time += delta;

    // Prune orhaned component tracks.
    for (let index: number = 0; index < this._orphans.length; index++) {
      track = this._orphans[index];

      this.pruneTrackParts(track);
      if (!track.parts.length) {
        this._orphans.splice(index, 1);
        index -= 1;
      }
    }

    for (let id in this._components) {
      track = <ComponentTracks>this._components[id];
      pos = <ComponentPosition>this._entities.getComponent(SystemID.POSITION, id);

      // Prune old track parts.
      this.pruneTrackParts(track);

      if ((pos.x !== pos.lastX || pos.y != pos.lastY) && pos.z <= 0) {
        if (pos.lastX || pos.lastY) {
          lastTrack = track.parts[track.parts.length - 1];

          // Determine if we can extend the previous track if it continues into the current track and the difference
          // in angles is small enough.
          if (lastTrack && pos.lastX === lastTrack.x2 && pos.lastY === lastTrack.y2) {
            lastAngle = Math.atan2(lastTrack.y2 - lastTrack.y1, lastTrack.x2 - lastTrack.x1);
            angle = Math.atan2(pos.y - pos.lastY, pos.x - pos.lastX);

            if (Math.abs(angle - lastAngle) < MAX_SIMPLIFY_ANGLE) {
              lastTrack.x2 = pos.x;
              lastTrack.y2 = pos.y;
              lastTrack.time = this._time;
              continue;
            }
          }

          // Add a new track segment.
          track.parts.push({
            x1: pos.lastX,
            y1: pos.lastY,
            x2: pos.x,
            y2: pos.y,
            decal: track.decal,
            time: this._time
          });
        }
      }
    }
  }

  /**
   * Removes old track parts by finding the last part that is too old and slicing off the
   * beginning of the array.
   */
  private pruneTrackParts(track: ComponentTracks) {
    if (!track.parts.length) {
      return;
    }
    if (this._time - track.parts[0].time < track.duration) {
      return;
    }

    if (track.parts.length === 1) {
      track.parts.length = 0;
      return;
    }

    for (let index: number = 0; index < track.parts.length; index++) {
      if (this._time - track.parts[index].time < track.duration) {
        track.parts = track.parts.slice(index);
        break;
      }
    }
  }

  public get name(): string {
    return 'tracks';
  }

  public get id(): SystemID {
    return SystemID.TRACKS;
  }
}
