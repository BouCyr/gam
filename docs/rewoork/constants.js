export const SKIP_FRAME = 20; // délai min entre 2 frames
export const SELECT_RANGE = 20; //how close must the mouse be to 'grab' a dot

export const SIZE = 600; //must match size of canvas
export const DOTS = 5; //per team

export const TEAM_VILLAIN = "villains";
export const TEAM_HERO = "heros";
export const TEAM_NOONE = "NOBODY";

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
export const STEAP_SELECT_DOT = "select_dot";
export const STEAP_SELECT_DEST = "select_loc";

//current action (move/leap/relax, etc.)
export const CARD_MOVE = "move";
export const CARD_LEAP = "leap";
export const CARD_SPLIT = "split";
export const CARD_SWITCH = "switch";
export const CARD_RELAX = "relax";
export const CARD_ATTACK = "attack";
export const CARD_IDLE = "idle_key";