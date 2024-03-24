interface BaseModel {
    /**
     * Main game-loop state in-place state update for the entity
     */
    update(deltaT: number): void
}



export default BaseModel