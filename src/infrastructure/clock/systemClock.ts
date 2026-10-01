import {Clock} from "../../domain/port/clock";


/** La vraie horloge. Le seul endroit du projet qui appelle `new Date()`. */
export const systemClock: Clock = {
    now: () => new Date(),
};
