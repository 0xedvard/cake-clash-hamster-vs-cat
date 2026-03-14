export function sanitizeJumpClip(clip) {
  const sanitizedClip = clip.clone();
  const originalTrackNames = sanitizedClip.tracks.map((track) => track.name);
  const modifiedTracks = [];
  const removedTracks = [];

  sanitizedClip.tracks = sanitizedClip.tracks.filter((track) => {
    if (!isSanitizablePositionTrack(track)) {
      return true;
    }

    const valueSize = typeof track.getValueSize === "function" ? track.getValueSize() : 3;

    if (valueSize < 3) {
      removedTracks.push(track.name);
      return false;
    }

    const baselineY = track.values[1] ?? 0;

    for (let index = 1; index < track.values.length; index += valueSize) {
      track.values[index] = baselineY;
    }

    modifiedTracks.push(track.name);
    return true;
  });

  console.log("Jump clip original tracks:", originalTrackNames);
  console.log("Jump clip sanitized tracks:", modifiedTracks);

  if (removedTracks.length > 0) {
    console.log("Jump clip removed tracks:", removedTracks);
  }

  return sanitizedClip;
}

function isSanitizablePositionTrack(track) {
  if (!track?.name) {
    return false;
  }

  const trackName = track.name.toLowerCase();

  if (!trackName.endsWith(".position")) {
    return false;
  }

  return [
    "root",
    "hips",
    "mixamorighips",
    "mixamorig:hips",
    "armature",
    "pelvis"
  ].some((token) => trackName.includes(token));
}
