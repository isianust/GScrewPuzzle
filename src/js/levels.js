// ========== LEVEL DEFINITIONS ==========
// Each level: { plates: [{x,y,w,h,z}], screws: [{x,y,color,plateIds:[]}], par: N }
// Board coordinates: 400 x 480 space
// Colors must appear in multiples of 3 for solvability
// plateIds: which plates this screw holds down (can be shared between plates)
export const Levels = [

  // ---- LEVEL 1: First Steps (Tutorial - no overlap, no blocking) ----
  {
    plates: [
      { x: 20,  y: 80,  w: 160, h: 130, z: 1 },
      { x: 220, y: 80,  w: 160, h: 130, z: 1 }
    ],
    screws: [
      { x: 55,  y: 115, color: 'red',  plateIds: [0] },
      { x: 145, y: 115, color: 'red',  plateIds: [0] },
      { x: 100, y: 175, color: 'red',  plateIds: [0] },
      { x: 255, y: 115, color: 'blue', plateIds: [1] },
      { x: 345, y: 115, color: 'blue', plateIds: [1] },
      { x: 300, y: 175, color: 'blue', plateIds: [1] }
    ],
    par: 6
  },

  // ---- LEVEL 2: Learning Layers (1 blocked screw) ----
  // P1 (z:2) covers part of P0 (z:1). One red screw is under P1.
  {
    plates: [
      { x: 20,  y: 40,  w: 225, h: 195, z: 1 },
      { x: 150, y: 100, w: 220, h: 175, z: 2 }
    ],
    screws: [
      { x: 60,  y: 80,  color: 'red',  plateIds: [0] },
      { x: 60,  y: 180, color: 'red',  plateIds: [0] },
      { x: 195, y: 170, color: 'red',  plateIds: [0] },
      { x: 215, y: 145, color: 'blue', plateIds: [1] },
      { x: 320, y: 145, color: 'blue', plateIds: [1] },
      { x: 270, y: 235, color: 'blue', plateIds: [1] }
    ],
    par: 6
  },

  // ---- LEVEL 3: Triple Play (2 blocked screws) ----
  // P2 (z:2) covers junction of P0 and P1 (both z:1).
  {
    plates: [
      { x: 15,  y: 25,  w: 190, h: 145, z: 1 },
      { x: 195, y: 25,  w: 190, h: 145, z: 1 },
      { x: 80,  y: 110, w: 240, h: 160, z: 2 }
    ],
    screws: [
      { x: 55,  y: 60,  color: 'red',   plateIds: [0] },
      { x: 155, y: 60,  color: 'red',   plateIds: [0] },
      { x: 130, y: 140, color: 'red',   plateIds: [0] },
      { x: 250, y: 60,  color: 'blue',  plateIds: [1] },
      { x: 345, y: 60,  color: 'blue',  plateIds: [1] },
      { x: 270, y: 140, color: 'blue',  plateIds: [1] },
      { x: 140, y: 185, color: 'green', plateIds: [2] },
      { x: 260, y: 185, color: 'green', plateIds: [2] },
      { x: 200, y: 240, color: 'green', plateIds: [2] }
    ],
    par: 9
  },

  // ---- LEVEL 4: Chain Reaction (chain blocking: z1→z2→z3) ----
  // Must clear z3, then z2, then z1 to access all screws.
  {
    plates: [
      { x: 15,  y: 30,  w: 185, h: 135, z: 1 },
      { x: 110, y: 100, w: 180, h: 130, z: 2 },
      { x: 210, y: 30,  w: 175, h: 125, z: 3 }
    ],
    screws: [
      { x: 50,  y: 65,  color: 'red',   plateIds: [0] },
      { x: 50,  y: 130, color: 'red',   plateIds: [0] },
      { x: 155, y: 130, color: 'red',   plateIds: [0] },
      { x: 155, y: 145, color: 'green', plateIds: [1] },
      { x: 245, y: 145, color: 'green', plateIds: [1] },
      { x: 200, y: 200, color: 'green', plateIds: [1] },
      { x: 255, y: 60,  color: 'blue',  plateIds: [2] },
      { x: 345, y: 60,  color: 'blue',  plateIds: [2] },
      { x: 345, y: 125, color: 'blue',  plateIds: [2] }
    ],
    par: 9
  },

  // ---- LEVEL 5: Four's a Crowd (4 colors, 2 blocked) ----
  {
    plates: [
      { x: 20,  y: 20,  w: 170, h: 145, z: 1 },
      { x: 210, y: 20,  w: 170, h: 145, z: 1 },
      { x: 50,  y: 120, w: 300, h: 175, z: 2 }
    ],
    screws: [
      { x: 55,  y: 55,  color: 'red',    plateIds: [0] },
      { x: 145, y: 55,  color: 'red',    plateIds: [0] },
      { x: 105, y: 140, color: 'red',    plateIds: [0] },
      { x: 255, y: 55,  color: 'blue',   plateIds: [1] },
      { x: 340, y: 55,  color: 'blue',   plateIds: [1] },
      { x: 295, y: 140, color: 'blue',   plateIds: [1] },
      { x: 110, y: 195, color: 'yellow', plateIds: [2] },
      { x: 200, y: 195, color: 'yellow', plateIds: [2] },
      { x: 290, y: 195, color: 'yellow', plateIds: [2] },
      { x: 140, y: 260, color: 'green',  plateIds: [2] },
      { x: 200, y: 260, color: 'green',  plateIds: [2] },
      { x: 260, y: 260, color: 'green',  plateIds: [2] }
    ],
    par: 12
  },

  // ---- LEVEL 6: Tower of Plates (vertical chain blocking) ----
  // P1 covers bottom of P0; P2 covers bottom of P1.
  {
    plates: [
      { x: 55,  y: 10,  w: 290, h: 120, z: 1 },
      { x: 70,  y: 90,  w: 260, h: 120, z: 2 },
      { x: 90,  y: 175, w: 220, h: 110, z: 3 }
    ],
    screws: [
      { x: 105, y: 40,  color: 'red',   plateIds: [0] },
      { x: 295, y: 40,  color: 'red',   plateIds: [0] },
      { x: 200, y: 108, color: 'red',   plateIds: [0] },
      { x: 115, y: 130, color: 'blue',  plateIds: [1] },
      { x: 285, y: 130, color: 'blue',  plateIds: [1] },
      { x: 200, y: 190, color: 'blue',  plateIds: [1] },
      { x: 140, y: 220, color: 'green', plateIds: [2] },
      { x: 200, y: 255, color: 'green', plateIds: [2] },
      { x: 260, y: 220, color: 'green', plateIds: [2] }
    ],
    par: 9
  },

  // ---- LEVEL 7: Diamond Cross (4 plates, multi-directional blocking) ----
  {
    plates: [
      { x: 100, y: 10,  w: 200, h: 120, z: 1 },
      { x: 5,   y: 95,  w: 195, h: 125, z: 2 },
      { x: 200, y: 95,  w: 195, h: 125, z: 2 },
      { x: 100, y: 185, w: 200, h: 120, z: 3 }
    ],
    screws: [
      { x: 150, y: 40,  color: 'red',    plateIds: [0] },
      { x: 250, y: 40,  color: 'red',    plateIds: [0] },
      { x: 195, y: 110, color: 'red',    plateIds: [0] },
      { x: 45,  y: 140, color: 'blue',   plateIds: [1] },
      { x: 140, y: 140, color: 'blue',   plateIds: [1] },
      { x: 100, y: 198, color: 'blue',   plateIds: [1] },
      { x: 260, y: 140, color: 'green',  plateIds: [2] },
      { x: 355, y: 140, color: 'green',  plateIds: [2] },
      { x: 300, y: 198, color: 'green',  plateIds: [2] },
      { x: 150, y: 230, color: 'yellow', plateIds: [3] },
      { x: 250, y: 230, color: 'yellow', plateIds: [3] },
      { x: 200, y: 275, color: 'yellow', plateIds: [3] }
    ],
    par: 12
  },

  // ---- LEVEL 8: Shared Bonds (shared screw + blocking) ----
  {
    plates: [
      { x: 15,  y: 30,  w: 200, h: 150, z: 1 },
      { x: 185, y: 30,  w: 200, h: 150, z: 1 },
      { x: 80,  y: 150, w: 240, h: 155, z: 2 }
    ],
    screws: [
      { x: 55,  y: 65,  color: 'red',    plateIds: [0] },
      { x: 140, y: 65,  color: 'red',    plateIds: [0] },
      { x: 130, y: 165, color: 'red',    plateIds: [0] },
      { x: 265, y: 65,  color: 'blue',   plateIds: [1] },
      { x: 345, y: 65,  color: 'blue',   plateIds: [1] },
      { x: 270, y: 165, color: 'blue',   plateIds: [1] },
      { x: 200, y: 100, color: 'green',  plateIds: [0, 1] },
      { x: 155, y: 225, color: 'green',  plateIds: [2] },
      { x: 255, y: 225, color: 'green',  plateIds: [2] },
      { x: 140, y: 275, color: 'purple', plateIds: [2] },
      { x: 200, y: 275, color: 'purple', plateIds: [2] },
      { x: 260, y: 275, color: 'purple', plateIds: [2] }
    ],
    par: 12
  },

  // ---- LEVEL 9: Five-Color Frenzy (4 plates, 5 colors, chain blocking) ----
  {
    plates: [
      { x: 15,  y: 10,  w: 175, h: 120, z: 1 },
      { x: 210, y: 10,  w: 175, h: 120, z: 1 },
      { x: 50,  y: 100, w: 300, h: 120, z: 2 },
      { x: 85,  y: 195, w: 230, h: 120, z: 3 }
    ],
    screws: [
      { x: 55,  y: 45,  color: 'red',    plateIds: [0] },
      { x: 140, y: 45,  color: 'orange', plateIds: [0] },
      { x: 100, y: 108, color: 'red',    plateIds: [0] },
      { x: 260, y: 45,  color: 'blue',   plateIds: [1] },
      { x: 340, y: 45,  color: 'orange', plateIds: [1] },
      { x: 300, y: 108, color: 'blue',   plateIds: [1] },
      { x: 100, y: 145, color: 'green',  plateIds: [2] },
      { x: 200, y: 145, color: 'orange', plateIds: [2] },
      { x: 300, y: 145, color: 'green',  plateIds: [2] },
      { x: 155, y: 205, color: 'purple', plateIds: [2] },
      { x: 245, y: 205, color: 'purple', plateIds: [2] },
      { x: 200, y: 245, color: 'red',    plateIds: [3] },
      { x: 140, y: 280, color: 'blue',   plateIds: [3] },
      { x: 260, y: 280, color: 'green',  plateIds: [3] },
      { x: 200, y: 290, color: 'purple', plateIds: [3] }
    ],
    par: 15
  },

  // ---- LEVEL 10: Lockdown (5 plates, dense blocking) ----
  {
    plates: [
      { x: 15,  y: 5,   w: 180, h: 115, z: 1 },
      { x: 205, y: 5,   w: 180, h: 115, z: 1 },
      { x: 40,  y: 85,  w: 160, h: 135, z: 2 },
      { x: 200, y: 85,  w: 160, h: 135, z: 2 },
      { x: 85,  y: 195, w: 230, h: 115, z: 3 }
    ],
    screws: [
      { x: 55,  y: 35,  color: 'red',    plateIds: [0] },
      { x: 150, y: 35,  color: 'yellow', plateIds: [0] },
      { x: 100, y: 98,  color: 'red',    plateIds: [0] },
      { x: 250, y: 35,  color: 'blue',   plateIds: [1] },
      { x: 340, y: 35,  color: 'yellow', plateIds: [1] },
      { x: 300, y: 98,  color: 'blue',   plateIds: [1] },
      { x: 75,  y: 135, color: 'green',  plateIds: [2] },
      { x: 160, y: 135, color: 'red',    plateIds: [2] },
      { x: 120, y: 195, color: 'green',  plateIds: [2] },
      { x: 240, y: 135, color: 'purple', plateIds: [3] },
      { x: 320, y: 135, color: 'blue',   plateIds: [3] },
      { x: 280, y: 195, color: 'purple', plateIds: [3] },
      { x: 145, y: 245, color: 'yellow', plateIds: [4] },
      { x: 255, y: 245, color: 'green',  plateIds: [4] },
      { x: 200, y: 280, color: 'purple', plateIds: [4] }
    ],
    par: 15
  },

  // ---- LEVEL 11: The V-Formation (5 plates, cascading) ----
  {
    plates: [
      { x: 90,  y: 5,   w: 220, h: 100, z: 1 },
      { x: 5,   y: 70,  w: 180, h: 115, z: 2 },
      { x: 215, y: 70,  w: 180, h: 115, z: 2 },
      { x: 45,  y: 160, w: 150, h: 120, z: 3 },
      { x: 205, y: 160, w: 150, h: 120, z: 3 }
    ],
    screws: [
      { x: 145, y: 30,  color: 'red',    plateIds: [0] },
      { x: 255, y: 30,  color: 'red',    plateIds: [0] },
      { x: 200, y: 82,  color: 'red',    plateIds: [0] },
      { x: 40,  y: 110, color: 'blue',   plateIds: [1] },
      { x: 135, y: 110, color: 'blue',   plateIds: [1] },
      { x: 90,  y: 168, color: 'blue',   plateIds: [1] },
      { x: 265, y: 110, color: 'green',  plateIds: [2] },
      { x: 355, y: 110, color: 'green',  plateIds: [2] },
      { x: 310, y: 168, color: 'green',  plateIds: [2] },
      { x: 85,  y: 205, color: 'yellow', plateIds: [3] },
      { x: 155, y: 205, color: 'yellow', plateIds: [3] },
      { x: 120, y: 250, color: 'yellow', plateIds: [3] },
      { x: 245, y: 205, color: 'purple', plateIds: [4] },
      { x: 315, y: 205, color: 'purple', plateIds: [4] },
      { x: 280, y: 250, color: 'purple', plateIds: [4] }
    ],
    par: 15
  },

  // ---- LEVEL 12: Iron Web (5 plates, 4 layers deep) ----
  {
    plates: [
      { x: 20,  y: 5,   w: 170, h: 110, z: 1 },
      { x: 210, y: 5,   w: 170, h: 110, z: 1 },
      { x: 100, y: 65,  w: 200, h: 105, z: 2 },
      { x: 20,  y: 145, w: 360, h: 95,  z: 3 },
      { x: 80,  y: 225, w: 240, h: 100, z: 4 }
    ],
    screws: [
      { x: 55,  y: 35,  color: 'red',    plateIds: [0] },
      { x: 145, y: 35,  color: 'orange', plateIds: [0] },
      { x: 100, y: 88,  color: 'red',    plateIds: [0] },
      { x: 250, y: 35,  color: 'blue',   plateIds: [1] },
      { x: 340, y: 35,  color: 'orange', plateIds: [1] },
      { x: 295, y: 88,  color: 'blue',   plateIds: [1] },
      { x: 150, y: 100, color: 'green',  plateIds: [2] },
      { x: 250, y: 100, color: 'green',  plateIds: [2] },
      { x: 200, y: 148, color: 'green',  plateIds: [2] },
      { x: 60,  y: 180, color: 'purple', plateIds: [3] },
      { x: 200, y: 180, color: 'orange', plateIds: [3] },
      { x: 340, y: 180, color: 'purple', plateIds: [3] },
      { x: 135, y: 260, color: 'red',    plateIds: [4] },
      { x: 200, y: 260, color: 'blue',   plateIds: [4] },
      { x: 265, y: 260, color: 'purple', plateIds: [4] }
    ],
    par: 15
  },

  // ---- LEVEL 13: Master Class (5 plates, 6 colors, 18 screws) ----
  {
    plates: [
      { x: 10,  y: 5,   w: 185, h: 110, z: 1 },
      { x: 205, y: 5,   w: 185, h: 110, z: 1 },
      { x: 65,  y: 80,  w: 270, h: 110, z: 2 },
      { x: 10,  y: 170, w: 185, h: 115, z: 3 },
      { x: 205, y: 170, w: 185, h: 115, z: 3 }
    ],
    screws: [
      { x: 50,  y: 35,  color: 'red',    plateIds: [0] },
      { x: 145, y: 35,  color: 'yellow', plateIds: [0] },
      { x: 105, y: 92,  color: 'red',    plateIds: [0] },
      { x: 255, y: 35,  color: 'blue',   plateIds: [1] },
      { x: 345, y: 35,  color: 'yellow', plateIds: [1] },
      { x: 295, y: 92,  color: 'blue',   plateIds: [1] },
      { x: 115, y: 125, color: 'green',  plateIds: [2] },
      { x: 200, y: 125, color: 'orange', plateIds: [2] },
      { x: 285, y: 125, color: 'green',  plateIds: [2] },
      { x: 150, y: 165, color: 'purple', plateIds: [2] },
      { x: 250, y: 165, color: 'purple', plateIds: [2] },
      { x: 200, y: 165, color: 'orange', plateIds: [2] },
      { x: 50,  y: 215, color: 'red',    plateIds: [3] },
      { x: 145, y: 215, color: 'yellow', plateIds: [3] },
      { x: 100, y: 255, color: 'green',  plateIds: [3] },
      { x: 255, y: 215, color: 'blue',   plateIds: [4] },
      { x: 345, y: 215, color: 'purple', plateIds: [4] },
      { x: 300, y: 255, color: 'orange', plateIds: [4] }
    ],
    par: 18
  },

  // ---- LEVEL 14: The Labyrinth (6 plates, 6 colors, blocking chain) ----
  {
    plates: [
      { x: 5,   y: 5,   w: 150, h: 100, z: 1 },
      { x: 245, y: 5,   w: 150, h: 100, z: 1 },
      { x: 70,  y: 55,  w: 260, h: 95,  z: 2 },
      { x: 5,   y: 130, w: 190, h: 110, z: 3 },
      { x: 205, y: 130, w: 190, h: 110, z: 3 },
      { x: 65,  y: 220, w: 270, h: 100, z: 4 }
    ],
    screws: [
      { x: 40,  y: 30,  color: 'red',    plateIds: [0] },
      { x: 115, y: 30,  color: 'red',    plateIds: [0] },
      { x: 80,  y: 78,  color: 'orange', plateIds: [0] },
      { x: 285, y: 30,  color: 'blue',   plateIds: [1] },
      { x: 360, y: 30,  color: 'blue',   plateIds: [1] },
      { x: 320, y: 78,  color: 'orange', plateIds: [1] },
      { x: 130, y: 88,  color: 'green',  plateIds: [2] },
      { x: 200, y: 88,  color: 'yellow', plateIds: [2] },
      { x: 270, y: 88,  color: 'green',  plateIds: [2] },
      { x: 45,  y: 170, color: 'purple', plateIds: [3] },
      { x: 145, y: 170, color: 'red',    plateIds: [3] },
      { x: 100, y: 215, color: 'purple', plateIds: [3] },
      { x: 255, y: 170, color: 'yellow', plateIds: [4] },
      { x: 355, y: 170, color: 'blue',   plateIds: [4] },
      { x: 305, y: 215, color: 'yellow', plateIds: [4] },
      { x: 120, y: 258, color: 'orange', plateIds: [5] },
      { x: 200, y: 258, color: 'green',  plateIds: [5] },
      { x: 280, y: 258, color: 'purple', plateIds: [5] }
    ],
    par: 18
  },

  // ---- LEVEL 15: Ultimate Challenge (6 plates, 6 colors, 18 screws) ----
  {
    plates: [
      { x: 10,  y: 5,   w: 175, h: 100, z: 1 },
      { x: 215, y: 5,   w: 175, h: 100, z: 1 },
      { x: 45,  y: 65,  w: 155, h: 110, z: 2 },
      { x: 200, y: 65,  w: 155, h: 110, z: 2 },
      { x: 95,  y: 150, w: 210, h: 100, z: 3 },
      { x: 60,  y: 225, w: 280, h: 110, z: 4 }
    ],
    screws: [
      { x: 50,  y: 30,  color: 'red',    plateIds: [0] },
      { x: 140, y: 30,  color: 'yellow', plateIds: [0] },
      { x: 100, y: 80,  color: 'red',    plateIds: [0] },
      { x: 260, y: 30,  color: 'blue',   plateIds: [1] },
      { x: 350, y: 30,  color: 'yellow', plateIds: [1] },
      { x: 310, y: 80,  color: 'blue',   plateIds: [1] },
      { x: 85,  y: 108, color: 'green',  plateIds: [2] },
      { x: 160, y: 108, color: 'orange', plateIds: [2] },
      { x: 125, y: 155, color: 'green',  plateIds: [2] },
      { x: 240, y: 108, color: 'purple', plateIds: [3] },
      { x: 315, y: 108, color: 'orange', plateIds: [3] },
      { x: 280, y: 155, color: 'purple', plateIds: [3] },
      { x: 145, y: 190, color: 'red',    plateIds: [4] },
      { x: 200, y: 190, color: 'blue',   plateIds: [4] },
      { x: 255, y: 190, color: 'yellow', plateIds: [4] },
      { x: 110, y: 265, color: 'green',  plateIds: [5] },
      { x: 200, y: 265, color: 'orange', plateIds: [5] },
      { x: 290, y: 265, color: 'purple', plateIds: [5] }
    ],
    par: 18
  }
];
