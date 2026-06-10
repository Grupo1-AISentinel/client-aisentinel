/**
 * Bones esperados del humanoide base (Rigify HUMANOID). Si el .glb del
 * humanoide no tiene estos huesos con este prefijo, el remap va a fallar
 * o las prendas se renderearan en bind parcial / T-pose.
 *
 * Mantener este array sincronizado con el rig que se use en Blender.
 */
export const EXPECTED_HUMANOID_BONES = [
  'DEF-spine',
  'DEF-pelvis',
  'DEF-pelvis.L',
  'DEF-pelvis.R',
  'DEF-thigh.L',
  'DEF-thigh.R',
  'DEF-shoulder.L',
  'DEF-shoulder.R',
  'DEF-upper_arm.L',
  'DEF-upper_arm.R',
];
