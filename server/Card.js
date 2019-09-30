class Card{
    constructor(data){
        //assign existing card data to this card
        Object.assign(this,data)
        //roll up to 3 techniques for this card
        let usableAbilities = []
        for(let i = 0; i < 3; i++){
            if(this.techniques.length > 0){
                var item = this.techniques.splice(Math.floor(Math.random()*this.techniques.length),1)[0];
                usableAbilities.push(item)
            }
        }
        this.techniques = usableAbilities
    }
}