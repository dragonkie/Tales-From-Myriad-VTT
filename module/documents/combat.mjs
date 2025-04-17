// Extends the default combat to let us add events to certain combat actions
export default class TfmCombat extends Combat {
    async startCombat() {
        await super.startCombat();
        return this;
    }

    async nextTurn() {
        await super.nextTurn();
        return this;
    }

    async previousTurn() {
        await super.previousTurn();
        return this;
    }

    async endCombat() {
        await super.endCombat();
        return this;
    }

    
}