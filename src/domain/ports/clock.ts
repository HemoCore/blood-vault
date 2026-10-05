/** Ce que le domaine demande au monde extérieur : l'heure qu'il est. */
export interface Clock {
    now(): Date;
}
