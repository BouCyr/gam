const SIZE = 600; //must match size of canvas
const DOTS = 5; //per team

const TEAM_EVIL = "red";
const TEAM_HERO = "blue";

const STATE_IDLE = "idle"
const STATE_SELECT_DOT = "select";
const STATE_MOVE = "move";


const EPSILON = 0.00000000001;

const MAX_IA_THINK_TIME_ms = 3000;