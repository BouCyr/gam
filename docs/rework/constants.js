export const SKIP_FRAME = 20; // délai min entre 2 frames
export const SELECT_RANGE = 40; //how close must the mouse be to 'grab' a dot

export const SIZE = 600; //must match size of canvas
export const DOTS = 5; //per team

export const TEAM_VILLAIN = "red";
export const TEAM_HERO = "blue";

export const EPSILON = 0.00000000001;

export const MAX_IA_THINK_TIME_ms = 300;

export const HERO_NAMES = [
    "Gustav",
    "Georgette",
    "Gaspard",
    "Gorgo",
    "Gassandrid"
];
export const VILLAIN_NAMES = [
    "Edouard",
    "Eric",
    "Ella",
    "Eleonor",
    "Elvira"
]


//expected next input from player
export const ACTION_SELECT_DOT = "select_dot";
export const ACTION_SELECT_DEST = "select_loc";
export const ACTION_NONE = "idle";

//current action (move/leap/relax, etc.)
export const STATE_MOVE = "move";
export const STATE_LEAP = "leap";
export const STATE_SPLIT = "split";
export const STATE_RELAX = "relax";
export const STATE_ATTACK = "attack";
export const STATE_IDLE = "idle_key";